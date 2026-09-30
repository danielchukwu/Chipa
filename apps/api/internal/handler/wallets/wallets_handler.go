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

	var totalBalanceUSD float64
	richAccounts := make([]map[string]interface{}, 0, len(wallets))

	for _, wa := range wallets {
		// Mock conversion rate estimate for summary
		switch wa.Currency {
		case domain.CurrencyUSD:
			totalBalanceUSD += wa.Balance
		case domain.CurrencyNGN:
			totalBalanceUSD += wa.Balance / 1500.0
		case domain.CurrencyGBP:
			totalBalanceUSD += wa.Balance * 1.28
		case domain.CurrencyEUR:
			totalBalanceUSD += wa.Balance * 1.08
		}

		var rails []map[string]string
		switch wa.Currency {
		case domain.CurrencyNGN:
			rails = []map[string]string{
				{"name": "NIP Instant Transfer", "settlement_time": "Instant", "fee": "0%"},
			}
		case domain.CurrencyUSD:
			rails = []map[string]string{
				{"name": "ACH Direct Deposit", "settlement_time": "1-2 business days", "fee": "0%"},
				{"name": "FedWire", "settlement_time": "Same day", "fee": "$5.00 flat"},
			}
		case domain.CurrencyGBP:
			rails = []map[string]string{
				{"name": "Faster Payments (FPS)", "settlement_time": "Instant", "fee": "0%"},
				{"name": "BACS", "settlement_time": "2-3 business days", "fee": "0%"},
			}
		case domain.CurrencyEUR:
			rails = []map[string]string{
				{"name": "SEPA Instant", "settlement_time": "Instant", "fee": "0%"},
			}
		}

		bankDetails := map[string]interface{}{
			"account_name":   wa.AccountName,
			"account_number": wa.AccountNumber,
			"bank_name":      wa.BankName,
		}

		if wa.RoutingNumber != "" {
			bankDetails["routing_number"] = wa.RoutingNumber
		}
		if wa.SortCode != "" {
			bankDetails["sort_code"] = wa.SortCode
		}
		if wa.IBAN != "" {
			bankDetails["iban"] = wa.IBAN
		}
		if wa.BIC != "" {
			bankDetails["bic"] = wa.BIC
		}
		if wa.DepositAddress != "" {
			bankDetails["deposit_address"] = wa.DepositAddress
		}

		accountItem := map[string]interface{}{
			"id":                wa.ID,
			"type":              "virtual_account",
			"currency":          wa.Currency,
			"currency_name":     wa.CurrencyName,
			"currency_symbol":   wa.Symbol,
			"balance":           wa.Balance,
			"balance_minor":     wa.BalanceMinor,
			"available_balance": wa.Balance,
			"pending_balance":   0.0,
			"status":            wa.Status,
			"provider":          wa.Provider,
			"bank_details":      bankDetails,
			"supported_rails":   rails,
			"created_at":        wa.CreatedAt,
		}

		richAccounts = append(richAccounts, accountItem)
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Accounts retrieved successfully", map[string]interface{}{
		"summary": map[string]interface{}{
			"total_balance_usd_equivalent": totalBalanceUSD,
			"base_currency":                "USD",
		},
		"accounts": richAccounts,
		"wallets":  wallets, // Backward compatibility for existing consumers
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

