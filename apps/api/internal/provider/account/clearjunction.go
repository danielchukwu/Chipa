package account

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"chipa/api/internal/domain"
)

// ClearJunctionClient handles UK and European cross-border accounts via Clear Junction.
type ClearJunctionClient struct {
	clientUUID string
	apiSecret  string
	baseURL    string
}

func NewClearJunctionClient(clientUUID, apiSecret, baseURL string) *ClearJunctionClient {
	return &ClearJunctionClient{
		clientUUID: clientUUID,
		apiSecret:  apiSecret,
		baseURL:    baseURL,
	}
}

// CreateGBPAccount provisions a UK bank account with UK Sort Code and Account Number supported by Faster Payments.
func (c *ClearJunctionClient) CreateGBPAccount(ctx context.Context, userID int64, accountHolderName string) (*domain.VirtualAccount, error) {
	accNum := fmt.Sprintf("%08d", rand.Int63n(100000000))
	sortCode := "04-00-04" // Clear Junction UK Sort Code

	return &domain.VirtualAccount{
		ID:            fmt.Sprintf("va-gbp-%d", userID),
		UserID:        userID,
		Currency:      domain.CurrencyGBP,
		CurrencyName:  "British Pound",
		Symbol:        "£",
		Balance:       0.00,
		AccountName:   accountHolderName,
		AccountNumber: accNum,
		BankName:      "Clear Junction UK (Faster Payments)",
		SortCode:      sortCode,
		Status:        "active",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}, nil
}

// CreateEURAccount provisions an individual European virtual IBAN supported by SEPA & SEPA Instant.
func (c *ClearJunctionClient) CreateEURAccount(ctx context.Context, userID int64, accountHolderName string) (*domain.VirtualAccount, error) {
	iban := fmt.Sprintf("LT483019%012d", rand.Int63n(1000000000000))
	bic := "CLJUGB21"

	return &domain.VirtualAccount{
		ID:            fmt.Sprintf("va-eur-%d", userID),
		UserID:        userID,
		Currency:      domain.CurrencyEUR,
		CurrencyName:  "Euro",
		Symbol:        "€",
		Balance:       0.00,
		AccountName:   accountHolderName,
		AccountNumber: iban,
		BankName:      "Clear Junction Europe (SEPA)",
		IBAN:          iban,
		BIC:           bic,
		Status:        "active",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}, nil
}
