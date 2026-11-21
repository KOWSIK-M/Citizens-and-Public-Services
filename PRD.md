# ClaimSaathi – Product Requirements Document (PRD)

Status: DRAFT for owner review. Derived only from existing ClaimSaathi documents (listed in §10). Anything those documents do not state is marked **PENDING**.
Decision IDs (D-xx) refer to `DECISIONS.md`.

## 1. Purpose and problem statement

ClaimSaathi is a plain-language welfare navigator for citizens of Andhra Pradesh (AP).

**Problem Statement 5, "Claim What's Yours"** (Citizens and Public Services, source: `Problem_Statement.txt` as cited in PROJECT_BRIEF.md §1):
- India has hundreds of central and state welfare schemes. Many eligible families never claim them.
- Information is scattered, eligibility rules are written in legal and government language, document lists are unclear, and people depend on middlemen for public information.
- Most portals are English-first. Regional-language voice input is a goal "if possible".

**Citizen needs:** plain-language input, likely-eligibility matching with the reason per rule, a document checklist, step-by-step application guidance, reminders and tracking (future), and an official source with a verified date for every scheme (PROJECT_BRIEF.md §2).

**MVP purpose:** demonstrate the matching, checklist, guide and source items end to end, with synthetic profiles only (PROJECT_BRIEF.md §9; MVP_AND_DEMO_PLAN.md §1).

## 2. Target users and scope

| Target user | Typical schemes of interest (examples only; scheme facts PENDING VERIFICATION) |
|---|---|
| Low-income students | Post-matric scholarship schemes |
| Senior citizens | State and central old-age pensions |
| Small farmers | Farm income-support schemes, crop insurance |
| Women entrepreneurs | Enterprise and credit schemes |
| Daily-wage worker families | Rural employment, housing, health cover |

- **Geography:** Andhra Pradesh state schemes plus central schemes applicable to AP residents (PROJECT_BRIEF.md §3).
- **Users in scope for MVP:** citizens (describe, check, read); admins (edit schemes, rules and sources).
- **MVP scheme list:** PENDING APPROVAL (D-14). No scheme is confirmed for MVP.
- **Anonymous use** (no sign-in) for onboarding and results: PENDING APPROVAL (D-10).

## 3. Goals and success criteria

**Goals**
- G1. Help a citizen find schemes they may qualify for, with the reason shown.
- G2. Reduce dependence on middlemen by showing public official steps and documents.
- G3. Keep every scheme fact traceable to an official source with a verified date.
- G4. Let an admin change a rule without a code deploy.

**Success criteria** (PROJECT_BRIEF.md §9; MVP_AND_DEMO_PLAN.md §4)
- SC-1: A typed synthetic profile produces at least one likely-eligible scheme with a visible reason per rule.
- SC-2: Each result shows an official source link and last-verified date, or an explicit PENDING VERIFICATION marker.
- SC-3: Document checklist and application steps appear for each matched scheme.
- SC-4: No Aadhaar or sensitive ID field exists in the UI or database.
- SC-5: An admin rule change changes the result without a code deploy.
- SC-6: Demo runs end to end on the hosted Vercel build using synthetic profiles only.
- SC-7: Numeric thresholds (accuracy, users, latency): PENDING VERIFICATION, to be set after scope approval.

## 4. Functional requirements

Priority: MUST = MVP; SHOULD = MVP if approved or time allows; LATER = future.

| ID | Requirement | Priority | Source doc |
|---|---|---|---|
| FR-01 | Citizen types a free-text description of their situation; no long form. Max length PROPOSED (e.g. 500 characters). | MUST | PROJECT_BRIEF.md §5.1; USER_FLOWS.md Flow 1 |
| FR-02 | Server-side Claude (Haiku) extracts a proposed profile from the text; citizen confirms or edits every field before matching. | MUST | ARCHITECTURE.md §6, §9.1; USER_FLOWS.md Flow 1 steps 5–8 |
| FR-03 | Input containing ID-like numbers (e.g. 12-digit strings) is blocked and cleared; nothing is stored or logged. | MUST | USER_FLOWS.md Flow 1 step 4; DATABASE_SCHEMA.md §5 |
| FR-04 | Up to 3 short clarifying questions, one per screen, each skippable. Skipped fields are "unknown". Limit of 3 is an open question. | SHOULD | USER_FLOWS.md Flow 1 step 7, Open Q1 |
| FR-05 | Deterministic rule engine matches the confirmed profile to published rules and gives each scheme one result: Likely eligible, Need more information, or Not likely eligible. | MUST | ARCHITECTURE.md §6, §9.2; USER_FLOWS.md Flow 3 |
| FR-06 | Each match shows the rule(s) that triggered it in plain language (reason_en / reason_te). | MUST | USER_FLOWS.md Flow 3 step 3; DATABASE_SCHEMA.md §3.5 |
| FR-07 | A missing-information list names the exact fields needed, each with an "Add this detail" action. | SHOULD | USER_FLOWS.md Flow 3 step 3 |
| FR-08 | A missing field never produces "Not likely eligible"; it produces "Need more information". | MUST | USER_FLOWS.md Flow 3, edge cases |
| FR-09 | A scheme with no verified rules shows "Rules pending verification" and is excluded from likely-eligible results. | MUST | USER_FLOWS.md Flow 3 error states, edge cases |
| FR-10 | Results and scheme detail show bilingual name, level, category, status (open / closed / not yet open), official source link, publisher, and last-verified date or PENDING VERIFICATION. | MUST | PROJECT_BRIEF.md §5.1, §9; USER_FLOWS.md Flow 2 |
| FR-11 | Document checklist per scheme, split Mandatory and Optional; tick boxes are local and not stored. "Document list pending verification" if none recorded. | MUST | USER_FLOWS.md Flow 4; page_specifications.md |
| FR-12 | Application guide per scheme: numbered bilingual steps with official link; online-only and offline-only schemes handled without inventing links. | MUST | USER_FLOWS.md Flow 5 |
| FR-13 | Every visible UI string available in English and Telugu; language toggle always visible. | MUST | DESIGN_SYSTEM.md §8; PROJECT_BRIEF.md §4 |
| FR-14 | Admin sign-in (method PENDING) and restricted admin area; non-admins see a "Not authorised" page. | MUST | USER_FLOWS.md Flow 7 step 1; PROJECT_BRIEF.md §5.2 |
| FR-15 | Admin creates and edits schemes, rules and sources as data, with no code change. | MUST | PROJECT_BRIEF.md §5.2, §8 |
| FR-16 | Admin records source verification: official URL, publisher, document type (G.O., portal, news), retrieved date, verified date, verifier reference. | MUST | PROJECT_BRIEF.md §5.2; DATABASE_SCHEMA.md §3.6 |
| FR-17 | Each admin save creates a draft version; publish is blocked unless every rule has a source and a verified date; publish writes an audit log entry. | MUST | USER_FLOWS.md Flow 7 steps 5, 7, 8; DATABASE_SCHEMA.md §3.12 |
| FR-18 | Admin preview: run the engine on sample profiles only and check reasons before publish. | SHOULD | USER_FLOWS.md Flow 7 step 6 |
| FR-19 | Stale-source warning when verified date is older than the review interval (interval PENDING). | SHOULD | USER_FLOWS.md edge cases, Flow 7 decision points |
| FR-20 | Public landing, About and Disclaimer pages with the "likely eligible" notice. | MUST | PROJECT_BRIEF.md §5.3 |
| FR-21 | Every results and scheme page shows the disclaimer that this is not an official decision. | MUST | USER_FLOWS.md Flow 3 step 5; MVP_AND_DEMO_PLAN.md §5 |
| FR-22 | Any test or sample profile carries a sample banner; sample profiles are flagged `is_sample = true`. | MUST | USER_FLOWS.md edge cases; DATABASE_SCHEMA.md §1 |
| FR-23 | Voice input (speech-to-text) in regional language; hidden with a typing notice if no provider is approved. | SHOULD | PROJECT_BRIEF.md §5.1; MVP_AND_DEMO_PLAN.md §1 (PENDING APPROVAL, D-06) |
| FR-24 | Voice output (text-to-speech) of results. | LATER | PROJECT_BRIEF.md §5.1, §6 |
| FR-25 | Deadline reminders for schemes the citizen selects. | LATER | PROJECT_BRIEF.md §5.1; USER_FLOWS.md Flow 6 (MVP only if time allows, D-22) |
| FR-26 | Application tracking ("My schemes") for signed-in citizens: status, reminder date, deadline. | LATER | PROJECT_BRIEF.md §5.1; USER_FLOWS.md Flow 6 |
| FR-27 | Government API integration for eligibility rules or scheme data. | LATER | PROJECT_BRIEF.md §6 (none confirmed; no public eligibility-rules API found) |

## 5. Non-functional requirements

**Security**
- NFR-S1: Anthropic API key, speech keys and Neon owner or service credentials never appear in browser code; they live in Vercel environment variables read only by serverless functions (ARCHITECTURE.md §5, §10).
- NFR-S2: Row-Level Security on every table holding user data; cross-user isolation tests required. RLS capability in Neon is PENDING VERIFICATION (D-09).
- NFR-S3: Every serverless function validates request shape and length, and rejects ID-like input (ARCHITECTURE.md §5).
- NFR-S4: Admin routes require authentication; method PENDING APPROVAL (D-12).
- NFR-S5: Rate limiting on AI, speech and profile routes; mechanism PENDING APPROVAL (D-20).
- NFR-S6: The service role key is never sent to the browser (DATABASE_SCHEMA.md §4).

**Privacy**
- NFR-P1: No Aadhaar number, PAN, voter ID, ration card number, phone, email, exact address, exact income or bank detail is collected, stored, logged or shown (DATABASE_SCHEMA.md §3.1, §5).
- NFR-P2: Profiles use coarse bands and categories, not exact values, where a band is enough (DATABASE_SCHEMA.md §1).
- NFR-P3: Citizen description text and audio are not stored by default; retention policy PENDING APPROVAL (D-21). Audio is processed transiently (ARCHITECTURE.md §7, §9.2).
- NFR-P4: No sensitive-ID pattern is written to logs or the audit log (DATABASE_SCHEMA.md §5).

- NFR-P6: Admins have no blanket read of citizen profiles (PROPOSED; to be confirmed).

**Accessibility**
- NFR-A1: Target WCAG 2.2 AA (intent only; NOT verified). Contrast of every colour token is PENDING VERIFICATION (DESIGN_SYSTEM.md §2, §7).
- NFR-A2: Keyboard operable; visible focus ring; touch targets at least 44 x 44 px; body text at least 16 px; nothing below 14 px (PROPOSED).
- NFR-A3: Status shown by icon and text, never colour alone.

- NFR-A5: Layout works at 360 px width with no horizontal scroll, including long Telugu words (PROPOSED).
- NFR-A6: Accessibility test tool and manual screen-reader plan: PENDING VERIFICATION.

**Language**
- NFR-L1: English and Telugu throughout; missing Telugu falls back to English with an "English only" note; raw keys are never shown (DESIGN_SYSTEM.md §8).
- NFR-L2: All Telugu copy reviewed by a Telugu speaker before demo: PENDING.
- NFR-L3: Telugu date format and month names: PENDING TRANSLATION REVIEW.
**Performance and latency**
- NFR-PF1: Numeric latency targets: PENDING VERIFICATION (set after scope approval, SC-7). Cold starts and function time limits may affect voice flows: PENDING VERIFICATION (TECH_DECISIONS.md §7).

**Cost**
- NFR-C1: No service is assumed to be free for the demo until its limits are verified and recorded (TECH_DECISIONS.md §3).
- NFR-C2: Claude, Neon and Vercel pricing and free-tier limits: PENDING VERIFICATION (D-15). No budget figure is set.

**Auditability**
- NFR-AU1: Each rule traces to a source row with `verified_at` and `verified_by`; no rule without a source (DATABASE_SCHEMA.md §3.5, §6).
- NFR-AU2: Every admin write appends to `audit_log` (append-only; summary only, no citizen data) (DATABASE_SCHEMA.md §3.12).
- NFR-AU3: Rule evaluation is deterministic code over database rules, so the same inputs give the same result. Each result stores rule IDs, matched flags, engine version and wording key; whether results are stored at all is PENDING APPROVAL (D-27).

## 6. Guardrails

- **Wording:** say "likely eligible" only. Never "guaranteed", "approved" or "sure to get" (PROJECT_BRIEF.md §8; DESIGN_SYSTEM.md §9).
- **Deterministic eligibility is separate from LLM explanations.** Rules decide; the model only rewrites reasons in plain language. Model text never sets the result (ARCHITECTURE.md §6; TECH_DECISIONS.md §6) (D-04).
- **Synthetic profiles only** for development, testing and demo (PROJECT_BRIEF.md §8; MVP_AND_DEMO_PLAN.md §2) (D-29).
- **Official sources only.** Every material scheme claim carries an official source link and a verified date, or "PENDING VERIFICATION". No scheme rule, threshold, deadline, document or URL is invented (PROJECT_BRIEF.md §8).
- **Missing or conflicting input is unknown.** Ask the citizen; never silently choose (USER_FLOWS.md edge cases).
- **Preliminary guidance only.** Every result carries the disclaimer "This is not an official decision. Confirm with the department." (USER_FLOWS.md Flow 3).

## 7. Architecture constraints

- Frontend: React + Vite + TypeScript single-page app (ARCHITECTURE.md §4; TECH_DECISIONS.md §1).
- Styling and UI kit: Tailwind CSS + shadcn/ui, copied into the repo (not a runtime remote dependency).
- Database: Neon PostgreSQL. Schema is PROPOSED, NOT APPROVED (DATABASE_SCHEMA.md).
- Hosting: Vercel, serving the static SPA and protected serverless functions.
- API layer: Vercel serverless functions only. Routes named in ARCHITECTURE.md §2 (`/api/profile/extract`, `/api/eligibility/match`, `/api/explain`, `/api/chat`, `/api/speech/*`, `/api/admin/*`).
- AI: Claude API, Haiku model, server-side only. Exact model identifier PENDING VERIFICATION (ARCHITECTURE.md §6).
- Speech: behind one internal interface in a serverless function; provider PENDING APPROVAL (D-06).
- **No Spring Boot, no Express, no separate always-on backend** (TECH_DECISIONS.md §2). Rejected from research dossiers: Supabase, Next.js, FastAPI, PydanticAI, LangGraph.
- Scheme rules are stored as data, not hard-coded (TECH_DECISIONS.md §6). Storage format PENDING APPROVAL.

## 8. Out of scope for MVP

- Voice output (text-to-speech), unless a provider is approved and time allows (FR-24).
- Deadline reminders and application tracking (FR-25, FR-26).
- Real-user data handling and consent flows (PROJECT_BRIEF.md §6).
- Government API integrations (none confirmed).
- Regional languages beyond English and Telugu.
- Any application submission on behalf of a citizen. Users are sent to official portals.
- Middleman or agent features, payments, and Aadhaar or ID verification. Dark mode (DESIGN_SYSTEM.md §2).
- Hosting account setup and cost commitments until approved (D-16).

## 9. User journeys

Full detail belongs in `USER_FLOWS.md`. One line each:

1. **First-time citizen:** describes the situation in plain language, confirms the extracted profile, and sees likely-eligible schemes with reasons (USER_FLOWS.md Flows 1–3).
2. **Document prep:** opens a scheme and gets the document checklist and application steps (USER_FLOWS.md Flows 4–5).
3. **Admin update:** signs in, edits a rule or source date, saves a draft, publishes, and sees the change on scheme detail (USER_FLOWS.md Flow 7).
4. **Return user (future):** views tracked applications and upcoming deadlines (USER_FLOWS.md Flow 6).

## 10. Current status

**Source of status:** CURRENT_STATUS.md, AGENT_TASK_BOARD.md, and the session record. Items I did not verify are marked as such.

**What exists**
- Foundation documents: PROJECT_BRIEF.md, ARCHITECTURE.md, TECH_DECISIONS.md, CURRENT_STATUS.md, AGENT_TASK_BOARD.md (drafts); DESIGN_SYSTEM.md, DATABASE_SCHEMA.md and USER_FLOWS.md (PROPOSED, NOT APPROVED).
- Specialist outputs: docs/technical/database_policies.md (PENDING); docs/design/page_specifications.md (PENDING); presentation/MVP_AND_DEMO_PLAN.md (PENDING APPROVAL).
- Supporting folders: docs/research, docs/design, docs/technical, database/migrations, database/seeds, serverless, tests, scripts, data, prompts, reports, presentation (each with a README or template).
- Git: `ClaimSaathi/` is its own git repository. First commit `0b7325f` was reported pushed to `origin/main` at `github.com/KOWSIK-M/Citizens-and-Public-Services`. **I did not verify this.**

**What does NOT exist**
- No database migrations or DDL applied. Schema is proposed only.
- No deployment. No Vercel project or Neon project confirmed. Hosting setup PENDING APPROVAL (D-16).
- No serverless functions: AGENT_TASK_BOARD.md shows T-06-A (AI) and T-07-A (non-AI functions) as Blocked.
- No verified scheme facts. The MVP scheme list is not approved (D-14).
- **Scheme research is NOT complete.** The deliverables `docs/research/schemes_research.md` and `docs/research/official_sources.md` are still template text, not completed research. The scheme research task (Agent 01) is recorded as not done (D-17).
- Application code: **CONFLICT (D-26).** CURRENT_STATUS.md §1 states that a React + Vite + TypeScript frontend shell in `src/` was built and verified (`dist/`). The owner's brief for this document states that no application code exists. I did not verify either claim. Treat as PENDING VERIFICATION.

**Blockers (from CURRENT_STATUS.md §6 and AGENT_TASK_BOARD.md)**
- Speech provider not approved (D-06).
- Neon Data API, JWT and RLS not verified (D-09).
- Claude, Neon and Vercel pricing and limits not verified (D-15).
- Eligibility engine owner not assigned (D-08).

## 11. Open items

Each open item links to its decision in `DECISIONS.md`.

| Open item | Decision ID |
|---|---|
| Product name: ClaimSaathi or "Sahaya" | D-05 |
| Speech-to-text and text-to-speech provider | D-06, D-07 |
| Eligibility engine owner | D-08 |
| Neon Data API, JWT and RLS capability | D-09 |
| Anonymous profile sessions in MVP | D-10 |
| Admin writes direct under RLS or via serverless functions | D-11 |
| Authentication provider | D-12 |
| Reminder channel (in-app, SMS or WhatsApp) | D-13 |
| MVP scheme list (AP plus central) | D-14 |
| Claude, Neon and Vercel pricing and free-tier limits | D-15 |
| Hosting account setup | D-16 |
| Scheme research completion (Agent 01) | D-17 |
| Rate-limit mechanism | D-20 |
| Retention of description text and audio | D-21 |
| Deadline reminders in MVP | D-22 |
| Clarifying-question limit (3) | D-23 |
| Stale-source review interval | D-24 |
| Success thresholds (accuracy, users, latency) | D-25 |
| Frontend implementation status conflict | D-26 |
| Retention of eligibility assessments | D-27 |
| Telugu translation review and date format | D-28 |
| Agent count wording | D-19 |
