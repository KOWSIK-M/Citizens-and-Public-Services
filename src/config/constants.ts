// Global Application Constants and Synthetic Persona Presets (English, Telugu, Hindi)
// Guardrails: Test strictly with synthetic profiles. Never use real citizen records.

import { SyntheticScenarioPreset } from '../types/profile';

export const APP_CONSTANTS = {
  MAX_DESCRIPTION_LENGTH: 500,
  DEFAULT_LANGUAGE: 'en' as const,
  MIN_TOUCH_TARGET_PX: 44,
  MAX_CLARIFYING_QUESTIONS: 3,
  TELUGU_LINE_HEIGHT_OFFSET_PX: 4,
  DEVANAGARI_LINE_HEIGHT_OFFSET_PX: 2,
};

// Synthetic Demo Profiles for Hackathon Evaluation (Scenarios A, B, and C)
export const SYNTHETIC_SCENARIOS: SyntheticScenarioPreset[] = [
  {
    id: 'scenario_a',
    title_en: 'Scenario A: Low-Income Student',
    title_te: 'సన్నివేశం A: పేద విద్యార్థి',
    title_hi: 'परिदृश्य A: कम आय वाला छात्र',
    sampleInput_en: 'I am 17 and studying in Class 10 in Andhra Pradesh. My parents are daily wage workers and money is tight.',
    sampleInput_te: 'నా వయస్సు 17 సంవత్సరాలు, నేను ఆంధ్రప్రదేశ్‌లో 10వ తరగతి చదువుతున్నాను. మా తల్లిదండ్రులు దినసరి కూలీలు, కుటుంబ పరిస్థితి కష్టంగా ఉంది.',
    sampleInput_hi: 'मेरी उम्र 17 वर्ष है और मैं आंध्र प्रदेश में 10वीं कक्षा में पढ़ रहा हूँ। मेरे माता-पिता दिहाड़ी मजदूर हैं और आर्थिक स्थिति कठिन है।',
    profile: {
      age_band: 'under_18',
      state_code: 'AP',
      district_code: 'Guntur',
      income_band: 'below_1_2L',
      occupation_category: 'student',
      social_category: 'BC',
      land_holding_band: 'none',
      language_pref: 'en',
      household_members: [
        { relation: 'parent', age_band: '41_60' },
        { relation: 'child', age_band: 'under_18', education_band: 'class_10' },
      ],
      is_sample: true,
    },
  },
  {
    id: 'scenario_b',
    title_en: 'Scenario B: Senior Citizen Widow',
    title_te: 'సన్నివేశం B: వృద్ధ వితంతువు',
    title_hi: 'परिदृश्य B: वरिष्ठ नागरिक विधवा',
    sampleInput_en: 'I am a 68-year-old widow in a village in Andhra Pradesh. I have no regular pension or income.',
    sampleInput_te: 'నాకు 68 ఏళ్లు, నేను ఆంధ్రప్రదేశ్‌లోని ఒక గ్రామంలో ఉంటున్న వితంతువును. నాకు ఎటువంటి పెన్షన్ లేదా ఆదాయం లేదు.',
    sampleInput_hi: 'मैं आंध्र प्रदेश के एक गांव में रहने वाली 68 वर्षीय विधवा हूँ। मुझे कोई नियमित पेंशन या आय नहीं मिलती है।',
    profile: {
      age_band: '60_plus',
      state_code: 'AP',
      district_code: 'Krishna',
      income_band: 'below_1_2L',
      occupation_category: 'homemaker',
      social_category: 'OC',
      land_holding_band: 'none',
      language_pref: 'te',
      household_members: [],
      is_sample: true,
    },
  },
  {
    id: 'scenario_c',
    title_en: 'Scenario C: Marginal Farmer',
    title_te: 'సన్నివేశం C: సన్నకారు రైతు',
    title_hi: 'परिदृश्य C: सीमांत किसान',
    sampleInput_en: 'I am a 45-year-old farmer in Andhra Pradesh. I have a small piece of my own land (2 acres) and grow seasonal crops.',
    sampleInput_te: 'నేను ఆంధ్రప్రదేశ్‌లో 45 ఏళ్ల రైతును. నాకు 2 ఎకరాల స్వంత భూమి ఉంది, పంటలు పండిస్తున్నాను.',
    sampleInput_hi: 'मैं आंध्र प्रदेश का 45 वर्षीय किसान हूँ। मेरे पास अपनी 2 एकड़ जमीन है और मैं मौसमी फसलें उगाता हूँ।',
    profile: {
      age_band: '41_60',
      state_code: 'AP',
      district_code: 'Kurnool',
      income_band: '1_2L_to_2_5L',
      occupation_category: 'farmer',
      social_category: 'OC',
      land_holding_band: 'marginal_under_2_5_acres',
      language_pref: 'hi',
      household_members: [
        { relation: 'spouse', age_band: '41_60' },
        { relation: 'child', age_band: '18_25', education_band: 'intermediate' },
      ],
      is_sample: true,
    },
  },
];
