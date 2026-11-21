// Vercel Serverless Function: POST /api/auth/logout
// Clears the HttpOnly JWT session cookie.

import { clearAuthCookie } from '../_lib/auth.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use POST /api/auth/logout' });
    return;
  }

  clearAuthCookie(res);
  res.status(200).json({ ok: true });
}
