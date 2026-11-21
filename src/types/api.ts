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
  question_en: string;
  question_te: string;
  question_hi: string;
  options: Array<{ value: string; label_en: string; label_te: string; label_hi: string }>;
}

export interface ExtractProfileResponse {
  proposed_profile: Partial<CitizenProfile>;
  missing_critical_fields: string[];
  clarifying_questions: ClarifyingQuestion[];
  is_fallback?: boolean;
}

export interface MatchEligibilityRequest {
  confirmed_profile: CitizenProfile;
  is_sample: boolean;
}

export type MatchEligibilityResponse = EligibilityAssessmentResult;

export interface SchemeListResponse {
  schemes: GovernmentScheme[];
  total: number;
}
