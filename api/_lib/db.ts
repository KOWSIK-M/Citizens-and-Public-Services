// Shared Neon Serverless PostgreSQL Connection Helper
// Zero Mock Data: All runtime database endpoints read/write directly against Neon PostgreSQL.

import { neon } from '@neondatabase/serverless';

export class DatabaseUnavailableError extends Error {
  constructor(message = 'DATABASE_URL is not configured for Neon PostgreSQL.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

export function getNeonSql(overrideEnvKey?: 'COMMUNITY_DATABASE_URL') {
  const url =
    (overrideEnvKey ? process.env[overrideEnvKey] : undefined) || process.env.DATABASE_URL;
  if (!url) {
    throw new DatabaseUnavailableError();
  }
  return neon(url);
}
