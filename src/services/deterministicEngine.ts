import { CitizenProfile } from '@/types/profile';
import { GovernmentScheme, SchemeDocument, SchemeRule } from '@/types/scheme';
import {
  EligibilityAssessmentResult,
  SchemeMatchResult,
  RuleEvaluation,
  MatchStatus,
} from '@/types/eligibility';
import {
  ORDINAL_RANK_MAPS,
  formatFieldLabel,
  formatProfileValue,
  formatRuleCondition,
} from '@/config/bands';
import { APP_CONSTANTS } from '@/config/constants';

export interface PersonalisedDocumentItem extends SchemeDocument {
  effective_requirement: 'mandatory' | 'optional';
  personalisation_badge_en?: string;
  personalisation_badge_te?: string;
  personalisation_badge_hi?: string;
}

export interface MasterDocumentPackItem {
  key: string;
  document_name_en: string;
  document_name_te: string;
  document_name_hi: string;
  requirement: 'mandatory' | 'optional';
  used_by_schemes: Array<{ id: string; name_en: string; name_te: string; name_hi: string }>;
}

function isSourceStale(verifiedAt: string | null): boolean {
  if (!verifiedAt) return false;
  const parsed = new Date(`${verifiedAt}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const diffDays = (Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > APP_CONSTANTS.STALE_VERIFICATION_DAYS;
}

/**
 * Resolves a citizen's effective attribute value for any rule field,
 * supporting household member inference, White Ration Card income proxy,
 * and strict tri-state ('unknown') preservation per FR-08.
 */
export function resolveProfileFieldValue(
  fieldName: string,
  profile: CitizenProfile
): string | undefined {
  // 1. School-going child (Class 1–12) in household
  if (fieldName === 'household_has_student' || fieldName === 'has_school_student') {
    if (profile.occupation_category === 'student' && profile.age_band === 'under_18') {
      return 'true';
    }
    const memberHasSchool = profile.household_members.some(
      (m) =>
        m.age_band === 'under_18' ||
        m.education_band === 'primary' ||
        m.education_band === 'class_10' ||
        m.education_band === 'intermediate'
    );
    if (memberHasSchool || profile.has_school_student === 'yes') {
      return 'true';
    }
    if (profile.has_school_student === 'no') {
      return 'false';
    }
    return undefined; // Unknown -> triggers needs_more_info, NEVER false rejection!
  }

  // 2. Post-Matric / Class 10+ / College student in household
  if (fieldName === 'household_has_post_matric_student' || fieldName === 'has_college_student') {
    if (
      profile.occupation_category === 'student' &&
      (profile.age_band === 'under_18' || profile.age_band === '18_25')
    ) {
      return 'true';
    }
    const memberHasPostMatric = profile.household_members.some(
      (m) =>
        m.education_band === 'class_10' ||
        m.education_band === 'intermediate' ||
        m.education_band === 'graduate' ||
        m.education_band === 'post_graduate' ||
        (m.relation === 'child' && m.age_band === '18_25')
    );
    if (memberHasPostMatric || profile.has_college_student === 'yes') {
      return 'true';
    }
    if (profile.has_college_student === 'no') {
      return 'false';
    }
    if (profile.has_school_student === 'no' && profile.occupation_category !== 'student') {
      return 'false';
    }
    return undefined;
  }

  // 3. Income band with White Ration Card proxy
  if (fieldName === 'income_band') {
    if (profile.income_band && profile.income_band !== 'unknown') {
      return profile.income_band;
    }
    if (profile.has_white_ration_card === 'yes') {
      return 'below_1_2L';
    }
    return undefined;
  }

  // 4. Explicit typed lookup on CitizenProfile (zero `any` casts)
  const record: Record<string, unknown> = {
    age_band: profile.age_band,
    state_code: profile.state_code,
    district_code: profile.district_code,
    occupation_category: profile.occupation_category,
    social_category: profile.social_category,
    land_holding_band: profile.land_holding_band,
    is_widow_or_single_woman: profile.is_widow_or_single_woman,
    has_disability: profile.has_disability,
    is_tenant_farmer_ccrc: profile.is_tenant_farmer_ccrc,
    has_white_ration_card: profile.has_white_ration_card,
  };

  const raw = record[fieldName];
  if (typeof raw === 'string' && raw !== '' && raw !== 'unknown') {
    return raw;
  }
  return undefined;
}

function evaluateOperator(
  fieldName: string,
  operator: SchemeRule['operator'],
  userValue: string,
  targetValue: string
): boolean | 'unknown_operator' {
  const normalizedUser = userValue.trim().toLowerCase();
  const normalizedTarget = targetValue.trim().toLowerCase();

  if (operator === 'eq') {
    // Treat boolean/tri-state synonyms ('yes'/'true', 'no'/'false') equivalently
    if ((normalizedTarget === 'true' || normalizedTarget === 'yes') && (normalizedUser === 'true' || normalizedUser === 'yes')) {
      return true;
    }
    if ((normalizedTarget === 'false' || normalizedTarget === 'no') && (normalizedUser === 'false' || normalizedUser === 'no')) {
      return true;
    }
    return normalizedUser === normalizedTarget;
  }

  if (operator === 'neq') {
    return normalizedUser !== normalizedTarget;
  }

  if (operator === 'in') {
    const allowed = targetValue.split(',').map((v) => v.trim().toLowerCase());
    return allowed.includes(normalizedUser);
  }

  // Ordinal / Numeric operators: lte, gte, between
  const rankMap = ORDINAL_RANK_MAPS[fieldName];
  if (rankMap) {
    const userRank = rankMap[userValue];
    if (userRank === undefined) return false;

    if (operator === 'lte') {
      const targetRank = rankMap[targetValue.trim()];
      return targetRank !== undefined ? userRank <= targetRank : false;
    }
    if (operator === 'gte') {
      const targetRank = rankMap[targetValue.trim()];
      return targetRank !== undefined ? userRank >= targetRank : false;
    }
    if (operator === 'between') {
      const [minKey, maxKey] = targetValue.split(',').map((s) => s.trim());
      const minRank = rankMap[minKey];
      const maxRank = rankMap[maxKey];
      if (minRank === undefined || maxRank === undefined) return false;
      return userRank >= Math.min(minRank, maxRank) && userRank <= Math.max(minRank, maxRank);
    }
  }

  // Numeric fallback if rules ever store literal numbers
  const numUser = Number(userValue);
  if (!Number.isNaN(numUser)) {
    if (operator === 'lte') {
      const numTarget = Number(targetValue);
      return !Number.isNaN(numTarget) && numUser <= numTarget;
    }
    if (operator === 'gte') {
      const numTarget = Number(targetValue);
      return !Number.isNaN(numTarget) && numUser >= numTarget;
    }
    if (operator === 'between') {
      const [lo, hi] = targetValue.split(',').map((s) => Number(s.trim()));
      return !Number.isNaN(lo) && !Number.isNaN(hi) && numUser >= lo && numUser <= hi;
    }
  }

  return 'unknown_operator';
}

export function evaluateDeterministicEligibility(
  profile: CitizenProfile,
  schemes: GovernmentScheme[] = []
): EligibilityAssessmentResult {
  const likelyEligible: SchemeMatchResult[] = [];
  const needsMoreInfo: SchemeMatchResult[] = [];
  const notLikelyEligible: SchemeMatchResult[] = [];

  // Only evaluate published schemes
  const publishedSchemes = schemes.filter((s) => s.is_published);

  for (const scheme of publishedSchemes) {
    const rawEvaluations = scheme.rules.map((rule) => evaluateSingleRule(rule, profile));
    const missingFields: string[] = [];

    // Separate standalone AND rules from OR-grouped rules (`condition_group`)
    const standaloneEvals = rawEvaluations.filter((ev) => !ev.condition_group);
    const groupedMap = new Map<string, RuleEvaluation[]>();
    for (const ev of rawEvaluations) {
      if (ev.condition_group) {
        const list = groupedMap.get(ev.condition_group) || [];
        list.push(ev);
        groupedMap.set(ev.condition_group, list);
      }
    }

    let hasFailedRequirement = false;
    let hasUnknownRequirement = false;

    for (const ev of standaloneEvals) {
      if (ev.status === 'not_matched') {
        hasFailedRequirement = true;
      } else if (ev.status === 'unknown') {
        hasUnknownRequirement = true;
        if (!missingFields.includes(ev.field_name)) {
          missingFields.push(ev.field_name);
        }
      }
    }

    // Evaluate each OR-group:
    // - If >= 1 branch is 'matched' -> group is SATISFIED!
    // - Else if >= 1 branch is 'unknown' -> group is UNKNOWN (collect missing fields)
    // - Else (all branches 'not_matched') -> group FAILED
    for (const [, groupEvals] of groupedMap.entries()) {
      const anyMatched = groupEvals.some((g) => g.status === 'matched');
      const anyUnknown = groupEvals.some((g) => g.status === 'unknown');

      for (const g of groupEvals) {
        g.is_group_satisfied = anyMatched;
      }

      if (anyMatched) {
        // Satisfied via at least one alternative branch
      } else if (anyUnknown) {
        hasUnknownRequirement = true;
        for (const g of groupEvals) {
          if (g.status === 'unknown' && !missingFields.includes(g.field_name)) {
            missingFields.push(g.field_name);
          }
        }
      } else {
        hasFailedRequirement = true;
      }
    }

    // FR-09 Guardrail: Schemes with 0 rules, unverified source (`verified_at === null`),
    // or closed/unopened windows must NEVER be marked `likely_eligible`.
    const isVerified = Boolean(scheme.source.verified_at);
    const hasRules = scheme.rules.length > 0;
    const isOpen = scheme.status === 'open';
    let pendingVerificationHold = false;

    let matchStatus: MatchStatus;
    if (hasFailedRequirement) {
      matchStatus = 'not_likely_eligible';
    } else if (hasUnknownRequirement) {
      matchStatus = 'needs_more_info';
    } else if (!isVerified || !hasRules || !isOpen) {
      matchStatus = 'needs_more_info';
      pendingVerificationHold = true;
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
      estimated_annual_benefit_inr: scheme.estimated_annual_benefit_inr,
      health_cover_lakhs: scheme.health_cover_lakhs,
      application_close_on: scheme.application_close_on,
      deadline_label_en: scheme.deadline_label_en,
      deadline_label_te: scheme.deadline_label_te,
      deadline_label_hi: scheme.deadline_label_hi,
      official_source_url: scheme.source.source_url,
      verified_at: scheme.source.verified_at,
      is_verified: isVerified,
      is_stale_source: isSourceStale(scheme.source.verified_at),
      pending_verification_hold: pendingVerificationHold,
      match_status: matchStatus,
      matched_rules: rawEvaluations,
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

  const totalAnnualDbtInr = likelyEligible.reduce(
    (sum, s) => sum + (s.estimated_annual_benefit_inr || 0),
    0
  );
  const maxHealthCoverLakhs = likelyEligible.reduce(
    (max, s) => Math.max(max, s.health_cover_lakhs || 0),
    0
  );

  return {
    assessment_id: `asm-${Date.now()}`,
    evaluated_at: new Date().toISOString().split('T')[0],
    is_sample: profile.is_sample,
    summary_metrics: {
      total_annual_dbt_inr: totalAnnualDbtInr,
      max_health_cover_lakhs: maxHealthCoverLakhs,
      matched_count: likelyEligible.length,
    },
    results: {
      likely_eligible: likelyEligible,
      needs_more_info: needsMoreInfo,
      not_likely_eligible: notLikelyEligible,
    },
  };
}

function evaluateSingleRule(rule: SchemeRule, profile: CitizenProfile): RuleEvaluation {
  const {
    field_name,
    operator,
    value,
    condition_group,
    reason_en,
    reason_te,
    reason_hi,
    rule_id,
  } = rule;

  const conditionEn = formatRuleCondition(field_name, operator, value, 'en');
  const conditionTe = formatRuleCondition(field_name, operator, value, 'te');
  const conditionHi = formatRuleCondition(field_name, operator, value, 'hi');

  const fieldLabelEn = formatFieldLabel(field_name, 'en');
  const fieldLabelTe = formatFieldLabel(field_name, 'te');
  const fieldLabelHi = formatFieldLabel(field_name, 'hi');

  const userValue = resolveProfileFieldValue(field_name, profile);

  if (userValue === undefined || userValue === 'unknown') {
    return {
      rule_id,
      field_name,
      condition_group,
      condition_description_en: conditionEn,
      condition_description_te: conditionTe,
      condition_description_hi: conditionHi,
      user_value_description_en: 'Your detail: Not yet confirmed',
      user_value_description_te: 'మీ వివరాలు: ఇంకా నిర్ధారించలేదు',
      user_value_description_hi: 'आपका विवरण: अभी पुष्टि नहीं हुई',
      status: 'unknown',
      reason_en: `Confirm "${fieldLabelEn}" to verify this requirement.`,
      reason_te: `ఈ నిబంధనను సరిచూడటానికి "${fieldLabelTe}" వివరాలను ఎంచుకోండి.`,
      reason_hi: `इस शर्त की जांच के लिए "${fieldLabelHi}" का चयन करें।`,
    };
  }

  const evalResult = evaluateOperator(field_name, operator, userValue, value);
  if (evalResult === 'unknown_operator') {
    return {
      rule_id,
      field_name,
      condition_group,
      condition_description_en: conditionEn,
      condition_description_te: conditionTe,
      condition_description_hi: conditionHi,
      user_value_description_en: `Your detail: ${formatProfileValue(field_name, userValue, 'en')}`,
      user_value_description_te: `మీ వివరాలు: ${formatProfileValue(field_name, userValue, 'te')}`,
      user_value_description_hi: `आपका विवरण: ${formatProfileValue(field_name, userValue, 'hi')}`,
      status: 'unknown',
      reason_en: 'Rule operator requires manual review at Grama Sachivalayam.',
      reason_te: 'సచివాలయంలో నేరుగా పరిశీలించవలసిన నిబంధన.',
      reason_hi: 'सचिवालय में प्रत्यक्ष सत्यापन आवश्यक है।',
    };
  }

  const userLabelEn = formatProfileValue(field_name, userValue, 'en');
  const userLabelTe = formatProfileValue(field_name, userValue, 'te');
  const userLabelHi = formatProfileValue(field_name, userValue, 'hi');

  const expectedEn = value
    .split(',')
    .map((v) => formatProfileValue(field_name, v.trim(), 'en'))
    .join(' or ');
  const expectedTe = value
    .split(',')
    .map((v) => formatProfileValue(field_name, v.trim(), 'te'))
    .join(' లేదా ');
  const expectedHi = value
    .split(',')
    .map((v) => formatProfileValue(field_name, v.trim(), 'hi'))
    .join(' या ');

  return {
    rule_id,
    field_name,
    condition_group,
    condition_description_en: conditionEn,
    condition_description_te: conditionTe,
    condition_description_hi: conditionHi,
    user_value_description_en: `Your detail: ${userLabelEn}`,
    user_value_description_te: `మీ వివరాలు: ${userLabelTe}`,
    user_value_description_hi: `आपका विवरण: ${userLabelHi}`,
    status: evalResult ? 'matched' : 'not_matched',
    reason_en: evalResult
      ? reason_en
      : `Your profile shows "${userLabelEn}", whereas this rule requires "${expectedEn}".`,
    reason_te: evalResult
      ? reason_te
      : `మీ వివరాలు "${userLabelTe}" గా ఉన్నాయి, కానీ ఈ నిబంధనకు "${expectedTe}" అవసరం.`,
    reason_hi: evalResult
      ? reason_hi
      : `आपका विवरण "${userLabelHi}" है, जबकि इस नियम के लिए "${expectedHi}" आवश्यक है।`,
  };
}

/**
 * Adapts a scheme's document checklist to the citizen's confirmed profile
 * (e.g., promoting Widow Death Certificate or CCRC Tenant Card to Mandatory).
 */
export function personaliseSchemeDocuments(
  documents: SchemeDocument[],
  profile: CitizenProfile | null
): PersonalisedDocumentItem[] {
  if (!profile) {
    return documents.map((d) => ({ ...d, effective_requirement: d.requirement }));
  }

  const out: PersonalisedDocumentItem[] = [];
  for (const doc of documents) {
    if (!doc.applies_when) {
      out.push({ ...doc, effective_requirement: doc.requirement });
      continue;
    }

    const userVal = resolveProfileFieldValue(doc.applies_when.field, profile) || 'unknown';
    const matchesCondition = doc.applies_when.values.some(
      (v) => v.toLowerCase() === userVal.toLowerCase()
    );

    if (doc.applies_when.mode === 'hide_if_unmatched' && !matchesCondition && userVal !== 'unknown') {
      continue;
    }

    if (matchesCondition && doc.applies_when.mode === 'promote_mandatory') {
      out.push({
        ...doc,
        effective_requirement: 'mandatory',
        personalisation_badge_en: doc.applies_when.badge_en,
        personalisation_badge_te: doc.applies_when.badge_te,
        personalisation_badge_hi: doc.applies_when.badge_hi,
      });
    } else if (matchesCondition && doc.applies_when.mode === 'highlight_relevant') {
      out.push({
        ...doc,
        effective_requirement: doc.requirement,
        personalisation_badge_en: doc.applies_when.badge_en,
        personalisation_badge_te: doc.applies_when.badge_te,
        personalisation_badge_hi: doc.applies_when.badge_hi,
      });
    } else {
      out.push({ ...doc, effective_requirement: doc.requirement });
    }
  }

  return out;
}

/**
 * Builds a deduplicated "Single Sachivalayam Visit Master Document Pack"
 * across all Likely Eligible schemes so families know exact shared proofs to carry.
 */
export function buildMasterDocumentPack(
  likelyResults: SchemeMatchResult[],
  allSchemes: GovernmentScheme[],
  profile: CitizenProfile | null
): MasterDocumentPackItem[] {
  const map = new Map<string, MasterDocumentPackItem>();

  for (const res of likelyResults) {
    const scheme = allSchemes.find((s) => s.id === res.scheme_id);
    if (!scheme) continue;

    const personalisedDocs = personaliseSchemeDocuments(scheme.documents, profile);
    for (const doc of personalisedDocs) {
      // Only include mandatory docs in the consolidated Master Visit Pack
      if (doc.effective_requirement !== 'mandatory') continue;

      const key = doc.canonical_key || doc.id;
      const existing = map.get(key);
      if (existing) {
        if (!existing.used_by_schemes.some((s) => s.id === scheme.id)) {
          existing.used_by_schemes.push({
            id: scheme.id,
            name_en: scheme.name_en,
            name_te: scheme.name_te,
            name_hi: scheme.name_hi,
          });
        }
      } else {
        map.set(key, {
          key,
          document_name_en: doc.document_name_en,
          document_name_te: doc.document_name_te,
          document_name_hi: doc.document_name_hi,
          requirement: 'mandatory',
          used_by_schemes: [
            {
              id: scheme.id,
              name_en: scheme.name_en,
              name_te: scheme.name_te,
              name_hi: scheme.name_hi,
            },
          ],
        });
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.used_by_schemes.length - a.used_by_schemes.length
  );
}
