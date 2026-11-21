// Citizen Profile Types and Coarse Bands
// Guardrails: Coarse answers only. No Aadhaar, PAN, phone, or sensitive identifiers.
import { SupportedLanguage } from './i18n';

export type AgeBand =
  | 'under_18'
  | '18_25'
  | '26_40'
  | '41_60'
  | '60_plus'
  | 'unknown';

export type IncomeBand =
  | 'below_1_2L'      // <= 1.2 Lakhs/yr (Rural BPL / White Rice Card)
  | '1_2L_to_2_5L'    // 1.2L - 2.5L/yr
  | '2_5L_to_5L'      // 2.5L - 5L/yr
  | 'above_5L'        // > 5L/yr
  | 'unknown';

export type LandHoldingBand =
  | 'none'                      // Landless
  | 'marginal_under_2_5_acres'  // Marginal (< 2.5 acres)
  | 'small_2_5_to_5_acres'      // Small (2.5 to 5 acres)
  | 'large_above_5_acres'       // Large (> 5 acres)
  | 'unknown';

export type OccupationCategory =
  | 'farmer'
  | 'daily_wage'
  | 'student'
  | 'homemaker'
  | 'self_employed'
  | 'unemployed'
  | 'other'
  | 'unknown';

export type SocialCategory =
  | 'OC'
  | 'BC'
  | 'SC'
  | 'ST'
  | 'minority'
  | 'unknown';

export type EducationBand =
  | 'none'
  | 'primary'
  | 'class_10'
  | 'intermediate'
  | 'graduate'
  | 'post_graduate'
  | 'unknown';

export type TriStateFlag = 'yes' | 'no' | 'unknown';

export interface HouseholdMember {
  id?: string;
  relation: 'spouse' | 'child' | 'parent' | 'other';
  age_band: AgeBand;
  education_band?: EducationBand;
}

export interface CitizenProfile {
  age_band: AgeBand;
  state_code: 'AP';
  district_code?: string; // 'unknown' or one of the 26 AP districts
  income_band: IncomeBand;
  occupation_category: OccupationCategory;
  social_category: SocialCategory;
  land_holding_band: LandHoldingBand;
  language_pref: SupportedLanguage;
  household_members: HouseholdMember[];
  // Coarse, non-identifying household & vulnerability flags
  has_school_student?: TriStateFlag;        // Class 1 to 12 student in household
  has_college_student?: TriStateFlag;       // Inter / Polytechnic / Degree student in household
  is_widow_or_single_woman?: TriStateFlag;  // Widow / destitute single woman (18+)
  has_disability?: TriStateFlag;            // Person with benchmark disability in household/self
  is_tenant_farmer_ccrc?: TriStateFlag;     // Cultivating leased farmland (CCRC / Koulu Rythu)
  has_white_ration_card?: TriStateFlag;     // Everyday proxy for BPL / below_1_2L
  is_sample: boolean; // true for synthetic demo profiles
}

export interface SyntheticScenarioPreset {
  id: 'scenario_a' | 'scenario_b' | 'scenario_c';
  title_en: string;
  title_te: string;
  title_hi: string;
  subtitle_en?: string;
  subtitle_te?: string;
  subtitle_hi?: string;
  sampleInput_en: string;
  sampleInput_te: string;
  sampleInput_hi: string;
  profile: CitizenProfile;
}
