// Vercel Serverless Function: POST /api/auth/login
// Authenticates user credentials against Neon PostgreSQL and returns a signed HS256 JWT + HttpOnly cookie.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import {
  setAuthCookie,
  signJwt,
  verifyPassword,
  type UserRole,
} from '../_lib/auth.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use POST /api/auth/login' });
    return;
  }

  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    res.status(400).json({ error: 'missing_credentials', message: 'Email and password are required.' });
    return;
  }

  try {
    const sql = getNeonSql();
    const rows = await sql`
      SELECT id, email, password_hash, display_name, role, created_at
      FROM public.users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (rows.length === 0) {
      res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password.' });
      return;
    }

    const row = rows[0] as {
      id: string;
      email: string;
      password_hash: string;
      display_name: string;
      role: UserRole;
      created_at: string;
    };

    if (!verifyPassword(password, row.password_hash)) {
      res.status(401).json({ error: 'invalid_credentials', message: 'Invalid email or password.' });
      return;
    }

    const profileRows = await sql`
      SELECT * FROM public.user_profiles WHERE user_id = ${row.id} LIMIT 1
    `;

    const user = {
      id: row.id,
      email: row.email,
      display_name: row.display_name,
      role: row.role,
      created_at: row.created_at,
    };

    const token = signJwt({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
    });
    setAuthCookie(res, token);

    res.status(200).json({
      token,
      user,
      profile: profileRows[0] || null,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      res.status(503).json({ error: 'database_unavailable', message: err.message });
      return;
    }
    console.error('Login error', err instanceof Error ? err.name : 'Unknown');
    res.status(500).json({ error: 'login_failed', message: 'Unable to sign in right now.' });
  }
}
