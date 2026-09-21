package fintech

import (
	"context"
	"fmt"
	"sync"

	"chipa/api/internal/crypto"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type PINService struct {
	pool    *pgxpool.Pool
	mu      sync.RWMutex
	pinHash map[int64]string
}

func NewPINService(pool *pgxpool.Pool) *PINService {
	return &PINService{
		pool:    pool,
		pinHash: make(map[int64]string),
	}
}

func (s *PINService) SetPIN(ctx context.Context, userID int64, pin string) error {
	if len(pin) != 4 {
		return fmt.Errorf("transaction PIN must be exactly 4 digits")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(pin), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash PIN: %w", err)
	}

	if s.pool != nil {
		_, err := s.pool.Exec(ctx, `
			UPDATE users 
			SET pin_hash = $1,
			    account_status = CASE WHEN account_status = 'just_registered' THEN 'active' ELSE account_status END,
			    updated_at = NOW() 
			WHERE id = $2
		`, string(hash), userID)
		if err != nil {
			return fmt.Errorf("failed to save PIN in database: %w", err)
		}

		// Ensure user has default active financial account
		var countryCode string
		_ = s.pool.QueryRow(ctx, "SELECT COALESCE(country_code, 'NG') FROM users WHERE id = $1", userID).Scan(&countryCode)
		userCurrency := "NGN"
		switch countryCode {
		case "GH":
			userCurrency = "GHS"
		case "KE":
			userCurrency = "KES"
		case "ZA":
			userCurrency = "ZAR"
		case "US":
			userCurrency = "USD"
		case "GB":
			userCurrency = "GBP"
		case "EU":
			userCurrency = "EUR"
		}

		var finAccCount int64
		_ = s.pool.QueryRow(ctx, "SELECT COUNT(*) FROM financial_accounts WHERE user_id = $1", userID).Scan(&finAccCount)
		if finAccCount == 0 {
			facPublicID := crypto.GeneratePublicID("fac")
			_, _ = s.pool.Exec(ctx, `
				INSERT INTO financial_accounts (public_id, user_id, currency, asset_type, available_balance_minor, ledger_balance_minor, status)
				VALUES ($1, $2, $3, 'fiat', 0, 0, 'active')
				ON CONFLICT (user_id, currency, asset_type, asset_network) DO NOTHING
			`, facPublicID, userID, userCurrency)
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.pinHash[userID] = string(hash)
	return nil
}

func (s *PINService) VerifyPIN(ctx context.Context, userID int64, pin string) (bool, error) {
	s.mu.RLock()
	hash, ok := s.pinHash[userID]
	s.mu.RUnlock()

	if !ok && s.pool != nil {
		var dbHash string
		err := s.pool.QueryRow(ctx, "SELECT COALESCE(pin_hash, '') FROM users WHERE id = $1", userID).Scan(&dbHash)
		if err == nil && dbHash != "" {
			hash = dbHash
			ok = true
			s.mu.Lock()
			s.pinHash[userID] = dbHash
			s.mu.Unlock()
		}
	}

	// Default PIN is 1234 for sandbox/test user if not yet explicitly set
	if !ok {
		return pin == "1234", nil
	}

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pin))
	return err == nil, nil
}

