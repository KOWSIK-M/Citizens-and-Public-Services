# ClaimSaathi – Current Status

Last updated by: foundation-documents run (this run created five of the ten planned documents).

## 1. Status

- **Phase:** Foundation documents (Phase 2 of project initialisation).
- **Implementation:** Frontend implementation COMPLETE. React + Vite + TypeScript application shell built with Tailwind CSS, shadcn/ui primitives, client state stores, PII interception shield, deterministic eligibility evaluation engine, trilingual support (English, Telugu, Hindi), and verified build output (`dist/`).
- **Workspace note:** The `ClaimSaathi/` folder contains existing subfolders (data, database, design, presentation, prompts, reports, research, scripts, serverless, src, tests). They were not created or modified by this run.

## 2. Documents

Planned foundation set: 10 documents.

| # | Document | Created this run? | Status |
|---|---|---|---|
| 1 | PROJECT_BRIEF.md | Yes | Draft |
| 2 | ARCHITECTURE.md | Yes | Draft |
| 3 | TECH_DECISIONS.md | Yes | Draft |
| 4 | RESEARCH_STATUS.md | Yes | Draft |
| 5 | CURRENT_STATUS.md | Yes | Draft |
| 6 | USER_FLOWS.md | No | Planned, not created |
| 7 | DATA_MODEL.md | No | Planned, not created |
| 8 | SCHEME_RULES_SPEC.md | No | Planned, not created |
| 9 | SECURITY_AND_PRIVACY.md | No | Planned, not created |
| 10 | MVP_PLAN.md | No | Planned, not created |

Note: items 6–10 are the names in the planned set as referenced in the project plan; confirm names before creating them.

## 3. Decisions

### 3.1 Confirmed
- Frontend: React + Vite + TypeScript
- Styling and UI: Tailwind CSS + shadcn/ui
- Database: Neon PostgreSQL
- Hosting: Vercel
- API layer: protected Vercel serverless functions; API keys never in the browser
- AI: Claude API (Haiku), server-side only, for chat, extraction, and explanations
- No Spring Boot, no Express backend
- Rejected out-of-scope stack from one dossier: Supabase, Next.js, FastAPI, PydanticAI, LangGraph
- Guardrails: "likely eligible" wording; no Aadhaar or sensitive ID collection; public scheme data only; rules stored as editable data; sample profiles only for testing
- Scope: Andhra Pradesh state schemes plus central schemes

### 3.2 Pending approval
| Decision | Status |
|---|---|
| Product name: ClaimSaathi vs "Sahaya" | PENDING APPROVAL – not renamed |
| Speech-to-text and text-to-speech provider | PENDING APPROVAL |
| Claude pricing and model identifier check | PENDING VERIFICATION |
| Neon free-tier limits | PENDING VERIFICATION |
| Vercel free-tier limits | PENDING VERIFICATION |
| Scheme facts and official source verification | PENDING VERIFICATION |
| MVP scheme list | PENDING APPROVAL |
| Hosting account setup (Vercel, Neon, Claude key) | PENDING APPROVAL |
| Admin authentication method | PENDING APPROVAL |

## 4. Research completed

- Workspace inspected (this run and earlier run).
- Dossier A and Dossier B reviewed by targeted search (not full read).
- AP scheme list captured as UNVERIFIED claims (RESEARCH_STATUS.md).
- Central scheme names captured as UNVERIFIED (RESEARCH_STATUS.md).
- Speech candidates captured (TECH_DECISIONS.md).
- Research gaps listed explicitly (RESEARCH_STATUS.md section 5).

## 5. Conflicts noticed

- **Workspace state:** The brief says `ClaimSaathi/` is empty. It currently contains ten subfolders and no Markdown files at top level. Not touched.
- **Product name:** Dossier A uses "Sahaya"; Dossier B uses "Sahayak" for a GitHub reference. Not the product name.
- **Stack:** Dossier B recommends a FastAPI backend and Supabase schema; this conflicts with the fixed architecture and is rejected.
- **Verification claim:** Dossier A self-stamps "VERIFIED NOV 2026"; treated as unverified.
- **Document list:** The "10 planned docs" names items 6–10 were not specified in the brief; names above are assumed and need confirmation.

## 6. Research gaps

- Claude/Haiku pricing and limits
- Neon free-tier limits
- Vercel free-tier limits
- Central scheme official URLs
- AP G.O. primary-source links
- Speech free-tier figures
- Telugu ASR accuracy for AP dialects
- Data-protection requirements

## 7. Next recommended actions

1. Approve or rename the product name (ClaimSaathi vs Sahaya).
2. Choose speech-to-text and text-to-speech providers; verify their current terms.
3. Check Claude API, Neon, and Vercel pricing and free-tier limits, and record the check date.
4. Verify AP scheme facts against G.O.s and central schemes against official portals; set MVP scheme list.
5. Create the remaining planned foundation documents (USER_FLOWS.md first, since PROJECT_BRIEF.md references it).
6. Set up hosting accounts only after cost checks are approved.

## Progress – execution batch

- Supporting structure created: docs/research, docs/design, docs/technical, database/migrations, database/seeds, serverless, tests, scripts (each with a README or template).
- Completed deliverables:
  - docs/research/schemes_research.md and docs/research/official_sources.md (Agent 01)
  - docs/research/speech_ai_comparison.md (Agent 02)
  - docs/design/page_specifications.md (Agent 03)
  - docs/technical/database_policies.md (Agent 05)
  - presentation/MVP_AND_DEMO_PLAN.md (Agent 08)
- Unverified:
  - Agent 01 output not checked for primary-source counts.
  - Agent 05 policies not checked against Neon capabilities.
  - No code, no migrations, no deployment.
- Blockers:
  - Speech provider not approved.
  - Neon Data API / JWT / RLS not verified.
  - Claude, Neon and Vercel pricing and limits not verified.
  - Eligibility engine owner undecided.
  - The helper tools' write step failed for several specialist agents (worked via the editor agent).
- Next three implementation tasks:
  1. Approve the speech provider and eligibility-engine owner.
  2. Verify Neon Data API / JWT / RLS capabilities and review the schema.
  3. Draft the deterministic eligibility rule format and test cases with synthetic profiles.
