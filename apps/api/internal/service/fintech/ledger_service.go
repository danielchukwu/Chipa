package fintech

import (
	"context"
	"errors"
	"fmt"
	"time"

	"chipa/api/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LedgerEntryInput struct {
	LedgerAccountID    string
	FinancialAccountID string // optional, for auto-updating materialized balance
	Direction          string // "debit" or "credit"
	AmountMinor        int64
}

type LedgerService struct {
	pool *pgxpool.Pool
}

func NewLedgerService(pool *pgxpool.Pool) *LedgerService {
	return &LedgerService{pool: pool}
}

// EnsureCustomerLedgerAccount retrieves or provisions a ledger anchor account for a customer's financial account.
func (s *LedgerService) EnsureCustomerLedgerAccount(ctx context.Context, financialAccountID string, currency domain.Currency) (string, error) {
	if s.pool == nil {
		return fmt.Sprintf("sim-ledger-acc-%s", financialAccountID), nil
	}

	var ledgerAccID string
	err := s.pool.QueryRow(ctx, `
		SELECT id::text FROM ledger_accounts 
		WHERE financial_account_id = $1::uuid AND currency = $2 AND account_type = 'customer'
		LIMIT 1
	`, financialAccountID, string(currency)).Scan(&ledgerAccID)
	if err == nil && ledgerAccID != "" {
		return ledgerAccID, nil
	}

	err = s.pool.QueryRow(ctx, `
		INSERT INTO ledger_accounts (financial_account_id, account_type, currency, status)
		VALUES ($1::uuid, 'customer', $2, 'active')
		RETURNING id::text
	`, financialAccountID, string(currency)).Scan(&ledgerAccID)
	if err != nil {
		return "", fmt.Errorf("failed to create customer ledger account: %w", err)
	}

	return ledgerAccID, nil
}

// EnsureSystemLedgerAccount retrieves or provisions a system anchor account (e.g., 'settlement', 'fee_revenue', 'partner_clearing').
func (s *LedgerService) EnsureSystemLedgerAccount(ctx context.Context, accountType string, currency domain.Currency) (string, error) {
	if s.pool == nil {
		return fmt.Sprintf("sim-sys-ledger-%s-%s", accountType, currency), nil
	}

	var ledgerAccID string
	err := s.pool.QueryRow(ctx, `
		SELECT id::text FROM ledger_accounts 
		WHERE account_type = $1 AND currency = $2 AND financial_account_id IS NULL
		LIMIT 1
	`, accountType, string(currency)).Scan(&ledgerAccID)
	if err == nil && ledgerAccID != "" {
		return ledgerAccID, nil
	}

	err = s.pool.QueryRow(ctx, `
		INSERT INTO ledger_accounts (financial_account_id, account_type, currency, status)
		VALUES (NULL, $1, $2, 'active')
		RETURNING id::text
	`, accountType, string(currency)).Scan(&ledgerAccID)
	if err != nil {
		return "", fmt.Errorf("failed to create system ledger account: %w", err)
	}

	return ledgerAccID, nil
}

// PostTransaction executes an immutable, double-entry financial transaction ensuring SUM(debits) == SUM(credits).
func (s *LedgerService) PostTransaction(
	ctx context.Context,
	txType string,
	currency domain.Currency,
	idempotencyKey string,
	description string,
	entries []LedgerEntryInput,
) (*domain.LedgerTransaction, error) {
	if len(entries) < 2 {
		return nil, errors.New("a double-entry transaction requires at least 2 balanced entries")
	}

	// 1. Invariant Check: SUM(debits) must equal SUM(credits)
	var totalDebits int64
	var totalCredits int64
	for _, e := range entries {
		if e.AmountMinor <= 0 {
			return nil, errors.New("entry amount_minor must be strictly positive")
		}
		switch e.Direction {
		case "debit":
			totalDebits += e.AmountMinor
		case "credit":
			totalCredits += e.AmountMinor
		default:
			return nil, fmt.Errorf("invalid direction '%s'; must be 'debit' or 'credit'", e.Direction)
		}
	}

	if totalDebits != totalCredits {
		return nil, fmt.Errorf("ledger unbalanced: debits (%d) != credits (%d)", totalDebits, totalCredits)
	}

	if s.pool == nil {
		// In-memory fallback
		ref := fmt.Sprintf("txn-%d", time.Now().UnixNano())
		return &domain.LedgerTransaction{
			ID:                   fmt.Sprintf("ltx-%d", time.Now().UnixNano()),
			TransactionReference: ref,
			TransactionType:      txType,
			Status:               "posted",
			Currency:             currency,
			IdempotencyKey:       idempotencyKey,
			Description:          description,
			CreatedAt:            time.Now(),
			PostedAt:             time.Now(),
		}, nil
	}

	// 2. Begin ACID PostgreSQL Transaction
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 3. Idempotency Check
	if idempotencyKey != "" {
		var existingID, existingRef, existingStatus string
		var existingCreatedAt, existingPostedAt time.Time
		err := tx.QueryRow(ctx, `
			SELECT id::text, transaction_reference, status, created_at, posted_at
			FROM ledger_transactions
			WHERE idempotency_key = $1
			LIMIT 1
		`, idempotencyKey).Scan(&existingID, &existingRef, &existingStatus, &existingCreatedAt, &existingPostedAt)
		if err == nil {
			// Idempotent hit: return existing transaction without re-executing
			_ = tx.Commit(ctx)
			return &domain.LedgerTransaction{
				ID:                   existingID,
				TransactionReference: existingRef,
				TransactionType:      txType,
				Status:               existingStatus,
				Currency:             currency,
				IdempotencyKey:       idempotencyKey,
				Description:          description,
				CreatedAt:            existingCreatedAt,
				PostedAt:             existingPostedAt,
			}, nil
		}
	}

	// 4. Insert Ledger Transaction Header
	ref := fmt.Sprintf("tx_%s_%d", txType, time.Now().UnixNano())
	var txID string
	var createdAt, postedAt time.Time

	var idempotencyArg interface{} = nil
	if idempotencyKey != "" {
		idempotencyArg = idempotencyKey
	}

	err = tx.QueryRow(ctx, `
		INSERT INTO ledger_transactions (transaction_reference, transaction_type, status, currency, idempotency_key, description)
		VALUES ($1, $2, 'posted', $3, $4, $5)
		RETURNING id::text, created_at, posted_at
	`, ref, txType, string(currency), idempotencyArg, description).Scan(&txID, &createdAt, &postedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create ledger transaction: %w", err)
	}

	// 5. Insert Entries and Update Materialized Balances with Row Locking
	domainEntries := make([]domain.LedgerEntry, 0, len(entries))
	for _, e := range entries {
		var entryID string
		var entryCreatedAt time.Time
		err = tx.QueryRow(ctx, `
			INSERT INTO ledger_entries (ledger_transaction_id, ledger_account_id, direction, amount_minor)
			VALUES ($1::uuid, $2::uuid, $3, $4)
			RETURNING id::text, created_at
		`, txID, e.LedgerAccountID, e.Direction, e.AmountMinor).Scan(&entryID, &entryCreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to insert ledger entry: %w", err)
		}

		domainEntries = append(domainEntries, domain.LedgerEntry{
			ID:                  entryID,
			LedgerTransactionID: txID,
			LedgerAccountID:     e.LedgerAccountID,
			Direction:           e.Direction,
			AmountMinor:         e.AmountMinor,
			CreatedAt:           entryCreatedAt,
		})

		// If entry relates to a customer financial account, atomically update materialized balance with FOR UPDATE lock
		if e.FinancialAccountID != "" {
			var avail, ledgerBal int64
			err = tx.QueryRow(ctx, `
				SELECT available_balance_minor, ledger_balance_minor
				FROM financial_accounts
				WHERE id = $1::uuid
				FOR UPDATE
			`, e.FinancialAccountID).Scan(&avail, &ledgerBal)
			if err != nil && err != pgx.ErrNoRows {
				return nil, fmt.Errorf("failed to lock financial account %s: %w", e.FinancialAccountID, err)
			}

			// In double-entry customer accounting:
			// Credit to customer account = deposit / inflow (increases balance)
			// Debit to customer account = withdrawal / spend (decreases balance)
			if e.Direction == "credit" {
				_, err = tx.Exec(ctx, `
					UPDATE financial_accounts
					SET available_balance_minor = available_balance_minor + $1,
					    ledger_balance_minor = ledger_balance_minor + $1,
					    updated_at = NOW()
					WHERE id = $2::uuid
				`, e.AmountMinor, e.FinancialAccountID)
			} else {
				if avail < e.AmountMinor {
					return nil, errors.New("insufficient funds for this transaction")
				}
				_, err = tx.Exec(ctx, `
					UPDATE financial_accounts
					SET available_balance_minor = available_balance_minor - $1,
					    ledger_balance_minor = ledger_balance_minor - $1,
					    updated_at = NOW()
					WHERE id = $2::uuid
				`, e.AmountMinor, e.FinancialAccountID)
			}
			if err != nil {
				return nil, fmt.Errorf("failed to update materialized balance for account %s: %w", e.FinancialAccountID, err)
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit ledger transaction: %w", err)
	}

	return &domain.LedgerTransaction{
		ID:                   txID,
		TransactionReference: ref,
		TransactionType:      txType,
		Status:               "posted",
		Currency:             currency,
		IdempotencyKey:       idempotencyKey,
		Description:          description,
		Entries:              domainEntries,
		CreatedAt:            createdAt,
		PostedAt:             postedAt,
	}, nil
}

// GetUserLedgerTransactions retrieves immutable double-entry ledger history for a given user.
func (s *LedgerService) GetUserLedgerTransactions(ctx context.Context, userID int64, limit, offset int) ([]*domain.LedgerTransaction, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	if s.pool == nil {
		return []*domain.LedgerTransaction{}, nil
	}

	rows, err := s.pool.Query(ctx, `
		SELECT DISTINCT
			lt.id::text,
			lt.transaction_reference,
			lt.transaction_type,
			lt.status,
			lt.currency,
			COALESCE(lt.idempotency_key, ''),
			COALESCE(lt.description, ''),
			lt.created_at,
			lt.posted_at
		FROM ledger_transactions lt
		JOIN ledger_entries le ON le.ledger_transaction_id = lt.id
		JOIN ledger_accounts la ON la.id = le.ledger_account_id
		JOIN financial_accounts fa ON fa.id = la.financial_account_id
		WHERE fa.user_id = $1
		ORDER BY lt.created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query user ledger transactions: %w", err)
	}
	defer rows.Close()

	var txns []*domain.LedgerTransaction
	for rows.Next() {
		var id, ref, txType, status, currStr, idemKey, desc string
		var createdAt, postedAt time.Time

		if err := rows.Scan(&id, &ref, &txType, &status, &currStr, &idemKey, &desc, &createdAt, &postedAt); err != nil {
			continue
		}

		txns = append(txns, &domain.LedgerTransaction{
			ID:                   id,
			TransactionReference: ref,
			TransactionType:      txType,
			Status:               status,
			Currency:             domain.Currency(currStr),
			IdempotencyKey:       idemKey,
			Description:          desc,
			CreatedAt:            createdAt,
			PostedAt:             postedAt,
		})
	}

	return txns, nil
}

