# ClaimSaathi – Decision Log

Status: DRAFT. Each row records one decision or open question. Status values: CONFIRMED, PENDING APPROVAL, PENDING VERIFICATION.
Dates: no decision date is recorded in the source documents, so the date column reads "not recorded" unless a date is stated.
Companion document: `PRD.md` (its §11 links open items to these IDs).

## 1. Decision table

| ID | Decision or question | Status | Owner | Source document | Date recorded |
|---|---|---|---|---|---|
| D-01 | Stack: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Neon PostgreSQL, Vercel, Claude API (Haiku). | CONFIRMED | Project owner | TECH_DECISIONS.md §1; CURRENT_STATUS.md §3.1 | not recorded |
| D-02 | Serverless-only backend: Vercel serverless functions. No Spring Boot, no Express, no separate always-on backend. | CONFIRMED | Project owner | TECH_DECISIONS.md §2; ARCHITECTURE.md §1, §11 | not recorded |
| D-03 | Claude API used server-side only; API keys never in browser code. | CONFIRMED | Project owner | ARCHITECTURE.md §6, §10; project instructions (non-negotiable rule 1) | not recorded |
| D-04 | Deterministic eligibility evaluation is separate from LLM-generated explanations. The model explains; stored rules decide. | CONFIRMED | Project owner | ARCHITECTURE.md §6; TECH_DECISIONS.md §6 | not recorded |
| D-05 | Product name: "ClaimSaathi" versus "Sahaya" (named in Dossier A). The product is not renamed until decided. | PENDING APPROVAL | Project owner | TECH_DECISIONS.md §5; CURRENT_STATUS.md §3.2, §5 | not recorded |
| D-06 | Speech provider. STT shortlist: Sarvam Saaras v4 (te-IN), Bhashini, IndicConformer-600M. TTS shortlist: Sarvam Bulbul v4 Flash, Indic Parler-TTS, Bhashini. Saarika rejected (deprecated per dossiers). Voice stays optional until approved. Free limits: PENDING VERIFICATION. | PENDING APPROVAL | Project owner; research by Agent 02 | TECH_DECISIONS.md §3, §4; ARCHITECTURE.md §7 | not recorded |
| D-07 | Sarvam deprecation conflict: the two research dossiers disagree on the status of Sarvam services. Must be checked against both dossiers and the current provider page. | PENDING VERIFICATION | Agent 02 | CURRENT_STATUS.md §5 (dossier conflicts); TECH_DECISIONS.md §3 | not recorded |
| D-08 | Eligibility engine owner. Not assigned. Candidates: Frontend_Implementation_Engineer (Agent 04) or AI integration agent (Agent 06). | PENDING APPROVAL | Orchestrator; Project owner to approve | AGENT_TASK_BOARD.md §0, §1 (roles); CURRENT_STATUS.md §6 | not recorded |
| D-09 | Neon Data API (client access from browser), Neon Auth/JWT claims for RLS (`auth.uid()`), and RLS enforcement with cross-user tests. | PENDING VERIFICATION | Agent 05 | docs/technical/database_policies.md §3; CURRENT_STATUS.md §6 | not recorded |
| D-10 | Anonymous (no sign-in) profile sessions allowed in MVP? If yes, how RLS applies without `auth.uid()`. | PENDING APPROVAL | Project owner; Agent 05 | docs/technical/database_policies.md §4(1); DATABASE_SCHEMA.md §9(3); USER_FLOWS.md Open Q2 | not recorded |
| D-11 | Admin writes: direct under RLS, or only through serverless functions (publish is via function). The docs give both. | PENDING APPROVAL | Agent 05; Project owner | docs/technical/database_policies.md §4(2); DATABASE_SCHEMA.md §4 | not recorded |
| D-12 | Authentication provider, and how `owner_user_id` and `admin_roles.user_ref` are populated. | PENDING APPROVAL | Project owner | ARCHITECTURE.md §12; TECH_DECISIONS.md §5; DATABASE_SCHEMA.md §3.11 | not recorded |
| D-13 | Reminder delivery channel: in-app first, or SMS/WhatsApp/email. | PENDING APPROVAL | Project owner | USER_FLOWS.md Flow 6 step 4; PROJECT_BRIEF.md §5.1 | not recorded |
| D-14 | MVP scheme list (Andhra Pradesh state schemes plus central schemes). Scheme facts unverified. | PENDING APPROVAL | Project owner; Agent 01 | TECH_DECISIONS.md §5; CURRENT_STATUS.md §3.2; MVP_AND_DEMO_PLAN.md §2 | not recorded |
| D-15 | Pricing and free-tier limits for Claude (Haiku), Neon and Vercel. No budget set. Model identifier also PENDING VERIFICATION. | PENDING VERIFICATION | Orchestrator | TECH_DECISIONS.md §3; ARCHITECTURE.md §6; CURRENT_STATUS.md §6 | not recorded |
| D-16 | Hosting account setup (Vercel, Neon, Claude API keys). | PENDING APPROVAL | Project owner | TECH_DECISIONS.md §5, §8; CURRENT_STATUS.md §3.2 | not recorded |
| D-17 | Scheme research (Agent 01) NOT DONE. `docs/research/schemes_research.md` and `docs/research/official_sources.md` are still template text. | PENDING VERIFICATION | Agent 01 | CURRENT_STATUS.md §1 (progress), AGENT_TASK_BOARD.md T-01-A/B | not recorded |
| D-18 | Git repository: `ClaimSaathi/` is its own repository (not the workspace root), pushed to `https://github.com/KOWSIK-M/Citizens-and-Public-Services.git`. First commit `0b7325f` reported pushed. | CONFIRMED | Project owner (instruction in session) | Owner instruction (session record); not a repo document | not recorded |
| D-19 | Agent count: the brief says 10; the workspace has 9 specialists plus the orchestrator. Recorded as 9 + orchestrator. Wording to be confirmed by owner. | CONFIRMED | Orchestrator | AGENT_TASK_BOARD.md §0, §5; PROJECT_BRIEF.md (agent count) | not recorded |
| D-20 | Rate-limit mechanism for AI, speech and profile routes. | PENDING APPROVAL | Project owner; Agent 07 | ARCHITECTURE.md §5, §10, §12; TECH_DECISIONS.md §5 | not recorded |
| D-21 | Retention policy for citizen description text and audio. Default: not stored. | PENDING APPROVAL | Project owner | ARCHITECTURE.md §7, §9.2; TECH_DECISIONS.md §5 | not recorded |
| D-22 | Deadline reminders in MVP (or Future only). | PENDING APPROVAL | Project owner | TECH_DECISIONS.md §5, §8; MVP_AND_DEMO_PLAN.md §1 | not recorded |
| D-23 | Clarifying-question limit of 3 per profile for demo. | PENDING APPROVAL | Project owner; Agent 03 | USER_FLOWS.md Flow 1 step 7, Open Q1 | not recorded |
| D-24 | Stale-source review interval, and whether admin may publish with a stale source (warn or block). | PENDING APPROVAL | Project owner | USER_FLOWS.md Flow 7, edge cases, Open Q4–Q5 | not recorded |
| D-25 | Success thresholds (accuracy, user counts, latency). | PENDING VERIFICATION | Project owner | PROJECT_BRIEF.md §9; MVP_AND_DEMO_PLAN.md §4 | not recorded |
| D-26 | Frontend status conflict. CURRENT_STATUS.md §1 says a React frontend shell in `src/` is built and verified (`dist/`). The owner's brief for this PRD says no application code exists. Neither claim is verified here. | PENDING VERIFICATION | Orchestrator | CURRENT_STATUS.md §1; AGENT_TASK_BOARD.md T-04-A | not recorded |
| D-27 | Whether eligibility assessments are stored for MVP, and their retention period. | PENDING APPROVAL | Agent 05; Project owner | DATABASE_SCHEMA.md §3.9, §9(6); docs/technical/database_policies.md §4(10) | not recorded |
| D-28 | Telugu copy reviewed by a Telugu speaker before demo; Telugu date format and month names. | PENDING VERIFICATION | Agent 03; Project owner | DESIGN_SYSTEM.md §8, §10(7); page_specifications.md (open decisions) | not recorded |
| D-29 | Synthetic (sample) profiles only for development, testing and demo; `is_sample = true`. | CONFIRMED | Project owner | PROJECT_BRIEF.md §8; DATABASE_SCHEMA.md §1; MVP_AND_DEMO_PLAN.md §2 | not recorded |
| D-30 | Wording: "likely eligible" only; never "guaranteed" or "approved". | CONFIRMED | Project owner | PROJECT_BRIEF.md §8; DESIGN_SYSTEM.md §9; USER_FLOWS.md guardrails | not recorded |
| D-31 | No Aadhaar number or other sensitive ID is collected, stored, logged or shown. | CONFIRMED | Project owner | PROJECT_BRIEF.md §8; DATABASE_SCHEMA.md §5; project instructions (rule 3) | not recorded |
| D-32 | Scheme rules stored as editable data, not hard-coded. Storage format (JSON or DB rows) is open. | PENDING APPROVAL | Project owner; Agent 05 | PROJECT_BRIEF.md §8; TECH_DECISIONS.md §5 | not recorded |
| D-33 | Neon schema (DATABASE_SCHEMA.md) approved for migrations. Status PROPOSED – NOT APPROVED; no DDL written. | PENDING APPROVAL | Agent 05; Project owner | DATABASE_SCHEMA.md header; AGENT_TASK_BOARD.md T-05-A, T-05-B | not recorded |

## 2. Decisions needed from the owner

Each item is PENDING APPROVAL. Answer each one by ID.

1. **D-05** Product name: keep "ClaimSaathi" or adopt "Sahaya"?
2. **D-06** Speech-to-text and text-to-speech provider (Sarvam, Bhashini, IndicConformer, Indic Parler-TTS, or other)? Free-tier limits must be verified before the choice is final.
3. **D-08** Who owns the deterministic eligibility engine (Agent 04 or Agent 06, or another owner)?
4. **D-10** Are anonymous (no sign-in) profile sessions allowed in the MVP?
5. **D-11** Should admin writes go directly under RLS or only through serverless functions?
6. **D-12** Which authentication provider is used for citizens and admins?
7. **D-13** Which reminder channel is used: in-app only, or SMS/WhatsApp/email?
8. **D-14** Which schemes form the MVP list (AP state plus central)?
9. **D-16** Approve creation of Vercel, Neon and Claude API accounts (after cost checks in D-15).
10. **D-20** Which rate-limit mechanism is used on AI, speech and profile routes?
11. **D-21** What is the retention policy for description text and audio (default: not stored)?
12. **D-22** Are deadline reminders in the MVP, or Future only?
13. **D-23** Is a limit of 3 clarifying questions acceptable for the demo?
14. **D-24** What is the stale-source review interval, and may admin publish with a stale source?
15. **D-27** Are eligibility assessments stored for the MVP, and for how long?
16. **D-32** Storage format for scheme rules (JSON files or database rows)?
17. **D-33** Approve the proposed Neon schema for migrations (Agent 05 review first)?
