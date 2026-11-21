import { CitizenProfile } from '@/types/profile';
import { GovernmentScheme, SchemeRule } from '@/types/scheme';
import {
  EligibilityAssessmentResult,
  SchemeMatchResult,
  RuleEvaluation,
  MatchStatus,
} from '@/types/eligibility';
import { MOCK_GOVERNMENT_SCHEMES } from './mockSchemeData';

export function evaluateDeterministicEligibility(
  profile: CitizenProfile,
  schemes: GovernmentScheme[] = MOCK_GOVERNMENT_SCHEMES
): EligibilityAssessmentResult {
  const likelyEligible: SchemeMatchResult[] = [];
  const needsMoreInfo: SchemeMatchResult[] = [];
  const notLikelyEligible: SchemeMatchResult[] = [];

  for (const scheme of schemes) {
    const evaluatedRules: RuleEvaluation[] = [];
    const missingFields: string[] = [];
    let hasFailedRule = false;
    let hasUnknownRule = false;

    for (const rule of scheme.rules) {
      const evaluation = evaluateSingleRule(rule, profile);
      evaluatedRules.push(evaluation);

      if (evaluation.status === 'not_matched') {
        hasFailedRule = true;
      } else if (evaluation.status === 'unknown') {
        hasUnknownRule = true;
        if (!missingFields.includes(rule.field_name)) {
          missingFields.push(rule.field_name);
        }
      }
    }

    let matchStatus: MatchStatus;
    if (hasFailedRule) {
      matchStatus = 'not_likely_eligible';
    } else if (hasUnknownRule) {
      matchStatus = 'needs_more_info';
    } else {
      matchStatus = 'likely_eligible';
    }

    const schemeResult: SchemeMatchResult = {
      scheme_id: scheme.id,
      scheme_code: scheme.scheme_code,
      name_en: scheme.name_en,
      name_te: scheme.name_te,
      name_hi: scheme.name_hi,
      level: scheme.level,
      category: scheme.category,
      status: scheme.status,
      benefit_summary_en: scheme.benefit_summary_en,
      benefit_summary_te: scheme.benefit_summary_te,
      benefit_summary_hi: scheme.benefit_summary_hi,
      official_source_url: scheme.source.source_url,
      verified_at: scheme.source.verified_at,
      is_verified: !!scheme.source.verified_at,
      match_status: matchStatus,
      matched_rules: evaluatedRules,
      missing_fields: missingFields,
    };

    if (matchStatus === 'likely_eligible') {
      likelyEligible.push(schemeResult);
    } else if (matchStatus === 'needs_more_info') {
      needsMoreInfo.push(schemeResult);
    } else {
      notLikelyEligible.push(schemeResult);
    }
  }

  return {
    assessment_id: `asm-${Date.now()}`,
    evaluated_at: new Date().toISOString().split('T')[0],
    is_sample: profile.is_sample,
    results: {
      likely_eligible: likelyEligible,
      needs_more_info: needsMoreInfo,
      not_likely_eligible: notLikelyEligible,
    },
  };
}

function evaluateSingleRule(rule: SchemeRule, profile: CitizenProfile): RuleEvaluation {
  const { field_name, operator, value, reason_en, reason_te, reason_hi, rule_id } = rule;

  let userValue: any = undefined;
  let userValueEn = 'Not provided';
  let userValueTe = 'తెలియజేయలేదు';
  let userValueHi = 'विवरण नहीं दिया';

  // Extract citizen's value for the rule field
  if (field_name === 'household_has_student') {
    const hasStudentMember =
      profile.occupation_category === 'student' ||
      profile.age_band === 'under_18' ||
      profile.household_members.some(
        (m) =>
          m.education_band === 'class_10' ||
          m.education_band === 'intermediate' ||
          m.education_band === 'primary' ||
          m.age_band === 'under_18'
      );
    userValue = hasStudentMember ? 'true' : 'false';
    userValueEn = hasStudentMember ? 'Student in household' : 'No student identified';
    userValueTe = hasStudentMember ? 'కుటుంబంలో విద్యార్థి ఉన్నారు' : 'విద్యార్థి వివరాలు లేవు';
    userValueHi = hasStudentMember ? 'परिवार में छात्र है' : 'छात्र का विवरण नहीं है';
  } else if (field_name in profile) {
    userValue = (profile as any)[field_name];
    if (userValue && userValue !== 'unknown') {
      userValueEn = String(userValue).replace(/_/g, ' ');
      userValueTe = String(userValue).replace(/_/g, ' ');
      userValueHi = String(userValue).replace(/_/g, ' ');
    } else {
      userValue = undefined;
    }
  }

  // If citizen value is missing or unknown
  if (userValue === undefined || userValue === 'unknown') {
    return {
      rule_id,
      field_name,
      condition_description_en: `Condition: Requires ${field_name.replace(/_/g, ' ')}`,
      condition_description_te: `నిబంధన: ${field_name} వివరాలు అవసరం`,
      condition_description_hi: `शर्त: ${field_name} विवरण की आवश्यकता है`,
      user_value_description_en: 'Information not provided',
      user_value_description_te: 'ఈ వివరాలు అందించలేదు',
      user_value_description_hi: 'यह जानकारी प्रदान नहीं की गई है',
      status: 'unknown',
      reason_en: `We need your ${field_name.replace(/_/g, ' ')} to evaluate this condition.`,
      reason_te: `ఈ నిబంధనను పరిశీలించడానికి మీ ${field_name} వివరాలు అవసరం.`,
      reason_hi: `इस शर्त की जांच के लिए आपके ${field_name} विवरण की आवश्यकता है।`,
    };
  }

  // Operator evaluation
  let isMatched = false;
  if (operator === 'eq') {
    isMatched = String(userValue).toLowerCase() === String(value).toLowerCase();
  } else if (operator === 'in') {
    const allowed = value.split(',').map((v) => v.trim().toLowerCase());
    isMatched = allowed.includes(String(userValue).toLowerCase());
  } else if (operator === 'neq') {
    isMatched = String(userValue).toLowerCase() !== String(value).toLowerCase();
  }

  return {
    rule_id,
    field_name,
    condition_description_en: `Condition: ${rule.rule_type} (${operator} ${value})`,
    condition_description_te: `నిబంధన: ${rule.rule_type} (${value})`,
    condition_description_hi: `शर्त: ${rule.rule_type} (${value})`,
    user_value_description_en: `Your detail: ${userValueEn}`,
    user_value_description_te: `మీ వివరాలు: ${userValueTe}`,
    user_value_description_hi: `आपका विवरण: ${userValueHi}`,
    status: isMatched ? 'matched' : 'not_matched',
    reason_en: isMatched ? reason_en : `Does not meet the requirement of ${value}.`,
    reason_te: isMatched ? reason_te : `${value} నిబంధనకు సరిపోలలేదు.`,
    reason_hi: isMatched ? reason_hi : `${value} की आवश्यकता पूरी नहीं होती है।`,
  };
}
