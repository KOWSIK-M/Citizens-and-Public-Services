import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import extractHandler, {
  resetExtractRateLimiter,
  type ServerlessResponse,
} from '../api/profile/extract';
import explainHandler from '../api/explain';
import schemesHandler from '../api/schemes/index';
import { evaluateDeterministicEligibility } from '@/services/deterministicEngine';
import { SYNTHETIC_SCENARIOS } from '@/config/constants';
import { MOCK_GOVERNMENT_SCHEMES } from './fixtures/sampleSchemes';

function createMockRes() {
  let statusCode = 200;
  let jsonBody: unknown = null;
  const headers: Record<string, string> = {};

  const res: ServerlessResponse = {
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: unknown) {
      jsonBody = payload;
    },
  };

  return {
    res,
    getStatus: () => statusCode,
    getJson: <T = Record<string, unknown>>() => jsonBody as T,
    getHeaders: () => headers,
  };
}

describe('Vercel Serverless API Layer (`api/*`)', () => {
  beforeEach(() => {
    resetExtractRateLimiter();
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => vi.unstubAllEnvs());

  it('POST /api/profile/extract blocks Aadhaar / Indic PII at the server gate with HTTP 422', async () => {
    const mock = createMockRes();
    await extractHandler(
      {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.10' },
        body: { text: 'My Aadhaar is ౧౨౩౪ ౫౬౭౮ ౯౦౧౨ in Guntur', language: 'te' },
      },
      mock.res
    );
    expect(mock.getStatus()).toBe(422);
    expect(mock.getJson<{ error: string }>().error).toBe('pii_detected');
  });

  it('POST /api/profile/extract rejects GET with 405 and >500-char payloads with 422', async () => {
    const getMock = createMockRes();
    await extractHandler({ method: 'GET' }, getMock.res);
    expect(getMock.getStatus()).toBe(405);

    const longMock = createMockRes();
    await extractHandler(
      { method: 'POST', body: { text: 'a'.repeat(501), language: 'en' } },
      longMock.res
    );
    expect(longMock.getStatus()).toBe(422);
    expect(longMock.getJson<{ error: string }>().error).toBe('description_too_long');
  });

  it('POST /api/profile/extract extracts valid coarse profile with zero API keys configured', async () => {
    const mock = createMockRes();
    await extractHandler(
      {
        method: 'POST',
        headers: { 'x-forwarded-for': '203.0.113.11' },
        body: {
          text: 'I am a 45 year old farmer in Kurnool with 2 acres of dry land.',
          language: 'en',
        },
      },
      mock.res
    );
    expect(mock.getStatus()).toBe(200);
    const body = mock.getJson<{
      proposed_profile: Record<string, unknown>;
      extraction_source: string;
    }>();
    expect(body.proposed_profile.age_band).toBe('41_60');
    expect(body.proposed_profile.occupation_category).toBe('farmer');
    expect(body.proposed_profile.district_code).toBe('Kurnool');
    expect(body.extraction_source).toBe('deterministic_nlp');
  });

  it('POST /api/profile/extract enforces 30 req/min sliding-window IP rate limit with HTTP 429', async () => {
    const ip = '198.51.100.77';
    for (let i = 0; i < 30; i++) {
      const okMock = createMockRes();
      await extractHandler(
        {
          method: 'POST',
          headers: { 'x-forwarded-for': ip },
          body: { text: 'I am a 65 year old widow in Guntur.', language: 'en' },
        },
        okMock.res
      );
      expect(okMock.getStatus()).toBe(200);
    }

    const blockedMock = createMockRes();
    await extractHandler(
      {
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
        body: { text: 'I am a 65 year old widow in Guntur.', language: 'en' },
      },
      blockedMock.res
    );
    expect(blockedMock.getStatus()).toBe(429);
    expect(blockedMock.getHeaders()['retry-after']).toBeDefined();
  });

  it('POST /api/explain returns grounded trilingual explanations without forbidden guarantee wording and blocks PII', async () => {
    const scenarioB = SYNTHETIC_SCENARIOS.find((s) => s.id === 'scenario_b')!;
    const evalRes = evaluateDeterministicEligibility(scenarioB.profile, MOCK_GOVERNMENT_SCHEMES);
    const matchedScheme = evalRes.results.likely_eligible[0];

    for (const lang of ['en', 'te', 'hi'] as const) {
      const mock = createMockRes();
      await explainHandler(
        {
          method: 'POST',
          body: { scheme_result: matchedScheme, language: lang },
        },
        mock.res
      );
      expect(mock.getStatus()).toBe(200);
      const data = mock.getJson<{ explanation: string; disclaimer: string }>();
      expect(data.explanation.length).toBeGreaterThan(20);
      expect(data.explanation.toLowerCase()).not.toContain('guaranteed');
      expect(data.disclaimer.length).toBeGreaterThan(10);
    }

    const piiMock = createMockRes();
    await explainHandler(
      {
        method: 'POST',
        body: { scheme_result: matchedScheme, note: 'Call 9876543210' },
      },
      piiMock.res
    );
    expect(piiMock.getStatus()).toBe(422);
  });

  it('GET /api/schemes returns 503 catalog_unavailable (zero mock data fallback) when DATABASE_URL is absent', async () => {
    vi.stubEnv('DATABASE_URL', undefined);
    vi.stubEnv('VERCEL', undefined);

    const mock = createMockRes();
    await schemesHandler({ method: 'GET' }, mock.res);

    expect(mock.getStatus()).toBe(503);
    expect(mock.getHeaders()['cache-control']).toBe('no-store');
    expect(mock.getJson()).toHaveProperty('error', 'catalog_unavailable');
  });

  it('GET /api/schemes rejects non-GET methods with 405', async () => {
    const mock = createMockRes();
    await schemesHandler({ method: 'POST' }, mock.res);
    expect(mock.getStatus()).toBe(405);
  });
});
