import { CitizenProfile } from '@/types/profile';
import { ExtractProfileResponse } from '@/types/api';

export function extractCoarseProfileFromText(
  text: string,
  _language: 'en' | 'te' | 'hi' = 'en'
): ExtractProfileResponse {
  const lower = text.toLowerCase();
  const proposed: Partial<CitizenProfile> = {
    state_code: 'AP',
    household_members: [],
  };

  // 1. Age extraction
  if (lower.includes('17') || lower.includes('16') || lower.includes('15') || lower.includes('class 10') || lower.includes('10వ తరగతి') || lower.includes('10वीं')) {
    proposed.age_band = 'under_18';
  } else if (lower.includes('68') || lower.includes('65') || lower.includes('70') || lower.includes('widow') || lower.includes('వితంతువు') || lower.includes('विधवा') || lower.includes('old age') || lower.includes('senior')) {
    proposed.age_band = '60_plus';
  } else if (lower.includes('45') || lower.includes('40') || lower.includes('50')) {
    proposed.age_band = '41_60';
  } else if (lower.includes('20') || lower.includes('22') || lower.includes('college')) {
    proposed.age_band = '18_25';
  }

  // 2. Occupation extraction
  if (lower.includes('student') || lower.includes('studying') || lower.includes('చదువు') || lower.includes('छात्र') || lower.includes('पढ़ रहा')) {
    proposed.occupation_category = 'student';
  } else if (lower.includes('farmer') || lower.includes('land') || lower.includes('crop') || lower.includes('రైతు') || lower.includes('వ్యవసాయ') || lower.includes('किसान')) {
    proposed.occupation_category = 'farmer';
  } else if (lower.includes('daily wage') || lower.includes('labor') || lower.includes('కూలీ') || lower.includes('दिहाड़ी मजदूर')) {
    proposed.occupation_category = 'daily_wage';
  } else if (lower.includes('widow') || lower.includes('వితంతువు') || lower.includes('विधवा') || lower.includes('homemaker')) {
    proposed.occupation_category = 'homemaker';
  }

  // 3. Income extraction
  if (lower.includes('tight') || lower.includes('poor') || lower.includes('daily wage') || lower.includes('no regular') || lower.includes('కష్టంగా') || lower.includes('కఠిన') || lower.includes('गरीब') || lower.includes('कठिन')) {
    proposed.income_band = 'below_1_2L';
  }

  // 4. Land holding extraction
  if (lower.includes('2 acre') || lower.includes('2 ఎకరాల') || lower.includes('2 एकड़') || lower.includes('small piece')) {
    proposed.land_holding_band = 'marginal_under_2_5_acres';
  } else if (lower.includes('no land') || lower.includes('landless') || lower.includes('భూమి లేదు') || lower.includes('भूमिहीन')) {
    proposed.land_holding_band = 'none';
  }

  // Identify missing critical fields
  const missingCritical: string[] = [];
  if (!proposed.age_band || proposed.age_band === 'unknown') missingCritical.push('age_band');
  if (!proposed.income_band || proposed.income_band === 'unknown') missingCritical.push('income_band');
  if (!proposed.occupation_category || proposed.occupation_category === 'unknown') missingCritical.push('occupation_category');

  const clarifyingQuestions = [
    {
      field_name: 'income_band',
      question_en: 'What is your approximate family annual income bracket?',
      question_te: 'మీ కుటుంబ వార్షిక ఆదాయం సుమారుగా ఎంత?',
      question_hi: 'आपके परिवार की अनुमानित वार्षिक आय किस श्रेणी में आती है?',
      options: [
        { value: 'below_1_2L', label_en: 'Below ₹1.2 Lakhs / year', label_te: '₹1.2 లక్షల లోపు', label_hi: '₹1.2 लाख से कम' },
        { value: '1_2L_to_2_5L', label_en: '₹1.2L to ₹2.5L / year', label_te: '₹1.2 నుండి ₹2.5 లక్షలు', label_hi: '₹1.2 लाख से ₹2.5 लाख' },
        { value: '2_5L_to_5L', label_en: '₹2.5L to ₹5L / year', label_te: '₹2.5 నుండి ₹5 లక్షలు', label_hi: '₹2.5 लाख से ₹5 लाख' },
        { value: 'above_5L', label_en: 'Above ₹5 Lakhs / year', label_te: '₹5 లక్షల పైబడి', label_hi: '₹5 लाख से अधिक' },
      ],
    },
    {
      field_name: 'land_holding_band',
      question_en: 'Do you or your family own agricultural farmland?',
      question_te: 'మీకు లేదా మీ కుటుంబానికి వ్యవసాయ భూమి ఉందా?',
      question_hi: 'क्या आपके या आपके परिवार के पास कृषि भूमि है?',
      options: [
        { value: 'none', label_en: 'No farmland (Landless)', label_te: 'వ్యవసాయ భూమి లేదు', label_hi: 'कोई कृषि भूमि नहीं है' },
        { value: 'marginal_under_2_5_acres', label_en: 'Less than 2.5 acres', label_te: '2.5 ఎకరాల లోపు', label_hi: '2.5 एकड़ से कम' },
        { value: 'small_2_5_to_5_acres', label_en: '2.5 to 5 acres', label_te: '2.5 నుండి 5 ఎకరాలు', label_hi: '2.5 से 5 एकड़' },
        { value: 'large_above_5_acres', label_en: 'More than 5 acres', label_te: '5 ఎకరాల పైబడి', label_hi: '5 एकड़ से अधिक' },
      ],
    },
  ];

  return {
    proposed_profile: proposed,
    missing_critical_fields: missingCritical,
    clarifying_questions: clarifyingQuestions.slice(0, 3),
    is_fallback: true,
  };
}
