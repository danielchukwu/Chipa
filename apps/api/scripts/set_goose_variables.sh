#!/bin/bash

# goose configuration
export GOOSE_DRIVER="postgres"
export GOOSE_DBSTRING="${DATABASE_URL:-postgres://postgres:password@localhost:5436/chipa_db?sslmode=disable}"
