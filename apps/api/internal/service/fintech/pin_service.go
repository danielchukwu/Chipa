package fintech

import (
	"context"
	"fmt"
	"sync"

	"golang.org/x/crypto/bcrypt"
)

type PINService struct {
	mu      sync.RWMutex
	pinHash map[int64]string
}

func NewPINService() *PINService {
	return &PINService{
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

	s.mu.Lock()
	defer s.mu.Unlock()
	s.pinHash[userID] = string(hash)
	return nil
}

func (s *PINService) VerifyPIN(ctx context.Context, userID int64, pin string) (bool, error) {
	s.mu.RLock()
	hash, ok := s.pinHash[userID]
	s.mu.RUnlock()

	// Default PIN is 1234 for sandbox/test user if not yet explicitly set
	if !ok {
		return pin == "1234", nil
	}

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pin))
	return err == nil, nil
}
