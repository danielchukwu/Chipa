package vas

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"chipa/api/internal/domain"
)

type VASProvider interface {
	GetOperators(ctx context.Context, category domain.VASCategory) ([]domain.VASOperator, error)
	ValidateCustomer(ctx context.Context, category domain.VASCategory, operatorID string, recipient string) (*domain.VASValidationResult, error)
	VendBill(ctx context.Context, category domain.VASCategory, operatorID string, recipient string, amount float64) (*domain.VASReceipt, error)
}

type SandboxVASProvider struct{}

func NewSandboxVASProvider() *SandboxVASProvider {
	return &SandboxVASProvider{}
}

func (p *SandboxVASProvider) GetOperators(ctx context.Context, category domain.VASCategory) ([]domain.VASOperator, error) {
	switch category {
	case domain.VASCategoryAirtime, domain.VASCategoryData:
		return []domain.VASOperator{
			{ID: "mtn", Name: "MTN Nigeria", Category: category, Logo: "mtn_logo", Description: "Instant 4G/5G Network"},
			{ID: "airtel", Name: "Airtel Nigeria", Category: category, Logo: "airtel_logo", Description: "Smart Network"},
			{ID: "glo", Name: "Glo Mobile", Category: category, Logo: "glo_logo", Description: "Unlimited Entertainment"},
			{ID: "9mobile", Name: "9mobile", Category: category, Logo: "9mobile_logo", Description: "0809ja"},
		}, nil
	case domain.VASCategoryElectricity:
		return []domain.VASOperator{
			{ID: "ikedc", Name: "Ikeja Electric (IKEDC)", Category: category, Logo: "ikedc_logo", Description: "Prepaid & Postpaid"},
			{ID: "ekedc", Name: "Eko Electricity (EKEDC)", Category: category, Logo: "ekedc_logo", Description: "Prepaid & Postpaid"},
			{ID: "aedc", Name: "Abuja Electricity (AEDC)", Category: category, Logo: "aedc_logo", Description: "Prepaid & Postpaid"},
			{ID: "ibedc", Name: "Ibadan Electricity (IBEDC)", Category: category, Logo: "ibedc_logo", Description: "Prepaid & Postpaid"},
		}, nil
	case domain.VASCategoryCableTV:
		return []domain.VASOperator{
			{ID: "dstv", Name: "DStv", Category: category, Logo: "dstv_logo", Description: "Premium Entertainment"},
			{ID: "gotv", Name: "GOtv", Category: category, Logo: "gotv_logo", Description: "Affordable Family TV"},
			{ID: "startimes", Name: "StarTimes", Category: category, Logo: "startimes_logo", Description: "Digital TV"},
		}, nil
	default:
		return []domain.VASOperator{}, nil
	}
}

func (p *SandboxVASProvider) ValidateCustomer(ctx context.Context, category domain.VASCategory, operatorID string, recipient string) (*domain.VASValidationResult, error) {
	name := "DANIEL ADEKUNLE"
	address := "14 Admiralty Way, Lekki Phase 1, Lagos"
	return &domain.VASValidationResult{
		CustomerName:    name,
		RecipientNumber: recipient,
		IsValid:         true,
		Address:         address,
	}, nil
}

func (p *SandboxVASProvider) VendBill(ctx context.Context, category domain.VASCategory, operatorID string, recipient string, amount float64) (*domain.VASReceipt, error) {
	ref := fmt.Sprintf("VAS-%s-%d", operatorID, time.Now().UnixNano())
	var token string
	if category == domain.VASCategoryElectricity {
		token = fmt.Sprintf("%04d %04d %04d %04d %04d",
			rand.Intn(9000)+1000,
			rand.Intn(9000)+1000,
			rand.Intn(9000)+1000,
			rand.Intn(9000)+1000,
			rand.Intn(9000)+1000,
		)
	}

	return &domain.VASReceipt{
		Reference:    ref,
		Category:     string(category),
		Operator:     operatorID,
		Recipient:    recipient,
		Amount:       amount,
		Currency:     domain.CurrencyNGN,
		Status:       "successful",
		PrepaidToken: token,
		Timestamp:    time.Now(),
	}, nil
}
