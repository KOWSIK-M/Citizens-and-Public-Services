import { describe, it, expect, afterEach, vi } from 'vitest';
import proposalsHandler from '../api/community/proposals';
import messagesHandler from '../api/community/messages';
import {
  buildSchemeOpeningIcs,
  evaluateFollowUpStatus,
} from '../src/utils/calendarReminder';
import { AP_REJECTION_DIAGNOSTICS } from '../src/config/rejectionDiagnostics';
import type { ServerlessResponse } from '../api/profile/extract';

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

describe('Community PII Firewalls, Zero-Mock Neon Guard & Lifecycle Follow-Ups', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('blocks PII (HTTP 422) before DB write when creating a community proposal or chat message', async () => {
    const badProp = createMockRes();
    await proposalsHandler(
      {
        method: 'POST',
        body: {
          title: 'Support for street vendors in Guntur',
          description: 'Call me on 9876543210 or Aadhaar 2345 6789 0123 for details.',
          category: 'employment',
          district: 'Guntur',
        },
      },
      badProp.res
    );
    expect(badProp.getStatus()).toBe(422);

    const badChat = createMockRes();
    await messagesHandler(
      {
        method: 'POST',
        body: {
          district: 'Guntur',
          author_persona_label: 'Farmer • Guntur',
          message_body: 'My Telugu phone number is ౯౮౭౬౫౪౩౨౧౦ please check status.',
        },
      },
      badChat.res
    );
    expect(badChat.getStatus()).toBe(422);
  });

  it('returns 503 database_unavailable (zero mock data fallback) on GET /api/community/* when DATABASE_URL is absent', async () => {
    vi.stubEnv('DATABASE_URL', undefined);
    vi.stubEnv('COMMUNITY_DATABASE_URL', undefined);

    const propMock = createMockRes();
    await proposalsHandler({ method: 'GET' }, propMock.res);
    expect(propMock.getStatus()).toBe(503);

    const msgMock = createMockRes();
    await messagesHandler({ method: 'GET' }, msgMock.res);
    expect(msgMock.getStatus()).toBe(503);
  });

  it('validates invalid vote requests (HTTP 400) before querying Neon', async () => {
    const badVote = createMockRes();
    await proposalsHandler(
      {
        method: 'PATCH',
        body: { proposal_id: '', voter_token: 'short' },
      },
      badVote.res
    );
    expect(badVote.getStatus()).toBe(400);
  });

  it('evaluates pre-launch opening, SLA overdue follow-ups, and Claim Doctor diagnostics', () => {
    const ref = new Date('2026-11-21T10:00:00Z');

    const waiting = evaluateFollowUpStatus(
      { stage: 'upcoming_notify', application_open_on: '2026-12-10' },
      ref
    );
    expect(waiting.state).toBe('waiting_to_open');

    const opened = evaluateFollowUpStatus(
      { stage: 'upcoming_notify', application_open_on: '2026-11-15' },
      ref
    );
    expect(opened.state).toBe('just_opened');

    const overdue = evaluateFollowUpStatus(
      { stage: 'submitted', submitted_at: '2026-10-20T09:00:00Z', expected_sla_days: 21 },
      ref
    );
    expect(overdue.state).toBe('sla_overdue');
    expect(overdue.daysSinceSubmission).toBeGreaterThanOrEqual(21);

    const ics = buildSchemeOpeningIcs(
      {
        scheme_id: 'ap-talliki-vandanam',
        scheme_code: 'AP-EDU-01',
        name_en: 'Talliki Vandanam',
        name_te: 'తల్లికి వందనం',
        name_hi: 'तल्लिकि वंदनम',
        benefit_summary_en: '₹15,000/yr',
        benefit_summary_te: '₹15,000',
        benefit_summary_hi: '₹15,000',
        official_source_url: 'https://vsws.ap.gov.in/',
        application_open_on: '2026-12-01',
      },
      'en'
    );
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261201');
    expect(AP_REJECTION_DIAGNOSTICS.length).toBe(6);
  });
});
