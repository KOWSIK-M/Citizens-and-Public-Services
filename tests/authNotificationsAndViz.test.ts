import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  requireAuth,
  requireAdmin,
} from '../api/_lib/auth';
import {
  isValidGmailOrEmail,
  buildDeadlineDigestEmail,
  sendNotificationEmail,
} from '../api/_lib/mailer';
import adminSchemesHandler from '../api/admin/schemes';
import { computeSectorCoverage } from '../src/components/insights/SectorCoverageVisualizer';
import { MOCK_GOVERNMENT_SCHEMES } from './fixtures/sampleSchemes';
import { SYNTHETIC_SCENARIOS } from '../src/config/constants';
import type { ServerlessResponse } from '../api/profile/extract';
import type { TrackedApplication } from '../src/types/tracker';

function createMockRes() {
  let statusCode = 200;
  let bodyPayload: unknown = null;
  const res: ServerlessResponse = {
    setHeader() {},
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

describe('Simple HS256 JWT Auth, RBAC Authorization, Gmail SMTP & Sector Visualization', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('hashes passwords securely with scrypt and signs/verifies HS256 JWT tokens', () => {
    const hash = hashPassword('MySecurePass2026!');
    expect(hash.startsWith('scrypt:')).toBe(true);
    expect(verifyPassword('MySecurePass2026!', hash)).toBe(true);
    expect(verifyPassword('WrongPass123!', hash)).toBe(false);

    const token = signJwt({
      id: '11111111-1111-1111-1111-111111111111',
      email: 'farmer@gmail.com',
      display_name: 'Rama Rao',
      role: 'citizen',
    });

    const decoded = verifyJwt(token);
    expect(decoded?.sub).toBe('11111111-1111-1111-1111-111111111111');
    expect(decoded?.role).toBe('citizen');
    expect(decoded?.email).toBe('farmer@gmail.com');

    // Tampered token must fail signature check
    const tampered = `${token.slice(0, -4)}XXXX`;
    expect(verifyJwt(tampered)).toBeNull();
  });

  it('enforces RBAC: rejects guests (401) and non-admin citizens (403) on /api/admin/schemes', async () => {
    const guestRes = createMockRes();
    await adminSchemesHandler({ method: 'GET', headers: {} }, guestRes.res);
    expect(guestRes.getStatus()).toBe(401);

    const citizenToken = signJwt({
      id: '22222222-2222-2222-2222-222222222222',
      email: 'citizen@gmail.com',
      display_name: 'Sita',
      role: 'citizen',
    });
    const citizenRes = createMockRes();
    await adminSchemesHandler(
      { method: 'GET', headers: { authorization: `Bearer ${citizenToken}` } },
      citizenRes.res
    );
    expect(citizenRes.getStatus()).toBe(403);

    const adminToken = signJwt({
      id: '33333333-3333-3333-3333-333333333333',
      email: 'officer@ap.gov.in',
      display_name: 'GSWS Officer',
      role: 'admin',
    });
    const authRes = createMockRes();
    const checkedAuth = requireAuth(
      { headers: { authorization: `Bearer ${citizenToken}` } },
      authRes.res
    );
    expect(checkedAuth?.role).toBe('citizen');

    const adminCheckRes = createMockRes();
    const checkedAdmin = requireAdmin(
      { headers: { authorization: `Bearer ${adminToken}` } },
      adminCheckRes.res
    );
    expect(checkedAdmin?.role).toBe('admin');
  });

  it('builds Gmail deadline & recent scheme digests and returns clean preview when SMTP env vars are unset', async () => {
    vi.stubEnv('SMTP_USER', undefined);
    vi.stubEnv('SMTP_PASS', undefined);

    expect(isValidGmailOrEmail('citizen.ap@gmail.com')).toBe(true);
    expect(isValidGmailOrEmail('not-an-email')).toBe(false);

    const digest = buildDeadlineDigestEmail({
      displayName: 'Lakshmi',
      recipientEmail: 'lakshmi@gmail.com',
      upcomingOpenings: [
        {
          title: 'Talliki Vandanam',
          sector: 'scholarship',
          startDate: '2026-11-01',
          endDate: '2026-12-31',
          officialUrl: 'https://cse.ap.gov.in/',
          summary: '₹15,000/yr per school student',
        },
      ],
      closingDeadlines: [],
      recentUpdates: [],
      unclaimedSectors: ['Agriculture & Farmers', 'Universal Healthcare'],
    });
    expect(digest.subject).toContain('ClaimSaathi Alert');
    expect(digest.html).toContain('Talliki Vandanam');
    expect(digest.html).toContain('Agriculture &amp; Farmers');
    expect(digest.html.toLowerCase()).toContain('likely eligible');

    const dispatch = await sendNotificationEmail({
      displayName: 'Lakshmi',
      recipientEmail: 'lakshmi@gmail.com',
      upcomingOpenings: [],
      closingDeadlines: [],
      recentUpdates: [],
      unclaimedSectors: ['Social Security Pensions'],
    });
    expect(dispatch.smtp_configured).toBe(false);
    expect(dispatch.sent).toBe(false);
    expect(dispatch.preview_html).toContain('Social Security Pensions');
  });

  it('computes availed vs still likely eligible sectors accurately with interactive filters', () => {
    const farmerScenario = SYNTHETIC_SCENARIOS.find((s) => s.id === 'scenario_c')!;
    const farmerScheme = MOCK_GOVERNMENT_SCHEMES.find((s) => s.category === 'farm')!;

    const availedApp: TrackedApplication = {
      scheme_id: farmerScheme.id,
      scheme_code: farmerScheme.scheme_code,
      name_en: farmerScheme.name_en,
      name_te: farmerScheme.name_te,
      name_hi: farmerScheme.name_hi,
      benefit_summary_en: farmerScheme.benefit_summary_en,
      benefit_summary_te: farmerScheme.benefit_summary_te,
      benefit_summary_hi: farmerScheme.benefit_summary_hi,
      official_source_url: farmerScheme.source.source_url,
      stage: 'sanctioned',
      reference_note: '',
      added_at: '2026-11-01T00:00:00Z',
      updated_at: '2026-11-10T00:00:00Z',
      reminder_downloaded: true,
    };

    const fullCov = computeSectorCoverage(
      MOCK_GOVERNMENT_SCHEMES,
      farmerScenario.profile,
      [availedApp],
      { level: 'all', sector: 'all', status: 'all' }
    );

    expect(fullCov.availedEntries.length).toBe(1);
    expect(fullCov.availedSectorNames).toContain('Agriculture & Farmers');
    expect(fullCov.stillEligibleEntries.length).toBeGreaterThan(0);
    expect(fullCov.coveragePercent).toBeGreaterThan(0);
    expect(fullCov.coveragePercent).toBeLessThan(100);

    // Filter strictly to availed
    const onlyAvailed = computeSectorCoverage(
      MOCK_GOVERNMENT_SCHEMES,
      farmerScenario.profile,
      [availedApp],
      { level: 'all', sector: 'all', status: 'availed' }
    );
    expect(onlyAvailed.availedEntries.length).toBe(1);
    expect(onlyAvailed.stillEligibleEntries.length).toBe(0);
  });
});
