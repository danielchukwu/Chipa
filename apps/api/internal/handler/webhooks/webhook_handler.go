// Package webhookshandler handles inbound webhook events from payment providers (Flutterwave).
package webhookshandler

import (
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"strings"

	"chipa/api/internal/domain"
	"chipa/api/internal/provider/flutterwave"
	fintechservice "chipa/api/internal/service/fintech"
	"chipa/api/internal/utils"
)

// Handler handles payment webhook events.
type Handler struct {
	walletService     *fintechservice.WalletService
	flutterwaveClient *flutterwave.FlutterwaveClient
	utils             *utils.Utils
}

// NewHandler creates a new webhook Handler.
func NewHandler(walletService *fintechservice.WalletService, flutterwaveClient *flutterwave.FlutterwaveClient, u *utils.Utils) *Handler {
	return &Handler{
		walletService:     walletService,
		flutterwaveClient: flutterwaveClient,
		utils:             u,
	}
}

// flutterwaveWebhookPayload represents the top-level payload sent by Flutterwave.
type flutterwaveWebhookPayload struct {
	Event string `json:"event"`
	Data  struct {
		ID            int64   `json:"id"`
		TxRef         string  `json:"tx_ref"`
		FlwRef        string  `json:"flw_ref"`
		Amount        float64 `json:"amount"` // in Naira
		Currency      string  `json:"currency"`
		ChargedAmount float64 `json:"charged_amount"`
		Status        string  `json:"status"`
		PaymentType   string  `json:"payment_type"`
		CreatedAt     string  `json:"created_at"`
		Customer      struct {
			ID          int64  `json:"id"`
			Name        string `json:"name"`
			PhoneNumber string `json:"phone_number"`
			Email       string `json:"email"`
		} `json:"customer"`
	} `json:"data"`
}

// HandleFlutterwave godoc
// @Summary      Flutterwave payment webhook
// @Description  Receives and processes Flutterwave payment notification events. Verifies the secret hash in verif-hash header.
// @Tags         Webhooks
// @Accept       json
// @Produce      json
// @Success      200  {object} map[string]interface{} "Event processed"
// @Failure      400  {object} map[string]interface{} "Invalid signature or payload"
// @Router       /webhooks/flutterwave [post]
func (h *Handler) HandleFlutterwave(w http.ResponseWriter, r *http.Request) {
	log := slog.Default().With("handler", "HandleFlutterwave")

	rawBody, err := io.ReadAll(r.Body)
	if err != nil {
		log.Error("failed to read webhook body", "err", err)
		h.utils.RespondError(w, http.StatusBadRequest, "Failed to read request body")
		return
	}

	sig := r.Header.Get("verif-hash")
	if h.flutterwaveClient != nil && !h.flutterwaveClient.VerifyWebhookSignature(sig) {
		log.Warn("invalid Flutterwave webhook secret hash", "signature", sig)
		h.utils.RespondSuccess(w, http.StatusOK, "Signature verification failed — event ignored", nil)
		return
	}

	var payload flutterwaveWebhookPayload
	if err := json.Unmarshal(rawBody, &payload); err != nil {
		log.Error("failed to decode flutterwave webhook payload", "err", err)
		h.utils.RespondSuccess(w, http.StatusOK, "Invalid payload — event ignored", nil)
		return
	}

	log.Info("received Flutterwave webhook", "event", payload.Event, "tx_ref", payload.Data.TxRef, "flw_ref", payload.Data.FlwRef)

	if strings.EqualFold(payload.Event, "charge.completed") && strings.EqualFold(payload.Data.Status, "successful") {
		amountNaira := payload.Data.Amount
		log.Info("Flutterwave deposit confirmed",
			"amountNaira", amountNaira,
			"currency", domain.CurrencyNGN,
			"tx_ref", payload.Data.TxRef,
			"flw_ref", payload.Data.FlwRef,
			"customer_email", payload.Data.Customer.Email,
		)
	}

	h.utils.RespondSuccess(w, http.StatusOK, "Payment processed", nil)
}
