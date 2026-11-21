# Contributing to ClaimSaathi

Read first: PROJECT_BRIEF.md (guardrails, §8), ARCHITECTURE.md, TECH_DECISIONS.md, AGENT_TASK_BOARD.md.

## 1. Git branching

- `main` is protected. No direct pushes.
- Work on feature branches: `feat/<agent-id>-<topic>` (example: `feat/01-talliki-vandanam-rule`).
- Use `fix/`, `docs/`, `chore/` prefixes for non-feature work, with the same `<agent-id>` segment.
- All changes reach `main` through a Pull Request (PR) into `main`.
- Delete feature branches after merge.

## 2. File ownership

Ownership is defined in the matrix in AGENT_TASK_BOARD.md §2. Summary:

| Path | Owner |
|---|---|
| ClaimSaathi/*.md (root) | Orchestrator |
| research/ (except research/speech/), data/ | 01 |
| research/speech/ | 02 |
| design/ | 03 |
| src/ | 04 |
| database/ | 05 |
| serverless/ai/, prompts/ | 06 |
| scripts/, serverless/ (non-ai), Vercel/CI config | 07 |
| presentation/ | 08 |
| tests/, reports/ | 09 |

- Only the owner edits a file. Others request changes through the task board.
- Shared contracts (API shapes, scheme rule format, DB schema) change only through the orchestrator.

## 3. Coding conventions

- TypeScript in `strict` mode. No `any` without a comment explaining why.
- Styling: Tailwind CSS utility classes. Use shadcn/ui components before writing custom ones.
- No secrets in client code. The Claude API key and database credentials live only in server-side environment variables. Client code never calls Claude or Neon directly.
- Scheme rules are data. Store them as JSON or SQL seed files (in `data/` and `database/seeds/`), not hardcoded in React components or serverless handlers.
- User-facing text: Telugu and English. Use "likely eligible", never "guaranteed" or "you will get".
- Do not collect Aadhaar or other sensitive IDs in any form field, log, or fixture.
- Keep the stack fixed: React + Vite + TypeScript, Tailwind + shadcn/ui, Neon PostgreSQL, Vercel, protected serverless functions. No Spring Boot. No Express.

## 4. Commit conventions

Use Conventional Commits: `type(scope): short imperative summary`.

| Type | Use for |
|---|---|
| feat | New user-visible behaviour or data |
| fix | Bug fix |
| docs | Documentation only |
| test | Tests and fixtures only |
| refactor | Code change with no behaviour change |
| chore | Tooling, config, dependencies |

Examples:
- `feat(scheme): add talliki vandanam rule`
- `docs(research): list missing evidence for AP schemes`
- `test(eligibility): add edge case for income at threshold`

Rules: one logical change per commit; subject line 72 characters or fewer; body explains why when non-obvious.

## 5. Pull request process

1. One owner per PR. The PR author is the owning agent.
2. Branch name follows section 1. PR title follows Conventional Commits.
3. Before requesting review, all checks must pass: TypeScript build, lint, tests, and the accessibility check in section 6 (once CI exists, owned by 07).
4. Reviewer: the ClaimSaathi_Orchestrator or the Integration_Release_Engineer (07).
5. PR description lists: files changed, verification evidence, open PENDING VERIFICATION items.
6. Reviewer checks guardrails before approving: "likely eligible" wording, no Aadhaar, no secrets, scheme data as data.
7. Merge only after approval. Squash or rebase per team choice (to confirm).

## 6. Testing requirements

- **Sample profiles only.** All test fixtures use invented profiles. Never copy real citizen data into tests.
- **No real Aadhaar** in any fixture, snapshot, seed, log sample, or screenshot. A test fixture containing a 12-digit number that looks like an Aadhaar is a defect.
- **Eligibility edge cases** must be covered: boundary values for income, age, and category; missing optional fields; a profile that matches no scheme; a profile that matches several schemes with conflicting documents.
- **Accessibility checks:** keyboard navigation, visible focus, labels on all inputs, sufficient colour contrast, Telugu and English text rendering, screen-reader labels on icon buttons.
- **Wording check:** outputs must say "likely eligible" and show the rule behind each match.
- Test owner: 09 (tests/ and reports/). Test results are recorded in reports/.
- Tests that depend on external services (Claude, speech, Neon) must use mocks or be marked PENDING VERIFICATION.

## 7. Agent collaboration rules

1. **Handoffs go through the task board.** Update the task's Status and link the deliverable path in AGENT_TASK_BOARD.md (orchestrator applies the edit).
2. **No simultaneous edits to one file.** Check the ownership matrix before writing.
3. **Contract changes go through the orchestrator.** API shapes, rule format, and schema changes are proposed in a note, approved, then merged into the root docs.
4. **Completion report required.** Every task ends with a report that lists:
   - Task ID and agent ID
   - Files changed (full paths)
   - Verification evidence (lint output, test run output, or the source check performed)
   - Items still PENDING VERIFICATION
5. **Unverified facts stay marked.** Scheme facts, pricing, free-tier limits, and provider terms are PENDING VERIFICATION until checked against a named source with a date.
6. **Do not duplicate research.** Read the named inputs first. If a fact is missing, log it as a gap in research/MISSING_EVIDENCE.md (owner 01).

## 8. Definition of done

- Files are in the owner's folder and listed in the completion report.
- Checks pass (see section 5).
- Guardrails hold (section 3 and PROJECT_BRIEF.md §8).
- Status on AGENT_TASK_BOARD.md is updated.
- Open items are listed, not hidden.

## 9. Open items

- Branch merge style (squash vs rebase): PENDING APPROVAL.
- CI tooling and check commands: PENDING (owner 07, after approval gate).
- Agent IDs: proposed, to confirm.
