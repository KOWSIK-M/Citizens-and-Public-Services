// API Contracts for Serverless Functions (/api/*)
// Guardrails: Browser code communicates strictly with /api/*; never holds external secrets.

import { CitizenProfile } from './profile';
import { EligibilityAssessmentResult } from './eligibility';
import { GovernmentScheme } from './scheme';
import { SupportedLanguage } from './i18n';

export interface ExtractProfileRequest {
  text: string;           // plain-language text (max 500 chars)
  language: SupportedLanguage;
}

export interface ClarifyingQuestion {
  field_name: string;
  priority_unlock_count?: number; // how many candidate schemes this question helps unlock
  question_en: string;
  question_te: string;
  question_hi: string;
  helper_en?: string;
  helper_te?: string;
  helper_hi?: string;
  options: Array<{ value: string; label_en: string; label_te: string; label_hi: string }>;
}

export interface ExtractProfileResponse {
  proposed_profile: Partial<CitizenProfile>;
  extracted_fields: string[];
  missing_critical_fields: string[];
  clarifying_questions: ClarifyingQuestion[];
  is_fallback?: boolean;
  extraction_source?: 'claude_haiku' | 'deterministic_nlp' | 'preset';
}

export interface MatchEligibilityRequest {
  confirmed_profile: CitizenProfile;
  is_sample: boolean;
}

export type MatchEligibilityResponse = EligibilityAssessmentResult;

export interface SchemeListResponse {
  schemes: GovernmentScheme[];
  total: number;
  data_source: 'neon' | 'demo';
}
