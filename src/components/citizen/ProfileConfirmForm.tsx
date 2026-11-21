import React, { useEffect, useMemo, useState } from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import {
  CitizenProfile,
  AgeBand,
  IncomeBand,
  OccupationCategory,
  LandHoldingBand,
  SocialCategory,
  TriStateFlag,
  HouseholdMember,
} from '@/types/profile';
import { ClarifyingQuestion } from '@/types/api';
import {
  AGE_BANDS,
  INCOME_BANDS,
  OCCUPATION_CATEGORIES,
  LAND_HOLDING_BANDS,
  SOCIAL_CATEGORIES,
  AP_DISTRICT_OPTIONS,
  TRI_STATE_OPTIONS,
  formatFieldLabel,
  formatProfileValue,
} from '@/config/bands';
import { APP_CONSTANTS } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import {
  CheckCircle2,
  User,
  MapPin,
  IndianRupee,
  Briefcase,
  Landmark,
  Users,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  SkipForward,
  Check,
  HeartHandshake,
  CreditCard,
} from 'lucide-react';

export interface ProfileConfirmFormProps {
  initialProfile: Partial<CitizenProfile>;
  extractedFields?: string[];
  clarifyingQuestions?: ClarifyingQuestion[];
  focusField?: string | null;
  onConfirm: (confirmed: CitizenProfile) => void;
  onBack: () => void;
  isLoading?: boolean;
}

function normalizeFocusField(raw?: string | null): string | null {
  if (!raw) return null;
  if (raw === 'household_has_student') return 'has_school_student';
  if (raw === 'household_has_post_matric_student') return 'has_college_student';
  if (raw === 'has_white_ration_card') return 'income_band';
  return raw;
}

function deriveDetectedFieldKeys(profile: Partial<CitizenProfile>): string[] {
  const keys: string[] = [];
  if (profile.age_band && profile.age_band !== 'unknown') keys.push('age_band');
  if (profile.district_code && profile.district_code !== 'unknown') keys.push('district_code');
  if (profile.income_band && profile.income_band !== 'unknown') keys.push('income_band');
  if (profile.occupation_category && profile.occupation_category !== 'unknown') {
    keys.push('occupation_category');
  }
  if (profile.land_holding_band && profile.land_holding_band !== 'unknown') {
    keys.push('land_holding_band');
  }
  if (profile.social_category && profile.social_category !== 'unknown') {
    keys.push('social_category');
  }
  if (profile.has_white_ration_card === 'yes') keys.push('has_white_ration_card');
  if (profile.has_school_student === 'yes') keys.push('has_school_student');
  if (profile.has_college_student === 'yes') keys.push('has_college_student');
  if (profile.is_widow_or_single_woman === 'yes') keys.push('is_widow_or_single_woman');
  if (profile.has_disability === 'yes') keys.push('has_disability');
  if (profile.is_tenant_farmer_ccrc === 'yes') keys.push('is_tenant_farmer_ccrc');
  return keys;
}

function buildFallbackProxyQuestions(profile: Partial<CitizenProfile>): ClarifyingQuestion[] {
  const candidates: ClarifyingQuestion[] = [];

  if (
    (!profile.income_band || profile.income_band === 'unknown') &&
    profile.has_white_ration_card !== 'yes'
  ) {
    candidates.push({
      field_name: 'income_band',
      priority_unlock_count: 6,
      question_en:
        'Does your family hold a White Ration / Rice Card (or earn below ₹1.2 Lakhs/year)?',
      question_te:
        'మీ కుటుంబానికి తెల్ల రేషన్ / రైస్ కార్డు ఉందా (లేదా వార్షిక ఆదాయం ₹1.2 లక్షల లోపు ఉందా)?',
      question_hi:
        'क्या आपके परिवार के पास सफेद राशन / राइस कार्ड है (या वार्षिक आय ₹1.2 लाख से कम है)?',
      helper_en:
        'Unlocks Talliki Vandanam, NTR Bharosa, Vaidya Seva & Deepam 2.0 income checks.',
      helper_te:
        'తల్లికి వందనం, ఎన్టీఆర్ భరోసా, వైద్య సేవ మరియు దీపం 2.0 పథకాలకు ఇది కీలకం.',
      helper_hi:
        'तल्लिकी वंदनम, एनटीआर भरोसा, वैद्य सेवा और दीपम 2.0 की पात्रता जांच के लिए उपयोगी।',
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

  if (!profile.occupation_category || profile.occupation_category === 'unknown') {
    candidates.push({
      field_name: 'occupation_category',
      priority_unlock_count: 4,
      question_en: 'What is your primary work or household role?',
      question_te: 'మీ ప్రధాన వృత్తి ఏమిటి?',
      question_hi: 'आपका मुख्य काम या व्यवसाय क्या है?',
      options: [
        {
          value: 'daily_wage',
          label_en: 'Daily-Wage / Coolie Worker',
          label_te: 'దినసరి కూలీ / కార్మికులు',
          label_hi: 'दिहाड़ी मजदूर / श्रमिक',
        },
        {
          value: 'farmer',
          label_en: 'Farmer / Cultivator',
          label_te: 'రైతు / సాగుదారు',
          label_hi: 'किसान / खेतिहर',
        },
        {
          value: 'homemaker',
          label_en: 'Homemaker / Rural Woman',
          label_te: 'గృహిణి / గ్రామీణ మహిళ',
          label_hi: 'गृहिणी / ग्रामीण महिला',
        },
        {
          value: 'student',
          label_en: 'Student',
          label_te: 'విద్యార్థి',
          label_hi: 'छात्र / छात्रा',
        },
      ],
    });
  }

  if (
    (!profile.land_holding_band || profile.land_holding_band === 'unknown') &&
    profile.occupation_category !== 'student'
  ) {
    candidates.push({
      field_name: 'land_holding_band',
      priority_unlock_count: 3,
      question_en: 'Does your household own or lease agricultural farmland?',
      question_te: 'మీ కుటుంబానికి వ్యవసాయ భూమి ఉందా (లేదా కౌలుకు సాగు చేస్తున్నారా)?',
      question_hi: 'क्या आपके परिवार के पास कृषि भूमि है (या बटाई/लीज पर खेती करते हैं)?',
      helper_en: 'Checks Annadata Sukhibhava, PM-KISAN & NTR Bharosa land rules.',
      helper_te: 'అన్నదాత సుఖీభవ, పీఎం కిసాన్ మరియు ఎన్టీఆర్ భరోసా అర్హతను నిర్ధారిస్తుంది.',
      helper_hi: 'अन्नदाता सुखीभव, पीएम किसान और एनटीआर भरोसा की जांच के लिए।',
      options: [
        {
          value: 'none',
          label_en: 'No owned land (Landless)',
          label_te: 'స్వంత భూమి లేదు (భూమిలేని వారు)',
          label_hi: 'कोई निजी जमीन नहीं (भूमिहीन)',
        },
        {
          value: 'tenant_ccrc',
          label_en: 'Leased land (CCRC Tenant Farmer)',
          label_te: 'కౌలు రైతు (CCRC కార్డు)',
          label_hi: 'बटाईदार किसान (CCRC कार्ड)',
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
    (!profile.has_school_student || profile.has_school_student === 'unknown') &&
    profile.occupation_category !== 'student' &&
    profile.age_band !== 'under_18'
  ) {
    candidates.push({
      field_name: 'has_school_student',
      priority_unlock_count: 2,
      question_en: 'Is any child in your home studying in School (Class 1–12) or College?',
      question_te: 'మీ ఇంట్లో పాఠశాల (1–12 తరగతి) లేదా కాలేజీలో చదువుతున్న పిల్లలు ఉన్నారా?',
      question_hi: 'क्या आपके घर में कोई बच्चा स्कूल (कक्षा 1–12) या कॉलेज में पढ़ता है?',
      helper_en: 'Unlocks ₹15,000/yr Talliki Vandanam & Post-Matric Scholarships.',
      helper_te: '₹15,000 తల్లికి వందనం మరియు పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్‌ల కోసం.',
      helper_hi: '₹15,000 तल्लिकी वंदनम और पोस्ट-मैट्रिक छात्रवृत्ति के लिए।',
      options: [
        {
          value: 'school_only',
          label_en: 'Yes — School (Class 1–12)',
          label_te: 'అవును — పాఠశాల (1–12 తరగతి)',
          label_hi: 'हाँ — स्कूल (कक्षा 1–12)',
        },
        {
          value: 'college',
          label_en: 'Yes — Class 10 / Inter / College',
          label_te: 'అవును — 10వ తరగతి / కాలేజీ',
          label_hi: 'हाँ — कक्षा 10 / कॉलेज',
        },
        {
          value: 'no',
          label_en: 'No students in home',
          label_te: 'లేరు',
          label_hi: 'कोई छात्र नहीं',
        },
      ],
    });
  }

  if (!profile.age_band || profile.age_band === 'unknown') {
    candidates.push({
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

  return candidates.slice(0, APP_CONSTANTS.MAX_CLARIFYING_QUESTIONS);
}

export const ProfileConfirmForm: React.FC<ProfileConfirmFormProps> = ({
  initialProfile,
  extractedFields: extractedFieldsProp,
  clarifyingQuestions: clarifyingQuestionsProp,
  focusField = null,
  onConfirm,
  onBack,
  isLoading = false,
}) => {
  const { language, pick, getFontClass } = useLanguage();
  const {
    extractedFields: storeExtractedFields,
    clarifyingQuestions: storeClarifyingQuestions,
  } = useProfileStore();

  const inferInitialSchoolFlag = (p: Partial<CitizenProfile>): TriStateFlag => {
    if (p.has_school_student && p.has_school_student !== 'unknown') return p.has_school_student;
    const hasMemberChild = (p.household_members || []).some(
      (m) =>
        m.relation === 'child' ||
        m.age_band === 'under_18' ||
        m.education_band === 'primary' ||
        m.education_band === 'class_10' ||
        m.education_band === 'intermediate'
    );
    if (hasMemberChild) return 'yes';
    return p.has_school_student || 'unknown';
  };

  const inferInitialCollegeFlag = (p: Partial<CitizenProfile>): TriStateFlag => {
    if (p.has_college_student && p.has_college_student !== 'unknown') return p.has_college_student;
    const hasPostMatricMember = (p.household_members || []).some(
      (m) =>
        m.education_band === 'class_10' ||
        m.education_band === 'intermediate' ||
        m.education_band === 'graduate' ||
        m.education_band === 'post_graduate'
    );
    if (hasPostMatricMember) return 'yes';
    return p.has_college_student || 'unknown';
  };

  // Coarse core fields — NEVER default district to 'Guntur'!
  const [ageBand, setAgeBand] = useState<AgeBand>(initialProfile.age_band || 'unknown');
  const [district, setDistrict] = useState<string>(initialProfile.district_code || 'unknown');
  const [incomeBand, setIncomeBand] = useState<IncomeBand>(initialProfile.income_band || 'unknown');
  const [occupation, setOccupation] = useState<OccupationCategory>(
    initialProfile.occupation_category || 'unknown'
  );
  const [landHolding, setLandHolding] = useState<LandHoldingBand>(
    initialProfile.land_holding_band || 'unknown'
  );
  const [socialCategory, setSocialCategory] = useState<SocialCategory>(
    initialProfile.social_category || 'unknown'
  );

  // Coarse household & vulnerability flags
  const [hasWhiteRationCard, setHasWhiteRationCard] = useState<TriStateFlag>(
    initialProfile.has_white_ration_card || 'unknown'
  );
  const [hasSchoolStudent, setHasSchoolStudent] = useState<TriStateFlag>(() =>
    inferInitialSchoolFlag(initialProfile)
  );
  const [hasCollegeStudent, setHasCollegeStudent] = useState<TriStateFlag>(() =>
    inferInitialCollegeFlag(initialProfile)
  );
  const [isWidowOrSingleWoman, setIsWidowOrSingleWoman] = useState<TriStateFlag>(
    initialProfile.is_widow_or_single_woman || 'unknown'
  );
  const [hasDisability, setHasDisability] = useState<TriStateFlag>(
    initialProfile.has_disability || 'unknown'
  );
  const [isTenantFarmerCcrc, setIsTenantFarmerCcrc] = useState<TriStateFlag>(
    initialProfile.is_tenant_farmer_ccrc || 'unknown'
  );

  const [skippedFields, setSkippedFields] = useState<Record<string, boolean>>({});

  const initialDetectedKeys = useMemo(() => {
    const fromProps =
      extractedFieldsProp && extractedFieldsProp.length > 0
        ? extractedFieldsProp
        : storeExtractedFields;
    const fromProfile = deriveDetectedFieldKeys(initialProfile);
    return Array.from(new Set([...fromProps, ...fromProfile]));
  }, [initialProfile, extractedFieldsProp, storeExtractedFields]);

  const activeProxyQuestions = useMemo<ClarifyingQuestion[]>(() => {
    if (clarifyingQuestionsProp && clarifyingQuestionsProp.length > 0) {
      return clarifyingQuestionsProp.slice(0, APP_CONSTANTS.MAX_CLARIFYING_QUESTIONS);
    }
    if (storeClarifyingQuestions && storeClarifyingQuestions.length > 0) {
      return storeClarifyingQuestions.slice(0, APP_CONSTANTS.MAX_CLARIFYING_QUESTIONS);
    }
    return buildFallbackProxyQuestions(initialProfile);
  }, [initialProfile, clarifyingQuestionsProp, storeClarifyingQuestions]);

  const normalizedFocus = normalizeFocusField(focusField);

  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(
    () => Boolean(normalizedFocus) || deriveDetectedFieldKeys(initialProfile).length === 0
  );

  // Sync local state immediately whenever initialProfile changes (e.g. Demo Reset or Scenario switch)
  useEffect(() => {
    setAgeBand(initialProfile.age_band || 'unknown');
    setDistrict(initialProfile.district_code || 'unknown');
    setIncomeBand(initialProfile.income_band || 'unknown');
    setOccupation(initialProfile.occupation_category || 'unknown');
    setLandHolding(initialProfile.land_holding_band || 'unknown');
    setSocialCategory(initialProfile.social_category || 'unknown');
    setHasWhiteRationCard(initialProfile.has_white_ration_card || 'unknown');
    setHasSchoolStudent(inferInitialSchoolFlag(initialProfile));
    setHasCollegeStudent(inferInitialCollegeFlag(initialProfile));
    setIsWidowOrSingleWoman(initialProfile.is_widow_or_single_woman || 'unknown');
    setHasDisability(initialProfile.has_disability || 'unknown');
    setIsTenantFarmerCcrc(initialProfile.is_tenant_farmer_ccrc || 'unknown');
    setSkippedFields({});

    if (!normalizedFocus) {
      setIsDetailsOpen(deriveDetectedFieldKeys(initialProfile).length === 0);
    }
  }, [initialProfile, normalizedFocus]);

  // Auto-open disclosure and scroll/focus target field when focusField is passed
  useEffect(() => {
    if (!normalizedFocus) return;
    setIsDetailsOpen(true);

    const timer = window.setTimeout(() => {
      const targetEl = document.getElementById(`field-${normalizedFocus}`);
      const wrapperEl = document.getElementById(`wrapper-${normalizedFocus}`);
      if (wrapperEl) {
        wrapperEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (targetEl && typeof targetEl.focus === 'function') {
        targetEl.focus({ preventScroll: true });
      }
    }, 80);

    return () => window.clearTimeout(timer);
  }, [normalizedFocus]);

  // Build live summary chips from currently confirmed attributes
  const summaryChips = useMemo(() => {
    const items: Array<{ key: string; label: string; valueText: string; isOriginal: boolean }> = [];
    const addIfKnown = (fieldKey: string, rawVal: string | undefined, onlyYes = false) => {
      if (!rawVal || rawVal === 'unknown') return;
      if (onlyYes && rawVal !== 'yes') return;
      items.push({
        key: fieldKey,
        label: formatFieldLabel(fieldKey, language),
        valueText: formatProfileValue(fieldKey, rawVal, language),
        isOriginal: initialDetectedKeys.includes(fieldKey),
      });
    };

    addIfKnown('age_band', ageBand);
    addIfKnown('district_code', district);
    addIfKnown('income_band', incomeBand);
    if (hasWhiteRationCard === 'yes' && incomeBand !== 'below_1_2L') {
      addIfKnown('has_white_ration_card', hasWhiteRationCard, true);
    }
    addIfKnown('occupation_category', occupation);
    addIfKnown('land_holding_band', landHolding);
    addIfKnown('social_category', socialCategory);
    addIfKnown('has_school_student', hasSchoolStudent, true);
    addIfKnown('has_college_student', hasCollegeStudent, true);
    addIfKnown('is_widow_or_single_woman', isWidowOrSingleWoman, true);
    addIfKnown('has_disability', hasDisability, true);
    addIfKnown('is_tenant_farmer_ccrc', isTenantFarmerCcrc, true);

    return items;
  }, [
    language,
    initialDetectedKeys,
    ageBand,
    district,
    incomeBand,
    hasWhiteRationCard,
    occupation,
    landHolding,
    socialCategory,
    hasSchoolStudent,
    hasCollegeStudent,
    isWidowOrSingleWoman,
    hasDisability,
    isTenantFarmerCcrc,
  ]);

  const getProxyQuestionValue = (q: ClarifyingQuestion): string => {
    const field = q.field_name;
    if (field === 'income_band') {
      return incomeBand !== 'unknown' ? incomeBand : '';
    }
    if (field === 'occupation_category') {
      return occupation !== 'unknown' ? occupation : '';
    }
    if (field === 'land_holding_band') {
      if (
        isTenantFarmerCcrc === 'yes' &&
        landHolding === 'none' &&
        q.options.some((o) => o.value === 'tenant_ccrc')
      ) {
        return 'tenant_ccrc';
      }
      return landHolding !== 'unknown' ? landHolding : '';
    }
    if (field === 'has_school_student' || field === 'household_has_student') {
      if (hasCollegeStudent === 'yes' && q.options.some((o) => o.value === 'college')) {
        return 'college';
      }
      if (hasSchoolStudent === 'yes') {
        return q.options.some((o) => o.value === 'school_only') ? 'school_only' : 'yes';
      }
      if (hasSchoolStudent === 'no') return 'no';
      return '';
    }
    if (field === 'age_band') {
      return ageBand !== 'unknown' ? ageBand : '';
    }
    if (field === 'social_category') {
      return socialCategory !== 'unknown' ? socialCategory : '';
    }
    if (field === 'district_code') {
      return district !== 'unknown' ? district : '';
    }
    if (field === 'is_widow_or_single_woman') {
      return isWidowOrSingleWoman !== 'unknown' ? isWidowOrSingleWoman : '';
    }
    if (field === 'has_disability') {
      return hasDisability !== 'unknown' ? hasDisability : '';
    }
    if (field === 'is_tenant_farmer_ccrc') {
      return isTenantFarmerCcrc !== 'unknown' ? isTenantFarmerCcrc : '';
    }
    return '';
  };

  const handleProxyAnswer = (fieldName: string, val: string) => {
    setSkippedFields((prev) => ({ ...prev, [fieldName]: false }));

    if (fieldName === 'income_band') {
      setIncomeBand(val as IncomeBand);
      if (val === 'below_1_2L') {
        setHasWhiteRationCard('yes');
      } else if (hasWhiteRationCard === 'yes') {
        setHasWhiteRationCard('no');
      }
      return;
    }

    if (fieldName === 'occupation_category') {
      setOccupation(val as OccupationCategory);
      return;
    }

    if (fieldName === 'land_holding_band') {
      if (val === 'tenant_ccrc') {
        setLandHolding('none');
        setIsTenantFarmerCcrc('yes');
        setOccupation('farmer');
      } else {
        setLandHolding(val as LandHoldingBand);
        if (isTenantFarmerCcrc === 'yes') {
          setIsTenantFarmerCcrc('no');
        }
      }
      return;
    }

    if (fieldName === 'has_school_student' || fieldName === 'household_has_student') {
      if (val === 'school_only') {
        setHasSchoolStudent('yes');
        setHasCollegeStudent('no');
      } else if (val === 'college') {
        setHasSchoolStudent('yes');
        setHasCollegeStudent('yes');
      } else if (val === 'yes') {
        setHasSchoolStudent('yes');
      } else if (val === 'no') {
        setHasSchoolStudent('no');
        setHasCollegeStudent('no');
      }
      return;
    }

    if (fieldName === 'age_band') {
      setAgeBand(val as AgeBand);
      return;
    }

    if (fieldName === 'social_category') {
      setSocialCategory(val as SocialCategory);
      return;
    }

    if (fieldName === 'district_code') {
      setDistrict(val);
      return;
    }

    if (fieldName === 'is_widow_or_single_woman') {
      setIsWidowOrSingleWoman(val as TriStateFlag);
      return;
    }

    if (fieldName === 'has_disability') {
      setHasDisability(val as TriStateFlag);
      return;
    }

    if (fieldName === 'is_tenant_farmer_ccrc') {
      setIsTenantFarmerCcrc(val as TriStateFlag);
    }
  };

  const handleSkipQuestion = (fieldName: string) => {
    setSkippedFields((prev) => ({ ...prev, [fieldName]: true }));

    if (fieldName === 'income_band') {
      setIncomeBand('unknown');
      setHasWhiteRationCard('unknown');
    } else if (fieldName === 'occupation_category') {
      setOccupation('unknown');
    } else if (fieldName === 'land_holding_band') {
      setLandHolding('unknown');
      setIsTenantFarmerCcrc('unknown');
    } else if (fieldName === 'has_school_student' || fieldName === 'household_has_student') {
      setHasSchoolStudent('unknown');
      setHasCollegeStudent('unknown');
    } else if (fieldName === 'age_band') {
      setAgeBand('unknown');
    } else if (fieldName === 'social_category') {
      setSocialCategory('unknown');
    } else if (fieldName === 'district_code') {
      setDistrict('unknown');
    }
  };

  const handleToggleWhiteCardQuick = () => {
    if (hasWhiteRationCard === 'yes') {
      setHasWhiteRationCard('no');
    } else {
      setHasWhiteRationCard('yes');
      if (incomeBand === 'unknown') {
        setIncomeBand('below_1_2L');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let nextMembers: HouseholdMember[] = [...(initialProfile.household_members || [])];

    if (hasSchoolStudent === 'no' && hasCollegeStudent === 'no') {
      nextMembers = nextMembers.filter((m) => m.relation !== 'child');
    } else if (hasSchoolStudent === 'yes' || hasCollegeStudent === 'yes') {
      const hasChildMember = nextMembers.some((m) => m.relation === 'child');
      if (!hasChildMember) {
        nextMembers.push({
          relation: 'child',
          age_band: hasCollegeStudent === 'yes' && hasSchoolStudent !== 'yes' ? '18_25' : 'under_18',
          education_band: hasCollegeStudent === 'yes' ? 'intermediate' : 'class_10',
        });
      }
    }

    const confirmed: CitizenProfile = {
      age_band: ageBand,
      state_code: 'AP',
      district_code: district || 'unknown',
      income_band: incomeBand,
      occupation_category: occupation,
      social_category: socialCategory,
      land_holding_band: landHolding,
      language_pref: initialProfile.language_pref || language,
      household_members: nextMembers,
      has_school_student: hasSchoolStudent,
      has_college_student: hasCollegeStudent,
      is_widow_or_single_woman: isWidowOrSingleWoman,
      has_disability: hasDisability,
      is_tenant_farmer_ccrc: isTenantFarmerCcrc,
      has_white_ration_card: hasWhiteRationCard,
      is_sample: initialProfile.is_sample ?? false,
    };

    onConfirm(confirmed);
  };

  const selectClass = cn(
    'w-full min-h-[44px] rounded-md border border-slate-500 bg-white px-3 py-2 text-sm sm:text-base text-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 touch-target',
    getFontClass()
  );

  const renderTriStateToggle = (
    fieldId: string,
    labelText: string,
    helperText: string,
    value: TriStateFlag,
    onChange: (next: TriStateFlag) => void
  ) => {
    const isFocusedTarget = normalizedFocus === fieldId;

    return (
      <div
        id={`wrapper-${fieldId}`}
        className={cn(
          'rounded-lg border p-3.5 sm:p-4 bg-slate-50/70 space-y-2.5 transition-all',
          isFocusedTarget ? 'border-focus ring-2 ring-focus bg-primary/5' : 'border-slate-300'
        )}
      >
        <div>
          <span
            id={`label-${fieldId}`}
            className={cn('block text-sm font-bold text-body leading-snug', getFontClass())}
          >
            {labelText}
          </span>
          <span className={cn('block text-xs text-slate-600 mt-0.5 leading-snug', getFontClass())}>
            {helperText}
          </span>
        </div>

        <RadioGroup.Root
          id={`field-${fieldId}`}
          aria-labelledby={`label-${fieldId}`}
          value={value}
          onValueChange={(v) => onChange(v as TriStateFlag)}
          className="grid grid-cols-3 gap-2"
        >
          {TRI_STATE_OPTIONS.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <RadioGroup.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'min-h-[44px] px-2.5 py-2 rounded-md border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 touch-target',
                  isSelected
                    ? opt.value === 'yes'
                      ? 'bg-success text-white border-success shadow-sm'
                      : opt.value === 'no'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'bg-primary/10 text-primary border-primary font-bold'
                    : 'bg-white text-slate-800 border-slate-500 hover:bg-slate-100',
                  getFontClass()
                )}
              >
                <RadioGroup.Indicator className="inline-flex items-center">
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </RadioGroup.Indicator>
                <span>{pick(opt.label_en, opt.label_te, opt.label_hi)}</span>
              </RadioGroup.Item>
            );
          })}
        </RadioGroup.Root>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1: Extracted Summary Banner / Chips + Progressive Disclosure Toggle */}
      <Card className="border-slate-300 bg-white shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle
              className={cn(
                'text-lg md:text-xl flex items-center gap-2 text-body',
                getFontClass()
              )}
            >
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'What We Understood From Your Story',
                  'మీ వివరణ నుండి మేము గుర్తించిన వివరాలు',
                  'आपकी जानकारी से समझे गए विवरण'
                )}
              </span>
            </CardTitle>
            <p className={cn('text-xs sm:text-sm text-muted leading-relaxed', getFontClass())}>
              {pick(
                'Coarse categories only — no Aadhaar or personal IDs stored. Confirm directly or adjust any detail below.',
                'సాధారణ కేటగిరీలు మాత్రమే — ఆధార్ లేదా వ్యక్తిగత నంబర్లు అవసరం లేదు. నేరుగా నిర్ధారించండి లేదా సవరించండి.',
                'केवल सामान्य श्रेणियां — कोई आधार या पहचान नंबर संग्रहीत नहीं। सीधे पुष्टि करें या नीचे बदलाव करें।'
              )}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={isDetailsOpen}
            aria-controls="full-profile-details-panel"
            onClick={() => setIsDetailsOpen((prev) => !prev)}
            className={cn(
              'shrink-0 inline-flex items-center gap-1.5 font-semibold border-slate-500',
              getFontClass()
            )}
          >
            <SlidersHorizontal className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span>
              {isDetailsOpen
                ? pick('Hide Full Details', 'పూర్తి ఫారమ్‌ను దాచండి', 'पूरा फ़ॉर्म छिपाएं')
                : pick('Edit All Details', 'అన్ని వివరాలను సవరించండి', 'सभी विवरण संपादित करें')}
            </span>
            {isDetailsOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
          </Button>
        </CardHeader>

        <CardContent className="pt-4">
          {summaryChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {summaryChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant={chip.isOriginal ? 'success' : 'info'}
                  className={cn(
                    'px-3 py-1.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 rounded-lg',
                    getFontClass()
                  )}
                >
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {chip.label}: <strong className="font-bold">{chip.valueText}</strong>
                  </span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className={cn('text-sm text-slate-700 leading-relaxed', getFontClass())}>
              {pick(
                'No specific categories were detected yet. Answer the quick questions below or use the form to select what applies to your household.',
                'ఇంకా నిర్దిష్ట వివరాలు గుర్తించబడలేదు. క్రింది సాధారణ ప్రశ్నలకు సమాధానం ఇవ్వండి లేదా ఫారమ్‌లో ఎంచుకోండి.',
                'अभी कोई विशिष्ट श्रेणी पहचानी नहीं गई है। नीचे दिए त्वरित प्रश्नों का उत्तर दें या फ़ॉर्म में चुनें।'
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: Up to 3 Skippable Everyday Proxy Question Cards (@radix-ui/react-radio-group) */}
      {activeProxyQuestions.length > 0 && (
        <section
          aria-label={pick(
            'Optional quick questions to unlock more schemes',
            'మరిన్ని పథకాలను అన్‌లాక్ చేయడానికి ఐచ్ఛిక ప్రశ్నలు',
            'अधिक योजनाओं की जांच हेतु वैकल्पिक त्वरित प्रश्न'
          )}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <h2
              className={cn(
                'text-base sm:text-lg font-bold text-primary flex items-center gap-2',
                getFontClass()
              )}
            >
              <Sparkles className="h-5 w-5 text-amber-600 shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'Quick Optional Questions (Skip Anytime)',
                  'మరిన్ని పథకాల కోసం చిన్న ప్రశ్నలు (దాటవేయవచ్చు)',
                  'त्वरित वैकल्पिक प्रश्न (कभी भी छोड़ सकते हैं)'
                )}
              </span>
            </h2>
            <span className={cn('text-xs font-medium text-slate-600', getFontClass())}>
              {pick(
                `Up to ${activeProxyQuestions.length} quick checks`,
                `గరిష్టంగా ${activeProxyQuestions.length} చిన్న ప్రశ్నలు`,
                `अधिकतम ${activeProxyQuestions.length} त्वरित प्रश्न`
              )}
            </span>
          </div>

          <div className="space-y-4">
            {activeProxyQuestions.map((q, index) => {
              const selectedVal = getProxyQuestionValue(q);
              const isSkipped = Boolean(skippedFields[q.field_name]) && !selectedVal;
              const qTitle = pick(q.question_en, q.question_te, q.question_hi);
              const qHelper =
                q.helper_en || q.helper_te || q.helper_hi
                  ? pick(q.helper_en || '', q.helper_te || '', q.helper_hi || '')
                  : '';

              return (
                <Card
                  key={q.field_name}
                  className={cn(
                    'border transition-colors shadow-sm',
                    selectedVal
                      ? 'border-success bg-success-surface/30'
                      : 'border-slate-300 bg-white'
                  )}
                >
                  <CardContent className="p-4 sm:p-5 space-y-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="border-primary/40 text-primary">
                            {pick(
                              `Question ${index + 1} of ${activeProxyQuestions.length}`,
                              `ప్రశ్న ${index + 1} / ${activeProxyQuestions.length}`,
                              `प्रश्न ${index + 1} / ${activeProxyQuestions.length}`
                            )}
                          </Badge>
                          {q.priority_unlock_count && q.priority_unlock_count > 0 && (
                            <Badge
                              variant="info"
                              className={cn('font-medium', getFontClass())}
                            >
                              {pick(
                                `Helps check ${q.priority_unlock_count} schemes`,
                                `${q.priority_unlock_count} పథకాల తనిఖీకి సహాయపడుతుంది`,
                                `${q.priority_unlock_count} योजनाओं की जांच में सहायक`
                              )}
                            </Badge>
                          )}
                        </div>

                        <h3
                          id={`proxy-q-${q.field_name}`}
                          className={cn(
                            'text-base sm:text-lg font-bold text-body pt-1 leading-snug',
                            getFontClass()
                          )}
                        >
                          {qTitle}
                        </h3>

                        {qHelper && (
                          <p
                            className={cn(
                              'text-xs sm:text-sm text-slate-600 leading-relaxed',
                              getFontClass()
                            )}
                          >
                            {qHelper}
                          </p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSkipQuestion(q.field_name)}
                        className={cn(
                          'text-xs text-slate-700 hover:text-body border border-slate-300 bg-slate-50 shrink-0 inline-flex items-center gap-1',
                          getFontClass()
                        )}
                      >
                        <SkipForward className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          {pick(
                            'Not sure / Skip',
                            'తెలియదు / దాటవేయి',
                            'पता नहीं / छोड़ें'
                          )}
                        </span>
                      </Button>
                    </div>

                    <RadioGroup.Root
                      aria-labelledby={`proxy-q-${q.field_name}`}
                      value={selectedVal}
                      onValueChange={(val) => handleProxyAnswer(q.field_name, val)}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                    >
                      {q.options.map((opt) => {
                        const isChecked = selectedVal === opt.value;
                        return (
                          <RadioGroup.Item
                            key={opt.value}
                            value={opt.value}
                            className={cn(
                              'min-h-[52px] w-full rounded-xl border p-3.5 text-left flex items-center gap-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 touch-target',
                              isChecked
                                ? 'border-2 border-primary bg-primary/10 text-primary font-bold shadow-sm'
                                : 'border-slate-500 bg-white text-body hover:bg-slate-50 hover:border-primary/60 font-medium',
                              getFontClass()
                            )}
                          >
                            <span
                              className={cn(
                                'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                isChecked
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-slate-500 bg-white'
                              )}
                              aria-hidden="true"
                            >
                              <RadioGroup.Indicator className="flex items-center justify-center">
                                <Check className="h-3.5 w-3.5" />
                              </RadioGroup.Indicator>
                            </span>
                            <span className="text-sm sm:text-base leading-snug">
                              {pick(opt.label_en, opt.label_te, opt.label_hi)}
                            </span>
                          </RadioGroup.Item>
                        );
                      })}
                    </RadioGroup.Root>

                    {isSkipped && (
                      <p
                        className={cn(
                          'text-xs font-medium text-slate-600 bg-slate-100 rounded-md px-3 py-2',
                          getFontClass()
                        )}
                      >
                        {pick(
                          'Skipped — schemes needing this detail will remain under "Needs More Information" instead of being rejected.',
                          'దాటవేయబడింది — ఈ వివరాలు అవసరమైన పథకాలు తిరస్కరించబడకుండా "మరిన్ని వివరాలు అవసరం" కింద చూపబడతాయి.',
                          'छोड़ा गया — इस जानकारी वाली योजनाएं अस्वीकार होने के बजाय "अधिक जानकारी आवश्यक" में दिखेंगी।'
                        )}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3: Full Coarse Controls + Household & Vulnerability Toggles */}
      {isDetailsOpen && (
        <Card id="full-profile-details-panel" className="border-slate-300 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200 pb-4">
            <CardTitle
              className={cn('text-lg md:text-xl flex items-center gap-2', getFontClass())}
            >
              <User className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'All Household & Eligibility Categories',
                  'అన్ని కుటుంబ & అర్హత వివరాలు',
                  'सभी पारिवारिक और पात्रता श्रेणियां'
                )}
              </span>
            </CardTitle>
            <p className={cn('text-xs sm:text-sm text-muted leading-relaxed', getFontClass())}>
              {pick(
                'Any detail left as "Not specified" will never disqualify you—it simply marks matching schemes as needing confirmation.',
                'ఏదైనా వివరాలు "పేర్కొనలేదు" అని ఉంచితే మీ అర్హత తిరస్కరించబడదు—అవసరమైన పథకాలకు అదనపు సమాచారంగా మాత్రమే చూపుతుంది.',
                'किसी भी विवरण को "निर्दिष्ट नहीं" छोड़ने पर आपको अयोग्य नहीं ठहराया जाएगा—संबंधित योजनाएं केवल पुष्टि मांगेंगी।'
              )}
            </p>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            {/* 6 Core Coarse Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age Band */}
              <div
                id="wrapper-age_band"
                className={cn(
                  'space-y-2 rounded-lg p-1 -m-1 transition-all',
                  normalizedFocus === 'age_band' && 'ring-2 ring-focus bg-primary/5 p-2.5'
                )}
              >
                <Label
                  htmlFor="field-age_band"
                  className={cn(
                    'flex items-center gap-1.5 font-bold text-sm leading-snug',
                    getFontClass()
                  )}
                >
                  <User className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span>{pick('Age Group', 'వయోపరిమితి', 'आयु वर्ग')}</span>
                </Label>
                <select
                  id="field-age_band"
                  value={ageBand}
                  onChange={(e) => setAgeBand(e.target.value as AgeBand)}
                  className={selectClass}
                >
                  <option value="unknown">
                    {pick(
                      'Not specified / Skip',
                      'పేర్కొనలేదు / దాటవేయి',
                      'निर्दिष्ट नहीं / छोड़ें'
                    )}
                  </option>
                  {AGE_BANDS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {pick(b.label_en, b.label_te, b.label_hi)}
                    </option>
                  ))}
                </select>
              </div>

              {/* District (NEVER defaults to Guntur!) */}
              <div
                id="wrapper-district_code"
                className={cn(
                  'space-y-2 rounded-lg p-1 -m-1 transition-all',
                  normalizedFocus === 'district_code' && 'ring-2 ring-focus bg-primary/5 p-2.5'
                )}
              >
                <Label
                  htmlFor="field-district_code"
                  className={cn(
                    'flex items-center gap-1.5 font-bold text-sm leading-snug',
                    getFontClass()
                  )}
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span>
                    {pick(
                      'District in Andhra Pradesh',
                      'ఆంధ్రప్రదేశ్ జిల్లా',
                      'आंध्र प्रदेश का जिला'
                    )}
                  </span>
                </Label>
                <select
                  id="field-district_code"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className={selectClass}
                >
                  <option value="unknown">
                    {pick(
                      'Any District in Andhra Pradesh (Not specified)',
                      'ఆంధ్రప్రదేశ్‌లోని ఏ జిల్లా అయినా (పేర్కొనలేదు)',
                      'आंध्र प्रदेश का कोई भी जिला (निर्दिष्ट नहीं)'
                    )}
                  </option>
                  {AP_DISTRICT_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {pick(d.label_en, d.label_te, d.label_hi)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Income Band + White Ration Card Quick Pill */}
              <div
                id="wrapper-income_band"
                className={cn(
                  'space-y-2.5 rounded-lg p-1 -m-1 transition-all',
                  normalizedFocus === 'income_band' && 'ring-2 ring-focus bg-primary/5 p-2.5'
                )}
              >
                <Label
                  htmlFor="field-income_band"
                  className={cn(
                    'flex items-center gap-1.5 font-bold text-sm leading-snug',
                    getFontClass()
                  )}
                >
                  <IndianRupee className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span>
                    {pick(
                      'Annual Household Income',
                      'కుటుంబ వార్షిక ఆదాయం',
                      'वार्षिक पारिवारिक आय'
                    )}
                  </span>
                </Label>
                <select
                  id="field-income_band"
                  value={incomeBand}
                  onChange={(e) => {
                    const nextInc = e.target.value as IncomeBand;
                    setIncomeBand(nextInc);
                    if (nextInc === 'below_1_2L' && hasWhiteRationCard === 'unknown') {
                      setHasWhiteRationCard('yes');
                    }
                  }}
                  className={selectClass}
                >
                  <option value="unknown">
                    {pick(
                      'Not specified / Skip',
                      'పేర్కొనలేదు / దాటవేయి',
                      'निर्दिष्ट नहीं / छोड़ें'
                    )}
                  </option>
                  {INCOME_BANDS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {pick(b.label_en, b.label_te, b.label_hi)}
                    </option>
                  ))}
                </select>

                {/* White Ration Card Quick Toggle Pill */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={hasWhiteRationCard === 'yes'}
                  onClick={handleToggleWhiteCardQuick}
                  className={cn(
                    'w-full min-h-[44px] px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus touch-target',
                    hasWhiteRationCard === 'yes'
                      ? 'bg-success-surface border-success text-success'
                      : 'bg-slate-50 border-slate-400 text-slate-800 hover:bg-slate-100',
                    getFontClass()
                  )}
                >
                  <span className="flex items-center gap-2 text-left">
                    <CreditCard className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {pick(
                        'We hold a White Ration / Rice Card (BPL Proxy)',
                        'మాకు తెల్ల రేషన్ / రైస్ కార్డు ఉంది',
                        'हमारे पास सफेद राशन / राइस कार्ड है'
                      )}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-bold shrink-0',
                      hasWhiteRationCard === 'yes'
                        ? 'bg-success text-white'
                        : 'bg-slate-200 text-slate-700'
                    )}
                  >
                    {hasWhiteRationCard === 'yes'
                      ? pick('Yes', 'అవును', 'हाँ')
                      : pick('Tap if Yes', 'ఉంటే నొక్కండి', 'हाँ तो चुनें')}
                  </span>
                </button>
              </div>

              {/* Occupation */}
              <div
                id="wrapper-occupation_category"
                className={cn(
                  'space-y-2 rounded-lg p-1 -m-1 transition-all',
                  normalizedFocus === 'occupation_category' &&
                    'ring-2 ring-focus bg-primary/5 p-2.5'
                )}
              >
                <Label
                  htmlFor="field-occupation_category"
                  className={cn(
                    'flex items-center gap-1.5 font-bold text-sm leading-snug',
                    getFontClass()
                  )}
                >
                  <Briefcase className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span>{pick('Primary Occupation', 'ప్రధాన వృత్తి', 'मुख्य व्यवसाय')}</span>
                </Label>
                <select
                  id="field-occupation_category"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value as OccupationCategory)}
                  className={selectClass}
                >
                  <option value="unknown">
                    {pick(
                      'Not specified / Skip',
                      'పేర్కొనలేదు / దాటవేయి',
                      'निर्दिष्ट नहीं / छोड़ें'
                    )}
                  </option>
                  {OCCUPATION_CATEGORIES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {pick(b.label_en, b.label_te, b.label_hi)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Land Holding Band */}
              <div
                id="wrapper-land_holding_band"
                className={cn(
                  'space-y-2 rounded-lg p-1 -m-1 transition-all',
                  normalizedFocus === 'land_holding_band' &&
                    'ring-2 ring-focus bg-primary/5 p-2.5'
                )}
              >
                <Label
                  htmlFor="field-land_holding_band"
                  className={cn(
                    'flex items-center gap-1.5 font-bold text-sm leading-snug',
                    getFontClass()
                  )}
                >
                  <Landmark className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span>
                    {pick(
                      'Owned Agricultural Land',
                      'స్వంత వ్యవసాయ భూమి వివరాలు',
                      'निजी कृषि भूमि की स्थिति'
                    )}
                  </span>
                </Label>
                <select
                  id="field-land_holding_band"
                  value={landHolding}
                  onChange={(e) => setLandHolding(e.target.value as LandHoldingBand)}
                  className={selectClass}
                >
                  <option value="unknown">
                    {pick(
                      'Not specified / Skip',
                      'పేర్కొనలేదు / దాటవేయి',
                      'निर्दिष्ट नहीं / छोड़ें'
                    )}
                  </option>
                  {LAND_HOLDING_BANDS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {pick(b.label_en, b.label_te, b.label_hi)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Social Category */}
              <div
                id="wrapper-social_category"
                className={cn(
                  'space-y-2 rounded-lg p-1 -m-1 transition-all',
                  normalizedFocus === 'social_category' &&
                    'ring-2 ring-focus bg-primary/5 p-2.5'
                )}
              >
                <Label
                  htmlFor="field-social_category"
                  className={cn(
                    'flex items-center gap-1.5 font-bold text-sm leading-snug',
                    getFontClass()
                  )}
                >
                  <Users className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                  <span>
                    {pick(
                      'Social Category (Optional)',
                      'సామాజిక వర్గం (ఐచ్ఛికం)',
                      'सामाजिक वर्ग (वैकल्पिक)'
                    )}
                  </span>
                </Label>
                <select
                  id="field-social_category"
                  value={socialCategory}
                  onChange={(e) => setSocialCategory(e.target.value as SocialCategory)}
                  className={selectClass}
                >
                  <option value="unknown">
                    {pick(
                      'Not specified / Skip',
                      'పేర్కొనలేదు / దాటవేయి',
                      'निर्दिष्ट नहीं / छोड़ें'
                    )}
                  </option>
                  {SOCIAL_CATEGORIES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {pick(b.label_en, b.label_te, b.label_hi)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Household Education & Special Vulnerability Toggles */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                <h4 className={cn('text-base font-bold text-body', getFontClass())}>
                  {pick(
                    'Family Students & Priority Circumstances',
                    'కుటుంబ విద్యార్థులు & ప్రత్యేక పరిస్థితులు',
                    'परिवार के छात्र और विशेष परिस्थितियां'
                  )}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTriStateToggle(
                  'has_school_student',
                  pick(
                    'School Student in Family (Class 1–12)',
                    'కుటుంబంలో పాఠశాల విద్యార్థి (1–12 తరగతి)',
                    'परिवार में स्कूली छात्र (कक्षा 1–12)'
                  ),
                  pick(
                    'For Talliki Vandanam (₹15,000/yr school support)',
                    'తల్లికి వందనం (₹15,000/సం.) పథకం కోసం',
                    'तल्लिकी वंदनम (₹15,000/वर्ष) के लिए'
                  ),
                  hasSchoolStudent,
                  (next) => {
                    setHasSchoolStudent(next);
                    if (next === 'no') setHasCollegeStudent('no');
                  }
                )}

                {renderTriStateToggle(
                  'has_college_student',
                  pick(
                    'Class 10 / Inter / College Student in Family',
                    '10వ తరగతి / ఇంటర్ / కాలేజీ విద్యార్థి',
                    'परिवार में कक्षा 10 / इंटर / कॉलेज छात्र'
                  ),
                  pick(
                    'For Post-Matric Scholarships & Fee Reimbursement',
                    'పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్‌ల కోసం',
                    'पोस्ट-मैट्रिक छात्रवृत्ति के लिए'
                  ),
                  hasCollegeStudent,
                  (next) => {
                    setHasCollegeStudent(next);
                    if (next === 'yes' && hasSchoolStudent === 'no') {
                      setHasSchoolStudent('yes');
                    }
                  }
                )}

                {renderTriStateToggle(
                  'is_widow_or_single_woman',
                  pick(
                    'Widow / Destitute Single Woman (18+)',
                    'వితంతువు / ఒంటరి మహిళ (18+ ఏళ్లు)',
                    'विधवा / एकल महिला (18+ वर्ष)'
                  ),
                  pick(
                    'For NTR Bharosa Widow / Single Woman Pension',
                    'ఎన్టీఆర్ భరోసా వితంతు / ఒంటరి మహిళ పెన్షన్ కోసం',
                    'एनटीआर भरोसा विधवा / एकल महिला पेंशन हेतु'
                  ),
                  isWidowOrSingleWoman,
                  setIsWidowOrSingleWoman
                )}

                {renderTriStateToggle(
                  'has_disability',
                  pick(
                    'Person with Disability (SADAREM / Divyangjan)',
                    'దివ్యాంగుల స్థితి (సదరం సర్టిఫికేట్)',
                    'दिव्यांग व्यक्ति (सदरम प्रमाणपत्र)'
                  ),
                  pick(
                    'For ₹6,000/month Disability Pension support',
                    'నెలకు ₹6,000 దివ్యాంగుల పెన్షన్ కోసం',
                    '₹6,000/माह दिव्यांग पेंशन सहायता हेतु'
                  ),
                  hasDisability,
                  setHasDisability
                )}

                <div className="md:col-span-2">
                  {renderTriStateToggle(
                    'is_tenant_farmer_ccrc',
                    pick(
                      'Tenant Farmer Cultivating Leased Land (CCRC / Koulu Rythu)',
                      'కౌలు రైతు — లీజు భూమి సాగు (CCRC కార్డు)',
                      'बटाईदार किसान — लीज भूमि पर खेती (CCRC कार्ड)'
                    ),
                    pick(
                      'Unlocks Annadata Sukhibhava ₹20,000/yr even without owned land',
                      'స్వంత భూమి లేకపోయినా అన్నదాత సుఖీభవ ₹20,000/సం. అర్హత కోసం',
                      'निजी जमीन न होने पर भी अन्नदाता सुखीभव ₹20,000/वर्ष हेतु'
                    ),
                    isTenantFarmerCcrc,
                    (next) => {
                      setIsTenantFarmerCcrc(next);
                      if (next === 'yes' && occupation === 'unknown') {
                        setOccupation('farmer');
                      }
                    }
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Action Bar */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isLoading}
          className={cn('w-full sm:w-auto', getFontClass())}
        >
          {pick('Back to Description', 'వివరణకు వెనుకకు', 'विवरण पर वापस')}
        </Button>

        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={isLoading}
          className={cn(
            'w-full sm:w-auto inline-flex items-center justify-center gap-2 shadow-sm',
            getFontClass()
          )}
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0" aria-hidden="true" />
          <span>
            {pick(
              'Confirm Details & Check Eligibility',
              'వివరాలను నిర్ధారించి అర్హతను పరిశీలించండి',
              'विवरण की पुष्टि करें और पात्रता जांचें'
            )}
          </span>
        </Button>
      </div>
    </form>
  );
};
