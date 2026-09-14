package card

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"chipa/api/internal/domain"
)

type CardIssuingProvider interface {
	IssueCard(ctx context.Context, userID int64, name string, currency domain.Currency, scheme domain.CardScheme) (*domain.Card, error)
	FreezeCard(ctx context.Context, cardID string) error
	UnfreezeCard(ctx context.Context, cardID string) error
	SetSpendingLimit(ctx context.Context, cardID string, limit float64) error
}

type SandboxCardProvider struct{}

func NewSandboxCardProvider() *SandboxCardProvider {
	return &SandboxCardProvider{}
}

func (p *SandboxCardProvider) IssueCard(ctx context.Context, userID int64, name string, currency domain.Currency, scheme domain.CardScheme) (*domain.Card, error) {
	bin := "411111" // Visa standard BIN
	if scheme == domain.CardSchemeMastercard {
		bin = "550000" // Mastercard BIN
	}

	panSuffix := fmt.Sprintf("%010d", rand.Int63n(10000000000))
	fullPAN := bin + panSuffix
	last4 := fullPAN[len(fullPAN)-4:]
	cvv := fmt.Sprintf("%03d", rand.Intn(900)+100)

	expYear := time.Now().AddDate(4, 0, 0).Format("06")
	expMonth := "09"

	return &domain.Card{
		ID:            fmt.Sprintf("crd-%s-%d", currency, rand.Int63n(1000000)),
		UserID:        userID,
		Name:          name,
		Currency:      currency,
		Scheme:        scheme,
		PAN:           fullPAN,
		Last4:         last4,
		ExpiryMonth:   expMonth,
		ExpiryYear:    expYear,
		CVV:           cvv,
		Status:        domain.CardStatusActive,
		Balance:       0.00,
		SpendingLimit: 5000.00,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}, nil
}

func (p *SandboxCardProvider) FreezeCard(ctx context.Context, cardID string) error {
	return nil
}

func (p *SandboxCardProvider) UnfreezeCard(ctx context.Context, cardID string) error {
	return nil
}

func (p *SandboxCardProvider) SetSpendingLimit(ctx context.Context, cardID string, limit float64) error {
	return nil
}
