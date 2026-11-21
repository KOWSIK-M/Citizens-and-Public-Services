// Global Application Constants and Citizen-Friendly Synthetic Persona Presets (English, Telugu, Hindi)
// Guardrails: Test strictly with synthetic profiles. Never use real citizen records.

import type { SyntheticScenarioPreset } from '../types/profile';

export const APP_CONSTANTS = {
  MAX_DESCRIPTION_LENGTH: 500,
  DEFAULT_LANGUAGE: 'en' as const,
  MIN_TOUCH_TARGET_PX: 44,
  MAX_CLARIFYING_QUESTIONS: 3,
  TELUGU_LINE_HEIGHT_OFFSET_PX: 4,
  DEVANAGARI_LINE_HEIGHT_OFFSET_PX: 2,
  STALE_VERIFICATION_DAYS: 90,
  DEMO_ADMIN_PASSCODE: 'AP2026',
};

// Synthetic Demo Profiles for Rural Andhra Pradesh Daily-Wage & Smallholder Households
export const SYNTHETIC_SCENARIOS: SyntheticScenarioPreset[] = [
  {
    id: 'scenario_a',
    title_en: 'Student in Daily-Wage Family (Class 10)',
    title_te: 'కూలీ కుటుంబ విద్యార్థి (10వ తరగతి)',
    title_hi: 'दिहाड़ी मजदूर परिवार का छात्र (कक्षा 10)',
    subtitle_en: 'Synthetic Demo A • Guntur',
    subtitle_te: 'నమూనా A • గుంటూరు',
    subtitle_hi: 'नमूना A • गुंटूर',
    sampleInput_en:
      'I am 17 and studying in Class 10 in Guntur, Andhra Pradesh. My parents are daily wage workers, we have a White Rice Card and no agricultural land.',
    sampleInput_te:
      'నా వయస్సు 17 సంవత్సరాలు, నేను ఆంధ్రప్రదేశ్‌లోని గుంటూరులో 10వ తరగతి చదువుతున్నాను. మా తల్లిదండ్రులు దినసరి కూలీలు, మాకు తెల్ల రేషన్ కార్డు ఉంది మరియు వ్యవసాయ భూమి లేదు.',
    sampleInput_hi:
      'मेरी उम्र 17 वर्ष है और मैं गुंटूर, आंध्र प्रदेश में 10वीं कक्षा में पढ़ रहा हूँ। मेरे माता-पिता दिहाड़ी मजदूर हैं, हमारे पास सफेद राशन कार्ड है और कोई कृषि भूमि नहीं है।',
    profile: {
      age_band: 'under_18',
      state_code: 'AP',
      district_code: 'Guntur',
      income_band: 'below_1_2L',
      occupation_category: 'student',
      social_category: 'BC',
      land_holding_band: 'none',
      language_pref: 'en',
      has_school_student: 'yes',
      has_college_student: 'yes',
      is_widow_or_single_woman: 'no',
      has_disability: 'no',
      is_tenant_farmer_ccrc: 'no',
      has_white_ration_card: 'yes',
      household_members: [
        { relation: 'parent', age_band: '41_60' },
        { relation: 'child', age_band: 'under_18', education_band: 'class_10' },
      ],
      is_sample: true,
    },
  },
  {
    id: 'scenario_b',
    title_en: 'Village Grandmother (Widow, 68 yrs)',
    title_te: 'గ్రామీణ వృద్ధ వితంతువు (68 ఏళ్లు)',
    title_hi: 'ग्रामीण बुजुर्ग विधवा (68 वर्ष)',
    subtitle_en: 'Synthetic Demo B • Krishna',
    subtitle_te: 'నమూనా B • కృష్ణా',
    subtitle_hi: 'नमूना B • कृष्णा',
    sampleInput_en:
      'I am a 68-year-old widow in a village in Krishna district, Andhra Pradesh. I have no farmland and no regular pension or income.',
    sampleInput_te:
      'నాకు 68 ఏళ్లు, నేను ఆంధ్రప్రదేశ్‌లోని కృష్ణా జిల్లా గ్రామంలో ఉంటున్న వితంతువును. నాకు వ్యవసాయ భూమి లేదు, ఎటువంటి పెన్షన్ లేదా ఆదాయం లేదు.',
    sampleInput_hi:
      'मैं कृष्णा जिला, आंध्र प्रदेश के एक गांव में रहने वाली 68 वर्षीय विधवा हूँ। मेरे पास कोई जमीन नहीं है और मुझे कोई नियमित पेंशन या आय नहीं मिलती है।',
    profile: {
      age_band: '60_plus',
      state_code: 'AP',
      district_code: 'Krishna',
      income_band: 'below_1_2L',
      occupation_category: 'homemaker',
      social_category: 'OC',
      land_holding_band: 'none',
      language_pref: 'te',
      has_school_student: 'no',
      has_college_student: 'no',
      is_widow_or_single_woman: 'yes',
      has_disability: 'no',
      is_tenant_farmer_ccrc: 'no',
      has_white_ration_card: 'yes',
      household_members: [],
      is_sample: true,
    },
  },
  {
    id: 'scenario_c',
    title_en: 'Smallholder Farmer Family (2 Acres)',
    title_te: 'సన్నకారు రైతు కుటుంబం (2 ఎకరాలు)',
    title_hi: 'सीमांत किसान परिवार (2 एकड़)',
    subtitle_en: 'Synthetic Demo C • Kurnool',
    subtitle_te: 'నమూనా C • కర్నూలు',
    subtitle_hi: 'नमूना C • कुरनूल',
    sampleInput_en:
      'I am a 45-year-old farmer in Kurnool, Andhra Pradesh. I own 2 acres of dry land, earn around 1.5 lakhs a year, and my daughter is in Intermediate college.',
    sampleInput_te:
      'నేను ఆంధ్రప్రదేశ్‌లోని కర్నూలులో 45 ఏళ్ల రైతును. నాకు 2 ఎకరాల స్వంత భూమి ఉంది, వార్షిక ఆదాయం సుమారు 1.5 లక్షలు మరియు నా కుమార్తె ఇంటర్మీడియట్ చదువుతోంది.',
    sampleInput_hi:
      'मैं कुरनूल, आंध्र प्रदेश का 45 वर्षीय किसान हूँ। मेरे पास अपनी 2 एकड़ जमीन है, वार्षिक आय लगभग 1.5 लाख है और मेरी बेटी इंटरमीडिएट कॉलेज में पढ़ती है।',
    profile: {
      age_band: '41_60',
      state_code: 'AP',
      district_code: 'Kurnool',
      income_band: '1_2L_to_2_5L',
      occupation_category: 'farmer',
      social_category: 'BC',
      land_holding_band: 'marginal_under_2_5_acres',
      language_pref: 'hi',
      has_school_student: 'yes',
      has_college_student: 'yes',
      is_widow_or_single_woman: 'no',
      has_disability: 'no',
      is_tenant_farmer_ccrc: 'no',
      has_white_ration_card: 'no',
      household_members: [
        { relation: 'spouse', age_band: '41_60' },
        { relation: 'child', age_band: '18_25', education_band: 'intermediate' },
      ],
      is_sample: true,
    },
  },
];
