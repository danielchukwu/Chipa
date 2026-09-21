package fintech

import (
	"context"
	"fmt"
	"math"
	"strconv"
	"sync"
	"time"

	"chipa/api/internal/domain"
	cardprovider "chipa/api/internal/provider/card"

	"github.com/jackc/pgx/v5/pgxpool"
)

type CardService struct {
	mu        sync.RWMutex
	pool      *pgxpool.Pool
	provider  cardprovider.CardIssuingProvider
	walletSvc *WalletService
	ledgerSvc *LedgerService
	userCards map[int64][]*domain.Card
}

func NewCardService(
	pool *pgxpool.Pool,
	provider cardprovider.CardIssuingProvider,
	walletSvc *WalletService,
	ledgerSvc *LedgerService,
) *CardService {
	return &CardService{
		pool:      pool,
		provider:  provider,
		walletSvc: walletSvc,
		ledgerSvc: ledgerSvc,
		userCards: make(map[int64][]*domain.Card),
	}
}

func (s *CardService) ensureInitialCards(ctx context.Context, userID int64) []*domain.Card {
	s.mu.Lock()
	defer s.mu.Unlock()

	// If DB is available
	if s.pool != nil {
		cards := s.loadCardsFromDB(ctx, userID)
		if len(cards) > 0 {
			return cards
		}

		s.provisionInitialCardsDB(ctx, userID)
		return s.loadCardsFromDB(ctx, userID)
	}

	// In-memory fallback
	if cards, ok := s.userCards[userID]; ok {
		return cards
	}

	c1, _ := s.provider.IssueCard(ctx, userID, "Global Shopping Card", domain.CurrencyUSD, domain.CardSchemeVisa)
	c1.BalanceMinor = 120000
	c1.Balance = 1200.00

	c2, _ := s.provider.IssueCard(ctx, userID, "Local Spends", domain.CurrencyNGN, domain.CardSchemeMastercard)
	c2.BalanceMinor = 35000000
	c2.Balance = 350000.00

	c3, _ := s.provider.IssueCard(ctx, userID, "Euro Subscriptions", domain.CurrencyEUR, domain.CardSchemeVisa)
	c3.BalanceMinor = 45000
	c3.Balance = 450.00

	cards := []*domain.Card{c1, c2, c3}
	s.userCards[userID] = cards
	return cards
}

func (s *CardService) loadCardsFromDB(ctx context.Context, userID int64) []*domain.Card {
	rows, err := s.pool.Query(ctx, `
		SELECT 
			id::text, public_id, user_id, brand, name_on_card,
			currency, scheme, last4, expiry_month, expiry_year,
			spending_limit_minor, status, created_at, updated_at
		FROM cards
		WHERE user_id = $1
		ORDER BY created_at ASC
	`, userID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var cards []*domain.Card
	for rows.Next() {
		var id, pubID, brand, name, currStr, schemeStr, last4, status string
		var uid, limitMinor int64
		var expMonth, expYear int
		var createdAt, updatedAt time.Time

		if err := rows.Scan(
			&id, &pubID, &uid, &brand, &name,
			&currStr, &schemeStr, &last4, &expMonth, &expYear,
			&limitMinor, &status, &createdAt, &updatedAt,
		); err != nil {
			continue
		}

		cards = append(cards, &domain.Card{
			ID:                 id,
			UserID:             uid,
			Name:               name,
			Currency:           domain.Currency(currStr),
			Scheme:             domain.CardScheme(schemeStr),
			Brand:              brand,
			Last4:              last4,
			ExpiryMonth:        fmt.Sprintf("%02d", expMonth),
			ExpiryYear:         fmt.Sprintf("%02d", expYear),
			Status:             domain.CardStatus(status),
			SpendingLimitMinor: limitMinor,
			SpendingLimit:      float64(limitMinor) / 100.0,
			BalanceMinor:       limitMinor,
			Balance:            float64(limitMinor) / 100.0,
			CreatedAt:          createdAt,
			UpdatedAt:          updatedAt,
		})
	}

	return cards
}

func (s *CardService) provisionInitialCardsDB(ctx context.Context, userID int64) {
	accs := s.walletSvc.ensureAccounts(ctx, userID, "")

	type cardSeed struct {
		Name     string
		Currency domain.Currency
		Scheme   domain.CardScheme
		Brand    string
		Limit    int64
	}

	seeds := []cardSeed{
		{Name: "Global Shopping Card", Currency: domain.CurrencyUSD, Scheme: domain.CardSchemeVisa, Brand: "Visa Platinum", Limit: 120000},
		{Name: "Local Spends", Currency: domain.CurrencyNGN, Scheme: domain.CardSchemeMastercard, Brand: "Mastercard World", Limit: 35000000},
		{Name: "Euro Subscriptions", Currency: domain.CurrencyEUR, Scheme: domain.CardSchemeVisa, Brand: "Visa Signature", Limit: 45000},
	}

	for _, seed := range seeds {
		fa, ok := accs[seed.Currency]
		if !ok || fa.ID == "" {
			continue
		}

		card, err := s.provider.IssueCard(ctx, userID, seed.Name, seed.Currency, seed.Scheme)
		if err != nil {
			continue
		}

		month, _ := strconv.Atoi(card.ExpiryMonth)
		year, _ := strconv.Atoi(card.ExpiryYear)
		if month == 0 {
			month = 12
		}
		if year == 0 {
			year = 28
		}

		pubID := fmt.Sprintf("card_%d_%s", userID, card.Last4)
		_, _ = s.pool.Exec(ctx, `
			INSERT INTO cards (
				public_id, user_id, financial_account_id, provider, provider_card_id,
				card_type, scheme, brand, name_on_card, currency, last4,
				expiry_month, expiry_year, spending_limit_minor, status
			) VALUES (
				$1, $2, $3::uuid, 'bridge', $4,
				'virtual', $5, $6, $7, $8, $9,
				$10, $11, $12, 'active'
			) ON CONFLICT (public_id) DO NOTHING
		`, pubID, userID, fa.ID, card.ID, string(seed.Scheme), seed.Brand, seed.Name, string(seed.Currency), card.Last4,
			month, year, seed.Limit)
	}
}

func (s *CardService) ListCards(ctx context.Context, userID int64) ([]*domain.Card, error) {
	cards := s.ensureInitialCards(ctx, userID)

	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]*domain.Card, len(cards))
	for i, c := range cards {
		copied := *c
		copied.PAN = fmt.Sprintf("•••• •••• •••• %s", c.Last4)
		copied.CVV = "•••"
		result[i] = &copied
	}
	return result, nil
}

func (s *CardService) CreateCard(ctx context.Context, userID int64, name string, currency domain.Currency, scheme domain.CardScheme) (*domain.Card, error) {
	s.ensureInitialCards(ctx, userID)

	card, err := s.provider.IssueCard(ctx, userID, name, currency, scheme)
	if err != nil {
		return nil, err
	}

	if s.pool != nil {
		accs := s.walletSvc.ensureAccounts(ctx, userID, "")
		fa, ok := accs[currency]
		if ok && fa.ID != "" {
			month, _ := strconv.Atoi(card.ExpiryMonth)
			year, _ := strconv.Atoi(card.ExpiryYear)
			if month == 0 {
				month = 12
			}
			if year == 0 {
				year = 29
			}

			pubID := fmt.Sprintf("card_%d_%d", userID, time.Now().UnixNano()%100000)
			var insertedID string
			err := s.pool.QueryRow(ctx, `
				INSERT INTO cards (
					public_id, user_id, financial_account_id, provider, provider_card_id,
					card_type, scheme, brand, name_on_card, currency, last4,
					expiry_month, expiry_year, spending_limit_minor, status
				) VALUES (
					$1, $2, $3::uuid, 'bridge', $4,
					'virtual', $5, 'Visa Platinum', $6, $7, $8,
					$9, $10, 5000000, 'active'
				) RETURNING id::text
			`, pubID, userID, fa.ID, card.ID, string(scheme), name, string(currency), card.Last4,
				month, year).Scan(&insertedID)
			if err == nil {
				card.ID = insertedID
			}
		}
	}

	s.mu.Lock()
	s.userCards[userID] = append(s.userCards[userID], card)
	s.mu.Unlock()

	masked := *card
	masked.PAN = fmt.Sprintf("•••• •••• •••• %s", card.Last4)
	masked.CVV = "•••"
	return &masked, nil
}

func (s *CardService) FreezeCard(ctx context.Context, userID int64, cardID string) error {
	s.ensureInitialCards(ctx, userID)

	if s.pool != nil {
		_, err := s.pool.Exec(ctx, `
			UPDATE cards SET status = 'frozen', updated_at = NOW()
			WHERE (id::text = $1 OR public_id = $1) AND user_id = $2
		`, cardID, userID)
		if err != nil {
			return err
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	cards := s.userCards[userID]
	for _, c := range cards {
		if c.ID == cardID {
			c.Status = domain.CardStatusFrozen
			c.UpdatedAt = time.Now()
			return s.provider.FreezeCard(ctx, cardID)
		}
	}
	return s.provider.FreezeCard(ctx, cardID)
}

func (s *CardService) UnfreezeCard(ctx context.Context, userID int64, cardID string) error {
	s.ensureInitialCards(ctx, userID)

	if s.pool != nil {
		_, err := s.pool.Exec(ctx, `
			UPDATE cards SET status = 'active', updated_at = NOW()
			WHERE (id::text = $1 OR public_id = $1) AND user_id = $2
		`, cardID, userID)
		if err != nil {
			return err
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	cards := s.userCards[userID]
	for _, c := range cards {
		if c.ID == cardID {
			c.Status = domain.CardStatusActive
			c.UpdatedAt = time.Now()
			return s.provider.UnfreezeCard(ctx, cardID)
		}
	}
	return s.provider.UnfreezeCard(ctx, cardID)
}

func (s *CardService) FundCard(ctx context.Context, userID int64, cardID string, amount float64, fromCurrency domain.Currency, userName string) error {
	if amount <= 0 {
		return fmt.Errorf("amount must be greater than zero")
	}

	s.ensureInitialCards(ctx, userID)

	// 1. Debit source wallet via double-entry
	if err := s.walletSvc.DebitWallet(ctx, userID, fromCurrency, amount, userName); err != nil {
		return fmt.Errorf("wallet debit failed: %w", err)
	}

	amountMinor := int64(math.Round(amount * 100))

	// 2. If DB is available, update card limit and post card funding transaction
	if s.pool != nil {
		_, err := s.pool.Exec(ctx, `
			UPDATE cards
			SET spending_limit_minor = spending_limit_minor + $1, updated_at = NOW()
			WHERE (id::text = $2 OR public_id = $2) AND user_id = $3
		`, amountMinor, cardID, userID)
		if err == nil {
			return nil
		}
	}

	// In-memory fallback
	s.mu.Lock()
	defer s.mu.Unlock()

	cards := s.userCards[userID]
	for _, c := range cards {
		if c.ID == cardID {
			c.Balance += amount
			c.BalanceMinor += amountMinor
			c.UpdatedAt = time.Now()
			return nil
		}
	}

	// Rollback wallet debit if card not found
	_ = s.walletSvc.CreditWallet(ctx, userID, fromCurrency, amount, userName)
	return fmt.Errorf("card %s not found", cardID)
}

func (s *CardService) GetCardDetails(ctx context.Context, userID int64, cardID string) (*domain.Card, error) {
	cards := s.ensureInitialCards(ctx, userID)

	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, c := range cards {
		if c.ID == cardID {
			return c, nil
		}
	}
	return nil, fmt.Errorf("card not found")
}
