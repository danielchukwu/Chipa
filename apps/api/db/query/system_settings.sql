-- name: GetSystemSetting :one
SELECT key, value, description, created_at, updated_at 
FROM system_settings 
WHERE key = $1;

-- name: UpdateSystemSetting :one
UPDATE system_settings
SET 
    value = $2, 
    description = COALESCE($3, description),
    updated_at = NOW()
WHERE key = $1
RETURNING key, value, description, created_at, updated_at;
