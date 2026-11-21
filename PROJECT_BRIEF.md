# ClaimSaathi – Project Brief

Status: Foundation document (draft). Implementation NOT started.
Product name: **ClaimSaathi**. A research dossier proposes "Sahaya" as an alternative name. This is a **PENDING APPROVAL** naming decision; the product is not renamed.

## 1. Problem statement and hackathon objective

- Source: `Problem_Statement.txt`, Problem Statement 5 "Claim What's Yours", Citizens and Public Services.
- Context: India has hundreds of central and state welfare schemes (scholarships, pensions, health cover, housing, farm benefits).
- Many eligible families never claim them. Information is scattered, eligibility rules are hard to read, document lists are unclear, and people depend on middlemen.
- **Objective:** build a citizen-facing web app where a person describes their situation in plain language and receives:
  - which schemes they are likely to qualify for, and **why** (which rule);
  - which documents they need;
  - how to apply and how to follow up.

## 2. Product vision

ClaimSaathi is a plain-language welfare navigator. The user talks or types about their life ("I am a widow, I have a small farm, my son is in Class 10"), not a long form. The system:

1. extracts a structured profile from that description (with the user confirming it);
2. matches the profile against editable scheme rules;
3. explains each match with the rule that triggered it;
4. produces a personal document checklist and step-by-step application guide;
5. tracks applications and sends deadline reminders.

Every scheme shows its official source link and a "last verified" date.

## 3. Target users and geography

| Target user | Typical schemes of interest (examples only, to be verified) |
|---|---|
| Low-income students | Post-matric scholarship schemes |
| Senior citizens | State and central old-age pensions |
| Small farmers | Farm income-support schemes, crop insurance |
| Women entrepreneurs | Enterprise and credit schemes |
| Daily-wage worker families | Rural employment, housing, health cover |

- **Geography:** Andhra Pradesh (state schemes) plus central schemes applicable to AP residents.
- Scheme list for MVP: PENDING VERIFICATION (see RESEARCH_STATUS.md).

## 4. Problems being solved

- Discovery: users do not know which schemes exist.
- Eligibility: rules are written in legal/government language.
- Documents: required document lists are unclear or change by scheme.
- Process: application steps and follow-up are not explained in one place.
- Dependence: people pay middlemen for information that is public.
- Language: most portals are English-first; regional-language voice input is a goal "if possible".

## 5. Website feature list

### 5.1 Citizen

| Feature | Description | MVP? |
|---|---|---|
| Plain-language input | Free-text description, short guided prompts, no long form | MVP |
| Voice input | Speech-to-text in regional language (provider TBD) | Stretch (MVP if provider approved) |
| Eligibility results | Likely-eligible schemes with per-rule reasoning | MVP |
| Document checklist | Personalised list per matched scheme | MVP |
| Application guide | Step-by-step instructions per scheme | MVP |
| Deadline reminders | Reminders for scheme deadlines the user selected | Future (MVP if time allows) |
| Application tracking | User records status of their own applications | Future |
| Scheme detail page | Description, rules, official source link, last-verified date | MVP |
| Voice output | Text-to-speech of results (provider TBD) | Future |

### 5.2 Admin

| Feature | Description | MVP? |
|---|---|---|
| Scheme management | Create/edit scheme records | MVP |
| Rule management | Edit eligibility rules as data (no code change) | MVP |
| Source verification | Record official source URL, verifier, verified date | MVP |
| Admin authentication | Restricted access to admin area | MVP |

### 5.3 Public

| Page | Purpose | MVP? |
|---|---|---|
| Landing | Explain purpose, start button | MVP |
| About | Project background and data sources | MVP |
| Disclaimer | "Likely eligible" notice; not an official decision; no guarantee | MVP |

## 6. MVP vs future features

**MVP (must ship for demo):**
- Plain-language input (typed) and profile confirmation
- Eligibility matching with per-rule reasoning, using sample profiles only
- Document checklist and application guide per matched scheme
- Scheme detail with official source link and last-verified date (or "PENDING VERIFICATION" where not yet checked)
- Admin scheme and rule editing
- Public landing, about, and disclaimer pages

**Future (not in MVP):**
- Voice input and voice output (only after provider approval)
- Regional-language support beyond the chosen provider's capability
- Deadline reminders and application tracking
- Real-user data handling and consent flows
- Integrations with government APIs (none confirmed; no public eligibility-rules API found in research)

## 7. Expected user journeys

Short summaries only. Full detail belongs in USER_FLOWS.md (planned, not yet created).

1. **First-time citizen:** lands on home, describes situation in plain language, confirms extracted profile, sees likely-eligible schemes with reasons.
2. **Document prep:** opens a scheme, gets document checklist and application steps.
3. **Admin update:** logs in, edits a scheme rule or source date, saves; change is visible on scheme detail.
4. **Return user (future):** views tracked applications and upcoming deadlines.

## 8. Guardrails

- Say "likely eligible", never "guaranteed" or "approved".
- Do NOT collect Aadhaar numbers or other sensitive ID numbers.
- Public scheme information only; no private citizen records are fetched.
- Scheme rules are stored as editable data, not hard-coded.
- Test only with sample (synthetic) profiles.

## 9. Success criteria and demo objectives

- A sample profile typed in plain language produces at least one likely-eligible scheme with a visible reason per rule.
- Each result shows an official source link and a last-verified date, or an explicit PENDING VERIFICATION marker.
- Document checklist and application steps appear for each matched scheme.
- No Aadhaar or sensitive ID field exists anywhere in the UI or database.
- Admin can change a rule and see the result change without a code deploy.
- Demo runs end-to-end on hosted (Vercel) build with sample profiles only.

Success thresholds (accuracy, user counts, latency): PENDING VERIFICATION – to be set after scope is approved.

## 10. Source documents

- `Problem_Statement.txt` (problem statement)
- Research dossiers: see RESEARCH_STATUS.md
- Technical decisions: see TECH_DECISIONS.md
- Architecture: see ARCHITECTURE.md
- Current state: see CURRENT_STATUS.md
