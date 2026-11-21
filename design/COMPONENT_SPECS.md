# ClaimSaathi – Component Contracts & Specifications

**Status:** APPROVED DETAILED COMPONENT CONTRACTS  
**Target:** React 18+ / TypeScript / Tailwind CSS / shadcn/ui  
**Owner:** Agent 03 (Frontend_Architect)  
**Related Documents:** [FRONTEND_ARCHITECTURE.md](file:///d:/Hackathon/PS5/ClaimSaathi/design/FRONTEND_ARCHITECTURE.md), [DESIGN_SYSTEM.md](file:///d:/Hackathon/PS5/ClaimSaathi/DESIGN_SYSTEM.md), [PAGE_SPECS.md](file:///d:/Hackathon/PS5/ClaimSaathi/design/PAGE_SPECS.md)

---

## 1. Domain Component Overview

The ClaimSaathi component library consists of accessible Radix UI / shadcn/ui primitives composed into domain-specific components. Every component adheres to:
* **TypeScript Strictness:** Fully typed props and states with zero `any`.
* **Trilingual Props / Context:** Automatic support for English (`en`), Telugu (`te`), and Hindi (`hi`).
* **WCAG 2.2 AA Conformance:** Keyboard navigable, 44×44px touch targets, visible focus rings (`--color-focus: #0B5FFF`), and ARIA live announcements.
* **Deterministic Transparency:** Clear display of matched rules, missing attributes, and official source links.

---

## 2. Core Component Specifications

---

### 2.1 `SchemeResultCard`
* **File:** `src/components/eligibility/SchemeResultCard.tsx`
* **Purpose:** Primary presentation card for an evaluated government scheme in the results list. Communicates qualification status ("Likely eligible", "Need more info", "Not likely eligible"), benefit amount, verified status, and houses the rule breakdown accordion.
* **Props Contract:**
  ```typescript
  export interface SchemeResultCardProps {
    scheme: {
      id: string;
      code: string;
      name_en: string;
      name_te: string;
      name_hi: string;
      level: 'central' | 'state';
      category: 'scholarship' | 'pension' | 'farm' | 'health' | 'housing' | 'employment';
      status: 'open' | 'closed' | 'not_yet_open';
      benefit_summary_en: string;
      benefit_summary_te: string;
      benefit_summary_hi: string;
      official_source_url: string;
      verified_at: string | null;
      is_verified: boolean;
    };
    resultStatus: 'likely_eligible' | 'needs_more_info' | 'not_likely_eligible';
    matchedRules: Array<{
      rule_id: string;
      field_name: string;
      condition_description_en: string;
      condition_description_te: string;
      condition_description_hi: string;
      user_value_description_en: string;
      user_value_description_te: string;
      user_value_description_hi: string;
      status: 'matched' | 'not_matched' | 'unknown';
      reason_en: string;
      reason_te: string;
      reason_hi: string;
    }>;
    missingFields?: string[];
    onAddMissingDetail?: (fieldName: string) => void;
    onViewDocuments: (schemeId: string) => void;
    onViewApplyGuide: (schemeId: string) => void;
  }
  ```
* **Visual States & Badges:**
  * `likely_eligible`: Green badge (`bg-emerald-50 text-emerald-800 border-emerald-300`), CheckCircle icon, label `"Likely eligible / అర్హత పొందే అవకాశం ఉంది / पात्र होने की संभावना है"`.
  * `needs_more_info`: Amber badge (`bg-amber-50 text-amber-800 border-amber-300`), HelpCircle icon, label `"Need more information / మరిన్ని వివరాలు అవసరం / अधिक जानकारी आवश्यक है"`.
  * `not_likely_eligible`: Gray badge (`bg-gray-100 text-gray-700 border-gray-300`), XCircle icon, label `"Not likely eligible / అర్హత పొందే అవకాశం తక్కువ / पात्र होने की संभावना कम है"`.
* **Internal Layout:**
  * Top Bar: Level badge (`Central` / `AP State`), Category badge, `VerificationBadge`.
  * Header: Title (EN primary or TE based on active language), Benefit Callout (`₹15,000 / year`).
  * Body: Collapsible Accordion containing `RuleReasonCard` items.
  * Conditional: If `missingFields` present, renders `MissingInfoList`.
  * Footer: Official Source Link button, `"Check Documents"`, `"How to Apply"` CTA buttons.
* **Accessibility:**
  * Accordion trigger has `aria-expanded` and descriptive `aria-label`.
  * Minimum touch target of 44px on all action buttons.

---

### 2.2 `RuleReasonCard`
* **File:** `src/components/eligibility/RuleReasonCard.tsx`
* **Purpose:** Displays an individual rule evaluated by the deterministic matching engine, showing what was required, what the citizen provided, and why it passed or failed.
* **Props Contract:**
  ```typescript
  export interface RuleReasonCardProps {
    ruleId: string;
    fieldName: string;
    conditionTextEn: string;
    conditionTextTe: string;
    conditionTextHi: string;
    userValueEn: string;
    userValueTe: string;
    userValueHi: string;
    evaluationStatus: 'matched' | 'not_matched' | 'unknown';
    reasonTextEn: string;
    reasonTextTe: string;
    reasonTextHi: string;
  }
  ```
* **Rendering Logic:**
  * Status Icon: Green check (`matched`), Red cross (`not_matched`), or Amber question mark (`unknown`).
  * Grid Row:
    * Left column: Official Rule Condition (e.g. *"Annual income ≤ ₹1.20 Lakhs rural / ₹1.44 Lakhs urban"*).
    * Middle column: Citizen's Profile Value (e.g. *"Your income band: Below ₹1.2 Lakhs"*).
    * Right column / Sub-row: Plain language reason (e.g. *"Your income qualifies within the rural cutoff"*).

---

### 2.3 `MissingInfoList`
* **File:** `src/components/eligibility/MissingInfoList.tsx`
* **Purpose:** Rendered inside a `needs_more_info` card to list the specific fields that prevented a definite match, with interactive buttons to fill them immediately.
* **Props Contract:**
  ```typescript
  export interface MissingInfoListProps {
    missingFields: string[];
    onProvideField: (fieldName: string) => void;
  }
  ```
* **Behavior:**
  * Maps raw field keys (`land_holding_band`, `income_band`) to human-readable bilingual questions (e.g. *"Land ownership: Do you own agricultural land?"*).
  * Clicking `"Add this detail / ఈ వివరాలను జోడించండి"` triggers a focused modal or routes to `/confirm-profile` with the field highlighted.

---

### 2.4 `DocumentChecklist`
* **File:** `src/components/scheme/DocumentChecklist.tsx`
* **Purpose:** Personalized, interactive checklist of required and optional documents for a scheme.
* **Props Contract:**
  ```typescript
  export interface DocumentItem {
    id: string;
    name_en: string;
    name_te: string;
    name_hi: string;
    requirement: 'mandatory' | 'optional';
    notes_en?: string;
    notes_te?: string;
    notes_hi?: string;
  }

  export interface DocumentChecklistProps {
    schemeNameEn: string;
    schemeNameTe: string;
    schemeNameHi: string;
    documents: DocumentItem[];
    onPrint?: () => void;
    onCopyAsText?: () => void;
  }
  ```
* **Features:**
  * Grouped into two visual blocks: `"Mandatory Documents / తప్పనిసరి పత్రాలు / अनिवार्य दस्तावेज़"` and `"Optional Documents / ఐచ్ఛిక పత్రాలు / वैकल्पिक दस्तावेज़"`.
  * Local Interactive Checkboxes: `44 × 44px` touch bounding boxes; checkbox state saved in component memory for printing.
  * Print Mode: Embedded print stylesheet hides website navigation and outputs a crisp checklist titled: `"ClaimSaathi Document Checklist: [Scheme Name]"`.

---

### 2.5 `ApplicationStepList`
* **File:** `src/components/scheme/ApplicationStepList.tsx`
* **Purpose:** Sequenced roadmap of application steps, clearly distinguishing online portals from offline Sachivalayam visits.
* **Props Contract:**
  ```typescript
  export interface ApplicationStep {
    step_no: number;
    title_en: string;
    title_te: string;
    title_hi: string;
    description_en: string;
    description_te: string;
    description_hi: string;
    channel: 'online' | 'offline_office' | 'csc_sachivalayam';
    official_action_url?: string;
  }

  export interface ApplicationStepListProps {
    steps: ApplicationStep[];
    officialPortalUrl: string;
    lastVerifiedDate: string | null;
  }
  ```
* **Features:**
  * Step numbers rendered inside high-contrast circular badges (`1`, `2`, `3`).
  * If `official_action_url` exists, renders a verified link button with external indicator.
  * Never invents steps: if steps are unverified, displays fallback: *"Application steps are being verified. Please visit the official government portal directly."*

---

### 2.6 `ProfileConfirmForm`
* **File:** `src/components/citizen/ProfileConfirmForm.tsx`
* **Purpose:** Coarse-band profile review and editing form. Enforces that only non-identifying categorical bands are edited.
* **Props Contract:**
  ```typescript
  export interface ProfileConfirmFormProps {
    initialProfile: CitizenProfile;
    onConfirm: (confirmedProfile: CitizenProfile) => void;
    onBackToDescribe: () => void;
    isLoading?: boolean;
  }
  ```
* **Form Controls:**
  * Age Band (`Select` component with accessible `<Label>`).
  * Annual Income Band (`RadioGroup` with large click targets).
  * District (`Select` with Andhra Pradesh districts).
  * Occupation (`Select` with coarse categories).
  * Land Holding (`RadioGroup`: None, Marginal < 2.5 acres, Small 2.5–5 acres, Large > 5 acres).
  * Social Category (`Select`: OC, BC, SC, ST, Minority).
  * Household Members List (Add/Remove dependent cards with relationship and student status).

---

### 2.7 `PiiAlertBanner`
* **File:** `src/components/common/PiiAlertBanner.tsx`
* **Purpose:** High-visibility banner triggered whenever numbers resembling Aadhaar, PAN, or phone numbers are typed.
* **Props Contract:**
  ```typescript
  export interface PiiAlertBannerProps {
    detectedPatternType: 'aadhaar' | 'phone' | 'pan';
    onClearInput: () => void;
  }
  ```
* **Visuals & Guardrails:**
  * Styling: Danger theme (`bg-red-50 text-red-900 border-red-400`).
  * Wording: *"Notice: Do not provide Aadhaar numbers or personal identification numbers. ClaimSaathi only requires coarse details like your age band and occupation to check eligibility."*
  * One-click `"Remove Number"` button.

---

### 2.8 `VerificationBadge`
* **File:** `src/components/common/VerificationBadge.tsx`
* **Purpose:** Prominently signals the grounding and freshness of scheme data.
* **Props Contract:**
  ```typescript
  export interface VerificationBadgeProps {
    isVerified: boolean;
    verifiedAt: string | null; // ISO date string (YYYY-MM-DD)
    className?: string;
  }
  ```
* **Behavior:**
  * If `isVerified === true` and `verifiedAt`: Renders blue badge: `"Verified on DD Mon YYYY"` with a shield icon.
  * If `isVerified === false`: Renders amber badge: `"PENDING VERIFICATION"` with an alert icon.

---

### 2.9 `LanguageToggle`
* **File:** `src/components/common/LanguageToggle.tsx`
* **Purpose:** Persistent header widget allowing instantaneous switching between English, Telugu, and Hindi.
* **Props Contract:**
  ```typescript
  export interface LanguageToggleProps {
    className?: string;
  }
  ```
* **Behavior:**
  * Three-segment pill: `[ English | తెలుగు | हिन्दी ]`.
  * Clicking updates the global `useLanguageStore`.
  * Sets `<html lang="en">`, `<html lang="te">`, or `<html lang="hi">` on the document root for correct screen reader pronounciation.

---

### 2.10 `DisclaimerBanner`
* **File:** `src/components/common/DisclaimerBanner.tsx`
* **Purpose:** Persistent statutory notice across all citizen flows reinforcing that results represent preliminary guidance, never an official government approval.
* **Wording:**
  * *English:* "Preliminary guidance only. ClaimSaathi provides likely-eligible recommendations based on public criteria. This is not an official government sanction or guarantee."
  * *Telugu:* "ప్రాథమిక సమాచారం మాత్రమే. క్లెయిమ్ సాథీ ప్రభుత్వ నిబంధనల ఆధారంగా మీకు అర్హత ఉండే అవకాశాన్ని మాత్రమే చూపుతుంది. ఇది అధికారిక ప్రభుత్వ మంజూరు కాదు."
  * *Hindi:* "केवल प्रारंभिक मार्गदर्शन। क्लेम साथी सार्वजनिक नियमों के आधार पर संभावित पात्रता बताता है। यह कोई आधिकारिक सरकारी स्वीकृति या गारंटी नहीं है।"
