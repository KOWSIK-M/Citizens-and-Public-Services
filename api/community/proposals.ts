// Vercel Serverless Function: GET / POST / PATCH /api/community/proposals
// 100% Live Neon PostgreSQL — ZERO mock seed fallbacks.
// Guardrails:
// 1. Mandatory server-side Indic-aware PII block (HTTP 422 on Aadhaar/phone/PAN/VoterID/bank/email).
// 2. Anonymous SHA-256 voter-token deduplication (never stores IPs or real identities).

import { createHash } from 'node:crypto';
import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { inspectTextForPii } from '../../src/utils/piiValidator.js';
import {
  ESCALATION_VOTE_THRESHOLD,
  type CommunityProposal,
  type EscalationTargetType,
  type ProposalsListResponse,
} from '../../src/types/community';
import type { SchemeCategory } from '../../src/types/scheme';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export interface ProposalsApiRequest extends ServerlessRequest {
  query?: Record<string, string | string[] | undefined>;
}

const VALID_CATEGORIES: SchemeCategory[] = [
  'scholarship',
  'pension',
  'farm',
  'health',
  'housing',
  'employment',
  'women_child',
  'other',
];

const VALID_ESCALATION_TARGETS: EscalationTargetType[] = [
  'ap_gsws_1902',
  'district_collectorate',
  'ngo_legal_aid',
];

function scrubForbiddenPromises(text: string): string {
  return text
    .replace(/\bguaranteed\b/gi, 'requested')
    .replace(/\b100%\s*approved\b/gi, 'submitted for review');
}

function hashVoterToken(rawToken: string): string {
  return createHash('sha256').update(`claimsaathi-vote:${rawToken}`).digest('hex');
}

export default async function handler(
  req: ProposalsApiRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const districtFilter =
      typeof req.query?.district === 'string' ? req.query.district.trim() : null;
    const categoryFilter =
      typeof req.query?.category === 'string' ? req.query.category.trim() : null;

    try {
      const sql = getNeonSql('COMMUNITY_DATABASE_URL');
      const rows = await sql`
        SELECT id, title, description, category, district, target_cohort,
               escalation_target, author_persona_label, upvotes_count,
               escalation_threshold, is_validated, is_sample, created_at
        FROM public.community_proposals
        ORDER BY upvotes_count DESC, created_at DESC
        LIMIT 80
      `;
      let list = rows as unknown as CommunityProposal[];
      if (districtFilter && districtFilter !== 'All AP' && districtFilter !== 'all') {
        list = list.filter(
          (p) =>
            p.district.toLowerCase() === districtFilter.toLowerCase() || p.district === 'All AP'
        );
      }
      if (categoryFilter && categoryFilter !== 'all') {
        list = list.filter((p) => p.category === categoryFilter);
      }
      const payload: ProposalsListResponse = {
        proposals: list,
        escalation_threshold: ESCALATION_VOTE_THRESHOLD,
        data_source: 'neon',
      };
      res.status(200).json(payload);
      return;
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        res.status(503).json({ error: 'database_unavailable', message: err.message });
        return;
      }
      res.status(503).json({
        error: 'community_unavailable',
        message: 'Neon community_proposals table is temporarily unavailable.',
      });
      return;
    }
  }

  if (req.method === 'POST') {
    const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
      string,
      unknown
    >;

    const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
    const rawDesc = typeof body.description === 'string' ? body.description.trim() : '';
    const rawCohort =
      typeof body.target_cohort === 'string' && body.target_cohort.trim()
        ? body.target_cohort.trim()
        : 'Underserved AP Household';
    const rawPersona =
      typeof body.author_persona_label === 'string' && body.author_persona_label.trim()
        ? body.author_persona_label.trim()
        : 'AP Citizen • Anonymous';
    const rawDistrict =
      typeof body.district === 'string' && body.district.trim()
        ? body.district.trim().slice(0, 50)
        : 'All AP';

    if (rawTitle.length < 8 || rawTitle.length > 160 || rawDesc.length < 15 || rawDesc.length > 700) {
      res.status(400).json({
        error: 'invalid_proposal_length',
        message: 'Provide a clear title (8–160 chars) and welfare gap description (15–700 chars).',
      });
      return;
    }

    const combinedCheck = inspectTextForPii(
      `${rawTitle}\n${rawDesc}\n${rawCohort}\n${rawPersona}`
    );
    if (combinedCheck.hasPii) {
      res.status(422).json({
        error: 'pii_detected',
        detected_types: combinedCheck.detectedTypes,
        message:
          'Personal numbers (Aadhaar, phone, PAN, Voter ID, bank account, or email) are strictly prohibited in community proposals.',
      });
      return;
    }

    const category: SchemeCategory = VALID_CATEGORIES.includes(body.category as SchemeCategory)
      ? (body.category as SchemeCategory)
      : 'other';
    const escalationTarget: EscalationTargetType = VALID_ESCALATION_TARGETS.includes(
      body.escalation_target as EscalationTargetType
    )
      ? (body.escalation_target as EscalationTargetType)
      : 'ap_gsws_1902';

    const newProposal: CommunityProposal = {
      id: `prop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title: scrubForbiddenPromises(rawTitle),
      description: scrubForbiddenPromises(rawDesc),
      category,
      district: rawDistrict,
      target_cohort: scrubForbiddenPromises(rawCohort.slice(0, 80)),
      escalation_target: escalationTarget,
      author_persona_label: scrubForbiddenPromises(rawPersona.slice(0, 75)),
      upvotes_count: 1,
      escalation_threshold: ESCALATION_VOTE_THRESHOLD,
      is_validated: true,
      is_sample: Boolean(body.is_sample ?? false),
      created_at: new Date().toISOString(),
    };

    try {
      const sql = getNeonSql('COMMUNITY_DATABASE_URL');
      await sql`
        INSERT INTO public.community_proposals (
          id, title, description, category, district, target_cohort,
          escalation_target, author_persona_label, upvotes_count,
          escalation_threshold, is_validated, is_sample, created_at
        ) VALUES (
          ${newProposal.id}, ${newProposal.title}, ${newProposal.description},
          ${newProposal.category}, ${newProposal.district}, ${newProposal.target_cohort},
          ${newProposal.escalation_target}, ${newProposal.author_persona_label},
          ${newProposal.upvotes_count}, ${newProposal.escalation_threshold},
          ${newProposal.is_validated}, ${newProposal.is_sample}, ${newProposal.created_at}
        )
      `;
      res.status(201).json({ proposal: newProposal, data_source: 'neon' });
      return;
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        res.status(503).json({ error: 'database_unavailable', message: err.message });
        return;
      }
      res.status(503).json({ error: 'proposal_save_failed', message: 'Unable to save proposal to Neon.' });
      return;
    }
  }

  if (req.method === 'PATCH') {
    const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
      string,
      unknown
    >;
    const proposalId = typeof body.proposal_id === 'string' ? body.proposal_id.trim() : '';
    const voterToken = typeof body.voter_token === 'string' ? body.voter_token.trim() : '';

    if (!proposalId || voterToken.length < 8) {
      res.status(400).json({
        error: 'invalid_vote_request',
        message: 'Both proposal_id and anonymous voter_token are required.',
      });
      return;
    }

    const voterHash = hashVoterToken(voterToken);

    try {
      const sql = getNeonSql('COMMUNITY_DATABASE_URL');
      const inserted = await sql`
        INSERT INTO public.community_proposal_votes (proposal_id, voter_hash)
        VALUES (${proposalId}, ${voterHash})
        ON CONFLICT (proposal_id, voter_hash) DO NOTHING
        RETURNING proposal_id
      `;

      if (inserted.length === 0) {
        const existing = await sql`
          SELECT * FROM public.community_proposals WHERE id = ${proposalId} LIMIT 1
        `;
        if (existing.length === 0) {
          res.status(404).json({ error: 'proposal_not_found', message: 'Proposal not found.' });
          return;
        }
        res.status(200).json({
          proposal: existing[0],
          already_voted: true,
          threshold_reached:
            Number(existing[0].upvotes_count) >= Number(existing[0].escalation_threshold),
          data_source: 'neon',
        });
        return;
      }

      const updated = await sql`
        UPDATE public.community_proposals
        SET upvotes_count = upvotes_count + 1
        WHERE id = ${proposalId}
        RETURNING *
      `;
      if (updated.length === 0) {
        res.status(404).json({ error: 'proposal_not_found', message: 'Proposal not found.' });
        return;
      }
      res.status(200).json({
        proposal: updated[0],
        already_voted: false,
        threshold_reached:
          Number(updated[0].upvotes_count) >= Number(updated[0].escalation_threshold),
        data_source: 'neon',
      });
      return;
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        res.status(503).json({ error: 'database_unavailable', message: err.message });
        return;
      }
      res.status(503).json({ error: 'vote_failed', message: 'Unable to record vote in Neon.' });
      return;
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH');
  res.status(405).json({ error: 'method_not_allowed', message: 'Use GET, POST, or PATCH' });
}
