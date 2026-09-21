package fxhandler

import (
	"encoding/json"
	"net/http"

	"chipa/api/internal/domain"
	apimiddleware "chipa/api/internal/middleware"
	fintechservice "chipa/api/internal/service/fintech"
	"chipa/api/internal/utils"
)

type Handler struct {
	fxSvc  *fintechservice.FXService
	pinSvc *fintechservice.PINService
	utils  *utils.Utils
}

func NewHandler(fxSvc *fintechservice.FXService, pinSvc *fintechservice.PINService, utils *utils.Utils) *Handler {
	return &Handler{
		fxSvc:  fxSvc,
		pinSvc: pinSvc,
		utils:  utils,
	}
}

// GetRates godoc
// @Summary Get live FX rates
// @Description Returns mid-market exchange rates and spreads for NGN, USD, GBP, EUR
// @Tags FX
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /fx/rates [get]
func (h *Handler) GetRates(w http.ResponseWriter, r *http.Request) {
	rates, err := h.fxSvc.GetRates(r.Context())
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Exchange rates retrieved successfully", map[string]interface{}{
		"rates": rates,
	})
}

type CreateQuoteRequest struct {
	FromCurrency domain.Currency `json:"from_currency"`
	ToCurrency   domain.Currency `json:"to_currency"`
	SendAmount   float64         `json:"send_amount"`
}

// CreateQuote godoc
// @Summary Create conversion quote
// @Description Generates a guaranteed FX quote valid for 60 seconds
// @Tags FX
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body CreateQuoteRequest true "Quote request payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /fx/quote [post]
func (h *Handler) CreateQuote(w http.ResponseWriter, r *http.Request) {
	_, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req CreateQuoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	quote, err := h.fxSvc.CreateQuote(r.Context(), req.FromCurrency, req.ToCurrency, req.SendAmount)
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Quote generated successfully (valid for 60s)", map[string]interface{}{
		"quote": quote,
	})
}

type ExecuteSwapRequest struct {
	QuoteID string `json:"quote_id"`
	PIN     string `json:"pin"`
}

// ExecuteSwap godoc
// @Summary Execute currency swap
// @Description Executes a currency swap using an active quote ID and transaction PIN
// @Tags FX
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body ExecuteSwapRequest true "Swap execution payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /fx/swap [post]
func (h *Handler) ExecuteSwap(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req ExecuteSwapRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	valid, err := h.pinSvc.VerifyPIN(r.Context(), claims.UserID, req.PIN)
	if err != nil || !valid {
		h.utils.RespondError(w, http.StatusUnauthorized, "Invalid transaction PIN")
		return
	}

	quote, err := h.fxSvc.ExecuteSwap(r.Context(), claims.UserID, req.QuoteID, "Daniel Adekunle")
	if err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Currency swapped successfully", map[string]interface{}{
		"swap": quote,
	})
}
