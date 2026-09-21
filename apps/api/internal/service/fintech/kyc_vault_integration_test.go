package fintech_test

import (
	"context"
	"testing"

	"chipa/api/internal/crypto"
	"chipa/api/internal/service/fintech"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestKYCEncryptedVaultIntegration(t *testing.T) {
	ctx := context.Background()
	dsn := "postgres://postgres:password@localhost:5436/chipa_db?sslmode=disable"
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Skip("PostgreSQL database not available on port 5436, skipping live DB test")
		return
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		t.Skip("Cannot ping PostgreSQL database on port 5436, skipping live DB test")
		return
	}

	vault := crypto.NewVault()
	kycSvc := fintech.NewKYCService(pool, nil, vault)

	// 1. Create a clean test user
	testPublicID := crypto.GeneratePublicID("usr")
	assert.True(t, len(testPublicID) > 10)
	assert.Contains(t, testPublicID, "usr_")

	var countryID int16
	err = pool.QueryRow(ctx, "SELECT id FROM c_countries LIMIT 1").Scan(&countryID)
	if err != nil {
		countryID = 161 // Default Nigeria
	}

	var testUserID int64
	err = pool.QueryRow(ctx, `
		INSERT INTO users (public_id, email, phone, password_hash, user_type, current_country, kyc_tier, kyc_status, account_status)
		VALUES ($1, $2, $3, 'hash_test_12345', 'individual', $4, 0, 'unverified', 'active')
		RETURNING id
	`, testPublicID, "vault_test_"+testPublicID+"@chipa.test", "+2348000000001", countryID).Scan(&testUserID)
	require.NoError(t, err)

	// Clean up after test
	defer func() {
		_, _ = pool.Exec(ctx, "DELETE FROM users WHERE id = $1", testUserID)
	}()

	// Initialize decoupled profile and verifications
	_, err = pool.Exec(ctx, "INSERT INTO user_profiles (user_id, first_name, last_name) VALUES ($1, 'Vault', 'Tester')", testUserID)
	require.NoError(t, err)
	_, err = pool.Exec(ctx, "INSERT INTO user_verifications (user_id) VALUES ($1)", testUserID)
	require.NoError(t, err)

	// 2. Submit Tier 1 KYC (BVN + NIN)
	testBVN := "22233344455"
	testNIN := "11122233344"
	status1, err := kycSvc.SubmitTier1(ctx, testUserID, testBVN, testNIN)
	require.NoError(t, err)
	assert.Equal(t, 1, status1.CurrentTier)
	assert.Equal(t, "verified", status1.Status)
	assert.Equal(t, "•••••••4455", status1.BVN)
	assert.Equal(t, "•••••••3344", status1.NIN)

	// Verify encryption at rest in identity_documents table
	var encBVN []byte
	var hashBVN string
	err = pool.QueryRow(ctx, `
		SELECT document_number_encrypted, document_number_hash 
		FROM identity_documents 
		WHERE user_id = $1 AND document_type = 'bvn'
	`, testUserID).Scan(&encBVN, &hashBVN)
	require.NoError(t, err)
	assert.NotEmpty(t, encBVN)
	assert.NotEqual(t, []byte(testBVN), encBVN, "BVN must not be stored in plaintext")

	// Verify authenticated decryption matches original BVN
	decryptedBVN, err := vault.Decrypt(encBVN)
	require.NoError(t, err)
	assert.Equal(t, testBVN, decryptedBVN)

	// Verify blind index matches HMAC-SHA256
	expectedHash := vault.BlindIndex(testBVN)
	assert.Equal(t, expectedHash, hashBVN)

	// Verify audit flags in user_verifications
	var bvnVerified, ninVerified bool
	err = pool.QueryRow(ctx, `
		SELECT bvn_verified, nin_verified 
		FROM user_verifications 
		WHERE user_id = $1
	`, testUserID).Scan(&bvnVerified, &ninVerified)
	require.NoError(t, err)
	assert.True(t, bvnVerified)
	assert.True(t, ninVerified)

	// 3. Submit Tier 2 KYC (Passport)
	testPassport := "A12345678"
	status2, err := kycSvc.SubmitTier2(ctx, testUserID, "passport", testPassport, "10", "11")
	require.NoError(t, err)
	assert.Equal(t, 2, status2.CurrentTier)

	var encPass []byte
	var hashPass string
	err = pool.QueryRow(ctx, `
		SELECT document_number_encrypted, document_number_hash 
		FROM identity_documents 
		WHERE user_id = $1 AND document_type = 'passport'
	`, testUserID).Scan(&encPass, &hashPass)
	require.NoError(t, err)
	assert.NotEmpty(t, encPass)
	decryptedPass, err := vault.Decrypt(encPass)
	require.NoError(t, err)
	assert.Equal(t, testPassport, decryptedPass)

	var idDocVerified bool
	err = pool.QueryRow(ctx, "SELECT id_document_verified FROM user_verifications WHERE user_id = $1", testUserID).Scan(&idDocVerified)
	require.NoError(t, err)
	assert.True(t, idDocVerified)

	// 4. Submit Tier 3 KYC (Normalized Address)
	testStreet := "12 Admiralty Way, Lekki Phase 1"
	testCity := "Lagos"
	testState := "Lagos State"
	status3, err := kycSvc.SubmitTier3(ctx, testUserID, "12", testStreet, testCity, testState)
	require.NoError(t, err)
	assert.Equal(t, 3, status3.CurrentTier)

	// Verify normalized addresses table
	var line1, city, state string
	var isCurrent bool
	err = pool.QueryRow(ctx, `
		SELECT line_1, city, state, is_current 
		FROM addresses 
		WHERE user_id = $1 AND address_type = 'residential'
	`, testUserID).Scan(&line1, &city, &state, &isCurrent)
	require.NoError(t, err)
	assert.Equal(t, testStreet, line1)
	assert.Equal(t, testCity, city)
	assert.Equal(t, testState, state)
	assert.True(t, isCurrent)

	var addressVerified bool
	err = pool.QueryRow(ctx, "SELECT address_verified FROM user_verifications WHERE user_id = $1", testUserID).Scan(&addressVerified)
	require.NoError(t, err)
	assert.True(t, addressVerified)

	// 5. Verify final KYC Status inspection
	finalStatus, err := kycSvc.GetKYCStatus(ctx, testUserID)
	require.NoError(t, err)
	assert.Equal(t, 3, finalStatus.CurrentTier)
	assert.Equal(t, "verified", finalStatus.Status)
	assert.True(t, finalStatus.Tiers[0].IsUnlocked)
	assert.True(t, finalStatus.Tiers[1].IsUnlocked)
	assert.True(t, finalStatus.Tiers[2].IsUnlocked)
	assert.True(t, finalStatus.Tiers[3].IsUnlocked)
	assert.True(t, finalStatus.Verifications.BVNVerified)
	assert.True(t, finalStatus.Verifications.NINVerified)
	assert.True(t, finalStatus.Verifications.NationalIDVerified)
	assert.True(t, finalStatus.Verifications.LivenessVerified)
	assert.True(t, finalStatus.Verifications.AddressVerified)
}

func TestPanAfricanKYCIntegration(t *testing.T) {
	ctx := context.Background()
	dsn := "postgres://postgres:password@localhost:5436/chipa_db?sslmode=disable"
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Skip("PostgreSQL database not available on port 5436, skipping live DB test")
		return
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		t.Skip("Cannot ping PostgreSQL database on port 5436, skipping live DB test")
		return
	}

	vault := crypto.NewVault()
	kycSvc := fintech.NewKYCService(pool, nil, vault)

	// 1. Test Ghana User: Ghana Card Verification
	ghanaPublicID := crypto.GeneratePublicID("usr")
	var ghanaUserID int64
	err = pool.QueryRow(ctx, `
		INSERT INTO users (public_id, email, password_hash, user_type, country_code, nationality, kyc_tier, kyc_status, account_status)
		VALUES ($1, $2, 'hash_test_gh', 'individual', 'GH', 'GH', 0, 'unverified', 'active')
		RETURNING id
	`, ghanaPublicID, "ghana_"+ghanaPublicID+"@chipa.test").Scan(&ghanaUserID)
	require.NoError(t, err)
	defer func() { _, _ = pool.Exec(ctx, "DELETE FROM users WHERE id = $1", ghanaUserID) }()

	_, err = pool.Exec(ctx, "INSERT INTO user_profiles (user_id, first_name, last_name, nationality) VALUES ($1, 'Kwame', 'Mensah', 'GH')", ghanaUserID)
	require.NoError(t, err)
	_, err = pool.Exec(ctx, "INSERT INTO user_verifications (user_id) VALUES ($1)", ghanaUserID)
	require.NoError(t, err)

	testGhanaCard := "GHA-712345678-1"
	ghStatus, err := kycSvc.SubmitTier1PanAfrican(ctx, ghanaUserID, fintech.Tier1Payload{
		CountryCode:  "GH",
		DocumentType: "ghana_card",
		IDNumber:     testGhanaCard,
	})
	require.NoError(t, err)
	assert.Equal(t, 1, ghStatus.CurrentTier)
	assert.Equal(t, "GH", ghStatus.CountryCode)
	assert.Equal(t, "•••••••78-1", ghStatus.NationalID)
	assert.True(t, ghStatus.Verifications.NationalIDVerified)

	// Verify encrypted document in vault
	var encDoc []byte
	var hashDoc string
	var issuingCountry string
	err = pool.QueryRow(ctx, `
		SELECT document_number_encrypted, document_number_hash, issuing_country 
		FROM identity_documents 
		WHERE user_id = $1 AND document_type = 'ghana_card'
	`, ghanaUserID).Scan(&encDoc, &hashDoc, &issuingCountry)
	require.NoError(t, err)
	assert.Equal(t, "GH", issuingCountry)
	decDoc, err := vault.Decrypt(encDoc)
	require.NoError(t, err)
	assert.Equal(t, testGhanaCard, decDoc)
	assert.Equal(t, vault.BlindIndex(testGhanaCard), hashDoc)

	// 2. Test Kenya User: KRA PIN Verification & PEP/Sanctions screening
	kenyaPublicID := crypto.GeneratePublicID("usr")
	var kenyaUserID int64
	err = pool.QueryRow(ctx, `
		INSERT INTO users (public_id, email, password_hash, user_type, country_code, nationality, kyc_tier, kyc_status, account_status)
		VALUES ($1, $2, 'hash_test_ke', 'individual', 'KE', 'KE', 0, 'unverified', 'active')
		RETURNING id
	`, kenyaPublicID, "kenya_"+kenyaPublicID+"@chipa.test").Scan(&kenyaUserID)
	require.NoError(t, err)
	defer func() { _, _ = pool.Exec(ctx, "DELETE FROM users WHERE id = $1", kenyaUserID) }()

	_, err = pool.Exec(ctx, "INSERT INTO user_profiles (user_id, first_name, last_name, nationality) VALUES ($1, 'Jomo', 'Kamau', 'KE')", kenyaUserID)
	require.NoError(t, err)
	_, err = pool.Exec(ctx, "INSERT INTO user_verifications (user_id) VALUES ($1)", kenyaUserID)
	require.NoError(t, err)

	testKRAPIN := "A012345678X"
	keStatus, err := kycSvc.SubmitTier1PanAfrican(ctx, kenyaUserID, fintech.Tier1Payload{
		CountryCode:  "KE",
		DocumentType: "kra_pin",
		IDNumber:     testKRAPIN,
	})
	require.NoError(t, err)
	assert.Equal(t, 1, keStatus.CurrentTier)
	assert.Equal(t, "KE", keStatus.CountryCode)
	assert.True(t, keStatus.Verifications.NationalIDVerified)
	assert.True(t, keStatus.Verifications.TaxIDVerified)

	// Update AML / PEP compliance screening
	err = kycSvc.UpdateComplianceProfile(ctx, kenyaUserID, false, "clear", testKRAPIN)
	require.NoError(t, err)

	refreshedKE, err := kycSvc.GetKYCStatus(ctx, kenyaUserID)
	require.NoError(t, err)
	assert.False(t, refreshedKE.IsPEP)
	assert.Equal(t, "clear", refreshedKE.Sanctions)
	assert.Equal(t, testKRAPIN, refreshedKE.TaxID)

	// 3. Test Mobile Money payment account rail insertion
	var finAccID string
	err = pool.QueryRow(ctx, `
		INSERT INTO financial_accounts (public_id, user_id, currency, asset_type)
		VALUES ($1, $2, 'KES', 'fiat')
		RETURNING id
	`, crypto.GeneratePublicID("fac"), kenyaUserID).Scan(&finAccID)
	require.NoError(t, err)

	var paymentAccID string
	err = pool.QueryRow(ctx, `
		INSERT INTO payment_accounts (
			financial_account_id, user_id, account_type, provider, network,
			account_name, account_number, status
		) VALUES (
			$1, $2, 'mobile_money', 'smile_id', 'mpesa',
			'Jomo Kamau M-Pesa', '+254712345678', 'active'
		) RETURNING id
	`, finAccID, kenyaUserID).Scan(&paymentAccID)
	require.NoError(t, err)
	assert.NotEmpty(t, paymentAccID)

	// Verify payment account stored correctly
	var accType, network, prov string
	err = pool.QueryRow(ctx, `
		SELECT account_type, network, provider 
		FROM payment_accounts 
		WHERE id = $1
	`, paymentAccID).Scan(&accType, &network, &prov)
	require.NoError(t, err)
	assert.Equal(t, "mobile_money", accType)
	assert.Equal(t, "mpesa", network)
	assert.Equal(t, "smile_id", prov)
}

