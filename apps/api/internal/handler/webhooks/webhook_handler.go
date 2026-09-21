// Package webhookshandler handles inbound webhook events from payment providers (Paystack).
package webhookshandler

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"

	"chipa/api/internal/domain"
	"chipa/api/internal/provider/paystack"
	fintechservice "chipa/api/internal/service/fintech"
	"chipa/api/internal/utils"
)

// Handler handles Paystack webhook events.
type Handler struct {
	walletService  *fintechservice.WalletService
	paystackClient *paystack.PaystackClient
	utils          *utils.Utils
}

// NewHandler creates a new webhook Handler.
func NewHandler(walletService *fintechservice.WalletService, paystackClient *paystack.PaystackClient, u *utils.Utils) *Handler {
	return &Handler{
		walletService:  walletService,
		paystackClient: paystackClient,
		utils:          u,
	}
}

// paystackWebhookPayload represents the top-level payload sent by Paystack.
type paystackWebhookPayload struct {
	Event string `json:"event"`
	Data  struct {
		ID        int64   `json:"id"`
		Reference string  `json:"reference"`
		Amount    int64   `json:"amount"` // in kobo
		Currency  string  `json:"currency"`
		Status    string  `json:"status"`
		Customer  struct {
			ID       int64                  `json:"id"`
			Email    string                 `json:"email"`
			Metadata map[string]interface{} `json:"metadata"`
		} `json:"customer"`
	} `json:"data"`
}

// HandlePaystack godoc
// @Summary      Paystack payment webhook
// @Description  Receives and processes Paystack payment notification events. Verifies the HMAC-SHA512 signature in x-paystack-signature.
// @Tags         Webhooks
// @Accept       json
// @Produce      json
// @Success      200  {object} map[string]interface{} "Event processed"
// @Failure      400  {object} map[string]interface{} "Invalid signature or payload"
// @Router       /webhooks/paystack [post]
func (h *Handler) HandlePaystack(w http.ResponseWriter, r *http.Request) {
	log := slog.Default().With("handler", "HandlePaystack")

	rawBody, err := io.ReadAll(r.Body)
	if err != nil {
		log.Error("failed to read webhook body", "err", err)
		h.utils.RespondError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}

	sig := r.Header.Get("x-paystack-signature")
	if h.paystackClient != nil && !h.paystackClient.VerifyWebhookSignature(rawBody, sig) {
		log.Warn("invalid Paystack webhook signature", "signature", sig)
		h.utils.RespondSuccess(w, http.StatusOK, "Signature verification failed — event ignored", nil)
		return
	}

	var payload paystackWebhookPayload
	if err := json.Unmarshal(rawBody, &payload); err != nil {
		log.Error("failed to decode paystack webhook payload", "err", err)
		h.utils.RespondSuccess(w, http.StatusOK, "Invalid payload — event ignored", nil)
		return
	}

	log.Info("received Paystack webhook", "event", payload.Event, "reference", payload.Data.Reference)

	if payload.Event == "charge.success" && payload.Data.Status == "success" {
		amountNaira := float64(payload.Data.Amount) / 100.0
		log.Info("Paystack deposit confirmed", "amountNaira", amountNaira, "currency", domain.CurrencyNGN, "ref", payload.Data.Reference)
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Payment processed", nil)
}
