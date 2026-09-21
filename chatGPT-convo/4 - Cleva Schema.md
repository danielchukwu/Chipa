> draft out what the schema of cleva that holds their accounts, users and all the other data LOOK LIKE. Ensure it is production grade as the company is indeed production grade

Below is a **production-grade reference schema**, not Cleva’s actual private database schema. Public information indicates Cleva handles users, KYC/KYB, multi-currency accounts, cards, transfers, stablecoins, savings, rewards, and business accounts. Cleva+2

# Production-Grade Cleva-Style Financial Database Schema

The architecture should be **ledger-first**, multi-tenant, auditable, idempotent, and designed so that customer-facing balances are derived from an immutable financial ledger rather than treated as the source of truth.

## 1\. Identity & Users

```
users
-----
id UUID PK
public_id VARCHAR UNIQUE NOT NULL
email CITEXT UNIQUE NOT NULL
phone VARCHAR UNIQUE
password_hash TEXT
status ENUM('pending','active','suspended','closed')
user_type ENUM('individual','business_user')
country_code CHAR(2)
timezone VARCHAR
last_login_at TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
deleted_at TIMESTAMPTZ NULL
```

```
user_profiles
-------------
user_id UUID PK FK users(id)
legal_first_name VARCHAR
legal_middle_name VARCHAR
legal_last_name VARCHAR
date_of_birth DATE
gender VARCHAR
nationality CHAR(2)
residential_address_id UUID
profile_photo_url TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```
user_emails
-----------
id UUID PK
user_id UUID FK users(id)
email CITEXT NOT NULL
is_primary BOOLEAN
is_verified BOOLEAN
verified_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

```
user_phones
-----------
id UUID PK
user_id UUID FK users(id)
phone VARCHAR NOT NULL
country_code CHAR(2)
is_primary BOOLEAN
is_verified BOOLEAN
verified_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

## 2\. Organizations / Business Accounts

A business should not simply be represented as another user. It is a legal entity with users having roles.

```
organizations
-------------
id UUID PK
public_id VARCHAR UNIQUE NOT NULL
legal_name VARCHAR NOT NULL
display_name VARCHAR
entity_type ENUM('individual','company','partnership','ngo',...)
country_of_registration CHAR(2)
registration_number VARCHAR
tax_identifier VARCHAR
status ENUM('pending','active','restricted','suspended','closed')
kyb_status ENUM('not_started','pending','verified','rejected','expired')
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```
organization_members
--------------------
id UUID PK
organization_id UUID FK organizations(id)
user_id UUID FK users(id)
role ENUM(
    'owner',
    'admin',
    'finance',
    'operator',
    'viewer'
)
status ENUM('invited','active','suspended','removed')
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

UNIQUE(organization_id, user_id)
```

```
beneficial_owners
-----------------
id UUID PK
organization_id UUID FK organizations(id)
user_id UUID NULL FK users(id)
legal_name VARCHAR
ownership_percentage DECIMAL(7,4)
control_type VARCHAR
verified BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 3\. Addresses

```
addresses
---------
id UUID PK
user_id UUID NULL
organization_id UUID NULL
address_type ENUM('residential','business','mailing')
line_1 VARCHAR
line_2 VARCHAR
city VARCHAR
state VARCHAR
postal_code VARCHAR
country_code CHAR(2)
is_current BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 4\. KYC / KYB / Compliance

This should be isolated from ordinary profile data because financial compliance data has different retention, access-control and audit requirements.

```
kyc_cases
---------
id UUID PK
user_id UUID FK users(id)
status ENUM(
    'pending',
    'in_review',
    'verified',
    'rejected',
    'expired'
)
provider VARCHAR
provider_reference VARCHAR
risk_level ENUM('low','medium','high')
started_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
expires_at TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```
identity_documents
------------------
id UUID PK
kyc_case_id UUID FK kyc_cases(id)
document_type VARCHAR
country_code CHAR(2)
document_number_encrypted BYTEA
document_number_hash CHAR(64)
storage_key TEXT
issuing_country CHAR(2)
issued_at DATE
expires_at DATE
verification_status VARCHAR
created_at TIMESTAMPTZ
```

Never store raw identity documents directly in the relational database. Store encrypted objects in dedicated secure storage and retain only metadata/reference keys in the DB.

```
kyc_verifications
-----------------
id UUID PK
kyc_case_id UUID FK kyc_cases(id)
verification_type ENUM(
    'identity',
    'liveness',
    'address',
    'sanctions',
    'pep',
    'adverse_media'
)
provider VARCHAR
provider_reference VARCHAR
status VARCHAR
result JSONB
performed_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

For businesses:

```
kyb_cases
---------
id UUID PK
organization_id UUID FK organizations(id)
status VARCHAR
provider VARCHAR
provider_reference VARCHAR
risk_level VARCHAR
started_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 5\. Customer Accounts

Separate the **customer relationship** from actual financial accounts.

```
customer_accounts
-----------------
id UUID PK
public_id VARCHAR UNIQUE NOT NULL
owner_user_id UUID NULL FK users(id)
owner_organization_id UUID NULL FK organizations(id)
account_type ENUM('personal','business')
status ENUM('pending','active','restricted','frozen','closed')
tier VARCHAR
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
closed_at TIMESTAMPTZ NULL
```

## 6\. Currency Accounts

A Cleva-style customer can have USD/EUR/GBP/stablecoin-related balances, so each currency should be independently represented.

```
financial_accounts
------------------
id UUID PK
public_id VARCHAR UNIQUE NOT NULL
customer_account_id UUID FK customer_accounts(id)
currency_code VARCHAR(10)
asset_type ENUM('fiat','stablecoin')
asset_network VARCHAR NULL
status ENUM('pending','active','frozen','closed')

available_balance_minor BIGINT NOT NULL DEFAULT 0
pending_balance_minor BIGINT NOT NULL DEFAULT 0

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

UNIQUE(customer_account_id, currency_code, asset_type, asset_network)
```

However, these balances are **materialized values**.

The authoritative source should be the ledger.

## 7\. Double-Entry Ledger

This is the heart of the system.

```
ledger_accounts
---------------
id UUID PK
financial_account_id UUID NULL FK financial_accounts(id)
account_type ENUM(
    'customer',
    'cash',
    'settlement',
    'fee',
    'revenue',
    'expense',
    'suspense',
    'reserve'
)
currency_code VARCHAR(10)
status VARCHAR
created_at TIMESTAMPTZ
```

```
ledger_transactions
-------------------
id UUID PK
transaction_reference VARCHAR UNIQUE NOT NULL
transaction_type VARCHAR NOT NULL
status ENUM(
    'pending',
    'posted',
    'reversed',
    'failed'
)
currency_code VARCHAR(10)
idempotency_key VARCHAR UNIQUE
description TEXT
metadata JSONB
created_at TIMESTAMPTZ
posted_at TIMESTAMPTZ
```

```
ledger_entries
--------------
id UUID PK
ledger_transaction_id UUID FK ledger_transactions(id)
ledger_account_id UUID FK ledger_accounts(id)

direction ENUM('debit','credit')
amount_minor BIGINT NOT NULL

created_at TIMESTAMPTZ
```

Every posted transaction must balance:

```
SUM(debits) = SUM(credits)
```

Never mutate a posted ledger entry.

Corrections should happen through **reversal transactions**.

## 8\. External Bank / Virtual Account Details

```
payment_accounts
----------------
id UUID PK
financial_account_id UUID FK financial_accounts(id)
provider VARCHAR
provider_account_id VARCHAR
account_number_encrypted BYTEA
account_number_hash CHAR(64)
routing_number_encrypted BYTEA
routing_number_hash CHAR(64)
iban_encrypted BYTEA
bic_swift VARCHAR
status VARCHAR
created_at TIMESTAMPTZ
```

This allows Cleva to abstract different banking/payment partners behind one internal account model.

## 9\. Transactions

The customer-facing transaction is separate from ledger entries.

```
transactions
------------
id UUID PK
public_id VARCHAR UNIQUE
customer_account_id UUID FK customer_accounts(id)

transaction_type ENUM(
    'deposit',
    'withdrawal',
    'transfer',
    'conversion',
    'card_payment',
    'card_refund',
    'fee',
    'savings',
    'reward',
    'stablecoin_deposit',
    'stablecoin_withdrawal'
)

status ENUM(
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'reversed'
)

amount_minor BIGINT
currency_code VARCHAR(10)

fee_minor BIGINT DEFAULT 0
exchange_rate DECIMAL(30,12) NULL

reference VARCHAR UNIQUE
description TEXT
metadata JSONB

created_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
```

## 10\. Transfers

```
transfers
---------
id UUID PK
transaction_id UUID FK transactions(id)
sender_financial_account_id UUID FK financial_accounts(id)
recipient_financial_account_id UUID NULL FK financial_accounts(id)

transfer_type ENUM(
    'internal',
    'bank',
    'international',
    'stablecoin'
)

amount_minor BIGINT
currency_code VARCHAR(10)

provider VARCHAR
provider_reference VARCHAR

status VARCHAR
failure_code VARCHAR NULL
failure_reason TEXT NULL

idempotency_key VARCHAR UNIQUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 11\. Beneficiaries

```
beneficiaries
-------------
id UUID PK
customer_account_id UUID FK customer_accounts(id)
beneficiary_type ENUM('bank','wallet','internal')
name VARCHAR
bank_name VARCHAR
account_number_encrypted BYTEA
account_number_hash CHAR(64)
routing_code_encrypted BYTEA
wallet_address VARCHAR NULL
network VARCHAR NULL
country_code CHAR(2)
status VARCHAR
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 12\. FX / Currency Conversion

```
exchange_rates
--------------
id UUID PK
base_currency VARCHAR(10)
quote_currency VARCHAR(10)
rate DECIMAL(30,12)
provider VARCHAR
effective_at TIMESTAMPTZ
expires_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

```
conversions
-----------
id UUID PK
transaction_id UUID FK transactions(id)
source_account_id UUID FK financial_accounts(id)
destination_account_id UUID FK financial_accounts(id)

source_amount_minor BIGINT
destination_amount_minor BIGINT
exchange_rate DECIMAL(30,12)
fee_minor BIGINT

status VARCHAR
created_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
```

## 13\. Cards

```
cards
-----
id UUID PK
customer_account_id UUID FK customer_accounts(id)
financial_account_id UUID FK financial_accounts(id)

provider VARCHAR
provider_card_id VARCHAR UNIQUE
card_type ENUM('virtual','physical')
status ENUM(
    'pending',
    'active',
    'frozen',
    'terminated',
    'expired'
)

last4 CHAR(4)
brand VARCHAR
currency_code VARCHAR
expiry_month SMALLINT
expiry_year SMALLINT

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Never store CVV or raw PAN unless the architecture explicitly requires PCI-compliant card storage.

Prefer a processor-issued token:

```
card_tokens
------------
id UUID PK
card_id UUID FK cards(id)
provider_token VARCHAR
token_type VARCHAR
created_at TIMESTAMPTZ
```

## 14\. Card Transactions

```
card_transactions
------------------
id UUID PK
card_id UUID FK cards(id)
transaction_id UUID FK transactions(id)

merchant_name VARCHAR
merchant_category_code VARCHAR
merchant_country CHAR(2)

authorization_amount_minor BIGINT
settled_amount_minor BIGINT
currency_code VARCHAR

authorization_code VARCHAR
provider_reference VARCHAR

status VARCHAR
authorized_at TIMESTAMPTZ
settled_at TIMESTAMPTZ
```

## 15\. Stablecoins / Wallets

```
wallets
-------
id UUID PK
customer_account_id UUID FK customer_accounts(id)
asset_code VARCHAR
network VARCHAR
address VARCHAR
provider VARCHAR
provider_wallet_id VARCHAR
status VARCHAR
created_at TIMESTAMPTZ
```

```
blockchain_transactions
-----------------------
id UUID PK
wallet_id UUID FK wallets(id)
tx_hash VARCHAR
network VARCHAR
asset_code VARCHAR
direction ENUM('inbound','outbound')
amount_atomic NUMERIC(78,0)
status VARCHAR
confirmations INT
block_number BIGINT
created_at TIMESTAMPTZ
confirmed_at TIMESTAMPTZ
```

## 16\. Savings / Pots

```
savings_accounts
----------------
id UUID PK
customer_account_id UUID FK customer_accounts(id)
financial_account_id UUID FK financial_accounts(id)

name VARCHAR
target_amount_minor BIGINT
current_amount_minor BIGINT
currency_code VARCHAR

interest_rate DECIMAL(12,8)
status VARCHAR

created_at TIMESTAMPTZ
matures_at TIMESTAMPTZ NULL
```

## 17\. Rewards / Cleva Points

```
reward_accounts
---------------
id UUID PK
customer_account_id UUID FK customer_accounts(id)
points_balance BIGINT DEFAULT 0
status VARCHAR
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

```
reward_ledger
-------------
id UUID PK
reward_account_id UUID FK reward_accounts(id)
transaction_id UUID NULL FK transactions(id)

points_delta BIGINT
reason VARCHAR
metadata JSONB

created_at TIMESTAMPTZ
```

Again, use an immutable ledger rather than simply incrementing a balance.

## 18\. Limits & Risk Controls

```
account_limits
--------------
id UUID PK
customer_account_id UUID FK customer_accounts(id)

daily_deposit_limit_minor BIGINT
daily_withdrawal_limit_minor BIGINT
daily_transfer_limit_minor BIGINT
monthly_volume_limit_minor BIGINT

effective_from TIMESTAMPTZ
effective_until TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
```

```
risk_events
-----------
id UUID PK
user_id UUID NULL
customer_account_id UUID NULL

event_type VARCHAR
risk_score DECIMAL(10,4)
severity VARCHAR
source VARCHAR

metadata JSONB
created_at TIMESTAMPTZ
```

## 19\. Fraud / AML

```
compliance_alerts
-----------------
id UUID PK
user_id UUID NULL
organization_id UUID NULL
transaction_id UUID NULL

alert_type ENUM(
    'sanctions',
    'pep',
    'velocity',
    'fraud',
    'aml',
    'unusual_activity'
)

severity VARCHAR
status ENUM('open','reviewing','cleared','escalated','closed')

provider VARCHAR
provider_reference VARCHAR
details JSONB

created_at TIMESTAMPTZ
resolved_at TIMESTAMPTZ NULL
```

## 20\. Sessions & Security

```
sessions
--------
id UUID PK
user_id UUID FK users(id)
token_hash CHAR(64)
device_id UUID
ip_address INET
user_agent TEXT
created_at TIMESTAMPTZ
expires_at TIMESTAMPTZ
revoked_at TIMESTAMPTZ NULL
```

```
devices
-------
id UUID PK
user_id UUID FK users(id)
device_fingerprint_hash CHAR(64)
platform VARCHAR
app_version VARCHAR
last_seen_at TIMESTAMPTZ
trusted BOOLEAN
created_at TIMESTAMPTZ
```

```
mfa_methods
-----------
id UUID PK
user_id UUID FK users(id)
method ENUM('totp','sms','passkey','webauthn')
credential_reference TEXT
verified_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

## 21\. Audit Log

For a financial company, this is mandatory infrastructure.

```
audit_logs
----------
id UUID PK
actor_user_id UUID NULL
actor_type ENUM('user','admin','system','service')

action VARCHAR
entity_type VARCHAR
entity_id UUID

before_state JSONB NULL
after_state JSONB NULL

ip_address INET NULL
user_agent TEXT NULL
request_id VARCHAR
correlation_id VARCHAR

created_at TIMESTAMPTZ
```

Audit logs should be append-only and preferably shipped to an immutable/WORM storage system.

## 22\. Notifications

```
notifications
-------------
id UUID PK
user_id UUID FK users(id)

channel ENUM('email','sms','push','in_app')
notification_type VARCHAR
template_id VARCHAR

status ENUM('queued','sent','failed')
provider VARCHAR
provider_reference VARCHAR

payload JSONB
created_at TIMESTAMPTZ
sent_at TIMESTAMPTZ
```

## 23\. Support

```
support_tickets
---------------
id UUID PK
user_id UUID NULL
organization_id UUID NULL

subject VARCHAR
status VARCHAR
priority VARCHAR
assigned_agent_id UUID NULL

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
closed_at TIMESTAMPTZ NULL
```

## 24\. Webhooks & External Integrations

```
webhook_events
--------------
id UUID PK
provider VARCHAR
event_type VARCHAR
provider_event_id VARCHAR UNIQUE

payload JSONB
signature_valid BOOLEAN

processing_status ENUM(
    'received',
    'processing',
    'processed',
    'failed',
    'dead_letter'
)

attempt_count INT
received_at TIMESTAMPTZ
processed_at TIMESTAMPTZ NULL
```

```
external_references
-------------------
id UUID PK
entity_type VARCHAR
entity_id UUID

provider VARCHAR
provider_resource_type VARCHAR
provider_resource_id VARCHAR

created_at TIMESTAMPTZ

UNIQUE(provider, provider_resource_type, provider_resource_id)
```

# 25\. Critical Production Rules

The schema alone isn't what makes this production-grade.

### Money

Never use floating-point numbers for monetary values.

Use:

```
BIGINT amount_minor
```

with a currency-specific exponent.

For example:

```
$100.25 → 10025 cents
₦100.25 → 10025 kobo
```

### Idempotency

Every externally initiated money movement should accept an idempotency key:

```
POST /transfers
Idempotency-Key: 8d4...
```

The database should enforce uniqueness.

### Ledger invariants

A posted transaction must satisfy:

```
total_debits == total_credits
```

and:

```
customer_balance =
    sum(credits)
    - sum(debits)
```

depending on the ledger convention.

### Concurrency

Balance updates must be transactional.

Conceptually:

```
BEGIN

lock relevant ledger/account rows

validate available balance

create ledger transaction

create debit entry

create credit entry

update materialized balance

COMMIT
```

Never perform:

```
read balance
→ calculate
→ write balance
```

without transactional protection.

### Soft deletion

Financial records should generally never be physically deleted.

Use:

```
status
closed_at
deleted_at
```

where appropriate.

### PII

Sensitive data should be:

- encrypted at rest
- encrypted in transit
- access-controlled
- separately permissioned
- audited
- retained only as required

For searchable sensitive identifiers, maintain a keyed/hash representation separately from the encrypted value.

### Database architecture

At Cleva scale, I would separate domains logically:

```
identity
 ├── users
 ├── profiles
 ├── organizations
 └── authentication

compliance
 ├── KYC
 ├── KYB
 ├── sanctions
 └── risk

accounts
 ├── customer_accounts
 ├── financial_accounts
 └── beneficiaries

ledger
 ├── ledger_accounts
 ├── ledger_transactions
 └── ledger_entries

payments
 ├── transfers
 ├── deposits
 ├── withdrawals
 └── conversions

cards
 ├── cards
 └── card_transactions

crypto
 ├── wallets
 └── blockchain_transactions

rewards
 ├── reward_accounts
 └── reward_ledger

platform
 ├── audit_logs
 ├── notifications
 ├── webhooks
 └── external_references
```

The important architectural principle is that **users → customer accounts → financial accounts → ledger accounts** are separate concepts.

That gives you enough separation to support personal accounts, business accounts, multiple currencies, virtual accounts, cards, stablecoins, savings, transfers and future financial products without turning the database into one enormous `users` table.

This is based on Cleva’s **publicly documented product surface**, not reverse-engineering or claiming access to its private production schema. Cleva+2
