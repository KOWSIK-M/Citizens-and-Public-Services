-- =============================================================================
-- ClaimSaathi — Migration 001: Core Welfare Schema, Coarse-Band Constraints,
-- Row-Level Security (RLS) Policies, and Immutable Append-Only Audit Trigger
-- Target: Neon PostgreSQL (PostgreSQL 15+)
-- Guardrails:
--   1. ZERO Aadhaar, PAN, Voter ID, phone, email, exact address, or bank columns.
--   2. Coarse categorical bands only, enforced via database CHECK constraints.
--   3. Rules stored strictly as editable rows (`scheme_rules`), never hardcoded.
--   4. Public read restricted to `is_published = true`; `audit_log` is immutable.
-- =============================================================================

BEGIN;

-- 1. Government Schemes Master Table
CREATE TABLE IF NOT EXISTS schemes (
    id                           TEXT PRIMARY KEY,
    scheme_code                  TEXT NOT NULL UNIQUE,
    name_en                      TEXT NOT NULL,
    name_te                      TEXT NOT NULL,
    name_hi                      TEXT NOT NULL,
    level                        TEXT NOT NULL CHECK (level IN ('central', 'state')),
    category                     TEXT NOT NULL CHECK (
                                     category IN (
                                         'scholarship',
                                         'pension',
                                         'farm',
                                         'health',
                                         'housing',
                                         'employment',
                                         'women_child',
                                         'other'
                                     )
                                 ),
    status                       TEXT NOT NULL DEFAULT 'open' CHECK (
                                     status IN ('open', 'closed', 'not_yet_open', 'unknown')
                                 ),
    benefit_summary_en           TEXT NOT NULL,
    benefit_summary_te           TEXT NOT NULL,
    benefit_summary_hi           TEXT NOT NULL,
    estimated_annual_benefit_inr INTEGER CHECK (estimated_annual_benefit_inr IS NULL OR estimated_annual_benefit_inr >= 0),
    health_cover_lakhs           NUMERIC(6, 2) CHECK (health_cover_lakhs IS NULL OR health_cover_lakhs >= 0),
    description_en               TEXT NOT NULL,
    description_te               TEXT NOT NULL,
    description_hi               TEXT NOT NULL,
    application_open_on          DATE,
    application_close_on         DATE,
    deadline_label_en            TEXT,
    deadline_label_te            TEXT,
    deadline_label_hi            TEXT,
    sla_days                     INTEGER CHECK (sla_days IS NULL OR sla_days >= 0),
    status_check_url             TEXT,
    grievance_helpline           TEXT,
    followup_en                  TEXT,
    followup_te                  TEXT,
    followup_hi                  TEXT,
    is_published                 BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_scheme_dates CHECK (
        application_open_on IS NULL
        OR application_close_on IS NULL
        OR application_close_on >= application_open_on
    )
);

CREATE INDEX IF NOT EXISTS idx_schemes_published_category
    ON schemes (is_published, level, category);

-- 2. Official Government Sources & Verification Provenance
CREATE TABLE IF NOT EXISTS scheme_sources (
    id            TEXT PRIMARY KEY,
    scheme_id     TEXT NOT NULL REFERENCES schemes (id) ON DELETE CASCADE,
    source_url    TEXT NOT NULL CHECK (source_url ~ '^https?://'),
    publisher     TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('GO', 'portal', 'news')),
    go_reference  TEXT,
    retrieved_at  DATE NOT NULL,
    verified_at   DATE, -- NULL indicates PENDING VERIFICATION (enforced by FR-09)
    verified_by   TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_verified_after_retrieved CHECK (
        verified_at IS NULL OR verified_at >= retrieved_at
    )
);

CREATE INDEX IF NOT EXISTS idx_scheme_sources_scheme_id
    ON scheme_sources (scheme_id);

-- 3. Editable Deterministic Eligibility Rules (Data, Never Code)
CREATE TABLE IF NOT EXISTS scheme_rules (
    rule_id         TEXT PRIMARY KEY,
    scheme_id       TEXT NOT NULL REFERENCES schemes (id) ON DELETE CASCADE,
    source_id       TEXT NOT NULL REFERENCES scheme_sources (id) ON DELETE RESTRICT,
    field_name      TEXT NOT NULL CHECK (
                        field_name IN (
                            'age_band',
                            'state_code',
                            'district_code',
                            'income_band',
                            'occupation_category',
                            'social_category',
                            'land_holding_band',
                            'household_has_student',
                            'has_school_student',
                            'household_has_post_matric_student',
                            'has_college_student',
                            'is_widow_or_single_woman',
                            'has_disability',
                            'is_tenant_farmer_ccrc',
                            'has_white_ration_card'
                        )
                    ),
    rule_type       TEXT NOT NULL CHECK (
                        rule_type IN ('threshold', 'category', 'flag', 'age_range', 'location')
                    ),
    operator        TEXT NOT NULL CHECK (
                        operator IN ('eq', 'neq', 'in', 'lte', 'gte', 'between')
                    ),
    value           TEXT NOT NULL,
    condition_group TEXT, -- Optional OR-branch group identifier (e.g. 'pension_vulnerability')
    reason_en       TEXT NOT NULL,
    reason_te       TEXT NOT NULL,
    reason_hi       TEXT NOT NULL,
    rule_version    INTEGER NOT NULL DEFAULT 1 CHECK (rule_version >= 1),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheme_rules_scheme_id
    ON scheme_rules (scheme_id);

-- 4. Scheme Required Documents & Conditional Personalisation Rules
CREATE TABLE IF NOT EXISTS scheme_documents (
    id               TEXT PRIMARY KEY,
    scheme_id        TEXT NOT NULL REFERENCES schemes (id) ON DELETE CASCADE,
    canonical_key    TEXT, -- Cross-scheme deduplication key for Single Sachivalayam Visit Pack
    document_name_en TEXT NOT NULL,
    document_name_te TEXT NOT NULL,
    document_name_hi TEXT NOT NULL,
    requirement      TEXT NOT NULL CHECK (requirement IN ('mandatory', 'optional')),
    notes_en         TEXT,
    notes_te         TEXT,
    notes_hi         TEXT,
    applies_when     JSONB, -- Optional ConditionalDocumentRule ({ field, values, mode, badge_* })
    sort_order       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_scheme_documents_scheme_id
    ON scheme_documents (scheme_id);

-- 5. Step-by-Step Citizen Application Guidance
CREATE TABLE IF NOT EXISTS application_steps (
    id                  BIGSERIAL PRIMARY KEY,
    scheme_id           TEXT NOT NULL REFERENCES schemes (id) ON DELETE CASCADE,
    step_no             INTEGER NOT NULL CHECK (step_no >= 1),
    title_en            TEXT NOT NULL,
    title_te            TEXT NOT NULL,
    title_hi            TEXT NOT NULL,
    description_en      TEXT NOT NULL,
    description_te      TEXT NOT NULL,
    description_hi      TEXT NOT NULL,
    channel             TEXT NOT NULL CHECK (
                            channel IN ('online', 'offline_office', 'csc_sachivalayam')
                        ),
    official_action_url TEXT CHECK (official_action_url IS NULL OR official_action_url ~ '^https?://'),
    UNIQUE (scheme_id, step_no)
);

CREATE INDEX IF NOT EXISTS idx_application_steps_scheme_id
    ON application_steps (scheme_id, step_no);

-- 6. Coarse-Band Citizen Profiles (Synthetic Demo + Ephemeral Owner Sessions)
-- Privacy Guardrail: Explicitly NO name, Aadhaar, PAN, Voter ID, phone, email, or bank account columns.
CREATE TABLE IF NOT EXISTS citizen_profiles (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_session_id         TEXT, -- Ephemeral session or authenticated subject claim
    age_band                 TEXT NOT NULL DEFAULT 'unknown' CHECK (
                                 age_band IN ('under_18', '18_25', '26_40', '41_60', '60_plus', 'unknown')
                             ),
    state_code               TEXT NOT NULL DEFAULT 'AP' CHECK (state_code = 'AP'),
    district_code            TEXT,
    income_band              TEXT NOT NULL DEFAULT 'unknown' CHECK (
                                 income_band IN ('below_1_2L', '1_2L_to_2_5L', '2_5L_to_5L', 'above_5L', 'unknown')
                             ),
    occupation_category      TEXT NOT NULL DEFAULT 'unknown' CHECK (
                                 occupation_category IN (
                                     'farmer', 'daily_wage', 'student', 'homemaker',
                                     'self_employed', 'unemployed', 'other', 'unknown'
                                 )
                             ),
    social_category          TEXT NOT NULL DEFAULT 'unknown' CHECK (
                                 social_category IN ('OC', 'BC', 'SC', 'ST', 'minority', 'unknown')
                             ),
    land_holding_band        TEXT NOT NULL DEFAULT 'unknown' CHECK (
                                 land_holding_band IN (
                                     'none',
                                     'marginal_under_2_5_acres',
                                     'small_2_5_to_5_acres',
                                     'large_above_5_acres',
                                     'unknown'
                                 )
                             ),
    language_pref            TEXT NOT NULL DEFAULT 'en' CHECK (language_pref IN ('en', 'te', 'hi')),
    has_school_student       TEXT NOT NULL DEFAULT 'unknown' CHECK (has_school_student IN ('yes', 'no', 'unknown')),
    has_college_student      TEXT NOT NULL DEFAULT 'unknown' CHECK (has_college_student IN ('yes', 'no', 'unknown')),
    is_widow_or_single_woman TEXT NOT NULL DEFAULT 'unknown' CHECK (is_widow_or_single_woman IN ('yes', 'no', 'unknown')),
    has_disability           TEXT NOT NULL DEFAULT 'unknown' CHECK (has_disability IN ('yes', 'no', 'unknown')),
    is_tenant_farmer_ccrc    TEXT NOT NULL DEFAULT 'unknown' CHECK (is_tenant_farmer_ccrc IN ('yes', 'no', 'unknown')),
    has_white_ration_card    TEXT NOT NULL DEFAULT 'unknown' CHECK (has_white_ration_card IN ('yes', 'no', 'unknown')),
    is_sample                BOOLEAN NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Immutable Append-Only Admin Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor          TEXT NOT NULL,
    action         TEXT NOT NULL CHECK (
                       action IN (
                           'rule_updated',
                           'source_verified',
                           'source_marked_pending',
                           'publish_toggled',
                           'demo_reset'
                       )
                   ),
    scheme_id      TEXT NOT NULL REFERENCES schemes (id) ON DELETE RESTRICT,
    scheme_code    TEXT NOT NULL,
    rule_id        TEXT,
    previous_value TEXT NOT NULL,
    new_value      TEXT NOT NULL,
    source_note    TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_scheme_created
    ON audit_log (scheme_id, created_at DESC);

-- Prevent UPDATE or DELETE on audit_log (strict append-only ledger)
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is strictly append-only; % operations are prohibited.', TG_OP
        USING ERRCODE = '42501';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON audit_log;
CREATE TRIGGER trg_audit_log_immutable
    BEFORE UPDATE OR DELETE ON audit_log
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_mutation();

-- =============================================================================
-- 8. Row-Level Security (RLS) Enforcement
-- =============================================================================

ALTER TABLE schemes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_sources    ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_rules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_documents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;

-- Public read access strictly limited to published schemes
DROP POLICY IF EXISTS pol_schemes_public_read ON schemes;
CREATE POLICY pol_schemes_public_read ON schemes
    FOR SELECT
    USING (
        is_published = TRUE
        OR current_setting('app.current_role', TRUE) = 'admin'
    );

DROP POLICY IF EXISTS pol_schemes_admin_write ON schemes;
CREATE POLICY pol_schemes_admin_write ON schemes
    FOR ALL
    USING (current_setting('app.current_role', TRUE) = 'admin')
    WITH CHECK (current_setting('app.current_role', TRUE) = 'admin');

-- Child scheme tables inherit parent publication visibility
DROP POLICY IF EXISTS pol_sources_public_read ON scheme_sources;
CREATE POLICY pol_sources_public_read ON scheme_sources
    FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM schemes s WHERE s.id = scheme_sources.scheme_id AND s.is_published = TRUE)
        OR current_setting('app.current_role', TRUE) = 'admin'
    );

DROP POLICY IF EXISTS pol_sources_admin_write ON scheme_sources;
CREATE POLICY pol_sources_admin_write ON scheme_sources
    FOR ALL
    USING (current_setting('app.current_role', TRUE) = 'admin')
    WITH CHECK (current_setting('app.current_role', TRUE) = 'admin');

DROP POLICY IF EXISTS pol_rules_public_read ON scheme_rules;
CREATE POLICY pol_rules_public_read ON scheme_rules
    FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM schemes s WHERE s.id = scheme_rules.scheme_id AND s.is_published = TRUE)
        OR current_setting('app.current_role', TRUE) = 'admin'
    );

DROP POLICY IF EXISTS pol_rules_admin_write ON scheme_rules;
CREATE POLICY pol_rules_admin_write ON scheme_rules
    FOR ALL
    USING (current_setting('app.current_role', TRUE) = 'admin')
    WITH CHECK (current_setting('app.current_role', TRUE) = 'admin');

DROP POLICY IF EXISTS pol_docs_public_read ON scheme_documents;
CREATE POLICY pol_docs_public_read ON scheme_documents
    FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM schemes s WHERE s.id = scheme_documents.scheme_id AND s.is_published = TRUE)
        OR current_setting('app.current_role', TRUE) = 'admin'
    );

DROP POLICY IF EXISTS pol_docs_admin_write ON scheme_documents;
CREATE POLICY pol_docs_admin_write ON scheme_documents
    FOR ALL
    USING (current_setting('app.current_role', TRUE) = 'admin')
    WITH CHECK (current_setting('app.current_role', TRUE) = 'admin');

DROP POLICY IF EXISTS pol_steps_public_read ON application_steps;
CREATE POLICY pol_steps_public_read ON application_steps
    FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM schemes s WHERE s.id = application_steps.scheme_id AND s.is_published = TRUE)
        OR current_setting('app.current_role', TRUE) = 'admin'
    );

DROP POLICY IF EXISTS pol_steps_admin_write ON application_steps;
CREATE POLICY pol_steps_admin_write ON application_steps
    FOR ALL
    USING (current_setting('app.current_role', TRUE) = 'admin')
    WITH CHECK (current_setting('app.current_role', TRUE) = 'admin');

-- Citizen Profiles: Public can read synthetic `is_sample = true` presets;
-- real session rows are isolated strictly to `app.session_id` (even admins cannot browse citizen rows).
DROP POLICY IF EXISTS pol_profiles_isolation ON citizen_profiles;
CREATE POLICY pol_profiles_isolation ON citizen_profiles
    FOR ALL
    USING (
        is_sample = TRUE
        OR (
            owner_session_id IS NOT NULL
            AND owner_session_id = current_setting('app.session_id', TRUE)
        )
    )
    WITH CHECK (
        is_sample = TRUE
        OR (
            owner_session_id IS NOT NULL
            AND owner_session_id = current_setting('app.session_id', TRUE)
        )
    );

-- Audit Log: Admins may SELECT and INSERT only; UPDATE/DELETE blocked by both RLS and trigger
DROP POLICY IF EXISTS pol_audit_admin_read ON audit_log;
CREATE POLICY pol_audit_admin_read ON audit_log
    FOR SELECT
    USING (current_setting('app.current_role', TRUE) = 'admin');

DROP POLICY IF EXISTS pol_audit_admin_insert ON audit_log;
CREATE POLICY pol_audit_admin_insert ON audit_log
    FOR INSERT
    WITH CHECK (current_setting('app.current_role', TRUE) IN ('admin', 'service_role'));

COMMIT;
