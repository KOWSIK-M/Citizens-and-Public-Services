# ClaimSaathi – Research Status

Status: Summary of existing research. Nothing in this file is independently verified unless explicitly stated. Every unverified fact is marked **PENDING VERIFICATION**.

## 1. Research files reviewed

| Label | File (root of repo) | Focus |
|---|---|---|
| Dossier A | `claim_what_s_yours_deep_research_technical_architecture_dossier_andhra_pradesh_2026.html` | AP scheme list, architecture options, speech candidates, "Sahaya" direction |
| Dossier B | `claim_what_s_yours_open_source_ai_tooling_research.html` | Open-source tools, datasets, MCP servers, reusable skills |

Method: targeted text search only; full files not read end-to-end in this pass.

## 2. Summary by area

### 2.1 Problem and ecosystem (Dossier A)
- Dossier A states the core problem is eligibility reasoning and last-mile friction, not catalogue volume.
- It describes existing portals as rigid directories or ungrounded chatbots.
- It states no Indian or AP portal exposes an open public eligibility-rules API (PENDING VERIFICATION of the claim's completeness).
- It names myScheme and several central portals as discovery sources (see section 4).

### 2.2 AP state schemes (Dossier A) – ALL PENDING VERIFICATION
Figures below are as stated in Dossier A. Dossier A self-stamps "VERIFIED NOV 2026"; we treat this as UNVERIFIED. Several supporting sources are news sites, not G.O.s.

| Scheme (as named) | Stated benefit | Stated eligibility | Status |
|---|---|---|---|
| Talliki Vandanam | Rs 15,000/yr | Income ≤ 1.20L rural / ≤ 1.44L urban; land < 3 acres wet or < 10 dry (unit for dry land as stated in brief; to confirm); electricity < 300 units/month | PENDING VERIFICATION |
| AP Post-Matric Scholarship (MTF) | Up to Rs 20,000/yr | Family income ≤ 2.5L | PENDING VERIFICATION |
| Annadata Sukhibhava | Rs 20,000/yr (Rs 14,000 state + Rs 6,000 central) | Not recorded in research summary | PENDING VERIFICATION |
| Deepam 2.0 | 3 free 14.2 kg LPG cylinders/yr | Not recorded | PENDING VERIFICATION |
| NTR Bharosa Pension | Rs 4,000 / 6,000 / 10,000 / 15,000 per month by category | G.O. Ms. No. 43, 13.06.2024 (cited) | PENDING VERIFICATION |
| Dr. NTR Vaidya Seva (Universal Health Policy) | Up to Rs 25L per family per yr | Income ≤ 5L; G.O. Ms. No. 122, 9 Sep 2025 (cited); rollout in transition | PENDING VERIFICATION |

Not yet launched per Dossier A (as of its stated date):
- Ada Bidda Nidhi (Rs 1,500/month stated)
- Yuva Galam / Nirudyoga Bruthi (Rs 3,000/month stated)

Status: PENDING VERIFICATION; do not show to users as active.

### 2.3 Central schemes (Dossier A) – ALL PENDING VERIFICATION
Named in Dossier A; amounts and rules not captured in this pass:

| Scheme | Note |
|---|---|
| NMMSS | Rs 12,000/yr stated; parental income ≤ 3.5L stated |
| PM-KISAN | Named |
| PMFBY (crop insurance) | Named |
| PMMVY 2.0 | Named |
| Sukanya Samriddhi | Named |
| PM-JAY | Named |
| PMAY-G / PMAY-U 2.0 | Named |
| IGNOAPS | Named |
| APY | Named |
| PM Vishwakarma | Named |
| PM SVANidhi | Named |
| PMJDY | Named |
| PMSBY / PMJJBY | Named |
| PMMY | Named |
| VB-G RAM G Act 2025 | Replaces MGNREGA from 1 July 2026 per Dossier A; AP state rules need re-verification |

### 2.4 Architecture and stack (Dossiers A and B)
- Dossier A proposes a Telugu voice-first, hybrid neuro-symbolic navigator named "Sahaya" (Direction 1), with a five-stage pipeline (voice/text intake → PII shield → matching → explanation → checklist/reminders).
- Dossier A and Dossier B both contain stacks we have rejected: Supabase/PostgreSQL with pgvector, FastAPI, Render/Vercel mixes, and LangGraph/PydanticAI-style agent tooling (see TECH_DECISIONS.md section 2).
- Dossier B proposes a React + Vite SPA with Python FastAPI backend, and a schemes dataset with Supabase schema. Reuse is not adopted; PENDING APPROVAL for any dataset use.

### 2.5 Speech (Dossiers A and B)
- Sarvam Saaras v4 ASR (te-IN): listed as candidate; "₹100 free credits (~60 voice sessions)" stated by Dossier A – PENDING VERIFICATION.
- Sarvam Bulbul v4 Flash TTS: candidate; free tier stated as ₹100 credit – PENDING VERIFICATION.
- Bhashini, IndicConformer-600M, Indic Parler-TTS, IndicTrans2: candidates – PENDING VERIFICATION.
- Saarika, Sarvam-M and Sarvam-30B: listed as deprecated by the dossiers – treat as not usable.

### 2.6 Open-source and data (Dossier B)
- Dossier B lists a dataset of 2,066 cleaned Indian government schemes (527 central, 1,539 state/UT), described as packaged with a Supabase/PostgreSQL schema. Dataset provenance, licence, and currency: PENDING VERIFICATION.
- A GitHub project "DAbharat/Sahayak" is listed as a reference; licence and fitness: PENDING VERIFICATION.
- Dossier B lists MCP servers and agent skills for developer tooling. Not part of the product architecture.

## 3. Official source links (only as given in the research files)

These are the links that appear in the research files. We have NOT verified that each URL is current, correct, or the official primary source for any scheme.

| Named in research | URL as given | Context in research | Status |
|---|---|---|---|
| myScheme (NeGD / MeitY) | https://www.myscheme.gov.in/ | Discovery portal | PENDING VERIFICATION |
| NGSP | https://services.india.gov.in/ | Central services portal | PENDING VERIFICATION |
| National Scholarships Portal | https://scholarships.gov.in/ | Scholarships | PENDING VERIFICATION |
| DBT Bharat | https://dbtbharat.gov.in/ | Transfer dashboards | PENDING VERIFICATION |
| UMANG | https://web.umang.gov.in/landing | Government app | PENDING VERIFICATION |
| DigiLocker partners | https://www.digilocker.gov.in/web/partners/requesters | Document access | PENDING VERIFICATION |
| APISetu | https://apisetu.gov.in/ | Government APIs | PENDING VERIFICATION |
| SGSW (AP) | https://sgsw.ap.gov.in/ | AP welfare | PENDING VERIFICATION |
| APSEVA (AP) | https://apseva.ap.gov.in/ | AP services | PENDING VERIFICATION |
| BM-SGSW Deepam status (AP) | https://bm-sgsw.ap.gov.in/BM/DeepamStatus | Deepam status check | PENDING VERIFICATION |
| Sarvam model docs | https://docs.sarvam.ai/api/getting-started/models | Speech models and credit claims | PENDING VERIFICATION |

AP G.O. primary-source links (for Talliki Vandanam, Post-Matric, Annadata Sukhibhava, Deepam 2.0, NTR Bharosa, Vaidya Seva): NOT FOUND in the research files. PENDING VERIFICATION.

Central scheme official URLs (PM-KISAN, PMFBY, PMAY, etc.): NOT FOUND in the research files, except portal links above. PENDING VERIFICATION.

## 4. Verification dates

- Dossier A self-stamps "VERIFIED NOV 2026". This is a self-claim and is not accepted as verification.
- No independent "last verified" date exists for any scheme in this project yet.

## 5. Research gaps (explicit)

| Gap | Status |
|---|---|
| Claude/Haiku API pricing and rate limits | NOT in research files – PENDING VERIFICATION |
| Neon free-tier limits | NOT in research files – PENDING VERIFICATION |
| Vercel free-tier limits | NOT in research files – PENDING VERIFICATION |
| Central scheme official URLs and eligibility rules | PENDING VERIFICATION |
| AP G.O. primary-source links | PENDING VERIFICATION |
| Scheme benefit amounts and dates (as checked by us) | PENDING VERIFICATION |
| Speech free-tier figures | PENDING VERIFICATION |
| Telugu ASR accuracy for AP dialects | NOT researched – needs real-user validation |
| Regional languages beyond Telugu | NOT researched |
| Deadlines for each scheme | NOT captured |
| Document lists per scheme | NOT captured |
| Application steps per scheme | NOT captured |
| Legal/disclaimer wording review | NOT done |
| Data-protection requirements for citizen data | NOT researched |

## 6. Next research actions

1. Verify each AP scheme against its G.O. and record the G.O. number, date, and URL.
2. Verify each central scheme against its official portal.
3. Check Claude API, Neon, and Vercel pricing pages and record dates.
4. Check speech provider pricing and terms directly.
5. Confirm the MVP scheme list with the project owner.
