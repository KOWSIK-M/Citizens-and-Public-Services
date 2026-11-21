-- ClaimSaathi v4.0 Migration: JWT Authentication, RBAC Authorization, Personalised Profiles,
-- Persistent Application Tracking, Recent Govt Scheme Notifications & Gmail SMTP Logs
-- Target: Neon Serverless PostgreSQL 15+

BEGIN;

-- 1. Authenticated Accounts (Simple JWT + Role-Based Authorization: 'citizen' | 'admin')
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE CHECK (char_length(email) BETWEEN 5 AND 160),
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 80),
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Personalised Coarse Citizen Profile + Opt-In Gmail Notification Preferences
-- Guardrail: Coarse eligibility bands only — zero Aadhaar, PAN, Voter ID, phone, or bank numbers.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  age_band TEXT NOT NULL DEFAULT 'unknown',
  state_code TEXT NOT NULL DEFAULT 'AP',
  district_code TEXT NOT NULL DEFAULT 'unknown',
  income_band TEXT NOT NULL DEFAULT 'unknown',
  occupation_category TEXT NOT NULL DEFAULT 'unknown',
  social_category TEXT NOT NULL DEFAULT 'unknown',
  land_holding_band TEXT NOT NULL DEFAULT 'unknown',
  language_pref TEXT NOT NULL DEFAULT 'en' CHECK (language_pref IN ('en', 'te', 'hi')),
  household_members JSONB NOT NULL DEFAULT '[]'::jsonb,
  has_school_student TEXT NOT NULL DEFAULT 'unknown' CHECK (has_school_student IN ('yes', 'no', 'unknown')),
  has_college_student TEXT NOT NULL DEFAULT 'unknown' CHECK (has_college_student IN ('yes', 'no', 'unknown')),
  is_widow_or_single_woman TEXT NOT NULL DEFAULT 'unknown' CHECK (is_widow_or_single_woman IN ('yes', 'no', 'unknown')),
  has_disability TEXT NOT NULL DEFAULT 'unknown' CHECK (has_disability IN ('yes', 'no', 'unknown')),
  is_tenant_farmer_ccrc TEXT NOT NULL DEFAULT 'unknown' CHECK (is_tenant_farmer_ccrc IN ('yes', 'no', 'unknown')),
  has_white_ration_card TEXT NOT NULL DEFAULT 'unknown' CHECK (has_white_ration_card IN ('yes', 'no', 'unknown')),
  gmail_address TEXT,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Persistent User Tracked Applications (Powers Availed vs Eligible Sector Visualization & Lifecycle Follow-ups)
CREATE TABLE IF NOT EXISTS public.user_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scheme_id TEXT NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'documents_prep' CHECK (
    stage IN (
      'upcoming_notify',
      'documents_prep',
      'submitted',
      'receipt_saved',
      'verification_pending',
      'sanctioned',
      'rejected'
    )
  ),
  reference_note TEXT NOT NULL DEFAULT '' CHECK (char_length(reference_note) <= 140),
  notify_when_opens BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  expected_sla_days INTEGER NOT NULL DEFAULT 21,
  outcome_checked_at TIMESTAMPTZ,
  rejection_reason_code TEXT,
  checked_documents JSONB NOT NULL DEFAULT '{}'::jsonb,
  reminder_downloaded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, scheme_id)
);

-- 4. Recent Government Scheme Launches, Start/End Date Notices & Policy Updates
CREATE TABLE IF NOT EXISTS public.scheme_notifications (
  id TEXT PRIMARY KEY,
  scheme_id TEXT REFERENCES public.schemes(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (
    notification_type IN ('recent_scheme', 'window_opening', 'deadline_closing', 'policy_update')
  ),
  title_en TEXT NOT NULL,
  title_te TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  body_en TEXT NOT NULL,
  body_te TEXT NOT NULL,
  body_hi TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT 'other',
  start_date DATE,
  end_date DATE,
  official_url TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Per-User Notification Read Tracking
CREATE TABLE IF NOT EXISTS public.user_notification_reads (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_id TEXT NOT NULL REFERENCES public.scheme_notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, notification_id)
);

-- 6. SMTP Email Dispatch Audit Log (Deadlines & Scheme Updates Sent to Opt-In Gmail)
CREATE TABLE IF NOT EXISTS public.email_dispatch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'preview_only', 'failed')),
  provider_message_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_applications_user_stage
  ON public.user_applications (user_id, stage, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_scheme_notifications_published
  ON public.scheme_notifications (is_published, published_at DESC);

COMMIT;
