import type { CitizenProfile, HouseholdMember } from '../types/profile';
import type { ClarifyingQuestion, ExtractProfileResponse } from '../types/api';
import type { SupportedLanguage } from '../types/i18n';
import { AP_DISTRICT_OPTIONS } from '../config/bands.js';
import { SYNTHETIC_SCENARIOS, APP_CONSTANTS } from '../config/constants.js';
import { normalizeIndicDigits, inspectTextForPii } from '../utils/piiValidator.js';

function mapNumericAgeToBand(age: number): CitizenProfile['age_band'] | undefined {
  if (age <= 0 || age > 120) return undefined;
  if (age < 18) return 'under_18';
  if (age <= 25) return '18_25';
  if (age <= 40) return '26_40';
  if (age <= 60) return '41_60';
  return '60_plus';
}

function mapAcresToLandBand(acres: number): CitizenProfile['land_holding_band'] {
  if (acres <= 0) return 'none';
  if (acres < 2.5) return 'marginal_under_2_5_acres';
  if (acres <= 5) return 'small_2_5_to_5_acres';
  return 'large_above_5_acres';
}

function mapAnnualRupeesToIncomeBand(rupees: number): CitizenProfile['income_band'] {
  if (rupees <= 120000) return 'below_1_2L';
  if (rupees <= 250000) return '1_2L_to_2_5L';
  if (rupees <= 500000) return '2_5L_to_5L';
  return 'above_5L';
}

/**
 * Deterministic, word-bounded, negation-aware trilingual profile extractor
 * supporting English, Telugu, and Hindi plain-language descriptions.
 * Used both offline in the browser and as a zero-key fallback in `/api/profile/extract`.
 */
export function extractCoarseProfileFromText(
  rawText: string,
  _language: SupportedLanguage = 'en'
): ExtractProfileResponse {
  // Always strip PII before extracting so ID digits never collide with age/income numbers
  const piiSafe = inspectTextForPii(rawText).sanitizedText;
  const normalized = normalizeIndicDigits(piiSafe);
  const lower = normalized.toLowerCase();

  const proposed: Partial<CitizenProfile> = {
    state_code: 'AP',
    household_members: [],
  };
  const extractedFields: string[] = [];
  const members: HouseholdMember[] = [];

  // --- 0. Check if exact synthetic scenario text was submitted unchanged ---
  for (const sc of SYNTHETIC_SCENARIOS) {
    const trimmed = rawText.trim();
    if (
      trimmed === sc.sampleInput_en.trim() ||
      trimmed === sc.sampleInput_te.trim() ||
      trimmed === sc.sampleInput_hi.trim()
    ) {
      return {
        proposed_profile: { ...sc.profile },
        extracted_fields: [
          'age_band',
          'district_code',
          'income_band',
          'occupation_category',
          'land_holding_band',
          'social_category',
        ],
        missing_critical_fields: [],
        clarifying_questions: [],
        is_fallback: true,
        extraction_source: 'preset',
      };
    }
  }

  // --- 1. Detect Child / Student Household Mentions vs Self Student ---
  const mentionsChildRelation =
    /\b(my\s+(?:son|daughter|child|children|kids?|girl|boy)|two\s+children|three\s+children)\b/u.test(lower) ||
    /(నా\s*(?:కొడుకు|కుమారుడు|కూతురు|కుమార్తె|పిల్లలు|బిడ్డ)|మా\s*(?:పిల్లలు|అబ్బాయి|అమ్మాయి))/u.test(lower) ||
    /(मेरा\s*बेटा|मेरी\s*बेटी|मेरे\s*बच्चे|बच्चा|बच्ची)/u.test(lower);

  const mentionsSchoolClass =
    /\b(?:class|grade|std|standard)\s*(?:1[0-2]|[1-9])\b|\b(?:[1-9]|1[0-2])(?:st|nd|rd|th)\s*(?:class|standard|grade)\b|\bschool\b/u.test(lower) ||
    /(?:[1-9]|1[0-2])\s*వ\s*తరగతి|పాఠశాల|బడి/u.test(lower) ||
    /(?:[1-9]|1[0-2])\s*(?:वीं|वी)\s*(?:कक्षा)?|स्कूल|विद्यालय/u.test(lower);

  const mentionsCollegeOrClass10 =
    /\b(?:class\s*10|10th|ssc|inter|intermediate|11th|12th|polytechnic|iti|diploma|degree|b\.?tech|b\.?sc|b\.?com|b\.?a|college)\b/u.test(lower) ||
    /(?:10\s*వ\s*తరగతి|ఇంటర్|ఇంటర్మీడియట్|పాలిటెక్నిక్|డిగ్రీ|కళాశాల|కాలేజీ)/u.test(lower) ||
    /(?:10\s*वीं|दसवीं|इंटर|इंटरमीडिएट|पॉलिटेक्निक|डिग्री|कॉलेज|महाविद्यालय)/u.test(lower);

  if (mentionsChildRelation && (mentionsSchoolClass || mentionsCollegeOrClass10)) {
    proposed.has_school_student = 'yes';
    extractedFields.push('has_school_student');
    members.push({
      relation: 'child',
      age_band: mentionsCollegeOrClass10 && !mentionsSchoolClass ? '18_25' : 'under_18',
      education_band: mentionsCollegeOrClass10 ? 'intermediate' : 'class_10',
    });
    if (mentionsCollegeOrClass10) {
      proposed.has_college_student = 'yes';
      extractedFields.push('has_college_student');
    }
  }

  // --- 2. Contextual Speaker Age Extraction (1–120 across ALL 5 bands!) ---
  // Avoid matching numbers attached to acres, rupees, lakhs, classes, or child age when "my son is 12"
  const selfAgePatterns = [
    /\b(?:i\s+am|i'm|im|my\s+age\s+is|aged?)\s*(\d{1,3})\s*(?:years?\s*old|yrs?\s*old|yr\s*old|years?|yrs?)?(?!\s*(?:acres?|lakh|lakhs|class|th\s+class|grade))\b/u,
    /\b(\d{1,3})\s*(?:-\s*)?(?:years?\s*old|yrs?\s*old|yr\s*old)\b/u,
    /(?:నా\s*వయస్సు|నాకు)\s*(\d{1,3})\s*(?:ఏళ్లు|సంవత్సరాలు)?/u,
    /(\d{1,3})\s*(?:ఏళ్ల|ఏళ్లు|సంవత్సరాల|సంవత్సరాలు)/u,
    /(?:मेरी\s*उम्र|मेरी\s*आयु|मैं)\s*(\d{1,3})\s*(?:वर्ष|साल|वर्षीय)?/u,
    /(\d{1,3})\s*(?:वर्षीय|साल\s*का|साल\s*की|वर्ष\s*का|वर्ष\s*की)/u,
  ];

  for (const pat of selfAgePatterns) {
    const m = lower.match(pat);
    if (m && m[1]) {
      const parsedAge = Number(m[1]);
      const band = mapNumericAgeToBand(parsedAge);
      if (band) {
        proposed.age_band = band;
        extractedFields.push('age_band');
        break;
      }
    }
  }

  // Fallback non-numeric age cues (only if no explicit numeric age was found)
  if (!proposed.age_band) {
    const negatedSenior = /\b(?:not|no)\s+(?:a\s+)?(?:senior|old|elderly)\b/u.test(lower);
    if (
      !negatedSenior &&
      (/\b(?:senior\s+citizen|elderly|old\s+age|grandmother|grandfather)\b/u.test(lower) ||
        /(?:వృద్ధ|వృద్ధురాలు|వృద్ధుడు|సీనియర్\s*సిటిజన్)/u.test(lower) ||
        /(?:वरिष्ठ\s*नागरिक|बुजुर्ग|वृद्ध)/u.test(lower))
    ) {
      proposed.age_band = '60_plus';
      extractedFields.push('age_band');
    } else if (!mentionsChildRelation && mentionsSchoolClass) {
      proposed.age_band = 'under_18';
      extractedFields.push('age_band');
    } else if (!mentionsChildRelation && mentionsCollegeOrClass10) {
      proposed.age_band = '18_25';
      extractedFields.push('age_band');
    }
  }

  // --- 3. Widow / Disability / Vulnerability Flags ---
  if (
    !/\bnot\s+a?\s*widow\b/u.test(lower) &&
    (/\b(?:widow|widowed|husband\s+(?:died|passed\s+away)|single\s+woman|destitute\s+woman)\b/u.test(lower) ||
      /(?:వితంతువు|వితంతువును|భర్త\s*చనిపో|ఒంటరి\s*మహిళ)/u.test(lower) ||
      /(?:विधवा|पति\s*की\s*मृत्यु|पति\s*गुजर|एकल\s*महिला)/u.test(lower))
  ) {
    proposed.is_widow_or_single_woman = 'yes';
    extractedFields.push('is_widow_or_single_woman');
  }

  if (
    !/\b(?:no|not|without)\s+(?:any\s+)?disabilit/u.test(lower) &&
    (/\b(?:disabled|disability|handicapped|sadarem|divyang|wheelchair|blind|deaf)\b/u.test(lower) ||
      /(?:దివ్యాంగ|వికలాంగ|సదరం)/u.test(lower) ||
      /(?:दिव्यांग|विकलांग)/u.test(lower))
  ) {
    proposed.has_disability = 'yes';
    extractedFields.push('has_disability');
  }

  // --- 4. Land Holding & Tenant Farmer (CCRC) — Check Landlessness/Tenancy BEFORE 'land'! ---
  const isTenant =
    /\b(?:tenant\s+farmer|leased?\s+land|on\s+lease|sharecropper|ccrc|koulu)\b/u.test(lower) ||
    /(?:కౌలు\s*రైతు|కౌలుకు|కౌలు\s*భూమి|ccrc)/u.test(lower) ||
    /(?:बटाईदार|किराये\s*की\s*जमीन|लीज\s*पर\s*खेती|पट्टे\s*पर)/u.test(lower);

  const isLandless =
    /\b(?:landless|no\s+(?:agricultural\s+|farm\s*|own\s+)?land|without\s+land|don'?t\s+(?:have|own)\s+(?:any\s+)?land|zero\s+land)\b/u.test(lower) ||
    /(?:భూమి\s*లేదు|భూమిలేని|స్వంత\s*భూమి\s*లేదు|ఎటువంటి\s*భూమి\s*లేదు)/u.test(lower) ||
    /(?:भूमिहीन|कोई\s*(?:कृषि\s*)?(?:जमीन|भूमि)\s*नहीं|जमीन\s*नहीं\s*है)/u.test(lower);

  if (isTenant) {
    proposed.is_tenant_farmer_ccrc = 'yes';
    proposed.occupation_category = 'farmer';
    extractedFields.push('is_tenant_farmer_ccrc', 'occupation_category');
    if (isLandless || !/\bown\b/u.test(lower)) {
      proposed.land_holding_band = 'none';
      extractedFields.push('land_holding_band');
    }
  } else if (isLandless) {
    proposed.land_holding_band = 'none';
    extractedFields.push('land_holding_band');
  } else {
    // Parse exact decimal/integer acres with word boundaries so '12 acres' never matches '2 acres'!
    const acreMatch =
      lower.match(/\b(\d{1,3}(?:\.\d+)?)\s*(?:acres?|ac\b)/u) ||
      lower.match(/(\d{1,3}(?:\.\d+)?)\s*(?:ఎకరా(?:లు|ల)?|एकड़)/u);
    if (acreMatch && acreMatch[1]) {
      const acres = parseFloat(acreMatch[1]);
      proposed.land_holding_band = mapAcresToLandBand(acres);
      extractedFields.push('land_holding_band');
    } else if (
      /\b(?:small\s+piece\s+of\s+(?:my\s+own\s+)?land|marginal\s+land|half\s+acre|one\s+acre|two\s+acres)\b/u.test(lower) ||
      /(?:చిన్న\s*భూమి|సన్నకారు\s*భూమి)/u.test(lower) ||
      /(?:छोटा\s*खेत|थोड़ी\s*जमीन)/u.test(lower)
    ) {
      proposed.land_holding_band = 'marginal_under_2_5_acres';
      extractedFields.push('land_holding_band');
    }
  }

  // --- 5. Occupation Extraction (Negation-Aware!) ---
  if (!proposed.occupation_category) {
    const notFarmer = /\b(?:not|never)\s+(?:a\s+)?farmer\b/u.test(lower) || /రైతు\s*కాదు/u.test(lower) || /किसान\s*नहीं/u.test(lower);
    const notStudent = /\b(?:not)\s+(?:a\s+)?(?:student|studying)\b/u.test(lower);

    // Self student (only if not talking exclusively about a child!)
    if (
      !notStudent &&
      !mentionsChildRelation &&
      (/\b(?:i\s+am\s+(?:a\s+)?student|studying\s+in|i\s+study)\b/u.test(lower) ||
        /(?:నేను.*చదువుతున్నాను|విద్యార్థిని|విద్యార్థి)/u.test(lower) ||
        /(?:मैं.*पढ़\s*रहा|मैं.*पढ़\s*रही|छात्र\s*हूँ|छात्रा\s*हूँ)/u.test(lower))
    ) {
      proposed.occupation_category = 'student';
      proposed.has_school_student = 'yes';
      if (mentionsCollegeOrClass10) proposed.has_college_student = 'yes';
      extractedFields.push('occupation_category');
    } else if (
      /\b(?:daily[\s-]*wage|labour(?:er)?|labor(?:er)?|coolie|construction\s+worker|farm\s+worker|agricultural\s+worker|nrega|mnrega)\b/u.test(lower) ||
      /(?:కూలీ|దినసరి\s*కూలీ|వ్యవసాయ\s*కూలీ|కార్మికు)/u.test(lower) ||
      /(?:दिहाड़ी|मजदूर|श्रमिक|मजदूरी)/u.test(lower)
    ) {
      // Note: if speaker is a student mentioning "my parents are daily wage workers", keep student!
      proposed.occupation_category = 'daily_wage';
      extractedFields.push('occupation_category');
    } else if (
      !notFarmer &&
      (/\b(?:farmer|farming|cultivat(?:e|ing|or)|grow(?:ing)?\s+(?:seasonal\s+)?crops?|agriculture)\b/u.test(lower) ||
        /(?:రైతు|రైతును|వ్యవసాయం|పంటలు\s*పండి)/u.test(lower) ||
        /(?:किसान|खेती|फसलें?\s*उगा)/u.test(lower))
    ) {
      proposed.occupation_category = 'farmer';
      extractedFields.push('occupation_category');
    } else if (
      /\b(?:weaver|handloom|artisan|tailor|vendor|street\s+vendor|auto\s+driver|rickshaw|carpenter|potter|fisherman)\b/u.test(lower) ||
      /(?:చేనేత|నేత|టైలర్|వ్యాపారి|ఆటో\s*డ్రైవర్|మత్స్యకార)/u.test(lower) ||
      /(?:बुनकर|दर्जी|फेरीवाला|ऑटो\s*चालक|कारीगर)/u.test(lower)
    ) {
      proposed.occupation_category = 'self_employed';
      extractedFields.push('occupation_category');
    } else if (
      /\b(?:unemployed|no\s+job|jobless|looking\s+for\s+work)\b/u.test(lower) ||
      /(?:నిరుద్యోగి|ఉద్యోగం\s*లేదు)/u.test(lower) ||
      /(?:बेरोजगार|कोई\s*काम\s*नहीं)/u.test(lower)
    ) {
      proposed.occupation_category = 'unemployed';
      extractedFields.push('occupation_category');
    } else if (
      proposed.is_widow_or_single_woman === 'yes' ||
      /\b(?:homemaker|housewife)\b/u.test(lower) ||
      /(?:గృహిణి|ఇంటి\s*పని)/u.test(lower) ||
      /(?:गृहिणी)/u.test(lower)
    ) {
      proposed.occupation_category = 'homemaker';
      extractedFields.push('occupation_category');
    }
  }

  // --- 6. Income & White Ration Card Proxy Extraction ---
  if (
    /\b(?:white\s+(?:ration|rice)\s+card|rice\s+card|bpl\s+card|antar?yodaya)\b/u.test(lower) ||
    /(?:తెల్ల\s*(?:రేషన్|రైస్)\s*కార్డు|రైస్\s*కార్డు|బిపిఎల్)/u.test(lower) ||
    /(?:सफेद\s*राशन\s*कार्ड|राइस\s*कार्ड|बीपीएल)/u.test(lower)
  ) {
    proposed.has_white_ration_card = 'yes';
    proposed.income_band = 'below_1_2L';
    extractedFields.push('has_white_ration_card', 'income_band');
  }

  // Parse explicit lakh figures (e.g. "1.5 lakhs", "₹2 lakh", "1.5 లక్షలు", "1.5 लाख")
  const lakhMatch =
    lower.match(/(?:₹|rs\.?\s*)?(\d{1,2}(?:\.\d+)?)\s*(?:lakhs?|lacs?|లక్ష(?:లు|ల)?|लाख)/u);
  if (lakhMatch && lakhMatch[1]) {
    const rupees = parseFloat(lakhMatch[1]) * 100000;
    proposed.income_band = mapAnnualRupeesToIncomeBand(rupees);
    extractedFields.push('income_band');
  } else {
    // Parse explicit rupee figures (e.g. "8,000 per month", "90,000 a year", "₹90000")
    const monthlyMatch = lower.match(
      /(?:₹|rs\.?\s*)?(\d{1,3}(?:,\d{3})+|\d{4,6})\s*(?:per\s*month|\/\s*month|a\s*month|monthly|నెలకు|प्रति\s*माह|महीना)/u
    );
    const yearlyMatch = lower.match(
      /(?:earn(?:ing)?|income(?:\s+is)?|ఆదాయం|आय)\s*(?:around|about|is|సుమారు)?\s*(?:₹|rs\.?\s*)?(\d{1,3}(?:,\d{2,3})+|\d{4,6})/u
    );
    if (monthlyMatch && monthlyMatch[1]) {
      const monthly = Number(monthlyMatch[1].replace(/,/g, ''));
      proposed.income_band = mapAnnualRupeesToIncomeBand(monthly * 12);
      extractedFields.push('income_band');
    } else if (yearlyMatch && yearlyMatch[1]) {
      const yearly = Number(yearlyMatch[1].replace(/,/g, ''));
      // If <= 15000 without explicit unit, likely monthly rural wage; otherwise annual
      const annualized = yearly <= 15000 ? yearly * 12 : yearly;
      proposed.income_band = mapAnnualRupeesToIncomeBand(annualized);
      extractedFields.push('income_band');
    }
  }

  if (
    !proposed.income_band &&
    (/\b(?:money\s+is\s+tight|poor|low\s+income|no\s+(?:regular\s+)?(?:pension|income)|very\s+little\s+income|bpl|struggling)\b/u.test(lower) ||
      /(?:ఆదాయం\s*లేదు|పెన్షన్\s*లేదు|పేద|కష్టంగా\s*ఉంది|తక్కువ\s*ఆదాయం|కూలీ)/u.test(lower) ||
      /(?:आय\s*नहीं|पेंशन\s*नहीं|गरीब|कठिन\s*है|कम\s*आय|दिहाड़ी)/u.test(lower))
  ) {
    proposed.income_band = 'below_1_2L';
    extractedFields.push('income_band');
  }

  // --- 7. Social Category Extraction ---
  if (/\b(?:scheduled\s+caste|\bsc\b|dalit|మాల|మాదిగ|ఎస్సీ)\b/u.test(lower)) {
    proposed.social_category = 'SC';
    extractedFields.push('social_category');
  } else if (/\b(?:scheduled\s+tribe|\bst\b|tribal|adivasi|గిరిజన|ఎస్టీ)\b/u.test(lower)) {
    proposed.social_category = 'ST';
    extractedFields.push('social_category');
  } else if (/\b(?:backward\s+class|\bbc\b|\bobc\b|బీసీ)\b/u.test(lower)) {
    proposed.social_category = 'BC';
    extractedFields.push('social_category');
  } else if (/\b(?:minority|muslim|christian|మైనారిటీ)\b/u.test(lower)) {
    proposed.social_category = 'minority';
    extractedFields.push('social_category');
  } else if (/\b(?:open\s+category|\boc\b|\bews\b|కాపు|ఓసీ)\b/u.test(lower)) {
    proposed.social_category = 'OC';
    extractedFields.push('social_category');
  }

  // --- 8. Andhra Pradesh District Extraction (All 26 Districts in EN / TE / HI!) ---
  for (const dist of AP_DISTRICT_OPTIONS) {
    const enLower = dist.value.toLowerCase();
    const shortEn = enLower.replace('dr. b.r. ambedkar ', '').replace('sri potti sriramulu ', '');
    if (
      lower.includes(enLower) ||
      (shortEn.length >= 4 && lower.includes(shortEn)) ||
      rawText.includes(dist.label_te) ||
      rawText.includes(dist.label_hi) ||
      (dist.value === 'NTR' && (lower.includes('vijayawada') || rawText.includes('విజయవాడ') || rawText.includes('विजयवाड़ा'))) ||
      (dist.value === 'Visakhapatnam' && (lower.includes('vizag') || rawText.includes('వైజాగ్')))
    ) {
      proposed.district_code = dist.value;
      extractedFields.push('district_code');
      break;
    }
  }

  proposed.household_members = members;

  // --- 9. High-Information-Gain Skippable Clarifying Questions (Max 3, Everyday Proxies!) ---
  const candidateQuestions: ClarifyingQuestion[] = [];

  if (!proposed.income_band || proposed.income_band === 'unknown') {
    candidateQuestions.push({
      field_name: 'income_band',
      priority_unlock_count: 6,
      question_en: 'Does your family hold a White Ration / Rice Card (or earn below ₹1.2 Lakhs/year)?',
      question_te: 'మీ కుటుంబానికి తెల్ల రేషన్ / రైస్ కార్డు ఉందా (లేదా వార్షిక ఆదాయం ₹1.2 లక్షల లోపు ఉందా)?',
      question_hi: 'क्या आपके परिवार के पास सफेद राशन / राइस कार्ड है (या वार्षिक आय ₹1.2 लाख से कम है)?',
      helper_en: 'Used by 6 schemes including Talliki Vandanam, NTR Bharosa, Vaidya Seva & Deepam 2.0.',
      helper_te: 'తల్లికి వందనం, ఎన్టీఆర్ భరోసా, వైద్య సేవ మరియు దీపం 2.0 పథకాలకు ఇది కీలకం.',
      helper_hi: 'तल्लिकी वंदनम, एनटीआर भरोसा, वैद्य सेवा और दीपम 2.0 सहित 6 योजनाओं के लिए उपयोगी।',
      options: [
        {
          value: 'below_1_2L',
          label_en: 'Yes — White Rice Card / Below ₹1.2L',
          label_te: 'అవును — తెల్ల రైస్ కార్డు / ₹1.2 లక్షల లోపు',
          label_hi: 'हाँ — सफेद राइस कार्ड / ₹1.2 लाख से कम',
        },
        {
          value: '1_2L_to_2_5L',
          label_en: '₹1.2 Lakhs to ₹2.5 Lakhs / year',
          label_te: '₹1.2 నుండి ₹2.5 లక్షలు',
          label_hi: '₹1.2 लाख से ₹2.5 लाख / वर्ष',
        },
        {
          value: '2_5L_to_5L',
          label_en: '₹2.5 Lakhs to ₹5 Lakhs / year',
          label_te: '₹2.5 నుండి ₹5 లక్షలు',
          label_hi: '₹2.5 लाख से ₹5 लाख / वर्ष',
        },
        {
          value: 'above_5L',
          label_en: 'Above ₹5 Lakhs / year',
          label_te: '₹5 లక్షల పైబడి',
          label_hi: '₹5 लाख से अधिक',
        },
      ],
    });
  }

  if (!proposed.occupation_category || proposed.occupation_category === 'unknown') {
    candidateQuestions.push({
      field_name: 'occupation_category',
      priority_unlock_count: 4,
      question_en: 'What is your primary work or household role?',
      question_te: 'మీ ప్రధాన వృత్తి ఏమిటి?',
      question_hi: 'आपका मुख्य काम या व्यवसाय क्या है?',
      options: [
        { value: 'daily_wage', label_en: 'Daily-Wage / Coolie Worker', label_te: 'దినసరి కూలీ', label_hi: 'दिहाड़ी मजदूर' },
        { value: 'farmer', label_en: 'Farmer / Cultivator', label_te: 'రైతు / సాగుదారు', label_hi: 'किसान' },
        { value: 'homemaker', label_en: 'Homemaker / Rural Woman', label_te: 'గృహిణి / మహిళ', label_hi: 'गृहिणी / महिला' },
        { value: 'student', label_en: 'Student', label_te: 'విద్యార్థి', label_hi: 'छात्र / छात्रा' },
      ],
    });
  }

  if (
    (!proposed.land_holding_band || proposed.land_holding_band === 'unknown') &&
    proposed.occupation_category !== 'student'
  ) {
    candidateQuestions.push({
      field_name: 'land_holding_band',
      priority_unlock_count: 3,
      question_en: 'Does your household own or lease agricultural farmland?',
      question_te: 'మీ కుటుంబానికి వ్యవసాయ భూమి ఉందా (లేదా కౌలుకు సాగు చేస్తున్నారా)?',
      question_hi: 'क्या आपके परिवार के पास कृषि भूमि है (या लीज/बटाई पर खेती करते हैं)?',
      helper_en: 'Unlocks Annadata Sukhibhava, PM-KISAN & NTR Bharosa land ceiling checks.',
      helper_te: 'అన్నదాత సుఖీభవ, పీఎం కిసాన్ మరియు ఎన్టీఆర్ భరోసా అర్హతను నిర్ధారిస్తుంది.',
      helper_hi: 'अन्नदाता सुखीभव, पीएम किसान और एनटीआर भरोसा की जांच के लिए।',
      options: [
        { value: 'none', label_en: 'No owned land (Landless)', label_te: 'స్వంత భూమి లేదు', label_hi: 'कोई निजी जमीन नहीं' },
        {
          value: 'tenant_ccrc',
          label_en: 'Leased land (CCRC Tenant Farmer)',
          label_te: 'కౌలు రైతు (CCRC కార్డు)',
          label_hi: 'बटाईदार किसान (CCRC)',
        },
        {
          value: 'marginal_under_2_5_acres',
          label_en: 'Own under 2.5 acres',
          label_te: '2.5 ఎకరాల లోపు స్వంత భూమి',
          label_hi: '2.5 एकड़ से कम निजी जमीन',
        },
        {
          value: 'small_2_5_to_5_acres',
          label_en: 'Own 2.5 to 5 acres',
          label_te: '2.5 నుండి 5 ఎకరాలు',
          label_hi: '2.5 से 5 एकड़ जमीन',
        },
      ],
    });
  }

  if (
    proposed.has_school_student === undefined &&
    proposed.occupation_category !== 'student' &&
    proposed.age_band !== 'under_18'
  ) {
    candidateQuestions.push({
      field_name: 'has_school_student',
      priority_unlock_count: 2,
      question_en: 'Is any child in your home studying in School (Class 1–12) or College?',
      question_te: 'మీ ఇంట్లో పాఠశాల (1–12 తరగతి) లేదా కాలేజీలో చదువుతున్న పిల్లలు ఉన్నారా?',
      question_hi: 'क्या आपके घर में कोई बच्चा स्कूल (कक्षा 1–12) या कॉलेज में पढ़ता है?',
      helper_en: 'Unlocks ₹15,000/yr Talliki Vandanam & Post-Matric Scholarships.',
      helper_te: '₹15,000 తల్లికి వందనం మరియు పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్‌ల కోసం.',
      helper_hi: '₹15,000 तल्लिकी वंदनम और पोस्ट-मैट्रिक छात्रवृत्ति के लिए।',
      options: [
        { value: 'school_only', label_en: 'Yes — School (Class 1–12)', label_te: 'అవును — పాఠశాల (1–12 తరగతి)', label_hi: 'हाँ — स्कूल (कक्षा 1–12)' },
        { value: 'college', label_en: 'Yes — Class 10 / Inter / College', label_te: 'అవును — 10వ తరగతి / కాలేజీ', label_hi: 'हाँ — कक्षा 10 / कॉलेज' },
        { value: 'no', label_en: 'No students in home', label_te: 'లేరు', label_hi: 'कोई छात्र नहीं' },
      ],
    });
  }

  if (!proposed.age_band || proposed.age_band === 'unknown') {
    candidateQuestions.push({
      field_name: 'age_band',
      priority_unlock_count: 2,
      question_en: 'Which age group are you in?',
      question_te: 'మీ వయోపరిమితి ఏమిటి?',
      question_hi: 'आप किस आयु वर्ग में हैं?',
      options: [
        { value: 'under_18', label_en: 'Under 18 yrs', label_te: '18 ఏళ్ల లోపు', label_hi: '18 वर्ष से कम' },
        { value: '18_25', label_en: '18–25 yrs', label_te: '18–25 ఏళ్లు', label_hi: '18–25 वर्ष' },
        { value: '26_40', label_en: '26–40 yrs', label_te: '26–40 ఏళ్లు', label_hi: '26–40 वर्ष' },
        { value: '41_60', label_en: '41–60 yrs', label_te: '41–60 ఏళ్లు', label_hi: '41–60 वर्ष' },
        { value: '60_plus', label_en: '60+ yrs (Senior)', label_te: '60+ ఏళ్లు', label_hi: '60+ वर्ष' },
      ],
    });
  }

  const missingCritical = candidateQuestions.map((q) => q.field_name);
  const sortedQuestions = candidateQuestions
    .sort((a, b) => (b.priority_unlock_count || 0) - (a.priority_unlock_count || 0))
    .slice(0, APP_CONSTANTS.MAX_CLARIFYING_QUESTIONS);

  return {
    proposed_profile: proposed,
    extracted_fields: Array.from(new Set(extractedFields)),
    missing_critical_fields: missingCritical,
    clarifying_questions: sortedQuestions,
    is_fallback: true,
    extraction_source: 'deterministic_nlp',
  };
}

/**
 * Hybrid client extractor: attempts serverless `/api/profile/extract` (Claude Haiku + Server PII Gate)
 * when deployed on Vercel with `ANTHROPIC_API_KEY`, and gracefully falls back to the deterministic
 * trilingual parser offline or in local Vite dev mode.
 */
export async function extractProfileHybrid(
  text: string,
  language: SupportedLanguage = 'en'
): Promise<ExtractProfileResponse> {
  // Fast-path exact synthetic scenario presets with zero network wait
  for (const sc of SYNTHETIC_SCENARIOS) {
    const trimmed = text.trim();
    if (
      trimmed === sc.sampleInput_en.trim() ||
      trimmed === sc.sampleInput_te.trim() ||
      trimmed === sc.sampleInput_hi.trim()
    ) {
      return extractCoarseProfileFromText(text, language);
    }
  }

  const localResult = extractCoarseProfileFromText(text, language);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const resp = await fetch('/api/profile/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const apiData = (await resp.json()) as ExtractProfileResponse;
        if (apiData && apiData.proposed_profile) {
          return {
            ...localResult,
            ...apiData,
            proposed_profile: {
              ...localResult.proposed_profile,
              ...apiData.proposed_profile,
            },
          };
        }
      }
    }
  } catch {
    // Offline or Vite local dev without serverless runtime -> use deterministic multilingual NLP
  }

  return localResult;
}
