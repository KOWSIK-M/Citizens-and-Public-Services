# Page Specifications

Owner: Agent 03
Status: PENDING

Sources: ARCHITECTURE.md (§4 frontend routes, §5 functions, §10 security), USER_FLOWS.md (Flows 1–7, edge cases), DESIGN_SYSTEM.md (components, accessibility, language).

Global rules:
- Data comes only from `/api/*` serverless endpoints; the SPA never holds secrets (ARCHITECTURE.md §1, §4).
- Colours and fonts are PROPOSED, not verified (DESIGN_SYSTEM.md §2–3).
- Every page is bilingual (English and Telugu) with the language toggle always visible (DESIGN_SYSTEM.md §8).
- Every result and scheme page shows the source link and "last verified on [date]" or "PENDING VERIFICATION" (USER_FLOWS.md Flow 2–5).
- Language: "likely eligible" only, never "guaranteed" or "approved" (USER_FLOWS.md guardrails).

## Route map

Route paths are not named in the source documents. The names below come from ARCHITECTURE.md §4 and USER_FLOWS.md; the path column stays PENDING until agreed.

| Route (name) | Path | Purpose | Access |
|---|---|---|---|
| Home (landing) | PENDING | Explain the service, show the "likely eligible" notice, start onboarding | Public |
| About | PENDING | About the service; empty-state link target | Public |
| Disclaimer | PENDING | Disclaimer text (wording PENDING APPROVAL) | Public |
| Describe | PENDING | Plain-language input (type; speak only if approved) | Citizen (anonymous use PENDING, see Open decisions) |
| Confirm profile | PENDING | Review and edit the proposed profile; optional clarifying questions | Citizen |
| Results | PENDING | Grouped eligibility results | Citizen |
| Scheme detail | PENDING | Description, rules, official link, documents, steps | Citizen |
| Checklist (Documents) | PENDING | Mandatory and optional document list | Citizen |
| Guide (How to apply) | PENDING | Numbered application steps | Citizen |
| My schemes | PENDING | Tracked applications and reminders (future, signed in) | Citizen (signed in; future) |
| Admin area | PENDING | Scheme, rule and source management | Admin (auth method PENDING) |
| Not authorised | PENDING | Shown to non-admins who open admin routes | Public |

## Per-page specs

Each section lists: purpose; inputs; states (empty, loading, error); shadcn/ui components (PROPOSED set, DESIGN_SYSTEM.md §6); accessibility notes.

### Home (landing)
- Purpose: explain the service and the "likely eligible" notice; start onboarding.
- Inputs: language toggle; "start" action.
- States: empty n/a. Loading: none beyond static content. Error: n/a (static).
- Components: Button, Card, Badge, DisclaimerBanner, LanguageToggle.
- Accessibility: one primary action; heading order; `lang` set per language block.

### About
- Purpose: describe the service, sources and limits.
- Inputs: none.
- States: empty n/a. Loading: Skeleton if content is fetched. Error: Alert with retry.
- Components: Card, Accordion, Breadcrumb.
- Accessibility: headings in order; links have descriptive text.

### Disclaimer
- Purpose: show the disclaimer text. Wording is PENDING APPROVAL (DESIGN_SYSTEM.md §9).
- Inputs: none.
- States: error: show fallback text with a retry.
- Components: Alert, Card.
- Accessibility: plain-language text, no colour-only meaning.

### Describe
- Purpose: citizen describes their situation in plain language.
- Inputs: free text (max length PROPOSED, e.g. 500 characters); speech input only if approved.
- States: empty: submit disabled, examples shown in both languages. Loading: "Understanding your details…" (Skeleton, aria-live polite). Error: "We could not understand this right now. You can fill the details yourself" with a link to the manual form. ID-like number found: block, clear field, show danger message.
- Components: Textarea, Label, Button, Alert, Toast.
- Accessibility: visible label (not placeholder only); error linked with `aria-describedby`; character count as text.

### Confirm profile
- Purpose: citizen confirms or edits the proposed profile before matching.
- Inputs: age band, state/district, income band, occupation, social category, land holding band, household members (all editable; missing values show "unknown").
- States: empty: manual form with all fields "unknown". Loading: Skeleton. Error: keep the profile and show retry.
- Components: ProfileConfirmForm, Select, RadioGroup, Input, Badge, Button.
- Accessibility: each field labelled; clarifying questions one per screen with a Skip option (max 3 proposed, USER_FLOWS.md Flow 1 step 7).

### Results
- Purpose: show schemes grouped as Likely eligible, Need more information, Not likely eligible (last group collapsed).
- Inputs: confirmed profile (sent to `/api/eligibility/match`).
- States: empty: "No schemes are available to check right now" with About link; no matches: explain that matches depend on details. Loading: Skeleton cards. Error: "Try again" with retry.
- Components: SchemeResultCard, RuleReasonCard, MissingInfoList, VerificationBadge, SourceFooter, Accordion, Badge.
- Accessibility: result counts in aria-live polite region; status shown as icon plus text; the group is a heading.

### Scheme detail
- Purpose: show one scheme's description, rules, official link, documents and steps.
- Inputs: scheme identifier from Results.
- States: rules missing: "Rules pending verification" (no likely-eligible result). Closed: "Applications closed on [date]". Not yet open: "Not yet open – expected [date if sourced]". Error: retry.
- Components: Card, Badge, SourceFooter, VerificationBadge, Tabs, Button.
- Accessibility: status uses icon and text; source link opens clearly labelled.

### Checklist (Documents)
- Purpose: list documents from `scheme_documents`, split Mandatory and Optional.
- Inputs: local tick boxes (not stored in MVP).
- States: no list: "Document list pending verification" with official link. Empty after filter: "No documents listed for this scheme yet. Check the official page." Loading: Skeleton. Error: retry.
- Components: DocumentChecklist, Checkbox, Label, Accordion, Button (print/share PROPOSED).
- Accessibility: checkboxes at 44 × 44px minimum; each has a label.

### Guide (How to apply)
- Purpose: numbered application steps from `scheme_steps`.
- Inputs: none beyond scheme identifier.
- States: no steps: "Application steps are being verified. Please use the official link." Unreachable link: show URL as copyable text. Loading: Skeleton. Error: retry.
- Components: ApplicationStepList, SourceFooter, Button.
- Accessibility: ordered list semantics; links show full URL as text where needed.

### My schemes (future)
- Purpose: tracked applications, status and reminder dates (USER_FLOWS.md Flow 6).
- Inputs: status (not started, in progress, submitted, closed); reminder date.
- States: empty: "You have not added any schemes yet" with link to Results. Deadline unknown: "Deadline not published". Loading: Skeleton. Error: retry.
- Components: Card, Select, Badge, Toast, Alert.
- Accessibility: status in text; reminder channel PENDING APPROVAL.

### Admin area
- Purpose: add or edit schemes, rules and sources; preview on sample profiles; publish.
- Inputs: scheme fields (name EN/TE, level, category, status, dates); rule fields (field, type, operator, value, reason EN/TE, source); source fields (URL, publisher, document type, retrieved and verified dates, verifier reference).
- States: empty: "Add your first scheme" with required-fields checklist. Validation error: inline, nothing saved. Save failure: keep draft and show retry. Stale source: warning (interval PENDING).
- Components: Tabs, Input, Select, Textarea, Dialog, Alert, Toast, Button.
- Accessibility: Dialog traps focus and returns focus on close; inline errors linked to fields.

### Not authorised
- Purpose: tell non-admins they cannot open the admin area (USER_FLOWS.md Flow 7 step 1).
- Inputs: none.
- States: n/a (static).
- Components: Alert, Button (link back to Home).
- Accessibility: clear heading; plain-language message.

## UI flow

1. Citizen lands on Home and reads the "likely eligible" notice.
2. Citizen chooses language (English or Telugu). Decision: speech approved? If not, hide voice and show a typing notice.
3. Citizen types a description on Describe.
4. Decision: ID-like number found? If yes, block submit, clear the field and explain. If no, continue.
5. Loading state, then the proposed profile appears on Confirm profile.
6. Decision: key fields missing? If yes, ask up to 3 clarifying questions (each skippable). If no, skip to step 7.
7. Citizen confirms or edits the profile. Only the confirmed profile is used.
8. Results load. Decision: rules missing for a scheme? Show "Rules pending verification" and exclude it from likely-eligible.
9. Citizen opens a scheme detail.
10. Citizen opens Checklist (Documents) or Guide (How to apply). Decision: online-only or offline-only scheme? Show the portal link or office steps; never invent a link.
11. Decision: "Add this detail" on missing information? If yes, return to step 5 for that field.
12. Later: My schemes (future, signed in).

## Open decisions

Items the three source documents leave open:

| Decision | Source |
|---|---|
| Speech STT/TTS provider (none approved) | ARCHITECTURE.md §7, §12; USER_FLOWS.md Flow 1 |
| Rate-limit mechanism | ARCHITECTURE.md §5, §10, §12 |
| Admin authentication method | ARCHITECTURE.md §10; USER_FLOWS.md Flow 7 |
| Whether anonymous use is allowed for onboarding and results | USER_FLOWS.md Open question 2 |
| Whether results are shareable as a link or text only | USER_FLOWS.md Open question 3 |
| Stale-source review interval | USER_FLOWS.md Open question 4; Flow 7 |
| Whether admin can publish with a stale source | USER_FLOWS.md Open question 5 |
| Clarifying-question limit of 3 for the demo | USER_FLOWS.md Open question 1 |
| Maximum description length (e.g. 500 characters) | USER_FLOWS.md Flow 1 step 3 (PROPOSED) |
| Retention of description text | ARCHITECTURE.md §9.2 |
| Reminder delivery channel (SMS/email not decided) | USER_FLOWS.md Flow 6 |
| Standard disclaimer text | DESIGN_SYSTEM.md §9 |
| Colour palette and contrast checks (not verified) | DESIGN_SYSTEM.md §2, §10 |
| Font families, licences and loading method | DESIGN_SYSTEM.md §3, §10 |
| Icon set and licence | DESIGN_SYSTEM.md §6, §10 |
| Locale file location for UI strings | DESIGN_SYSTEM.md §8 |
| Telugu date format and month names | DESIGN_SYSTEM.md §8 |
| Route paths (only route names are given) | ARCHITECTURE.md §4 |
| Claude model identifier and pricing | ARCHITECTURE.md §6, §12 |
| RLS design for user-owned data | ARCHITECTURE.md §10, §12 |
| Accessibility test tool and manual test plan | DESIGN_SYSTEM.md §7, §10 |
| Print or share of the checklist | USER_FLOWS.md Flow 4 (PROPOSED) |
