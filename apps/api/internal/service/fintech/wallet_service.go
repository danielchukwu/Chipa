package fintech

import (
	"context"
	"fmt"
	"math"
	"strings"
	"sync"
	"time"

	"chipa/api/internal/domain"
	"chipa/api/internal/provider/bridge"
	"chipa/api/internal/provider/paystack"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WalletService struct {
	mu             sync.RWMutex
	pool           *pgxpool.Pool
	bridgeClient   *bridge.BridgeClient
	paystackClient *paystack.PaystackClient
	ledgerSvc      *LedgerService
	// in-memory store for fallback / tests without db
	userAccounts   map[int64]map[domain.Currency]*domain.VirtualAccount
}

func NewWalletService(
	pool *pgxpool.Pool,
	bridgeClient *bridge.BridgeClient,
	paystackClient *paystack.PaystackClient,
	ledgerSvc *LedgerService,
) *WalletService {
	return &WalletService{
		pool:           pool,
		bridgeClient:   bridgeClient,
		paystackClient: paystackClient,
		ledgerSvc:      ledgerSvc,
		userAccounts:  make(map[int64]map[domain.Currency]*domain.VirtualAccount),
	}
}

func getCurrencyMeta(curr domain.Currency) (name string, symbol string) {
	switch curr {
	case domain.CurrencyNGN:
		return "Nigerian Naira", "₦"
	case domain.CurrencyUSD:
		return "US Dollar", "$"
	case domain.CurrencyGBP:
		return "British Pound", "£"
	case domain.CurrencyEUR:
		return "Euro", "€"
	case domain.CurrencyUSDC:
		return "USD Coin", "USDC"
	case domain.CurrencyAED:
		return "UAE Dirham", "AED"
	case domain.CurrencyKWD:
		return "Kuwaiti Dinar", "KWD"
	case domain.CurrencyAUD:
		return "Australian Dollar", "A$"
	default:
		return string(curr), string(curr)
	}
}

func (s *WalletService) ensureAccounts(ctx context.Context, userID int64, fallbackName string) map[domain.Currency]*domain.VirtualAccount {
	s.mu.Lock()
	defer s.mu.Unlock()

	// If database is available, read from financial_accounts + payment_accounts
	if s.pool != nil {
		accs := s.loadAccountsFromDB(ctx, userID)
		if len(accs) > 0 {
			return accs
		}

		// Provision new accounts for user
		s.provisionInitialAccountsDB(ctx, userID, fallbackName)
		return s.loadAccountsFromDB(ctx, userID)
	}

	// In-memory fallback
	if accs, ok := s.userAccounts[userID]; ok {
		return accs
	}

	accs := make(map[domain.Currency]*domain.VirtualAccount)

	// 1. NGN (Paystack)
	if s.paystackClient != nil {
		ngnAcc, _ := s.paystackClient.ProvisionNGNAccount(ctx, userID, fallbackName)
		ngnAcc.BalanceMinor = 250000000 // 2,500,000 NGN in kobo
		ngnAcc.Balance = 2500000.00
		accs[domain.CurrencyNGN] = ngnAcc
	} else {
		accs[domain.CurrencyNGN] = &domain.VirtualAccount{
			ID:           fmt.Sprintf("va-ngn-%d", userID),
			UserID:       userID,
			Currency:     domain.CurrencyNGN,
			CurrencyName: "Nigerian Naira",
			Symbol:       "₦",
			BalanceMinor: 250000000,
			Balance:      2500000.00,
			AccountName:  fmt.Sprintf("CHIPA / %s", fallbackName),
			AccountNumber: fmt.Sprintf("829%07d", userID*1000+19),
			BankName:     "Titan Trust Bank (Paystack)",
			Provider:     "paystack",
			Status:       "active",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
	}

	// 2. USD (Bridge.xyz)
	if s.bridgeClient != nil {
		usdAcc, _ := s.bridgeClient.ProvisionUSDAccount(ctx, userID, fallbackName)
		usdAcc.BalanceMinor = 845000
		usdAcc.Balance = 8450.00
		usdAcc.Provider = "bridge"
		accs[domain.CurrencyUSD] = usdAcc

		gbpAcc, _ := s.bridgeClient.ProvisionGBPAccount(ctx, userID, fallbackName)
		gbpAcc.BalanceMinor = 320050
		gbpAcc.Balance = 3200.50
		gbpAcc.Provider = "bridge"
		accs[domain.CurrencyGBP] = gbpAcc

		eurAcc, _ := s.bridgeClient.ProvisionEURAccount(ctx, userID, fallbackName)
		eurAcc.BalanceMinor = 410000
		eurAcc.Balance = 4100.00
		eurAcc.Provider = "bridge"
		accs[domain.CurrencyEUR] = eurAcc
	}

	s.userAccounts[userID] = accs
	return accs
}

func (s *WalletService) loadAccountsFromDB(ctx context.Context, userID int64) map[domain.Currency]*domain.VirtualAccount {
	rows, err := s.pool.Query(ctx, `
		SELECT 
			fa.id::text,
			fa.currency,
			fa.available_balance_minor,
			fa.status,
			fa.created_at,
			fa.updated_at,
			COALESCE(pa.provider, 'system'),
			COALESCE(pa.account_name, ''),
			COALESCE(pa.account_number, ''),
			COALESCE(pa.bank_name, ''),
			COALESCE(pa.routing_number, ''),
			COALESCE(pa.sort_code, ''),
			COALESCE(pa.iban, ''),
			COALESCE(pa.bic_swift, ''),
			COALESCE(pa.deposit_address, '')
		FROM financial_accounts fa
		LEFT JOIN payment_accounts pa ON pa.financial_account_id = fa.id
		WHERE fa.user_id = $1
	`, userID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	accs := make(map[domain.Currency]*domain.VirtualAccount)
	for rows.Next() {
		var id, currStr, status, provider, accName, accNum, bankName string
		var routing, sortCode, iban, bic, depositAddr string
		var balMinor int64
		var createdAt, updatedAt time.Time

		if err := rows.Scan(
			&id, &currStr, &balMinor, &status, &createdAt, &updatedAt,
			&provider, &accName, &accNum, &bankName,
			&routing, &sortCode, &iban, &bic, &depositAddr,
		); err != nil {
			continue
		}

		c := domain.Currency(currStr)
		cName, symbol := getCurrencyMeta(c)

		accs[c] = &domain.VirtualAccount{
			ID:             id,
			UserID:         userID,
			Currency:       c,
			CurrencyName:   cName,
			Symbol:         symbol,
			BalanceMinor:   balMinor,
			Balance:        float64(balMinor) / 100.0,
			AccountName:    accName,
			AccountNumber:  accNum,
			BankName:       bankName,
			Provider:       provider,
			RoutingNumber:  routing,
			SortCode:       sortCode,
			IBAN:           iban,
			BIC:            bic,
			DepositAddress: depositAddr,
			Status:         status,
			CreatedAt:      createdAt,
			UpdatedAt:      updatedAt,
		}
	}

	return accs
}

func (s *WalletService) provisionInitialAccountsDB(ctx context.Context, userID int64, fallbackName string) {
	// 1. Resolve user holder name
	var firstName, lastName string
	_ = s.pool.QueryRow(ctx, "SELECT COALESCE(first_name, ''), COALESCE(last_name, '') FROM users WHERE id = $1", userID).Scan(&firstName, &lastName)
	holderName := strings.TrimSpace(fmt.Sprintf("%s %s", firstName, lastName))
	if holderName == "" {
		if fallbackName != "" {
			holderName = fallbackName
		} else {
			holderName = "Chipa User"
		}
	}

	// 2. Prepare accounts for NGN, USD, GBP, EUR
	type provisionItem struct {
		Currency     domain.Currency
		InitialMinor int64
		VA           *domain.VirtualAccount
	}

	var ngnVA *domain.VirtualAccount
	if s.paystackClient != nil {
		ngnVA, _ = s.paystackClient.ProvisionNGNAccount(ctx, userID, holderName)
	}
	if ngnVA == nil {
		ngnVA = &domain.VirtualAccount{
			Currency:      domain.CurrencyNGN,
			AccountName:   fmt.Sprintf("CHIPA / %s", holderName),
			AccountNumber: fmt.Sprintf("992%07d", userID*1000+19),
			BankName:      "Titan Trust Bank (Paystack)",
			Provider:      "paystack",
		}
	} else {
		ngnVA.Provider = "paystack"
	}

	var usdVA, gbpVA, eurVA *domain.VirtualAccount
	if s.bridgeClient != nil {
		usdVA, _ = s.bridgeClient.ProvisionUSDAccount(ctx, userID, holderName)
		gbpVA, _ = s.bridgeClient.ProvisionGBPAccount(ctx, userID, holderName)
		eurVA, _ = s.bridgeClient.ProvisionEURAccount(ctx, userID, holderName)
	}
	if usdVA == nil {
		usdVA = &domain.VirtualAccount{
			Currency:      domain.CurrencyUSD,
			AccountName:   holderName,
			AccountNumber: fmt.Sprintf("409%09d", userID*1000+77),
			BankName:      "Lead Bank (Bridge.xyz BaaS)",
			RoutingNumber: "101019283",
			Provider:      "bridge",
		}
	} else {
		usdVA.Provider = "bridge"
	}

	if gbpVA == nil {
		gbpVA = &domain.VirtualAccount{
			Currency:      domain.CurrencyGBP,
			AccountName:   holderName,
			AccountNumber: fmt.Sprintf("%08d", userID*1000+45),
			BankName:      "Faster Payments UK (Bridge.xyz)",
			SortCode:      "04-00-04",
			Provider:      "bridge",
		}
	} else {
		gbpVA.Provider = "bridge"
	}

	if eurVA == nil {
		eurVA = &domain.VirtualAccount{
			Currency:      domain.CurrencyEUR,
			AccountName:   holderName,
			AccountNumber: fmt.Sprintf("LT483019%012d", userID*1000+63),
			BankName:      "SEPA Banking (Bridge.xyz)",
			IBAN:          fmt.Sprintf("LT483019%012d", userID*1000+63),
			BIC:           "CLJUGB21",
			Provider:      "bridge",
		}
	} else {
		eurVA.Provider = "bridge"
	}

	items := []provisionItem{
		{Currency: domain.CurrencyNGN, InitialMinor: 250000000, VA: ngnVA}, // ₦2.5m
		{Currency: domain.CurrencyUSD, InitialMinor: 845000, VA: usdVA},    // $8,450
		{Currency: domain.CurrencyGBP, InitialMinor: 320050, VA: gbpVA},    // £3,200.50
		{Currency: domain.CurrencyEUR, InitialMinor: 410000, VA: eurVA},    // €4,100
	}

	for _, item := range items {
		publicID := fmt.Sprintf("fa_%s_%d", strings.ToLower(string(item.Currency)), userID)
		var faID string
		err := s.pool.QueryRow(ctx, `
			INSERT INTO financial_accounts (public_id, user_id, currency, asset_type, available_balance_minor, ledger_balance_minor, status)
			VALUES ($1, $2, $3, 'fiat', $4, $4, 'active')
			ON CONFLICT (user_id, currency, asset_type, asset_network) DO UPDATE
			SET updated_at = NOW()
			RETURNING id::text
		`, publicID, userID, string(item.Currency), item.InitialMinor).Scan(&faID)
		if err != nil {
			continue
		}

		// Insert or update payment_account
		_, _ = s.pool.Exec(ctx, `
			INSERT INTO payment_accounts (
				financial_account_id, user_id, provider, account_name, account_number,
				bank_name, routing_number, sort_code, iban, bic_swift, deposit_address, status
			) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
		`, faID, userID, item.VA.Provider, item.VA.AccountName, item.VA.AccountNumber,
			item.VA.BankName, item.VA.RoutingNumber, item.VA.SortCode, item.VA.IBAN, item.VA.BIC, item.VA.DepositAddress)

		// Ensure customer ledger account exists
		if s.ledgerSvc != nil {
			_, _ = s.ledgerSvc.EnsureCustomerLedgerAccount(ctx, faID, item.Currency)
		}
	}
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
	if amount <= 0 {
		return fmt.Errorf("amount must be greater than zero")
	}

	accs := s.ensureAccounts(ctx, userID, name)

	s.mu.Lock()
	defer s.mu.Unlock()

	acc, ok := accs[currency]
	if !ok {
		return fmt.Errorf("wallet not found for currency %s", currency)
	}

	amountMinor := int64(math.Round(amount * 100))

	if s.pool != nil && s.ledgerSvc != nil {
		custLedgerID, err := s.ledgerSvc.EnsureCustomerLedgerAccount(ctx, acc.ID, currency)
		if err != nil {
			return err
		}
		sysLedgerID, err := s.ledgerSvc.EnsureSystemLedgerAccount(ctx, "settlement", currency)
		if err != nil {
			return err
		}

		// Double-entry invariant: Debit Customer, Credit System Settlement
		_, err = s.ledgerSvc.PostTransaction(
			ctx,
			"withdrawal",
			currency,
			fmt.Sprintf("wdr_%d_%d", userID, time.Now().UnixNano()),
			fmt.Sprintf("Debit %s wallet", currency),
			[]LedgerEntryInput{
				{
					LedgerAccountID:    custLedgerID,
					FinancialAccountID: acc.ID,
					Direction:          "debit",
					AmountMinor:        amountMinor,
				},
				{
					LedgerAccountID: sysLedgerID,
					Direction:       "credit",
					AmountMinor:     amountMinor,
				},
			},
		)
		if err != nil {
			return err
		}

		acc.BalanceMinor -= amountMinor
		acc.Balance = float64(acc.BalanceMinor) / 100.0
		acc.UpdatedAt = time.Now()
		return nil
	}

	// In-memory fallback
	if acc.Balance < amount {
		return fmt.Errorf("insufficient balance in %s wallet", currency)
	}

	acc.Balance -= amount
	acc.BalanceMinor = int64(math.Round(acc.Balance * 100))
	acc.UpdatedAt = time.Now()
	return nil
}

func (s *WalletService) CreditWallet(ctx context.Context, userID int64, currency domain.Currency, amount float64, name string) error {
	if amount <= 0 {
		return fmt.Errorf("amount must be greater than zero")
	}

	accs := s.ensureAccounts(ctx, userID, name)

	s.mu.Lock()
	defer s.mu.Unlock()

	acc, ok := accs[currency]
	if !ok {
		return fmt.Errorf("wallet not found for currency %s", currency)
	}

	amountMinor := int64(math.Round(amount * 100))

	if s.pool != nil && s.ledgerSvc != nil {
		custLedgerID, err := s.ledgerSvc.EnsureCustomerLedgerAccount(ctx, acc.ID, currency)
		if err != nil {
			return err
		}
		sysLedgerID, err := s.ledgerSvc.EnsureSystemLedgerAccount(ctx, "settlement", currency)
		if err != nil {
			return err
		}

		// Double-entry invariant: Debit System Settlement, Credit Customer
		_, err = s.ledgerSvc.PostTransaction(
			ctx,
			"deposit",
			currency,
			fmt.Sprintf("dep_%d_%d", userID, time.Now().UnixNano()),
			fmt.Sprintf("Credit %s wallet", currency),
			[]LedgerEntryInput{
				{
					LedgerAccountID: sysLedgerID,
					Direction:       "debit",
					AmountMinor:     amountMinor,
				},
				{
					LedgerAccountID:    custLedgerID,
					FinancialAccountID: acc.ID,
					Direction:          "credit",
					AmountMinor:        amountMinor,
				},
			},
		)
		if err != nil {
			return err
		}

		acc.BalanceMinor += amountMinor
		acc.Balance = float64(acc.BalanceMinor) / 100.0
		acc.UpdatedAt = time.Now()
		return nil
	}

	// In-memory fallback
	acc.Balance += amount
	acc.BalanceMinor = int64(math.Round(acc.Balance * 100))
	acc.UpdatedAt = time.Now()
	return nil
}

func (s *WalletService) GetUserLedgerTransactions(ctx context.Context, userID int64, limit, offset int) ([]*domain.LedgerTransaction, error) {
	if s.ledgerSvc != nil {
		return s.ledgerSvc.GetUserLedgerTransactions(ctx, userID, limit, offset)
	}
	return []*domain.LedgerTransaction{}, nil
}

