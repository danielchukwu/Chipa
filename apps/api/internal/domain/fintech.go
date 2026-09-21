package domain

import (
	"time"
)

// Currency represents supported fiat currencies and stablecoins on Chipa.
type Currency string

const (
	CurrencyNGN  Currency = "NGN"
	CurrencyUSD  Currency = "USD"
	CurrencyGBP  Currency = "GBP"
	CurrencyEUR  Currency = "EUR"
	CurrencyAED  Currency = "AED"
	CurrencyKWD  Currency = "KWD"
	CurrencyAUD  Currency = "AUD"
	CurrencyUSDC Currency = "USDC"
)

// VirtualAccount represents a dedicated user account issued by Bridge.xyz (USD/EUR/GBP/USDC) or Paystack (NGN).
type VirtualAccount struct {
	ID                  string    `json:"id"`
	UserID              int64     `json:"user_id"`
	Currency            Currency  `json:"currency"`
	CurrencyName        string    `json:"currency_name"`
	Symbol              string    `json:"symbol"`
	BalanceMinor        int64     `json:"balance_minor"` // Authoritative balance in minor units (kobo, cents)
	Balance             float64   `json:"balance"`       // Formatted floating representation for client display
	AccountName         string    `json:"account_name"`
	AccountNumber       string    `json:"account_number"`
	BankName            string    `json:"bank_name"`
	Provider            string    `json:"provider"` // 'bridge', 'paystack'
	// Bridge.xyz USD specific
	RoutingNumber       string    `json:"routing_number,omitempty"`
	// Bridge.xyz GBP specific
	SortCode            string    `json:"sort_code,omitempty"`
	// Bridge.xyz EUR specific
	IBAN                string    `json:"iban,omitempty"`
	BIC                 string    `json:"bic,omitempty"`
	// Bridge.xyz Stablecoin specific
	DepositAddress      string    `json:"deposit_address,omitempty"`
	Status              string    `json:"status"` // active, frozen, closed
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// CardScheme represents Visa or Mastercard.
type CardScheme string

const (
	CardSchemeVisa       CardScheme = "visa"
	CardSchemeMastercard CardScheme = "mastercard"
)

// CardStatus represents virtual/physical card status.
type CardStatus string

const (
	CardStatusActive     CardStatus = "active"
	CardStatusFrozen     CardStatus = "frozen"
	CardStatusTerminated CardStatus = "terminated"
)

// Card represents a virtual or physical card backed by a financial account.
type Card struct {
	ID                 string     `json:"id"`
	UserID             int64      `json:"user_id"`
	Name               string     `json:"name"`
	Currency           Currency   `json:"currency"`
	Scheme             CardScheme `json:"scheme"`
	Brand              string     `json:"brand"`
	PAN                string     `json:"pan,omitempty"` // Masked unless specifically authorized
	Last4              string     `json:"last4"`
	ExpiryMonth        string     `json:"expiry_month"`
	ExpiryYear         string     `json:"expiry_year"`
	CVV                string     `json:"cvv,omitempty"`
	Status             CardStatus `json:"status"`
	BalanceMinor       int64      `json:"balance_minor"`
	Balance            float64    `json:"balance"`
	SpendingLimitMinor int64      `json:"spending_limit_minor"`
	SpendingLimit      float64    `json:"spending_limit"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

// FXRate represents live exchange rate for a currency pair.
type FXRate struct {
	Pair      string    `json:"pair"`
	From      Currency  `json:"from"`
	To        Currency  `json:"to"`
	Rate      float64   `json:"rate"`
	Change24h float64   `json:"change_24h"`
	UpdatedAt time.Time `json:"updated_at"`
}

// FXQuote represents a locked-in conversion quote valid for 60 seconds.
type FXQuote struct {
	QuoteID            string    `json:"quote_id"`
	FromCurrency       Currency  `json:"from_currency"`
	ToCurrency         Currency  `json:"to_currency"`
	SendAmountMinor    int64     `json:"send_amount_minor"`
	SendAmount         float64   `json:"send_amount"`
	ReceiveAmountMinor int64     `json:"receive_amount_minor"`
	ReceiveAmount      float64   `json:"receive_amount"`
	Rate               float64   `json:"rate"`
	FeeMinor           int64     `json:"fee_minor"`
	Fee                float64   `json:"fee"`
	ExpiresAt          time.Time `json:"expires_at"`
}

// LedgerEntry represents a single balanced debit or credit row.
type LedgerEntry struct {
	ID                  string    `json:"id"`
	LedgerTransactionID string    `json:"ledger_transaction_id"`
	LedgerAccountID     string    `json:"ledger_account_id"`
	Direction           string    `json:"direction"` // 'debit' or 'credit'
	AmountMinor         int64     `json:"amount_minor"`
	CreatedAt           time.Time `json:"created_at"`
}

// LedgerTransaction represents a financial transaction grouping entries.
type LedgerTransaction struct {
	ID                   string        `json:"id"`
	TransactionReference string        `json:"transaction_reference"`
	TransactionType      string        `json:"transaction_type"`
	Status               string        `json:"status"`
	Currency             Currency      `json:"currency"`
	IdempotencyKey       string        `json:"idempotency_key,omitempty"`
	Description          string        `json:"description"`
	Entries              []LedgerEntry `json:"entries,omitempty"`
	CreatedAt            time.Time     `json:"created_at"`
	PostedAt             time.Time     `json:"posted_at"`
}

// VASCategory represents utility bill payment types.
type VASCategory string

const (
	VASCategoryAirtime     VASCategory = "airtime"
	VASCategoryData        VASCategory = "data"
	VASCategoryElectricity VASCategory = "electricity"
	VASCategoryCableTV     VASCategory = "cable_tv"
)

// VASOperator represents a service provider (e.g. MTN, IKEDC, DSTV).
type VASOperator struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Category    VASCategory `json:"category"`
	Logo        string      `json:"logo"`
	Description string      `json:"description"`
}

// VASValidationResult represents validated recipient info (e.g., meter customer name).
type VASValidationResult struct {
	CustomerName    string `json:"customer_name"`
	RecipientNumber string `json:"recipient_number"`
	IsValid         bool   `json:"is_valid"`
	Address         string `json:"address,omitempty"`
}

// VASReceipt represents bill payment confirmation.
type VASReceipt struct {
	Reference    string    `json:"reference"`
	Category     string    `json:"category"`
	Operator     string    `json:"operator"`
	Recipient    string    `json:"recipient"`
	AmountMinor  int64     `json:"amount_minor"`
	Amount       float64   `json:"amount"`
	Currency     Currency  `json:"currency"`
	Status       string    `json:"status"`
	PrepaidToken string    `json:"prepaid_token,omitempty"`
	Timestamp    time.Time `json:"timestamp"`
}

// Bank represents a commercial bank or financial institution.
type Bank struct {
	Name string `json:"name"`
	Code string `json:"code"`
	Slug string `json:"slug,omitempty"`
	USSD string `json:"ussd,omitempty"`
}
