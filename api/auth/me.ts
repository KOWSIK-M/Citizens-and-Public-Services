// Vercel Serverless Function: GET /api/auth/me
// Validates the caller's JWT (cookie or Authorization Bearer) and returns their Neon user + profile.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use GET /api/auth/me' });
    return;
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const sql = getNeonSql();
    const userRows = await sql`
      SELECT id, email, display_name, role, created_at
      FROM public.users
      WHERE id = ${authUser.sub}
      LIMIT 1
    `;
    if (userRows.length === 0) {
      res.status(401).json({ error: 'account_not_found', message: 'Session expired or account removed.' });
      return;
    }

    const profileRows = await sql`
      SELECT * FROM public.user_profiles WHERE user_id = ${authUser.sub} LIMIT 1
    `;

    res.status(200).json({
      user: userRows[0],
      profile: profileRows[0] || null,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      res.status(503).json({ error: 'database_unavailable', message: err.message });
      return;
    }
    res.status(500).json({ error: 'session_check_failed', message: 'Unable to load session.' });
  }
}
