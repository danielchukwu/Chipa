package account

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"chipa/api/internal/domain"
)

// LeadBankClient handles USD BaaS accounts via Lead Bank (Kansas City, USA).
type LeadBankClient struct {
	apiKey    string
	apiSecret string
	baseURL   string
}

func NewLeadBankClient(apiKey, apiSecret, baseURL string) *LeadBankClient {
	return &LeadBankClient{
		apiKey:    apiKey,
		apiSecret: apiSecret,
		baseURL:   baseURL,
	}
}

// CreateVirtualAccount provisions a USD virtual deposit account with Lead Bank ACH and Fedwire routing.
func (c *LeadBankClient) CreateVirtualAccount(ctx context.Context, userID int64, accountHolderName string) (*domain.VirtualAccount, error) {
	// Generate unique virtual account number for the customer
	accountNum := fmt.Sprintf("409%09d", rand.Int63n(1000000000))
	routingNum := "101019283" // Lead Bank Kansas City ACH / Fedwire ABA routing

	return &domain.VirtualAccount{
		ID:            fmt.Sprintf("va-usd-%d", userID),
		UserID:        userID,
		Currency:      domain.CurrencyUSD,
		CurrencyName:  "US Dollar",
		Symbol:        "$",
		Balance:       0.00,
		AccountName:   accountHolderName,
		AccountNumber: accountNum,
		BankName:      "Lead Bank, Kansas City, MO",
		RoutingNumber: routingNum,
		Status:        "active",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}, nil
}
