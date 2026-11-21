// Standardized Coarse Profile Bands, District Translations & Human-Readable Formatters
// Guardrails: Coarse categories only. Zero raw enum slugs exposed to citizens.
import type { SupportedLanguage } from '../types/i18n';
import type { RuleOperator } from '../types/scheme';

export interface BandOption<T extends string> {
  value: T;
  label_en: string;
  label_te: string;
  label_hi: string;
  description_en?: string;
  description_te?: string;
  description_hi?: string;
}

export const AGE_BANDS: BandOption<string>[] = [
  {
    value: 'under_18',
    label_en: 'Under 18 years (Minor / School Student)',
    label_te: '18 ఏళ్ల లోపు (మైనర్ / పాఠశాల విద్యార్థి)',
    label_hi: '18 वर्ष से कम (नाबालिग / स्कूली छात्र)',
  },
  {
    value: '18_25',
    label_en: '18 to 25 years (Youth / College Student)',
    label_te: '18 నుండి 25 ఏళ్లు (యువత / కళాశాల విద్యార్థి)',
    label_hi: '18 से 25 वर्ष (युवा / कॉलेज छात्र)',
  },
  {
    value: '26_40',
    label_en: '26 to 40 years (Young Adult / Parent)',
    label_te: '26 నుండి 40 ఏళ్లు (యువ వయోజనులు / తల్లిదండ్రులు)',
    label_hi: '26 से 40 वर्ष (वयस्क / अभिभावक)',
  },
  {
    value: '41_60',
    label_en: '41 to 60 years (Middle-aged)',
    label_te: '41 నుండి 60 ఏళ్లు (మధ్యవయస్కులు)',
    label_hi: '41 से 60 वर्ष (मध्यम आयु वर्ग)',
  },
  {
    value: '60_plus',
    label_en: '60+ years (Senior Citizen)',
    label_te: '60 ఏళ్లు పైబడిన వారు (సీనియర్ సిటిజన్)',
    label_hi: '60+ वर्ष (वरिष्ठ नागरिक)',
  },
];

export const INCOME_BANDS: BandOption<string>[] = [
  {
    value: 'below_1_2L',
    label_en: 'Below ₹1.2 Lakhs / year (White Rice Card / Rural BPL)',
    label_te: 'సంవత్సరానికి ₹1.2 లక్షల లోపు (తెల్ల రేషన్ కార్డు / బిపిఎల్)',
    label_hi: '₹1.2 लाख / वर्ष से कम (सफेद राशन कार्ड / बीपीएल)',
  },
  {
    value: '1_2L_to_2_5L',
    label_en: '₹1.2 Lakhs to ₹2.5 Lakhs / year',
    label_te: 'సంవత్సరానికి ₹1.2 నుండి ₹2.5 లక్షలు',
    label_hi: '₹1.2 लाख से ₹2.5 लाख / वर्ष',
  },
  {
    value: '2_5L_to_5L',
    label_en: '₹2.5 Lakhs to ₹5 Lakhs / year',
    label_te: 'సంవత్సరానికి ₹2.5 నుండి ₹5 లక్షలు',
    label_hi: '₹2.5 लाख से ₹5 लाख / वर्ष',
  },
  {
    value: 'above_5L',
    label_en: 'Above ₹5 Lakhs / year',
    label_te: 'సంవత్సరానికి ₹5 లక్షల పైబడి',
    label_hi: '₹5 लाख / वर्ष से अधिक',
  },
];

export const OCCUPATION_CATEGORIES: BandOption<string>[] = [
  {
    value: 'farmer',
    label_en: 'Small / Marginal / Tenant Farmer',
    label_te: 'రైతు (సన్నకారు / చిన్నకారు / కౌలు రైతు)',
    label_hi: 'छोटे / सीमांत / बटाईदार किसान',
  },
  {
    value: 'daily_wage',
    label_en: 'Daily-Wage / Construction / Farm Labourer',
    label_te: 'దినసరి కూలీ / వ్యవసాయ కూలీ / భవన నిర్మాణ కార్మికులు',
    label_hi: 'दिहाड़ी मजदूर / कृषि व निर्माण श्रमिक',
  },
  {
    value: 'student',
    label_en: 'Student (School / College)',
    label_te: 'విద్యార్థి (పాఠశాల / కళాశాల)',
    label_hi: 'छात्र / छात्रा (स्कूल / कॉलेज)',
  },
  {
    value: 'homemaker',
    label_en: 'Homemaker / Rural Woman',
    label_te: 'గృహిణి / గ్రామీణ మహిళ',
    label_hi: 'गृहिणी / ग्रामीण महिला',
  },
  {
    value: 'self_employed',
    label_en: 'Artisan / Weaver / Street Vendor',
    label_te: 'చేతివృత్తిదారుడు / నేత కార్మికులు / చిరు వ్యాపారి',
    label_hi: 'कारीगर / बुनकर / छोटा विक्रेता',
  },
  {
    value: 'unemployed',
    label_en: 'Unemployed / Seeking Work',
    label_te: 'నిరుద్యోగి / ఉపాధి వెతుకుతున్నవారు',
    label_hi: 'बेरोजगार / काम की तलाश में',
  },
  {
    value: 'other',
    label_en: 'Other Occupation',
    label_te: 'ఇతర వృత్తి',
    label_hi: 'अन्य व्यवसाय',
  },
];

export const LAND_HOLDING_BANDS: BandOption<string>[] = [
  {
    value: 'none',
    label_en: 'No owned farmland (Landless)',
    label_te: 'స్వంత వ్యవసాయ భూమి లేదు (భూమిలేని వారు)',
    label_hi: 'कोई निजी कृषि भूमि नहीं (भूमिहीन)',
  },
  {
    value: 'marginal_under_2_5_acres',
    label_en: 'Marginal (Under 2.5 acres wet / 5 acres dry)',
    label_te: 'సన్నకారు భూమి (2.5 ఎకరాల లోపు)',
    label_hi: 'सीमांत भूमि (2.5 एकड़ से कम)',
  },
  {
    value: 'small_2_5_to_5_acres',
    label_en: 'Small (2.5 to 5 acres)',
    label_te: 'చిన్నకారు భూమి (2.5 నుండి 5 ఎకరాలు)',
    label_hi: 'छोटी जोत (2.5 से 5 एकड़)',
  },
  {
    value: 'large_above_5_acres',
    label_en: 'Large (Above 5 acres)',
    label_te: 'పెద్ద భూకమతం (5 ఎకరాల పైబడి)',
    label_hi: 'बड़ी जोत (5 एकड़ से अधिक)',
  },
];

export const SOCIAL_CATEGORIES: BandOption<string>[] = [
  {
    value: 'OC',
    label_en: 'Open Category (OC / EWS)',
    label_te: 'ఓపెన్ కేటగిరీ (OC / EWS)',
    label_hi: 'सामान्य वर्ग (OC / EWS)',
  },
  {
    value: 'BC',
    label_en: 'Backward Class (BC)',
    label_te: 'వెనుకబడిన తరగతులు (BC)',
    label_hi: 'अन्य पिछड़ा वर्ग (BC / OBC)',
  },
  {
    value: 'SC',
    label_en: 'Scheduled Caste (SC)',
    label_te: 'షెడ్యూల్డ్ కులాలు (SC)',
    label_hi: 'अनुसूचित जाति (SC)',
  },
  {
    value: 'ST',
    label_en: 'Scheduled Tribe (ST)',
    label_te: 'షెడ్యూల్డ్ తెగలు (ST)',
    label_hi: 'अनुसूचित जनजाति (ST)',
  },
  {
    value: 'minority',
    label_en: 'Minority Community',
    label_te: 'మైనారిటీ వర్గం',
    label_hi: 'अल्पसंख्यक समुदाय',
  },
];

export const TRI_STATE_OPTIONS: BandOption<'yes' | 'no' | 'unknown'>[] = [
  { value: 'yes', label_en: 'Yes', label_te: 'అవును', label_hi: 'हाँ' },
  { value: 'no', label_en: 'No', label_te: 'కాదు / లేదు', label_hi: 'नहीं' },
  { value: 'unknown', label_en: 'Not sure / Skip', label_te: 'తెలియదు / దాటవేయి', label_hi: 'पता नहीं / छोड़ें' },
];

export const AP_DISTRICT_OPTIONS: BandOption<string>[] = [
  { value: 'Alluri Sitharama Raju', label_en: 'Alluri Sitharama Raju', label_te: 'అల్లూరి సీతారామరాజు', label_hi: 'अल्लूरी सीताराम राजू' },
  { value: 'Anakapalli', label_en: 'Anakapalli', label_te: 'అనకాపల్లి', label_hi: 'अनकापल्ली' },
  { value: 'Ananthapuramu', label_en: 'Ananthapuramu', label_te: 'అనంతపురం', label_hi: 'अनंतपुरम' },
  { value: 'Annamayya', label_en: 'Annamayya', label_te: 'అన్నమయ్య', label_hi: 'अन्नमय्या' },
  { value: 'Bapatla', label_en: 'Bapatla', label_te: 'బాపట్ల', label_hi: 'बापटला' },
  { value: 'Chittoor', label_en: 'Chittoor', label_te: 'చిత్తూరు', label_hi: 'चित्तूर' },
  { value: 'Dr. B.R. Ambedkar Konaseema', label_en: 'Dr. B.R. Ambedkar Konaseema', label_te: 'డా. బి.ఆర్. అంబేద్కర్ కోనసీమ', label_hi: 'डॉ. बी.आर. अंबेडकर कोनसीमा' },
  { value: 'East Godavari', label_en: 'East Godavari', label_te: 'తూర్పు గోదావరి', label_hi: 'पूर्वी गोदावरी' },
  { value: 'Eluru', label_en: 'Eluru', label_te: 'ఏలూరు', label_hi: 'एलुरु' },
  { value: 'Guntur', label_en: 'Guntur', label_te: 'గుంటూరు', label_hi: 'गुंटूर' },
  { value: 'Kakinada', label_en: 'Kakinada', label_te: 'కాకినాడ', label_hi: 'काकीनाडा' },
  { value: 'Krishna', label_en: 'Krishna', label_te: 'కృష్ణా', label_hi: 'कृष्णा' },
  { value: 'Kurnool', label_en: 'Kurnool', label_te: 'కర్నూలు', label_hi: 'कुरनूल' },
  { value: 'Nandyal', label_en: 'Nandyal', label_te: 'నంద్యాల', label_hi: 'नंद्याल' },
  { value: 'NTR', label_en: 'NTR (Vijayawada)', label_te: 'ఎన్టీఆర్ (విజయవాడ)', label_hi: 'एनटीआर (विजयवाड़ा)' },
  { value: 'Palnadu', label_en: 'Palnadu', label_te: 'పల్నాడు', label_hi: 'पलनाडु' },
  { value: 'Parvathipuram Manyam', label_en: 'Parvathipuram Manyam', label_te: 'పార్వతీపురం మన్యం', label_hi: 'पार्वतीपुरम मन्यम' },
  { value: 'Prakasam', label_en: 'Prakasam', label_te: 'ప్రకాశం', label_hi: 'प्रकासम' },
  { value: 'Srikakulam', label_en: 'Srikakulam', label_te: 'శ్రీకాకుళం', label_hi: 'श्रीकाकुलम' },
  { value: 'Sri Potti Sriramulu Nellore', label_en: 'SPSR Nellore', label_te: 'శ్రీ పొట్టి శ్రీరాములు నెల్లూరు', label_hi: 'एसपीएसआर नेल्लोर' },
  { value: 'Sri Sathya Sai', label_en: 'Sri Sathya Sai', label_te: 'శ్రీ సత్యసాయి', label_hi: 'श्री सत्य साईं' },
  { value: 'Tirupati', label_en: 'Tirupati', label_te: 'తిరుపతి', label_hi: 'तिरुपति' },
  { value: 'Visakhapatnam', label_en: 'Visakhapatnam', label_te: 'విశాఖపట్నం', label_hi: 'विशाखापत्तनम' },
  { value: 'Vizianagaram', label_en: 'Vizianagaram', label_te: 'విజయనగరం', label_hi: 'विजयनगरम' },
  { value: 'West Godavari', label_en: 'West Godavari', label_te: 'పశ్చిమ గోదావరి', label_hi: 'पश्चिमी गोदावरी' },
  { value: 'YSR Kadapa', label_en: 'YSR Kadapa', label_te: 'వైఎస్ఆర్ కడప', label_hi: 'वाईएसआर कडपा' },
];

export const AP_DISTRICTS: string[] = AP_DISTRICT_OPTIONS.map((d) => d.value);

// Ordinal rank maps for deterministic lte / gte / between comparisons
export const ORDINAL_RANK_MAPS: Record<string, Record<string, number>> = {
  age_band: {
    under_18: 1,
    '18_25': 2,
    '26_40': 3,
    '41_60': 4,
    '60_plus': 5,
  },
  income_band: {
    below_1_2L: 1,
    '1_2L_to_2_5L': 2,
    '2_5L_to_5L': 3,
    above_5L: 4,
  },
  land_holding_band: {
    none: 0,
    marginal_under_2_5_acres: 1,
    small_2_5_to_5_acres: 2,
    large_above_5_acres: 3,
  },
};

const FIELD_LABEL_MAP: Record<string, { en: string; te: string; hi: string }> = {
  age_band: { en: 'Age Group', te: 'వయోపరిమితి', hi: 'आयु वर्ग' },
  income_band: { en: 'Annual Household Income', te: 'కుటుంబ వార్షిక ఆదాయం', hi: 'वार्षिक पारिवारिक आय' },
  occupation_category: { en: 'Primary Occupation', te: 'ప్రధాన వృత్తి', hi: 'मुख्य व्यवसाय' },
  land_holding_band: { en: 'Agricultural Land Holding', te: 'వ్యవసాయ భూమి వివరాలు', hi: 'कृषि भूमि की स्थिति' },
  social_category: { en: 'Social Category', te: 'సామాజిక వర్గం', hi: 'सामाजिक वर्ग' },
  district_code: { en: 'District in Andhra Pradesh', te: 'ఆంధ్రప్రదేశ్ జిల్లా', hi: 'आंध्र प्रदेश का जिला' },
  state_code: { en: 'State of Residence', te: 'నివాస రాష్ట్రం', hi: 'निवास राज्य' },
  household_has_student: { en: 'School Student in Family (Class 1–12)', te: 'కుటుంబంలో పాఠశాల విద్యార్థి (1–12 తరగతి)', hi: 'परिवार में स्कूली छात्र (कक्षा 1–12)' },
  has_school_student: { en: 'School Student in Family (Class 1–12)', te: 'కుటుంబంలో పాఠశాల విద్యార్థి (1–12 తరగతి)', hi: 'परिवार में स्कूली छात्र (कक्षा 1–12)' },
  has_college_student: { en: 'Post-Matric / College Student in Family', te: 'కుటుంబంలో ఇంటర్ / కాలేజీ విద్యార్థి', hi: 'परिवार में इंटर / कॉलेज छात्र' },
  household_has_post_matric_student: { en: 'Class 10 / College Student in Family', te: '10వ తరగతి / కాలేజీ విద్యార్థి వివరాలు', hi: 'कक्षा 10 / कॉलेज छात्र का विवरण' },
  is_widow_or_single_woman: { en: 'Widow / Single Woman Status', te: 'వితంతువు / ఒంటరి మహిళ స్థితి', hi: 'विधवा / एकल महिला स्थिति' },
  has_disability: { en: 'Disability Status (SADAREM)', te: 'దివ్యాంగుల స్థితి (సదరం)', hi: 'दिव्यांगता स्थिति' },
  is_tenant_farmer_ccrc: { en: 'Tenant Farmer (CCRC Lease Card)', te: 'కౌలు రైతు (CCRC కార్డు)', hi: 'बटाईदार किसान (CCRC कार्ड)' },
  has_white_ration_card: { en: 'White Ration / Rice Card', te: 'తెల్ల రేషన్ / రైస్ కార్డు', hi: 'सफेद राशन / राइस कार्ड' },
};

export function formatFieldLabel(fieldName: string, lang: SupportedLanguage): string {
  const entry = FIELD_LABEL_MAP[fieldName];
  if (entry) {
    return lang === 'te' ? entry.te : lang === 'hi' ? entry.hi : entry.en;
  }
  return fieldName.replace(/_/g, ' ');
}

function lookupOptionLabel(options: BandOption<string>[], val: string, lang: SupportedLanguage): string | null {
  const found = options.find((o) => o.value.toLowerCase() === val.toLowerCase());
  if (!found) return null;
  return lang === 'te' ? found.label_te : lang === 'hi' ? found.label_hi : found.label_en;
}

export function formatProfileValue(fieldName: string, rawValue: string, lang: SupportedLanguage): string {
  const trimmed = String(rawValue).trim();
  if (!trimmed || trimmed === 'unknown' || trimmed === 'undefined') {
    return lang === 'te' ? 'అందించలేదు' : lang === 'hi' ? 'प्रदान नहीं किया गया' : 'Not provided';
  }

  if (fieldName === 'state_code') {
    if (trimmed.toUpperCase() === 'AP') {
      return lang === 'te' ? 'ఆంధ్రప్రదేశ్' : lang === 'hi' ? 'आंध्र प्रदेश' : 'Andhra Pradesh';
    }
    return trimmed;
  }

  if (fieldName === 'district_code') {
    return lookupOptionLabel(AP_DISTRICT_OPTIONS, trimmed, lang) || trimmed;
  }

  if (fieldName === 'age_band') {
    return lookupOptionLabel(AGE_BANDS, trimmed, lang) || trimmed;
  }

  if (fieldName === 'income_band') {
    return lookupOptionLabel(INCOME_BANDS, trimmed, lang) || trimmed;
  }

  if (fieldName === 'occupation_category') {
    return lookupOptionLabel(OCCUPATION_CATEGORIES, trimmed, lang) || trimmed;
  }

  if (fieldName === 'land_holding_band') {
    return lookupOptionLabel(LAND_HOLDING_BANDS, trimmed, lang) || trimmed;
  }

  if (fieldName === 'social_category') {
    return lookupOptionLabel(SOCIAL_CATEGORIES, trimmed, lang) || trimmed;
  }

  if (
    fieldName === 'household_has_student' ||
    fieldName === 'has_school_student' ||
    fieldName === 'has_college_student' ||
    fieldName === 'household_has_post_matric_student' ||
    fieldName === 'is_widow_or_single_woman' ||
    fieldName === 'has_disability' ||
    fieldName === 'is_tenant_farmer_ccrc' ||
    fieldName === 'has_white_ration_card'
  ) {
    const normalized = trimmed.toLowerCase();
    if (normalized === 'true' || normalized === 'yes') {
      return lang === 'te' ? 'అవును' : lang === 'hi' ? 'हाँ' : 'Yes';
    }
    if (normalized === 'false' || normalized === 'no') {
      return lang === 'te' ? 'లేదు / కాదు' : lang === 'hi' ? 'नहीं' : 'No';
    }
  }

  return trimmed.replace(/_/g, ' ');
}

export function formatRuleCondition(
  fieldName: string,
  operator: RuleOperator,
  rawValue: string,
  lang: SupportedLanguage
): string {
  const fieldLabel = formatFieldLabel(fieldName, lang);
  const parts = rawValue
    .split(',')
    .map((p) => formatProfileValue(fieldName, p.trim(), lang));

  const orWord = lang === 'te' ? ' లేదా ' : lang === 'hi' ? ' या ' : ' or ';
  const andToWord = lang === 'te' ? ' నుండి ' : lang === 'hi' ? ' से ' : ' to ';

  if (operator === 'in') {
    const joined = parts.join(orWord);
    return `${fieldLabel}: ${joined}`;
  }
  if (operator === 'between' && parts.length >= 2) {
    return `${fieldLabel}: ${parts[0]}${andToWord}${parts[1]}`;
  }
  if (operator === 'lte') {
    const prefix = lang === 'te' ? 'గరిష్టంగా ' : lang === 'hi' ? 'अधिकतम ' : 'Up to ';
    return `${fieldLabel}: ${prefix}${parts[0]}`;
  }
  if (operator === 'gte') {
    const prefix = lang === 'te' ? 'కనీసం ' : lang === 'hi' ? 'कम से कम ' : 'At least ';
    return `${fieldLabel}: ${prefix}${parts[0]}`;
  }
  if (operator === 'neq') {
    const prefix = lang === 'te' ? 'ఇది కాకూడదు — ' : lang === 'hi' ? 'यह नहीं होना चाहिए — ' : 'Must not be ';
    return `${fieldLabel}: ${prefix}${parts[0]}`;
  }
  return `${fieldLabel}: ${parts[0]}`;
}
