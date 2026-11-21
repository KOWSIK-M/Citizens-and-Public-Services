// Vercel Serverless Function: POST /api/notifications/send-email
// Sends personalised scheme start-date alerts, closing deadlines, recent government scheme updates,
// and unclaimed eligible sector summaries directly to the citizen's opt-in Gmail via SMTP.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/auth.js';
import {
  isValidGmailOrEmail,
  sendNotificationEmail,
  type DigestAlertItem,
} from '../_lib/mailer.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use POST /api/notifications/send-email' });
    return;
  }

  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;

  const authUser = getAuthenticatedUser(req);
  const rawGmail =
    typeof body.gmail_address === 'string' && body.gmail_address.trim()
      ? body.gmail_address.trim().toLowerCase()
      : authUser?.email || '';

  if (!isValidGmailOrEmail(rawGmail)) {
    res.status(400).json({
      error: 'invalid_gmail',
      message: 'Please enter a valid Gmail or email address to receive scheme deadline alerts.',
    });
    return;
  }

  const displayName =
    authUser?.display_name ||
    (typeof body.display_name === 'string' && body.display_name.trim()
      ? body.display_name.trim().slice(0, 60)
      : 'Citizen');

  const unclaimedSectors = Array.isArray(body.unclaimed_sectors)
    ? (body.unclaimed_sectors as unknown[]).filter((s): s is string => typeof s === 'string').slice(0, 8)
    : [];

  try {
    const sql = getNeonSql();

    // Persist opt-in Gmail preference on user's Neon profile if signed in
    if (authUser && body.save_to_profile !== false) {
      await sql`
        INSERT INTO public.user_profiles (user_id, gmail_address, email_notifications_enabled, updated_at)
        VALUES (${authUser.sub}, ${rawGmail}, TRUE, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          gmail_address = EXCLUDED.gmail_address,
          email_notifications_enabled = TRUE,
          updated_at = NOW()
      `;
    }

    // Load live start/end dates & recent govt updates directly from Neon
    const notifRows = await sql`
      SELECT
        n.notification_type,
        n.title_en,
        n.body_en,
        n.sector,
        to_char(n.start_date, 'YYYY-MM-DD') AS start_date,
        to_char(n.end_date, 'YYYY-MM-DD') AS end_date,
        n.official_url
      FROM public.scheme_notifications n
      WHERE n.is_published = TRUE
      ORDER BY n.published_at DESC
      LIMIT 15
    `;

    const schemeRows = await sql`
      SELECT
        s.name_en,
        s.benefit_summary_en,
        s.category,
        to_char(s.application_open_on, 'YYYY-MM-DD') AS start_date,
        to_char(s.application_close_on, 'YYYY-MM-DD') AS end_date,
        COALESCE((SELECT src.source_url FROM public.scheme_sources src WHERE src.scheme_id = s.id ORDER BY src.retrieved_at DESC LIMIT 1), 'https://vsws.ap.gov.in/') AS official_url
      FROM public.schemes s
      WHERE s.is_published = TRUE
        AND (s.application_open_on IS NOT NULL OR s.application_close_on IS NOT NULL)
      ORDER BY s.application_close_on ASC NULLS LAST
      LIMIT 10
    `;

    const closingDeadlines: DigestAlertItem[] = [];
    const upcomingOpenings: DigestAlertItem[] = [];
    const recentUpdates: DigestAlertItem[] = [];

    for (const s of schemeRows) {
      const item: DigestAlertItem = {
        title: String(s.name_en),
        sector: String(s.category),
        startDate: s.start_date ? String(s.start_date) : null,
        endDate: s.end_date ? String(s.end_date) : null,
        officialUrl: String(s.official_url),
        summary: String(s.benefit_summary_en),
      };
      if (item.endDate) closingDeadlines.push(item);
      if (item.startDate) upcomingOpenings.push(item);
    }

    for (const n of notifRows) {
      const item: DigestAlertItem = {
        title: String(n.title_en),
        sector: String(n.sector || 'other'),
        startDate: n.start_date ? String(n.start_date) : null,
        endDate: n.end_date ? String(n.end_date) : null,
        officialUrl: String(n.official_url),
        summary: String(n.body_en),
      };
      if (n.notification_type === 'deadline_closing') {
        closingDeadlines.push(item);
      } else if (n.notification_type === 'window_opening') {
        upcomingOpenings.push(item);
      } else {
        recentUpdates.push(item);
      }
    }

    const result = await sendNotificationEmail({
      displayName,
      recipientEmail: rawGmail,
      upcomingOpenings: upcomingOpenings.slice(0, 6),
      closingDeadlines: closingDeadlines.slice(0, 6),
      recentUpdates: recentUpdates.slice(0, 6),
      unclaimedSectors,
    });

    await sql`
      INSERT INTO public.email_dispatch_logs (user_id, recipient_email, subject, status, provider_message_id)
      VALUES (
        ${authUser?.sub || null},
        ${rawGmail},
        ${result.subject},
        ${result.sent ? 'sent' : 'preview_only'},
        ${result.provider_message_id || null}
      )
    `;

    res.status(200).json(result);
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      res.status(503).json({ error: 'database_unavailable', message: err.message });
      return;
    }
    console.error('Send email error', err instanceof Error ? err.message : 'Unknown');
    res.status(500).json({
      error: 'email_dispatch_failed',
      message: 'Failed to dispatch SMTP email. Verify SMTP_USER and SMTP_PASS (Gmail App Password).',
    });
  }
}
