// Vercel Serverless Function: GET / POST / PATCH / DELETE /api/applications
// Persists authenticated citizen tracked, availed (sanctioned), and rejected scheme applications in Neon.
// Enforces Indic-aware PII firewall on visit/reference notes.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { requireAuth } from '../_lib/auth.js';
import { inspectTextForPii } from '../../src/utils/piiValidator.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export interface ApplicationsApiRequest extends ServerlessRequest {
  query?: Record<string, string | string[] | undefined>;
}

const VALID_STAGES = new Set([
  'upcoming_notify',
  'documents_prep',
  'submitted',
  'receipt_saved',
  'verification_pending',
  'sanctioned',
  'rejected',
]);

export default async function handler(
  req: ApplicationsApiRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const sql = getNeonSql();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT
          ua.scheme_id,
          s.scheme_code,
          s.name_en, s.name_te, s.name_hi,
          s.benefit_summary_en, s.benefit_summary_te, s.benefit_summary_hi,
          s.application_open_on, s.application_close_on,
          s.deadline_label_en, s.deadline_label_te, s.deadline_label_hi,
          s.status_check_url, s.grievance_helpline,
          COALESCE((SELECT src.source_url FROM public.scheme_sources src WHERE src.scheme_id = s.id ORDER BY src.retrieved_at DESC LIMIT 1), 'https://vsws.ap.gov.in/') AS official_source_url,
          ua.stage,
          ua.reference_note,
          ua.notify_when_opens,
          ua.submitted_at,
          ua.expected_sla_days,
          ua.outcome_checked_at,
          ua.rejection_reason_code,
          ua.checked_documents,
          ua.reminder_downloaded,
          ua.created_at AS added_at,
          ua.updated_at
        FROM public.user_applications ua
        JOIN public.schemes s ON s.id = ua.scheme_id
        WHERE ua.user_id = ${authUser.sub}
        ORDER BY ua.updated_at DESC
      `;
      res.status(200).json({ applications: rows });
      return;
    }

    const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
      string,
      unknown
    >;

    if (req.method === 'POST' || req.method === 'PATCH') {
      const schemeId = typeof body.scheme_id === 'string' ? body.scheme_id.trim() : '';
      if (!schemeId) {
        res.status(400).json({ error: 'missing_scheme_id', message: 'scheme_id is required.' });
        return;
      }

      const stage =
        typeof body.stage === 'string' && VALID_STAGES.has(body.stage)
          ? body.stage
          : 'documents_prep';

      const rawNote = typeof body.reference_note === 'string' ? body.reference_note : '';
      const piiCheck = inspectTextForPii(rawNote);
      const safeNote = piiCheck.sanitizedText.slice(0, 140);

      const notifyWhenOpens = Boolean(body.notify_when_opens);
      const reminderDownloaded = Boolean(body.reminder_downloaded);
      const rejectionReason =
        typeof body.rejection_reason_code === 'string' && body.rejection_reason_code.trim()
          ? body.rejection_reason_code.trim().slice(0, 64)
          : null;
      const checkedDocs =
        typeof body.checked_documents === 'object' && body.checked_documents !== null
          ? body.checked_documents
          : {};
      const submittedAt =
        typeof body.submitted_at === 'string' && body.submitted_at
          ? body.submitted_at
          : stage === 'submitted' || stage === 'receipt_saved' || stage === 'verification_pending'
          ? new Date().toISOString()
          : null;
      const outcomeCheckedAt =
        stage === 'sanctioned' || stage === 'rejected' ? new Date().toISOString() : null;

      const rows = await sql`
        INSERT INTO public.user_applications (
          user_id, scheme_id, stage, reference_note, notify_when_opens,
          submitted_at, outcome_checked_at, rejection_reason_code,
          checked_documents, reminder_downloaded, updated_at
        ) VALUES (
          ${authUser.sub}, ${schemeId}, ${stage}, ${safeNote}, ${notifyWhenOpens},
          ${submittedAt}, ${outcomeCheckedAt}, ${rejectionReason},
          ${JSON.stringify(checkedDocs)}::jsonb, ${reminderDownloaded}, NOW()
        )
        ON CONFLICT (user_id, scheme_id) DO UPDATE SET
          stage = EXCLUDED.stage,
          reference_note = EXCLUDED.reference_note,
          notify_when_opens = EXCLUDED.notify_when_opens,
          submitted_at = COALESCE(public.user_applications.submitted_at, EXCLUDED.submitted_at),
          outcome_checked_at = COALESCE(EXCLUDED.outcome_checked_at, public.user_applications.outcome_checked_at),
          rejection_reason_code = COALESCE(EXCLUDED.rejection_reason_code, public.user_applications.rejection_reason_code),
          checked_documents = EXCLUDED.checked_documents,
          reminder_downloaded = EXCLUDED.reminder_downloaded OR public.user_applications.reminder_downloaded,
          updated_at = NOW()
        RETURNING *
      `;
      res.status(200).json({ application: rows[0], had_pii_redacted: piiCheck.hasPii });
      return;
    }

    if (req.method === 'DELETE') {
      const schemeId =
        typeof req.query?.scheme_id === 'string'
          ? req.query.scheme_id.trim()
          : typeof body.scheme_id === 'string'
          ? body.scheme_id.trim()
          : '';
      if (!schemeId) {
        res.status(400).json({ error: 'missing_scheme_id', message: 'scheme_id is required.' });
        return;
      }
      await sql`
        DELETE FROM public.user_applications
        WHERE user_id = ${authUser.sub} AND scheme_id = ${schemeId}
      `;
      res.status(200).json({ deleted: true, scheme_id: schemeId });
      return;
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use GET, POST, PATCH, or DELETE' });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      res.status(503).json({ error: 'database_unavailable', message: err.message });
      return;
    }
    console.error('Applications API error', err instanceof Error ? err.name : 'Unknown');
    res.status(500).json({ error: 'applications_failed', message: 'Unable to sync applications.' });
  }
}
