// Vercel Serverless Function: GET /api/schemes
// 100% Live Neon PostgreSQL Catalog — ZERO mock data fallbacks.
// Returns public, published government schemes (or all schemes for authenticated admins with ?include_unpublished=1)
// along with editable rules, official sources, personalised document definitions, and application steps.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { getAuthenticatedUser } from '../_lib/auth.js';
import type { GovernmentScheme } from '../../src/types/scheme';
import type { SchemeListResponse } from '../../src/types/api';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export interface SchemesApiRequest extends ServerlessRequest {
  query?: Record<string, string | string[] | undefined>;
}

export async function loadPublishedSchemes(
  includeUnpublished = false
): Promise<Omit<SchemeListResponse, 'total'>> {
  const sql = getNeonSql();
  const rows = includeUnpublished
    ? await sql`
        SELECT jsonb_strip_nulls(to_jsonb(s) - 'created_at' - 'updated_at')
          || jsonb_build_object(
            'source', source.data,
            'rules', COALESCE((
              SELECT jsonb_agg(jsonb_strip_nulls(to_jsonb(r) - 'scheme_id' - 'updated_at') ORDER BY r.rule_id)
              FROM public.scheme_rules r WHERE r.scheme_id = s.id
            ), '[]'::jsonb),
            'documents', COALESCE((
              SELECT jsonb_agg(jsonb_strip_nulls(to_jsonb(d) - 'sort_order') ORDER BY d.sort_order, d.id)
              FROM public.scheme_documents d WHERE d.scheme_id = s.id
            ), '[]'::jsonb),
            'steps', COALESCE((
              SELECT jsonb_agg(jsonb_strip_nulls(to_jsonb(a) - 'id' - 'scheme_id') ORDER BY a.step_no)
              FROM public.application_steps a WHERE a.scheme_id = s.id
            ), '[]'::jsonb)
          ) AS scheme
        FROM public.schemes s
        JOIN LATERAL (
          SELECT jsonb_strip_nulls(to_jsonb(src) - 'created_at')
            || jsonb_build_object('verified_at', src.verified_at) AS data
          FROM public.scheme_sources src WHERE src.scheme_id = s.id
          ORDER BY src.retrieved_at DESC, src.id
          LIMIT 1
        ) source ON TRUE
        ORDER BY s.id
      `
    : await sql`
        SELECT jsonb_strip_nulls(to_jsonb(s) - 'created_at' - 'updated_at')
          || jsonb_build_object(
            'source', source.data,
            'rules', COALESCE((
              SELECT jsonb_agg(jsonb_strip_nulls(to_jsonb(r) - 'scheme_id' - 'updated_at') ORDER BY r.rule_id)
              FROM public.scheme_rules r WHERE r.scheme_id = s.id
            ), '[]'::jsonb),
            'documents', COALESCE((
              SELECT jsonb_agg(jsonb_strip_nulls(to_jsonb(d) - 'sort_order') ORDER BY d.sort_order, d.id)
              FROM public.scheme_documents d WHERE d.scheme_id = s.id
            ), '[]'::jsonb),
            'steps', COALESCE((
              SELECT jsonb_agg(jsonb_strip_nulls(to_jsonb(a) - 'id' - 'scheme_id') ORDER BY a.step_no)
              FROM public.application_steps a WHERE a.scheme_id = s.id
            ), '[]'::jsonb)
          ) AS scheme
        FROM public.schemes s
        JOIN LATERAL (
          SELECT jsonb_strip_nulls(to_jsonb(src) - 'created_at')
            || jsonb_build_object('verified_at', src.verified_at) AS data
          FROM public.scheme_sources src WHERE src.scheme_id = s.id
          ORDER BY src.retrieved_at DESC, src.id
          LIMIT 1
        ) source ON TRUE
        WHERE s.is_published = TRUE
        ORDER BY s.id
      `;

  return { schemes: rows.map((row) => row.scheme as GovernmentScheme), data_source: 'neon' };
}

export default async function handler(
  req: SchemesApiRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use GET /api/schemes' });
    return;
  }

  const levelFilter = typeof req.query?.level === 'string' ? req.query.level.toLowerCase() : null;
  const categoryFilter =
    typeof req.query?.category === 'string' ? req.query.category.toLowerCase() : null;
  const wantsUnpublished = req.query?.include_unpublished === '1';
  const authUser = wantsUnpublished ? getAuthenticatedUser(req) : null;
  const includeUnpublished = Boolean(wantsUnpublished && authUser?.role === 'admin');

  try {
    const { schemes, data_source } = await loadPublishedSchemes(includeUnpublished);
    const filtered = schemes.filter(
      (scheme) =>
        (!levelFilter || scheme.level === levelFilter) &&
        (!categoryFilter || scheme.category === categoryFilter)
    );

    res.setHeader(
      'Cache-Control',
      includeUnpublished ? 'no-store' : 'public, s-maxage=120, stale-while-revalidate=300'
    );
    const payload: SchemeListResponse = { schemes: filtered, total: filtered.length, data_source };
    res.status(200).json(payload);
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(503).json({
        error: 'catalog_unavailable',
        message: 'Neon PostgreSQL DATABASE_URL is not configured.',
      });
      return;
    }
    console.error('Scheme catalog query failed', error instanceof Error ? error.name : 'Unknown error');
    res.setHeader('Cache-Control', 'no-store');
    res.status(503).json({
      error: 'catalog_unavailable',
      message: 'The Neon scheme catalog is temporarily unavailable.',
    });
  }
}
