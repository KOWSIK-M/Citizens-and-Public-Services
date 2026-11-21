# ClaimSaathi – User Flows

**Status: PROPOSED – NOT APPROVED.** Flows are proposed for review by the orchestrator and agent 03 (UX/design). Steps, copy and decision points are not final. Voice flows depend on a speech provider that is PENDING APPROVAL.

Related: PROJECT_BRIEF.md §5–7 (features, journeys), ARCHITECTURE.md §9 (data flow), DATABASE_SCHEMA.md (entities).

Guardrails that apply to every flow: say "likely eligible", never "guaranteed" or "approved"; never ask for Aadhaar or any ID number; show the official source and last-verified date on every scheme; sample profiles only in tests.

## Flow 1 – Citizen onboarding (plain language or voice)

1. Citizen lands on the home page and reads the disclaimer summary ("likely eligible" notice).
2. Citizen chooses language: English or Telugu (toggle always visible).
3. Citizen chooses input mode:
   - **Type** a description (free text, max length PROPOSED, e.g. 500 characters); or
   - **Speak** (only if speech is approved; otherwise hidden). *Decision point: speech unavailable → show typing only, with a notice.*
4. System checks the text for ID-like numbers (e.g. 12-digit strings). *Decision point: ID-like pattern found → block submission, explain in plain words "Please do not type ID numbers such as Aadhaar. Describe your situation instead", clear the field.*
5. System sends text to the extraction function; a loading state appears with plain text ("Understanding your details…").
6. System shows a **proposed profile** as editable chips/fields (age band, state/district, income band, occupation, social category, land holding band, household members).
7. **Optional clarifying questions:** if key fields are missing, system asks at most 3 short questions, one per screen, each with a "Skip" option. *Decision point: citizen skips → field stays "unknown" and the assessment marks dependent rules as missing info.*
8. Citizen confirms the profile. Only the confirmed profile is used for matching.
9. Citizen proceeds to Flow 2.

**Error and empty states**
- Extraction fails (provider error or timeout): show "We could not understand this right now. You can fill the details yourself" and open the manual profile form with bands.
- Empty input: disable submit; show example sentences in both languages.
- Extraction returns nothing usable: open the manual form with all fields "unknown".

## Flow 2 – Scheme discovery

1. System runs eligibility assessment (Flow 3) against all published schemes.
2. Results list shows schemes grouped as **Likely eligible**, **Need more information**, and **Not likely eligible** (the last group is collapsed by default).
3. Each card shows: scheme name (EN/TE), level (central or state), category, status (open / closed / not yet open), and last-verified date.
4. Citizen opens a scheme for detail (description, rules, official link, documents, steps).

**Empty and edge states**
- No schemes published yet: "No schemes are available to check right now" plus link to About page.
- No likely-eligible matches: explain that matches depend on details; offer to edit the profile and browse all schemes.
- Scheme closed or not yet open: see Edge cases.

## Flow 3 – Eligibility assessment

1. Citizen confirms profile; system runs the deterministic rule engine on stored rules.
2. For each scheme, system records each rule as matched, not matched, or missing info.
3. Result card for a scheme shows:
   - result label: "Likely eligible" (never "guaranteed");
   - **the matched rule(s)** in plain language (`reason_en` / `reason_te`), e.g. "Your annual income band is within the limit set for this scheme";
   - **missing information**: fields the rule needs but the profile lacks, each with an "Add this detail" action that returns to Flow 1 step 6.
4. Explanation text may be rewritten by the model for readability; the rule text and result come from the engine.
5. Footer on every result: disclaimer ("This is not an official decision. Confirm with the department.") and source link with "last verified on [date]" or "PENDING VERIFICATION".

**Decision points**
- Rule needs a field the citizen skipped → result becomes "Need more information", not "Not likely eligible".
- Two rules conflict (e.g. two income bands) → see Edge cases.

**Error states**
- Matching service fails: keep profile, show retry button and "Try again" message.
- Scheme has no verified rules yet: show "Rules pending verification" and do not show a likely-eligible result.

## Flow 4 – Document checklist

1. Citizen opens a scheme from results and selects **Documents**.
2. System lists documents from `scheme_documents`, split into **Mandatory** and **Optional** sections.
3. Each item shows bilingual name, short note, and a checkbox the citizen can tick locally (not stored in MVP).
4. Citizen can print or share the checklist as text (PROPOSED).

**Decision points**
- Scheme has no document list yet → show "Document list pending verification" with the official link.
- Document requirement differs by district or year → show note and link; do not guess.

**Empty state**
- Checklist empty after filtering: show "No documents listed for this scheme yet. Check the official page."

## Flow 5 – Application guidance

1. Citizen opens **How to apply** for a scheme.
2. System shows numbered steps from `scheme_steps` (bilingual), each with an optional official link.
3. Footer shows the official source link, publisher, and **last-verified date**.
4. Citizen can mark "I have started" → starts tracking (Flow 6, future).

**Decision points**
- Scheme is online-only → show portal link prominently; offline option only if sourced.
- Scheme is offline-only (office or CSC) → show office steps; no portal link is invented.

**Error and empty states**
- No steps recorded: "Application steps are being verified. Please use the official link."
- Official link unreachable from the app: show the URL as text so the citizen can copy it.

## Flow 6 – Application tracking and deadline reminders (future)

1. Citizen (signed in) opens **My schemes** and adds a scheme from results.
2. Citizen sets status: not started, in progress, submitted, or closed.
3. Citizen optionally sets a reminder date; deadline comes from the scheme record or citizen entry.
4. Reminder delivery channel PENDING APPROVAL (in-app first; SMS/email not decided).
5. On or before the reminder date, citizen sees the reminder on return; no reminder is sent to any ID or contact not approved.

**Decision points**
- Deadline unknown → reminder can be set by the citizen only; app shows "Deadline not published".
- Deadline changed by admin → citizen sees "Deadline updated" banner.

**Empty state**
- No tracked applications: "You have not added any schemes yet" with a link to results.

## Flow 7 – Admin scheme management

1. Admin signs in (method PENDING APPROVAL) and opens the admin area. Non-admins are redirected to a "not authorised" page.
2. **Add or edit a scheme:** name (EN/TE), level, category, status, application dates.
3. **Add or edit a rule:** choose field, rule type, operator, value, plain-language reason (EN/TE), and source.
4. **Source verification:** enter official URL, publisher, document type (G.O., portal, news), retrieved date, verified date, verifier reference.
5. **Versioning:** each save creates a draft version; the previous published version remains live until publish.
6. **Preview:** admin runs the engine on sample profiles only and checks reasons.
7. **Publish:** requires a source on every rule and a verified date; otherwise publish is blocked with a list of missing items.
8. Publish writes an audit log entry; the change appears on scheme detail with the new last-verified date.

**Decision points**
- Source older than the review interval (PENDING: interval) → show "stale source" warning; publish still allowed with a note, or blocked (decision PENDING APPROVAL).
- Admin edits a published rule → creates a new draft version, not an in-place change.

**Error states**
- Validation fails (missing field, bad operator): inline error, nothing saved.
- Save fails: keep draft in form, show retry.

**Empty state**
- No schemes yet: "Add your first scheme" with a short checklist of required fields.

## Edge cases

| Case | Expected behaviour |
|---|---|
| **Conflicting input** (e.g. "I am a farmer" and "I am a daily-wage worker") | Show both values, ask citizen to pick one or mark "both"; do not silently choose. |
| **Missing info** | Result shows "Need more information" with the exact field list; never "Not likely eligible" just because a field is missing. |
| **Scheme closed** | Show "Applications closed on [date]" with status label; keep in results under a closed filter; do not hide it. |
| **Scheme not yet launched** | Show "Not yet open – expected [date if sourced]"; no apply steps are active. |
| **Stale source** (verified date older than the review interval) | Show "Last verified on [date] – please check the official page"; admin is notified in the admin area. |
| **Unsupported language** (e.g. Hindi or other input) | Accept if the model can handle it and show the bilingual notice; otherwise say "We currently support English and Telugu" and offer the typing form. |
| **ID-like number typed** | Block and clear the field (Flow 1 step 4). Nothing is stored or logged. |
| **Duplicate or sample profile in production** | Sample profiles are never shown as real; sample banner shown on any test profile. |
| **Speech unavailable** | Hide voice input; typing remains. |
| **Rule data missing for a scheme** | Scheme shows "Rules pending verification" and is excluded from likely-eligible results. |

## Open questions

1. Is the clarifying-question limit of 3 acceptable for the demo?
2. Is anonymous (no sign-in) use allowed for onboarding and results?
3. Should results be shareable as a link or only as text?
4. What is the stale-source review interval? (PENDING APPROVAL)
5. Can admin publish with a stale source, or is it blocked?
