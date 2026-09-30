#!/bin/sh
set -e

# Ensure DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "FATAL: DATABASE_URL is not set."
  exit 1
fi

DB_DSN="$DATABASE_URL"

# Verify PostgreSQL connectivity
echo "Verifying database connectivity..."
MAX_RETRIES=30
RETRY_COUNT=0
until goose -dir /app/db/migrations postgres "$DB_DSN" version > /dev/null 2>&1 || [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  echo "Waiting for database to become ready (attempt $RETRY_COUNT/$MAX_RETRIES)..."
  sleep 1
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  echo "FATAL: Database connection timed out after $MAX_RETRIES seconds."
  exit 1
fi
echo "Database connectivity confirmed."

# Run database migrations if requested
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations with goose..."
  goose -dir /app/db/migrations postgres "$DB_DSN" up
  echo "Database migrations applied successfully."
fi

echo "Starting Chipa API server..."
# Start the Go server
exec /app/api
