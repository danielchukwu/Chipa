package flutterwave

import (
	"bytes"
	"context"
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"chipa/api/internal/domain"
)

// FlutterwaveClient handles NGN local banking, dedicated virtual accounts, and account resolution via Flutterwave v3 API.
type FlutterwaveClient struct {
	secretKey     string
	publicKey     string
	encryptionKey string
	secretHash    string
	baseURL       string
	httpClient    *http.Client
}

// NewFlutterwaveClient creates a new configured Flutterwave API client.
func NewFlutterwaveClient(secretKey, publicKey, encryptionKey, secretHash, baseURL string) *FlutterwaveClient {
	if baseURL == "" {
		baseURL = "https://api.flutterwave.com/v3"
	}
	return &FlutterwaveClient{
		secretKey:     secretKey,
		publicKey:     publicKey,
		encryptionKey: encryptionKey,
		secretHash:    secretHash,
		baseURL:       strings.TrimRight(baseURL, "/"),
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// flutterwaveVirtualAccountResponse represents the Flutterwave v3 DVA creation response.
type flutterwaveVirtualAccountResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    struct {
		ResponseCode    string `json:"response_code"`
		ResponseMessage string `json:"response_message"`
		FlwRef          string `json:"flw_ref"`
		OrderRef        string `json:"order_ref"`
		AccountNumber   string `json:"account_number"`
		AccountName     string `json:"account_name"`
		AccountStatus   string `json:"account_status"`
		Frequency       json.RawMessage `json:"frequency"`
		BankName        string `json:"bank_name"`
		CreatedAt       string `json:"created_at"`
		ExpiryDate      string `json:"expiry_date"`
		Note            string `json:"note"`
		Amount          string `json:"amount"`
	} `json:"data"`
}

// DVAOptions holds structured inputs for provisioning a Flutterwave dedicated virtual account.
type DVAOptions struct {
	Email string
	Phone string
	BVN   string
	NIN   string
}

// ProvisionNGNAccount creates a permanent dedicated virtual account for receiving Naira inflows via Flutterwave.
// opts are parsed positionally for backwards compatibility: email (contains @), BVN (11 digits), phone (10-11 digits, no @).
func (c *FlutterwaveClient) ProvisionNGNAccount(ctx context.Context, userID int64, accountHolderName string, opts ...string) (*domain.VirtualAccount, error) {
	if c.secretKey == "" {
		return nil, fmt.Errorf("flutterwave secret key is not configured")
	}

	var o DVAOptions
	for _, opt := range opts {
		trimmed := strings.TrimSpace(opt)
		switch {
		case strings.Contains(trimmed, "@"):
			o.Email = trimmed
		case len(trimmed) == 11 && isNumeric(trimmed):
			// 11-digit numeric string is a BVN
			o.BVN = trimmed
		case len(trimmed) >= 10 && len(trimmed) <= 14 && isNumeric(trimmed):
			// 10-14 digit numeric that isn't BVN-length is a phone number
			o.Phone = trimmed
		}
	}

	if o.Email == "" {
		o.Email = fmt.Sprintf("user_%d@chipa.dev", userID)
	}

	nameParts := strings.SplitN(strings.TrimSpace(accountHolderName), " ", 2)
	firstName := nameParts[0]
	lastName := ""
	if len(nameParts) > 1 {
		lastName = nameParts[1]
	}

	txRef := fmt.Sprintf("chipa-dva-%d-%d", userID, time.Now().Unix())
	reqBody := map[string]interface{}{
		"email":        o.Email,
		"currency":     "NGN",
		"amount":       1, // Required by Flutterwave; minimum value is 1
		// "is_permanent": true, // for production
		"is_permanent": false,
		"tx_ref":       txRef,
		"firstname":    firstName,
		"lastname":     lastName,
		"narration":    fmt.Sprintf("CHIPA / %s", accountHolderName),
		"bvn":          o.BVN,
		"nin":          o.NIN,
		"phonenumber":  o.Phone,
	}

	slog.Info("[Flutterwave] Provisioning NGN DVA",
		"user_id", userID,
		"tx_ref", txRef,
		"has_bvn", o.BVN != "",
		"has_phone", o.Phone != "",
	)

	payloadBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal flutterwave DVA request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/virtual-account-numbers", bytes.NewReader(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request for flutterwave DVA: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.secretKey)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		slog.Error("[Flutterwave] DVA HTTP request failed", "user_id", userID, "error", err)
		return nil, fmt.Errorf("flutterwave DVA API connection error: %w", err)
	}
	defer resp.Body.Close()

	slog.Info("[Flutterwave] DVA HTTP response received", "user_id", userID, "status_code", resp.StatusCode)

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read flutterwave DVA response: %w", err)
	}

	var flwResp flutterwaveVirtualAccountResponse
	if err := json.Unmarshal(bodyBytes, &flwResp); err != nil {
		slog.Error("[Flutterwave] DVA response decode failed", "user_id", userID, "status_code", resp.StatusCode, "body", string(bodyBytes))
		return nil, fmt.Errorf("failed to decode flutterwave DVA response (status %d): %w", resp.StatusCode, err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		slog.Error("[Flutterwave] DVA creation HTTP error",
			"user_id", userID,
			"status_code", resp.StatusCode,
			"message", flwResp.Message,
			"response_message", flwResp.Data.ResponseMessage,
		)
		return nil, fmt.Errorf("flutterwave DVA creation failed with HTTP %d: %s (%s)", resp.StatusCode, flwResp.Message, flwResp.Data.ResponseMessage)
	}

	if !strings.EqualFold(flwResp.Status, "success") || flwResp.Data.AccountNumber == "" {
		slog.Error("[Flutterwave] DVA creation unsuccessful",
			"user_id", userID,
			"flw_status", flwResp.Status,
			"message", flwResp.Message,
			"response_message", flwResp.Data.ResponseMessage,
		)
		return nil, fmt.Errorf("flutterwave DVA creation returned unsuccessful status: %s (%s)", flwResp.Message, flwResp.Data.ResponseMessage)
	}

	resolvedBank := flwResp.Data.BankName

	// Parse created_at from Flutterwave response; fall back to now if unparseable.
	createdAt := time.Now()
	if flwResp.Data.CreatedAt != "" {
		if t, err := time.Parse("2006-01-02 15:04:05", flwResp.Data.CreatedAt); err == nil {
			createdAt = t
		}
	}

	// Prefer account name from Flutterwave; fall back to our narration format.
	accountName := flwResp.Data.AccountName
	if accountName == "" {
		accountName = fmt.Sprintf("CHIPA / %s", accountHolderName)
	}

	slog.Info("[Flutterwave] NGN DVA provisioned successfully",
		"user_id", userID,
		"account_number", flwResp.Data.AccountNumber,
		"bank_name", resolvedBank,
		"flw_ref", flwResp.Data.FlwRef,
		"order_ref", flwResp.Data.OrderRef,
		"account_name", accountName,
		"created_at", flwResp.Data.CreatedAt,
	)

	return &domain.VirtualAccount{
		ID:            fmt.Sprintf("flw-ngn-%d", userID),
		UserID:        userID,
		Currency:      domain.CurrencyNGN,
		CurrencyName:  "Nigerian Naira",
		Symbol:        "₦",
		BalanceMinor:  0,
		Balance:       0.0,
		AccountName:   accountName,
		AccountNumber: flwResp.Data.AccountNumber,
		BankName:      resolvedBank,
		Provider:      "flutterwave",
		Status:        "active",
		CreatedAt:     createdAt,
		UpdatedAt:     time.Now(),
	}, nil
}

// ValidateBVN verifies BVN against full name for Tier 1 KYC via Flutterwave.
func (c *FlutterwaveClient) ValidateBVN(ctx context.Context, bvn, firstName, lastName, dob string) (bool, error) {
	if c.secretKey == "" {
		return false, fmt.Errorf("flutterwave secret key is not configured")
	}

	cleanBVN := strings.TrimSpace(bvn)
	if len(cleanBVN) != 11 {
		return false, fmt.Errorf("BVN must be exactly 11 digits")
	}
	if !isNumeric(cleanBVN) {
		return false, fmt.Errorf("BVN must contain only digits")
	}

	cleanFirstName := strings.TrimSpace(firstName)
	cleanLastName := strings.TrimSpace(lastName)
	if cleanFirstName == "" || cleanLastName == "" {
		return false, fmt.Errorf("first name and last name are required for BVN verification")
	}

	payload, err := json.Marshal(map[string]string{
		"bvn":       cleanBVN,
		"firstname": cleanFirstName,
		"lastname":  cleanLastName,
	})
	if err != nil {
		return false, fmt.Errorf("failed to marshal BVN request payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/bvn/verifications", bytes.NewReader(payload))
	if err != nil {
		return false, fmt.Errorf("failed to create BVN verification request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.secretKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "Chipa-App/1.0")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return false, fmt.Errorf("flutterwave BVN API connection error: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, fmt.Errorf("failed to read flutterwave BVN response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var errResp struct {
			Status  string `json:"status"`
			Message string `json:"message"`
		}
		if jsonErr := json.Unmarshal(bodyBytes, &errResp); jsonErr == nil && errResp.Message != "" {
			return false, fmt.Errorf("flutterwave BVN verification failed (status %d): %s", resp.StatusCode, errResp.Message)
		}
		return false, fmt.Errorf("flutterwave BVN verification failed with HTTP %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var flwResp struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Data    struct {
			URL       string `json:"url"`
			Reference string `json:"reference"`
		} `json:"data"`
	}
	if err := json.Unmarshal(bodyBytes, &flwResp); err != nil {
		return false, fmt.Errorf("failed to decode flutterwave BVN response: %w", err)
	}

	if !strings.EqualFold(flwResp.Status, "success") {
		return false, fmt.Errorf("flutterwave BVN verification rejected: %s", flwResp.Message)
	}

	return true, nil
}

type flutterwaveBankResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    []struct {
		ID   int    `json:"id"`
		Code string `json:"code"`
		Name string `json:"name"`
	} `json:"data"`
}

// GetBanks fetches all commercial banks and financial institutions in Nigeria from Flutterwave.
func (c *FlutterwaveClient) GetBanks(ctx context.Context) ([]domain.Bank, error) {
	if c.secretKey == "" {
		return nil, fmt.Errorf("flutterwave secret key is not configured")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.baseURL+"/banks/NG", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request for flutterwave bank list: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.secretKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("flutterwave bank list API connection error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("flutterwave bank list API returned status %d", resp.StatusCode)
	}

	var fResp flutterwaveBankResponse
	if err := json.NewDecoder(resp.Body).Decode(&fResp); err != nil {
		return nil, fmt.Errorf("failed to decode flutterwave bank list: %w", err)
	}

	if !strings.EqualFold(fResp.Status, "success") {
		return nil, fmt.Errorf("flutterwave bank list returned error: %s", fResp.Message)
	}

	var banks []domain.Bank
	for _, b := range fResp.Data {
		banks = append(banks, domain.Bank{
			Name: b.Name,
			Code: b.Code,
			Slug: slugify(b.Name),
		})
	}

	if len(banks) == 0 {
		return nil, fmt.Errorf("flutterwave returned empty bank list")
	}

	return banks, nil
}

type flutterwaveResolveResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    struct {
		AccountNumber string `json:"account_number"`
		AccountName   string `json:"account_name"`
	} `json:"data"`
}

// ValidateBankAccount verifies an account number with a specific bank via Flutterwave.
func (c *FlutterwaveClient) ValidateBankAccount(ctx context.Context, accountNumber, bankCode string) (string, error) {
	if c.secretKey == "" {
		return "", fmt.Errorf("flutterwave secret key is not configured")
	}

	payload, err := json.Marshal(map[string]string{
		"account_number": accountNumber,
		"account_bank":   bankCode,
	})
	if err != nil {
		return "", fmt.Errorf("failed to marshal account resolve payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/accounts/resolve", bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("failed to create account resolve request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+c.secretKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("flutterwave account resolve API connection error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp struct {
			Status  string `json:"status"`
			Message string `json:"message"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return "", fmt.Errorf("flutterwave account resolve failed (status %d): %s", resp.StatusCode, errResp.Message)
	}

	var rResp flutterwaveResolveResponse
	if err := json.NewDecoder(resp.Body).Decode(&rResp); err != nil {
		return "", fmt.Errorf("failed to decode account resolve response: %w", err)
	}

	if !strings.EqualFold(rResp.Status, "success") || rResp.Data.AccountName == "" {
		return "", fmt.Errorf("account resolution failed: %s", rResp.Message)
	}

	return rResp.Data.AccountName, nil
}

// VerifyWebhookSignature verifies the Flutterwave verif-hash header.
func (c *FlutterwaveClient) VerifyWebhookSignature(headerHash string) bool {
	if c.secretHash == "" || headerHash == "" {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(c.secretHash), []byte(headerHash)) == 1
}

func isNumeric(s string) bool {
	for _, ch := range s {
		if ch < '0' || ch > '9' {
			return false
		}
	}
	return true
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = strings.ReplaceAll(s, " ", "-")
	return s
}
