package fintech

import (
	"context"
	"fmt"

	"chipa/api/internal/domain"
	vasprovider "chipa/api/internal/provider/vas"
)

type VASService struct {
	provider  vasprovider.VASProvider
	walletSvc *WalletService
}

func NewVASService(provider vasprovider.VASProvider, walletSvc *WalletService) *VASService {
	return &VASService{
		provider:  provider,
		walletSvc: walletSvc,
	}
}

func (s *VASService) GetCategories(ctx context.Context) []domain.VASCategory {
	return []domain.VASCategory{
		domain.VASCategoryAirtime,
		domain.VASCategoryData,
		domain.VASCategoryElectricity,
		domain.VASCategoryCableTV,
	}
}

func (s *VASService) GetOperators(ctx context.Context, category domain.VASCategory) ([]domain.VASOperator, error) {
	return s.provider.GetOperators(ctx, category)
}

func (s *VASService) ValidateRecipient(ctx context.Context, category domain.VASCategory, operatorID string, recipient string) (*domain.VASValidationResult, error) {
	return s.provider.ValidateCustomer(ctx, category, operatorID, recipient)
}

func (s *VASService) PayBill(ctx context.Context, userID int64, category domain.VASCategory, operatorID string, recipient string, amount float64, userName string) (*domain.VASReceipt, error) {
	if amount <= 0 {
		return nil, fmt.Errorf("amount must be greater than zero")
	}

	// 1. Debit user's NGN wallet
	if err := s.walletSvc.DebitWallet(ctx, userID, domain.CurrencyNGN, amount, userName); err != nil {
		return nil, fmt.Errorf("wallet debit failed: %w", err)
	}

	// 2. Vend bill via provider
	receipt, err := s.provider.VendBill(ctx, category, operatorID, recipient, amount)
	if err != nil {
		// Rollback debit
		_ = s.walletSvc.CreditWallet(ctx, userID, domain.CurrencyNGN, amount, userName)
		return nil, fmt.Errorf("vend failed: %w", err)
	}

	return receipt, nil
}
