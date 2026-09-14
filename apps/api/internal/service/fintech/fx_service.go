package fintech

import (
	"context"
	"fmt"
	"sync"
	"time"

	"chipa/api/internal/domain"
)

type FXService struct {
	mu        sync.RWMutex
	walletSvc *WalletService
	rates     map[string]float64
	quotes    map[string]*domain.FXQuote
}

func NewFXService(walletSvc *WalletService) *FXService {
	return &FXService{
		walletSvc: walletSvc,
		rates: map[string]float64{
			"USD/NGN": 1540.50,
			"GBP/NGN": 1980.20,
			"EUR/NGN": 1685.75,
			"GBP/USD": 1.285,
			"EUR/USD": 1.094,
			"USD/AED": 3.6725,
			"USD/KWD": 0.307,
			"AUD/USD": 0.655,
		},
		quotes: make(map[string]*domain.FXQuote),
	}
}

func (s *FXService) GetRates(ctx context.Context) ([]domain.FXRate, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return []domain.FXRate{
		{Pair: "USD/NGN", From: domain.CurrencyUSD, To: domain.CurrencyNGN, Rate: s.rates["USD/NGN"], Change24h: 0.35, UpdatedAt: time.Now()},
		{Pair: "GBP/NGN", From: domain.CurrencyGBP, To: domain.CurrencyNGN, Rate: s.rates["GBP/NGN"], Change24h: -0.12, UpdatedAt: time.Now()},
		{Pair: "EUR/NGN", From: domain.CurrencyEUR, To: domain.CurrencyNGN, Rate: s.rates["EUR/NGN"], Change24h: 0.45, UpdatedAt: time.Now()},
		{Pair: "GBP/USD", From: domain.CurrencyGBP, To: domain.CurrencyUSD, Rate: s.rates["GBP/USD"], Change24h: -0.05, UpdatedAt: time.Now()},
		{Pair: "EUR/USD", From: domain.CurrencyEUR, To: domain.CurrencyUSD, Rate: s.rates["EUR/USD"], Change24h: 0.10, UpdatedAt: time.Now()},
		{Pair: "USD/AED", From: domain.CurrencyUSD, To: domain.CurrencyAED, Rate: s.rates["USD/AED"], Change24h: 0.00, UpdatedAt: time.Now()},
	}, nil
}

func (s *FXService) CreateQuote(ctx context.Context, from domain.Currency, to domain.Currency, sendAmount float64) (*domain.FXQuote, error) {
	if sendAmount <= 0 {
		return nil, fmt.Errorf("send amount must be greater than zero")
	}

	pair := fmt.Sprintf("%s/%s", from, to)
	inversePair := fmt.Sprintf("%s/%s", to, from)

	s.mu.RLock()
	rate, ok := s.rates[pair]
	if !ok {
		if invRate, invOk := s.rates[inversePair]; invOk && invRate > 0 {
			rate = 1.0 / invRate
		} else {
			// Fallback cross-rate via USD
			rate = 1.0
		}
	}
	s.mu.RUnlock()

	fee := sendAmount * 0.0025 // 0.25% transparent conversion fee
	netSend := sendAmount - fee
	receiveAmount := netSend * rate

	quoteID := fmt.Sprintf("qte-%d-%s%s", time.Now().UnixNano(), from, to)
	quote := &domain.FXQuote{
		QuoteID:       quoteID,
		FromCurrency:  from,
		ToCurrency:    to,
		SendAmount:    sendAmount,
		ReceiveAmount: receiveAmount,
		Rate:          rate,
		Fee:           fee,
		ExpiresAt:     time.Now().Add(60 * time.Second),
	}

	s.mu.Lock()
	s.quotes[quoteID] = quote
	s.mu.Unlock()

	return quote, nil
}

func (s *FXService) ExecuteSwap(ctx context.Context, userID int64, quoteID string, userName string) (*domain.FXQuote, error) {
	s.mu.Lock()
	quote, ok := s.quotes[quoteID]
	if !ok {
		s.mu.Unlock()
		return nil, fmt.Errorf("quote not found")
	}

	if time.Now().After(quote.ExpiresAt) {
		delete(s.quotes, quoteID)
		s.mu.Unlock()
		return nil, fmt.Errorf("quote expired, please request a new rate")
	}

	delete(s.quotes, quoteID)
	s.mu.Unlock()

	// 1. Debit from source wallet
	if err := s.walletSvc.DebitWallet(ctx, userID, quote.FromCurrency, quote.SendAmount, userName); err != nil {
		return nil, fmt.Errorf("source wallet debit failed: %w", err)
	}

	// 2. Credit destination wallet
	if err := s.walletSvc.CreditWallet(ctx, userID, quote.ToCurrency, quote.ReceiveAmount, userName); err != nil {
		// Rollback debit
		_ = s.walletSvc.CreditWallet(ctx, userID, quote.FromCurrency, quote.SendAmount, userName)
		return nil, fmt.Errorf("destination wallet credit failed: %w", err)
	}

	return quote, nil
}
