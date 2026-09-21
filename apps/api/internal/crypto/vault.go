package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"time"
)

var (
	// Default dev keys (overridden by environment variables in production)
	defaultKey    = []byte("chipa_secure_aes256_vault_key32b") // 32 bytes
	defaultPepper = []byte("chipa_blind_index_pepper_sec_key")
)

// Vault handles AES-256-GCM encryption at rest and blind index hashing for PII data.
type Vault struct {
	key    []byte
	pepper []byte
}

func NewVault() *Vault {
	key := defaultKey
	if envKey := os.Getenv("CRYPTO_VAULT_KEY"); envKey != "" {
		if len(envKey) >= 32 {
			key = []byte(envKey[:32])
		}
	}

	pepper := defaultPepper
	if envPepper := os.Getenv("CRYPTO_BLIND_PEPPER"); envPepper != "" {
		pepper = []byte(envPepper)
	}

	return &Vault{
		key:    key,
		pepper: pepper,
	}
}

// Encrypt encrypts sensitive plaintext (e.g. BVN, SSN, NIN) using AES-256-GCM with a random 12-byte nonce.
func (v *Vault) Encrypt(plaintext string) ([]byte, error) {
	if plaintext == "" {
		return nil, errors.New("cannot encrypt empty plaintext")
	}

	block, err := aes.NewCipher(v.key)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize GCM: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize()) // 12 bytes
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("failed to generate random nonce: %w", err)
	}

	// Prepend nonce to ciphertext
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return ciphertext, nil
}

// Decrypt decrypts AES-256-GCM ciphertext prepended with a 12-byte nonce.
func (v *Vault) Decrypt(ciphertext []byte) (string, error) {
	if len(ciphertext) == 0 {
		return "", errors.New("cannot decrypt empty ciphertext")
	}

	block, err := aes.NewCipher(v.key)
	if err != nil {
		return "", fmt.Errorf("failed to initialize AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to initialize GCM: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext is too short to contain valid nonce")
	}

	nonce, actualCiphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, actualCiphertext, nil)
	if err != nil {
		return "", fmt.Errorf("decryption authentication failed: %w", err)
	}

	return string(plaintext), nil
}

// BlindIndex creates a deterministic, salted HMAC-SHA256 hash of plaintext for exact-match database queries.
func (v *Vault) BlindIndex(plaintext string) string {
	cleaned := strings.TrimSpace(plaintext)
	mac := hmac.New(sha256.New, v.pepper)
	mac.Write([]byte(cleaned))
	return hex.EncodeToString(mac.Sum(nil))
}

// GeneratePublicID creates a Stripe-style prefixed, collision-free public ID (e.g., usr_01h8..., doc_01h8...).
func GeneratePublicID(prefix string) string {
	nowNano := time.Now().UnixNano()
	randomBytes := make([]byte, 8)
	_, _ = rand.Read(randomBytes)

	// Combine timestamp + random bytes into a compact hexadecimal string
	raw := fmt.Sprintf("%016x%x", nowNano, randomBytes)
	if len(raw) > 24 {
		raw = raw[:24]
	}

	if prefix == "" {
		return raw
	}
	return fmt.Sprintf("%s_%s", prefix, raw)
}
