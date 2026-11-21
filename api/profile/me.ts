// Vercel Serverless Function: GET / PUT /api/profile/me
// Persists the authenticated citizen's personalised coarse eligibility profile & opt-in Gmail
// notification settings in Neon PostgreSQL (`public.user_profiles`).

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';
import { isValidGmailOrEmail } from '../_lib/mailer.js';
import type { ServerlessRequest, ServerlessResponse } from './extract';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  if (req.method === 'GET') {
    try {
      const sql = getNeonSql();
      const rows = await sql`
        SELECT * FROM public.user_profiles WHERE user_id = ${authUser.sub} LIMIT 1
      `;
      res.status(200).json({ profile: rows[0] || null });
      return;
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        res.status(503).json({ error: 'database_unavailable', message: err.message });
        return;
      }
      res.status(500).json({ error: 'profile_load_failed', message: 'Unable to load profile.' });
      return;
    }
  }

  if (req.method === 'PUT') {
    const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
      string,
      unknown
    >;

    const strOr = (key: string, fallback: string) =>
      typeof body[key] === 'string' && (body[key] as string).trim()
        ? (body[key] as string).trim().slice(0, 60)
        : fallback;

    const triOr = (key: string) => {
      const v = body[key];
      return v === 'yes' || v === 'no' ? v : 'unknown';
    };

    const langRaw = body.language_pref;
    const lang = langRaw === 'te' || langRaw === 'hi' ? langRaw : 'en';
    const rawGmail = typeof body.gmail_address === 'string' ? body.gmail_address.trim().toLowerCase() : '';
    const gmailAddress = rawGmail && isValidGmailOrEmail(rawGmail) ? rawGmail : null;
    if (rawGmail && !gmailAddress) {
      res.status(400).json({ error: 'invalid_gmail', message: 'Please enter a valid Gmail or email address.' });
      return;
    }

    const emailNotificationsEnabled = body.email_notifications_enabled !== false;
    const householdMembers = Array.isArray(body.household_members) ? body.household_members.slice(0, 12) : [];

    try {
      const sql = getNeonSql();
      const rows = await sql`
        INSERT INTO public.user_profiles (
          user_id, age_band, state_code, district_code, income_band,
          occupation_category, social_category, land_holding_band, language_pref,
          household_members, has_school_student, has_college_student,
          is_widow_or_single_woman, has_disability, is_tenant_farmer_ccrc,
          has_white_ration_card, gmail_address, email_notifications_enabled, updated_at
        ) VALUES (
          ${authUser.sub},
          ${strOr('age_band', 'unknown')},
          'AP',
          ${strOr('district_code', 'unknown')},
          ${strOr('income_band', 'unknown')},
          ${strOr('occupation_category', 'unknown')},
          ${strOr('social_category', 'unknown')},
          ${strOr('land_holding_band', 'unknown')},
          ${lang},
          ${JSON.stringify(householdMembers)}::jsonb,
          ${triOr('has_school_student')},
          ${triOr('has_college_student')},
          ${triOr('is_widow_or_single_woman')},
          ${triOr('has_disability')},
          ${triOr('is_tenant_farmer_ccrc')},
          ${triOr('has_white_ration_card')},
          ${gmailAddress},
          ${emailNotificationsEnabled},
          NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          age_band = EXCLUDED.age_band,
          district_code = EXCLUDED.district_code,
          income_band = EXCLUDED.income_band,
          occupation_category = EXCLUDED.occupation_category,
          social_category = EXCLUDED.social_category,
          land_holding_band = EXCLUDED.land_holding_band,
          language_pref = EXCLUDED.language_pref,
          household_members = EXCLUDED.household_members,
          has_school_student = EXCLUDED.has_school_student,
          has_college_student = EXCLUDED.has_college_student,
          is_widow_or_single_woman = EXCLUDED.is_widow_or_single_woman,
          has_disability = EXCLUDED.has_disability,
          is_tenant_farmer_ccrc = EXCLUDED.is_tenant_farmer_ccrc,
          has_white_ration_card = EXCLUDED.has_white_ration_card,
          gmail_address = COALESCE(EXCLUDED.gmail_address, public.user_profiles.gmail_address),
          email_notifications_enabled = EXCLUDED.email_notifications_enabled,
          updated_at = NOW()
        RETURNING *
      `;
      res.status(200).json({ profile: rows[0] });
      return;
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        res.status(503).json({ error: 'database_unavailable', message: err.message });
        return;
      }
      console.error('Profile save error', err instanceof Error ? err.name : 'Unknown');
      res.status(500).json({ error: 'profile_save_failed', message: 'Unable to save profile.' });
      return;
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).json({ error: 'method_not_allowed', message: 'Use GET or PUT /api/profile/me' });
}
