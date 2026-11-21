import { describe, it, expect } from 'vitest';
import {
  evaluateDeterministicEligibility,
  personaliseSchemeDocuments,
  buildMasterDocumentPack,
  resolveProfileFieldValue,
} from '@/services/deterministicEngine';
import { MOCK_GOVERNMENT_SCHEMES } from './fixtures/sampleSchemes';
import type { CitizenProfile } from '@/types/profile';
import type { GovernmentScheme } from '@/types/scheme';

function makeBaseProfile(overrides: Partial<CitizenProfile> = {}): CitizenProfile {
  return {
    age_band: '41_60',
    state_code: 'AP',
    district_code: 'Guntur',
    income_band: 'below_1_2L',
    occupation_category: 'daily_wage',
    social_category: 'BC',
    land_holding_band: 'none',
    language_pref: 'en',
    household_members: [],
    has_school_student: 'no',
    has_college_student: 'no',
    is_widow_or_single_woman: 'no',
    has_disability: 'no',
    is_tenant_farmer_ccrc: 'no',
    has_white_ration_card: 'yes',
    is_sample: true,
    ...overrides,
  };
}

describe('Deterministic Eligibility Engine — Operators & Rule Evaluation', () => {
  it('evaluates eq, neq, in, lte, gte, and between operators accurately on ordinal coarse bands', () => {
    const customScheme: GovernmentScheme = {
      ...MOCK_GOVERNMENT_SCHEMES[0],
      id: 'test-ops-001',
      scheme_code: 'TEST-OPS',
      is_published: true,
      status: 'open',
      rules: [
        {
          rule_id: 'OP-EQ',
          field_name: 'state_code',
          rule_type: 'location',
          operator: 'eq',
          value: 'AP',
          reason_en: 'AP resident',
          reason_te: 'AP',
          reason_hi: 'AP',
          source_id: 'src-001',
          rule_version: 1,
        },
        {
          rule_id: 'OP-NEQ',
          field_name: 'income_band',
          rule_type: 'threshold',
          operator: 'neq',
          value: 'above_5L',
          reason_en: 'Not high income',
          reason_te: 'Not high income',
          reason_hi: 'Not high income',
          source_id: 'src-001',
          rule_version: 1,
        },
        {
          rule_id: 'OP-IN',
          field_name: 'social_category',
          rule_type: 'category',
          operator: 'in',
          value: 'BC,SC,ST',
          reason_en: 'Target social category',
          reason_te: 'Target',
          reason_hi: 'Target',
          source_id: 'src-001',
          rule_version: 1,
        },
        {
          rule_id: 'OP-LTE',
          field_name: 'income_band',
          rule_type: 'threshold',
          operator: 'lte',
          value: '1_2L_to_2_5L',
          reason_en: 'Income <= 2.5L',
          reason_te: 'Income <= 2.5L',
          reason_hi: 'Income <= 2.5L',
          source_id: 'src-001',
          rule_version: 1,
        },
        {
          rule_id: 'OP-GTE',
          field_name: 'land_holding_band',
          rule_type: 'threshold',
          operator: 'gte',
          value: 'marginal_under_2_5_acres',
          reason_en: 'Owns farmland',
          reason_te: 'Owns farmland',
          reason_hi: 'Owns farmland',
          source_id: 'src-001',
          rule_version: 1,
        },
        {
          rule_id: 'OP-BETWEEN',
          field_name: 'age_band',
          rule_type: 'age_range',
          operator: 'between',
          value: '26_40,41_60',
          reason_en: 'Working adult age 26-60',
          reason_te: 'Working adult',
          reason_hi: 'Working adult',
          source_id: 'src-001',
          rule_version: 1,
        },
      ],
    };

    const matchingProfile = makeBaseProfile({
      age_band: '26_40',
      income_band: '1_2L_to_2_5L',
      social_category: 'SC',
      land_holding_band: 'small_2_5_to_5_acres',
    });

    const passAssessment = evaluateDeterministicEligibility(matchingProfile, [customScheme]);
    expect(passAssessment.results.likely_eligible).toHaveLength(1);
    expect(passAssessment.results.likely_eligible[0].matched_rules.every((r) => r.status === 'matched')).toBe(true);

    // Fail `between` when age_band is `under_18`
    const failBetween = evaluateDeterministicEligibility(
      { ...matchingProfile, age_band: 'under_18' },
      [customScheme]
    );
    expect(failBetween.results.not_likely_eligible).toHaveLength(1);
  });

  it('NTR Bharosa OR-group: matches 60+ senior citizen on Old-Age Pension branch', () => {
    const senior = makeBaseProfile({
      age_band: '60_plus',
      is_widow_or_single_woman: 'no',
      has_disability: 'no',
      income_band: 'below_1_2L',
      land_holding_band: 'none',
    });
    const res = evaluateDeterministicEligibility(senior, MOCK_GOVERNMENT_SCHEMES);
    const ntr = res.results.likely_eligible.find((s) => s.scheme_code === 'AP-NTR-BHAROSA-PENSION');
    expect(ntr).toBeDefined();
    expect(ntr?.matched_rules.find((r) => r.rule_id === 'NTR-R01A')?.status).toBe('matched');
    expect(ntr?.matched_rules.find((r) => r.rule_id === 'NTR-R01A')?.is_group_satisfied).toBe(true);
  });

  it('NTR Bharosa OR-group: matches 32-year-old destitute widow on Widow Pension branch', () => {
    const youngWidow = makeBaseProfile({
      age_band: '26_40',
      occupation_category: 'homemaker',
      is_widow_or_single_woman: 'yes',
      has_disability: 'no',
      income_band: 'below_1_2L',
      land_holding_band: 'none',
    });
    const res = evaluateDeterministicEligibility(youngWidow, MOCK_GOVERNMENT_SCHEMES);
    const ntr = res.results.likely_eligible.find((s) => s.scheme_code === 'AP-NTR-BHAROSA-PENSION');
    expect(ntr).toBeDefined();
    expect(ntr?.matched_rules.find((r) => r.rule_id === 'NTR-R01B')?.status).toBe('matched');
  });

  it('NTR Bharosa OR-group: matches 28-year-old person with benchmark disability on SADAREM branch', () => {
    const disabledAdult = makeBaseProfile({
      age_band: '26_40',
      is_widow_or_single_woman: 'no',
      has_disability: 'yes',
      income_band: 'below_1_2L',
      land_holding_band: 'marginal_under_2_5_acres',
    });
    const res = evaluateDeterministicEligibility(disabledAdult, MOCK_GOVERNMENT_SCHEMES);
    const ntr = res.results.likely_eligible.find((s) => s.scheme_code === 'AP-NTR-BHAROSA-PENSION');
    expect(ntr).toBeDefined();
    expect(ntr?.matched_rules.find((r) => r.rule_id === 'NTR-R01C')?.status).toBe('matched');
  });

  it('NTR Bharosa OR-group: rejects high-income senior citizen (> 5 Lakhs/yr)', () => {
    const wealthySenior = makeBaseProfile({
      age_band: '60_plus',
      income_band: 'above_5L',
      has_white_ration_card: 'no',
    });
    const res = evaluateDeterministicEligibility(wealthySenior, MOCK_GOVERNMENT_SCHEMES);
    const ntr = res.results.not_likely_eligible.find((s) => s.scheme_code === 'AP-NTR-BHAROSA-PENSION');
    expect(ntr).toBeDefined();
  });

  it('Annadata Sukhibhava & PM-KISAN: 2-acre landholding farmer qualifies for BOTH farm schemes', () => {
    const smallFarmer = makeBaseProfile({
      occupation_category: 'farmer',
      land_holding_band: 'marginal_under_2_5_acres',
      is_tenant_farmer_ccrc: 'no',
      income_band: '1_2L_to_2_5L',
    });
    const res = evaluateDeterministicEligibility(smallFarmer, MOCK_GOVERNMENT_SCHEMES);
    const codes = res.results.likely_eligible.map((s) => s.scheme_code);
    expect(codes).toContain('AP-ANNADATA-SUKHIBHAVA');
    expect(codes).toContain('CEN-PM-KISAN');
  });

  it('Annadata Sukhibhava OR-group: landless CCRC tenant farmer qualifies for Annadata Sukhibhava but NOT PM-KISAN', () => {
    const tenantFarmer = makeBaseProfile({
      occupation_category: 'farmer',
      land_holding_band: 'none',
      is_tenant_farmer_ccrc: 'yes',
      income_band: 'below_1_2L',
    });
    const res = evaluateDeterministicEligibility(tenantFarmer, MOCK_GOVERNMENT_SCHEMES);
    const likelyCodes = res.results.likely_eligible.map((s) => s.scheme_code);
    const ineligibleCodes = res.results.not_likely_eligible.map((s) => s.scheme_code);
    expect(likelyCodes).toContain('AP-ANNADATA-SUKHIBHAVA');
    expect(ineligibleCodes).toContain('CEN-PM-KISAN');
  });

  it('Annadata Sukhibhava: rejects non-farmer daily-wage worker', () => {
    const nonFarmer = makeBaseProfile({
      occupation_category: 'daily_wage',
      land_holding_band: 'none',
      is_tenant_farmer_ccrc: 'no',
    });
    const res = evaluateDeterministicEligibility(nonFarmer, MOCK_GOVERNMENT_SCHEMES);
    expect(res.results.not_likely_eligible.map((s) => s.scheme_code)).toContain('AP-ANNADATA-SUKHIBHAVA');
  });

  it('FR-08 Guardrail: unknown child status produces `needs_more_info` for Talliki Vandanam, NEVER `not_likely_eligible`', () => {
    const motherUnknownChild = makeBaseProfile({
      age_band: '26_40',
      occupation_category: 'homemaker',
      income_band: 'below_1_2L',
      has_school_student: 'unknown',
      has_college_student: 'unknown',
      household_members: [],
    });
    const res = evaluateDeterministicEligibility(motherUnknownChild, MOCK_GOVERNMENT_SCHEMES);
    const tvNeedsInfo = res.results.needs_more_info.find((s) => s.scheme_code === 'AP-TALLIKI-VANDANAM');
    const tvRejected = res.results.not_likely_eligible.find((s) => s.scheme_code === 'AP-TALLIKI-VANDANAM');
    expect(tvNeedsInfo).toBeDefined();
    expect(tvNeedsInfo?.missing_fields).toContain('household_has_student');
    expect(tvRejected).toBeUndefined();
  });

  it('Talliki Vandanam: mother with `has_school_student: yes` transitions to `likely_eligible`', () => {
    const motherWithSchoolChild = makeBaseProfile({
      age_band: '26_40',
      occupation_category: 'homemaker',
      income_band: 'below_1_2L',
      has_school_student: 'yes',
    });
    const res = evaluateDeterministicEligibility(motherWithSchoolChild, MOCK_GOVERNMENT_SCHEMES);
    expect(res.results.likely_eligible.map((s) => s.scheme_code)).toContain('AP-TALLIKI-VANDANAM');
  });

  it('FR-09 Guardrail: Deepam 2.0 (`verified_at: null`) is held back with `pending_verification_hold: true` until verified', () => {
    const bplHousehold = makeBaseProfile({
      income_band: 'below_1_2L',
    });
    const unverifiedRun = evaluateDeterministicEligibility(bplHousehold, MOCK_GOVERNMENT_SCHEMES);
    const deepamHeld = unverifiedRun.results.needs_more_info.find((s) => s.scheme_code === 'AP-DEEPAM-2-LPG');
    expect(deepamHeld).toBeDefined();
    expect(deepamHeld?.pending_verification_hold).toBe(true);
    expect(unverifiedRun.results.likely_eligible.find((s) => s.scheme_code === 'AP-DEEPAM-2-LPG')).toBeUndefined();

    // Simulate live Admin verification of Deepam 2.0
    const verifiedSchemes = MOCK_GOVERNMENT_SCHEMES.map((s) =>
      s.scheme_code === 'AP-DEEPAM-2-LPG'
        ? { ...s, source: { ...s.source, verified_at: '2026-11-21', verified_by: 'Admin Officer' } }
        : s
    );
    const verifiedRun = evaluateDeterministicEligibility(bplHousehold, verifiedSchemes);
    expect(verifiedRun.results.likely_eligible.map((s) => s.scheme_code)).toContain('AP-DEEPAM-2-LPG');
  });

  it('FR-09 Guardrail: excludes unpublished schemes and holds back 0-rule or closed schemes', () => {
    const unpublished: GovernmentScheme = {
      ...MOCK_GOVERNMENT_SCHEMES[0],
      id: 'unpub-1',
      scheme_code: 'UNPUB-1',
      is_published: false,
    };
    const zeroRules: GovernmentScheme = {
      ...MOCK_GOVERNMENT_SCHEMES[0],
      id: 'zero-1',
      scheme_code: 'ZERO-RULES',
      is_published: true,
      rules: [],
    };
    const closedScheme: GovernmentScheme = {
      ...MOCK_GOVERNMENT_SCHEMES[0],
      id: 'closed-1',
      scheme_code: 'CLOSED-SCH',
      is_published: true,
      status: 'closed',
    };

    const res = evaluateDeterministicEligibility(
      makeBaseProfile({ has_school_student: 'yes' }),
      [unpublished, zeroRules, closedScheme]
    );
    const allReturnedCodes = [
      ...res.results.likely_eligible,
      ...res.results.needs_more_info,
      ...res.results.not_likely_eligible,
    ].map((s) => s.scheme_code);

    expect(allReturnedCodes).not.toContain('UNPUB-1');
    expect(res.results.likely_eligible).toHaveLength(0);
    expect(res.results.needs_more_info.find((s) => s.scheme_code === 'ZERO-RULES')?.pending_verification_hold).toBe(true);
    expect(res.results.needs_more_info.find((s) => s.scheme_code === 'CLOSED-SCH')?.pending_verification_hold).toBe(true);
  });

  it('resolves White Ration Card (`has_white_ration_card: yes`) as `below_1_2L` proxy when income_band is unknown', () => {
    const profileWithCard = makeBaseProfile({
      income_band: 'unknown',
      has_white_ration_card: 'yes',
    });
    expect(resolveProfileFieldValue('income_band', profileWithCard)).toBe('below_1_2L');
  });

  it('personaliseSchemeDocuments promotes conditional Widow, Disability, CCRC & Caste documents to mandatory', () => {
    const ntrScheme = MOCK_GOVERNMENT_SCHEMES.find((s) => s.scheme_code === 'AP-NTR-BHAROSA-PENSION')!;
    const widowProfile = makeBaseProfile({
      is_widow_or_single_woman: 'yes',
      has_disability: 'no',
    });
    const personalisedNtr = personaliseSchemeDocuments(ntrScheme.documents, widowProfile);
    const deathCert = personalisedNtr.find((d) => d.canonical_key === 'spouse_death_cert');
    const sadaremCert = personalisedNtr.find((d) => d.canonical_key === 'sadarem_cert');
    expect(deathCert?.effective_requirement).toBe('mandatory');
    expect(deathCert?.personalisation_badge_en).toContain('Widow');
    expect(sadaremCert?.effective_requirement).toBe('optional');

    const annadataScheme = MOCK_GOVERNMENT_SCHEMES.find((s) => s.scheme_code === 'AP-ANNADATA-SUKHIBHAVA')!;
    const tenantProfile = makeBaseProfile({
      occupation_category: 'farmer',
      is_tenant_farmer_ccrc: 'yes',
    });
    const personalisedFarm = personaliseSchemeDocuments(annadataScheme.documents, tenantProfile);
    expect(personalisedFarm.find((d) => d.canonical_key === 'ccrc_tenant_card')?.effective_requirement).toBe('mandatory');
  });

  it('buildMasterDocumentPack deduplicates shared `canonical_key` documents across multiple matched schemes', () => {
    const studentFamily = makeBaseProfile({
      age_band: 'under_18',
      occupation_category: 'student',
      social_category: 'BC',
      income_band: 'below_1_2L',
      has_school_student: 'yes',
      has_college_student: 'yes',
    });
    const assessment = evaluateDeterministicEligibility(studentFamily, MOCK_GOVERNMENT_SCHEMES);
    const pack = buildMasterDocumentPack(
      assessment.results.likely_eligible,
      MOCK_GOVERNMENT_SCHEMES,
      studentFamily
    );

    const whiteRiceCard = pack.find((item) => item.key === 'white_rice_card');
    const bankPassbook = pack.find((item) => item.key === 'bank_passbook_npci');
    expect(whiteRiceCard).toBeDefined();
    expect(whiteRiceCard!.used_by_schemes.length).toBeGreaterThanOrEqual(3);
    expect(bankPassbook).toBeDefined();
    expect(bankPassbook!.used_by_schemes.length).toBeGreaterThanOrEqual(2);
    // Sorted by most reused document first
    expect(pack[0].used_by_schemes.length).toBeGreaterThanOrEqual(pack[pack.length - 1].used_by_schemes.length);
  });
});
