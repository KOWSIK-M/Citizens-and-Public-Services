// Playwright E2E Stateful API Fixture Layer (Test-Only — Zero Mock Data in App Runtime)
// Intercepts `/api/**` during local/CI E2E runs so the entire website can be verified without
// requiring live Neon credentials. Set `PLAYWRIGHT_LIVE_API=1` to run directly against live Neon.

import type { Page } from '@playwright/test';
import { MOCK_GOVERNMENT_SCHEMES } from '../../tests/fixtures/sampleSchemes';
import { extractCoarseProfileFromText } from '../../src/services/profileExtractor';
import { inspectTextForPii } from '../../src/utils/piiValidator';
import { AP_OFFICIAL_HELPLINES, findCuratedCentres } from '../../src/config/apServiceCentres';
import { API_SETU_DOC_SCHEMAS, type ApiSetuDocType } from '../../src/config/apiSetuSchemas';
import { buildDeadlineDigestEmail } from '../../api/_lib/mailer';
import type { CommunityChatMessage, CommunityProposal } from '../../src/types/community';
import type { SchemeNotificationItem } from '../../src/types/auth';

interface TestUserRecord {
  id: string;
  email: string;
  password: string;
  display_name: string;
  role: 'citizen' | 'admin';
  profile: Record<string, unknown>;
}

export async function attachE2eApiFixtures(page: Page): Promise<void> {
  if (process.env.PLAYWRIGHT_LIVE_API === '1') {
    return;
  }

  const schemes = JSON.parse(JSON.stringify(MOCK_GOVERNMENT_SCHEMES));
  const users = new Map<string, TestUserRecord>();
  let activeUserEmail: string | null = null;
  const applicationsByUser = new Map<string, Array<Record<string, unknown>>>();

  // Pre-seed an admin account for RBAC authorization verification
  users.set('admin@ap.gov.in', {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@ap.gov.in',
    password: 'AdminPassword2026!',
    display_name: 'GSWS Policy Verifier',
    role: 'admin',
    profile: {
      age_band: '26_40',
      state_code: 'AP',
      district_code: 'Guntur',
      income_band: '2_5L_to_5L',
      occupation_category: 'other',
      social_category: 'OC',
      land_holding_band: 'none',
      language_pref: 'en',
      household_members: [],
      has_school_student: 'no',
      has_college_student: 'no',
      is_widow_or_single_woman: 'no',
      has_disability: 'no',
      is_tenant_farmer_ccrc: 'no',
      has_white_ration_card: 'no',
      gmail_address: 'admin@ap.gov.in',
      email_notifications_enabled: true,
    },
  });

  const auditLog: Array<Record<string, unknown>> = [
    {
      id: 'aud-e2e-001',
      timestamp: '2026-11-20T10:00:00Z',
      actor: 'GSWS Policy Verifier (admin@ap.gov.in)',
      action: 'source_verified',
      scheme_id: 'ap-sch-002',
      scheme_code: 'AP-NTR-BHAROSA-PENSION',
      previous_value: 'PENDING VERIFICATION',
      new_value: 'Verified (2026-11-20)',
      source_note: 'G.O.Ms.No. 43',
    },
  ];

  const notifications: SchemeNotificationItem[] = [
    {
      id: 'notif-e2e-talliki',
      scheme_id: 'ap-sch-001',
      notification_type: 'window_opening',
      title_en: 'Talliki Vandanam (₹15,000/child) — Verification Window Open',
      title_te: 'తల్లికి వందనం — ధృవీకరణ ప్రారంభం',
      title_hi: 'तल्लिकि वंदनम — सत्यापन प्रारंभ',
      body_en: 'Confirm school UDISE+ mother mapping and NPCI bank seeding before the closing date.',
      body_te: 'పాఠశాల UDISE+ తల్లి వివరాల నమోదు పూర్తి చేయండి.',
      body_hi: 'स्कूल UDISE+ माता मैपिंग और NPCI सीडिंग पूरी करें।',
      sector: 'scholarship',
      start_date: '2026-11-01',
      end_date: '2026-12-31',
      official_url: 'https://cse.ap.gov.in/',
      published_at: '2026-11-21T06:00:00Z',
      is_read: false,
    },
    {
      id: 'notif-e2e-deepam',
      scheme_id: 'ap-sch-006',
      notification_type: 'recent_scheme',
      title_en: 'Recent Govt Scheme Update: Deepam 2.0 (3 Free LPG Cylinders/Year)',
      title_te: 'కొత్త ప్రభుత్వ పథకం అప్‌డేట్: దీపం 2.0',
      title_hi: 'ताज़ा सरकारी योजना अपडेट: दीपम 2.0',
      body_en: 'Eligible AP White Rice Card households receive 3 free LPG refill subsidies per year via DBT.',
      body_te: 'తెల్ల రైస్ కార్డు కుటుంబాలకు ఏడాదికి 3 ఉచిత గ్యాస్ సిలిండర్లు.',
      body_hi: 'सफेद राइस कार्ड परिवारों को प्रति वर्ष 3 निःशुल्क गैस सिलेंडर सब्सिडी।',
      sector: 'women_child',
      start_date: '2026-11-01',
      end_date: '2027-03-31',
      official_url: 'https://apcivilsups.ap.gov.in/',
      published_at: '2026-11-21T08:00:00Z',
      is_read: false,
    },
  ];

  let proposals: CommunityProposal[] = [
    {
      id: 'prop-ap-gig-monsoon-01',
      title: 'Monsoon Income & Accident Relief Scheme for Urban Delivery & Auto Workers',
      description:
        'Platform delivery riders and rented-auto drivers lose livelihood during cyclone/heavy-rain alerts and need seasonal livelihood relief.',
      category: 'employment',
      district: 'Visakhapatnam',
      target_cohort: 'Gig Riders & Rented-Auto Drivers',
      escalation_target: 'ap_gsws_1902',
      author_persona_label: 'Self-Employed Driver • Visakhapatnam',
      upvotes_count: 9,
      escalation_threshold: 10,
      is_validated: true,
      is_sample: false,
      created_at: '2026-11-19T09:30:00Z',
    },
    {
      id: 'prop-ap-weaver-coop-02',
      title: 'Extend Power-Loom & Yarn Subsidy to Independent Household Handloom Helpers',
      description:
        'Auxiliary handloom daily-wage helpers in Guntur and Prakasam need Sachivalayam occupational verification.',
      category: 'employment',
      district: 'Guntur',
      target_cohort: 'Handloom Auxiliary Daily-Wage Families',
      escalation_target: 'district_collectorate',
      author_persona_label: 'Daily-Wage Artisan • Guntur',
      upvotes_count: 14,
      escalation_threshold: 10,
      is_validated: true,
      is_sample: false,
      created_at: '2026-11-17T14:15:00Z',
    },
  ];

  const votedKeys = new Set<string>();

  let messages: CommunityChatMessage[] = [
    {
      id: 'msg-e2e-01',
      district: 'Guntur',
      topic_category: 'dbt_help',
      author_persona_label: 'Smallholder Farmer • Guntur',
      message_body:
        'Tip: Head Post Office IPPB counter seeded our NPCI DBT bank mapper in 10 minutes free of cost.',
      helpful_count: 12,
      linked_proposal_id: null,
      is_sample: false,
      created_at: '2026-11-20T10:15:00Z',
    },
  ];

  // Block external OSM tile flakiness inside headless test runs by returning a 1x1 transparent PNG
  await page.route('https://*.tile.openstreetmap.org/**', async (route) => {
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng });
  });

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const pathname = url.pathname.replace(/\/+$/, '');
    const method = req.method();
    const body = req.postData()
      ? (() => {
          try {
            return JSON.parse(req.postData()!) as Record<string, unknown>;
          } catch {
            return {};
          }
        })()
      : {};

    const json = (status: number, payload: unknown) =>
      route.fulfill({
        status,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(payload),
      });

    // 1. Schemes Catalog
    if (pathname === '/api/schemes' && method === 'GET') {
      return json(200, { schemes, total: schemes.length, data_source: 'neon' });
    }

    // 2. Auth Endpoints
    if (pathname === '/api/auth/register' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const displayName = String(body.display_name || 'Citizen').trim();
      const role = body.admin_invite_code === 'CLAIMSAATHI-ADMIN-2026' ? 'admin' : 'citizen';

      if (users.has(email)) {
        return json(409, { error: 'email_already_registered', message: 'Email already registered.' });
      }
      const userRec: TestUserRecord = {
        id: `user-${Date.now()}`,
        email,
        password,
        display_name: displayName,
        role,
        profile: {
          age_band: 'unknown',
          state_code: 'AP',
          district_code: 'Guntur',
          income_band: 'below_1_2L',
          occupation_category: 'farmer',
          social_category: 'BC',
          land_holding_band: 'marginal_under_2_5_acres',
          language_pref: 'en',
          household_members: [],
          has_school_student: 'yes',
          has_college_student: 'no',
          is_widow_or_single_woman: 'no',
          has_disability: 'no',
          is_tenant_farmer_ccrc: 'no',
          has_white_ration_card: 'yes',
          gmail_address: String(body.gmail_address || email),
          email_notifications_enabled: body.email_notifications_enabled !== false,
        },
      };
      users.set(email, userRec);
      activeUserEmail = email;
      return json(201, {
        token: `e2e-jwt-${role}-${email}`,
        user: { id: userRec.id, email: userRec.email, display_name: userRec.display_name, role: userRec.role },
        profile: userRec.profile,
      });
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const userRec = users.get(email);
      if (!userRec || userRec.password !== password) {
        return json(401, { error: 'invalid_credentials', message: 'Invalid email or password.' });
      }
      activeUserEmail = email;
      return json(200, {
        token: `e2e-jwt-${userRec.role}-${email}`,
        user: { id: userRec.id, email: userRec.email, display_name: userRec.display_name, role: userRec.role },
        profile: userRec.profile,
      });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      activeUserEmail = null;
      return json(200, { ok: true });
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      if (!activeUserEmail || !users.has(activeUserEmail)) {
        return json(401, { error: 'unauthorized', message: 'Not signed in.' });
      }
      const userRec = users.get(activeUserEmail)!;
      return json(200, {
        user: { id: userRec.id, email: userRec.email, display_name: userRec.display_name, role: userRec.role },
        profile: userRec.profile,
      });
    }

    // 3. Personalised Profile
    if (pathname === '/api/profile/me') {
      if (!activeUserEmail || !users.has(activeUserEmail)) {
        return json(401, { error: 'unauthorized', message: 'Sign in required.' });
      }
      const userRec = users.get(activeUserEmail)!;
      if (method === 'PUT') {
        userRec.profile = { ...userRec.profile, ...body, updated_at: new Date().toISOString() };
      }
      return json(200, { profile: userRec.profile });
    }

    // 4. NLP Profile Extraction & Explain
    if (pathname === '/api/profile/extract' && method === 'POST') {
      const rawText = String(body.text || '');
      const pii = inspectTextForPii(rawText);
      if (pii.hasPii) {
        return json(422, { error: 'pii_detected', detected_types: pii.detectedTypes });
      }
      return json(200, extractCoarseProfileFromText(rawText, (body.language as 'en' | 'te' | 'hi') || 'en'));
    }

    if (pathname === '/api/explain' && method === 'POST') {
      return json(200, {
        explanation: 'Based on your household profile, you are likely eligible for this scheme.',
        disclaimer: 'Likely eligible guidance only. Final verification rests with government officers.',
      });
    }

    // 5. User Applications
    if (pathname === '/api/applications') {
      if (!activeUserEmail) {
        return json(401, { error: 'unauthorized' });
      }
      const list = applicationsByUser.get(activeUserEmail) || [];
      if (method === 'GET') {
        return json(200, { applications: list });
      }
      if (method === 'POST' || method === 'PATCH') {
        const schemeId = String(body.scheme_id || '');
        const schemeObj = schemes.find((s: { id: string }) => s.id === schemeId);
        if (!schemeObj) return json(404, { error: 'scheme_not_found' });
        const nextRec = {
          scheme_id: schemeId,
          scheme_code: schemeObj.scheme_code,
          name_en: schemeObj.name_en,
          name_te: schemeObj.name_te,
          name_hi: schemeObj.name_hi,
          benefit_summary_en: schemeObj.benefit_summary_en,
          benefit_summary_te: schemeObj.benefit_summary_te,
          benefit_summary_hi: schemeObj.benefit_summary_hi,
          official_source_url: schemeObj.source.source_url,
          stage: body.stage || 'documents_prep',
          reference_note: String(body.reference_note || ''),
          notify_when_opens: Boolean(body.notify_when_opens),
          rejection_reason_code: body.rejection_reason_code || null,
          reminder_downloaded: Boolean(body.reminder_downloaded),
          checked_documents: body.checked_documents || {},
          added_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const idx = list.findIndex((a) => a.scheme_id === schemeId);
        if (idx >= 0) list[idx] = nextRec;
        else list.unshift(nextRec);
        applicationsByUser.set(activeUserEmail, list);
        return json(200, { application: nextRec });
      }
      if (method === 'DELETE') {
        const schemeId = url.searchParams.get('scheme_id') || String(body.scheme_id || '');
        applicationsByUser.set(
          activeUserEmail,
          list.filter((a) => a.scheme_id !== schemeId)
        );
        return json(200, { deleted: true });
      }
    }

    // 6. Notifications & Gmail SMTP
    if (pathname === '/api/notifications') {
      if (method === 'GET') {
        return json(200, {
          notifications,
          scheme_windows: [
            {
              id: 'ap-sch-001',
              scheme_code: 'AP-TALLIKI-VANDANAM',
              category: 'scholarship',
              status: 'open',
              name_en: 'Talliki Vandanam',
              name_te: 'తల్లికి వందనం',
              name_hi: 'तल्लिकि वंदनम',
              benefit_summary_en: '₹15,000/yr per child',
              benefit_summary_te: '₹15,000/సం.',
              benefit_summary_hi: '₹15,000/वर्ष',
              application_open_on: '2026-11-01',
              application_close_on: '2026-12-31',
              official_url: 'https://cse.ap.gov.in/',
            },
          ],
          unread_count: notifications.filter((n) => !n.is_read).length,
          data_source: 'neon',
        });
      }
      if (method === 'PATCH') {
        if (body.mark_all === true) {
          notifications.forEach((n) => {
            n.is_read = true;
          });
        } else if (typeof body.notification_id === 'string') {
          const hit = notifications.find((n) => n.id === body.notification_id);
          if (hit) hit.is_read = true;
        }
        return json(200, { ok: true });
      }
    }

    if (pathname === '/api/notifications/send-email' && method === 'POST') {
      const gmail = String(body.gmail_address || '').trim();
      const digest = buildDeadlineDigestEmail({
        displayName: String(body.display_name || 'Citizen'),
        recipientEmail: gmail,
        upcomingOpenings: [
          {
            title: 'Talliki Vandanam',
            sector: 'scholarship',
            startDate: '2026-11-01',
            endDate: '2026-12-31',
            officialUrl: 'https://cse.ap.gov.in/',
            summary: '₹15,000/yr school child support',
          },
        ],
        closingDeadlines: [],
        recentUpdates: [
          {
            title: 'Deepam 2.0 (3 Free LPG Cylinders/Year)',
            sector: 'women_child',
            startDate: '2026-11-01',
            endDate: '2027-03-31',
            officialUrl: 'https://apcivilsups.ap.gov.in/',
            summary: '3 free LPG refills per year via DBT',
          },
        ],
        unclaimedSectors: Array.isArray(body.unclaimed_sectors)
          ? (body.unclaimed_sectors as string[])
          : [],
      });
      return json(200, {
        sent: true,
        smtp_configured: true,
        subject: digest.subject,
        preview_html: digest.html,
        message: `Deadline & scheme alerts emailed successfully to ${gmail}.`,
      });
    }

    // 7. Admin RBAC
    if (pathname === '/api/admin/schemes') {
      const userRec = activeUserEmail ? users.get(activeUserEmail) : null;
      if (!userRec) return json(401, { error: 'unauthorized' });
      if (userRec.role !== 'admin') return json(403, { error: 'forbidden' });
      if (method === 'GET') {
        return json(200, { audit_log: auditLog, admin: userRec.email });
      }
      if (method === 'PATCH') {
        return json(200, { ok: true });
      }
    }

    // 8. Community Proposals & Chat
    if (pathname === '/api/community/proposals') {
      if (method === 'GET') {
        return json(200, { proposals, escalation_threshold: 10, data_source: 'neon' });
      }
      if (method === 'POST') {
        const check = inspectTextForPii(`${body.title || ''} ${body.description || ''}`);
        if (check.hasPii) {
          return json(422, { error: 'pii_detected', message: 'PII blocked.' });
        }
        const created: CommunityProposal = {
          id: `prop-e2e-${Date.now()}`,
          title: String(body.title),
          description: String(body.description),
          category: (body.category as CommunityProposal['category']) || 'employment',
          district: String(body.district || 'All AP'),
          target_cohort: String(body.target_cohort || 'Underserved AP Household'),
          escalation_target:
            (body.escalation_target as CommunityProposal['escalation_target']) || 'ap_gsws_1902',
          author_persona_label: String(body.author_persona_label || 'AP Citizen • Anonymous'),
          upvotes_count: 1,
          escalation_threshold: 10,
          is_validated: true,
          is_sample: false,
          created_at: new Date().toISOString(),
        };
        proposals = [created, ...proposals];
        return json(201, { proposal: created, data_source: 'neon' });
      }
      if (method === 'PATCH') {
        const pid = String(body.proposal_id || '');
        const token = String(body.voter_token || '');
        const key = `${pid}:${token}`;
        const idx = proposals.findIndex((p) => p.id === pid);
        if (idx === -1) return json(404, { error: 'proposal_not_found' });
        const alreadyVoted = votedKeys.has(key);
        if (!alreadyVoted) {
          votedKeys.add(key);
          proposals[idx] = { ...proposals[idx], upvotes_count: proposals[idx].upvotes_count + 1 };
        }
        return json(200, {
          proposal: proposals[idx],
          already_voted: alreadyVoted,
          threshold_reached: proposals[idx].upvotes_count >= proposals[idx].escalation_threshold,
          data_source: 'neon',
        });
      }
    }

    if (pathname === '/api/community/messages') {
      if (method === 'GET') {
        return json(200, { messages, data_source: 'neon' });
      }
      if (method === 'POST') {
        const check = inspectTextForPii(`${body.message_body || ''}`);
        if (check.hasPii) return json(422, { error: 'pii_detected' });
        const msg: CommunityChatMessage = {
          id: `msg-e2e-${Date.now()}`,
          district: String(body.district || 'Guntur'),
          topic_category: String(body.topic_category || 'local_help'),
          author_persona_label: String(body.author_persona_label || 'Farmer • Guntur'),
          message_body: String(body.message_body),
          helpful_count: 0,
          linked_proposal_id: null,
          is_sample: false,
          created_at: new Date().toISOString(),
        };
        messages = [msg, ...messages];
        return json(201, { message: msg, data_source: 'neon' });
      }
      if (method === 'PATCH') {
        const mid = String(body.message_id || '');
        const idx = messages.findIndex((m) => m.id === mid);
        if (idx === -1) return json(404, { error: 'not_found' });
        messages[idx] = { ...messages[idx], helpful_count: messages[idx].helpful_count + 1 };
        return json(200, { message: messages[idx], data_source: 'neon' });
      }
    }

    // 9. Locator & API Setu
    if (pathname === '/api/locator/nearby' && method === 'GET') {
      const centres = findCuratedCentres({
        district: url.searchParams.get('district'),
        pin: url.searchParams.get('pin'),
        type: url.searchParams.get('type'),
      });
      return json(200, {
        centres,
        helplines: AP_OFFICIAL_HELPLINES,
        total: centres.length,
        data_source: 'curated_ap_gsws',
      });
    }

    if (pathname === '/api/apisetu/pin-lookup' && method === 'GET') {
      const pin = url.searchParams.get('pin') || '522001';
      return json(200, {
        pin_code: pin,
        desks: [
          {
            office_name: 'Guntur Head Post Office & IPPB Seeding Counter',
            branch_type: 'Head Post Office (IPPB Hub)',
            district: 'Guntur',
            state: 'Andhra Pradesh',
            pin_code: pin,
            dbt_seeding_supported: true,
            service_note_en: 'Instant biometric Aadhaar–NPCI DBT bank seeding available.',
            service_note_te: 'తక్షణ బయోమెట్రిక్ ఆధార్–NPCI DBT బ్యాంకు సీడింగ్ కలదు.',
            service_note_hi: 'तत्काल बायोमेट्रिक आधार–NPCI DBT बैंक सीडिंग उपलब्ध।',
          },
        ],
        data_source: 'ap_postal_fallback',
      });
    }

    if (pathname === '/api/apisetu/sandbox' && method === 'POST') {
      if (body.is_sample !== true) {
        return json(403, { error: 'synthetic_persona_required' });
      }
      const docType = (body.doc_type as ApiSetuDocType) || 'INCER';
      const schema = API_SETU_DOC_SCHEMAS[docType] || API_SETU_DOC_SCHEMAS.INCER;
      return json(200, {
        apiVersion: '3.0.0',
        txnId: 'apisetu-v3-synth-e2e',
        ts: new Date().toISOString(),
        sandboxMode: 'SYNTHETIC_PERSONA_ONLY',
        orgId: schema.orgId,
        docType: schema.docType,
        endpointSimulated: schema.openApiEndpointSlug,
        requestEnvelope: {
          txnId: 'apisetu-v3-synth-e2e',
          format: 'json',
          certificateParameters: {
            syntheticCertRef: schema.syntheticSampleToken,
            stateCode: 'AP',
            district: 'Guntur',
          },
          consentArtifact: {
            consentId: 'consent-synth-e2e',
            purpose: 'Citizen Pre-Submission Readiness Check (Synthetic Demo)',
            piiCollected: false,
          },
        },
        verificationResult: {
          status: 'VERIFIED_SYNTHETIC_DEMO',
          issuer: schema.issuerName_en,
          digilockerPullReady: schema.digilockerPullable,
          validityRule: schema.validityRule_en,
          verifiedAttributes: { state: 'Andhra Pradesh', documentCode: schema.docType },
          advisoryNote: 'Synthetic API Setu v3 preview only.',
        },
      });
    }

    return route.continue();
  });
}
