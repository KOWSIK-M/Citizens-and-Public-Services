# ClaimSaathi – Technology Decisions

Status: Foundation document. Items marked **PENDING APPROVAL** are not yet decided. Items marked **PENDING VERIFICATION** have no evidence in the research files or in our own checks.

## 1. Confirmed stack (fixed architecture)

| Area | Choice | Reason |
|---|---|---|
| Frontend framework | React + Vite + TypeScript | Fast dev loop, static build suits Vercel, type safety for rule/scheme models |
| Styling | Tailwind CSS | Quick consistent styling; utility classes fit a small team |
| UI components | shadcn/ui | Accessible primitives copied into repo; no lock-in to a runtime UI library |
| Database | Neon PostgreSQL | Managed Postgres; relational model suits schemes, rules, sources |
| Hosting | Vercel | Hosts static SPA and serverless functions in one place |
| API layer | Vercel serverless functions | Keeps API keys server-side; avoids a separate backend service |
| AI | Claude API (Haiku), server-side only | Per AI agent description; used for extraction, chat, explanation |
| Speech | Provider TBD (see section 4) | Regional-language voice is a goal; no provider chosen |

## 2. Rejected stacks and components

| Rejected | Reason |
|---|---|
| Spring Boot backend | Not in fixed architecture; adds a second runtime |
| Express backend | Not in fixed architecture; serverless functions cover the need |
| Supabase (as backend and DB) | Out of scope; suggested by one research dossier. Neon is the chosen database |
| Next.js | Out of scope; suggested by one research dossier. Vite SPA is the chosen frontend |
| FastAPI (Python) | Out of scope; suggested by one research dossier |
| PydanticAI | Out of scope; suggested by one research dossier |
| LangGraph | Out of scope; suggested by one research dossier. Rules are data plus deterministic code |

## 3. Cost and free-tier notes

No service is assumed to be free. Every limit below is UNVERIFIED until checked against the provider's current pricing page.

| Service | What we need to know | Status |
|---|---|---|
| Claude API (Haiku) | Price per token, rate limits, free credits | PENDING VERIFICATION – not in research files |
| Neon PostgreSQL | Free-tier storage, compute hours, connection limits | PENDING VERIFICATION – not in research files |
| Vercel | Free-tier function invocations, bandwidth, function duration | PENDING VERIFICATION – not in research files |
| Sarvam Saaras v4 (STT) | Free credit amount | PENDING VERIFICATION – Dossier A states "₹100 free credits (~60 voice sessions)"; not checked |
| Sarvam Bulbul v4 Flash (TTS) | Free tier | PENDING VERIFICATION – Dossier A states a ₹100 credit; not checked |
| Bhashini | Access terms and limits | PENDING VERIFICATION |
| Self-hosted speech models | Hosting cost and GPU needs | PENDING VERIFICATION |

Rule: do not assume any service is free for the demo until its current limits are verified and recorded here.

## 4. Speech provider (PENDING APPROVAL)

| Option | Source in research | Notes | Decision |
|---|---|---|---|
| Sarvam Saaras v4 ASR (te-IN) | Dossier A | Telugu code-mix support claimed; credits unverified | PENDING APPROVAL |
| Bhashini | Dossier A and B | Government platform; access terms unverified | PENDING APPROVAL |
| IndicConformer-600M | Dossier A/B | Open model; self-host effort unknown | PENDING APPROVAL |
| Sarvam Bulbul v4 Flash (TTS) | Dossier A | Credits unverified | PENDING APPROVAL |
| Indic Parler-TTS | Dossier A/B | Open model; self-host effort unknown | PENDING APPROVAL |
| IndicTrans2 | Dossier A/B | Translation option; role not decided | PENDING APPROVAL |
| Saarika | Listed as deprecated by dossiers | Not to be used | Rejected |

Voice input stays optional for MVP until a provider is approved.

## 5. Other decisions

| Decision | Status |
|---|---|
| Product name "ClaimSaathi" vs "Sahaya" (Dossier A) | PENDING APPROVAL |
| Admin authentication method | PENDING APPROVAL |
| Rate-limit mechanism for serverless functions | PENDING APPROVAL |
| Retention policy for user descriptions and audio | PENDING APPROVAL |
| MVP scheme list (AP state plus central) | PENDING APPROVAL – scheme facts unverified |
| Hosting account setup (Vercel, Neon, Claude API keys) | PENDING APPROVAL |
| Whether deadline reminders are in MVP | PENDING APPROVAL |
| Use of Row-Level Security policies in Neon | PENDING APPROVAL – design not done |
| Scheme rules stored as editable data (JSON/DB rows) | Confirmed in guardrails; storage format PENDING APPROVAL |

## 6. Alternatives considered

| Area | Alternative | Why not chosen |
|---|---|---|
| Backend | Separate Node or Python server | Extra service to host and secure; serverless covers needs |
| Database | Supabase Postgres (with pgvector) | Out of scope per project decision |
| Eligibility engine | LLM-only matching | Unexplainable and risky; rules must be deterministic and visible |
| Eligibility engine | Dedicated rules engine library | Not evaluated in research; PENDING APPROVAL if needed |
| Frontend | Next.js | Out of scope per project decision |
| Scheme data | Hard-coded in code | Violates editable-data guardrail |

## 7. Known limitations

- AP scheme facts come from one dossier that self-stamps "VERIFIED NOV 2026"; treated as UNVERIFIED.
- Several supporting sources are news sites, not government orders (G.O.s).
- Central scheme official URLs have not been verified by the team.
- Telugu speech accuracy across AP dialects is untested (dossier recommends real-user validation).
- Speech and AI calls depend on external provider availability.
- Serverless cold starts and function time limits may affect voice flows (PENDING VERIFICATION).
- No public eligibility-rules API found; scheme data must be curated manually.
- VB-G RAM G Act 2025 (replacing MGNREGA from 1 July 2026) needs AP state rule re-verification.

## 8. Decisions requiring approval (summary)

- PENDING APPROVAL: product name (ClaimSaathi or Sahaya)
- PENDING APPROVAL: speech-to-text provider
- PENDING APPROVAL: text-to-speech provider
- PENDING APPROVAL: Claude pricing and budget check
- PENDING APPROVAL: Neon free-tier check and plan
- PENDING APPROVAL: Vercel free-tier check and plan
- PENDING APPROVAL: MVP scheme list
- PENDING APPROVAL: admin authentication method
- PENDING APPROVAL: rate-limit mechanism
- PENDING APPROVAL: hosting account setup
