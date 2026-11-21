# Database Policies

Owner: Agent 05
Status: PENDING

Source: ClaimSaathi/DATABASE_SCHEMA.md (status there: PROPOSED – NOT APPROVED). Every rule below is a proposal taken from that file. Nothing here is implemented, migrated or verified.

## 1. Tables in scope

Named in DATABASE_SCHEMA.md §3:

1. citizen_profiles (§3.1)
2. household_members (§3.2)
3. government_schemes (§3.3)
4. scheme_versions (§3.4)
5. scheme_eligibility_rules (§3.5)
6. scheme_sources (§3.6)
7. scheme_documents (§3.7)
8. scheme_steps (§3.8, proposed; not in the original requested list)
9. eligibility_assessments (§3.9)
10. application_tracking (§3.10, future)
11. admin_roles (§3.11)
12. audit_log (§3.12)

Mapped alias (§8, not a separate table): sample_profiles → citizen_profiles with `is_sample = true` (PROPOSED).

## 2. Policy matrix

Roles: citizen-owner = authenticated user who owns the profile row; public = anonymous or any signed-in visitor; admin = user with an active row in admin_roles; service-role = Vercel serverless functions only.

| Table | Role | Operation | Rule |
|---|---|---|---|
| citizen_profiles | citizen-owner | SELECT, INSERT, UPDATE, DELETE | Only where `owner_user_id = auth.uid()` (§4). |
| citizen_profiles | public | any | None. Anonymous session access is an open decision (§4 below). |
| citizen_profiles | admin | any | None. No blanket read of citizen data (PROPOSED). |
| citizen_profiles | service-role | any | Inside serverless functions only. |
| household_members | citizen-owner | SELECT, INSERT, UPDATE, DELETE | Allowed only through the owning profile (`profile_id` belongs to the caller's profile). Members follow their profile. |
| household_members | public / admin | any | None. |
| household_members | service-role | any | Serverless only. |
| government_schemes | public (anon and citizen) | SELECT | Only where `is_published = true`. |
| government_schemes | admin | INSERT, UPDATE | Scheme data write (direct vs. function-only is an open decision). |
| government_schemes | service-role | any | Serverless only. |
| scheme_versions | public | SELECT | Only where the parent scheme is published. |
| scheme_versions | admin | INSERT, UPDATE | Publish step via function (PROPOSED). |
| scheme_eligibility_rules | public | SELECT | Only where the parent scheme is published. |
| scheme_eligibility_rules | admin | INSERT, UPDATE | Every rule must carry `source_id` (§6). |
| scheme_sources | public | SELECT | Only where the parent scheme is published. |
| scheme_sources | admin | INSERT, UPDATE | Must record `verified_at` and `verified_by` (admin reference only). |
| scheme_documents | public | SELECT | Only where the parent scheme is published. |
| scheme_documents | admin | INSERT, UPDATE | Bilingual rows. |
| scheme_steps | public | SELECT | Only where the parent scheme is published. |
| scheme_steps | admin | INSERT, UPDATE | Official link via `official_link_id` only. |
| eligibility_assessments | citizen-owner | SELECT | Own rows only. |
| eligibility_assessments | citizen-owner / public | INSERT | Not stated in §4 for citizens; the §4 table gives INSERT to service-role only. Open. |
| eligibility_assessments | admin | any | None. |
| eligibility_assessments | service-role | INSERT | Only function-written. |
| application_tracking | citizen-owner | SELECT, INSERT, UPDATE, DELETE | Own rows only (§4 says "own rows only"; the §4 row also says serverless only for writes, so write path is open). |
| application_tracking | public / admin | any | None. |
| application_tracking | service-role | any | Serverless only. |
| admin_roles | admin | SELECT | Own role row only. |
| admin_roles | citizen-owner / public | any | None. |
| admin_roles | service-role | any | Serverless only. |
| audit_log | admin | SELECT | PROPOSED. |
| audit_log | service-role | INSERT | Append-only; written by serverless functions on every admin write. |
| audit_log | citizen-owner / public | any | None. |

Cross-cutting rules (from §4 and §5):
- The service-role key is never sent to the browser. It lives only in Vercel environment variables read by serverless functions.
- No policy may expose `is_sample = false` profile data to another user.
- Every table holding user data has RLS enabled.
- No column, index, log field or audit payload may hold Aadhaar, PAN, voter ID, ration card, phone, email or bank data.

## 3. Verification status

Each capability below is unverified. Nothing in the research files confirms it. Each is marked PENDING VERIFICATION.

- Neon Data API (PostgREST-style client access from the browser): PENDING VERIFICATION
- Neon Auth / JWT claims available to RLS (`auth.uid()` resolution): PENDING VERIFICATION
- RLS policy enforcement on each table in §2, including the cross-user isolation tests: PENDING VERIFICATION
- Neon free-tier storage and connection limits (DATABASE_SCHEMA.md §7 and §9.10): PENDING VERIFICATION
- Citizen-profile band lists and district code source list (DATABASE_SCHEMA.md §3.1): PENDING VERIFICATION

## 4. Open decisions

Taken from DATABASE_SCHEMA.md §9 and the PENDING markers in §3–§7. None is decided.

1. Anonymous (no-login) profile sessions for the MVP: allowed or not? If allowed, how is RLS applied without `auth.uid()`? (§3.1 `owner_user_id` NULL "PENDING APPROVAL"; §9.3)
2. Admin writes: direct under RLS (§4 says INSERT/UPDATE) or only through serverless functions (§4 publish "via function")? The file gives both; choose one.
3. Auth provider, and how `owner_user_id` and `admin_roles.user_ref` are populated: PENDING APPROVAL (§3.11, §9.2).
4. Whether citizens may INSERT into `eligibility_assessments` directly, or only service-role writes (§4 gives INSERT to service-role only).
5. Whether `application_tracking` writes go through serverless functions or direct under RLS (§4 says "own rows only" for reads and "serverless only" for the service role, leaving the citizen write path unclear).
6. Whether admins get any read of citizen profiles (§4 PROPOSED: none; "to be confirmed").
7. Whether `sample_profiles` stays a separate table or becomes a flag on `citizen_profiles` (§8 and §9.1, proposed flag).
8. Band lists and thresholds for income, land, age and education (§3.1, §3.2, §9.4).
9. `rule_type` and `operator` sets cover all AP and central source rules? (§9.5)
10. Whether `eligibility_assessments` is stored at all for the MVP, and its retention period (§3.9, §9.6).
11. Whether `scheme_steps` is approved (§9.7).
12. Where sensitive-ID validation runs: function level only, or also a DB constraint (§5, §9.8).
13. How `profile_snapshot_id` is stored, since no snapshot table is listed (§3.9, §9.9).
14. Migration folder location (§7).
15. Neon free-tier limits before sizing history tables (§9.10).

## 5. Service-role usage rule

- Service-role or owner credentials must never reach browser code.
- Privileged operations go through minimal protected serverless functions only.
- The service role may be used only inside those functions.
