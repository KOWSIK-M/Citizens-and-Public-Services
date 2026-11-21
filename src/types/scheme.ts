// Government Schemes, Eligibility Rules, Sources, Documents, Steps, and Audit Logs
// Guardrails: public scheme data only; rules are editable data, not hardcoded logic.

export type SchemeLevel = 'central' | 'state';

export type SchemeCategory =
  | 'scholarship'
  | 'pension'
  | 'farm'
  | 'health'
  | 'housing'
  | 'employment'
  | 'women_child'
  | 'other';

export type SchemeStatus = 'open' | 'closed' | 'not_yet_open' | 'unknown';

export type RuleOperator = 'eq' | 'neq' | 'in' | 'lte' | 'gte' | 'between';

export interface SchemeRule {
  rule_id: string; // e.g., 'AP-PEN-001-R01'
  field_name: string; // matches profile field or computed household flag
  rule_type: 'threshold' | 'category' | 'flag' | 'age_range' | 'location';
  operator: RuleOperator;
  value: string; // parsed by deterministic engine based on rule_type & operator
  /**
   * Optional OR-group identifier. Rules sharing the same `condition_group`
   * form an alternative eligibility branch (e.g., age >= 60 OR widow OR disability).
   * If ANY rule in the group matches, the group is satisfied.
   */
  condition_group?: string;
  reason_en: string; // plain-language match reason
  reason_te: string;
  reason_hi: string;
  source_id: string;
  rule_version: number;
}

export interface SchemeSource {
  id: string;
  scheme_id: string;
  source_url: string; // official primary link
  publisher: string; // e.g., SERP AP, Dept of School Education
  document_type: 'GO' | 'portal' | 'news';
  go_reference?: string; // e.g., 'G.O.Ms.No. 43, Social Welfare Dept'
  retrieved_at: string; // ISO date
  verified_at: string | null; // ISO date or null if PENDING VERIFICATION
  verified_by: string; // verifier reference/officer id
}

export interface ConditionalDocumentRule {
  field: string;
  values: string[];
  /**
   * 'promote_mandatory': promotes an optional doc to mandatory for matching profiles
   * 'highlight_relevant': highlights doc as the primary variant for matching profiles
   * 'hide_if_unmatched': hides a variant unless profile matches or is unknown
   */
  mode: 'promote_mandatory' | 'highlight_relevant' | 'hide_if_unmatched';
  badge_en: string;
  badge_te: string;
  badge_hi: string;
}

export interface SchemeDocument {
  id: string;
  scheme_id: string;
  canonical_key?: string; // e.g., 'white_rice_card', 'bank_passbook_npci' for cross-scheme deduplication
  document_name_en: string;
  document_name_te: string;
  document_name_hi: string;
  requirement: 'mandatory' | 'optional';
  notes_en?: string;
  notes_te?: string;
  notes_hi?: string;
  applies_when?: ConditionalDocumentRule;
}

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

export interface GovernmentScheme {
  id: string;
  scheme_code: string;
  name_en: string;
  name_te: string;
  name_hi: string;
  level: SchemeLevel;
  category: SchemeCategory;
  status: SchemeStatus;
  benefit_summary_en: string;
  benefit_summary_te: string;
  benefit_summary_hi: string;
  estimated_annual_benefit_inr?: number;
  health_cover_lakhs?: number;
  description_en: string;
  description_te: string;
  description_hi: string;
  application_open_on?: string | null;
  application_close_on?: string | null;
  deadline_label_en?: string;
  deadline_label_te?: string;
  deadline_label_hi?: string;
  sla_days?: number;
  status_check_url?: string;
  grievance_helpline?: string;
  followup_en?: string;
  followup_te?: string;
  followup_hi?: string;
  is_published: boolean;
  source: SchemeSource;
  rules: SchemeRule[];
  documents: SchemeDocument[];
  steps: ApplicationStep[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: 'rule_updated' | 'source_verified' | 'source_marked_pending' | 'publish_toggled' | 'demo_reset';
  scheme_id: string;
  scheme_code: string;
  rule_id?: string;
  previous_value: string;
  new_value: string;
  source_note: string;
}
