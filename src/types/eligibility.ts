// Eligibility Assessment and Deterministic Rule Matching Types
// Guardrails: Output must say "likely eligible", never "guaranteed" or "approved".

export type MatchStatus = 'likely_eligible' | 'needs_more_info' | 'not_likely_eligible';

export interface RuleEvaluation {
  rule_id: string;
  field_name: string;
  condition_description_en: string;
  condition_description_te: string;
  condition_description_hi: string;
  user_value_description_en: string;
  user_value_description_te: string;
  user_value_description_hi: string;
  status: 'matched' | 'not_matched' | 'unknown';
  reason_en: string;
  reason_te: string;
  reason_hi: string;
}

export interface SchemeMatchResult {
  scheme_id: string;
  scheme_code: string;
  name_en: string;
  name_te: string;
  name_hi: string;
  level: 'central' | 'state';
  category: string;
  status: 'open' | 'closed' | 'not_yet_open' | 'unknown';
  benefit_summary_en: string;
  benefit_summary_te: string;
  benefit_summary_hi: string;
  official_source_url: string;
  verified_at: string | null;
  is_verified: boolean;
  match_status: MatchStatus;
  matched_rules: RuleEvaluation[];
  missing_fields: string[]; // fields that caused "needs_more_info"
}

export interface EligibilityAssessmentResult {
  assessment_id: string;
  evaluated_at: string;
  is_sample: boolean;
  results: {
    likely_eligible: SchemeMatchResult[];
    needs_more_info: SchemeMatchResult[];
    not_likely_eligible: SchemeMatchResult[];
  };
}
