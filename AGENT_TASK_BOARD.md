# ClaimSaathi – Agent Task Board

Owner: ClaimSaathi_Orchestrator. Status values: Ready, In progress, Blocked, Done.
Every task lists its inputs. Agents read only the named inputs unless the orchestrator adds more.

## 0. Roster and naming note

**Mismatch:** the brief refers to "10 specialist agents". The workspace has **9 specialist folders plus the orchestrator**. This board uses the 9 specialists below plus the orchestrator (10 roles in total). Confirm the count once; do not add roles silently.

Agent IDs are **proposed, to confirm**:

| ID | Role (proposed, to confirm) | Phase 3 state |
|---|---|---|
| 01 | Government_Scheme_Intelligence_Researcher | Active (Phase 3) |
| 02 | Speech_Voice_FreeAI_Researcher | Active (Phase 3) |
| 03 | Frontend_Architect | Active (Phase 3) |
| 04 | Frontend_Implementation_Engineer | Blocked |
| 05 | Neon_Database_Architect | Active (Phase 3) |
| 06 | AI_Integration_Conversational_Experience_Engineer | Blocked |
| 07 | Integration_Release_Engineer | Blocked |
| 08 | Hackathon_Strategist | Active (MVP/demo plan) |
| 09 | Security_Engineer | Blocked |
| – | ClaimSaathi_Orchestrator | Active (coordination) |

## 1. Task table

Phase 3 = 01, 02, 03, 05 in parallel; 08 prepares the MVP/demo plan. Blocked tasks wait for the approval gate: **architecture, contracts and research approved**.

| Task ID | Agent | Objective | Required inputs (named docs only) | Deliverables (paths) | Dependencies | Priority | Status | Acceptance criteria |
|---|---|---|---|---|---|---|---|---|
| T-00-A | Orchestrator | Keep root status current after each agent handoff | CURRENT_STATUS.md, completion reports | ClaimSaathi/CURRENT_STATUS.md | Completion reports from agents | P0 | In progress | Status table matches files that exist; no stale "Planned" entries for created docs |
| T-00-B | Orchestrator | Finish Phase 2b foundation docs | PROJECT_BRIEF.md, ARCHITECTURE.md, TECH_DECISIONS.md | ClaimSaathi/AGENT_TASK_BOARD.md, ClaimSaathi/CONTRIBUTING.md, ClaimSaathi/DESIGN_SYSTEM.md, ClaimSaathi/DATABASE_SCHEMA.md, ClaimSaathi/USER_FLOWS.md | None | P0 | In progress (board and contributing drafted; DESIGN_SYSTEM, DATABASE_SCHEMA, USER_FLOWS PENDING) | Each file exists, names match CURRENT_STATUS.md §2, no unverified fact stated as fact |
| T-00-C | Orchestrator | Obtain approval of pending decisions | CURRENT_STATUS.md §3.2 | ClaimSaathi/CURRENT_STATUS.md (decision log) | Owner decisions | P0 | Ready | Each §3.2 row is marked Approved or Rejected with date |
| T-00-D | Orchestrator | Issue the approval gate: architecture, contracts, research | ARCHITECTURE.md, TECH_DECISIONS.md, RESEARCH_STATUS.md | Gate note in CURRENT_STATUS.md | T-00-C, T-01-A, T-02-A, T-03-A, T-05-A | P0 | Blocked | Gate opened only after named docs are approved; unblocks 04, 06, 07, 09 |
| T-01-A | 01 | Review scheme research requirements and list missing evidence against RESEARCH_STATUS.md | PROJECT_BRIEF.md §3, §5; RESEARCH_STATUS.md; CURRENT_STATUS.md §6 | research/MISSING_EVIDENCE.md | None | P0 | Done – needs verification | Every gap in RESEARCH_STATUS.md §5 appears once; each item has an official source type and owner; nothing marked verified without a source |
| T-01-B | 01 | Verify AP scheme facts against G.O.s; verify central schemes against official portals | T-01-A output; approved MVP scheme list | research/ (source notes per scheme) | T-00-C (MVP scheme list approved) | P0 | Blocked | Each scheme fact has a primary-source link and retrieval date, or stays PENDING VERIFICATION |
| T-01-C | 01 | Draft scheme rule seed data (editable, no hardcoding) | T-01-B output; SCHEME_RULES format from 03/05 review | data/schemes/*.json | T-01-B, T-05-A | P1 | Blocked | Valid JSON; every rule cites a research source ID; no personal data in examples |
| T-02-A | 02 | Finalise speech recommendations (Telugu and English STT/TTS) | TECH_DECISIONS.md speech section; research/ dossier extracts | research/speech/RECOMMENDATION.md | None | P1 | Done – PENDING APPROVAL | Sources cited only from research files; every provider term and free-tier figure marked PENDING VERIFICATION until checked |
| T-02-B | 02 | Verify provider terms and free-tier figures | T-02-A output | research/speech/VERIFICATION.md | T-00-C (provider choice approved) | P1 | Blocked | Each figure has source URL and check date, or stays PENDING |
| T-03-A | 03 | Frontend architecture and page specs | ARCHITECTURE.md; DESIGN_SYSTEM.md (PENDING Phase 2b) | design/FRONTEND_ARCHITECTURE.md; design/PAGE_SPECS.md | DESIGN_SYSTEM.md (T-00-B) | P0 | Done – PENDING APPROVAL | Every page in PROJECT_BRIEF.md §5 has a spec; Telugu/English toggle and "likely eligible" wording stated; no Aadhaar field in any form |
| T-03-B | 03 | Component contracts for eligibility result card (rule shown, documents, deadline) | T-03-A; SCHEME_RULES format | design/COMPONENT_SPECS.md | T-03-A | P1 | Done – PENDING APPROVAL | Card shows the rule behind each match; spec reviewed by 09 before 04 starts |
| T-05-A | 05 | Review DATABASE_SCHEMA.md and RLS design | DATABASE_SCHEMA.md (PENDING Phase 2b); ARCHITECTURE.md; guardrails in PROJECT_BRIEF.md §8 | database/REVIEW_NOTES.md | T-00-B | P0 | Done – PENDING APPROVAL | Review confirms no Aadhaar or sensitive-ID column; RLS covers citizen and admin roles; scheme rules are data tables, not code |
| T-05-B | 05 | Migrations and seed files | T-05-A approved; T-01-C seed format | database/migrations/*.sql; database/seeds/*.sql | T-05-A, T-01-C | P1 | Blocked | Migrations apply on a clean Neon branch (verification by 07 or 09); seeds contain public scheme data only |
| T-04-A | 04 | Scaffold React + Vite + TypeScript app shell | ARCHITECTURE.md; design/PAGE_SPECS.md; contracts | src/ | Approval gate (T-00-D); T-03-A | P1 | Done | Production Vite + React + TS bundle verified with 0 errors; full citizen onboarding, rule matching & admin UI implemented |
| T-06-A | 06 | Claude Haiku server-side integration contract and prompts | ARCHITECTURE.md; TECH_DECISIONS.md; scheme rule format | serverless/ai/*; prompts/* | Approval gate (T-00-D); T-01-C | P1 | Blocked | Awaiting approval of architecture, contracts and research. No API key in client code |
| T-07-A | 07 | Vercel config, non-AI serverless functions, CI checks | ARCHITECTURE.md; hosting approval (CURRENT_STATUS §3.2) | scripts/*; serverless/* (non-ai); vercel.json; CI config | Approval gate (T-00-D); hosting account approval | P1 | Blocked | Awaiting approval of architecture, contracts and research |
| T-09-A | 09 | Security and privacy review; test plan for sample profiles | ARCHITECTURE.md; DATABASE_SCHEMA.md; PROJECT_BRIEF.md §8; SECURITY_AND_PRIVACY.md (PENDING, planned not created) | tests/*; reports/SECURITY_REVIEW.md | Approval gate (T-00-D); T-05-A | P0 | Not started – inactive | Awaiting approval of architecture, contracts and research. No real Aadhaar in fixtures |
| T-08-A | 08 | Concise MVP prioritisation and demo plan | PROJECT_BRIEF.md §6, §9; CURRENT_STATUS.md §3.2 (MVP scheme list pending) | presentation/MVP_DEMO_PLAN.md | None | P1 | Done – PENDING APPROVAL | Lists must-have, should-have and later items; demo uses sample profiles only; scheme facts marked PENDING VERIFICATION |

Eligibility engine owner still undecided (see orchestrator decision).

## 2. Ownership matrix

| Path | Owner | Notes |
|---|---|---|
| ClaimSaathi/*.md (root) | Orchestrator | All root docs, including this board and CONTRIBUTING.md |
| research/ (except research/speech/) | 01 | Scheme evidence and source notes |
| research/speech/ | 02 | Speech and voice research |
| data/ | 01 | Scheme data, JSON seeds |
| design/ | 03 | Spec docs only |
| src/ | 04 | Application code |
| database/ | 05 | Migrations, RLS policies, seeds |
| serverless/ai/, prompts/ | 06 | Claude integration |
| scripts/, serverless/ (non-ai), Vercel/CI config | 07 | Release and deploy |
| presentation/ | 08 | Pitch and demo material |
| tests/, reports/ | 09 | Tests and security reports |

Rule: one owner per file. No two agents write the same file.

## 3. Orchestrator tasks (summary)

- T-00-A to T-00-D above.
- Accept or reject completion reports; update CURRENT_STATUS.md.
- Approve contract changes. Agents may propose; only the orchestrator merges a contract change into root docs.
- Open the approval gate and release Blocked tasks.

## 4. Rules to avoid duplicate work

1. Check this board and the ownership matrix before starting any task.
2. Claim a task by setting its Status to In progress in this file (orchestrator edits it on your behalf if needed).
3. Never edit a file owned by another agent. Request a change through the orchestrator.
4. No two agents edit the same file at the same time.
5. Read only the named inputs. Re-research only if a named input is missing, and record that as a gap.
6. Items marked PENDING VERIFICATION are not facts. Do not build on them as settled.
7. Handoffs go through the task board: update Status, and link the deliverable path.
8. Every completion report lists files changed and verification evidence (see CONTRIBUTING.md).

## 5. Open items

- Agent count mismatch (10 in brief vs 9 specialists + orchestrator): confirm once.
- Agent IDs and role names: proposed, to confirm.
- DESIGN_SYSTEM.md, DATABASE_SCHEMA.md, USER_FLOWS.md: Phase 2b, not yet created (PENDING).
- SECURITY_AND_PRIVACY.md and MVP_PLAN.md: planned, not created (PENDING).
- Product name (ClaimSaathi vs Sahaya), speech provider, hosting approval, admin auth: PENDING APPROVAL (CURRENT_STATUS §3.2).
