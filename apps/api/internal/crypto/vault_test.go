package crypto_test

import (
	"testing"

	"chipa/api/internal/crypto"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestVaultEncryptionAndDecryption(t *testing.T) {
	vault := crypto.NewVault()
	bvn := "22233344455"

	// 1. Encrypt BVN
	encrypted, err := vault.Encrypt(bvn)
	require.NoError(t, err)
	assert.NotEmpty(t, encrypted)
	assert.NotEqual(t, []byte(bvn), encrypted)

	// 2. Decrypt BVN
	decrypted, err := vault.Decrypt(encrypted)
	require.NoError(t, err)
	assert.Equal(t, bvn, decrypted)

	// 3. Blind Index
	hash1 := vault.BlindIndex(bvn)
	hash2 := vault.BlindIndex(" " + bvn + " ") // should trim spaces
	assert.Len(t, hash1, 64)
	assert.Equal(t, hash1, hash2)

	// Different input should have different hash
	differentHash := vault.BlindIndex("99988877766")
	assert.NotEqual(t, hash1, differentHash)
}

func TestGeneratePublicID(t *testing.T) {
	userPubID := crypto.GeneratePublicID("usr")
	assert.Contains(t, userPubID, "usr_")
	assert.GreaterOrEqual(t, len(userPubID), 20)

	docPubID := crypto.GeneratePublicID("doc")
	assert.Contains(t, docPubID, "doc_")
	assert.NotEqual(t, userPubID, docPubID)
}
