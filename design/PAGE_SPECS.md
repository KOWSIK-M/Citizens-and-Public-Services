# ClaimSaathi – Page Specifications

**Status:** APPROVED DETAILED PAGE SPECIFICATION  
**Target:** React 18+ / Vite / TypeScript / Tailwind CSS / shadcn/ui  
**Owner:** Agent 03 (Frontend_Architect)  
**Related Documents:** [FRONTEND_ARCHITECTURE.md](file:///d:/Hackathon/PS5/ClaimSaathi/design/FRONTEND_ARCHITECTURE.md), [DESIGN_SYSTEM.md](file:///d:/Hackathon/PS5/ClaimSaathi/DESIGN_SYSTEM.md), [USER_FLOWS.md](file:///d:/Hackathon/PS5/ClaimSaathi/USER_FLOWS.md), [docs/design/page_specifications.md](file:///d:/Hackathon/PS5/ClaimSaathi/docs/design/page_specifications.md)

---

## 1. Master Route Directory

| Page Name | Path | Access | Layout | Primary Goal |
|---|---|---|---|---|
| **Home (Landing)** | `/` | Public | `RootLayout` | Orient citizen, explain plain-language process, display statutory disclaimer, trigger onboarding. |
| **About & Sources** | `/about` | Public | `RootLayout` | Transparency: project mission, methodology, primary official source registers. |
| **Legal Disclaimer** | `/disclaimer` | Public | `RootLayout` | Explicit legal boundary: guidance only, not official sanction or guarantee. |
| **Describe Situation** | `/describe` | Citizen | `CitizenFlowLayout` | Free-text / voice situation intake with active PII interceptor shield. |
| **Confirm Profile** | `/confirm-profile` | Citizen | `CitizenFlowLayout` | Review coarse bands extracted by Claude; optional clarifying question modal (max 3). |
| **Eligibility Results** | `/results` | Citizen | `CitizenFlowLayout` | Display grouped results (Likely Eligible, Need More Info, Ineligible) with per-rule reasoning. |
| **Scheme Detail** | `/schemes/:schemeId` | Citizen | `RootLayout` | Deep-dive scheme view: official authority, benefits, rules breakdown, documents, application steps. |
| **Document Checklist** | `/schemes/:schemeId/documents` | Citizen | `RootLayout` | Interactive checklist of required documents with print & copy support. |
| **Application Guide** | `/schemes/:schemeId/apply` | Citizen | `RootLayout` | Sequenced application roadmap (online portal links vs. offline office steps). |
| **Admin Dashboard** | `/admin` | Admin | `AdminLayout` | Overview of scheme registry, verification status, and audit metrics. |
| **Admin Scheme Editor** | `/admin/schemes/:id` | Admin | `AdminLayout` | Visual rule authoring, source metadata verification, draft/publish controls. |
| **Admin Audit Log** | `/admin/audit-log` | Admin | `AdminLayout` | Append-only history of administrative updates. |
| **Not Authorized** | `/not-authorized` | Public | `RootLayout` | 403 fallback for unauthenticated attempts to access admin views. |
| **Not Found** | `*` | Public | `RootLayout` | 404 error handler with one-click return to Home. |

---

## 2. Detailed Per-Page Specifications

---

### 2.1 Home Page (`/`)

* **Purpose:** Welcome citizens, establish trust, explain how the plain-language assessment works, and offer a prominent start action without asking for sensitive IDs.
* **Layout:** `RootLayout` (Header with language toggle, statutory disclaimer banner, main content container max-w-5xl, footer).
* **Inputs & Actions:**
  * Primary Call to Action: `"Describe Your Situation" / "మీ పరిస్థితిని వివరించండి" / "अपनी स्थिति का वर्णन करें"` -> navigates to `/describe`.
  * Demo Persona Quick-Select (Synthetic Profiles):
    * *Scenario A: 17-year-old student, Class 10, daily-wage family*
    * *Scenario B: 68-year-old widow, rural AP, no pension*
    * *Scenario C: 45-year-old small farmer, marginal land*
  * Secondary Action: `"Browse All Schemes" / "అన్ని పథకాలను చూడండి" / "सभी योजनाएं देखें"` -> navigates to public directory.
* **Component Tree:**
  ```
  HomePage
  ├── DisclaimerBanner (Persistent reminder: preliminary guidance only)
  ├── HeroSection (Trilingual heading, trust badges, primary CTA button)
  ├── QuickStartDemoPills (One-click synthetic scenario presets)
  ├── HowItWorksSteps (1. Describe -> 2. Review Profile -> 3. See Rules & Schemes)
  └── SourceTrustCard (Highlighting official AP and Central Government portals)
  ```
* **View States:**
  * *Populated:* Standard static landing presentation.
* **Accessibility:**
  * Heading hierarchy: single `<h1>` for page title, `<h2>` for sections.
  * Demo persona cards have descriptive `aria-label`s indicating they load sample data.
  * Minimum touch target 48px for the primary CTA button.

---

### 2.2 Describe Page (`/describe`)

* **Purpose:** Plain-language situation intake where the citizen speaks or types about their daily life, occupation, age, and family situation.
* **Layout:** `CitizenFlowLayout` (Step 1 of 3: "Describe").
* **Inputs & Actions:**
  * Free-Text Textarea: Max 500 characters, character counter, descriptive placeholder with bilingual examples.
  * Voice Input Trigger: Pluggable speech microphone button (if speech service is enabled; otherwise cleanly hidden with a tooltip).
  * Sample Preset Selector: Instant autofill of synthetic scenarios A, B, or C.
  * Clear Button: Clears textarea.
  * Submit Button: `"Understand My Situation" / "వివరాలను విశ్లేషించండి" / "विवरण का विश्लेषण करें"`.
* **Guardrails & PII Interceptor:**
  * Real-time client-side regex check (`usePiiShield`).
  * If a 12-digit number (Aadhaar format) or phone/PAN number is detected:
    * Submit button is **disabled**.
    * `PiiAlertBanner` renders immediately: *"Please do not provide Aadhaar, PAN, or phone numbers. Describe your personal situation instead."*
* **Component Tree:**
  ```
  DescribePage
  ├── StepperHeader (Step 1 of 3: Active)
  ├── SampleScenarioBar (One-click synthetic persona loader)
  ├── PiiAlertBanner (Conditional: renders when regex triggers)
  ├── PlainTextInputContainer
  │   ├── Textarea (Accessible label, aria-describedby for char limit)
  │   ├── CharCountIndicator (e.g., "145 / 500")
  │   └── VoiceRecordButton (Optional STT trigger)
  └── ActionRow (Back button, Submit button with loading spinner)
  ```
* **View States:**
  * *Empty:* Submit disabled, example guidance prompts visible.
  * *Typing (Valid):* Submit enabled, character counter updates.
  * *Typing (PII Alert):* Submit disabled, warning banner displays in high-contrast danger token (`#991B1B`).
  * *Loading:* Extraction in progress. Skeleton pulses; text reads: *"Understanding your details with Claude Haiku…"* (`aria-live="polite"`).
  * *Error:* If `/api/profile/extract` fails: Alert appears: *"We could not process this right now. You can enter your details manually."* with button to `/confirm-profile?mode=manual`.

---

### 2.3 Confirm Profile Page (`/confirm-profile`)

* **Purpose:** Transparent review of the coarse profile extracted by Claude. Citizens can adjust or correct any attribute before deterministic matching runs.
* **Layout:** `CitizenFlowLayout` (Step 2 of 3: "Review Details").
* **Inputs & Actions:**
  * Profile Form Fields (Coarse Bands Only):
    * Age Band (`under_18`, `18_25`, `26_40`, `41_60`, `60_plus`)
    * State & District (`AP` fixed for state; AP District dropdown)
    * Annual Income Band (`below_1_2L`, `1_2L_to_2_5L`, `2_5L_to_5L`, `above_5L`)
    * Occupation Category (`farmer`, `daily_wage`, `student`, `homemaker`, `self_employed`, `other`)
    * Social Category (`OC`, `BC`, `SC`, `ST`, `minority`)
    * Land Holding Band (`none`, `marginal_under_2_5_acres`, `small_2_5_to_5_acres`, `large_above_5_acres`)
    * Household Members (Repeatable card: Relation, Age Band, Education Level)
  * Clarifying Questions Modal (Max 3 questions):
    * If critical fields are unextracted from free text, short single-question prompt appears with "Skip" option.
  * Primary Action: `"Check Matching Schemes" / "అర్హత ఉన్న పథకాలను చూడండి" / "पात्र योजनाएं जांचें"` -> dispatches to `/api/eligibility/match`.
* **Component Tree:**
  ```
  ConfirmProfilePage
  ├── StepperHeader (Step 2 of 3: Active)
  ├── SampleProfileNotice (Rendered if is_sample === true)
  ├── ClarifyingQuestionsModal (Conditional modal for missing critical attributes)
  ├── ProfileConfirmForm
  │   ├── CoarseBandGrid
  │   │   ├── AgeBandSelect
  │   │   ├── DistrictSelect
  │   │   ├── IncomeBandRadioGroup
  │   │   ├── OccupationSelect
  │   │   └── LandHoldingRadioGroup
  │   └── HouseholdMemberAccordion
  └── ActionRow (Edit Description button, Confirm & Match button)
  ```
* **View States:**
  * *Populated:* All extracted chips pre-selected; unknown fields clearly marked with badge `"Not specified / తెలియదు / निर्दिष्ट नहीं"`.
  * *Clarifying Modal Active:* Displays 1 question per screen with clear options and a visible `"Skip / దాటవేయి / छोड़ें"` button.
  * *Submitting:* Spinner on button; `aria-live` announcement: *"Evaluating rules against official schemes…"*
  * *Error:* If matching API fails, preserves profile state, displays retry button.

---

### 2.4 Eligibility Results Page (`/results`)

* **Purpose:** Display matched schemes grouped strictly by qualification status, accompanied by explicit rule-level reasoning and official source metadata.
* **Layout:** `CitizenFlowLayout` (Step 3 of 3: "Results").
* **Inputs & Actions:**
  * Category Filter Tabs: `All`, `Scholarships`, `Pensions`, `Agriculture`, `Health`, `Housing`.
  * Government Level Filter: `All`, `AP State Schemes`, `Central Schemes`.
  * Accordion Collapse / Expand: On individual scheme cards to inspect rule-by-rule matching logic.
  * Missing Detail Action: `"Add this detail" / "ఈ వివరాలను జోడించండి" / "यह विवरण जोड़ें"` on partial matches (navigates back to `/confirm-profile` with field highlighted).
  * Card Click: Opens `/schemes/:schemeId`.
* **Component Tree:**
  ```
  ResultsPage
  ├── StepperHeader (Step 3 of 3: Completed)
  ├── ResultsSummaryCard (e.g. "Likely eligible for 3 schemes, need more info for 1")
  ├── FilterToolbar (Category tabs, State/Central pill toggles)
  ├── ResultsGroupContainer (aria-live="polite")
  │   ├── LikelyEligibleSection (Green badge, open by default)
  │   │   └── SchemeResultCard[]
  │   │       ├── SchemeHeader (Name EN/TE, Level, Category, Status)
  │   │       ├── VerificationBadge (Verified date or PENDING VERIFICATION)
  │   │       ├── BenefitPill (e.g. "₹15,000 / year")
  │   │       ├── RuleReasonAccordion (Matched rules with explicit explanations)
  │   │       └── CardActions (View Documents, How to Apply)
  │   ├── NeedMoreInfoSection (Amber badge, open by default)
  │   │   └── SchemeResultCard[]
  │   │       └── MissingInfoList (List of missing parameters with direct edit buttons)
  │   └── NotLikelyEligibleSection (Gray badge, collapsed by default)
  │       └── SchemeResultCard[] (Explanation of disqualifying rules)
  └── SourceCitationFooter (Explaining that eligibility is preliminary)
  ```
* **View States:**
  * *Loading:* 3 Skeleton cards with shimmer animation.
  * *Empty (No Schemes Available):* Message: *"No verified schemes match this profile currently. You can browse all schemes or adjust your details."*
  * *Populated:* Categorized list grouped into Likely Eligible, Need More Info, and Ineligible.
  * *Pending Verification Warning:* Schemes whose rules are undergoing review display an amber `"PENDING VERIFICATION"` tag.

---

### 2.5 Scheme Detail Page (`/schemes/:schemeId`)

* **Purpose:** Single source of truth for an individual scheme, containing its verified background, rule requirements, document requirements, and step-by-step application instructions.
* **Layout:** `RootLayout`.
* **Inputs & Actions:**
  * Tab Navigation:
    * Tab 1: `"Overview & Eligibility" / "సమీక్ష & అర్హత" / "अवलोकन और पात्रता"`
    * Tab 2: `"Document Checklist" / "పత్రాల జాబితా" / "दस्तावेज़ सूची"`
    * Tab 3: `"How to Apply" / "దరఖాస్తు విధానం" / "आवेदन कैसे करें"`
  * Official Portal Button: External link to verified government URL with external link icon (`rel="noopener noreferrer"`).
* **Component Tree:**
  ```
  SchemeDetailPage
  ├── BreadcrumbTrail (Home > Results > Scheme Name)
  ├── SchemeHero
  │   ├── TitleRow (Name EN & TE, Level Badge, Category Badge)
  │   ├── VerificationBadge (Official verification status & date)
  │   └── BenefitSummaryCard (Financial or in-kind assistance description)
  ├── TabsContainer
  │   ├── TabOverview
  │   │   ├── SchemeDescriptionText
  │   │   ├── RuleCriteriaList (All required conditions in plain language)
  │   │   └── SourceMetadataCard (Publishing department, G.O. / portal reference)
  │   ├── TabDocuments (Renders DocumentChecklist)
  │   └── TabApply (Renders ApplicationStepList)
  └── OfficialLinkBox (Prominent link to primary government portal)
  ```
* **View States:**
  * *Loading:* Skeleton hero and tabs.
  * *Error (404 / Invalid ID):* Alert: *"Scheme not found. Please return to Results."*

---

### 2.6 Document Checklist Page / Tab (`/schemes/:schemeId/documents`)

* **Purpose:** Personalized, interactive checklist of verified documents necessary for submission.
* **Layout:** Embedded as a tab within `SchemeDetailPage` or accessible directly via route.
* **Inputs & Actions:**
  * Client-side Interactive Checkboxes: Allows the citizen to tick off items they already possess (stored locally in session, zero cloud storage).
  * Print Checklist Button: Generates clean, printer-friendly black & white document list.
  * Copy to Clipboard Button: Copies plain-text checklist for sharing via messaging apps.
* **Component Tree:**
  ```
  DocumentChecklist
  ├── ChecklistHeader (Total required documents count)
  ├── PrintCopyActionToolbar
  ├── MandatoryDocumentsList
  │   └── ChecklistItem[] (Checkbox, Document Name EN/TE, Notes, e.g. "Self-attested")
  ├── OptionalDocumentsList
  │   └── ChecklistItem[]
  └── DocumentNoticeBox ("Do not submit original documents unless requested at office")
  ```

---

### 2.7 Application Guide Page / Tab (`/schemes/:schemeId/apply`)

* **Purpose:** Transparent, numbered walkthrough of application steps, distinguishing between online portal submissions and offline Grama / Ward Sachivalayam visits.
* **Layout:** Embedded as a tab within `SchemeDetailPage` or accessible directly via route.
* **Component Tree:**
  ```
  ApplicationStepList
  ├── ChannelBadge (Online Portal, Offline Sachivalayam, or Hybrid)
  ├── SequencedStepsContainer
  │   └── StepItem[] (Step Number, Title EN/TE, Instruction, Official Portal Sub-Link)
  ├── FollowUpGuidanceCard (How to check status, expected processing timeframe)
  └── OfficialSourceFooter (Direct link to official department guidelines)
  ```

---

### 2.8 Public Information Pages (`/about`, `/disclaimer`)

* **About Page (`/about`):**
  * Explains the hackathon mission (Problem Statement 5: "Claim What's Yours").
  * Discloses that no private citizen data is logged or stored.
  * Lists primary official data sources: myScheme, Andhra Pradesh SGSW/APSEVA, DBT Bharat, National Scholarships Portal.
* **Disclaimer Page (`/disclaimer`):**
  * Full statutory declaration: ClaimSaathi is an independent informational tool.
  * Explicitly affirms that "Likely Eligible" results do **not** constitute an official government sanction, authorization, or guarantee of welfare disbursement.
  * Instructs citizens to confirm with relevant government departments or Sachivalayam officers.

---

### 2.9 Admin Area (`/admin`, `/admin/schemes/:id`)

* **Purpose:** Restricted portal for administrators to update scheme rules as data without code redeployment, record source verification dates, and inspect audit logs.
* **Layout:** `AdminLayout` (Header with Admin Role indicator, Tabbed Navigation).
* **Inputs & Actions:**
  * Scheme Rule Editor: Form to edit field name, operator (`eq`, `lte`, `gte`, `in`), threshold value, and plain-language explanation (`reason_en`, `reason_te`).
  * Source Verification Form: Official URL, publisher, document type (G.O. / Portal / News), verified date, and verifier identifier.
  * Preview Evaluation: Test modified rules against synthetic sample profiles before publishing.
  * Publish Button: Commits new draft to published state; appends to `audit_log`.

---

## 3. Empty, Loading, and Error State Matrix

| State Type | Visual Pattern | Assistive Technology Support |
|---|---|---|
| **Page Loading** | Pulse Skeleton matching page card geometry | `aria-busy="true"`, `aria-live="polite"` announcing `"Loading content…"` |
| **Empty Input** | Submit disabled; prominent helpful example cards | Button carries `aria-disabled="true"` with helper text |
| **PII Detected** | High-contrast danger alert (`#991B1B`); submit blocked | `role="alert"` announcing `"Please remove ID numbers before proceeding"` |
| **Zero Matches** | Informative banner; suggestions to modify bands | `role="status"` announcing `"No schemes matched your current profile"` |
| **API Failure** | Amber alert with explicit retry button | `role="alert"` announcing `"Connection error. Press retry to attempt again"` |
| **Pending Verification** | Blue/Amber badge with calendar icon | Screen reader label: `"This scheme's rules are pending verification"` |
| **Stale Source** | Warning alert: `"Last verified over 90 days ago"` | Screen reader label: `"Source may require verification"` |
