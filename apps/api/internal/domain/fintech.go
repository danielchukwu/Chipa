package domain

import (
	"time"
)

// Currency represents supported fiat currencies on Chipa.
type Currency string

const (
	CurrencyNGN Currency = "NGN"
	CurrencyUSD Currency = "USD"
	CurrencyGBP Currency = "GBP"
	CurrencyEUR Currency = "EUR"
	CurrencyAED Currency = "AED"
	CurrencyKWD Currency = "KWD"
	CurrencyAUD Currency = "AUD"
)

// VirtualAccount represents a dedicated user account issued by Lead Bank, Clear Junction, or Monnify.
type VirtualAccount struct {
	ID            string    `json:"id"`
	UserID        int64     `json:"user_id"`
	Currency      Currency  `json:"currency"`
	CurrencyName  string    `json:"currency_name"`
	Symbol        string    `json:"symbol"`
	Balance       float64   `json:"balance"` // Minor unit or float
	AccountName   string    `json:"account_name"`
	AccountNumber string    `json:"account_number"`
	BankName      string    `json:"bank_name"`
	// Lead Bank (USD) specific
	RoutingNumber string    `json:"routing_number,omitempty"`
	// Clear Junction (GBP) specific
	SortCode      string    `json:"sort_code,omitempty"`
	// Clear Junction (EUR) specific
	IBAN          string    `json:"iban,omitempty"`
	BIC           string    `json:"bic,omitempty"`
	Status        string    `json:"status"` // active, suspended
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
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

// Card represents a virtual or physical card.
type Card struct {
	ID            string     `json:"id"`
	UserID        int64      `json:"user_id"`
	Name          string     `json:"name"`
	Currency      Currency   `json:"currency"`
	Scheme        CardScheme `json:"scheme"`
	PAN           string     `json:"pan,omitempty"` // Masked unless specifically authorized
	Last4         string     `json:"last4"`
	ExpiryMonth   string     `json:"expiry_month"`
	ExpiryYear    string     `json:"expiry_year"`
	CVV           string     `json:"cvv,omitempty"`
	Status        CardStatus `json:"status"`
	Balance       float64    `json:"balance"`
	SpendingLimit float64    `json:"spending_limit"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
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
	QuoteID       string    `json:"quote_id"`
	FromCurrency  Currency  `json:"from_currency"`
	ToCurrency    Currency  `json:"to_currency"`
	SendAmount    float64   `json:"send_amount"`
	ReceiveAmount float64   `json:"receive_amount"`
	Rate          float64   `json:"rate"`
	Fee           float64   `json:"fee"`
	ExpiresAt     time.Time `json:"expires_at"`
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
	CustomerName   string `json:"customer_name"`
	RecipientNumber string `json:"recipient_number"`
	IsValid        bool   `json:"is_valid"`
	Address        string `json:"address,omitempty"`
}

// VASReceipt represents bill payment confirmation.
type VASReceipt struct {
	Reference    string    `json:"reference"`
	Category     string    `json:"category"`
	Operator     string    `json:"operator"`
	Recipient    string    `json:"recipient"`
	Amount       float64   `json:"amount"`
	Currency     Currency  `json:"currency"`
	Status       string    `json:"status"`
	PrepaidToken string    `json:"prepaid_token,omitempty"`
	Timestamp    time.Time `json:"timestamp"`
}
