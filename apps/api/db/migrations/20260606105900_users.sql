-- +goose Up

-- ============================================================================
-- 1. USERS TABLE (Core Authentication, Credentials & Account State)
-- Strictly minimal, high security. Decoupled from legal PII and unencrypted PII.
-- ============================================================================
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(25) UNIQUE,
  username VARCHAR(30) UNIQUE,

  password_hash VARCHAR(100) NOT NULL,
  pin_hash VARCHAR(100),

  -- Fintech Account Classification (Individual vs Business)
  user_type VARCHAR(20) NOT NULL DEFAULT 'individual'
    CHECK (user_type IN ('individual', 'business')),
  country_code VARCHAR(2) NOT NULL DEFAULT 'NG',
  nationality VARCHAR(2) DEFAULT 'NG',
  timezone VARCHAR(50) DEFAULT 'Africa/Lagos',

  -- Reference Jurisdiction
  current_country SMALLINT REFERENCES c_countries(id) DEFAULT 161,
  current_state SMALLINT REFERENCES c_states(id),

  -- Progressive Compliance Tier (0: Explorer, 1: BVN/NIN, 2: ID+Liveness, 3: Address)
  kyc_tier SMALLINT DEFAULT 0,
  kyc_status VARCHAR(30) DEFAULT 'unverified'
    CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),

  account_status VARCHAR(30) NOT NULL DEFAULT 'just_registered'
    CHECK (account_status IN (
      'just_registered',
      'placeholder',
      'active',
      'inactive',
      'suspended',
      'banned',
      'deleted'
    )),

  -- Referral system
  referral_code VARCHAR(30) UNIQUE,

  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_users_public_id ON users(public_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_country_code ON users(country_code);

-- ============================================================================
-- 2. USER PROFILES (Decoupled Legal PII: SOC 2 & GDPR Isolation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL DEFAULT '',
  last_name VARCHAR(50) NOT NULL DEFAULT '',
  middle_name VARCHAR(50),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  nationality VARCHAR(2) NOT NULL DEFAULT 'NG',
  avatar_url TEXT,
  profile_photo_url TEXT,
  avatar_file_id BIGINT,
  employment_status VARCHAR(30),
  employer_name VARCHAR(255),
  annual_income_range VARCHAR(50),
  occupation VARCHAR(100),
  -- AML / CFT / Sanctions & PEP Compliance Screening
  is_pep BOOLEAN NOT NULL DEFAULT false,
  sanctions_status VARCHAR(20) NOT NULL DEFAULT 'clear' CHECK (sanctions_status IN ('clear', 'flagged', 'blocked')),
  tax_id VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. NORMALIZED ADDRESSES (Residential, Business & Delivery)
-- ============================================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_type VARCHAR(20) NOT NULL DEFAULT 'residential' CHECK (address_type IN ('residential', 'business', 'mailing')),
  line_1 VARCHAR(255) NOT NULL,
  line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country_code VARCHAR(2) NOT NULL DEFAULT 'NG',
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ============================================================================
-- 4. ENCRYPTED IDENTITY VAULT (AES-256-GCM + Blind Index for Pan-African IDs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(30) NOT NULL CHECK (document_type IN (
    'bvn', 'nin', 'ghana_card', 'ssnit', 'kra_pin', 'huduma_namba',
    'sa_id', 'national_id', 'passport', 'drivers_license', 'voters_card',
    'tax_id', 'residence_permit'
  )),
  document_number_encrypted BYTEA NOT NULL,
  document_number_hash CHAR(64) NOT NULL,
  document_file_id BIGINT,
  selfie_file_id BIGINT,
  issuing_country VARCHAR(2) NOT NULL DEFAULT 'NG',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, document_type, issuing_country)
);

CREATE INDEX IF NOT EXISTS idx_identity_documents_hash ON identity_documents(document_type, document_number_hash);
CREATE INDEX IF NOT EXISTS idx_identity_documents_user_id ON identity_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_documents_country ON identity_documents(issuing_country);

-- ============================================================================
-- 5. DEVICE SECURITY (Fingerprinting & Account Takeover Prevention)
-- ============================================================================
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint_hash CHAR(64) NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web', 'unknown')),
  device_name VARCHAR(100),
  is_trusted BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint_hash)
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

-- ============================================================================
-- 6. SESSIONS (Remote Revocation & Active Session Management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  token_hash CHAR(64) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

-- ============================================================================
-- 7. USER VERIFICATIONS (Channel & Compliance Verification Audit Flags)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_verifications (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  -- Region-agnostic compliance audit flags
  national_id_verified BOOLEAN DEFAULT false,
  tax_id_verified BOOLEAN DEFAULT false,
  liveness_verified BOOLEAN DEFAULT false,
  id_document_verified BOOLEAN DEFAULT false,
  address_verified BOOLEAN DEFAULT false,
  -- Legacy Nigerian specific audit flags (maintained for backward compatibility)
  bvn_verified BOOLEAN DEFAULT false,
  nin_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255) DEFAULT NULL,
  email_last_reminded_at TIMESTAMPTZ,
  phone_last_reminded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_verifications_national_id ON user_verifications(national_id_verified);
CREATE INDEX IF NOT EXISTS idx_user_verifications_nin_verified ON user_verifications(nin_verified);
CREATE INDEX IF NOT EXISTS idx_user_verifications_phone_verified ON user_verifications(phone_verified);
CREATE INDEX IF NOT EXISTS idx_user_verifications_email_verified ON user_verifications(email_verified);
CREATE INDEX IF NOT EXISTS idx_user_verifications_bvn_verified ON user_verifications(bvn_verified);

-- ============================================================================
-- 8. ORGANIZATIONS & TEAMS (Multi-Tenancy for Freelancers & Businesses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(32) UNIQUE NOT NULL, -- e.g. "org_..."
  name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  country_code VARCHAR(2) NOT NULL DEFAULT 'NG',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'finance', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);

-- +goose Down
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS identity_documents CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_verifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;
