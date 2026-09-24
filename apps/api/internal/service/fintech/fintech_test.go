package fintech_test

import (
	"context"
	"testing"
	"time"

	"chipa/api/internal/domain"
	"chipa/api/internal/provider/bridge"
	cardprovider "chipa/api/internal/provider/card"
	"chipa/api/internal/provider/paystack"
	vasprovider "chipa/api/internal/provider/vas"
	"chipa/api/internal/service/fintech"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestServices() (*fintech.WalletService, *fintech.CardService, *fintech.FXService, *fintech.VASService, *fintech.PINService) {
	bridgeClient := bridge.NewBridgeClient("test_key", "http://mock")
	paystackClient := paystack.NewPaystackClient("mock_sec", "mock_pub", "http://mock")
	cardProv := cardprovider.NewSandboxCardProvider()
	vasProv := vasprovider.NewSandboxVASProvider()

	ledgerSvc := fintech.NewLedgerService(nil)
	walletSvc := fintech.NewWalletService(nil, bridgeClient, paystackClient, ledgerSvc)
	cardSvc := fintech.NewCardService(nil, cardProv, walletSvc, ledgerSvc)
	fxSvc := fintech.NewFXService(walletSvc)
	vasSvc := fintech.NewVASService(vasProv, walletSvc)
	pinSvc := fintech.NewPINService(nil, walletSvc)

	return walletSvc, cardSvc, fxSvc, vasSvc, pinSvc
}

func TestWalletService(t *testing.T) {
	walletSvc, _, _, _, _ := setupTestServices()
	ctx := context.Background()
	userID := int64(101)

	// Test GetUserWallets returns all 4 currencies
	wallets, err := walletSvc.GetUserWallets(ctx, userID, "Daniel Adekunle")
	require.NoError(t, err)
	assert.Len(t, wallets, 4)

	currencies := []domain.Currency{domain.CurrencyNGN, domain.CurrencyUSD, domain.CurrencyGBP, domain.CurrencyEUR}
	for i, c := range currencies {
		assert.Equal(t, c, wallets[i].Currency)
	}

	// Verify Lead Bank USD account details
	usdWallet, err := walletSvc.GetUserWallet(ctx, userID, domain.CurrencyUSD, "Daniel Adekunle")
	require.NoError(t, err)
	assert.Equal(t, "101019283", usdWallet.RoutingNumber)
	assert.Contains(t, usdWallet.BankName, "Lead Bank")

	// Verify Clear Junction GBP sort code
	gbpWallet, err := walletSvc.GetUserWallet(ctx, userID, domain.CurrencyGBP, "Daniel Adekunle")
	require.NoError(t, err)
	assert.Equal(t, "04-00-04", gbpWallet.SortCode)

	// Verify Clear Junction EUR IBAN
	eurWallet, err := walletSvc.GetUserWallet(ctx, userID, domain.CurrencyEUR, "Daniel Adekunle")
	require.NoError(t, err)
	assert.NotEmpty(t, eurWallet.IBAN)
	assert.Equal(t, "CLJUGB21", eurWallet.BIC)

	// Test Debit & Credit
	_ = walletSvc.CreditWallet(ctx, userID, domain.CurrencyUSD, 100.00, "Daniel Adekunle")
	initialUSD := usdWallet.Balance
	err = walletSvc.DebitWallet(ctx, userID, domain.CurrencyUSD, 50.00, "Daniel Adekunle")
	assert.NoError(t, err)
	assert.Equal(t, initialUSD-50.00, usdWallet.Balance)

	// Test Insufficient Balance
	err = walletSvc.DebitWallet(ctx, userID, domain.CurrencyUSD, 999999.00, "Daniel Adekunle")
	assert.Error(t, err)
}

func TestCardService(t *testing.T) {
	walletSvc, cardSvc, _, _, _ := setupTestServices()
	ctx := context.Background()
	userID := int64(202)

	// List default cards
	cards, err := cardSvc.ListCards(ctx, userID)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, len(cards), 3)

	// Create new USD Visa Card
	newCard, err := cardSvc.CreateCard(ctx, userID, "Travel Card", domain.CurrencyUSD, domain.CardSchemeVisa)
	require.NoError(t, err)
	assert.Equal(t, "Travel Card", newCard.Name)
	assert.Equal(t, domain.CurrencyUSD, newCard.Currency)
	assert.Equal(t, domain.CardSchemeVisa, newCard.Scheme)
	assert.Equal(t, domain.CardStatusActive, newCard.Status)

	// Freeze Card
	err = cardSvc.FreezeCard(ctx, userID, newCard.ID)
	assert.NoError(t, err)

	// Unfreeze Card
	err = cardSvc.UnfreezeCard(ctx, userID, newCard.ID)
	assert.NoError(t, err)

	// Fund Card from USD Wallet
	_ = walletSvc.CreditWallet(ctx, userID, domain.CurrencyUSD, 500.00, "Daniel Adekunle")
	err = cardSvc.FundCard(ctx, userID, newCard.ID, 100.00, domain.CurrencyUSD, "Daniel Adekunle")
	assert.NoError(t, err)

	cardDetails, err := cardSvc.GetCardDetails(ctx, userID, newCard.ID)
	require.NoError(t, err)
	assert.Equal(t, 100.00, cardDetails.Balance)
}

func TestFXService(t *testing.T) {
	walletSvc, _, fxSvc, _, _ := setupTestServices()
	ctx := context.Background()
	userID := int64(303)
	_ = walletSvc.CreditWallet(ctx, userID, domain.CurrencyUSD, 500.00, "Daniel Adekunle")

	// Get Live Rates
	rates, err := fxSvc.GetRates(ctx)
	require.NoError(t, err)
	assert.NotEmpty(t, rates)

	// Create Quote USD -> NGN
	quote, err := fxSvc.CreateQuote(ctx, domain.CurrencyUSD, domain.CurrencyNGN, 100.00)
	require.NoError(t, err)
	assert.NotEmpty(t, quote.QuoteID)
	assert.Equal(t, 100.00, quote.SendAmount)
	assert.Greater(t, quote.ReceiveAmount, 100000.00)
	assert.True(t, quote.ExpiresAt.After(time.Now()))

	// Execute Swap
	swapped, err := fxSvc.ExecuteSwap(ctx, userID, quote.QuoteID, "Daniel Adekunle")
	require.NoError(t, err)
	assert.Equal(t, quote.QuoteID, swapped.QuoteID)
}

func TestVASService(t *testing.T) {
	walletSvc, _, _, vasSvc, _ := setupTestServices()
	ctx := context.Background()
	userID := int64(404)
	_ = walletSvc.CreditWallet(ctx, userID, domain.CurrencyNGN, 50000.00, "Daniel Adekunle")

	// Categories
	categories := vasSvc.GetCategories(ctx)
	assert.Contains(t, categories, domain.VASCategoryAirtime)
	assert.Contains(t, categories, domain.VASCategoryElectricity)

	// Operators for Electricity
	operators, err := vasSvc.GetOperators(ctx, domain.VASCategoryElectricity)
	require.NoError(t, err)
	assert.NotEmpty(t, operators)

	// Validate Recipient Meter
	validation, err := vasSvc.ValidateRecipient(ctx, domain.VASCategoryElectricity, "ikedc", "01492810482")
	require.NoError(t, err)
	assert.True(t, validation.IsValid)
	assert.NotEmpty(t, validation.CustomerName)

	// Pay Electricity Bill
	receipt, err := vasSvc.PayBill(ctx, userID, domain.VASCategoryElectricity, "ikedc", "01492810482", 5000.00, "Daniel Adekunle")
	require.NoError(t, err)
	assert.Equal(t, "successful", receipt.Status)
	assert.NotEmpty(t, receipt.PrepaidToken)
	assert.Contains(t, receipt.Reference, "VAS-ikedc-")
}

func TestPINService(t *testing.T) {
	walletSvc, _, _, _, pinSvc := setupTestServices()
	ctx := context.Background()
	userID := int64(505)

	// Default PIN is 1234
	valid, err := pinSvc.VerifyPIN(ctx, userID, "1234")
	require.NoError(t, err)
	assert.True(t, valid)

	invalid, err := pinSvc.VerifyPIN(ctx, userID, "0000")
	require.NoError(t, err)
	assert.False(t, invalid)

	// Set New PIN 9876
	err = pinSvc.SetPIN(ctx, userID, "9876")
	require.NoError(t, err)

	validNew, err := pinSvc.VerifyPIN(ctx, userID, "9876")
	require.NoError(t, err)
	assert.True(t, validNew)

	// Verify that setting PIN automatically provisioned NGN Dedicated Virtual Account
	wallets, err := walletSvc.GetUserWallets(ctx, userID, "Test User")
	require.NoError(t, err)
	assert.NotEmpty(t, wallets)
	var ngnWallet *domain.VirtualAccount
	for _, w := range wallets {
		if w.Currency == domain.CurrencyNGN {
			ngnWallet = w
			break
		}
	}
	require.NotNil(t, ngnWallet)
	assert.NotEmpty(t, ngnWallet.AccountNumber)
	assert.Contains(t, ngnWallet.BankName, "Titan Trust Bank")
	assert.Equal(t, "active", ngnWallet.Status)

	// Rejects non-4-digit PIN
	err = pinSvc.SetPIN(ctx, userID, "123")
	assert.Error(t, err)
}

func TestKYCService(t *testing.T) {
	kycSvc := fintech.NewKYCService(nil, nil)
	ctx := context.Background()
	userID := int64(606)

	status, err := kycSvc.GetKYCStatus(ctx, userID)
	require.NoError(t, err)
	assert.Equal(t, 0, status.CurrentTier)
	assert.Equal(t, "unverified", status.Status)
	assert.Len(t, status.Tiers, 4)

	// Validate Tier 1 requires 11-digit BVN or NIN
	_, err = kycSvc.SubmitTier1(ctx, userID, "", "")
	assert.Error(t, err)

	_, err = kycSvc.SubmitTier1(ctx, userID, "12345", "")
	assert.Error(t, err)

	// Validate Tier 2 requires docType & docNumber
	_, err = kycSvc.SubmitTier2(ctx, userID, "", "", "", "")
	assert.Error(t, err)

	// Validate Tier 3 requires address and city
	_, err = kycSvc.SubmitTier3(ctx, userID, "", "", "", "")
	assert.Error(t, err)
}

func TestWalletService_LiveDB_AccountProvisioning(t *testing.T) {
	ctx := context.Background()
	dsn := "postgres://postgres:password@localhost:5436/chipa_db?sslmode=disable"
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Skip("PostgreSQL database not available on port 5436, skipping live DB test")
		return
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		t.Skip("Cannot ping PostgreSQL database on port 5436, skipping live DB test")
		return
	}

	walletSvc := fintech.NewWalletService(pool, nil, nil, nil)

	// User 1 had a bare financial account without payment account
	ngnAcc, err := walletSvc.EnsureUserAccounts(ctx, 1)
	require.NoError(t, err)
	require.NotNil(t, ngnAcc)
	assert.NotEmpty(t, ngnAcc.AccountNumber)
	assert.Contains(t, ngnAcc.BankName, "Titan Trust Bank")

	// Check all 4 wallets are returned
	wallets, err := walletSvc.GetUserWallets(ctx, 1, "Daniel Chukwu")
	require.NoError(t, err)
	assert.Len(t, wallets, 4)

	// Verify payment_accounts in database is now populated
	var paymentAccCount int64
	err = pool.QueryRow(ctx, "SELECT COUNT(*) FROM payment_accounts WHERE user_id = 1").Scan(&paymentAccCount)
	require.NoError(t, err)
	assert.Equal(t, int64(4), paymentAccCount)
}

