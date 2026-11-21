// Vercel Serverless Function: GET / POST / PATCH /api/community/messages
// 100% Live Neon PostgreSQL — ZERO mock seed fallbacks.
// Guardrails:
// 1. Strict server-side Indic-aware PII gate (HTTP 422 on Aadhaar/phone/PAN/VoterID/bank/email).
// 2. Coarse anonymous persona badges only—zero real names or contact info.

import { DatabaseUnavailableError, getNeonSql } from '../_lib/db.js';
import { inspectTextForPii } from '../../src/utils/piiValidator.js';
import type {
  CommunityChatMessage,
  MessagesListResponse,
} from '../../src/types/community';
import type { ServerlessRequest, ServerlessResponse } from '../profile/extract';

export interface MessagesApiRequest extends ServerlessRequest {
  query?: Record<string, string | string[] | undefined>;
}

function scrubForbiddenClaims(text: string): string {
  return text
    .replace(/\bguaranteed\b/gi, 'likely')
    .replace(/\b100%\s*approved\b/gi, 'subject to verification');
}

export default async function handler(
  req: MessagesApiRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const districtFilter =
      typeof req.query?.district === 'string' ? req.query.district.trim() : null;

    try {
      const sql = getNeonSql('COMMUNITY_DATABASE_URL');
      const rows = await sql`
        SELECT id, district, topic_category, author_persona_label,
               message_body, helpful_count, linked_proposal_id, is_sample, created_at
        FROM public.community_messages
        ORDER BY created_at DESC
        LIMIT 80
      `;
      let list = rows as unknown as CommunityChatMessage[];
      if (districtFilter && districtFilter !== 'All AP' && districtFilter !== 'all') {
        list = list.filter(
          (m) =>
            m.district.toLowerCase() === districtFilter.toLowerCase() || m.district === 'All AP'
        );
      }
      const payload: MessagesListResponse = {
        messages: list,
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
        message: 'Neon community_messages table is temporarily unavailable.',
      });
      return;
    }
  }

  if (req.method === 'POST') {
    const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
      string,
      unknown
    >;

    const rawMsg = typeof body.message_body === 'string' ? body.message_body.trim() : '';
    const rawPersona =
      typeof body.author_persona_label === 'string' && body.author_persona_label.trim()
        ? body.author_persona_label.trim()
        : 'Local Citizen • AP';
    const rawDistrict =
      typeof body.district === 'string' && body.district.trim()
        ? body.district.trim().slice(0, 50)
        : 'All AP';
    const rawTopic =
      typeof body.topic_category === 'string' && body.topic_category.trim()
        ? body.topic_category.trim().slice(0, 40)
        : 'general';

    if (rawMsg.length < 5 || rawMsg.length > 600) {
      res.status(400).json({
        error: 'invalid_message_length',
        message: 'Community message must be between 5 and 600 characters.',
      });
      return;
    }

    const piiResult = inspectTextForPii(`${rawMsg}\n${rawPersona}`);
    if (piiResult.hasPii) {
      res.status(422).json({
        error: 'pii_detected',
        detected_types: piiResult.detectedTypes,
        message:
          'Privacy Shield: Aadhaar, phone numbers, PAN, Voter ID, bank accounts, and emails cannot be posted in public chat.',
      });
      return;
    }

    const newMsg: CommunityChatMessage = {
      id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      district: rawDistrict,
      topic_category: rawTopic,
      author_persona_label: scrubForbiddenClaims(rawPersona.slice(0, 75)),
      message_body: scrubForbiddenClaims(rawMsg),
      helpful_count: 0,
      linked_proposal_id:
        typeof body.linked_proposal_id === 'string' ? body.linked_proposal_id : null,
      is_sample: Boolean(body.is_sample ?? false),
      created_at: new Date().toISOString(),
    };

    try {
      const sql = getNeonSql('COMMUNITY_DATABASE_URL');
      await sql`
        INSERT INTO public.community_messages (
          id, district, topic_category, author_persona_label,
          message_body, helpful_count, linked_proposal_id, is_sample, created_at
        ) VALUES (
          ${newMsg.id}, ${newMsg.district}, ${newMsg.topic_category},
          ${newMsg.author_persona_label}, ${newMsg.message_body},
          ${newMsg.helpful_count}, ${newMsg.linked_proposal_id},
          ${newMsg.is_sample}, ${newMsg.created_at}
        )
      `;
      res.status(201).json({ message: newMsg, data_source: 'neon' });
      return;
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        res.status(503).json({ error: 'database_unavailable', message: err.message });
        return;
      }
      res.status(503).json({ error: 'message_save_failed', message: 'Unable to post message to Neon.' });
      return;
    }
  }

  if (req.method === 'PATCH') {
    const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
      string,
      unknown
    >;
    const messageId = typeof body.message_id === 'string' ? body.message_id.trim() : '';
    if (!messageId) {
      res.status(400).json({ error: 'invalid_message_id', message: 'message_id is required.' });
      return;
    }

    try {
      const sql = getNeonSql('COMMUNITY_DATABASE_URL');
      const updated = await sql`
        UPDATE public.community_messages
        SET helpful_count = helpful_count + 1
        WHERE id = ${messageId}
        RETURNING *
      `;
      if (updated.length === 0) {
        res.status(404).json({ error: 'message_not_found', message: 'Message not found.' });
        return;
      }
      res.status(200).json({ message: updated[0], data_source: 'neon' });
      return;
    } catch (err) {
      if (err instanceof DatabaseUnavailableError) {
        res.status(503).json({ error: 'database_unavailable', message: err.message });
        return;
      }
      res.status(503).json({ error: 'helpful_failed', message: 'Unable to update reaction in Neon.' });
      return;
    }
  }

  res.setHeader('Allow', 'GET, POST, PATCH');
  res.status(405).json({ error: 'method_not_allowed', message: 'Use GET, POST, or PATCH' });
}
