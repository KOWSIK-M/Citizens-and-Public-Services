// Vercel Serverless Function: GET / PATCH / POST /api/notifications
// Serves Recent Government Schemes, Start Date / End Date Window Alerts & Policy Updates directly from Neon.
// - GET: Public + per-user read state (if signed in) + dynamic start/end date countdown alerts from `public.schemes`.
// - PATCH: Marks notification(s) as read for the signed-in user.
// - POST: Admin-only (RBAC) publishing of a new government scheme notification into Neon.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { getAuthenticatedUser, requireAdmin, requireAuth } from '../_lib/auth.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export interface NotificationItemDto {
  id: string;
  scheme_id: string | null;
  notification_type: 'recent_scheme' | 'window_opening' | 'deadline_closing' | 'policy_update';
  title_en: string;
  title_te: string;
  title_hi: string;
  body_en: string;
  body_te: string;
  body_hi: string;
  sector: string;
  start_date: string | null;
  end_date: string | null;
  official_url: string;
  published_at: string;
  is_read: boolean;
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const sql = getNeonSql();

    if (req.method === 'GET') {
      const authUser = getAuthenticatedUser(req);

      const notifRows = await sql`
        SELECT
          n.id, n.scheme_id, n.notification_type,
          n.title_en, n.title_te, n.title_hi,
          n.body_en, n.body_te, n.body_hi,
          n.sector,
          to_char(n.start_date, 'YYYY-MM-DD') AS start_date,
          to_char(n.end_date, 'YYYY-MM-DD') AS end_date,
          n.official_url,
          n.published_at
        FROM public.scheme_notifications n
        WHERE n.is_published = TRUE
        ORDER BY n.published_at DESC
        LIMIT 40
      `;

      const readSet = new Set<string>();
      if (authUser) {
        const readRows = await sql`
          SELECT notification_id FROM public.user_notification_reads WHERE user_id = ${authUser.sub}
        `;
        for (const r of readRows) {
          readSet.add(String(r.notification_id));
        }
      }

      // Also pull live scheme start/end date schedule directly from public.schemes
      const schemeDateRows = await sql`
        SELECT
          s.id, s.scheme_code, s.category, s.status,
          s.name_en, s.name_te, s.name_hi,
          s.benefit_summary_en, s.benefit_summary_te, s.benefit_summary_hi,
          to_char(s.application_open_on, 'YYYY-MM-DD') AS application_open_on,
          to_char(s.application_close_on, 'YYYY-MM-DD') AS application_close_on,
          COALESCE((SELECT src.source_url FROM public.scheme_sources src WHERE src.scheme_id = s.id ORDER BY src.retrieved_at DESC LIMIT 1), 'https://vsws.ap.gov.in/') AS official_url
        FROM public.schemes s
        WHERE s.is_published = TRUE
          AND (s.application_open_on IS NOT NULL OR s.application_close_on IS NOT NULL)
        ORDER BY s.application_close_on ASC NULLS LAST
      `;

      const notifications: NotificationItemDto[] = notifRows.map((row) => ({
        id: String(row.id),
        scheme_id: row.scheme_id ? String(row.scheme_id) : null,
        notification_type: row.notification_type as NotificationItemDto['notification_type'],
        title_en: String(row.title_en),
        title_te: String(row.title_te),
        title_hi: String(row.title_hi),
        body_en: String(row.body_en),
        body_te: String(row.body_te),
        body_hi: String(row.body_hi),
        sector: String(row.sector || 'other'),
        start_date: row.start_date ? String(row.start_date) : null,
        end_date: row.end_date ? String(row.end_date) : null,
        official_url: String(row.official_url),
        published_at: String(row.published_at),
        is_read: readSet.has(String(row.id)),
      }));

      res.status(200).json({
        notifications,
        scheme_windows: schemeDateRows,
        unread_count: notifications.filter((n) => !n.is_read).length,
        data_source: 'neon',
      });
      return;
    }

    if (req.method === 'PATCH') {
      const authUser = requireAuth(req, res);
      if (!authUser) return;

      const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
        string,
        unknown
      >;
      const notificationId =
        typeof body.notification_id === 'string' ? body.notification_id.trim() : '';

      if (body.mark_all === true) {
        await sql`
          INSERT INTO public.user_notification_reads (user_id, notification_id)
          SELECT ${authUser.sub}, n.id FROM public.scheme_notifications n WHERE n.is_published = TRUE
          ON CONFLICT (user_id, notification_id) DO NOTHING
        `;
        res.status(200).json({ ok: true, marked_all: true });
        return;
      }

      if (!notificationId) {
        res.status(400).json({ error: 'missing_notification_id', message: 'notification_id is required.' });
        return;
      }

      await sql`
        INSERT INTO public.user_notification_reads (user_id, notification_id)
        VALUES (${authUser.sub}, ${notificationId})
        ON CONFLICT (user_id, notification_id) DO NOTHING
      `;
      res.status(200).json({ ok: true, notification_id: notificationId });
      return;
    }

    if (req.method === 'POST') {
      const adminUser = requireAdmin(req, res);
      if (!adminUser) return;

      const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
        string,
        unknown
      >;
      const titleEn = typeof body.title_en === 'string' ? body.title_en.trim() : '';
      const bodyEn = typeof body.body_en === 'string' ? body.body_en.trim() : '';
      const officialUrl =
        typeof body.official_url === 'string' && body.official_url.startsWith('https://')
          ? body.official_url.trim()
          : 'https://vsws.ap.gov.in/';

      if (titleEn.length < 6 || bodyEn.length < 12) {
        res.status(400).json({
          error: 'invalid_notification',
          message: 'Provide a clear English title (6+ chars) and body (12+ chars).',
        });
        return;
      }

      const id = `notif-${Date.now().toString(36)}`;
      const notifType =
        body.notification_type === 'window_opening' ||
        body.notification_type === 'deadline_closing' ||
        body.notification_type === 'policy_update'
          ? body.notification_type
          : 'recent_scheme';

      const rows = await sql`
        INSERT INTO public.scheme_notifications (
          id, scheme_id, notification_type,
          title_en, title_te, title_hi,
          body_en, body_te, body_hi,
          sector, start_date, end_date, official_url, is_published
        ) VALUES (
          ${id},
          ${typeof body.scheme_id === 'string' && body.scheme_id ? body.scheme_id : null},
          ${notifType},
          ${titleEn},
          ${typeof body.title_te === 'string' && body.title_te.trim() ? body.title_te.trim() : titleEn},
          ${typeof body.title_hi === 'string' && body.title_hi.trim() ? body.title_hi.trim() : titleEn},
          ${bodyEn},
          ${typeof body.body_te === 'string' && body.body_te.trim() ? body.body_te.trim() : bodyEn},
          ${typeof body.body_hi === 'string' && body.body_hi.trim() ? body.body_hi.trim() : bodyEn},
          ${typeof body.sector === 'string' && body.sector ? body.sector : 'other'},
          ${typeof body.start_date === 'string' && body.start_date ? body.start_date : null},
          ${typeof body.end_date === 'string' && body.end_date ? body.end_date : null},
          ${officialUrl},
          TRUE
        )
        RETURNING *
      `;
      res.status(201).json({ notification: rows[0] });
      return;
    }

    res.setHeader('Allow', 'GET, PATCH, POST');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use GET, PATCH, or POST' });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      res.status(503).json({ error: 'database_unavailable', message: err.message });
      return;
    }
    console.error('Notifications API error', err instanceof Error ? err.name : 'Unknown');
    res.status(500).json({ error: 'notifications_failed', message: 'Unable to load notifications.' });
  }
}
