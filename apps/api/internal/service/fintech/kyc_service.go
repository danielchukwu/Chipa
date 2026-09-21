package fintech

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"chipa/api/internal/crypto"
	"chipa/api/internal/provider/paystack"

	"github.com/jackc/pgx/v5/pgxpool"
)

type KYCTierInfo struct {
	Tier        int      `json:"tier"`
	Name        string   `json:"name"`
	DailyLimit  float64  `json:"daily_limit"`
	Currency    string   `json:"currency"`
	Features    []string `json:"features"`
	IsUnlocked  bool     `json:"is_unlocked"`
	Requirement string   `json:"requirement"`
}

type VerificationsSummary struct {
	EmailVerified      bool `json:"email_verified"`
	PhoneVerified      bool `json:"phone_verified"`
	NationalIDVerified bool `json:"national_id_verified"`
	TaxIDVerified      bool `json:"tax_id_verified"`
	LivenessVerified   bool `json:"liveness_verified"`
	IDDocumentVerified bool `json:"id_document_verified"`
	AddressVerified    bool `json:"address_verified"`
	BVNVerified        bool `json:"bvn_verified"`
	NINVerified        bool `json:"nin_verified"`
}

type KYCStatusResponse struct {
	CurrentTier   int                  `json:"current_tier"`
	Status        string               `json:"status"` // unverified, pending, verified
	CountryCode   string               `json:"country_code,omitempty"`
	BVN           string               `json:"bvn,omitempty"`
	NIN           string               `json:"nin,omitempty"`
	NationalID    string               `json:"national_id,omitempty"`
	TaxID         string               `json:"tax_id,omitempty"`
	IsPEP         bool                 `json:"is_pep"`
	Sanctions     string               `json:"sanctions_status"`
	Verifications VerificationsSummary `json:"verifications"`
	Tiers         []KYCTierInfo        `json:"tiers"`
	UpdatedAt     time.Time            `json:"updated_at"`
}

type Tier1Payload struct {
	CountryCode  string `json:"country_code"`  // "NG", "GH", "KE", "ZA", "RW", "UG", etc. Default "NG"
	DocumentType string `json:"document_type"` // "bvn", "nin", "ghana_card", "ssnit", "kra_pin", "huduma_namba", "sa_id", "national_id"
	IDNumber     string `json:"id_number"`
	BVN          string `json:"bvn,omitempty"`
	NIN          string `json:"nin,omitempty"`
}

type KYCService struct {
	pool           *pgxpool.Pool
	paystackClient *paystack.PaystackClient
	vault          *crypto.Vault
}

func NewKYCService(pool *pgxpool.Pool, paystackClient *paystack.PaystackClient, vault ...*crypto.Vault) *KYCService {
	var v *crypto.Vault
	if len(vault) > 0 && vault[0] != nil {
		v = vault[0]
	} else {
		v = crypto.NewVault()
	}
	return &KYCService{
		pool:           pool,
		paystackClient: paystackClient,
		vault:          v,
	}
}

func (s *KYCService) GetKYCStatus(ctx context.Context, userID int64) (*KYCStatusResponse, error) {
	currentTier := 0
	status := "unverified"
	countryCode := "NG"
	var isPEP bool
	sanctionsStatus := "clear"
	var taxID string
	var bvn, nin, nationalID string
	var verif VerificationsSummary

	if s.pool != nil {
		_ = s.pool.QueryRow(ctx, `
			SELECT COALESCE(kyc_tier, 0), COALESCE(kyc_status, 'unverified'), COALESCE(country_code, 'NG')
			FROM users WHERE id = $1
		`, userID).Scan(&currentTier, &status, &countryCode)

		// Read compliance & AML profile
		_ = s.pool.QueryRow(ctx, `
			SELECT COALESCE(is_pep, false), COALESCE(sanctions_status, 'clear'), COALESCE(tax_id, '')
			FROM user_profiles WHERE user_id = $1
		`, userID).Scan(&isPEP, &sanctionsStatus, &taxID)

		// Read verification audit flags
		_ = s.pool.QueryRow(ctx, `
			SELECT 
				COALESCE(email_verified, false),
				COALESCE(phone_verified, false),
				COALESCE(national_id_verified, false),
				COALESCE(tax_id_verified, false),
				COALESCE(liveness_verified, false),
				COALESCE(id_document_verified, false),
				COALESCE(address_verified, false),
				COALESCE(bvn_verified, false),
				COALESCE(nin_verified, false)
			FROM user_verifications WHERE user_id = $1
		`, userID).Scan(
			&verif.EmailVerified,
			&verif.PhoneVerified,
			&verif.NationalIDVerified,
			&verif.TaxIDVerified,
			&verif.LivenessVerified,
			&verif.IDDocumentVerified,
			&verif.AddressVerified,
			&verif.BVNVerified,
			&verif.NINVerified,
		)

		// Read from encrypted identity documents vault
		if s.vault != nil {
			rows, err := s.pool.Query(ctx, `
				SELECT document_type, document_number_encrypted 
				FROM identity_documents 
				WHERE user_id = $1
			`, userID)
			if err == nil {
				defer rows.Close()
				for rows.Next() {
					var docType string
					var encBytes []byte
					if scanErr := rows.Scan(&docType, &encBytes); scanErr == nil && len(encBytes) > 0 {
						dec, decErr := s.vault.Decrypt(encBytes)
						if decErr == nil {
							switch docType {
							case "bvn":
								bvn = dec
							case "nin":
								nin = dec
							default:
								if nationalID == "" {
									nationalID = dec
								}
							}
						}
					}
				}
			}
		}
	}

	currencyCode := "NGN"
	switch countryCode {
	case "GH":
		currencyCode = "GHS"
	case "KE":
		currencyCode = "KES"
	case "ZA":
		currencyCode = "ZAR"
	case "RW":
		currencyCode = "RWF"
	case "UG":
		currencyCode = "UGX"
	}

	tiers := []KYCTierInfo{
		{
			Tier:        0,
			Name:        "Tier 0: Explorer",
			DailyLimit:  50000.00,
			Currency:    currencyCode,
			Features:    []string{"Local Transfers & Mobile Money", "Bill Payments (Airtime, Utilities)"},
			IsUnlocked:  true,
			Requirement: "Email & Phone verification",
		},
		{
			Tier:        1,
			Name:        "Tier 1: Pan-African Basic Identity",
			DailyLimit:  500000.00,
			Currency:    currencyCode,
			Features:    []string{"Higher Local Limits", "Card Funding & Mobile Money Cash-In"},
			IsUnlocked:  currentTier >= 1,
			Requirement: "National Identity Number (BVN/NIN for NG, Ghana Card for GH, KRA PIN for KE, SA ID for ZA)",
		},
		{
			Tier:        2,
			Name:        "Tier 2: Global Verified Resident",
			DailyLimit:  5000.00,
			Currency:    "USD",
			Features:    []string{"USD Virtual Account (ACH/Wire)", "EUR & GBP Accounts", "Virtual Visa/Mastercard Issuance"},
			IsUnlocked:  currentTier >= 2,
			Requirement: "Government Issued Photo ID (Passport/National ID) + Facial Liveness",
		},
		{
			Tier:        3,
			Name:        "Tier 3: Enhanced Enterprise / High Net Worth",
			DailyLimit:  50000.00,
			Currency:    "USD",
			Features:    []string{"Unlimited Cross-Border FX Swaps", "Higher Card Limits", "Institutional Bridge Rails"},
			IsUnlocked:  currentTier >= 3,
			Requirement: "Proof of Address (Utility Bill / Bank Statement < 3 months)",
		},
	}

	// Mask BVN/NIN/National ID for safe display
	maskedBVN := ""
	if len(bvn) >= 4 {
		maskedBVN = fmt.Sprintf("•••••••%s", bvn[len(bvn)-4:])
	}
	maskedNIN := ""
	if len(nin) >= 4 {
		maskedNIN = fmt.Sprintf("•••••••%s", nin[len(nin)-4:])
	}
	maskedNationalID := ""
	if len(nationalID) >= 4 {
		maskedNationalID = fmt.Sprintf("•••••••%s", nationalID[len(nationalID)-4:])
	}

	return &KYCStatusResponse{
		CurrentTier:   currentTier,
		Status:        status,
		CountryCode:   countryCode,
		BVN:           maskedBVN,
		NIN:           maskedNIN,
		NationalID:    maskedNationalID,
		TaxID:         taxID,
		IsPEP:         isPEP,
		Sanctions:     sanctionsStatus,
		Verifications: verif,
		Tiers:         tiers,
		UpdatedAt:     time.Now(),
	}, nil
}

// SubmitTier1 maintains 100% backward compatibility for Nigerian callers
func (s *KYCService) SubmitTier1(ctx context.Context, userID int64, bvn, nin string) (*KYCStatusResponse, error) {
	return s.SubmitTier1PanAfrican(ctx, userID, Tier1Payload{
		CountryCode: "NG",
		BVN:         bvn,
		NIN:         nin,
	})
}

// SubmitTier1PanAfrican validates and encrypts identity credentials across African jurisdictions
func (s *KYCService) SubmitTier1PanAfrican(ctx context.Context, userID int64, payload Tier1Payload) (*KYCStatusResponse, error) {
	countryCode := strings.ToUpper(strings.TrimSpace(payload.CountryCode))
	if countryCode == "" {
		countryCode = "NG"
	}

	bvn := strings.TrimSpace(payload.BVN)
	nin := strings.TrimSpace(payload.NIN)
	docType := strings.ToLower(strings.TrimSpace(payload.DocumentType))
	idNum := strings.TrimSpace(payload.IDNumber)

	// If generic IDNumber provided without explicit docType, infer from country
	if idNum != "" && docType == "" {
		switch countryCode {
		case "NG":
			docType = "bvn"
		case "GH":
			docType = "ghana_card"
		case "KE":
			docType = "kra_pin"
		case "ZA":
			docType = "sa_id"
		default:
			docType = "national_id"
		}
	}

	// Normalize docType
	switch docType {
	case "bvn":
		if bvn == "" {
			bvn = idNum
		}
	case "nin":
		if nin == "" {
			nin = idNum
		}
	case "ghana_card", "ghanacard":
		docType = "ghana_card"
	case "ssnit":
		docType = "ssnit"
	case "kra_pin", "krapin", "kra":
		docType = "kra_pin"
	case "huduma_namba", "huduma":
		docType = "huduma_namba"
	case "sa_id", "said":
		docType = "sa_id"
	case "tax_id":
		docType = "tax_id"
	case "":
		// If both bvn and nin empty and no idNum
		if bvn == "" && nin == "" && idNum == "" {
			return nil, fmt.Errorf("identity document details must be provided")
		}
	default:
		docType = "national_id"
	}

	// Country specific validation
	switch countryCode {
	case "NG":
		if bvn == "" && nin == "" {
			return nil, fmt.Errorf("either BVN or NIN must be provided for Nigeria")
		}
		if bvn != "" && len(bvn) != 11 {
			return nil, fmt.Errorf("BVN must be exactly 11 digits")
		}
		if nin != "" && len(nin) != 11 {
			return nil, fmt.Errorf("NIN must be exactly 11 digits")
		}
		if s.paystackClient != nil && bvn != "" {
			valid, err := s.paystackClient.ValidateBVN(ctx, bvn, "", "", "")
			if err != nil || !valid {
				return nil, fmt.Errorf("BVN verification failed: %w", err)
			}
		}
	case "GH":
		if idNum == "" {
			return nil, fmt.Errorf("Ghana Card or SSNIT ID number is required")
		}
		if len(idNum) < 8 || len(idNum) > 20 {
			return nil, fmt.Errorf("invalid Ghana identity document number format")
		}
	case "KE":
		if idNum == "" {
			return nil, fmt.Errorf("KRA PIN or Kenyan National ID is required")
		}
		if len(idNum) < 7 || len(idNum) > 15 {
			return nil, fmt.Errorf("invalid Kenyan identity document number format")
		}
	case "ZA":
		if idNum == "" {
			return nil, fmt.Errorf("South African ID or Tax Number is required")
		}
		if docType == "sa_id" && len(idNum) != 13 {
			return nil, fmt.Errorf("South African ID must be exactly 13 digits")
		}
	default:
		if idNum == "" && bvn == "" && nin == "" {
			return nil, fmt.Errorf("national identity document number is required")
		}
		if idNum != "" && (len(idNum) < 5 || len(idNum) > 30) {
			return nil, fmt.Errorf("invalid document number format")
		}
	}

	if s.pool != nil && s.vault != nil {
		// Persist BVN if provided
		if bvn != "" {
			encBVN, err := s.vault.Encrypt(bvn)
			if err != nil {
				return nil, fmt.Errorf("failed to encrypt BVN: %w", err)
			}
			hashBVN := s.vault.BlindIndex(bvn)
			_, err = s.pool.Exec(ctx, `
				INSERT INTO identity_documents (user_id, document_type, document_number_encrypted, document_number_hash, issuing_country, status, verified_at)
				VALUES ($1, 'bvn', $2, $3, 'NG', 'verified', NOW())
				ON CONFLICT (user_id, document_type, issuing_country) DO UPDATE
				SET document_number_encrypted = EXCLUDED.document_number_encrypted,
				    document_number_hash = EXCLUDED.document_number_hash,
				    status = 'verified',
				    verified_at = NOW(),
				    updated_at = NOW()
			`, userID, encBVN, hashBVN)
			if err != nil {
				return nil, fmt.Errorf("failed to persist encrypted BVN: %w", err)
			}
		}

		// Persist NIN if provided
		if nin != "" {
			encNIN, err := s.vault.Encrypt(nin)
			if err != nil {
				return nil, fmt.Errorf("failed to encrypt NIN: %w", err)
			}
			hashNIN := s.vault.BlindIndex(nin)
			_, err = s.pool.Exec(ctx, `
				INSERT INTO identity_documents (user_id, document_type, document_number_encrypted, document_number_hash, issuing_country, status, verified_at)
				VALUES ($1, 'nin', $2, $3, 'NG', 'verified', NOW())
				ON CONFLICT (user_id, document_type, issuing_country) DO UPDATE
				SET document_number_encrypted = EXCLUDED.document_number_encrypted,
				    document_number_hash = EXCLUDED.document_number_hash,
				    status = 'verified',
				    verified_at = NOW(),
				    updated_at = NOW()
			`, userID, encNIN, hashNIN)
			if err != nil {
				return nil, fmt.Errorf("failed to persist encrypted NIN: %w", err)
			}
		}

		// Persist Non-Nigerian / Other African National ID if provided
		if idNum != "" && docType != "bvn" && docType != "nin" {
			encID, err := s.vault.Encrypt(idNum)
			if err != nil {
				return nil, fmt.Errorf("failed to encrypt identity document: %w", err)
			}
			hashID := s.vault.BlindIndex(idNum)
			_, err = s.pool.Exec(ctx, `
				INSERT INTO identity_documents (user_id, document_type, document_number_encrypted, document_number_hash, issuing_country, status, verified_at)
				VALUES ($1, $2, $3, $4, $5, 'verified', NOW())
				ON CONFLICT (user_id, document_type, issuing_country) DO UPDATE
				SET document_number_encrypted = EXCLUDED.document_number_encrypted,
				    document_number_hash = EXCLUDED.document_number_hash,
				    status = 'verified',
				    verified_at = NOW(),
				    updated_at = NOW()
			`, userID, docType, encID, hashID, countryCode)
			if err != nil {
				return nil, fmt.Errorf("failed to persist encrypted identity document: %w", err)
			}

			// If tax ID provided, store in user_profiles
			if docType == "tax_id" || docType == "kra_pin" {
				_, _ = s.pool.Exec(ctx, `
					UPDATE user_profiles SET tax_id = $2, updated_at = NOW() WHERE user_id = $1
				`, userID, idNum)
			}
		}

		// Update user_verifications audit flags (both generic and legacy)
		_, _ = s.pool.Exec(ctx, `
			INSERT INTO user_verifications (user_id, national_id_verified, tax_id_verified, bvn_verified, nin_verified, updated_at)
			VALUES ($1, true, $2, $3, $4, NOW())
			ON CONFLICT (user_id) DO UPDATE
			SET national_id_verified = true,
			    tax_id_verified = CASE WHEN $2 THEN true ELSE user_verifications.tax_id_verified END,
			    bvn_verified = CASE WHEN $3 THEN true ELSE user_verifications.bvn_verified END,
			    nin_verified = CASE WHEN $4 THEN true ELSE user_verifications.nin_verified END,
			    updated_at = NOW()
		`, userID, docType == "tax_id" || docType == "kra_pin", bvn != "", nin != "")

		// Determine provider for audit case
		complianceProvider := "paystack"
		if countryCode != "NG" {
			complianceProvider = "smile_id"
		}
		auditDoc := docType
		if auditDoc == "" {
			if bvn != "" {
				auditDoc = "bvn"
			} else {
				auditDoc = "nin"
			}
		}

		// Log compliance audit case
		_, _ = s.pool.Exec(ctx, `
			INSERT INTO kyc_cases (user_id, tier, status, provider, document_type, verified_at)
			VALUES ($1, 1, 'verified', $2, $3, NOW())
		`, userID, complianceProvider, auditDoc)

		// Upgrade user tier in core users table and persist country_code
		_, err := s.pool.Exec(ctx, `
			UPDATE users 
			SET kyc_tier = GREATEST(kyc_tier, 1),
			    kyc_status = 'verified',
			    country_code = $2,
			    updated_at = NOW()
			WHERE id = $1
		`, userID, countryCode)
		if err != nil {
			return nil, fmt.Errorf("failed to update user KYC tier: %w", err)
		}
	}

	return s.GetKYCStatus(ctx, userID)
}

func (s *KYCService) SubmitTier2(ctx context.Context, userID int64, docType, docNumber, docFileID, selfieFileID string, countryCodeOpt ...string) (*KYCStatusResponse, error) {
	if docType == "" || docNumber == "" {
		return nil, fmt.Errorf("document type and document number are required")
	}

	countryCode := "NG"
	if len(countryCodeOpt) > 0 && countryCodeOpt[0] != "" {
		countryCode = strings.ToUpper(strings.TrimSpace(countryCodeOpt[0]))
	}

	// Normalize document type for identity_documents check constraint
	normalizedType := strings.ToLower(strings.TrimSpace(docType))
	switch normalizedType {
	case "passport":
		normalizedType = "passport"
	case "nin":
		normalizedType = "nin"
	case "driver_license", "drivers_license", "driver":
		normalizedType = "drivers_license"
	case "voters_card", "voter_card", "voter":
		normalizedType = "voters_card"
	case "ghana_card":
		normalizedType = "ghana_card"
	case "kra_pin":
		normalizedType = "kra_pin"
	case "sa_id":
		normalizedType = "sa_id"
	case "residence_permit", "permit":
		normalizedType = "residence_permit"
	default:
		normalizedType = "national_id"
	}

	if s.pool != nil {
		if s.vault != nil {
			encDoc, err := s.vault.Encrypt(docNumber)
			if err != nil {
				return nil, fmt.Errorf("failed to encrypt document number: %w", err)
			}
			hashDoc := s.vault.BlindIndex(docNumber)

			var dFileID, sFileID *int64
			if id, err := strconv.ParseInt(docFileID, 10, 64); err == nil {
				dFileID = &id
			}
			if id, err := strconv.ParseInt(selfieFileID, 10, 64); err == nil {
				sFileID = &id
			}

			_, err = s.pool.Exec(ctx, `
				INSERT INTO identity_documents (user_id, document_type, document_number_encrypted, document_number_hash, document_file_id, selfie_file_id, issuing_country, status, verified_at)
				VALUES ($1, $2, $3, $4, $5, $6, $7, 'verified', NOW())
				ON CONFLICT (user_id, document_type, issuing_country) DO UPDATE
				SET document_number_encrypted = EXCLUDED.document_number_encrypted,
				    document_number_hash = EXCLUDED.document_number_hash,
				    document_file_id = COALESCE(EXCLUDED.document_file_id, identity_documents.document_file_id),
				    selfie_file_id = COALESCE(EXCLUDED.selfie_file_id, identity_documents.selfie_file_id),
				    status = 'verified',
				    verified_at = NOW(),
				    updated_at = NOW()
			`, userID, normalizedType, encDoc, hashDoc, dFileID, sFileID, countryCode)
			if err != nil {
				return nil, fmt.Errorf("failed to persist encrypted identity document: %w", err)
			}
		}

		// Update user_verifications audit flags
		_, _ = s.pool.Exec(ctx, `
			INSERT INTO user_verifications (user_id, id_document_verified, liveness_verified, updated_at)
			VALUES ($1, true, true, NOW())
			ON CONFLICT (user_id) DO UPDATE
			SET id_document_verified = true,
			    liveness_verified = true,
			    updated_at = NOW()
		`, userID)

		complianceProvider := "bridge"
		if countryCode != "US" && countryCode != "GB" && countryCode != "EU" {
			complianceProvider = "smile_id"
		}

		_, _ = s.pool.Exec(ctx, `
			INSERT INTO kyc_cases (user_id, tier, status, provider, document_type, verified_at)
			VALUES ($1, 2, 'verified', $2, $3, NOW())
		`, userID, complianceProvider, normalizedType)

		_, err := s.pool.Exec(ctx, `
			UPDATE users 
			SET kyc_tier = GREATEST(kyc_tier, 2),
			    kyc_status = 'verified',
			    updated_at = NOW()
			WHERE id = $1
		`, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to upgrade to Tier 2: %w", err)
		}
	}

	return s.GetKYCStatus(ctx, userID)
}

func (s *KYCService) SubmitTier3(ctx context.Context, userID int64, utilityBillFileID, address, city, state string, countryCodeOpt ...string) (*KYCStatusResponse, error) {
	if address == "" || city == "" {
		return nil, fmt.Errorf("residential address and city are required")
	}

	countryCode := "NG"
	if len(countryCodeOpt) > 0 && countryCodeOpt[0] != "" {
		countryCode = strings.ToUpper(strings.TrimSpace(countryCodeOpt[0]))
	}

	if s.pool != nil {
		// Persist normalized address record
		_, err := s.pool.Exec(ctx, `
			INSERT INTO addresses (user_id, address_type, line_1, city, state, country_code, is_current)
			VALUES ($1, 'residential', $2, $3, $4, $5, true)
		`, userID, address, city, state, countryCode)
		if err != nil {
			return nil, fmt.Errorf("failed to persist address: %w", err)
		}

		// Update user_verifications audit flags
		_, _ = s.pool.Exec(ctx, `
			INSERT INTO user_verifications (user_id, address_verified, updated_at)
			VALUES ($1, true, NOW())
			ON CONFLICT (user_id) DO UPDATE
			SET address_verified = true,
			    updated_at = NOW()
		`, userID)

		_, _ = s.pool.Exec(ctx, `
			INSERT INTO kyc_cases (user_id, tier, status, provider, document_type, verified_at)
			VALUES ($1, 3, 'verified', 'chipa_compliance', 'utility_bill', NOW())
		`, userID)

		_, err = s.pool.Exec(ctx, `
			UPDATE users 
			SET kyc_tier = GREATEST(kyc_tier, 3),
			    updated_at = NOW()
			WHERE id = $1
		`, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to upgrade to Tier 3: %w", err)
		}
	}

	return s.GetKYCStatus(ctx, userID)
}

// UpdateComplianceProfile sets PEP status, sanctions screening results, and tax ID
func (s *KYCService) UpdateComplianceProfile(ctx context.Context, userID int64, isPEP bool, sanctionsStatus, taxID string) error {
	if s.pool == nil {
		return nil
	}
	sanctionsStatus = strings.ToLower(strings.TrimSpace(sanctionsStatus))
	if sanctionsStatus != "clear" && sanctionsStatus != "flagged" && sanctionsStatus != "blocked" {
		sanctionsStatus = "clear"
	}
	_, err := s.pool.Exec(ctx, `
		UPDATE user_profiles
		SET is_pep = $2,
		    sanctions_status = $3,
		    tax_id = CASE WHEN $4 <> '' THEN $4 ELSE tax_id END,
		    updated_at = NOW()
		WHERE user_id = $1
	`, userID, isPEP, sanctionsStatus, taxID)
	return err
}
