# ClaimSaathi – Design System

**Status: PROPOSED for agent 03 to finalise.** Every value in this file (colours, fonts, spacing, component names) is a proposal. Nothing is verified. Agent 03 owns the final decision; agent 05 and the orchestrator review before implementation.

Related: PROJECT_BRIEF.md §4 (problems: language, plain language) and §8 (guardrails); ARCHITECTURE.md §4 (React, Vite, Tailwind, shadcn/ui).

## 1. Visual principles – PROPOSED

- **Trustworthy government-service feel.** Calm, orderly, clearly sourced. Not a playful or generic chatbot look.
- **Plain language first.** Short sentences, everyday words, and the rule behind each result stated in one line.
- **Large readable text.** Body text at least 16px; no text below 14px anywhere.
- **Low cognitive load.** One question per screen, one primary action per screen, progressive disclosure for detail.
- **Honest status.** "Likely eligible", "Need more information", and "PENDING VERIFICATION" are always visible when they apply. Never "guaranteed" or "approved".
- **Bilingual by default.** Every visible string has an English and a Telugu version.

## 2. Colour tokens – PROPOSED (hex values not verified)

WCAG AA contrast is an **intent** (4.5:1 for body text, 3:1 for large text and UI components). **Contrast is NOT verified.** Every pairing must be checked by agent 03 with a contrast tool before approval.

| Token | Proposed hex | Intended use | Contrast status |
|---|---|---|---|
| `--color-primary` | `#1F4E79` | Primary buttons, links, header | NOT VERIFIED (intent AA on white) |
| `--color-primary-foreground` | `#FFFFFF` | Text on primary | NOT VERIFIED |
| `--color-accent` | `#B45309` | Highlights, attention labels (not for body text) | NOT VERIFIED |
| `--color-background` | `#FFFFFF` | Page background | – |
| `--color-surface` | `#F5F7FA` | Cards and panels | NOT VERIFIED |
| `--color-text` | `#1A1A1A` | Body text | NOT VERIFIED (intent AA) |
| `--color-text-muted` | `#4B5563` | Secondary text, helper text | NOT VERIFIED (intent AA on surface) |
| `--color-border` | `#9CA3AF` | Input and card borders (UI component contrast) | NOT VERIFIED (intent 3:1) |
| `--color-success` | `#166534` | "Likely eligible" label | NOT VERIFIED |
| `--color-warning` | `#92400E` | "Need more information", stale source | NOT VERIFIED |
| `--color-danger` | `#991B1B` | Errors, ID-number warning | NOT VERIFIED |
| `--color-info` | `#1E40AF` | Neutral notices, "PENDING VERIFICATION" tag | NOT VERIFIED |
| `--color-focus` | `#0B5FFF` | Focus ring (2px outline, 2px offset) | NOT VERIFIED (intent 3:1 against adjacent colours) |

Rules:
- Status is never shown by colour alone; each status also has an icon and a text label.
- Dark mode: NOT in MVP.

## 3. Typography – PROPOSED

| Role | Telugu font (proposed) | English font (proposed) | Notes |
|---|---|---|---|
| Body and UI | Noto Sans Telugu | Noto Sans or Inter | Verify font licence before use (both are open-licence families, not yet checked in this project). |
| Headings | Noto Sans Telugu (bold) | Noto Sans (semibold) | Same family per language keeps line heights consistent. |
| Numerals | – | Tabular figures for dates and amounts | Verify rendering of Telugu digits. |

Type scale (PROPOSED):

| Token | Size / line height | Use |
|---|---|---|
| `text-xs` | 14px / 20px | Minimum size; footnotes only |
| `text-sm` | 16px / 24px | Helper text (minimum for body in practice) |
| `text-base` | 18px / 28px | Default body |
| `text-lg` | 20px / 30px | Card titles |
| `text-xl` | 24px / 32px | Section headings |
| `text-2xl` | 30px / 36px | Page headings |

- Telugu text uses **line height +4px** over the English value, because Telugu glyphs need more vertical room (PROPOSED; verify on device).
- Font fallback chain: `"Noto Sans Telugu", "Noto Sans", system-ui, sans-serif` for Telugu strings; `"Inter", "Noto Sans", system-ui, sans-serif` for English. Font loading method (self-hosted vs CDN) PENDING APPROVAL.
- No text is set in all caps for Telugu.

## 4. Layout and spacing – PROPOSED

- Base unit **4px**; spacing scale uses multiples of 4px and 8px: 4, 8, 12, 16, 24, 32, 48, 64.
- Container: full width on mobile, max width 720px for reading content, 1120px for results grids.
- Grid: 4 columns on mobile (360px), 8 columns on tablet, 12 columns on desktop.
- Card padding: 16px on mobile, 24px on desktop.
- Section spacing: 32px between sections; 16px between related items.
- Minimum gap between tap targets: 8px.

## 5. Responsive behaviour – PROPOSED

- **Mobile-first.** Design starts at **360px** width (minimum supported width) and scales up.
- Breakpoints (Tailwind defaults, PROPOSED): `sm` 640px, `md` 768px, `lg` 1024px.
- Results list: single column below `md`; two columns at `md`; up to three at `lg`.
- Header: collapses to a menu button below `md`; language toggle stays visible at all widths.
- Test widths: 360, 390, 768, 1280 (PROPOSED test set; no automated test run is in scope for this document).
- No horizontal scrolling at 360px for any screen, including Telugu strings (long Telugu words must wrap).

## 6. Component conventions – PROPOSED

- **Primitives:** shadcn/ui components copied into the repository (not a runtime remote dependency). Primitive set PROPOSED: Button, Card, Input, Textarea, Label, Checkbox, RadioGroup, Select, Badge, Alert, Dialog, Tabs, Accordion, Toast, Skeleton, Breadcrumb.
- **Project components** live under a feature folder (PROPOSED naming): `RuleReasonCard`, `SchemeResultCard`, `MissingInfoList`, `DocumentChecklist`, `ApplicationStepList`, `SourceFooter`, `LanguageToggle`, `ProfileConfirmForm`, `DisclaimerBanner`, `SampleProfileBanner`, `VerificationBadge`.
- **Naming:** PascalCase for components; kebab-case for files (PROPOSED: `scheme-result-card.tsx`); `camelCase` for hooks prefixed `use`.
- **Variants:** use `class-variance-authority` patterns already in shadcn/ui; no custom one-off variants without a note in this file.
- **Icons:** one icon set only (PROPOSED: lucide icons, licence to verify). Icons never the only carrier of meaning.
- **Status badges:** `Likely eligible`, `Need more information`, `Not likely eligible`, `Open`, `Closed`, `Not yet open`, `PENDING VERIFICATION`. Text is required in each badge.

## 7. Accessibility – PROPOSED (WCAG 2.2 AA target, NOT verified)

- **Keyboard:** every interactive element reachable and operable by keyboard; logical tab order; no keyboard traps; dialogs trap focus while open and return focus on close.
- **Focus visibility:** visible focus ring (`--color-focus`, 2px, offset 2px) on every focusable element; never removed with `outline: none` alone.
- **Touch targets:** minimum **44 × 44px** for every button, link in lists, checkbox and radio.
- **Screen readers:** labels on every input (visible labels, not placeholders only); `aria-live` polite region for result counts and loading states; icon-only buttons have `aria-label` in the active language.
- **Language:** `lang="en"` or `lang="te"` set on the root and on each Telugu or English block that differs.
- **Error messages:** text next to the field, linked with `aria-describedby`; never colour alone.
- **Motion:** respect `prefers-reduced-motion`; no auto-playing audio.
- **Text resize:** layout works at 200% zoom without loss of content (target).
- **Accessibility test method:** PENDING VERIFICATION (tool and manual review plan to be chosen by agent 03).

## 8. Telugu and English support – PROPOSED

- **Language toggle** in the header, always visible, showing the other language's name in its own script ("తెలుగు" / "English").
- **Strings stored as data:** every UI string is a key with `en` and `te` values in a locale file or table (location PENDING APPROVAL). Scheme names, rule reasons and document names come from the database in both languages (see DATABASE_SCHEMA.md §3).
- **Missing translation:** show English with a small "English only" note; never show a raw key.
- **Fallback:** if a Telugu field is empty, show English and mark the language.
- **Numbers and dates:** dates shown as `DD Mon YYYY` in both languages (format PROPOSED; Telugu month names PENDING TRANSLATION REVIEW).
- **Voice:** voice input and output are out of MVP scope until a provider is approved (see ARCHITECTURE.md §7).
- **Translation quality:** all Telugu copy reviewed by a Telugu speaker before demo (PENDING).

## 9. Content and tone – PROPOSED

- Use "you" and short verbs: "Add your income band", not "Input income parameters".
- Never use "guaranteed", "approved", or "sure to get".
- Standard disclaimer text is provided by the product owner (PENDING APPROVAL).
- Every result and every scheme page shows the official source link and "last verified on [date]" or "PENDING VERIFICATION".

## 10. Open questions for agent 03

1. Confirm or replace the proposed hex palette and run contrast checks on each pairing.
2. Confirm font families, licences, and loading method for Telugu and English.
3. Confirm the icon set and its licence.
4. Confirm the final primitive list from shadcn/ui.
5. Confirm the breakpoint set and the 360px minimum on real devices.
6. Choose the accessibility test tool and the manual screen-reader test plan.
7. Confirm the Telugu date format and month names with a reviewer.
