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

func (h *Handler) GetCategories(w http.ResponseWriter, r *http.Request) {
	categories := h.vasSvc.GetCategories(r.Context())
	h.utils.RespondSuccess(w, http.StatusOK, "Categories retrieved", map[string]interface{}{
		"categories": categories,
	})
}

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
