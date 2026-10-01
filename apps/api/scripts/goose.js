#!/usr/bin/env node
// scripts/goose.js — loads .env then .env.local and delegates to goose
// Usage (via pnpm): pnpm db:migrate, pnpm db:rollback, etc.
// Direct:           node scripts/goose.js up
//                   node scripts/goose.js down
//                   node scripts/goose.js status

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const apiDir = path.resolve(__dirname, '..');

// Parse a .env file into key=value pairs (no dependencies needed)
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    // Don't overwrite values already in the environment (process.env takes priority)
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(path.join(apiDir, '.env'));
loadEnvFile(path.join(apiDir, '.env.local'));

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('[goose.js] ERROR: DATABASE_URL is not set. Add it to apps/api/.env or .env.local.');
  process.exit(1);
}

const migrationsDir = path.join(apiDir, 'db', 'migrations');
const args = process.argv.slice(2); // e.g. ['up'] or ['down'] or ['status']

if (args.length === 0) {
  console.error('[goose.js] ERROR: No goose command provided (e.g. up, down, status).');
  process.exit(1);
}

try {
  execFileSync('goose', ['-dir', migrationsDir, 'postgres', dbUrl, ...args], {
    stdio: 'inherit',
    cwd: apiDir,
  });
} catch (err) {
  process.exit(err.status ?? 1);
}
