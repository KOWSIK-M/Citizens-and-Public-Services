// Vercel Serverless Function: GET / PATCH /api/admin/schemes
// Role-Based Authorization (`role === 'admin'` via JWT) for Neon Scheme Rule Governance & Audit Logging.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const adminUser = requireAdmin(req, res);
  if (!adminUser) return;

  try {
    const sql = getNeonSql();

    if (req.method === 'GET') {
      const auditRows = await sql`
        SELECT id, occurred_at AS timestamp, actor, action, scheme_id, scheme_code,
               rule_id, previous_value, new_value, source_note
        FROM public.audit_log
        ORDER BY occurred_at DESC
        LIMIT 80
      `;
      res.status(200).json({ audit_log: auditRows, admin: adminUser.email });
      return;
    }

    if (req.method === 'PATCH') {
      const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
        string,
        unknown
      >;
      const action = typeof body.action === 'string' ? body.action : '';
      const schemeId = typeof body.scheme_id === 'string' ? body.scheme_id.trim() : '';

      if (!schemeId) {
        res.status(400).json({ error: 'missing_scheme_id', message: 'scheme_id is required.' });
        return;
      }

      const schemeRows = await sql`
        SELECT id, scheme_code, is_published FROM public.schemes WHERE id = ${schemeId} LIMIT 1
      `;
      if (schemeRows.length === 0) {
        res.status(404).json({ error: 'scheme_not_found', message: 'Scheme not found in Neon.' });
        return;
      }
      const schemeCode = String(schemeRows[0].scheme_code);

      if (action === 'update_rule') {
        const ruleId = typeof body.rule_id === 'string' ? body.rule_id.trim() : '';
        const newValue = typeof body.value === 'string' ? body.value.trim() : '';
        const newOp = typeof body.operator === 'string' ? body.operator.trim() : null;
        if (!ruleId || !newValue) {
          res.status(400).json({ error: 'invalid_rule_update', message: 'rule_id and value are required.' });
          return;
        }
        const prevRows = await sql`
          SELECT operator, value, rule_version FROM public.scheme_rules
          WHERE rule_id = ${ruleId} AND scheme_id = ${schemeId} LIMIT 1
        `;
        if (prevRows.length === 0) {
          res.status(404).json({ error: 'rule_not_found', message: 'Rule not found.' });
          return;
        }
        const prev = prevRows[0];
        const nextOp = newOp || String(prev.operator);
        await sql`
          UPDATE public.scheme_rules
          SET operator = ${nextOp}, value = ${newValue}, rule_version = rule_version + 1, updated_at = NOW()
          WHERE rule_id = ${ruleId} AND scheme_id = ${schemeId}
        `;
        await sql`
          INSERT INTO public.audit_log (actor, action, scheme_id, scheme_code, rule_id, previous_value, new_value, source_note)
          VALUES (
            ${`${adminUser.display_name} (${adminUser.email})`},
            'rule_updated',
            ${schemeId},
            ${schemeCode},
            ${ruleId},
            ${`${prev.operator} ${prev.value} (v${prev.rule_version})`},
            ${`${nextOp} ${newValue}`},
            ${typeof body.source_note === 'string' && body.source_note.trim() ? body.source_note.trim() : 'Admin Rule Update'}
          )
        `;
        res.status(200).json({ ok: true, action: 'update_rule', scheme_id: schemeId, rule_id: ruleId });
        return;
      }

      if (action === 'verify_source') {
        const today = new Date().toISOString().slice(0, 10);
        const goRef = typeof body.go_reference === 'string' ? body.go_reference.trim() : null;
        await sql`
          UPDATE public.scheme_sources
          SET verified_at = ${today},
              verified_by = ${adminUser.display_name},
              go_reference = COALESCE(${goRef}, go_reference)
          WHERE scheme_id = ${schemeId}
        `;
        await sql`
          INSERT INTO public.audit_log (actor, action, scheme_id, scheme_code, previous_value, new_value, source_note)
          VALUES (
            ${`${adminUser.display_name} (${adminUser.email})`},
            'source_verified',
            ${schemeId},
            ${schemeCode},
            'Prior verification state',
            ${`Verified (${today})`},
            ${goRef || 'Verified via Admin Studio'}
          )
        `;
        res.status(200).json({ ok: true, action: 'verify_source', verified_at: today });
        return;
      }

      if (action === 'mark_pending') {
        await sql`
          UPDATE public.scheme_sources
          SET verified_at = NULL, verified_by = 'Pending Re-Verification'
          WHERE scheme_id = ${schemeId}
        `;
        await sql`
          INSERT INTO public.audit_log (actor, action, scheme_id, scheme_code, previous_value, new_value, source_note)
          VALUES (
            ${`${adminUser.display_name} (${adminUser.email})`},
            'source_marked_pending',
            ${schemeId},
            ${schemeCode},
            'Verified',
            'PENDING VERIFICATION (FR-09 Hold)',
            ${typeof body.source_note === 'string' ? body.source_note : 'Flagged for G.O. re-verification'}
          )
        `;
        res.status(200).json({ ok: true, action: 'mark_pending' });
        return;
      }

      if (action === 'toggle_published') {
        const nextPub = !Boolean(schemeRows[0].is_published);
        await sql`
          UPDATE public.schemes SET is_published = ${nextPub}, updated_at = NOW() WHERE id = ${schemeId}
        `;
        await sql`
          INSERT INTO public.audit_log (actor, action, scheme_id, scheme_code, previous_value, new_value, source_note)
          VALUES (
            ${`${adminUser.display_name} (${adminUser.email})`},
            'publish_toggled',
            ${schemeId},
            ${schemeCode},
            ${nextPub ? 'Draft' : 'Published'},
            ${nextPub ? 'Published' : 'Draft'},
            'Visibility updated via Neon Admin Studio'
          )
        `;
        res.status(200).json({ ok: true, action: 'toggle_published', is_published: nextPub });
        return;
      }

      res.status(400).json({ error: 'unsupported_action', message: 'Unsupported admin action.' });
      return;
    }

    res.setHeader('Allow', 'GET, PATCH');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use GET or PATCH /api/admin/schemes' });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      res.status(503).json({ error: 'database_unavailable', message: err.message });
      return;
    }
    console.error('Admin schemes API error', err instanceof Error ? err.name : 'Unknown');
    res.status(500).json({ error: 'admin_mutation_failed', message: 'Unable to update Neon catalog.' });
  }
}
