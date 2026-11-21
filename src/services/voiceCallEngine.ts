// Zero-Key Local Conversational Voice Call Engine ("Saathi Live Call")
// Guardrails:
// 1. 100% deterministic & on-device — zero external paid LLM API keys required.
// 2. Always says "likely eligible" (అర్హత ఉండే అవకాశం ఉంది / संभावित पात्र), NEVER "guaranteed" or "approved".
// 3. Immediate Indic-aware PII scrubbing on every spoken turn via piiValidator.

import type { CitizenProfile } from '../types/profile';
import type { GovernmentScheme } from '../types/scheme';
import type { SchemeMatchResult, EligibilityAssessmentResult } from '../types/eligibility';
import type { SupportedLanguage } from '../types/i18n';
import { DEFAULT_PROFILE } from '../store/useProfileStore.js';
import { extractCoarseProfileFromText } from './profileExtractor.js';
import { evaluateDeterministicEligibility } from './deterministicEngine.js';
import { inspectTextForPii } from '../utils/piiValidator.js';

export type VoiceCallPhase =
  | 'greeting'
  | 'collecting_profile'
  | 'presenting_options'
  | 'confirming_choice'
  | 'completed';

export type VoiceSlotKey =
  | 'occupation_category'
  | 'income_band'
  | 'age_band'
  | 'land_holding_band'
  | 'social_category'
  | 'district_code';

export interface VoiceQuickReply {
  id: string;
  label_en: string;
  label_te: string;
  label_hi: string;
  utterance_en: string;
  utterance_te: string;
  utterance_hi: string;
}

export interface VoiceCallTurn {
  id: string;
  speaker: 'agent' | 'citizen';
  text: string;
  language: SupportedLanguage;
  timestamp: string;
  hadPiiRedacted?: boolean;
}

export interface VoiceCallSessionState {
  phase: VoiceCallPhase;
  profile: CitizenProfile;
  askedSlots: VoiceSlotKey[];
  lastAskedSlot: VoiceSlotKey | null;
  turns: VoiceCallTurn[];
  assessment: EligibilityAssessmentResult | null;
  recommendedSchemes: SchemeMatchResult[];
  selectedSchemeId: string | null;
  proceedWithSchemeId: string | null;
  suggestWelfareGapRequest: boolean;
  quickReplies: VoiceQuickReply[];
}

interface SlotPromptSpec {
  slot: VoiceSlotKey;
  question_en: string;
  question_te: string;
  question_hi: string;
  replies: VoiceQuickReply[];
}

const SLOT_PROMPTS: Record<VoiceSlotKey, SlotPromptSpec> = {
  occupation_category: {
    slot: 'occupation_category',
    question_en:
      'To narrow down the best schemes, what is your main work—such as farmer, daily-wage worker, student, or homemaker?',
    question_te:
      'మీకు సరిపోయే పథకాలను గుర్తించడానికి, మీ ప్రధాన వృత్తి ఏమిటి—రైతు, దినసరి కూలీ, విద్యార్థి లేదా గృహిణి?',
    question_hi:
      'सही योजनाएं चुनने के लिए, आपका मुख्य काम क्या है—किसान, दिहाड़ी मजदूर, छात्र या गृहिणी?',
    replies: [
      {
        id: 'occ-farmer',
        label_en: 'Farmer (2 acres)',
        label_te: 'రైతు (2 ఎకరాలు)',
        label_hi: 'किसान (2 एकड़)',
        utterance_en: 'I am a smallholder farmer with 2 acres of land',
        utterance_te: 'నేను 2 ఎకరాల భూమి ఉన్న చిన్న రైతును',
        utterance_hi: 'मैं 2 एकड़ जमीन वाला छोटा किसान हूँ',
      },
      {
        id: 'occ-daily',
        label_en: 'Daily-Wage Worker',
        label_te: 'దినసరి కూలీ',
        label_hi: 'दिहाड़ी मजदूर',
        utterance_en: 'I am a daily wage worker with no agricultural land',
        utterance_te: 'నేను వ్యవసాయ భూమి లేని దినసరి కూలీని',
        utterance_hi: 'मैं बिना कृषि भूमि वाला दिहाड़ी मजदूर हूँ',
      },
      {
        id: 'occ-student',
        label_en: 'Student / Parent of Student',
        label_te: 'విద్యార్థి / తల్లిదండ్రులు',
        label_hi: 'छात्र / अभिभावक',
        utterance_en: 'My child is studying in Class 10 school',
        utterance_te: 'నా బిడ్డ 10వ తరగతి చదువుతోంది',
        utterance_hi: 'मेरा बच्चा 10वीं कक्षा में पढ़ता है',
      },
      {
        id: 'occ-senior',
        label_en: 'Senior / Widow (60+)',
        label_te: 'వృద్ధులు / వితంతువు (60+)',
        label_hi: 'वरिष्ठ नागरिक / विधवा (60+)',
        utterance_en: 'I am 65 years old widow with no regular income',
        utterance_te: 'నాకు 65 ఏళ్లు, వితంతువును, ఆదాయం లేదు',
        utterance_hi: 'मेरी उम्र 65 वर्ष है, विधवा हूँ और कोई आय नहीं है',
      },
    ],
  },
  income_band: {
    slot: 'income_band',
    question_en:
      'Does your family hold a White Rice Card, or is your annual family income below 1.2 lakh rupees?',
    question_te:
      'మీ కుటుంబానికి తెల్ల రేషన్ (రైస్) కార్డు ఉందా, లేదా వార్షిక ఆదాయం లక్షా ఇరవై వేల లోపు ఉందా?',
    question_hi:
      'क्या आपके परिवार के पास सफेद राइस कार्ड है, या वार्षिक आय 1.2 लाख रुपये से कम है?',
    replies: [
      {
        id: 'inc-white-card',
        label_en: 'Yes, White Rice Card (< ₹1.2L)',
        label_te: 'అవును, తెల్ల రేషన్ కార్డు ఉంది',
        label_hi: 'हाँ, सफेद राशन कार्ड है',
        utterance_en: 'Yes we have a White Rice Card and income below 1 lakh',
        utterance_te: 'అవును మాకు తెల్ల రేషన్ కార్డు ఉంది',
        utterance_hi: 'हाँ हमारे पास सफेद राशन कार्ड है',
      },
      {
        id: 'inc-mid',
        label_en: '₹1.2L to ₹2.5L / year',
        label_te: '₹1.2 నుండి ₹2.5 లక్షలు',
        label_hi: '₹1.2 से ₹2.5 लाख',
        utterance_en: 'Our annual family income is around 2 lakh rupees',
        utterance_te: 'మా కుటుంబ వార్షిక ఆదాయం రెండు లక్షలు',
        utterance_hi: 'हमारी वार्षिक आय 2 लाख रुपये है',
      },
      {
        id: 'inc-high',
        label_en: 'Above ₹5L / year',
        label_te: '₹5 లక్షల పైబడి',
        label_hi: '₹5 लाख से अधिक',
        utterance_en: 'Our annual income is 6 lakh rupees',
        utterance_te: 'మా వార్షిక ఆదాయం 6 లక్షలు',
        utterance_hi: 'हमारी वार्षिक आय 6 लाख रुपये है',
      },
    ],
  },
  age_band: {
    slot: 'age_band',
    question_en: 'Roughly how old is the main applicant—under 18, 18 to 40, 41 to 60, or above 60?',
    question_te: 'దరఖాస్తుదారుని వయస్సు సుమారు ఎంత—18 లోపు, 18 నుండి 40, 41 నుండి 60, లేదా 60 పైబడిందా?',
    question_hi: 'आवेदक की आयु लगभग कितनी है—18 से कम, 18 से 40, 41 से 60, या 60 वर्ष से अधिक?',
    replies: [
      {
        id: 'age-youth',
        label_en: '18–25 yrs',
        label_te: '18–25 ఏళ్లు',
        label_hi: '18–25 वर्ष',
        utterance_en: 'I am 21 years old',
        utterance_te: 'నా వయస్సు 21 సంవత్సరాలు',
        utterance_hi: 'मेरी उम्र 21 वर्ष है',
      },
      {
        id: 'age-adult',
        label_en: '26–40 yrs',
        label_te: '26–40 ఏళ్లు',
        label_hi: '26–40 वर्ष',
        utterance_en: 'I am 34 years old',
        utterance_te: 'నా వయస్సు 34 సంవత్సరాలు',
        utterance_hi: 'मेरी उम्र 34 वर्ष है',
      },
      {
        id: 'age-mid',
        label_en: '41–60 yrs',
        label_te: '41–60 ఏళ్లు',
        label_hi: '41–60 वर्ष',
        utterance_en: 'I am 48 years old',
        utterance_te: 'నా వయస్సు 48 సంవత్సరాలు',
        utterance_hi: 'मेरी उम्र 48 वर्ष है',
      },
      {
        id: 'age-senior',
        label_en: '60+ yrs',
        label_te: '60+ ఏళ్లు',
        label_hi: '60+ वर्ष',
        utterance_en: 'I am 66 years old',
        utterance_te: 'నా వయస్సు 66 సంవత్సరాలు',
        utterance_hi: 'मेरी उम्र 66 वर्ष है',
      },
    ],
  },
  land_holding_band: {
    slot: 'land_holding_band',
    question_en: 'Does your household own agricultural farmland, or are you landless / cultivating on lease?',
    question_te: 'మీ కుటుంబానికి సొంత వ్యవసాయ భూమి ఉందా, లేక భూమి లేదా / కౌలు రైతులా?',
    question_hi: 'क्या आपके परिवार के पास कृषि भूमि है, या आप भूमिहीन / बटाईदार किसान हैं?',
    replies: [
      {
        id: 'land-none',
        label_en: 'No Farmland (Landless)',
        label_te: 'వ్యవసాయ భూమి లేదు',
        label_hi: 'कोई कृषि भूमि नहीं',
        utterance_en: 'We have no agricultural land',
        utterance_te: 'మాకు వ్యవసాయ భూమి లేదు',
        utterance_hi: 'हमारे पास कोई कृषि भूमि नहीं है',
      },
      {
        id: 'land-marginal',
        label_en: 'Under 2.5 Acres',
        label_te: '2.5 ఎకరాల లోపు',
        label_hi: '2.5 एकड़ से कम',
        utterance_en: 'We own 2 acres of agricultural land',
        utterance_te: 'మాకు 2 ఎకరాల భూమి ఉంది',
        utterance_hi: 'हमारे पास 2 एकड़ जमीन है',
      },
      {
        id: 'land-tenant',
        label_en: 'Tenant Farmer (CCRC)',
        label_te: 'కౌలు రైతు (CCRC)',
        label_hi: 'बटाईदार किसान (CCRC)',
        utterance_en: 'I am a tenant farmer with CCRC card and no own land',
        utterance_te: 'నేను CCRC కార్డు ఉన్న కౌలు రైతును',
        utterance_hi: 'मैं CCRC कार्ड वाला बटाईदार किसान हूँ',
      },
    ],
  },
  social_category: {
    slot: 'social_category',
    question_en: 'Which social category applies to your household—SC, ST, BC, Minority, or OC?',
    question_te: 'మీ కుటుంబం ఏ సామాజిక వర్గానికి చెందుతుంది—SC, ST, BC, మైనారిటీ లేదా OC?',
    question_hi: 'आपका परिवार किस सामाजिक वर्ग में आता है—SC, ST, BC, अल्पसंख्यक या OC?',
    replies: [
      {
        id: 'cat-bc',
        label_en: 'BC',
        label_te: 'BC వర్గం',
        label_hi: 'BC वर्ग',
        utterance_en: 'We belong to BC category',
        utterance_te: 'మాది BC సామాజిక వర్గం',
        utterance_hi: 'हम BC वर्ग से हैं',
      },
      {
        id: 'cat-sc',
        label_en: 'SC',
        label_te: 'SC వర్గం',
        label_hi: 'SC वर्ग',
        utterance_en: 'We belong to SC category',
        utterance_te: 'మాది SC సామాజిక వర్గం',
        utterance_hi: 'हम SC वर्ग से हैं',
      },
      {
        id: 'cat-st',
        label_en: 'ST',
        label_te: 'ST వర్గం',
        label_hi: 'ST वर्ग',
        utterance_en: 'We belong to ST category',
        utterance_te: 'మాది ST సామాజిక వర్గం',
        utterance_hi: 'हम ST वर्ग से हैं',
      },
      {
        id: 'cat-oc',
        label_en: 'OC / General',
        label_te: 'OC / జనరల్',
        label_hi: 'OC / सामान्य',
        utterance_en: 'We belong to OC general category',
        utterance_te: 'మాది OC వర్గం',
        utterance_hi: 'हम सामान्य OC वर्ग से हैं',
      },
    ],
  },
  district_code: {
    slot: 'district_code',
    question_en: 'Which Andhra Pradesh district do you live in, so we can link your local Sachivalayam?',
    question_te: 'మీ సమీప సచివాలయ వివరాల కోసం మీరు ఆంధ్రప్రదేశ్‌లో ఏ జిల్లాలో నివసిస్తున్నారు?',
    question_hi: 'नजदीकी सचिवालय से जोड़ने के लिए, आप आंध्र प्रदेश के किस जिले में रहते हैं?',
    replies: [
      {
        id: 'dist-guntur',
        label_en: 'Guntur',
        label_te: 'గుంటూరు',
        label_hi: 'गुंटूर',
        utterance_en: 'I live in Guntur district',
        utterance_te: 'నేను గుంటూరు జిల్లాలో ఉంటున్నాను',
        utterance_hi: 'मैं गुंटूर जिले में रहता हूँ',
      },
      {
        id: 'dist-kurnool',
        label_en: 'Kurnool',
        label_te: 'కర్నూలు',
        label_hi: 'कुरनूल',
        utterance_en: 'I live in Kurnool district',
        utterance_te: 'నేను కర్నూలు జిల్లాలో ఉంటున్నాను',
        utterance_hi: 'मैं कुरनूल जिले में रहता हूँ',
      },
      {
        id: 'dist-vizag',
        label_en: 'Visakhapatnam',
        label_te: 'విశాఖపట్నం',
        label_hi: 'विशाखापत्तनम',
        utterance_en: 'I live in Visakhapatnam district',
        utterance_te: 'నేను విశాఖపట్నం జిల్లాలో ఉంటున్నాను',
        utterance_hi: 'मैं विशाखापत्तनम जिले में रहता हूँ',
      },
      {
        id: 'dist-krishna',
        label_en: 'Krishna / NTR',
        label_te: 'కృష్ణా / ఎన్టీఆర్',
        label_hi: 'कृष्णा / एनटीआर',
        utterance_en: 'I live in Krishna district',
        utterance_te: 'నేను కృష్ణా జిల్లాలో ఉంటున్నాను',
        utterance_hi: 'मैं कृष्णा जिले में रहता हूँ',
      },
    ],
  },
};

function makeTurnId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function pickLang(lang: SupportedLanguage, en: string, te: string, hi: string): string {
  if (lang === 'te') return te;
  if (lang === 'hi') return hi;
  return en;
}

export function createInitialVoiceCallSession(
  lang: SupportedLanguage = 'en',
  seedProfile?: CitizenProfile | null
): VoiceCallSessionState {
  const greetingText = pickLang(
    lang,
    'Namaskaram! I am Saathi, your voice welfare guide. Please tell me briefly about your work, family, and Andhra Pradesh district—do not share Aadhaar or phone numbers.',
    'నమస్కారం! నేను మీ క్లెయిమ్ సాథీ వాయిస్ సహాయకుడిని. ఆధార్ లేదా ఫోన్ నంబర్ చెప్పకుండా, మీ వృత్తి, కుటుంబం మరియు జిల్లా వివరాలు క్లుప్తంగా చెప్పండి.',
    'नमस्कार! मैं साथी हूँ, आपका आवाज़ कल्याण सहायक। आधार या फ़ोन नंबर बताए बिना, अपने काम, परिवार और जिले के बारे में संक्षेप में बताएं।'
  );

  const baseProfile: CitizenProfile = seedProfile
    ? { ...seedProfile, language_pref: lang }
    : { ...DEFAULT_PROFILE, language_pref: lang };

  return {
    phase: 'greeting',
    profile: baseProfile,
    askedSlots: [],
    lastAskedSlot: null,
    turns: [
      {
        id: makeTurnId('agent'),
        speaker: 'agent',
        text: greetingText,
        language: lang,
        timestamp: new Date().toISOString(),
      },
    ],
    assessment: null,
    recommendedSchemes: [],
    selectedSchemeId: null,
    proceedWithSchemeId: null,
    suggestWelfareGapRequest: false,
    quickReplies: SLOT_PROMPTS.occupation_category.replies,
  };
}

function mergeCitizenProfiles(
  current: CitizenProfile,
  incoming: Partial<CitizenProfile>
): CitizenProfile {
  const next: CitizenProfile = { ...current };

  if (incoming.age_band && incoming.age_band !== 'unknown') {
    next.age_band = incoming.age_band;
  }
  if (incoming.district_code && incoming.district_code !== 'unknown') {
    next.district_code = incoming.district_code;
  }
  if (incoming.income_band && incoming.income_band !== 'unknown') {
    next.income_band = incoming.income_band;
  }
  if (incoming.occupation_category && incoming.occupation_category !== 'unknown') {
    next.occupation_category = incoming.occupation_category;
  }
  if (incoming.social_category && incoming.social_category !== 'unknown') {
    next.social_category = incoming.social_category;
  }
  if (incoming.land_holding_band && incoming.land_holding_band !== 'unknown') {
    next.land_holding_band = incoming.land_holding_band;
  }

  const triKeys: Array<
    | 'has_school_student'
    | 'has_college_student'
    | 'is_widow_or_single_woman'
    | 'has_disability'
    | 'is_tenant_farmer_ccrc'
    | 'has_white_ration_card'
  > = [
    'has_school_student',
    'has_college_student',
    'is_widow_or_single_woman',
    'has_disability',
    'is_tenant_farmer_ccrc',
    'has_white_ration_card',
  ];

  for (const key of triKeys) {
    const val = incoming[key];
    if (val === 'yes' || val === 'no') {
      next[key] = val;
    }
  }

  if (incoming.household_members && incoming.household_members.length > 0) {
    const combined = [...current.household_members];
    for (const member of incoming.household_members) {
      const duplicate = combined.some(
        (m) => m.relation === member.relation && m.age_band === member.age_band
      );
      if (!duplicate) {
        combined.push(member);
      }
    }
    next.household_members = combined;
  }

  if (incoming.is_sample === true) {
    next.is_sample = true;
  }

  return next;
}

function applyContextualSlotReply(
  profile: CitizenProfile,
  lastSlot: VoiceSlotKey | null,
  sanitizedInput: string
): CitizenProfile {
  if (!lastSlot) return profile;
  const lower = sanitizedInput.trim().toLowerCase();
  const next = { ...profile };

  const isAffirmative =
    /^(yes|yeah|yep|sure|have it|we have|అవును|ఉంది|మాకు ఉంది|हाँ|जी|है)\b/iu.test(lower);
  const isNegative =
    /^(no|nope|none|dont have|don't have|కాదు|లేదు|మాకు లేదు|नहीं|ना)\b/iu.test(lower);

  if (lastSlot === 'income_band') {
    if (isAffirmative && next.income_band === 'unknown') {
      next.has_white_ration_card = 'yes';
      next.income_band = 'below_1_2L';
    } else if (isNegative && next.has_white_ration_card === 'unknown') {
      next.has_white_ration_card = 'no';
    }
  } else if (lastSlot === 'land_holding_band') {
    if (isNegative && next.land_holding_band === 'unknown') {
      next.land_holding_band = 'none';
    } else if (isAffirmative && next.land_holding_band === 'unknown') {
      next.land_holding_band = 'marginal_under_2_5_acres';
    }
  }

  return next;
}

function matchSchemeFromUtterance(
  text: string,
  candidates: SchemeMatchResult[]
): SchemeMatchResult | null {
  if (candidates.length === 0) return null;
  const lower = text.toLowerCase();

  // Ordinal matches (1st, 2nd, 3rd in EN / TE / HI)
  if (
    /\b(first|1st|option 1|number 1|one)\b/u.test(lower) ||
    /(మొదటి|మొదటిది|ఒకటవ)/u.test(lower) ||
    /(पहली|पहला|नंबर 1|एक)/u.test(lower)
  ) {
    return candidates[0] || null;
  }
  if (
    /\b(second|2nd|option 2|number 2|two)\b/u.test(lower) ||
    /(రెండవ|రెండోది)/u.test(lower) ||
    /(दूसरी|दूसरा|नंबर 2)/u.test(lower)
  ) {
    return candidates[1] || null;
  }
  if (
    /\b(third|3rd|option 3|number 3|three)\b/u.test(lower) ||
    /(మూడవ|మూడోది)/u.test(lower) ||
    /(तीसरी|तीसरा|नंबर 3)/u.test(lower)
  ) {
    return candidates[2] || null;
  }

  // Keyword matching against candidate names / codes
  const keywordAliases: Array<{ pattern: RegExp; matchCodeOrName: RegExp }> = [
    { pattern: /(talliki|vandanam|amma vodi|తల్లికి|వందనం|तल्लिकि)/iu, matchCodeOrName: /talliki|edu/i },
    { pattern: /(ntr|bharosa|pension|పెన్షన్|భరోసా|पेंशन|भरोसा)/iu, matchCodeOrName: /ntr|pen/i },
    { pattern: /(annadata|sukhibhava|అన్నదాత|సుఖీభవ|अन्नदाता)/iu, matchCodeOrName: /annadata/i },
    { pattern: /(pm[\s-]*kisan|kisan samman|కిసాన్|किसान)/iu, matchCodeOrName: /kisan/i },
    { pattern: /(vaidya|aarogyasri|health|వైద్య|ఆరోగ్యశ్రీ|आरोग्यश्री|वैद्य)/iu, matchCodeOrName: /vaidya|aarogya|hlth/i },
    { pattern: /(deepam|cylinder|gas|lpg|దీపం|గ్యాస్|సిలిండర్|दीपम|सिलेंडर)/iu, matchCodeOrName: /deepam|lpg|ujjwala/i },
    { pattern: /(scholarship|jnanabhumi|post[\s-]*matric|స్కాలర్|छात्रवृत्ति)/iu, matchCodeOrName: /matric|scholarship|sch/i },
  ];

  for (const alias of keywordAliases) {
    if (alias.pattern.test(lower)) {
      const hit = candidates.find(
        (c) =>
          alias.matchCodeOrName.test(c.name_en) || alias.matchCodeOrName.test(c.scheme_code)
      );
      if (hit) return hit;
    }
  }

  // Direct substring match on scheme words >= 5 chars
  for (const cand of candidates) {
    const tokens = cand.name_en
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 5);
    if (tokens.some((tok) => lower.includes(tok))) {
      return cand;
    }
  }

  return null;
}

function isProceedIntent(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return (
    /\b(proceed|continue|apply|go ahead|yes proceed|pick this|select this|start application|confirm)\b/u.test(lower) ||
    /^(yes|sure|okay|ok)$/u.test(lower) ||
    /(ముందుకు|కొనసాగించు|దరఖాస్తు|అవును|సరే|ఎంచుకో)/u.test(lower) ||
    /(आगे बढ़ें|आवेदन करें|चुनें|हाँ|ठीक है|जारी रखें)/u.test(lower)
  );
}

function isRepeatIntent(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return (
    /\b(repeat|say again|hear again|pardon)\b/u.test(lower) ||
    /(మళ్ళీ చెప్పండి|మరొకసారి)/u.test(lower) ||
    /(फिर से|दोबारा बोलिए)/u.test(lower)
  );
}

function chooseNextMissingSlot(
  profile: CitizenProfile,
  assessment: EligibilityAssessmentResult,
  askedSlots: VoiceSlotKey[]
): VoiceSlotKey | null {
  const candidateOrder: VoiceSlotKey[] = [
    'occupation_category',
    'income_band',
    'age_band',
    'land_holding_band',
    'social_category',
    'district_code',
  ];

  // Count which missing fields block `needs_more_info` schemes
  const fieldImpact = new Map<string, number>();
  for (const item of assessment.results.needs_more_info) {
    for (const field of item.missing_fields) {
      const normalizedSlot: VoiceSlotKey | null =
        field === 'has_white_ration_card' || field === 'income_band'
          ? 'income_band'
          : field === 'occupation_category'
          ? 'occupation_category'
          : field === 'age_band'
          ? 'age_band'
          : field === 'land_holding_band' || field === 'is_tenant_farmer_ccrc'
          ? 'land_holding_band'
          : field === 'social_category'
          ? 'social_category'
          : field === 'district_code'
          ? 'district_code'
          : null;
      if (normalizedSlot) {
        fieldImpact.set(normalizedSlot, (fieldImpact.get(normalizedSlot) || 0) + 1);
      }
    }
  }

  const isUnknownInProfile = (slot: VoiceSlotKey): boolean => {
    const val = profile[slot];
    return !val || val === 'unknown';
  };

  const unaskedUnknown = candidateOrder.filter(
    (s) => !askedSlots.includes(s) && isUnknownInProfile(s)
  );
  if (unaskedUnknown.length === 0) return null;

  unaskedUnknown.sort((a, b) => (fieldImpact.get(b) || 0) - (fieldImpact.get(a) || 0));
  return unaskedUnknown[0];
}

function buildOptionsSpeech(
  likely: SchemeMatchResult[],
  needsMore: SchemeMatchResult[],
  lang: SupportedLanguage
): { speech: string; quickReplies: VoiceQuickReply[]; suggestGap: boolean } {
  if (likely.length === 0) {
    const speech =
      needsMore.length > 0
        ? pickLang(
            lang,
            `Right now, no scheme is confirmed as likely eligible yet, though ${needsMore.length} scheme${needsMore.length > 1 ? 's' : ''} like ${needsMore[0].name_en} need a bit more verification. You can review full details or raise a Missing Scheme request for your community.`,
            `ప్రస్తుతం ఏ పథకానికీ పూర్తి అర్హత నిర్ధారణ కాలేదు, కానీ ${needsMore[0].name_te} వంటి ${needsMore.length} పథకాలకు మరికొన్ని వివరాలు అవసరం. మీరు పూర్తి ఫలితాలు చూడవచ్చు లేదా కొత్త పథకం కోసం అభ్యర్థన పెట్టవచ్చు.`,
            `अभी कोई योजना संभावित पात्र के रूप में पक्की नहीं हुई है, हालांकि ${needsMore[0].name_hi} जैसी ${needsMore.length} योजनाओं के लिए कुछ और जानकारी चाहिए। आप परिणाम देख सकते हैं या नई योजना का अनुरोध कर सकते हैं।`
          )
        : pickLang(
            lang,
            'Based on the details shared, none of the current sample schemes show you as likely eligible. You can raise a Missing Scheme Welfare Gap Request so your community can vote and escalate it to officials or NGOs.',
            'మీరు చెప్పిన వివరాల ప్రకారం ప్రస్తుత పథకాలలో ఏవీ సరిపోలేదు. మీరు కొత్త సంక్షేమ పథకం కోసం అభ్యర్థన పెట్టవచ్చు—ఓటింగ్ ద్వారా దానిని అధికారులకు లేదా స్వచ్ఛంద సంస్థలకు పంపవచ్చు.',
            'साझा किए गए विवरण के अनुसार वर्तमान योजनाओं में कोई भी संभावित पात्र नहीं दिख रही है। आप नई योजना का अनुरोध दर्ज कर सकते हैं ताकि समुदाय वोट करके इसे अधिकारियों तक पहुँचा सके।'
          );

    return {
      speech,
      suggestGap: true,
      quickReplies: [
        {
          id: 'gap-request',
          label_en: 'Raise New Scheme Request',
          label_te: 'కొత్త పథకం అభ్యర్థన',
          label_hi: 'नई योजना का अनुरोध करें',
          utterance_en: 'Open community request',
          utterance_te: 'కొత్త పథకం అభ్యర్థన',
          utterance_hi: 'नई योजना का अनुरोध',
        },
      ],
    };
  }

  const top = likely.slice(0, 3);
  const top1Name = pickLang(lang, top[0].name_en, top[0].name_te, top[0].name_hi);
  const top1Benefit = pickLang(
    lang,
    top[0].benefit_summary_en,
    top[0].benefit_summary_te,
    top[0].benefit_summary_hi
  );

  const secondPart =
    top.length > 1
      ? pickLang(
          lang,
          ` Option 2 is ${top[1].name_en}.`,
          ` రెండవ పథకం ${top[1].name_te}.`,
          ` दूसरी योजना ${top[1].name_hi} है।`
        )
      : '';

  const speech = pickLang(
    lang,
    `Based on your details, you are likely eligible for ${likely.length} welfare scheme${likely.length > 1 ? 's' : ''}! Option 1 is ${top1Name}—${top1Benefit}.${secondPart} Say "pick first scheme" or "proceed" to open the document checklist and application steps.`,
    `మీ వివరాల ఆధారంగా మీకు ${likely.length} సంక్షేమ పథకాలకు అర్హత ఉండే అవకాశం ఉంది! మొదటి పథకం ${top1Name}—${top1Benefit}.${secondPart} పత్రాల జాబితా మరియు దరఖాస్తు విధానం కోసం "మొదటి పథకం" లేదా "ముందుకు వెళ్ళండి" అని చెప్పండి.`,
    `आपके विवरण के आधार पर आप ${likely.length} कल्याणकारी योजनाओं के लिए संभावित पात्र हैं! पहली योजना ${top1Name} है—${top1Benefit}।${secondPart} दस्तावेज़ सूची और आवेदन चरणों के लिए "पहली योजना" या "आगे बढ़ें" बोलें।`
  );

  const quickReplies: VoiceQuickReply[] = top.map((scheme, idx) => ({
    id: `pick-${scheme.scheme_id}`,
    label_en: `Pick #${idx + 1}: ${scheme.name_en}`,
    label_te: `#${idx + 1} ఎంచుకోండి: ${scheme.name_te}`,
    label_hi: `#${idx + 1} चुनें: ${scheme.name_hi}`,
    utterance_en: `Pick option ${idx + 1} and proceed`,
    utterance_te: `${idx === 0 ? 'మొదటి' : idx === 1 ? 'రెండవ' : 'మూడవ'} పథకం ఎంచుకో`,
    utterance_hi: `${idx === 0 ? 'पहली' : idx === 1 ? 'दूसरी' : 'तीसरी'} योजना चुनें`,
  }));

  return { speech, quickReplies, suggestGap: false };
}

export function processVoiceCallTurn(
  state: VoiceCallSessionState,
  rawCitizenSpeech: string,
  lang: SupportedLanguage = 'en',
  schemes: GovernmentScheme[] = []
): VoiceCallSessionState {
  const trimmed = rawCitizenSpeech.trim();
  if (!trimmed) return state;

  // 1. Immediate Indic-aware PII firewall on spoken input
  const piiCheck = inspectTextForPii(trimmed);
  const safeText = piiCheck.sanitizedText;

  const citizenTurn: VoiceCallTurn = {
    id: makeTurnId('citizen'),
    speaker: 'citizen',
    text: safeText,
    language: lang,
    timestamp: new Date().toISOString(),
    hadPiiRedacted: piiCheck.hasPii,
  };

  const piiPrefix = piiCheck.hasPii
    ? pickLang(
        lang,
        'Privacy note: I removed a personal ID or phone number—we never store sensitive numbers. ',
        'గోప్యతా గమనిక: వ్యక్తిగత ఆధార్/ఫోన్ నంబర్‌ను తొలగించాను—మేము వాటిని సేవ్ చేయము. ',
        'गोपनीयता सूचना: मैंने व्यक्तिगत आईडी या फ़ोन नंबर हटा दिया है—हम संवेदनशील नंबर सहेजते नहीं हैं। '
      )
    : '';

  // 2. Handle repeat intent when options already exist
  if (
    (state.phase === 'presenting_options' || state.phase === 'confirming_choice') &&
    isRepeatIntent(safeText) &&
    state.assessment
  ) {
    const { speech, quickReplies, suggestGap } = buildOptionsSpeech(
      state.assessment.results.likely_eligible,
      state.assessment.results.needs_more_info,
      lang
    );
    return {
      ...state,
      turns: [
        ...state.turns,
        citizenTurn,
        {
          id: makeTurnId('agent'),
          speaker: 'agent',
          text: piiPrefix + speech,
          language: lang,
          timestamp: new Date().toISOString(),
        },
      ],
      quickReplies,
      suggestWelfareGapRequest: suggestGap,
    };
  }

  // 3. Handle scheme selection / proceed commands when recommendations are on screen
  if (
    (state.phase === 'presenting_options' || state.phase === 'confirming_choice') &&
    state.recommendedSchemes.length > 0
  ) {
    const matchedScheme = matchSchemeFromUtterance(safeText, state.recommendedSchemes);
    const wantsProceed = isProceedIntent(safeText);

    if (matchedScheme && wantsProceed) {
      const chosenName = pickLang(
        lang,
        matchedScheme.name_en,
        matchedScheme.name_te,
        matchedScheme.name_hi
      );
      const closingSpeech = pickLang(
        lang,
        `Great choice! Saving ${chosenName} (likely eligible) to your tracker and opening your personalised document checklist and application guide now.`,
        `మంచి ఎంపిక! ${chosenName} (అర్హత ఉండే అవకాశం ఉంది) పథకాన్ని మీ ట్రాకర్‌లో చేర్చి, పత్రాల జాబితా మరియు దరఖాస్తు విధానాన్ని తెరుస్తున్నాను.`,
        `बढ़िया चयन! ${chosenName} (संभावित पात्र) को आपके ट्रैकर में जोड़कर दस्तावेज़ सूची और आवेदन मार्गदर्शिका खोल रहा हूँ।`
      );
      return {
        ...state,
        phase: 'completed',
        selectedSchemeId: matchedScheme.scheme_id,
        proceedWithSchemeId: matchedScheme.scheme_id,
        turns: [
          ...state.turns,
          citizenTurn,
          {
            id: makeTurnId('agent'),
            speaker: 'agent',
            text: piiPrefix + closingSpeech,
            language: lang,
            timestamp: new Date().toISOString(),
          },
        ],
        quickReplies: [],
      };
    }

    if (matchedScheme) {
      const chosenName = pickLang(
        lang,
        matchedScheme.name_en,
        matchedScheme.name_te,
        matchedScheme.name_hi
      );
      const chosenBenefit = pickLang(
        lang,
        matchedScheme.benefit_summary_en,
        matchedScheme.benefit_summary_te,
        matchedScheme.benefit_summary_hi
      );
      const confirmSpeech = pickLang(
        lang,
        `You selected ${chosenName}, for which you are likely eligible (${chosenBenefit}). Say "proceed" to save it to your tracker and view exact Sachivalayam application steps.`,
        `మీరు ${chosenName} ఎంచుకున్నారు, దీనికి మీకు అర్హత ఉండే అవకాశం ఉంది (${chosenBenefit}). ట్రాకర్‌లో సేవ్ చేసి దరఖాస్తు విధానం చూడటానికి "ముందుకు వెళ్ళండి" అని చెప్పండి.`,
        `आपने ${chosenName} चुना है, जिसके लिए आप संभावित पात्र हैं (${chosenBenefit})। ट्रैकर में सहेजने और आवेदन चरण देखने के लिए "आगे बढ़ें" बोलें।`
      );
      return {
        ...state,
        phase: 'confirming_choice',
        selectedSchemeId: matchedScheme.scheme_id,
        turns: [
          ...state.turns,
          citizenTurn,
          {
            id: makeTurnId('agent'),
            speaker: 'agent',
            text: piiPrefix + confirmSpeech,
            language: lang,
            timestamp: new Date().toISOString(),
          },
        ],
        quickReplies: [
          {
            id: 'confirm-proceed',
            label_en: `Proceed with ${matchedScheme.name_en}`,
            label_te: `${matchedScheme.name_te} తో ముందుకు వెళ్ళండి`,
            label_hi: `${matchedScheme.name_hi} के साथ आगे बढ़ें`,
            utterance_en: 'Yes proceed',
            utterance_te: 'అవును ముందుకు వెళ్ళండి',
            utterance_hi: 'हाँ आगे बढ़ें',
          },
        ],
      };
    }

    if (wantsProceed) {
      const target =
        state.recommendedSchemes.find((s) => s.scheme_id === state.selectedSchemeId) ||
        state.recommendedSchemes[0];
      const chosenName = pickLang(lang, target.name_en, target.name_te, target.name_hi);
      const closingSpeech = pickLang(
        lang,
        `Opening ${chosenName} (likely eligible) with your personalised document checklist and Sachivalayam steps now.`,
        `${chosenName} (అర్హత ఉండే అవకాశం ఉంది) పత్రాల జాబితా మరియు సచివాలయ దరఖాస్తు విధానాన్ని ఇప్పుడే తెరుస్తున్నాను.`,
        `${chosenName} (संभावित पात्र) की दस्तावेज़ सूची और सचिवालय आवेदन चरण अभी खोल रहा हूँ।`
      );
      return {
        ...state,
        phase: 'completed',
        selectedSchemeId: target.scheme_id,
        proceedWithSchemeId: target.scheme_id,
        turns: [
          ...state.turns,
          citizenTurn,
          {
            id: makeTurnId('agent'),
            speaker: 'agent',
            text: piiPrefix + closingSpeech,
            language: lang,
            timestamp: new Date().toISOString(),
          },
        ],
        quickReplies: [],
      };
    }
  }

  // 4. Extract coarse profile details from spoken turn + contextual short reply
  const extracted = extractCoarseProfileFromText(safeText, lang);
  let mergedProfile = mergeCitizenProfiles(state.profile, extracted.proposed_profile);
  mergedProfile = applyContextualSlotReply(mergedProfile, state.lastAskedSlot, safeText);
  mergedProfile.language_pref = lang;

  // 5. Evaluate deterministic eligibility across active catalog
  const assessment = evaluateDeterministicEligibility(mergedProfile, schemes);
  const likely = assessment.results.likely_eligible;
  const needsMore = assessment.results.needs_more_info;

  // Decide whether to ask 1 concise clarifying question (max 3 questions total)
  const nextSlot = chooseNextMissingSlot(mergedProfile, assessment, state.askedSlots);
  const shouldAskClarification =
    nextSlot !== null &&
    state.askedSlots.length < 3 &&
    (likely.length === 0 || (needsMore.length >= 2 && state.askedSlots.length < 2));

  if (shouldAskClarification && nextSlot) {
    const spec = SLOT_PROMPTS[nextSlot];
    const promptText = pickLang(lang, spec.question_en, spec.question_te, spec.question_hi);
    const interimNote =
      likely.length > 0
        ? pickLang(
            lang,
            `I already see ${likely.length} likely eligible scheme${likely.length > 1 ? 's' : ''}! One quick check: `,
            `ఇప్పటికే ${likely.length} పథకాలకు అర్హత ఉండే అవకాశం కనిపిస్తోంది! ఒక చిన్న ప్రశ్న: `,
            `मुझे पहले ही ${likely.length} संभावित पात्र योजनाएं दिख रही हैं! एक छोटा सवाल: `
          )
        : '';

    return {
      ...state,
      phase: 'collecting_profile',
      profile: mergedProfile,
      askedSlots: [...state.askedSlots, nextSlot],
      lastAskedSlot: nextSlot,
      assessment,
      recommendedSchemes: likely,
      turns: [
        ...state.turns,
        citizenTurn,
        {
          id: makeTurnId('agent'),
          speaker: 'agent',
          text: piiPrefix + interimNote + promptText,
          language: lang,
          timestamp: new Date().toISOString(),
        },
      ],
      quickReplies: spec.replies,
    };
  }

  // 6. Present top scheme recommendations
  const { speech, quickReplies, suggestGap } = buildOptionsSpeech(likely, needsMore, lang);
  return {
    ...state,
    phase: 'presenting_options',
    profile: mergedProfile,
    lastAskedSlot: null,
    assessment,
    recommendedSchemes: likely,
    selectedSchemeId: likely[0]?.scheme_id || null,
    suggestWelfareGapRequest: suggestGap,
    turns: [
      ...state.turns,
      citizenTurn,
      {
        id: makeTurnId('agent'),
        speaker: 'agent',
        text: piiPrefix + speech,
        language: lang,
        timestamp: new Date().toISOString(),
      },
    ],
    quickReplies,
  };
}
