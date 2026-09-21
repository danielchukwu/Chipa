# --- Stage 1: Build ---
FROM golang:1.26.4-alpine3.24 AS builder

WORKDIR /app

# Install build tools and CA certificates
RUN apk add --no-cache git ca-certificates tzdata

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

ARG VERSION
ARG COMMIT_SHA

# Build the application with security flags (strip symbols, disable CGO, trim filesystem paths)
RUN CGO_ENABLED=0 GOOS=linux go build \
    -trimpath \
    -ldflags="-w -s -X 'main.version=${VERSION}' -X 'main.commit=${COMMIT_SHA}'" \
    -o /app/bin/api ./cmd/api

# Install goose CLI for migrations
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

# --- Stage 2: Runtime (Bank-grade Least-Privilege Non-Root) ---
FROM alpine:3.20 AS runner

WORKDIR /app

# Install ca-certificates and tzdata for SSL/TLS connections and curl for healthchecks
RUN apk update && \
    apk add --no-cache ca-certificates tzdata curl && \
    rm -rf /var/cache/apk/*

# Create unprivileged system group and user (UID/GID 10001) for PCI-DSS/SOC2 compliance
RUN addgroup -g 10001 -S chipa && \
    adduser -u 10001 -S chipa -G chipa -s /sbin/nologin

# Copy built binary, goose, migrations, and entrypoint script
COPY --from=builder /app/bin/api /app/api
COPY --from=builder /go/bin/goose /usr/local/bin/goose
COPY --from=builder /app/db/migrations /app/db/migrations
COPY --from=builder /app/entrypoint.sh /app/entrypoint.sh

# Normalize CRLF line endings, set secure permissions, and chown to non-root user
RUN sed -i 's/\r$//' /app/entrypoint.sh && \
    chmod 755 /app/entrypoint.sh /app/api /usr/local/bin/goose && \
    chown -R chipa:chipa /app

# Switch to unprivileged user
USER chipa:chipa

ENV PORT=4000
EXPOSE 4000

# Container Healthcheck for orchestrator monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT:-4000}/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
