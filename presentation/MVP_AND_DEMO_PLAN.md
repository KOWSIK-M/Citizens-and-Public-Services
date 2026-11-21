# ClaimSaathi – MVP and Demo Plan

Owner: Agent 08 (Hackathon_Strategist)
Status: PENDING APPROVAL

Source: `ClaimSaathi/PROJECT_BRIEF.md` (sections 5, 6, 8, 9). Items the brief does not decide are marked PENDING APPROVAL. No scheme rule, threshold, deadline, document list or URL is invented here.

## 1. MVP scope

| Tier | Feature | Brief reference | Status |
|---|---|---|---|
| MUST | Plain-language typed input and profile confirmation | 5.1, 6 | MVP |
| MUST | Eligibility matching with per-rule reasoning (sample profiles only) | 5.1, 6 | MVP |
| MUST | Document checklist per matched scheme | 5.1, 6 | MVP |
| MUST | Application guide per matched scheme | 5.1, 6 | MVP |
| MUST | Scheme detail: official source link and last-verified date (or PENDING VERIFICATION) | 5.1, 6 | MVP |
| MUST | Admin: scheme and rule editing as data | 5.2, 6 | MVP |
| MUST | Admin authentication (restricted admin area) | 5.2 | MVP |
| MUST | Admin source verification record (URL, verifier, date) | 5.2 | MVP |
| MUST | Public landing, about and disclaimer pages | 5.3, 6 | MVP |
| SHOULD | Guided prompts (short questions, not a long form) | 5.1 | PENDING APPROVAL (brief says "short guided prompts" but does not mark MVP scope) |
| SHOULD | Voice input (speech-to-text) | 5.1, 6 | PENDING APPROVAL: brief says MVP only if provider approved |
| LATER | Voice output (text-to-speech) | 5.1, 6 | Future |
| LATER | Regional-language support beyond provider capability | 6 | Future |
| LATER | Deadline reminders | 5.1, 6 | Future (MVP only if time allows: PENDING APPROVAL) |
| LATER | Application tracking | 5.1, 6 | Future |
| LATER | Real-user data handling and consent flows | 6 | Future |
| LATER | Government API integrations | 6 | Future (none confirmed) |

Other open decisions (PENDING APPROVAL): product name (ClaimSaathi vs "Sahaya"); final scheme list for MVP; success thresholds (accuracy, users, latency), which the brief marks PENDING VERIFICATION.

## 2. Synthetic demo scenarios

All three profiles are **SYNTHETIC** (invented for demo; not real people). No Aadhaar or ID number is used or shown.

Rule note for all scenarios: the eligibility rule values (income limits, age, land size, class level, etc.) are **rule PENDING VERIFICATION** until checked against an official source and recorded in the admin source record. Demo results must say "likely eligible", never "guaranteed" or "approved".

### Scenario A – Low-income student (post-matric scholarship category)

- **Profile (SYNTHETIC):** Student, 17-year-old, studying in Class 10 in Andhra Pradesh; family is daily-wage workers.
- **Input (plain language):** "I am 17 and studying in Class 10 in Andhra Pradesh. My parents are daily wage workers and money is tight."
- **Expected result:** Likely eligible for at least one post-matric scholarship scheme (scheme name: PENDING VERIFICATION, from verified list).
- **Rule shown:** Class level = matches; family income = rule PENDING VERIFICATION; state residence = Andhra Pradesh (rule PENDING VERIFICATION).
- **Documents:** Documents listed only from verified scheme record (PENDING VERIFICATION).
- **Official source to cite:** Official scheme portal for the chosen scholarship scheme (URL PENDING VERIFICATION) with last-verified date.

### Scenario B – Senior citizen (old-age pension category)

- **Profile (SYNTHETIC):** Widow, 68 years old, living in an Andhra Pradesh village, no regular pension.
- **Input (plain language):** "I am a 68-year-old widow in a village in Andhra Pradesh. I have no regular pension."
- **Expected result:** Likely eligible for at least one state or central old-age pension scheme (scheme name: PENDING VERIFICATION).
- **Rule shown:** Age at or above minimum = rule PENDING VERIFICATION (minimum age not yet verified); residence = Andhra Pradesh (PENDING VERIFICATION); existing pension = none (PENDING VERIFICATION of exclusion rule).
- **Documents:** From verified scheme record only (PENDING VERIFICATION).
- **Official source to cite:** Official pension scheme page (URL PENDING VERIFICATION) with last-verified date.

### Scenario C – Small farmer (farm income-support category)

- **Profile (SYNTHETIC):** Farmer, 45 years old, owns a small piece of farm land in Andhra Pradesh, grows a seasonal crop.
- **Input (plain language):** "I am a 45-year-old farmer in Andhra Pradesh. I have a small piece of my own land and I grow a crop each season."
- **Expected result:** Likely eligible for at least one farm income-support scheme (scheme name: PENDING VERIFICATION).
- **Rule shown:** Land ownership = yes (rule PENDING VERIFICATION for land-size limit); cultivator status = yes (PENDING VERIFICATION); residence = Andhra Pradesh (PENDING VERIFICATION).
- **Documents:** From verified scheme record only (PENDING VERIFICATION).
- **Official source to cite:** Official farm scheme portal (URL PENDING VERIFICATION) with last-verified date.

## 3. Demo flow (order and timing)

Total target: about 6 minutes. Times are PENDING APPROVAL.

| # | Step | Time |
|---|---|---|
| 1 | Open landing page; state purpose and disclaimer ("likely eligible" notice) | 0:30 |
| 2 | Type Scenario A input; show profile extraction and user confirmation | 1:00 |
| 3 | Show likely-eligible result with per-rule reasoning and source/last-verified date | 1:00 |
| 4 | Open scheme detail; show document checklist and application guide | 1:00 |
| 5 | Repeat quickly with Scenario B (shows different result, no code change) | 1:00 |
| 6 | Admin login; edit one rule value; save; reopen scheme to show result changed | 1:30 |
| 7 | Close: show About page (data sources) and state that no Aadhaar or ID field exists | 0:30 |

Scenario C is an optional backup if time allows (PENDING APPROVAL).

## 4. Success criteria

- A typed synthetic profile produces at least one likely-eligible scheme with a visible reason per rule.
- Each result shows an official source link and last-verified date, or an explicit PENDING VERIFICATION marker.
- Document checklist and application steps appear for each matched scheme.
- No Aadhaar or sensitive ID field exists in UI or database.
- An admin rule change changes the result without a code deploy.
- Demo runs end-to-end on the hosted Vercel build using synthetic profiles only.
- Numeric thresholds (accuracy, users, latency): PENDING VERIFICATION, to be set after scope approval.

## 5. Risks

- Scheme rules and documents may not be verified in time; demo would then show PENDING VERIFICATION markers.
- Voice provider not approved; voice stays out of the MVP demo.
- Extraction from free text may misread a profile; user confirmation step is the mitigation.
- Result could be read as a guarantee; disclaimer must appear on every result page.
- Scope creep into reminders or tracking before the MVP is stable.
- Naming decision (ClaimSaathi vs Sahaya) still open and may affect slides and URLs.
