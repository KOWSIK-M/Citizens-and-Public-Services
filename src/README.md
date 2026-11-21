# ClaimSaathi – Source Code Architecture

This directory houses the frontend single-page application built with **React, Vite, TypeScript, Tailwind CSS, and shadcn/ui**.

## Architectural Rules (Non-Negotiable)
1. **Zero Client Secrets:** The client calls only `/api/*` Vercel serverless functions.
2. **Strict PII Shielding:** No Aadhaar numbers, PAN, phone numbers, or bank account numbers are collected. All inputs run through `src/utils/piiValidator.ts`.
3. **Deterministic Reasoning:** The UI displays explicit rule matches evaluated by deterministic logic.
4. **Wording:** Always display `"Likely eligible"` / `"అర్హత పొందే అవకాశం ఉంది"` / `"पात्र होने की संभावना है"`. Never use `"guaranteed"` or `"approved"`.
5. **Grounding:** Every scheme card must display its verified date or `PENDING VERIFICATION` badge, along with its official government source link.
6. **Multilingual:** All UI views support English, Telugu, and Hindi with the `LanguageToggle` header.

## Directory Mapping
- `assets/`: Static media, logo marks, and SVGs.
- `components/`: UI components broken down by domain:
  - `ui/`: shadcn/ui primitives (Radix UI).
  - `common/`: Global banners, toggles, badges, headers, and footers.
  - `citizen/`: Input forms, plain-language description intake, coarse band selectors.
  - `eligibility/`: Result cards, rule match explainers, missing info cards.
  - `scheme/`: Scheme detail cards, document checklists, application steps.
  - `admin/`: Scheme management and rule editor tables.
- `config/`: App routes, coarse profile bands, and synthetic test presets.
- `hooks/`: Custom hooks for language, PII shielding, eligibility matching.
- `layouts/`: RootLayout, CitizenFlowLayout, AdminLayout.
- `locales/`: Trilingual translation JSON files (`en/`, `te/`, and `hi/`).
- `pages/`: Routable views (public, citizen flows, admin).
- `services/`: Strongly-typed API client connectors to `/api/*`.
- `store/`: Zustand reactive state stores (`useProfileStore`, `useAssessmentStore`, `useLanguageStore`).
- `types/`: Complete domain interfaces for profiles, schemes, rules, and assessments.
- `utils/`: PII validator, date/currency formatters, rule condition humanizers.
