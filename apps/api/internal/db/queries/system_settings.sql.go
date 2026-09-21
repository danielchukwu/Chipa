package queries

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const getSystemSetting = `-- name: GetSystemSetting :one
SELECT key, value, description, created_at, updated_at 
FROM system_settings 
WHERE key = $1
`

func (q *Queries) GetSystemSetting(ctx context.Context, key string) (SystemSetting, error) {
	row := q.db.QueryRow(ctx, getSystemSetting, key)
	var i SystemSetting
	err := row.Scan(
		&i.Key,
		&i.Value,
		&i.Description,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateSystemSetting = `-- name: UpdateSystemSetting :one
UPDATE system_settings
SET 
    value = $2, 
    description = COALESCE($3, description),
    updated_at = NOW()
WHERE key = $1
RETURNING key, value, description, created_at, updated_at
`

type UpdateSystemSettingParams struct {
	Key         string      `json:"key"`
	Value       []byte      `json:"value"`
	Description pgtype.Text `json:"description"`
}

func (q *Queries) UpdateSystemSetting(ctx context.Context, arg UpdateSystemSettingParams) (SystemSetting, error) {
	row := q.db.QueryRow(ctx, updateSystemSetting, arg.Key, arg.Value, arg.Description)
	var i SystemSetting
	err := row.Scan(
		&i.Key,
		&i.Value,
		&i.Description,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
