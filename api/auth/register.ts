// Vercel Serverless Function: POST /api/auth/register
// Registers a citizen (or admin with valid ADMIN_INVITE_CODE) in Neon PostgreSQL,
// initializes their personalised profile, and issues an HS256 JWT + HttpOnly cookie.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import {
  hashPassword,
  setAuthCookie,
  signJwt,
  type UserRole,
} from '../_lib/auth.js';
import { isValidGmailOrEmail } from '../_lib/mailer.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use POST /api/auth/register' });
    return;
  }

  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const displayName =
    typeof body.display_name === 'string' ? body.display_name.trim().slice(0, 80) : '';
  const gmailOptIn =
    typeof body.gmail_address === 'string' && body.gmail_address.trim()
      ? body.gmail_address.trim().toLowerCase()
      : email;
  const emailNotificationsEnabled = body.email_notifications_enabled !== false;
  const adminInviteCode =
    typeof body.admin_invite_code === 'string' ? body.admin_invite_code.trim() : '';

  if (!isValidGmailOrEmail(email)) {
    res.status(400).json({ error: 'invalid_email', message: 'Please provide a valid email address.' });
    return;
  }
  if (password.length < 8 || password.length > 128) {
    res.status(400).json({
      error: 'weak_password',
      message: 'Password must be between 8 and 128 characters.',
    });
    return;
  }
  if (displayName.length < 2) {
    res.status(400).json({
      error: 'invalid_name',
      message: 'Display name must be at least 2 characters.',
    });
    return;
  }

  let role: UserRole = 'citizen';
  const expectedAdminCode = process.env.ADMIN_INVITE_CODE?.trim();
  if (adminInviteCode) {
    if (!expectedAdminCode || adminInviteCode !== expectedAdminCode) {
      res.status(403).json({
        error: 'invalid_admin_invite_code',
        message: 'The provided Admin Invite Code is invalid.',
      });
      return;
    }
    role = 'admin';
  }

  try {
    const sql = getNeonSql();
    const existing = await sql`SELECT id FROM public.users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      res.status(409).json({
        error: 'email_already_registered',
        message: 'An account with this email already exists. Please sign in instead.',
      });
      return;
    }

    const passwordHash = hashPassword(password);
    const createdRows = await sql`
      INSERT INTO public.users (email, password_hash, display_name, role)
      VALUES (${email}, ${passwordHash}, ${displayName}, ${role})
      RETURNING id, email, display_name, role, created_at
    `;
    const user = createdRows[0] as {
      id: string;
      email: string;
      display_name: string;
      role: UserRole;
      created_at: string;
    };

    const safeGmail = isValidGmailOrEmail(gmailOptIn) ? gmailOptIn : email;
    const profileRows = await sql`
      INSERT INTO public.user_profiles (user_id, gmail_address, email_notifications_enabled)
      VALUES (${user.id}, ${safeGmail}, ${emailNotificationsEnabled})
      RETURNING *
    `;

    const token = signJwt({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
    });
    setAuthCookie(res, token);

    res.status(201).json({
      token,
      user,
      profile: profileRows[0],
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      res.status(503).json({ error: 'database_unavailable', message: err.message });
      return;
    }
    console.error('Register error', err instanceof Error ? err.name : 'Unknown');
    res.status(500).json({ error: 'registration_failed', message: 'Unable to create account.' });
  }
}
