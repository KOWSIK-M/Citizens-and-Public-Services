-- ClaimSaathi v3.0 Migration: Local Citizen Community Chat, Welfare Gap Proposals & 10-Vote Escalation
-- Guardrails:
-- 1. Zero PII columns (no name, email, phone, Aadhaar, IP address, or bank account).
-- 2. Authors represented strictly by coarse persona labels (e.g., 'Tenant Farmer • Kurnool').
-- 3. Deduplicated voting uses an irreversible SHA-256 hash of a random browser session UUID.

BEGIN;

CREATE TABLE IF NOT EXISTS public.community_proposals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 8 AND 160),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 15 AND 700),
  category TEXT NOT NULL CHECK (
    category IN ('scholarship', 'pension', 'farm', 'health', 'housing', 'employment', 'women_child', 'other')
  ),
  district TEXT NOT NULL DEFAULT 'All AP',
  target_cohort TEXT NOT NULL DEFAULT 'Underserved Household',
  escalation_target TEXT NOT NULL DEFAULT 'ap_gsws_1902' CHECK (
    escalation_target IN ('ap_gsws_1902', 'district_collectorate', 'ngo_legal_aid')
  ),
  author_persona_label TEXT NOT NULL CHECK (char_length(author_persona_label) BETWEEN 3 AND 80),
  upvotes_count INTEGER NOT NULL DEFAULT 1 CHECK (upvotes_count >= 0),
  escalation_threshold INTEGER NOT NULL DEFAULT 10 CHECK (escalation_threshold >= 1),
  is_validated BOOLEAN NOT NULL DEFAULT TRUE,
  is_sample BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_proposal_votes (
  proposal_id TEXT NOT NULL REFERENCES public.community_proposals(id) ON DELETE CASCADE,
  voter_hash TEXT NOT NULL CHECK (char_length(voter_hash) BETWEEN 16 AND 128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (proposal_id, voter_hash)
);

CREATE TABLE IF NOT EXISTS public.community_messages (
  id TEXT PRIMARY KEY,
  district TEXT NOT NULL DEFAULT 'All AP',
  topic_category TEXT NOT NULL DEFAULT 'general',
  author_persona_label TEXT NOT NULL CHECK (char_length(author_persona_label) BETWEEN 3 AND 80),
  message_body TEXT NOT NULL CHECK (char_length(message_body) BETWEEN 5 AND 600),
  helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  linked_proposal_id TEXT REFERENCES public.community_proposals(id) ON DELETE SET NULL,
  is_sample BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_proposals_district_votes
  ON public.community_proposals (district, upvotes_count DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_messages_district_created
  ON public.community_messages (district, created_at DESC);

COMMIT;
