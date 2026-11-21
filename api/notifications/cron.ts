// Vercel Serverless Function: GET /api/notifications/cron
// Automated batch deadline & recent scheme mailer for all opted-in Neon users.
// Protected by `CRON_SECRET` Bearer token or Admin JWT authorization.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/auth.js';
import { sendNotificationEmail, type DigestAlertItem } from '../_lib/mailer.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use GET /api/notifications/cron' });
    return;
  }

  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = String(req.headers?.authorization || req.headers?.Authorization || '');
  const hasCronAuth = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);
  const adminUser = getAuthenticatedUser(req);

  if (!hasCronAuth && adminUser?.role !== 'admin') {
    res.status(401).json({
      error: 'unauthorized',
      message: 'Provide CRON_SECRET Bearer token or sign in as an admin to run scheduled notifications.',
    });
    return;
  }

  try {
    const sql = getNeonSql();
    const subscribers = await sql`
      SELECT u.id, u.display_name, up.gmail_address
      FROM public.users u
      JOIN public.user_profiles up ON up.user_id = u.id
      WHERE up.email_notifications_enabled = TRUE
        AND up.gmail_address IS NOT NULL
      LIMIT 100
    `;

    const notifs = await sql`
      SELECT notification_type, title_en, body_en, sector,
             to_char(start_date, 'YYYY-MM-DD') AS start_date,
             to_char(end_date, 'YYYY-MM-DD') AS end_date,
             official_url
      FROM public.scheme_notifications
      WHERE is_published = TRUE
      ORDER BY published_at DESC
      LIMIT 10
    `;

    const openings: DigestAlertItem[] = [];
    const closing: DigestAlertItem[] = [];
    const recent: DigestAlertItem[] = [];

    for (const n of notifs) {
      const item: DigestAlertItem = {
        title: String(n.title_en),
        sector: String(n.sector || 'other'),
        startDate: n.start_date ? String(n.start_date) : null,
        endDate: n.end_date ? String(n.end_date) : null,
        officialUrl: String(n.official_url),
        summary: String(n.body_en),
      };
      if (n.notification_type === 'deadline_closing') closing.push(item);
      else if (n.notification_type === 'window_opening') openings.push(item);
      else recent.push(item);
    }

    let sentCount = 0;
    let previewCount = 0;

    for (const sub of subscribers) {
      const result = await sendNotificationEmail({
        displayName: String(sub.display_name),
        recipientEmail: String(sub.gmail_address),
        upcomingOpenings: openings,
        closingDeadlines: closing,
        recentUpdates: recent,
        unclaimedSectors: [],
      });
      if (result.sent) sentCount += 1;
      else previewCount += 1;

      await sql`
        INSERT INTO public.email_dispatch_logs (user_id, recipient_email, subject, status, provider_message_id)
        VALUES (
          ${String(sub.id)},
          ${String(sub.gmail_address)},
          ${result.subject},
          ${result.sent ? 'sent' : 'preview_only'},
          ${result.provider_message_id || null}
        )
      `;
    }

    res.status(200).json({
      ok: true,
      total_subscribers: subscribers.length,
      sent_count: sentCount,
      preview_count: previewCount,
    });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      res.status(503).json({ error: 'database_unavailable', message: err.message });
      return;
    }
    res.status(500).json({ error: 'cron_failed', message: 'Scheduled notification batch failed.' });
  }
}
