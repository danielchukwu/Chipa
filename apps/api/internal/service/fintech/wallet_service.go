package fintech

import (
	"context"
	"fmt"
	"math"
	"strings"
	"sync"
	"time"

	"chipa/api/internal/crypto"
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

// EnsureUserAccounts provisions or fetches the user's multi-currency accounts and returns the NGN account.
func (s *WalletService) EnsureUserAccounts(ctx context.Context, userID int64, fallbackName ...string) (*domain.VirtualAccount, error) {
	name := "Chipa User"
	if len(fallbackName) > 0 && fallbackName[0] != "" {
		name = fallbackName[0]
	}
	accs := s.ensureAccounts(ctx, userID, name)
	if ngn, ok := accs[domain.CurrencyNGN]; ok {
		return ngn, nil
	}
	return nil, fmt.Errorf("failed to provision NGN virtual account")
}

func (s *WalletService) ensureAccounts(ctx context.Context, userID int64, fallbackName string) map[domain.Currency]*domain.VirtualAccount {
	s.mu.Lock()
	defer s.mu.Unlock()

	// If database is available, read from financial_accounts + payment_accounts
	if s.pool != nil {
		accs := s.loadAccountsFromDB(ctx, userID)

		// Verify whether the accounts are fully provisioned with payment rails (DVA)
		hasNGNDVA := false
		if ngn, ok := accs[domain.CurrencyNGN]; ok && ngn.AccountNumber != "" && ngn.BankName != "" {
			hasNGNDVA = true
		}

		// If user has all 4 primary currency accounts and NGN has a dedicated payment account (DVA)
		if hasNGNDVA && len(accs) >= 4 {
			return accs
		}

		// Provision new accounts or missing payment rails for user
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
		ngnAcc.BalanceMinor = 0
		ngnAcc.Balance = 0.00
		accs[domain.CurrencyNGN] = ngnAcc
	} else {
		accs[domain.CurrencyNGN] = &domain.VirtualAccount{
			ID:           fmt.Sprintf("va-ngn-%d", userID),
			UserID:       userID,
			Currency:     domain.CurrencyNGN,
			CurrencyName: "Nigerian Naira",
			Symbol:       "₦",
			BalanceMinor: 0,
			Balance:      0.00,
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
		usdAcc.BalanceMinor = 0
		usdAcc.Balance = 0.00
		usdAcc.Provider = "bridge"
		accs[domain.CurrencyUSD] = usdAcc

		gbpAcc, _ := s.bridgeClient.ProvisionGBPAccount(ctx, userID, fallbackName)
		gbpAcc.BalanceMinor = 0
		gbpAcc.Balance = 0.00
		gbpAcc.Provider = "bridge"
		accs[domain.CurrencyGBP] = gbpAcc

		eurAcc, _ := s.bridgeClient.ProvisionEURAccount(ctx, userID, fallbackName)
		eurAcc.BalanceMinor = 0
		eurAcc.Balance = 0.00
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
	// 1. Resolve user holder name, email, and phone
	var firstName, lastName, email, phone string
	_ = s.pool.QueryRow(ctx, `
		SELECT COALESCE(p.first_name, ''), COALESCE(p.last_name, ''), COALESCE(u.email, ''), COALESCE(u.phone, '')
		FROM users u
		LEFT JOIN user_profiles p ON p.user_id = u.id
		WHERE u.id = $1
	`, userID).Scan(&firstName, &lastName, &email, &phone)

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
		ngnVA, _ = s.paystackClient.ProvisionNGNAccount(ctx, userID, holderName, email)
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
		{Currency: domain.CurrencyNGN, InitialMinor: 0, VA: ngnVA},
		{Currency: domain.CurrencyUSD, InitialMinor: 0, VA: usdVA},
		{Currency: domain.CurrencyGBP, InitialMinor: 0, VA: gbpVA},
		{Currency: domain.CurrencyEUR, InitialMinor: 0, VA: eurVA},
	}

	for _, item := range items {
		// 1. Locate existing financial account for this user and currency, or insert a new one
		var faID string
		err := s.pool.QueryRow(ctx, `
			SELECT id::text FROM financial_accounts 
			WHERE user_id = $1 AND currency = $2 AND asset_type = 'fiat'
			ORDER BY created_at ASC
			LIMIT 1
		`, userID, string(item.Currency)).Scan(&faID)

		if err != nil || faID == "" {
			publicID := crypto.GeneratePublicID("fac")
			err = s.pool.QueryRow(ctx, `
				INSERT INTO financial_accounts (public_id, user_id, currency, asset_type, available_balance_minor, ledger_balance_minor, status)
				VALUES ($1, $2, $3, 'fiat', $4, $4, 'active')
				RETURNING id::text
			`, publicID, userID, string(item.Currency), item.InitialMinor).Scan(&faID)
			if err != nil {
				continue
			}
		} else {
			// Update status if it was inactive or update balance if zero
			_, _ = s.pool.Exec(ctx, `
				UPDATE financial_accounts 
				SET status = 'active', 
				    available_balance_minor = CASE WHEN available_balance_minor = 0 THEN $2 ELSE available_balance_minor END,
				    ledger_balance_minor = CASE WHEN ledger_balance_minor = 0 THEN $2 ELSE ledger_balance_minor END,
				    updated_at = NOW() 
				WHERE id = $1::uuid
			`, faID, item.InitialMinor)
		}

		// 2. Check if payment_account already exists for this financial_account_id
		var paID string
		_ = s.pool.QueryRow(ctx, `SELECT id::text FROM payment_accounts WHERE financial_account_id = $1::uuid LIMIT 1`, faID).Scan(&paID)

		if paID == "" {
			_, _ = s.pool.Exec(ctx, `
				INSERT INTO payment_accounts (
					financial_account_id, user_id, provider, account_name, account_number,
					bank_name, routing_number, sort_code, iban, bic_swift, deposit_address, status
				) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
			`, faID, userID, item.VA.Provider, item.VA.AccountName, item.VA.AccountNumber,
				item.VA.BankName, item.VA.RoutingNumber, item.VA.SortCode, item.VA.IBAN, item.VA.BIC, item.VA.DepositAddress)
		} else {
			_, _ = s.pool.Exec(ctx, `
				UPDATE payment_accounts
				SET provider = $2,
					account_name = CASE WHEN account_name = '' THEN $3 ELSE account_name END,
					account_number = CASE WHEN account_number = '' OR account_number IS NULL THEN $4 ELSE account_number END,
					bank_name = CASE WHEN bank_name = '' OR bank_name IS NULL THEN $5 ELSE bank_name END,
					routing_number = CASE WHEN routing_number = '' OR routing_number IS NULL THEN $6 ELSE routing_number END,
					sort_code = CASE WHEN sort_code = '' OR sort_code IS NULL THEN $7 ELSE sort_code END,
					iban = CASE WHEN iban = '' OR iban IS NULL THEN $8 ELSE iban END,
					bic_swift = CASE WHEN bic_swift = '' OR bic_swift IS NULL THEN $9 ELSE bic_swift END,
					deposit_address = CASE WHEN deposit_address = '' OR deposit_address IS NULL THEN $10 ELSE deposit_address END,
					status = 'active',
					updated_at = NOW()
				WHERE id = $1::uuid
			`, paID, item.VA.Provider, item.VA.AccountName, item.VA.AccountNumber,
				item.VA.BankName, item.VA.RoutingNumber, item.VA.SortCode, item.VA.IBAN, item.VA.BIC, item.VA.DepositAddress)
		}

		// 3. Ensure customer ledger account exists
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

