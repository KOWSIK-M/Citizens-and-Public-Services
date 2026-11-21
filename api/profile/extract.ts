// Vercel Serverless Function: POST /api/profile/extract
// Guardrails:
// 1. Server-side Indic-aware PII Gate (HTTP 422 on Aadhaar/phone/PAN/VoterID/bank/IFSC/email).
// 2. Max 500-char intake limit + 30 req/min sliding-window IP rate limiter.
// 3. Claude Haiku (`claude-3-5-haiku-latest`, temp 0) structured coarse-band extraction when
//    `ANTHROPIC_API_KEY` is set; zero-key deterministic trilingual NLP fallback otherwise.

import { inspectTextForPii } from '../../src/utils/piiValidator.js';
import { extractCoarseProfileFromText } from '../../src/services/profileExtractor.js';
import { APP_CONSTANTS } from '../../src/config/constants.js';
import { AP_DISTRICTS } from '../../src/config/bands.js';
import type {
  AgeBand,
  CitizenProfile,
  IncomeBand,
  LandHoldingBand,
  OccupationCategory,
  SocialCategory,
  TriStateFlag,
} from '../../src/types/profile';
import type { ExtractProfileResponse } from '../../src/types/api';
import type { SupportedLanguage } from '../../src/types/i18n';

export interface ServerlessRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
}

export interface ServerlessResponse {
  setHeader(name: string, value: string): void;
  status(code: number): ServerlessResponse;
  json(payload: unknown): void;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const ipRequestLog = new Map<string, number[]>();

export function resetExtractRateLimiter(): void {
  ipRequestLog.clear();
}

function checkRateLimit(ip: string, now = Date.now()): { allowed: boolean; retryAfterSec: number } {
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const recent = (ipRequestLog.get(ip) || []).filter((ts) => ts > cutoff);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = recent[0] || now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    ipRequestLog.set(ip, recent);
    return { allowed: false, retryAfterSec };
  }
  recent.push(now);
  ipRequestLog.set(ip, recent);
  return { allowed: true, retryAfterSec: 0 };
}

function resolveClientIp(req: ServerlessRequest): string {
  const xff = req.headers?.['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    return xff.split(',')[0].trim();
  }
  if (Array.isArray(xff) && xff[0]) {
    return xff[0].split(',')[0].trim();
  }
  const realIp = req.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  return req.socket?.remoteAddress || 'anonymous-local';
}

const VALID_AGE_BANDS = new Set<AgeBand>([
  'under_18',
  '18_25',
  '26_40',
  '41_60',
  '60_plus',
  'unknown',
]);
const VALID_INCOME_BANDS = new Set<IncomeBand>([
  'below_1_2L',
  '1_2L_to_2_5L',
  '2_5L_to_5L',
  'above_5L',
  'unknown',
]);
const VALID_OCCUPATIONS = new Set<OccupationCategory>([
  'farmer',
  'daily_wage',
  'student',
  'homemaker',
  'self_employed',
  'unemployed',
  'other',
  'unknown',
]);
const VALID_SOCIAL_CATEGORIES = new Set<SocialCategory>([
  'OC',
  'BC',
  'SC',
  'ST',
  'minority',
  'unknown',
]);
const VALID_LAND_BANDS = new Set<LandHoldingBand>([
  'none',
  'marginal_under_2_5_acres',
  'small_2_5_to_5_acres',
  'large_above_5_acres',
  'unknown',
]);
const VALID_TRI_STATE = new Set<TriStateFlag>(['yes', 'no', 'unknown']);
const VALID_DISTRICTS = new Set<string>(AP_DISTRICTS);

function sanitizeClaudeProfile(raw: Record<string, unknown>): Partial<CitizenProfile> {
  const clean: Partial<CitizenProfile> = { state_code: 'AP' };

  if (typeof raw.age_band === 'string' && VALID_AGE_BANDS.has(raw.age_band as AgeBand)) {
    if (raw.age_band !== 'unknown') clean.age_band = raw.age_band as AgeBand;
  }
  if (typeof raw.district_code === 'string' && VALID_DISTRICTS.has(raw.district_code)) {
    clean.district_code = raw.district_code;
  }
  if (typeof raw.income_band === 'string' && VALID_INCOME_BANDS.has(raw.income_band as IncomeBand)) {
    if (raw.income_band !== 'unknown') clean.income_band = raw.income_band as IncomeBand;
  }
  if (
    typeof raw.occupation_category === 'string' &&
    VALID_OCCUPATIONS.has(raw.occupation_category as OccupationCategory)
  ) {
    if (raw.occupation_category !== 'unknown') {
      clean.occupation_category = raw.occupation_category as OccupationCategory;
    }
  }
  if (
    typeof raw.social_category === 'string' &&
    VALID_SOCIAL_CATEGORIES.has(raw.social_category as SocialCategory)
  ) {
    if (raw.social_category !== 'unknown') {
      clean.social_category = raw.social_category as SocialCategory;
    }
  }
  if (
    typeof raw.land_holding_band === 'string' &&
    VALID_LAND_BANDS.has(raw.land_holding_band as LandHoldingBand)
  ) {
    if (raw.land_holding_band !== 'unknown') {
      clean.land_holding_band = raw.land_holding_band as LandHoldingBand;
    }
  }

  const triFlags: Array<
    | 'has_school_student'
    | 'has_college_student'
    | 'is_widow_or_single_woman'
    | 'has_disability'
    | 'is_tenant_farmer_ccrc'
    | 'has_white_ration_card'
  > = [
    'has_school_student',
    'has_college_student',
    'is_widow_or_single_woman',
    'has_disability',
    'is_tenant_farmer_ccrc',
    'has_white_ration_card',
  ];

  for (const key of triFlags) {
    const val = raw[key];
    if (typeof val === 'string' && VALID_TRI_STATE.has(val as TriStateFlag) && val !== 'unknown') {
      clean[key] = val as TriStateFlag;
    }
  }

  return clean;
}

const CLAUDE_EXTRACTION_SYSTEM_PROMPT = `You are ClaimSaathi's coarse welfare profile extractor for Andhra Pradesh citizens.
Extract ONLY non-identifying coarse categories from the citizen's plain-language description (English, Telugu, or Hindi).
NEVER infer or decide scheme eligibility. NEVER echo names, addresses, or ID numbers.
Respond with ONLY a single valid JSON object matching these exact allowed enum values (omit or set "unknown" if not stated):
{
  "age_band": "under_18" | "18_25" | "26_40" | "41_60" | "60_plus" | "unknown",
  "district_code": "<one of the 26 Andhra Pradesh districts or null>",
  "income_band": "below_1_2L" | "1_2L_to_2_5L" | "2_5L_to_5L" | "above_5L" | "unknown",
  "occupation_category": "farmer" | "daily_wage" | "student" | "homemaker" | "self_employed" | "unemployed" | "other" | "unknown",
  "social_category": "OC" | "BC" | "SC" | "ST" | "minority" | "unknown",
  "land_holding_band": "none" | "marginal_under_2_5_acres" | "small_2_5_to_5_acres" | "large_above_5_acres" | "unknown",
  "has_school_student": "yes" | "no" | "unknown",
  "has_college_student": "yes" | "no" | "unknown",
  "is_widow_or_single_woman": "yes" | "no" | "unknown",
  "has_disability": "yes" | "no" | "unknown",
  "is_tenant_farmer_ccrc": "yes" | "no" | "unknown",
  "has_white_ration_card": "yes" | "no" | "unknown"
}`;

async function extractViaClaudeHaiku(
  text: string,
  apiKey: string
): Promise<Partial<CitizenProfile> | null> {
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      temperature: 0,
      system: CLAUDE_EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    }),
  });

  if (!resp.ok) return null;
  const payload = (await resp.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const rawText = payload.content?.find((c) => c.type === 'text')?.text || '';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  return sanitizeClaudeProfile(parsed);
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use POST /api/profile/extract' });
    return;
  }

  const ip = resolveClientIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfterSec));
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Too many profile extraction requests. Please wait a minute and try again.',
    });
    return;
  }

  let parsedBody: Record<string, unknown> = {};
  try {
    if (typeof req.body === 'string') {
      parsedBody = JSON.parse(req.body) as Record<string, unknown>;
    } else if (req.body && typeof req.body === 'object') {
      parsedBody = req.body as Record<string, unknown>;
    }
  } catch {
    res.status(400).json({ error: 'invalid_json', message: 'Request body must be valid JSON.' });
    return;
  }

  const text = typeof parsedBody.text === 'string' ? parsedBody.text : '';
  const rawLang = parsedBody.language;
  const language: SupportedLanguage =
    rawLang === 'te' || rawLang === 'hi' || rawLang === 'en' ? rawLang : 'en';

  if (!text.trim()) {
    res.status(400).json({ error: 'empty_text', message: 'Description text is required.' });
    return;
  }

  if (text.length > APP_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
    res.status(422).json({
      error: 'description_too_long',
      max_length: APP_CONSTANTS.MAX_DESCRIPTION_LENGTH,
      message: `Description exceeds maximum length of ${APP_CONSTANTS.MAX_DESCRIPTION_LENGTH} characters.`,
    });
    return;
  }

  // Defense-in-depth Server-Side PII Gate (never logs or forwards PII)
  const piiCheck = inspectTextForPii(text);
  if (piiCheck.hasPii) {
    res.status(422).json({
      error: 'pii_detected',
      detected_types: piiCheck.detectedTypes,
      message_en: piiCheck.warningMessageEn,
      message_te: piiCheck.warningMessageTe,
      message_hi: piiCheck.warningMessageHi,
    });
    return;
  }

  const deterministicResult = extractCoarseProfileFromText(text, language);
  if (deterministicResult.extraction_source === 'preset') {
    res.status(200).json(deterministicResult);
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && apiKey.trim()) {
    try {
      const aiProfile = await extractViaClaudeHaiku(text, apiKey.trim());
      if (aiProfile) {
        const mergedProfile: Partial<CitizenProfile> = {
          ...deterministicResult.proposed_profile,
          ...aiProfile,
        };
        const mergedFields = Array.from(
          new Set([
            ...deterministicResult.extracted_fields,
            ...Object.keys(aiProfile).filter((k) => k !== 'state_code'),
          ])
        );
        const remainingQuestions = deterministicResult.clarifying_questions.filter((q) => {
          const val = (mergedProfile as Record<string, unknown>)[q.field_name];
          return val === undefined || val === 'unknown';
        });

        const response: ExtractProfileResponse = {
          proposed_profile: mergedProfile,
          extracted_fields: mergedFields,
          missing_critical_fields: remainingQuestions.map((q) => q.field_name),
          clarifying_questions: remainingQuestions,
          is_fallback: false,
          extraction_source: 'claude_haiku',
        };
        res.status(200).json(response);
        return;
      }
    } catch {
      // Fall back cleanly to deterministic trilingual NLP if upstream AI is unreachable
    }
  }

  res.status(200).json(deterministicResult);
}
