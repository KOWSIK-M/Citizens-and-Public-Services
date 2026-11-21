// ClaimSaathi Neon PostgreSQL Migration & Seed Runner
// Usage: node scripts/apply-neon-migrations.mjs
// Reads NEON_OWNER_DATABASE_URL or DATABASE_URL from process.env or .env.local.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(path.join(rootDir, '.env.local'));
loadEnvFile(path.join(rootDir, '.env'));

const dbUrl = process.env.NEON_OWNER_DATABASE_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Missing NEON_OWNER_DATABASE_URL or DATABASE_URL in environment or .env.local.');
  process.exit(1);
}

const sql = neon(dbUrl);

const sqlFiles = [
  'database/migrations/001_schema_and_rls.sql',
  'database/migrations/002_community_and_proposals.sql',
  'database/migrations/003_auth_profiles_notifications.sql',
  'database/seeds/001_ap_schemes.sql',
  'database/seeds/002_scheme_guidance.sql',
  'database/seeds/003_recent_schemes_and_notifications.sql',
];

async function run() {
  for (const relPath of sqlFiles) {
    const fullPath = path.join(rootDir, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Skipping missing file: ${relPath}`);
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    console.log(`Applying ${relPath} ...`);
    await sql.unsafe(content);
    console.log(`  ✓ Applied ${relPath}`);
  }
  console.log('\nAll ClaimSaathi Neon migrations & seeds applied successfully!');
}

run().catch((err) => {
  console.error('Migration failed:', err?.message || err);
  process.exit(1);
});
