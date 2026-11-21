import { describe, it, expect } from 'vitest';
import { extractCoarseProfileFromText } from '@/services/profileExtractor';
import { SYNTHETIC_SCENARIOS } from '@/config/constants';

describe('Trilingual Profile Extractor — Presets, Collision Regressions & Clarifying Questions', () => {
  it('extracts Synthetic Scenario A in English', () => {
    const scA = SYNTHETIC_SCENARIOS.find((s) => s.id === 'scenario_a')!;
    const res = extractCoarseProfileFromText(scA.sampleInput_en, 'en');
    expect(res.proposed_profile.age_band).toBe('under_18');
    expect(res.proposed_profile.occupation_category).toBe('student');
    expect(res.proposed_profile.income_band).toBe('below_1_2L');
    expect(res.proposed_profile.district_code).toBe('Guntur');
  });

  it('extracts Synthetic Scenario A in Telugu (`te`)', () => {
    const scA = SYNTHETIC_SCENARIOS.find((s) => s.id === 'scenario_a')!;
    const res = extractCoarseProfileFromText(scA.sampleInput_te, 'te');
    expect(res.proposed_profile.age_band).toBe('under_18');
    expect(res.proposed_profile.occupation_category).toBe('student');
    expect(res.proposed_profile.income_band).toBe('below_1_2L');
    expect(res.proposed_profile.district_code).toBe('Guntur');
  });

  it('extracts Synthetic Scenario A in Hindi (`hi`)', () => {
    const scA = SYNTHETIC_SCENARIOS.find((s) => s.id === 'scenario_a')!;
    const res = extractCoarseProfileFromText(scA.sampleInput_hi, 'hi');
    expect(res.proposed_profile.age_band).toBe('under_18');
    expect(res.proposed_profile.occupation_category).toBe('student');
    expect(res.proposed_profile.income_band).toBe('below_1_2L');
    expect(res.proposed_profile.district_code).toBe('Guntur');
  });

  it('extracts Synthetic Scenario B across English, Telugu, and Hindi', () => {
    const scB = SYNTHETIC_SCENARIOS.find((s) => s.id === 'scenario_b')!;
    for (const [lang, text] of [
      ['en', scB.sampleInput_en],
      ['te', scB.sampleInput_te],
      ['hi', scB.sampleInput_hi],
    ] as const) {
      const res = extractCoarseProfileFromText(text, lang);
      expect(res.proposed_profile.age_band).toBe('60_plus');
      expect(res.proposed_profile.is_widow_or_single_woman).toBe('yes');
      expect(res.proposed_profile.land_holding_band).toBe('none');
      expect(res.proposed_profile.district_code).toBe('Krishna');
    }
  });

  it('extracts Synthetic Scenario C across English, Telugu, and Hindi', () => {
    const scC = SYNTHETIC_SCENARIOS.find((s) => s.id === 'scenario_c')!;
    for (const [lang, text] of [
      ['en', scC.sampleInput_en],
      ['te', scC.sampleInput_te],
      ['hi', scC.sampleInput_hi],
    ] as const) {
      const res = extractCoarseProfileFromText(text, lang);
      expect(res.proposed_profile.age_band).toBe('41_60');
      expect(res.proposed_profile.occupation_category).toBe('farmer');
      expect(res.proposed_profile.land_holding_band).toBe('marginal_under_2_5_acres');
      expect(res.proposed_profile.district_code).toBe('Kurnool');
    }
  });

  it('extracts free-form non-preset Telugu citizen description via deterministic NLP', () => {
    const teRes = extractCoarseProfileFromText(
      'నాకు 64 ఏళ్లు, గుంటూరులో ఉంటున్న వితంతువును, తెల్ల రేషన్ కార్డు ఉంది మరియు భూమి లేదు.',
      'te'
    );
    expect(teRes.extraction_source).toBe('deterministic_nlp');
    expect(teRes.proposed_profile.age_band).toBe('60_plus');
    expect(teRes.proposed_profile.is_widow_or_single_woman).toBe('yes');
    expect(teRes.proposed_profile.income_band).toBe('below_1_2L');
    expect(teRes.proposed_profile.land_holding_band).toBe('none');
    expect(teRes.proposed_profile.district_code).toBe('Guntur');
  });

  it('extracts free-form non-preset Hindi CCRC tenant farmer description via deterministic NLP', () => {
    const hiRes = extractCoarseProfileFromText(
      'मैं कुरनूल में 38 वर्षीय बटाईदार किसान हूँ और हमारी आय 1.5 लाख है।',
      'hi'
    );
    expect(hiRes.proposed_profile.age_band).toBe('26_40');
    expect(hiRes.proposed_profile.occupation_category).toBe('farmer');
    expect(hiRes.proposed_profile.is_tenant_farmer_ccrc).toBe('yes');
    expect(hiRes.proposed_profile.income_band).toBe('1_2L_to_2_5L');
    expect(hiRes.proposed_profile.district_code).toBe('Kurnool');
  });

  it('regression [C-03]: "I am 62 earning 1,50,000" maps to `60_plus` + `1_2L_to_2_5L`, NEVER `under_18` from substring "15"', () => {
    const res = extractCoarseProfileFromText('I am 62 years old earning 1,50,000 per year in Tirupati.');
    expect(res.proposed_profile.age_band).toBe('60_plus');
    expect(res.proposed_profile.income_band).toBe('1_2L_to_2_5L');
    expect(res.proposed_profile.district_code).toBe('Tirupati');
  });

  it('regression [C-03]: "landless daily wage worker" maps to `daily_wage` + `none`, NEVER `farmer` from substring "land"', () => {
    const res = extractCoarseProfileFromText('I am a 36 years old landless daily wage worker with no own land.');
    expect(res.proposed_profile.age_band).toBe('26_40');
    expect(res.proposed_profile.occupation_category).toBe('daily_wage');
    expect(res.proposed_profile.land_holding_band).toBe('none');
  });

  it('regression [C-03]: "12 acres" maps to `large_above_5_acres`, NEVER `marginal_under_2_5_acres` from substring "2 acre"', () => {
    const large = extractCoarseProfileFromText('I am 52 years old and a farmer owning 12 acres of farmland.');
    expect(large.proposed_profile.land_holding_band).toBe('large_above_5_acres');
    expect(large.proposed_profile.age_band).toBe('41_60');

    const small = extractCoarseProfileFromText('I cultivate 3.5 acres of wet land.');
    expect(small.proposed_profile.land_holding_band).toBe('small_2_5_to_5_acres');
  });

  it('extracts 26_40 mother with school-going daughter ("34 year old mother, daughter in Class 7") without misclassifying mother as minor', () => {
    const res = extractCoarseProfileFromText(
      'I am 34 years old mother and homemaker in Guntur, my daughter is studying in Class 7 and we have a White Rice Card.'
    );
    expect(res.proposed_profile.age_band).toBe('26_40');
    expect(res.proposed_profile.occupation_category).toBe('homemaker');
    expect(res.proposed_profile.has_school_student).toBe('yes');
    expect(res.proposed_profile.income_band).toBe('below_1_2L');
    expect(res.proposed_profile.household_members?.some((m) => m.relation === 'child')).toBe(true);
  });

  it('respects negation ("I am not a farmer", "not a widow", "no disability")', () => {
    const res = extractCoarseProfileFromText(
      'I am 29, I am not a farmer, not a widow, and have no disability. I am unemployed and looking for work.'
    );
    expect(res.proposed_profile.occupation_category).toBe('unemployed');
    expect(res.proposed_profile.is_widow_or_single_woman).toBeUndefined();
    expect(res.proposed_profile.has_disability).toBeUndefined();
  });

  it('normalizes Telugu (౦-౯) and Devanagari (०-९) script numerals for age and acres', () => {
    const teNum = extractCoarseProfileFromText('నా వయస్సు ౫౨ సంవత్సరాలు, నాకు ౨ ఎకరాల భూమి ఉంది.', 'te');
    expect(teNum.proposed_profile.age_band).toBe('41_60');
    expect(teNum.proposed_profile.land_holding_band).toBe('marginal_under_2_5_acres');

    const hiNum = extractCoarseProfileFromText('मेरी उम्र ६५ वर्ष है।', 'hi');
    expect(hiNum.proposed_profile.age_band).toBe('60_plus');
  });

  it('extracts Andhra Pradesh districts across English, Telugu, Hindi, and common aliases (Vijayawada -> NTR, Vizag -> Visakhapatnam)', () => {
    expect(extractCoarseProfileFromText('Living in Kurnool town').proposed_profile.district_code).toBe('Kurnool');
    expect(extractCoarseProfileFromText('నేను గుంటూరు జిల్లాలో ఉంటాను', 'te').proposed_profile.district_code).toBe('Guntur');
    expect(extractCoarseProfileFromText('मैं विजयवाड़ा में रहता हूँ', 'hi').proposed_profile.district_code).toBe('NTR');
    expect(extractCoarseProfileFromText('Daily wage worker in Vizag').proposed_profile.district_code).toBe('Visakhapatnam');
  });

  it('ranks clarifying questions by `priority_unlock_count` and caps at MAX_CLARIFYING_QUESTIONS (3)', () => {
    const vague = extractCoarseProfileFromText('Hello, please check schemes for my family in Andhra Pradesh.');
    expect(vague.clarifying_questions).toHaveLength(3);
    expect(vague.clarifying_questions[0].field_name).toBe('income_band');
    expect(vague.clarifying_questions[1].field_name).toBe('occupation_category');
    expect(vague.clarifying_questions[2].field_name).toBe('land_holding_band');
  });
});
