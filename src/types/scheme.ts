// Government Schemes, Eligibility Rules, Sources, Documents, and Steps
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
  field_name: string; // matches profile field: 'age_band', 'income_band', etc.
  rule_type: 'threshold' | 'category' | 'flag' | 'age_range' | 'location';
  operator: RuleOperator;
  value: string; // parsed by deterministic engine based on rule_type
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
  publisher: string; // e.g., AP Welfare Dept, MeitY
  document_type: 'GO' | 'portal' | 'news';
  retrieved_at: string; // ISO date
  verified_at: string | null; // ISO date or null if pending
  verified_by: string; // verifier reference/officer id
}

export interface SchemeDocument {
  id: string;
  scheme_id: string;
  document_name_en: string;
  document_name_te: string;
  document_name_hi: string;
  requirement: 'mandatory' | 'optional';
  notes_en?: string;
  notes_te?: string;
  notes_hi?: string;
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
  description_en: string;
  description_te: string;
  description_hi: string;
  application_open_on?: string | null;
  application_close_on?: string | null;
  is_published: boolean;
  source: SchemeSource;
  rules: SchemeRule[];
  documents: SchemeDocument[];
  steps: ApplicationStep[];
}
