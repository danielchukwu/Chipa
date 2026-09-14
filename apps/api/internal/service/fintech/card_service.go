package fintech

import (
	"context"
	"fmt"
	"sync"
	"time"

	"chipa/api/internal/domain"
	cardprovider "chipa/api/internal/provider/card"
)

type CardService struct {
	mu           sync.RWMutex
	provider     cardprovider.CardIssuingProvider
	walletSvc    *WalletService
	userCards    map[int64][]*domain.Card
}

func NewCardService(provider cardprovider.CardIssuingProvider, walletSvc *WalletService) *CardService {
	return &CardService{
		provider:  provider,
		walletSvc: walletSvc,
		userCards: make(map[int64][]*domain.Card),
	}
}

func (s *CardService) ensureInitialCards(ctx context.Context, userID int64) []*domain.Card {
	s.mu.Lock()
	defer s.mu.Unlock()

	if cards, ok := s.userCards[userID]; ok {
		return cards
	}

	// Default demo cards for user
	c1, _ := s.provider.IssueCard(ctx, userID, "Global Shopping Card", domain.CurrencyUSD, domain.CardSchemeVisa)
	c1.Balance = 1200.00
	c2, _ := s.provider.IssueCard(ctx, userID, "Local Spends", domain.CurrencyNGN, domain.CardSchemeMastercard)
	c2.Balance = 350000.00
	c3, _ := s.provider.IssueCard(ctx, userID, "Euro Subscriptions", domain.CurrencyEUR, domain.CardSchemeVisa)
	c3.Balance = 450.00

	cards := []*domain.Card{c1, c2, c3}
	s.userCards[userID] = cards
	return cards
}

func (s *CardService) ListCards(ctx context.Context, userID int64) ([]*domain.Card, error) {
	cards := s.ensureInitialCards(ctx, userID)

	s.mu.RLock()
	defer s.mu.RUnlock()

	// Return copies with masked PAN
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

	s.mu.Lock()
	defer s.mu.Unlock()

	s.userCards[userID] = append(s.userCards[userID], card)

	masked := *card
	masked.PAN = fmt.Sprintf("•••• •••• •••• %s", card.Last4)
	masked.CVV = "•••"
	return &masked, nil
}

func (s *CardService) FreezeCard(ctx context.Context, userID int64, cardID string) error {
	s.ensureInitialCards(ctx, userID)

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
	return fmt.Errorf("card %s not found", cardID)
}

func (s *CardService) UnfreezeCard(ctx context.Context, userID int64, cardID string) error {
	s.ensureInitialCards(ctx, userID)

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
	return fmt.Errorf("card %s not found", cardID)
}

func (s *CardService) FundCard(ctx context.Context, userID int64, cardID string, amount float64, fromCurrency domain.Currency, userName string) error {
	if amount <= 0 {
		return fmt.Errorf("amount must be greater than zero")
	}

	s.ensureInitialCards(ctx, userID)

	// 1. Debit source wallet
	if err := s.walletSvc.DebitWallet(ctx, userID, fromCurrency, amount, userName); err != nil {
		return fmt.Errorf("wallet debit failed: %w", err)
	}

	// 2. Credit card balance
	s.mu.Lock()
	defer s.mu.Unlock()

	cards := s.userCards[userID]
	for _, c := range cards {
		if c.ID == cardID {
			c.Balance += amount
			c.UpdatedAt = time.Now()
			return nil
		}
	}

	// Rollback wallet debit if card not found
	_ = s.walletSvc.CreditWallet(ctx, userID, fromCurrency, amount, userName)
	return fmt.Errorf("card %s not found", cardID)
}

func (s *CardService) GetCardDetails(ctx context.Context, userID int64, cardID string) (*domain.Card, error) {
	s.ensureInitialCards(ctx, userID)

	s.mu.RLock()
	defer s.mu.RUnlock()

	cards := s.userCards[userID]
	for _, c := range cards {
		if c.ID == cardID {
			return c, nil
		}
	}
	return nil, fmt.Errorf("card not found")
}
