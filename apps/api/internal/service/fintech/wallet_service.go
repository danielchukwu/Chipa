package fintech

import (
	"context"
	"fmt"
	"sync"
	"time"

	"chipa/api/internal/domain"
	"chipa/api/internal/provider/account"
)

type WalletService struct {
	mu             sync.RWMutex
	leadBank       *account.LeadBankClient
	clearJunction  *account.ClearJunctionClient
	// in-memory store for multi-currency wallets per user (augmented with DB user_wallets)
	userAccounts   map[int64]map[domain.Currency]*domain.VirtualAccount
}

func NewWalletService(leadBank *account.LeadBankClient, clearJunction *account.ClearJunctionClient) *WalletService {
	return &WalletService{
		leadBank:      leadBank,
		clearJunction: clearJunction,
		userAccounts:  make(map[int64]map[domain.Currency]*domain.VirtualAccount),
	}
}

func (s *WalletService) ensureAccounts(ctx context.Context, userID int64, name string) map[domain.Currency]*domain.VirtualAccount {
	s.mu.Lock()
	defer s.mu.Unlock()

	if accs, ok := s.userAccounts[userID]; ok {
		return accs
	}

	accs := make(map[domain.Currency]*domain.VirtualAccount)

	// 1. NGN (Monnify: Providus / Wema Bank)
	accs[domain.CurrencyNGN] = &domain.VirtualAccount{
		ID:            fmt.Sprintf("va-ngn-%d", userID),
		UserID:        userID,
		Currency:      domain.CurrencyNGN,
		CurrencyName:  "Nigerian Naira",
		Symbol:        "₦",
		Balance:       2500000.00,
		AccountName:   fmt.Sprintf("CHIPA / %s", name),
		AccountNumber: fmt.Sprintf("829%07d", userID*1000+19),
		BankName:      "Providus Bank (Monnify)",
		Status:        "active",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// 2. USD (Lead Bank: Kansas City, MO)
	usdAcc, _ := s.leadBank.CreateVirtualAccount(ctx, userID, name)
	usdAcc.Balance = 8450.00
	accs[domain.CurrencyUSD] = usdAcc

	// 3. GBP (Clear Junction: UK Faster Payments)
	gbpAcc, _ := s.clearJunction.CreateGBPAccount(ctx, userID, name)
	gbpAcc.Balance = 3200.50
	accs[domain.CurrencyGBP] = gbpAcc

	// 4. EUR (Clear Junction: SEPA Instant)
	eurAcc, _ := s.clearJunction.CreateEURAccount(ctx, userID, name)
	eurAcc.Balance = 4100.00
	accs[domain.CurrencyEUR] = eurAcc

	s.userAccounts[userID] = accs
	return accs
}

func (s *WalletService) GetUserWallets(ctx context.Context, userID int64, name string) ([]*domain.VirtualAccount, error) {
	accs := s.ensureAccounts(ctx, userID, name)

	s.mu.RLock()
	defer s.mu.RUnlock()

	order := []domain.Currency{domain.CurrencyNGN, domain.CurrencyUSD, domain.CurrencyGBP, domain.CurrencyEUR}
	result := make([]*domain.VirtualAccount, 0, len(order))
	for _, c := range order {
		if a, ok := accs[c]; ok {
			result = append(result, a)
		}
	}
	return result, nil
}

func (s *WalletService) GetUserWallet(ctx context.Context, userID int64, currency domain.Currency, name string) (*domain.VirtualAccount, error) {
	accs := s.ensureAccounts(ctx, userID, name)

	s.mu.RLock()
	defer s.mu.RUnlock()

	if acc, ok := accs[currency]; ok {
		return acc, nil
	}
	return nil, fmt.Errorf("wallet not found for currency %s", currency)
}

func (s *WalletService) DebitWallet(ctx context.Context, userID int64, currency domain.Currency, amount float64, name string) error {
	accs := s.ensureAccounts(ctx, userID, name)

	s.mu.Lock()
	defer s.mu.Unlock()

	acc, ok := accs[currency]
	if !ok {
		return fmt.Errorf("wallet not found for currency %s", currency)
	}

	if acc.Balance < amount {
		return fmt.Errorf("insufficient balance in %s wallet", currency)
	}

	acc.Balance -= amount
	acc.UpdatedAt = time.Now()
	return nil
}

func (s *WalletService) CreditWallet(ctx context.Context, userID int64, currency domain.Currency, amount float64, name string) error {
	accs := s.ensureAccounts(ctx, userID, name)

	s.mu.Lock()
	defer s.mu.Unlock()

	acc, ok := accs[currency]
	if !ok {
		return fmt.Errorf("wallet not found for currency %s", currency)
	}

	acc.Balance += amount
	acc.UpdatedAt = time.Now()
	return nil
}
