package cardshandler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	"chipa/api/internal/domain"
	apimiddleware "chipa/api/internal/middleware"
	fintechservice "chipa/api/internal/service/fintech"
	"chipa/api/internal/utils"
)

type Handler struct {
	cardSvc *fintechservice.CardService
	pinSvc  *fintechservice.PINService
	utils   *utils.Utils
}

func NewHandler(cardSvc *fintechservice.CardService, pinSvc *fintechservice.PINService, utils *utils.Utils) *Handler {
	return &Handler{
		cardSvc: cardSvc,
		pinSvc:  pinSvc,
		utils:   utils,
	}
}

// ListCards godoc
// @Summary List virtual and physical cards
// @Description Returns all cards owned by the authenticated user
// @Tags Cards
// @Security BearerAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /cards [get]
func (h *Handler) ListCards(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	cards, err := h.cardSvc.ListCards(r.Context(), claims.UserID)
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Cards retrieved successfully", map[string]interface{}{
		"cards": cards,
	})
}

type CreateCardRequest struct {
	Name     string            `json:"name"`
	Currency domain.Currency   `json:"currency"`
	Scheme   domain.CardScheme `json:"scheme"`
}

// CreateCard godoc
// @Summary Create a new virtual or physical card
// @Description Issues a Visa or Mastercard in USD, NGN, GBP, or EUR
// @Tags Cards
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body CreateCardRequest true "Card creation parameters"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /cards [post]
func (h *Handler) CreateCard(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	var req CreateCardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Scheme == "" {
		req.Scheme = domain.CardSchemeVisa
	}
	if req.Currency == "" {
		req.Currency = domain.CurrencyUSD
	}

	card, err := h.cardSvc.CreateCard(r.Context(), claims.UserID, req.Name, req.Currency, req.Scheme)
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusCreated, "Card created successfully", map[string]interface{}{
		"card": card,
	})
}

// FreezeCard godoc
// @Summary Freeze card
// @Description Freezes an active card to block transactions
// @Tags Cards
// @Security BearerAuth
// @Produce json
// @Param id path string true "Card ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /cards/{id}/freeze [post]
func (h *Handler) FreezeCard(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	cardID := chi.URLParam(r, "id")
	if err := h.cardSvc.FreezeCard(r.Context(), claims.UserID, cardID); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Card frozen successfully", nil)
}

// UnfreezeCard godoc
// @Summary Unfreeze card
// @Description Unfreezes a frozen card to restore transactions
// @Tags Cards
// @Security BearerAuth
// @Produce json
// @Param id path string true "Card ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /cards/{id}/unfreeze [post]
func (h *Handler) UnfreezeCard(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	cardID := chi.URLParam(r, "id")
	if err := h.cardSvc.UnfreezeCard(r.Context(), claims.UserID, cardID); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Card unfrozen successfully", nil)
}

type FundCardRequest struct {
	Amount       float64         `json:"amount"`
	FromCurrency domain.Currency `json:"from_currency"`
	PIN          string          `json:"pin"`
}

// FundCard godoc
// @Summary Fund card
// @Description Funds a card from an account balance (requires transaction PIN)
// @Tags Cards
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Card ID"
// @Param request body FundCardRequest true "Fund card payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /cards/{id}/fund [post]
func (h *Handler) FundCard(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	cardID := chi.URLParam(r, "id")
	var req FundCardRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// Verify PIN
	valid, err := h.pinSvc.VerifyPIN(r.Context(), claims.UserID, req.PIN)
	if err != nil || !valid {
		h.utils.RespondError(w, http.StatusUnauthorized, "Invalid transaction PIN")
		return
	}

	if err := h.cardSvc.FundCard(r.Context(), claims.UserID, cardID, req.Amount, req.FromCurrency, "Daniel Adekunle"); err != nil {
		h.utils.RespondError(w, http.StatusBadRequest, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Card funded successfully", nil)
}

// GetCardDetails godoc
// @Summary Get sensitive card details
// @Description Reveals PAN, CVV, and expiry date (requires transaction PIN in query ?pin=...)
// @Tags Cards
// @Security BearerAuth
// @Produce json
// @Param id path string true "Card ID"
// @Param pin query string true "Transaction PIN"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /cards/{id}/details [get]
func (h *Handler) GetCardDetails(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	cardID := chi.URLParam(r, "id")
	pin := r.URL.Query().Get("pin")

	valid, err := h.pinSvc.VerifyPIN(r.Context(), claims.UserID, pin)
	if err != nil || !valid {
		h.utils.RespondError(w, http.StatusUnauthorized, "Invalid transaction PIN to reveal sensitive card details")
		return
	}

	card, err := h.cardSvc.GetCardDetails(r.Context(), claims.UserID, cardID)
	if err != nil {
		h.utils.RespondError(w, http.StatusNotFound, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Card details revealed", map[string]interface{}{
		"card": card,
	})
}
