package walletshandler

import (
	"net/http"
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

// GetWallets returns all user multi-currency accounts (NGN, USD, GBP, EUR)
func (h *Handler) GetWallets(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	wallets, err := h.walletSvc.GetUserWallets(r.Context(), claims.UserID, "Daniel Adekunle")
	if err != nil {
		h.utils.RespondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Wallets retrieved successfully", map[string]interface{}{
		"wallets": wallets,
	})
}

// GetWalletByCurrency returns specific currency account
func (h *Handler) GetWalletByCurrency(w http.ResponseWriter, r *http.Request) {
	claims, ok := h.utils.CheckRoles(r, w, apimiddleware.ClaimsKey)
	if !ok {
		return
	}

	currencyCode := strings.ToUpper(chi.URLParam(r, "currency"))
	wallet, err := h.walletSvc.GetUserWallet(r.Context(), claims.UserID, domain.Currency(currencyCode), "Daniel Adekunle")
	if err != nil {
		h.utils.RespondError(w, http.StatusNotFound, err.Error())
		return
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Wallet retrieved successfully", map[string]interface{}{
		"wallet": wallet,
	})
}
