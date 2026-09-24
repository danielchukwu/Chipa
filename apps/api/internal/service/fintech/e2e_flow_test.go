package fintech_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestE2E_FullSignupOnboardingKYCWorkflow(t *testing.T) {
	ctx := context.Background()
	baseURL := "http://localhost:4100"

	// 1. Check if server is reachable
	resp, err := http.Get(baseURL + "/health")
	if err != nil {
		t.Skip("API server is not reachable on localhost:4100, skipping live HTTP test")
		return
	}
	resp.Body.Close()

	// 2. Connect to Redis & Postgres
	rdb := redis.NewClient(&redis.Options{
		Addr:     "localhost:6386",
		Password: "password",
		DB:       0,
	})
	defer rdb.Close()
	require.NoError(t, rdb.Ping(ctx).Err())

	dsn := "postgres://postgres:password@localhost:5436/chipa_db?sslmode=disable"
	pool, err := pgxpool.New(ctx, dsn)
	require.NoError(t, err)
	defer pool.Close()

	// 3. Step 1: Send Signup Email OTP
	testEmail := fmt.Sprintf("testuser_%d@chipa.dev", time.Now().Unix())
	body, _ := json.Marshal(map[string]string{"email": testEmail})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/api/v1/auth/signup/email-otp", bytes.NewReader(body))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")

	resp, err = http.DefaultClient.Do(req)
	require.NoError(t, err)
	respBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	require.Equal(t, http.StatusOK, resp.StatusCode, "expected 200 from SendSignupEmailOTP, got %s", string(respBytes))

	// 4. Step 2: Grab the verification code from Redis
	rawRedis, err := rdb.Get(ctx, "register:email_otp:"+testEmail).Result()
	require.NoError(t, err, "OTP record must exist in Redis")

	var stored struct {
		Hash string `json:"hash"`
		Code string `json:"code"`
	}
	err = json.Unmarshal([]byte(rawRedis), &stored)
	require.NoError(t, err)
	otpCode := stored.Code
	if otpCode == "" {
		otpCode = "123456"
	}
	t.Logf("Retrieved OTP from Redis for %s: %s", testEmail, otpCode)

	// 5. Step 3: Verify Email OTP
	verifyBody, _ := json.Marshal(map[string]string{
		"email": testEmail,
		"otp":   otpCode,
	})
	req, _ = http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/api/v1/auth/signup/email-otp/verify", bytes.NewReader(verifyBody))
	req.Header.Set("Content-Type", "application/json")
	resp, err = http.DefaultClient.Do(req)
	require.NoError(t, err)
	respBytes, _ = io.ReadAll(resp.Body)
	resp.Body.Close()
	require.Equal(t, http.StatusOK, resp.StatusCode, "expected 200 from VerifySignupEmailOTP: %s", string(respBytes))

	var verifyRes struct {
		Data struct {
			EmailVerificationToken string `json:"emailVerificationToken"`
		} `json:"data"`
	}
	_ = json.Unmarshal(respBytes, &verifyRes)
	token := verifyRes.Data.EmailVerificationToken
	require.NotEmpty(t, token, "emailVerificationToken must be returned")

	// 6. Step 4: Sign up with password
	signupBody, _ := json.Marshal(map[string]any{
		"email":            testEmail,
		"password":         "Password123#@",
		"countryId":        161,
		"verificationCode": token,
	})
	req, _ = http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/api/v1/auth/signup", bytes.NewReader(signupBody))
	req.Header.Set("Content-Type", "application/json")
	resp, err = http.DefaultClient.Do(req)
	require.NoError(t, err)
	respBytes, _ = io.ReadAll(resp.Body)
	resp.Body.Close()
	require.Equal(t, http.StatusOK, resp.StatusCode, "expected 200 from Signup: %s", string(respBytes))

	var signupRes struct {
		Data struct {
			ID          string `json:"id"`
			AccessToken string `json:"accessToken"`
			User        struct {
				AccountStatus string `json:"account_status"`
			} `json:"user"`
		} `json:"data"`
	}
	_ = json.Unmarshal(respBytes, &signupRes)
	accessToken := signupRes.Data.AccessToken
	require.NotEmpty(t, accessToken, "accessToken must be returned")

	// Verify DB state immediately after signup: account_status MUST be 'just_registered'
	var newUserID int64
	var dbStatus string
	var pinHash *string
	err = pool.QueryRow(ctx, "SELECT id, account_status, pin_hash FROM users WHERE email = $1", testEmail).Scan(&newUserID, &dbStatus, &pinHash)
	require.NoError(t, err)
	assert.Equal(t, "just_registered", dbStatus, "account_status must be 'just_registered' right after signup")
	assert.Nil(t, pinHash, "user must not have PIN yet")

	// 7. Step 5: Save Onboarding Profile (Personal Info + Address)
	onboardingBody, _ := json.Marshal(map[string]any{
		"first_name":     "Ada",
		"last_name":      "Lovelace",
		"date_of_birth":  "1995-12-10",
		"street_address": "14 Marina Boulevard",
		"city":           "Lagos",
		"state":          "Lagos",
		"postal_code":    "100001",
	})
	req, _ = http.NewRequestWithContext(ctx, http.MethodPatch, baseURL+"/api/v1/users/me/onboarding", bytes.NewReader(onboardingBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	resp, err = http.DefaultClient.Do(req)
	require.NoError(t, err)
	respBytes, _ = io.ReadAll(resp.Body)
	resp.Body.Close()
	require.Equal(t, http.StatusOK, resp.StatusCode, "expected 200 from SaveOnboardingProfile: %s", string(respBytes))

	// Verify DB state after onboarding: account_status MUST now be 'active'
	err = pool.QueryRow(ctx, "SELECT account_status FROM users WHERE id = $1", newUserID).Scan(&dbStatus)
	require.NoError(t, err)
	assert.Equal(t, "active", dbStatus, "account_status must transition to 'active' after completing profile")

	// 8. Step 6: Submit Tier 1 KYC (BVN verification)
	kycBody, _ := json.Marshal(map[string]string{
		"country_code":    "NG",
		"document_type":   "bvn",
		"document_number": "22222222222",
		"bvn":             "22222222222",
		"id_number":       "22222222222",
	})
	req, _ = http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/api/v1/kyc/tier1", bytes.NewReader(kycBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	resp, err = http.DefaultClient.Do(req)
	require.NoError(t, err)
	respBytes, _ = io.ReadAll(resp.Body)
	resp.Body.Close()
	require.Equal(t, http.StatusOK, resp.StatusCode, "expected 200 from SubmitTier1 KYC: %s", string(respBytes))

	// Verify DB state: KYC tier is now 1 and verified
	var kycTier int16
	var kycStatus string
	err = pool.QueryRow(ctx, "SELECT kyc_tier, kyc_status FROM users WHERE id = $1", newUserID).Scan(&kycTier, &kycStatus)
	require.NoError(t, err)
	assert.Equal(t, int16(1), kycTier)
	assert.Equal(t, "verified", kycStatus)

	// Verify DVA in payment_accounts was provisioned!
	var paymentAccCount int64
	var bankName, accountNum string
	err = pool.QueryRow(ctx, "SELECT COUNT(*) FROM payment_accounts WHERE user_id = $1", newUserID).Scan(&paymentAccCount)
	require.NoError(t, err)
	assert.Equal(t, int64(4), paymentAccCount, "All 4 multi-currency payment rails should be created")

	err = pool.QueryRow(ctx, "SELECT bank_name, account_number FROM payment_accounts WHERE user_id = $1 AND provider = 'paystack' LIMIT 1", newUserID).Scan(&bankName, &accountNum)
	require.NoError(t, err)
	assert.Contains(t, bankName, "Titan Trust Bank")
	assert.NotEmpty(t, accountNum)
	t.Logf("Successfully provisioned DVA for new user: %s - %s", bankName, accountNum)

	// 9. Step 7: Set Transaction PIN
	pinBody, _ := json.Marshal(map[string]string{
		"pin": "7788",
	})
	req, _ = http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/api/v1/users/pin/set", bytes.NewReader(pinBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+accessToken)
	resp, err = http.DefaultClient.Do(req)
	require.NoError(t, err)
	respBytes, _ = io.ReadAll(resp.Body)
	resp.Body.Close()
	require.Equal(t, http.StatusOK, resp.StatusCode, "expected 200 from SetPIN: %s", string(respBytes))

	// Verify DB state: pin_hash is now populated
	var hasPin bool
	err = pool.QueryRow(ctx, "SELECT (pin_hash IS NOT NULL) FROM users WHERE id = $1", newUserID).Scan(&hasPin)
	require.NoError(t, err)
	assert.True(t, hasPin, "pin_hash must be set")

	// 10. Step 8: Fetch Wallets
	req, _ = http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/api/v1/wallets", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	resp, err = http.DefaultClient.Do(req)
	require.NoError(t, err)
	respBytes, _ = io.ReadAll(resp.Body)
	resp.Body.Close()
	require.Equal(t, http.StatusOK, resp.StatusCode, "expected 200 from GetWallets: %s", string(respBytes))

	var walletsRes struct {
		Data struct {
			Wallets []struct {
				Currency      string `json:"currency"`
				AccountNumber string `json:"account_number"`
				BankName      string `json:"bank_name"`
			} `json:"wallets"`
		} `json:"data"`
	}
	_ = json.Unmarshal(respBytes, &walletsRes)
	require.NotEmpty(t, walletsRes.Data.Wallets, "wallets list must not be empty")

	t.Logf("E2E Test Completed Successfully! User %d reached active state with DVA: %s %s",
		newUserID, bankName, accountNum)
}
