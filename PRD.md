# ClaimSaathi – Product Requirements Document (PRD)

**Status:** APPROVED & IMPLEMENTED (v4.0 Full-Stack Neon + JWT + SMTP Release — 2026-11-21)  
**Live Deployment:** https://claimsaathi-nine.vercel.app  
**Repository:** `https://github.com/KOWSIK-M/Citizens-and-Public-Services`  
**Companion Decision Log:** [DECISIONS.md](./DECISIONS.md) (`D-01` through `D-47`)

---

## 1. Purpose and Problem Statement

ClaimSaathi is a privacy-first, trilingual (**English, Telugu `తెలుగు`, and Hindi `हिन्दी`**) welfare scheme navigator built for **ACE Builders Hackathon 2026 — Problem Statement 5: Citizens and Public Services ("Claim What's Yours")** and expanded into a full-lifecycle, Neon-backed civic platform.

### 1.1 The Problem
- India and Andhra Pradesh offer high-impact welfare schemes covering schooling, higher education, social security pensions, smallholder/tenant farm support, universal healthcare, and clean cooking fuel—yet eligible rural families routinely miss out.
- Eligibility criteria are scattered across Government Orders (G.O.s) and portals in dense bureaucratic language, conditional document requirements are unclear, start/end application dates lapse unnoticed, rejected claims go unresolved, and families end up paying middlemen for guidance that should be free.

### 1.2 Product Vision
A citizen speaks (including via a live phone-call style voice agent) or types their household situation in plain everyday words (never a long bureaucratic form or sensitive ID intake) and immediately receives:
1. **Likely-eligible schemes with transparent per-rule reasoning** (plus estimated total annual household benefit unlocked),
2. **Profile-personalised document checklists**, **API Setu / DigiLocker certificate validity & IPPB NPCI DBT seeding readiness**, and a deduplicated **Single Sachivalayam Visit Master Document Folder**,
3. **Step-by-step official application, local 26-district Sachivalayam/MeeSeva locator (`/centres`), & Claim Doctor rejection troubleshooting**,
4. **Live Recent Government Scheme Updates, Start-Date & End-Date Notifications (`/notifications`), and direct Gmail SMTP deadline alerts**,
5. **Personalised Neon-synced Profile (`/profile`) with Simple HS256 JWT Auth & RBAC Authorization**,
6. **Interactive Sector Coverage Visualization** with proper filters showcasing **which welfare sectors the citizen actually availed** vs. **which other sectors they are still likely eligible for**,
7. **PII-shielded Local Citizen Community Chat & Missing-Scheme Proposal Voting (`/community`)** unlocking an official AP Collectorate (`1902` / PGRS) & NGO Escalation Dossier at `10` votes, and
8. **Verified official source links and verification dates** stored 100% live in Neon PostgreSQL with zero runtime mock data.

---

## 2. Target Users and Scope

### 2.1 Primary Target Group ("One Specific Group in One State")
- **Focus Cohort:** **Low-Income Rural Daily-Wage & Smallholder Farming Households in Andhra Pradesh (*Kooli & Chinna Rythu Kutumbalu*)** (`D-14`).
- Focusing on this cohesive rural household unit addresses the highest-exclusion population in one state (`state_code: 'AP'`) while covering multi-generational household touchpoints across all 26 AP districts:

| Household Member / Situation | Schemes Covered in Neon Catalog | Annual Benefit / Protection |
|---|---|---|
| Mother with school-going child (Class 1–12) | **Talliki Vandanam** (`ap-sch-001`) | `₹15,000 / year` DBT |
| Youth in Class 10 / Inter / Polytechnic / Degree | **AP Jnanabhumi Post-Matric Scholarship (RTF & MTF)** (`ap-sch-006`) | `100% Tuition + up to ₹20,000 / yr` |
| Elderly grandparent (`60+`), widow (`18+`), or person with disability | **NTR Bharosa Social Security Pension** (`ap-sch-002`) | `₹4,000–₹6,000 / month` (`₹48,000/yr`) |
| Small/marginal landowner or CCRC tenant farmer (*Koulu Rythu*) | **Annadata Sukhibhava** (`ap-sch-003`) + **PM-KISAN** (`cen-sch-001`) | `₹20,000 / year` combined (`₹14k` AP + `₹6k` Central) |
| BPL / White Rice Card household medical emergency | **Dr. NTR Vaidya Seva** (`ap-sch-005`) | `Up to ₹25 Lakhs / year` cashless hospitalization |
| White Rice Card household with LPG connection | **Deepam 2.0 Free LPG Refill** (`ap-sch-007`) | `3 free refills / year` *(held in `PENDING VERIFICATION` per `FR-09` until verified by Admin)* |

### 2.2 User Roles & Access Model (JWT Authentication + RBAC Authorization)
- **Anonymous / Guest Citizens:** Can immediately check eligibility (`/describe`, `/voice-call`), browse Neon schemes (`/schemes`), locate Sachivalayams/MeeSeva centres (`/centres`), view live notifications (`/notifications`), and explore community boards (`/community`) without mandatory sign-up.
- **Authenticated Citizens (`role: 'citizen'` via Simple HS256 JWT):** Sign in / register at `/login` (`HttpOnly` cookie + `Bearer` token) to persist their **Personalised Coarse Profile** (`user_profiles`), sync **Tracked / Availed / Rejected Applications** (`user_applications`), inspect their **Availed vs. Still Likely Eligible Sector Visualization** (`/profile` & `/my-schemes`), track unread notifications (`user_notification_reads`), and opt in with their **Gmail address** to receive direct SMTP start-date, end-date, and recent government scheme emails.
- **Policy Verifiers / Administrators (`role: 'admin'` via JWT RBAC):** Authorized (registered using server-side `ADMIN_INVITE_CODE`) to access `/admin` Governance Studio and mutate Neon tables via `PATCH /api/admin/schemes` and `POST /api/notifications` (editing rules, verifying G.O. sources, publishing recent scheme alerts, and writing to immutable `audit_log`). Non-admin callers are rejected with `HTTP 401 / 403`.

---

## 3. Goals and Verified Success Criteria

### 3.1 Goals
- **G1.** Help rural citizens discover schemes they are *likely eligible* for—and understand the exact rule behind every match or non-match—in English, Telugu, or Hindi (via text, voice modal, or Saathi Live Voice Call).
- **G2.** Eliminate middleman fees through profile-adapted checklists, API Setu certificate expiry & IPPB NPCI DBT seeding checks, 26-district Sachivalayam/MeeSeva locator, and Claim Doctor rejection slips (`1902`).
- **G3.** Enforce strict source provenance (`verified_at`, G.O./portal links, 90-day staleness warnings, `FR-09` holds) and **zero runtime mock data**—all schemes, rules, notifications, profiles, applications, and community discussions live in Neon PostgreSQL.
- **G4.** Show citizens visually **which welfare sectors they have actually availed** vs. **which other sectors they are still likely eligible for** so unclaimed benefits are surfaced clearly.
- **G5.** Ensure zero deadlines lapse via live Neon start/end date notifications, `.ics` calendar downloads, WhatsApp reminders, and direct **Gmail SMTP** email alerts.

### 3.2 Success Criteria Status
| ID | Criterion | Target / Verification Result | Status |
|---|---|---|---|
| **SC-1** | Plain-language & live voice call input produces likely-eligible matches with visible per-rule reasons in `en`/`te`/`hi` | Verified across `profileExtractor`, `deterministicEngine`, and `voiceCallEngine` suites | **MET** |
| **SC-2** | Every result & scheme page displays official portal URL + verified date or explicit `PENDING VERIFICATION` badge | Enforced deterministically (`FR-09`) over live Neon catalog (`GET /api/schemes`) | **MET** |
| **SC-3** | Personalised document checklist, API Setu readiness, 26-district locator, & Claim Doctor rejection guide | Verified via `locatorAndApiSetu.test.ts` + live browser QA | **MET** |
| **SC-4** | Zero Aadhaar, PAN, phone, Voter ID, or bank account fields; Indic-aware PII shield blocks accidental entry (`HTTP 422`); Gmail opt-in isolated privately on `user_profiles` | Verified across `piiValidator.test.ts`, `serverlessApi.test.ts`, & `communityAndFollowups.test.ts` | **MET** |
| **SC-5** | Zero runtime mock data — Neon PostgreSQL powers catalog, auth, profiles, applications, notifications, community, & RBAC admin updates | `src/services/mockSchemeData.ts` & `src/config/communitySeeds.ts` removed from runtime; `503` guard tested when `DATABASE_URL` absent | **MET** |
| **SC-6** | Simple HS256 JWT Auth + RBAC (`citizen` vs `admin`), Sector Coverage Visualization, & Gmail SMTP Deadline Mailer | Verified via `authNotificationsAndViz.test.ts` (`scrypt`, HS256 tamper rejection, `401`/`403` RBAC, SMTP digest & sector math) | **MET** |
| **SC-7** | Engineering & UX budgets: `< 180 kB` gzip entry JS, `360px` zero horizontal overflow, WCAG 2.2 AA contrast & `44×44px` targets, automated tests | **`58.14 kB` gzip entry chunk** (20% leaner after removing mocks), `0.00px` overflow at `360×780`, **`73 / 73` `Vitest` tests** passing across 9 suites | **MET** |

---

## 4. Functional Requirements (v4.0 Complete Implementation Matrix)

| ID | Requirement | Priority | Status | Implementation Reference |
|---|---|---|---|---|
| **FR-01** | Plain-language free-text intake (`<= 500` chars) with visible labels, persistent example tips, and non-blocking backspace recovery. | MUST | **SHIPPED** | `src/pages/citizen/DescribePage.tsx`, `src/components/citizen/PlainTextInput.tsx` |
| **FR-02** | Hybrid profile extraction: serverless Claude Haiku (`POST /api/profile/extract`) when `ANTHROPIC_API_KEY` is set + word-bounded, negation-aware trilingual NLP fallback (`en`/`te`/`hi`); citizen reviews extracted chips before matching. | MUST | **SHIPPED** | `api/profile/extract.ts`, `src/services/profileExtractor.ts`, `src/components/citizen/ProfileConfirmForm.tsx` |
| **FR-03** | Defense-in-depth PII shield intercepts Aadhaar, phone, PAN, Voter ID, IFSC, bank/card numbers, and emails (including Telugu & Devanagari numerals), offering 1-click redaction on client and returning HTTP `422` on server. | MUST | **SHIPPED** | `src/utils/piiValidator.ts`, `src/components/common/PiiAlertBanner.tsx`, `api/profile/extract.ts` |
| **FR-04** | Up to **3 skippable clarifying question cards** ranked by scheme-unlock gain, using everyday proxies (*White Rice Card*, *CCRC Lease Card*, *Child in School/College*). Unanswered fields stay `'unknown'`. | MUST | **SHIPPED** | `src/services/profileExtractor.ts`, `src/components/citizen/ProfileConfirmForm.tsx` |
| **FR-05** | Deterministic neuro-symbolic rule engine supporting all 6 operators (`eq`, `neq`, `in`, `lte`, `gte`, `between`) and **OR-groups (`condition_group`)**, classifying schemes into *Likely eligible*, *Need more information*, or *Not likely eligible*. | MUST | **SHIPPED** | `src/services/deterministicEngine.ts` |
| **FR-06** | Every rule evaluation displays plain-language trilingual condition & citizen value labels (zero raw snake_case code slugs) plus alternative OR-branch badges. | MUST | **SHIPPED** | `src/config/bands.ts`, `src/components/eligibility/RuleReasonCard.tsx` |
| **FR-07** | Missing-information cards list exact needed attributes with `44px` `+ Add Detail` buttons that deep-link (`?focus=<field>`) and auto-focus the target control on `/confirm-profile`. | MUST | **SHIPPED** | `src/components/eligibility/MissingInfoList.tsx`, `src/pages/citizen/ResultsPage.tsx` |
| **FR-08** | Missing or unconfirmed attributes (including household student/widow/tenant flags) evaluate strictly to `'unknown'` (`needs_more_info`), never false rejection. | MUST | **SHIPPED** | `src/services/deterministicEngine.ts` (`resolveProfileFieldValue`) |
| **FR-09** | Unpublished schemes are excluded; schemes with `verified_at === null`, `0` rules, or closed status are withheld from `likely_eligible` with an explicit `pending_verification_hold` notice. | MUST | **SHIPPED** | `src/services/deterministicEngine.ts`, `src/components/eligibility/SchemeResultCard.tsx` |
| **FR-10** | Results and scheme detail views display trilingual names, benefit summaries, Total Household Benefit banner, deadlines, official source URL, publisher, G.O. reference, and verification badge. | MUST | **SHIPPED** | `src/pages/citizen/ResultsPage.tsx`, `src/pages/citizen/SchemeDetailPage.tsx`, `src/pages/public/BrowseSchemesPage.tsx` |
| **FR-11** | **Profile-personalised document checklist** dynamically promoting conditional proofs (`applies_when`) + **Single Sachivalayam Visit Master Document Folder** deduplicating shared proofs across matched schemes + persistent checkboxes, print view, clipboard copy, and WhatsApp share. | MUST | **SHIPPED** | `src/components/scheme/DocumentChecklist.tsx`, `src/components/scheme/MasterDocumentPackCard.tsx` |
| **FR-12** | Step-by-step application & follow-up guide with channel badges (*Online Portal*, *Grama/Ward Sachivalayam*, *Department Office*), SLA timelines, status-check links, and `1902` / `Mana Mitra` escalation instructions. | MUST | **SHIPPED** | `src/components/scheme/ApplicationStepList.tsx` |
| **FR-13** | Full **trilingual (`English` / `తెలుగు` / `हिन्दी`)** UI parity across all routes, AP districts, disclaimers, notifications, visualizations, and error states, with persistent header toggle. | MUST | **SHIPPED** | `src/store/useLanguageStore.ts`, `src/components/common/LanguageToggle.tsx` |
| **FR-14** | **RBAC-Protected Admin Governance Studio (`/admin`):** Enforces `role === 'admin'` via HS256 JWT on both UI and `GET/PATCH /api/admin/schemes` (`HTTP 401/403` for non-admins), persisting all mutations directly to Neon. | MUST | **SHIPPED (v4.0)** | `api/admin/schemes.ts`, `api/_lib/auth.ts`, `src/pages/admin/AdminDashboardPage.tsx` |
| **FR-15** | Editable scheme rules (operator, value, version) stored exclusively as relational rows in Neon PostgreSQL (`scheme_rules`)—zero hardcoded mock data in runtime. | MUST | **SHIPPED (v4.0)** | `database/migrations/001_schema_and_rls.sql`, `api/schemes/index.ts`, `src/store/useSchemeStore.ts` |
| **FR-16** | Source provenance tracking (`source_url`, `publisher`, `document_type`, `go_reference`, `retrieved_at`, `verified_at`, `verified_by`) with 1-click Verify / Mark Pending controls persisted to Neon. | MUST | **SHIPPED** | `src/types/scheme.ts`, `api/admin/schemes.ts`, `src/pages/admin/AdminDashboardPage.tsx` |
| **FR-17** | Append-only Audit Log (`audit_log` SQL trigger preventing `UPDATE`/`DELETE` in Postgres + live Neon audit trail tab in Admin Studio). | MUST | **SHIPPED** | `database/migrations/001_schema_and_rls.sql`, `api/admin/schemes.ts`, `src/pages/admin/AdminDashboardPage.tsx` |
| **FR-18** | Live **Synthetic Persona Impact Simulator** previewing how rule/source changes affect Scenarios A, B, and C. | SHOULD | **SHIPPED** | `src/pages/admin/AdminDashboardPage.tsx` |
| **FR-19** | Automatic **90-day stale-source warning** (`Stale — Re-verify on Portal`) when `verified_at` exceeds `STALE_VERIFICATION_DAYS`. | SHOULD | **SHIPPED** | `src/components/common/VerificationBadge.tsx` |
| **FR-20** | Public Home, Browse All Schemes (`/schemes`), About & Governance (`/about`), and Statutory Disclaimer (`/disclaimer`) pages. | MUST | **SHIPPED** | `src/pages/public/*` |
| **FR-21** | Persistent statutory preliminary-guidance notice across citizen flows + grounded `/api/explain` regex guard rejecting `"guaranteed"`/`"approved"`. | MUST | **SHIPPED** | `src/components/common/DisclaimerBanner.tsx`, `api/explain.ts` |
| **FR-22** | Synthetic test scenarios flagged `is_sample = true` with persistent `SampleProfileBanner` and synchronized state Reset. | MUST | **SHIPPED** | `src/config/constants.ts`, `src/components/common/SampleProfileBanner.tsx` |
| **FR-23** | Regional-language **Voice Input (STT)** (`en-IN`, `te-IN`, `hi-IN`) in an accessible `@radix-ui/react-dialog` modal with live transcript, PII check, and unsupported-browser fallback. | SHOULD | **SHIPPED** | `src/hooks/useSpeechRecognition.ts`, `src/components/citizen/VoiceInputModal.tsx` |
| **FR-24** | Regional-language **Voice Output / Read Aloud (TTS)** (`en-IN`, `te-IN`, `hi-IN`) reading scheme benefits, rule reasons, and application steps aloud for low-literacy citizens. | SHOULD | **SHIPPED** | `src/hooks/useSpeechSynthesis.ts`, `src/components/eligibility/SchemeResultCard.tsx`, `src/components/scheme/ApplicationStepList.tsx` |
| **FR-25** | **Deadline Reminders** via downloadable RFC 5545 `.ics` calendar alerts (`-P7D`, `-P2D`, opening & annual renewal), 1-tap localized WhatsApp self-share, `< 20 days` urgent banners, and direct **Gmail SMTP** email digests. | MUST | **SHIPPED (v4.0)** | `src/utils/calendarReminder.ts`, `api/_lib/mailer.ts`, `src/pages/citizen/MySchemesPage.tsx` |
| **FR-26** | **Application Tracker (`/my-schemes`)** with 5-stage + opening/rejected status progression, live checklist readiness sync, PII-guarded visit notes, and automatic **Neon persistence (`user_applications`)** for authenticated citizens. | MUST | **SHIPPED (v4.0)** | `api/applications/index.ts`, `src/store/useTrackerStore.ts`, `src/pages/citizen/MySchemesPage.tsx` |
| **FR-27** | Live external government eligibility API sync (none publicly exposed by AP/GoI portals; handled via curated G.O./portal SQL seeds + Neon Admin Registry). | LATER | **FUTURE** | Documented in `AboutPage.tsx` & `TECH_DECISIONS.md` |
| **FR-28** | **Saathi Live Voice Call Agent (`/voice-call`)** — Zero-key phone-call style conversational voice interface (`en-IN`, `te-IN`, `hi-IN`) using Web Speech STT/TTS + Web Audio energy orb + deterministic slot-filling to recommend `"likely eligible"` schemes and `"Pick & Proceed"` hands-free. | SHOULD | **SHIPPED (v3.0)** | `src/services/voiceCallEngine.ts`, `src/pages/citizen/VoiceCallPage.tsx` |
| **FR-29** | **26-District Sachivalayam, MeeSeva & E-Seva Locator (`/centres`)** — Open-source Leaflet + OpenStreetMap map, 6-digit PIN / opt-in GPS `"Near Me"` search, timings, services, and one-tap official AP helplines (`1902`, `1100`, `155251`, `104`). | SHOULD | **SHIPPED (v3.0)** | `src/config/apServiceCentres.ts`, `api/locator/nearby.ts`, `src/pages/public/ServiceCentresPage.tsx` |
| **FR-30** | **3-Module API Setu & DigiLocker Civic Suite** — (a) DigiLocker `docType` & AP Certificate Expiry Pre-Validator (`INCER` 4-yr, `CCRC` 11-mo), (b) 6-digit PIN -> IPPB/Post Office NPCI DBT Seeding Finder, and (c) OpenAPI v3 Synthetic Sandbox (`is_sample: true` gated). | SHOULD | **SHIPPED (v3.0)** | `src/config/apiSetuSchemas.ts`, `api/apisetu/pin-lookup.ts`, `api/apisetu/sandbox.ts`, `src/components/scheme/ApiSetuReadinessPanel.tsx` |
| **FR-31** | **Full Lifecycle Follow-Ups & "Claim Doctor" Rejection Troubleshooter** — Pre-launch `"Notify When Scheme Starts"` (`.ics` + opt-in Notification), post-SLA check-ins (*Availed -> Annual Renewal `.ics`* vs. *Rejected*), and 6-cause AP rejection diagnostic generating a printable bilingual `1902` Grievance Slip. | MUST | **SHIPPED (v3.0)** | `src/config/rejectionDiagnostics.ts`, `src/components/tracker/ClaimDoctorModal.tsx`, `src/pages/citizen/MySchemesPage.tsx` |
| **FR-32** | **Missing-Scheme / Welfare Gap Requests & 10-Vote Escalation** — Citizens raise non-PII Welfare Gap Requests from `0-match` `/results` or `/community`; reaching `10` deduplicated Neon votes unlocks a printable AP Collectorate (`1902` / PGRS) & NGO Escalation Dossier. | SHOULD | **SHIPPED (v3.0/v4.0)** | `api/community/proposals.ts`, `src/components/community/RaiseGapModal.tsx`, `src/components/community/EscalationDossierModal.tsx` |
| **FR-33** | **PII-Shielded Local Citizen Community Chat (`/community`)** — AP district discussion channels backed directly by Neon `community_messages`, using coarse anonymous persona badges, live client + server `HTTP 422` PII firewalls, and `"Promote Chat to Scheme Proposal"`. | SHOULD | **SHIPPED (v3.0/v4.0)** | `api/community/messages.ts`, `src/pages/public/CommunityHubPage.tsx`, `database/migrations/002_community_and_proposals.sql` |
| **FR-34** | **Zero Runtime Mock Data & Full Neon Integration** — Removed all hardcoded mock scheme & community data from `src/` and `api/`; added `api/_lib/db.ts`, `003_auth_profiles_notifications.sql`, `003_recent_schemes_and_notifications.sql`, one-command runner `scripts/apply-neon-migrations.mjs`, and Vite local API middleware in `vite.config.ts`. | MUST | **SHIPPED (v4.0)** | `api/_lib/db.ts`, `database/migrations/003_auth_profiles_notifications.sql`, `scripts/apply-neon-migrations.mjs`, `vite.config.ts` |
| **FR-35** | **Simple HS256 JWT Authentication & RBAC Authorization (`/login`)** — Pure Node `crypto` `scryptSync` password hashing + HS256 JWT (`HttpOnly` cookie + Bearer token) supporting `POST /api/auth/register`, `login`, `logout`, `GET /api/auth/me`, and `citizen` vs `admin` role guards (`ADMIN_INVITE_CODE`). | MUST | **SHIPPED (v4.0)** | `api/_lib/auth.ts`, `api/auth/*`, `src/store/useAuthStore.ts`, `src/pages/public/AuthPage.tsx` |
| **FR-36** | **Personalised Citizen Profile (`/profile`)** — Authenticated citizens save and edit coarse eligibility bands, household vulnerability flags, district, and Gmail alert preferences directly in Neon `user_profiles` (`GET/PUT /api/profile/me`), auto-hydrating across devices on login. | MUST | **SHIPPED (v4.0)** | `api/profile/me.ts`, `src/pages/citizen/ProfileDashboardPage.tsx`, `src/store/useAuthStore.ts` |
| **FR-37** | **Interactive Sector Coverage Visualization (`Availed` vs `Still Likely Eligible`)** — Responsive SVG Donut Coverage Ring, KPI summary cards (₹ Claimed vs ₹ Unclaimed), clickable Stacked Horizontal Sector Bars, and side-by-side drilldown filtered by **Government Level**, **Welfare Sector**, **Coverage Status**, and **Sort Order**. | MUST | **SHIPPED (v4.0)** | `src/components/insights/SectorCoverageVisualizer.tsx`, `src/pages/citizen/ProfileDashboardPage.tsx`, `src/pages/citizen/MySchemesPage.tsx` |
| **FR-38** | **Recent Government Schemes, Policy Updates & Start/End Date Notifications (`/notifications`)** — Header Notification Bell with live unread count, Neon `scheme_notifications` feed + live `schemes` start/end date countdowns, per-user read tracking (`user_notification_reads`), and Admin publishing. | MUST | **SHIPPED (v4.0)** | `api/notifications/index.ts`, `src/store/useNotificationsStore.ts`, `src/pages/public/NotificationsPage.tsx`, `src/components/common/Header.tsx` |
| **FR-39** | **Opt-In Gmail Notification Subscription & Direct SMTP Mailer** — Prompts users for their Gmail address and dispatches formatted HTML + plain-text start dates, closing deadlines, recent government schemes, and unclaimed eligible sectors via **Nodemailer Gmail SMTP** (`POST /api/notifications/send-email` + daily Vercel Cron `GET /api/notifications/cron`), logging to `email_dispatch_logs`. | MUST | **SHIPPED (v4.0)** | `api/_lib/mailer.ts`, `api/notifications/send-email.ts`, `api/notifications/cron.ts`, `vercel.json` |

---

## 5. Non-Functional Requirements

- **Security (`NFR-S1`–`NFR-S8`):**
  - Zero API keys, SMTP passwords, JWT secrets, or DB credentials in browser code; `DATABASE_URL`, `JWT_SECRET`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_INVITE_CODE`, `CRON_SECRET`, and optional `ANTHROPIC_API_KEY` reside strictly in server environment variables.
  - Passwords hashed with `crypto.scryptSync` + 16-byte random salt and verified with `crypto.timingSafeEqual`; HS256 JWT tokens verified with `timingSafeEqual` and stored in `HttpOnly; SameSite=Lax` cookies (+ optional `Bearer` header).
  - Strict Role-Based Access Control (`requireAuth` -> `401`, `requireAdmin` -> `403`) on `/api/admin/schemes`, `POST /api/notifications`, `/api/profile/me`, and `/api/applications`.
  - Sliding-window IP rate limiting (`30 req/min`, HTTP `429`) and request length/PII validation (`HTTP 422`) on `/api/profile/extract`, `/api/explain`, `/api/apisetu/sandbox`, and `/api/community/*`.
  - Strict HTTP headers in `vercel.json` (`Content-Security-Policy` keeping `connect-src 'self'` locked down while permitting `img-src https://*.tile.openstreetmap.org`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy: microphone=(self), camera=(), geolocation=(self)`).
  - PostgreSQL Row-Level Security (`ENABLE ROW LEVEL SECURITY`) + append-only trigger on `audit_log`.
- **Privacy (`NFR-P1`–`NFR-P6`):**
  - Zero collection or persistence of Aadhaar, PAN, Voter ID, Rice Card number, phone numbers, or bank account numbers across ASCII, Telugu, and Devanagari numerals.
  - Coarse household bands only (`below_1_2L`, `marginal_under_2_5_acres`, `60_plus`); zero voice audio ever uploaded or stored server-side.
  - Opt-in Gmail addresses for direct deadline notifications are isolated exclusively in private `user_profiles.gmail_address` (never exposed in public community boards, eligibility logs, or third-party trackers).
- **Accessibility, Responsiveness & Performance (`NFR-A1`–`NFR-A7`):**
  - WCAG 2.2 AA verified: `#1F4E79` primary (`8.66:1`), `#1A1A1A` body (`16.2:1`), `#64748B` form control borders (`4.76:1`), `>= 44×44px` touch targets, `14px` minimum font floor, skip-to-main-content link, WAI-ARIA Radix `Dialog` / `Tabs` / `RadioGroup`, and `prefers-reduced-motion` support.
  - Verified **`0.00px` horizontal overflow** on `360×780` viewports (including scrollbar-adjusted `344.80px` width).
  - Optimized route-level code splitting (`React.lazy`) yielding a lean **`58.14 kB` gzip** main entry bundle (20% smaller after removing runtime mocks) with pure lightweight SVG charts (`6.28 kB` gzip) and lazy-loaded Leaflet maps.
- **Multilingual & Indic Script Fidelity (`NFR-L1`–`NFR-L3`):**
  - Synchronized `<html lang="en|te|hi">` on initial hydration + global `Noto Sans Telugu` (`line-height: 1.75`) and `Noto Sans Devanagari` (`line-height: 1.65`) matra-safe typography without Indic `uppercase` or `letter-spacing` distortion.

---

## 6. Sustainability & Accuracy Governance Strategy

1. **Helping Citizens Who Don't Know Which Details Matter:** Progressive disclosure pairing story extraction and **Saathi Live Voice Call** with up to 3 skippable everyday household proxy questions (*White Rice Card*, *CCRC Tenant Card*, *School/College Child*).
2. **Staying Accurate When Scheme Rules Change:** 100% Neon relational rule rows + RBAC Admin Governance Studio + Synthetic Persona Regression Simulator + 90-day staleness TTL warnings + `FR-09` pending-verification hold + live Recent Scheme Notification publishing.
3. **Closing Coverage Gaps Over Time:** Interactive **Availed vs. Still Likely Eligible Sector Visualization** surfaces unclaimed benefits per family, while **Community Proposal Voting (`10+` votes)** escalates systemic welfare gaps to AP Collectorates (`1902` / PGRS) and NGOs.
4. **Who Pays (Zero Citizen Fee — B2B2C / DPI Model):**
   - **Horizon 1:** Corporate **CSR Schedule VII** rural-livelihood grants equipping NGO / SHG *VOA* / FPO field facilitators.
   - **Horizon 2:** Annual B2B SaaS licensing to **Regional Rural Banks & Co-op Banks** for *BC Sakhis* (driving Aadhaar-seeded NPCI DBT CASA deposits).
   - **Horizon 3:** State IEC / DPI white-label deployment across **AP Grama/Ward Sachivalayam** assistance desks and *Mana Mitra* WhatsApp Governance.

---

## 7. Current Verification & Deployment Status

- **Hosted Live URL:** `https://claimsaathi-nine.vercel.app` (SPA + Vercel Serverless Functions + Vercel Cron `30 3 * * *` + Neon PostgreSQL).
- **Database Provisioning:** One-command migration & seed runner `node scripts/apply-neon-migrations.mjs` applies `001`–`003` migrations and `001`–`003` seeds idempotently to Neon.
- **Environment Template:** Documented in `.env.example` (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_INVITE_CODE`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CRON_SECRET`, optional `ANTHROPIC_API_KEY`).
- **Automated Test Suite:** **`73 / 73` passing tests** across **9 `Vitest` suites** (`deterministicEngine`, `profileExtractor`, `piiValidator`, `calendarReminder`, `serverlessApi`, `voiceCallEngine`, `locatorAndApiSetu`, `communityAndFollowups`, `authNotificationsAndViz`).
- **Build Output:** `tsc && vite build` passes with `0` errors and `0` warnings (**`58.14 kB` gzip** main entry chunk + route-level lazy chunks).
