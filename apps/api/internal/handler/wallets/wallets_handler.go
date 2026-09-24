package walletshandler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"chipa/api/internal/domain"
	apimiddleware "chipa/api/internal/middleware"
	fintechservice "chipa/api/internal/service/fintech"
	"chipa/api/internal/utils"
)

type Handler struct {
	walletSvc *fintechservice.WalletService
	utils     *utils.Utils
}

func NewHandler(walletSvc *fintechservice.WalletService, utils *utils.Utils) *Handler {
	return &Handler{
		walletSvc: walletSvc,
		utils:     utils,
	}
}

// GetWallets godoc
// @Summary Get user wallets
// @Description Returns all user multi-currency accounts (NGN, USD, GBP, EUR)
// @Tags Wallets
// @Security BearerAuth
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /wallets [get]
func (h *Handler) GetWallets(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	fallbackName := claims.Username
	if fallbackName == "" {
		fallbackName = "Chipa User"
	}

	wallets, err := h.walletSvc.GetUserWallets(r.Context(), claims.UserID, fallbackName)
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Wallets retrieved successfully", map[string]interface{}{
		"wallets": wallets,
	})
}

// GetWalletByCurrency godoc
// @Summary Get wallet by currency
// @Description Returns specific currency wallet details
// @Tags Wallets
// @Security BearerAuth
// @Produce json
// @Param currency path string true "Currency Code (NGN, USD, GBP, EUR)"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /wallets/{currency} [get]
func (h *Handler) GetWalletByCurrency(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	fallbackName := claims.Username
	if fallbackName == "" {
		fallbackName = "Chipa User"
	}

	currencyCode := strings.ToUpper(chi.URLParam(r, "currency"))
	wallet, err := h.walletSvc.GetUserWallet(r.Context(), claims.UserID, domain.Currency(currencyCode), fallbackName)
	if err != nil {
		h.utils.RespondError(w, http.StatusNotFound, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Wallet retrieved successfully", map[string]interface{}{
		"wallet": wallet,
	})
}

// GetLedgerTransactions godoc
// @Summary Get double-entry ledger transactions
// @Description Returns immutable double-entry ledger transaction history for user's accounts
// @Tags Wallets
// @Security BearerAuth
// @Produce json
// @Param limit query int false "Number of records (default 20, max 100)"
// @Param offset query int false "Offset for pagination (default 0)"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /wallets/ledger/transactions [get]
func (h *Handler) GetLedgerTransactions(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	limit := 20
	if l, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && l > 0 {
		if l > 100 {
			limit = 100
		} else {
			limit = l
		}
	}
	offset := 0
	if o, err := strconv.Atoi(r.URL.Query().Get("offset")); err == nil && o >= 0 {
		offset = o
	}

	txns, err := h.walletSvc.GetUserLedgerTransactions(r.Context(), claims.UserID, limit, offset)
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Ledger transactions retrieved successfully", map[string]interface{}{
		"transactions": txns,
	})
}

