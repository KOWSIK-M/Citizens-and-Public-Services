// Standardized Coarse Profile Bands & Options (English, Telugu, Hindi)
// Guardrails: Coarse categories only. Never request exact income, exact land survey numbers, or private records.

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
    label_en: 'Under 18 years (Minor / Student)',
    label_te: '18 ఏళ్ల లోపు (విద్యార్థి)',
    label_hi: '18 वर्ष से कम (नाबालिग / छात्र)',
  },
  {
    value: '18_25',
    label_en: '18 to 25 years (Youth / Student)',
    label_te: '18 నుండి 25 ఏళ్లు (యువత / విద్యార్థి)',
    label_hi: '18 से 25 वर्ष (युवा / छात्र)',
  },
  {
    value: '26_40',
    label_en: '26 to 40 years (Adult / Working)',
    label_te: '26 నుండి 40 ఏళ్లు (వయోజనులు)',
    label_hi: '26 से 40 वर्ष (वयस्क / कामकाजी)',
  },
  {
    value: '41_60',
    label_en: '41 to 60 years (Middle-aged)',
    label_te: '41 నుండి 60 ఏళ్లు (మధ్యవయస్కులు)',
    label_hi: '41 से 60 वर्ष (अधेड़ उम्र)',
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
    label_en: 'Below ₹1.2 Lakhs / year (Rural BPL)',
    label_te: 'సంవత్సరానికి ₹1.2 లక్షల లోపు (గ్రామీణ బిపిఎల్)',
    label_hi: '₹1.2 लाख / वर्ष से कम (ग्रामीण बीपीएल)',
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
    label_en: 'Small / Marginal Farmer',
    label_te: 'రైతు (సన్నకారు / చిన్నకారు)',
    label_hi: 'छोटे / सीमांत किसान',
  },
  {
    value: 'daily_wage',
    label_en: 'Daily-Wage / Construction / Farm Worker',
    label_te: 'దినసరి కూలీ / వ్యవసాయ కూలీ',
    label_hi: 'दिहाड़ी मजदूर / निर्माण / कृषि श्रमिक',
  },
  {
    value: 'student',
    label_en: 'Student',
    label_te: 'విద్యార్థి',
    label_hi: 'छात्र / छात्रा',
  },
  {
    value: 'homemaker',
    label_en: 'Homemaker / Widow / Single Woman',
    label_te: 'గృహిణి / వితంతువు / ఒంటరి మహిళ',
    label_hi: 'गृहिणी / विधवा / एकल महिला',
  },
  {
    value: 'self_employed',
    label_en: 'Artisan / Small Business / Street Vendor',
    label_te: 'చేతివృత్తిదారుడు / చిన్న వ్యాపారి',
    label_hi: 'कारीगर / छोटा व्यापारी / फेरीवाला',
  },
  {
    value: 'unemployed',
    label_en: 'Unemployed Youth',
    label_te: 'నిరుద్యోగి',
    label_hi: 'बेरोजगार युवा',
  },
  {
    value: 'other',
    label_en: 'Other',
    label_te: 'ఇతర',
    label_hi: 'अन्य',
  },
];

export const LAND_HOLDING_BANDS: BandOption<string>[] = [
  {
    value: 'none',
    label_en: 'No agricultural land (Landless)',
    label_te: 'వ్యవసాయ భూమి లేదు (భూమిలేని వారు)',
    label_hi: 'कृषि भूमि नहीं है (भूमिहीन)',
  },
  {
    value: 'marginal_under_2_5_acres',
    label_en: 'Marginal (Less than 2.5 acres wet / 5 acres dry)',
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

export const AP_DISTRICTS = [
  'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya',
  'Bapatla', 'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari',
  'Eluru', 'Guntur', 'Kakinada', 'Krishna', 'Kurnool', 'Nandyal',
  'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'Srikakulam',
  'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Tirupati', 'Visakhapatnam',
  'Vizianagaram', 'West Godavari', 'YSR Kadapa'
];
