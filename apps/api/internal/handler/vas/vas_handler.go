package vashandler

import (
	"encoding/json"
	"net/http"

	"chipa/api/internal/domain"
	apimiddleware "chipa/api/internal/middleware"
	fintechservice "chipa/api/internal/service/fintech"
	"chipa/api/internal/utils"
)

type Handler struct {
	vasSvc *fintechservice.VASService
	pinSvc *fintechservice.PINService
	utils  *utils.Utils
}

func NewHandler(vasSvc *fintechservice.VASService, pinSvc *fintechservice.PINService, utils *utils.Utils) *Handler {
	return &Handler{
		vasSvc: vasSvc,
		pinSvc: pinSvc,
		utils:  utils,
	}
}

// GetCategories godoc
// @Summary Get VAS bill categories
// @Description Returns supported bill categories (airtime, data, electricity, cable_tv)
// @Tags VAS
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /bills/categories [get]
func (h *Handler) GetCategories(w http.ResponseWriter, r *http.Request) {
	categories := h.vasSvc.GetCategories(r.Context())
	h.utils.RespondSuccess(w, http.StatusOK, "Categories retrieved", map[string]interface{}{
		"categories": categories,
	})
}

// GetOperators godoc
// @Summary Get VAS operators
// @Description Returns billers/operators for a given category (e.g. MTN, Airtel, IKEDC, DSTV)
// @Tags VAS
// @Produce json
// @Param category query string true "VAS Category (airtime, data, electricity, cable_tv)"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /bills/operators [get]
func (h *Handler) GetOperators(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	operators, err := h.vasSvc.GetOperators(r.Context(), domain.VASCategory(category))
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Operators retrieved", map[string]interface{}{
		"operators": operators,
	})
}

type ValidateRequest struct {
	Category  domain.VASCategory `json:"category"`
	Operator  string             `json:"operator"`
	Recipient string             `json:"recipient"`
}

// ValidateRecipient godoc
// @Summary Validate meter or smartcard number
// @Description Validates recipient details (e.g. electricity meter or cable TV smartcard) before payment
// @Tags VAS
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body ValidateRequest true "Validation payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /bills/validate [post]
func (h *Handler) ValidateRecipient(w http.ResponseWriter, r *http.Request) {
	var req ValidateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	result, err := h.vasSvc.ValidateRecipient(r.Context(), req.Category, req.Operator, req.Recipient)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Recipient validated", map[string]interface{}{
		"validation": result,
	})
}

type PayBillRequest struct {
	Category  domain.VASCategory `json:"category"`
	Operator  string             `json:"operator"`
	Recipient string             `json:"recipient"`
	Amount    float64            `json:"amount"`
	PIN       string             `json:"pin"`
}

// PayBill godoc
// @Summary Pay bill or purchase airtime/data
// @Description Purchases airtime/data or pays electricity/TV bill with transaction PIN verification
// @Tags VAS
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body PayBillRequest true "Bill payment payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /bills/pay [post]
func (h *Handler) PayBill(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req PayBillRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	valid, err := h.pinSvc.VerifyPIN(r.Context(), claims.UserID, req.PIN)
	if err != nil || !valid {
		h.utils.RespondError(w, http.StatusUnauthorized, "Invalid transaction PIN")
		return
	}

	receipt, err := h.vasSvc.PayBill(r.Context(), claims.UserID, req.Category, req.Operator, req.Recipient, req.Amount, "Daniel Adekunle")
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Bill payment successful", map[string]interface{}{
		"receipt": receipt,
	})
}
