import { describe, it, expect } from 'vitest';
import { AP_DISTRICTS } from '../src/config/bands';
import {
  AP_SERVICE_CENTRES,
  findCuratedCentres,
} from '../src/config/apServiceCentres';
import {
  checkCertificateValidity,
  resolveApiSetuDocSpec,
} from '../src/config/apiSetuSchemas';
import locatorHandler from '../api/locator/nearby';
import pinLookupHandler from '../api/apisetu/pin-lookup';
import sandboxHandler from '../api/apisetu/sandbox';
import type { ServerlessResponse } from '../api/profile/extract';

function createMockRes() {
  let statusCode = 200;
  let bodyPayload: unknown = null;
  const headers: Record<string, string> = {};
  const res: ServerlessResponse = {
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: unknown) {
      bodyPayload = payload;
    },
  };
  return {
    res,
    getStatus: () => statusCode,
    getBody: () => bodyPayload,
  };
}

describe('Sachivalayam/MeeSeva Locator & API Setu 3-Module Suite', () => {
  it('covers all 26 Andhra Pradesh districts with verified Sachivalayam and MeeSeva centres', () => {
    const coveredDistricts = new Set(AP_SERVICE_CENTRES.map((c) => c.district));
    for (const district of AP_DISTRICTS) {
      expect(coveredDistricts.has(district)).toBe(true);
    }
    expect(AP_SERVICE_CENTRES.length).toBeGreaterThanOrEqual(78);
  });

  it('sorts centres by Haversine distance when GPS coordinates are provided', () => {
    // Coordinates near Guntur HQ (16.3067, 80.4365)
    const sorted = findCuratedCentres({ lat: 16.3067, lng: 80.4365 });
    expect(sorted[0].district).toBe('Guntur');
    expect(sorted[0].distance_km).toBeDefined();
    expect(sorted[0].distance_km!).toBeLessThan(sorted[sorted.length - 1].distance_km!);
  });

  it('returns curated district centres and helplines from GET /api/locator/nearby', async () => {
    const mock = createMockRes();
    await locatorHandler(
      { method: 'GET', query: { district: 'Kurnool' } },
      mock.res
    );
    expect(mock.getStatus()).toBe(200);
    const data = mock.getBody() as { centres: Array<{ district: string }>; helplines: unknown[] };
    expect(data.centres.length).toBeGreaterThanOrEqual(3);
    expect(data.centres.every((c) => c.district === 'Kurnool')).toBe(true);
    expect(data.helplines.length).toBeGreaterThanOrEqual(4);
  });

  it('validates AP certificate expiry boundaries (INCER 4-yr & CCRC 11-month)', () => {
    const refDate = new Date('2026-11-01T00:00:00Z');

    // INCER issued 2 years ago -> valid
    const validIncer = checkCertificateValidity('INCER', 2024, 11, refDate);
    expect(validIncer.status).toBe('valid');

    // INCER issued 5 years ago -> expired
    const expiredIncer = checkCertificateValidity('INCER', 2021, 5, refDate);
    expect(expiredIncer.status).toBe('expired_renew_needed');

    // CCRC issued 13 months ago -> expired
    const expiredCcrc = checkCertificateValidity('CCRC', 2025, 8, refDate);
    expect(expiredCcrc.status).toBe('expired_renew_needed');

    // CSCER (Caste Certificate) -> permanent
    const castePerm = checkCertificateValidity('CSCER', 2019, 1, refDate);
    expect(castePerm.status).toBe('permanent');

    // Document resolver maps canonical keys accurately
    const spec = resolveApiSetuDocSpec({
      canonical_key: 'income_certificate',
      document_name_en: 'AP Meeseva Income Certificate',
    });
    expect(spec?.docType).toBe('INCER');
  });

  it('validates 6-digit PIN lookup and rejects malformed/12-digit inputs on /api/apisetu/pin-lookup', async () => {
    const badMock = createMockRes();
    await pinLookupHandler(
      { method: 'GET', query: { pin: '456789012345' } },
      badMock.res
    );
    expect(badMock.getStatus()).toBe(400);

    const okMock = createMockRes();
    await pinLookupHandler(
      { method: 'GET', query: { pin: '522001' } },
      okMock.res
    );
    expect(okMock.getStatus()).toBe(200);
    const body = okMock.getBody() as { pin_code: string; desks: Array<{ dbt_seeding_supported: boolean }> };
    expect(body.pin_code).toBe('522001');
    expect(body.desks.length).toBeGreaterThan(0);
    expect(body.desks[0].dbt_seeding_supported).toBe(true);
  });

  it('enforces synthetic-only (403) and PII block (422) on POST /api/apisetu/sandbox', async () => {
    // 1. Block non-sample citizen profiles
    const realCitizenMock = createMockRes();
    await sandboxHandler(
      { method: 'POST', body: { is_sample: false, doc_type: 'INCER' } },
      realCitizenMock.res
    );
    expect(realCitizenMock.getStatus()).toBe(403);

    // 2. Block PII even if is_sample = true
    const piiMock = createMockRes();
    await sandboxHandler(
      {
        method: 'POST',
        body: {
          is_sample: true,
          doc_type: 'INCER',
          persona_label: 'Aadhaar 4567 8901 2345',
        },
      },
      piiMock.res
    );
    expect(piiMock.getStatus()).toBe(422);

    // 3. Succeed cleanly on synthetic demo token
    const synthMock = createMockRes();
    await sandboxHandler(
      {
        method: 'POST',
        body: {
          is_sample: true,
          doc_type: 'INCER',
          synthetic_token: 'SYNTH-AP-INCER-2026-0041',
          district_code: 'Guntur',
        },
      },
      synthMock.res
    );
    expect(synthMock.getStatus()).toBe(200);
    const okPayload = synthMock.getBody() as {
      apiVersion: string;
      sandboxMode: string;
      verificationResult: { status: string };
    };
    expect(okPayload.apiVersion).toBe('3.0.0');
    expect(okPayload.sandboxMode).toBe('SYNTHETIC_PERSONA_ONLY');
    expect(okPayload.verificationResult.status).toBe('VERIFIED_SYNTHETIC_DEMO');
  });
});
