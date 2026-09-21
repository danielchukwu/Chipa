-- +goose Up
-- Enable pgcrypto / uuid-ossp for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. FINANCIAL ACCOUNTS (Multi-Currency Materialized Balances in Minor Units)
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(32) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(10) NOT NULL, -- 'NGN', 'USD', 'EUR', 'GBP', 'AED', 'AUD', 'KWD', 'USDC'
  asset_type VARCHAR(20) NOT NULL DEFAULT 'fiat', -- 'fiat', 'stablecoin'
  asset_network VARCHAR(50), -- NULL for fiat, 'solana', 'base', 'polygon', 'ethereum' for crypto
  available_balance_minor BIGINT NOT NULL DEFAULT 0, -- In kobo, cents, etc.
  ledger_balance_minor BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'pending', 'active', 'frozen', 'closed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, currency, asset_type, asset_network)
);

CREATE INDEX IF NOT EXISTS idx_financial_accounts_user_id ON financial_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_accounts_currency ON financial_accounts(currency);

-- ============================================================================
-- 2. PAYMENT ACCOUNTS (BaaS, Banks & Mobile Money: Bridge, Paystack, M-Pesa, Wave)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_type VARCHAR(30) NOT NULL DEFAULT 'bank_account' CHECK (account_type IN ('bank_account', 'mobile_money', 'crypto_wallet')),
  provider VARCHAR(50) NOT NULL, -- 'bridge', 'paystack', 'monnify', 'smile_id'
  network VARCHAR(50), -- 'mpesa', 'mtn_momo', 'airtel_money', 'orange_money', 'wave', 'ach', 'wire', 'sepa', 'faster_payments'
  provider_account_id VARCHAR(255),
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100),
  bank_name VARCHAR(100),
  -- Bridge.xyz USD specific
  routing_number VARCHAR(50), -- ACH / Fedwire ABA routing number
  -- Bridge.xyz GBP specific
  sort_code VARCHAR(20), -- UK 6-digit sort code
  -- Bridge.xyz EUR specific
  iban VARCHAR(50), -- European SEPA IBAN
  bic_swift VARCHAR(20), -- SWIFT BIC code
  -- Bridge.xyz Stablecoin specific
  deposit_address VARCHAR(255), -- Multi-chain USDC address
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_accounts_financial_account_id ON payment_accounts(financial_account_id);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_user_id ON payment_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_account_number ON payment_accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_account_type ON payment_accounts(account_type);

-- ============================================================================
-- 3. DOUBLE-ENTRY LEDGER ACCOUNTS (System & Customer Balance Anchors)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ledger_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financial_account_id UUID REFERENCES financial_accounts(id) ON DELETE CASCADE,
  account_type VARCHAR(30) NOT NULL, -- 'customer', 'settlement', 'fee_revenue', 'partner_clearing', 'reserve'
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_accounts_financial_account ON ledger_accounts(financial_account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_accounts_type_currency ON ledger_accounts(account_type, currency);

-- ============================================================================
-- 4. LEDGER TRANSACTIONS (Transaction Header Record)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ledger_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_reference VARCHAR(64) UNIQUE NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'transfer', 'fx_swap', 'card_funding', 'card_spend', 'bill_payment', 'fee'
  status VARCHAR(20) NOT NULL DEFAULT 'posted', -- 'pending', 'posted', 'reversed', 'failed'
  currency VARCHAR(10) NOT NULL,
  idempotency_key VARCHAR(128) UNIQUE,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_transactions_ref ON ledger_transactions(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_ledger_transactions_idempotency ON ledger_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_ledger_transactions_type ON ledger_transactions(transaction_type);

-- ============================================================================
-- 5. LEDGER ENTRIES (Immutable Lines: SUM(debits) must equal SUM(credits))
-- ============================================================================
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_transaction_id UUID NOT NULL REFERENCES ledger_transactions(id) ON DELETE CASCADE,
  ledger_account_id UUID NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('debit', 'credit')),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction_id ON ledger_entries(ledger_transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account_id ON ledger_entries(ledger_account_id);

-- ============================================================================
-- 6. MULTI-CURRENCY CARDS (Virtual & Physical Visa / Mastercard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(32) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  financial_account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
  provider VARCHAR(50) NOT NULL DEFAULT 'bridge', -- 'bridge', 'sandbox'
  provider_card_id VARCHAR(255),
  card_type VARCHAR(20) NOT NULL DEFAULT 'virtual', -- 'virtual', 'physical'
  scheme VARCHAR(20) NOT NULL DEFAULT 'visa', -- 'visa', 'mastercard'
  brand VARCHAR(50) NOT NULL DEFAULT 'Visa Platinum',
  name_on_card VARCHAR(100) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  last4 CHAR(4) NOT NULL,
  expiry_month SMALLINT NOT NULL,
  expiry_year SMALLINT NOT NULL,
  spending_limit_minor BIGINT NOT NULL DEFAULT 50000000, -- 500k default
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'frozen', 'terminated'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);

-- ============================================================================
-- 7. KYC COMPLIANCE CASES (Progressive Tiers 0-3 with Audit Logs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS kyc_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier SMALLINT NOT NULL DEFAULT 0, -- 0: Explorer, 1: BVN/NIN, 2: ID+Liveness, 3: Address
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'in_review', 'verified', 'rejected'
  provider VARCHAR(50), -- 'paystack', 'bridge', 'smile_id', 'monnify'
  provider_reference VARCHAR(255),
  document_type VARCHAR(50), -- 'bvn', 'nin', 'passport', 'drivers_license', 'utility_bill'
  verification_data JSONB DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_cases_user_tier ON kyc_cases(user_id, tier);

-- +goose Down
DROP TABLE IF EXISTS kyc_cases CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS ledger_entries CASCADE;
DROP TABLE IF EXISTS ledger_transactions CASCADE;
DROP TABLE IF EXISTS ledger_accounts CASCADE;
DROP TABLE IF EXISTS payment_accounts CASCADE;
DROP TABLE IF EXISTS financial_accounts CASCADE;
