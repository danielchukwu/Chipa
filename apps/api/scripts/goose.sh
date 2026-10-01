#!/bin/bash
# goose.sh — sources .env files then delegates to goose
# Usage: ./scripts/goose.sh <goose args...>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load .env then .env.local (overrides) from the api root
set -a
# shellcheck source=/dev/null
[ -f "$API_DIR/.env" ] && . "$API_DIR/.env"
# shellcheck source=/dev/null
[ -f "$API_DIR/.env.local" ] && . "$API_DIR/.env.local"
set +a

if [ -z "$DATABASE_URL" ]; then
  echo "[goose.sh] ERROR: DATABASE_URL is not set. Add it to apps/api/.env or .env.local." >&2
  exit 1
fi

exec goose -dir "$API_DIR/db/migrations" postgres "$DATABASE_URL" "$@"
