// Unit tests for evaluateDeterministicEligibility.
// All citizen profiles below are SYNTHETIC (test fixtures). No real personal data.
// Scheme used: ap-sch-001 (Talliki Vandanam) from mockSchemeData.ts, with rules:
//   TV-R01 income_band  in  'below_1_2L,1_2L_to_2_5L'
//   TV-R02 state_code   eq  'AP'
//   TV-R03 household_has_student eq 'true'
// Engine semantics (from deterministicEngine.ts):
//   - 'in' splits the rule value on commas, trims and lowercases, then checks membership.
//     Band values are therefore INCLUSIVE: a listed band passes, an unlisted band fails.
//   - Missing key, 'unknown' or empty value -> rule status 'unknown' -> needs_more_info.
//   - Any failed rule -> not_likely_eligible (a failed rule overrides unknown rules).
//   - Engine has no numeric comparison; lte/gte/between are not implemented in the code.

import { describe, it, expect } from 'vitest';
import { evaluateDeterministicEligibility } from '../deterministicEngine';
import { MOCK_GOVERNMENT_SCHEMES } from '../mockSchemeData';
import type { CitizenProfile } from '@/types/profile';
import type { EligibilityAssessmentResult, SchemeMatchResult } from '@/types/eligibility';

const SCHEME_ID = 'ap-sch-001';
const scheme = MOCK_GOVERNMENT_SCHEMES.find((s) => s.id === SCHEME_ID);
if (!scheme) {
  throw new Error(`Test fixture scheme ${SCHEME_ID} not found in mockSchemeData.ts`);
}
const SCHEMES = [scheme];

// SYNTHETIC profile factory. Every field is set to a passing value by default.
function syntheticProfile(overrides: Partial<CitizenProfile> = {}): CitizenProfile {
  return {
    age_band: '26_40',
    state_code: 'AP',
    district_code: 'SYNTH-D1',
    income_band: 'below_1_2L',
    occupation_category: 'daily_wage',
    social_category: 'BC',
    land_holding_band: 'none',
    language_pref: 'en' as CitizenProfile['language_pref'],
    // A child under 18 makes household_has_student evaluate to 'true'.
    household_members: [{ relation: 'child', age_band: 'under_18', education_band: 'primary' }],
    is_sample: true,
    ...overrides,
  };
}

function findResult(result: EligibilityAssessmentResult, schemeId: string): SchemeMatchResult {
  const all = [
    ...result.results.likely_eligible,
    ...result.results.needs_more_info,
    ...result.results.not_likely_eligible,
  ];
  const found = all.find((r) => r.scheme_id === schemeId);
  if (!found) throw new Error(`Scheme ${schemeId} missing from engine output`);
  return found;
}

describe('evaluateDeterministicEligibility (synthetic profiles)', () => {
  it('returns likely_eligible when all conditions pass', () => {
    const result = evaluateDeterministicEligibility(syntheticProfile(), SCHEMES);
    const r = findResult(result, SCHEME_ID);

    expect(r.match_status).toBe('likely_eligible');
    expect(r.missing_fields).toEqual([]);
    expect(r.matched_rules.every((m) => m.status === 'matched')).toBe(true);
    expect(result.results.likely_eligible.map((x) => x.scheme_id)).toContain(SCHEME_ID);
  });

  it('returns not_likely_eligible when one clear condition fails', () => {
    // Income band above the listed cutoff bands -> TV-R01 not_matched.
    const result = evaluateDeterministicEligibility(
      syntheticProfile({ income_band: 'above_5L' }),
      SCHEMES
    );
    const r = findResult(result, SCHEME_ID);

    expect(r.match_status).toBe('not_likely_eligible');
    const failed = r.matched_rules.filter((m) => m.status === 'not_matched');
    expect(failed.map((m) => m.rule_id)).toEqual(['TV-R01']);
    expect(result.results.likely_eligible.map((x) => x.scheme_id)).not.toContain(SCHEME_ID);
  });

  it('returns needs_more_info, never likely_eligible, when a required field is missing', () => {
    const profile = syntheticProfile();
    delete (profile as Partial<CitizenProfile>).income_band;

    const result = evaluateDeterministicEligibility(profile, SCHEMES);
    const r = findResult(result, SCHEME_ID);

    expect(r.match_status).toBe('needs_more_info');
    expect(r.match_status).not.toBe('likely_eligible');
    expect(r.missing_fields).toContain('income_band');
    expect(result.results.likely_eligible.map((x) => x.scheme_id)).not.toContain(SCHEME_ID);
  });

  it('treats an explicit "unknown" value as missing, not as a pass', () => {
    const result = evaluateDeterministicEligibility(
      syntheticProfile({ income_band: 'unknown' }),
      SCHEMES
    );
    const r = findResult(result, SCHEME_ID);

    expect(r.match_status).toBe('needs_more_info');
    expect(r.missing_fields).toContain('income_band');
  });

  it('boundary: a band exactly at the listed upper cutoff passes (inclusive list)', () => {
    // '1_2L_to_2_5L' is literally in the rule value 'below_1_2L,1_2L_to_2_5L'.
    const result = evaluateDeterministicEligibility(
      syntheticProfile({ income_band: '1_2L_to_2_5L' }),
      SCHEMES
    );
    const r = findResult(result, SCHEME_ID);
    const incomeRule = r.matched_rules.find((m) => m.rule_id === 'TV-R01');

    expect(incomeRule?.status).toBe('matched');
    expect(r.match_status).toBe('likely_eligible');
  });

  it('boundary: the band just above the cutoff fails (exclusive of unlisted band)', () => {
    // '2_5L_to_5L' is the next band after the listed cutoff and is not in the list.
    const result = evaluateDeterministicEligibility(
      syntheticProfile({ income_band: '2_5L_to_5L' }),
      SCHEMES
    );
    const r = findResult(result, SCHEME_ID);
    const incomeRule = r.matched_rules.find((m) => m.rule_id === 'TV-R01');

    expect(incomeRule?.status).toBe('not_matched');
    expect(r.match_status).toBe('not_likely_eligible');
  });

  it('unknown category value is never converted to a pass', () => {
    // A value outside the defined bands is not 'unknown' to the engine: it is
    // checked against the rule list and must not match.
    const result = evaluateDeterministicEligibility(
      syntheticProfile({ income_band: 'mid_range_unlisted' as CitizenProfile['income_band'] }),
      SCHEMES
    );
    const r = findResult(result, SCHEME_ID);
    const incomeRule = r.matched_rules.find((m) => m.rule_id === 'TV-R01');

    expect(incomeRule?.status).not.toBe('matched');
    expect(r.match_status).not.toBe('likely_eligible');
  });
});
