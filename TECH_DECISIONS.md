# ClaimSaathi – Technology Decisions

**Status:** APPROVED & IMPLEMENTED (v4.0 Full-Stack Neon + JWT + SMTP Release — 2026-11-21)  
**Cross-Reference:** See [DECISIONS.md](./DECISIONS.md) (`D-01`–`D-47`) and [PRD.md](./PRD.md).

---

## 1. Confirmed Production Stack

| Layer | Technology Choice | Implementation & Rationale |
|---|---|---|
| **Frontend SPA** | React 18.3 + Vite 5.4 + TypeScript 5.7 (`strict: true`) | Zero runtime mocks; code-split SPA (`58.14 kB` gzip entry chunk), pure-SVG `SectorCoverageVisualizer` (`6.28 kB` gzip), `useSyncExternalStore` reactive stores, and local Vite `/api/*` middleware mirroring Vercel serverless routes. |
| **Styling & Accessibility** | Tailwind CSS 3.4 + Radix UI (`dialog`, `tabs`, `radio-group`, `label`, `slot`) | WCAG 2.2 AA contrast (`#1F4E79` primary, `#64748B` form borders), `14px` font floor, `>= 44×44px` touch targets, `0.00px` overflow at `360×780`, and matra-safe `Noto Sans Telugu` / `Noto Sans Devanagari` typography. |
| **Authentication & Authorization** | Custom Node `crypto` HS256 JWT + `scryptSync` + RBAC (`citizen` / `admin`) | Zero external auth bloat (`api/_lib/auth.ts`); `HttpOnly; SameSite=Lax` cookie + `Bearer` token; strict `401`/`403` enforcement on `/api/admin/schemes`, `/api/profile/me`, `/api/applications`, and `POST /api/notifications`. |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`) — 100% Live | Zero mock fallbacks (`api/_lib/db.ts`); relational tables across `001`, `002`, and `003` migrations (`schemes`, `scheme_sources`, `scheme_rules`, `scheme_documents`, `application_steps`, `audit_log`, `users`, `user_profiles`, `user_applications`, `scheme_notifications`, `user_notification_reads`, `email_dispatch_logs`, `community_proposals`, `community_messages`), applied via `node scripts/apply-neon-migrations.mjs`. |
| **Hosting & Edge Security** | Vercel (SPA + Serverless Functions + Daily Cron) | Live at `https://claimsaathi-nine.vercel.app` with strict CSP (`connect-src 'self'`, `img-src https://*.tile.openstreetmap.org`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy: microphone=(self), camera=(), geolocation=(self)`, and daily `30 3 * * *` notification cron. |
| **Email & Scheduled Alerts** | Open-Source `nodemailer` (`smtp.gmail.com`) + Vercel Cron | Dispatches start-date, closing-deadline, recent government scheme, and unclaimed-sector digests to opt-in citizen Gmail addresses (`POST /api/notifications/send-email`, `GET /api/notifications/cron`) with audit logging in `email_dispatch_logs`. |
| **Eligibility Reasoning & NLP** | Neuro-Symbolic Deterministic Engine + Optional Claude Haiku (`temp: 0`) | Evaluates all 6 operators (`eq`, `neq`, `in`, `lte`, `gte`, `between`), `condition_group` OR-branches, `FR-08`, and `FR-09`; falls back cleanly to trilingual deterministic NLP when `ANTHROPIC_API_KEY` is unset. |
| **Speech Intake & Live Call** | Browser Web Speech API (`STT` + `TTS`) + Web Audio Visualizer + `voiceCallEngine.ts` | Zero-key local `en-IN`, `te-IN`, and `hi-IN` spoken intake, "Read Aloud" playback, and full phone-call style **Saathi Live Call** (`/voice-call`). |
| **Civic Maps & API Setu Proxies** | `leaflet` 1.9 + OpenStreetMap + `/api/locator/nearby` + `/api/apisetu/*` | Interactive 26-district AP Sachivalayam/MeeSeva maps + server-proxied Overpass & India Post IPPB PIN lookups keeping `connect-src 'self'` strict + synthetic-only OpenAPI v3 sandbox (`is_sample: true`). |
| **Automated Testing** | `Vitest` 2.1 (`npm test`) | `73 / 73` passing tests across 9 suites (`deterministicEngine`, `profileExtractor`, `piiValidator`, `calendarReminder`, `serverlessApi`, `voiceCallEngine`, `locatorAndApiSetu`, `communityAndFollowups`, `authNotificationsAndViz`). |

---

## 2. Rejected Stacks and Components

| Rejected Option | Reason |
|---|---|
| Spring Boot / Express / FastAPI | Separate always-on backend adds operational surface; Vercel serverless functions + Vite dev API middleware cover all API boundaries. |
| Next.js / Supabase | Out of scope per fixed project architecture (`Vite SPA + Neon PostgreSQL`). |
| Pure-LLM Eligibility Matching / LangGraph | Unexplainable and prone to hallucinated guarantees; eligibility must be 100% deterministic over auditable rule data (`D-04`). |
| Runtime Hardcoded Mock Data | Removed completely in v4.0 (`D-42`); Neon PostgreSQL is the sole authoritative data source across catalog, auth, profiles, applications, notifications, and community boards. |
| Sarvam Saarika (Deprecated ASR) | Deprecated per research review (`D-07`). |

---

## 3. Privacy, Provenance & Operational Controls

1. **Unicode Indic PII Shield (`src/utils/piiValidator.ts`):** Normalizes Telugu (`౦–౯`) and Devanagari (`०–९`) digits to ASCII prior to stateless regex scanning across Aadhaar, mobile numbers, PAN, Voter ID, IFSC, bank/card numbers, and emails on both client and `/api/*`.
2. **JWT RBAC Governance (`D-43`, `D-44`):**
   - `GET /api/schemes` serves published Neon schemes publicly, while `PATCH /api/admin/schemes` and `POST /api/notifications` strictly enforce `role === 'admin'` via HS256 JWT (`401`/`403`) and record every mutation in the append-only PostgreSQL `audit_log`.
3. **Private Opt-In Gmail Alerts (`D-47`):** Opt-in Gmail addresses for deadline emails are stored strictly in private `user_profiles.gmail_address` for the authenticated user—never collected for public community chat or eligibility matching.
