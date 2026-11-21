// Vercel Serverless Function: POST /api/explain
// Guardrails:
// 1. Rules decide; AI only explains. Never alters `match_status` and never promises "guaranteed" or "approved".
// 2. Rejects any payload containing Aadhaar/phone/PAN/VoterID/bank/IFSC/email (HTTP 422).
// 3. Uses Claude Haiku (`claude-3-5-haiku-latest`) when `ANTHROPIC_API_KEY` is configured,
//    with post-generation guardrail verification and deterministic trilingual fallback.

import { inspectTextForPii } from '../src/utils/piiValidator.js';
import { formatFieldLabel } from '../src/config/bands.js';
import type { SchemeMatchResult } from '../src/types/eligibility';
import type { SupportedLanguage } from '../src/types/i18n';
import type { ServerlessRequest, ServerlessResponse } from './profile/extract';

const FORBIDDEN_GUARANTEE_REGEX = /\b(guarantee|guaranteed|approved|sanctioned|100%\s*eligible|sure\s+to\s+get)\b/i;

function buildGroundedFallbackExplanation(
  result: SchemeMatchResult,
  lang: SupportedLanguage
): string {
  const schemeName =
    lang === 'te' ? result.name_te : lang === 'hi' ? result.name_hi : result.name_en;
  const benefit =
    lang === 'te'
      ? result.benefit_summary_te
      : lang === 'hi'
      ? result.benefit_summary_hi
      : result.benefit_summary_en;

  if (result.match_status === 'likely_eligible') {
    const matchedReasons = result.matched_rules
      .filter((r) => r.status === 'matched')
      .slice(0, 2)
      .map((r) => (lang === 'te' ? r.reason_te : lang === 'hi' ? r.reason_hi : r.reason_en))
      .join(' ');

    if (lang === 'te') {
      return `మీరు అందించిన వివరాల ఆధారంగా "${schemeName}" పథకానికి అర్హత పొందే అవకాశం ఉంది (${benefit}). ${matchedReasons}`;
    }
    if (lang === 'hi') {
      return `आपके द्वारा दिए गए विवरण के आधार पर आप "${schemeName}" के लिए पात्र होने की संभावना रखते हैं (${benefit})। ${matchedReasons}`;
    }
    return `Based on your confirmed details, you appear likely eligible for ${schemeName} (${benefit}). ${matchedReasons}`;
  }

  if (result.match_status === 'needs_more_info') {
    if (result.pending_verification_hold) {
      if (lang === 'te') {
        return `"${schemeName}" నిబంధనలు మీ వివరాలకు సరిపోయినప్పటికీ, అధికారిక ప్రభుత్వ ఉత్తర్వుల తుది ధృవీకరణ పెండింగ్‌లో ఉన్నందున ఇది తాత్కాలికంగా నిలిపివేయబడింది. దయచేసి గ్రామ/వార్డు సచివాలయంలో తాజా సమాచారాన్ని నిర్ధారించుకోండి.`;
      }
      if (lang === 'hi') {
        return `"${schemeName}" की शर्तें आपके विवरण से मेल खाती हैं, किंतु आधिकारिक सरकारी आदेश का अंतिम सत्यापन लंबित होने के कारण इसे अस्थायी रूप से रोका गया है। कृपया ग्राम/वार्ड सचिवालय में पुष्टि करें।`;
      }
      return `Your profile matches the listed criteria for ${schemeName}, but this scheme is held under "Need more information" pending primary Government Order verification. Please confirm current intake status at your Grama/Ward Sachivalayam.`;
    }

    const missingLabels = result.missing_fields
      .map((f) => formatFieldLabel(f, lang))
      .join(', ');

    if (lang === 'te') {
      return `"${schemeName}" అర్హతను పూర్తిగా నిర్ధారించడానికి మరిన్ని వివరాలు అవసరం (${missingLabels}). ఈ వివరాలను జోడించి మళ్ళీ పరిశీలించండి.`;
    }
    if (lang === 'hi') {
      return `"${schemeName}" की संभावित पात्रता जांचने के लिए अतिरिक्त जानकारी आवश्यक है (${missingLabels})। कृपया ये विवरण जोड़कर पुनः जांचें।`;
    }
    return `We need ${missingLabels || 'additional profile details'} to complete the eligibility check for ${schemeName}. Add the missing detail to see if you are likely eligible.`;
  }

  // not_likely_eligible
  const failedRule = result.matched_rules.find((r) => r.status === 'not_matched');
  const failedReason = failedRule
    ? lang === 'te'
      ? failedRule.reason_te
      : lang === 'hi'
      ? failedRule.reason_hi
      : failedRule.reason_en
    : '';

  if (lang === 'te') {
    return `ప్రస్తుత వివరాల ప్రకారం "${schemeName}" పథకానికి అర్హత పొందే అవకాశం తక్కువగా ఉంది. ${failedReason}`;
  }
  if (lang === 'hi') {
    return `वर्तमान विवरण के आधार पर "${schemeName}" के लिए पात्र होने की संभावना कम है। ${failedReason}`;
  }
  return `Based on your current profile, you are not likely eligible for ${schemeName}. ${failedReason}`;
}

function getDisclaimer(lang: SupportedLanguage): string {
  if (lang === 'te') {
    return 'ఇది ప్రాథమిక మార్గదర్శనం మాత్రమే, అధికారిక ప్రభుత్వ మంజూరు కాదు. గ్రామ/వార్డు సచివాలయంలో ఉచితంగా నిర్ధారించుకోండి.';
  }
  if (lang === 'hi') {
    return 'यह केवल प्रारंभिक मार्गदर्शन है, आधिकारिक सरकारी स्वीकृति नहीं। ग्राम/वार्ड सचिवालय में निःशुल्क पुष्टि करें।';
  }
  return 'Preliminary guidance only—not an official sanction. Confirm free of charge at your Grama/Ward Sachivalayam.';
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'method_not_allowed', message: 'Use POST /api/explain' });
    return;
  }

  let body: Record<string, unknown> = {};
  try {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body) as Record<string, unknown>;
    } else if (req.body && typeof req.body === 'object') {
      body = req.body as Record<string, unknown>;
    }
  } catch {
    res.status(400).json({ error: 'invalid_json', message: 'Request body must be valid JSON.' });
    return;
  }

  // Inspect serialized body for accidental PII injection
  const serialized = JSON.stringify(body);
  const piiCheck = inspectTextForPii(serialized);
  if (piiCheck.hasPii) {
    res.status(422).json({
      error: 'pii_detected',
      detected_types: piiCheck.detectedTypes,
      message_en: piiCheck.warningMessageEn,
    });
    return;
  }

  const rawLang = body.language;
  const language: SupportedLanguage =
    rawLang === 'te' || rawLang === 'hi' || rawLang === 'en' ? rawLang : 'en';

  const schemeResult = body.scheme_result as SchemeMatchResult | undefined;
  if (
    !schemeResult ||
    typeof schemeResult.scheme_id !== 'string' ||
    typeof schemeResult.name_en !== 'string' ||
    !Array.isArray(schemeResult.matched_rules)
  ) {
    res.status(400).json({
      error: 'invalid_scheme_result',
      message: 'Valid evaluated `scheme_result` object is required.',
    });
    return;
  }

  const fallbackExplanation = buildGroundedFallbackExplanation(schemeResult, language);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim()) {
    try {
      const langName = language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English';
      const systemPrompt = `You are ClaimSaathi's plain-language welfare explainer.
Rewrite the deterministic rule evaluation below into exactly 2 short, warm, plain-language sentences in ${langName}.
STRICT RULES:
1. Never alter the deterministic match_status (${schemeResult.match_status}).
2. Always say "likely eligible" (never "guaranteed", "approved", or "sanctioned").
3. Cite only the provided rule facts and benefit summary—do not invent amounts or rules.`;

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
          max_tokens: 240,
          temperature: 0,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: JSON.stringify({
                scheme: schemeResult.name_en,
                benefit: schemeResult.benefit_summary_en,
                match_status: schemeResult.match_status,
                pending_verification_hold: schemeResult.pending_verification_hold,
                rules: schemeResult.matched_rules.map((r) => ({
                  rule_id: r.rule_id,
                  status: r.status,
                  reason: r.reason_en,
                })),
                missing_fields: schemeResult.missing_fields,
              }),
            },
          ],
        }),
      });

      if (resp.ok) {
        const data = (await resp.json()) as {
          content?: Array<{ type?: string; text?: string }>;
        };
        const aiText = data.content?.find((c) => c.type === 'text')?.text?.trim() || '';
        if (aiText && !FORBIDDEN_GUARANTEE_REGEX.test(aiText)) {
          res.status(200).json({
            scheme_id: schemeResult.scheme_id,
            match_status: schemeResult.match_status,
            language,
            explanation: aiText,
            source: 'claude_haiku',
            disclaimer: getDisclaimer(language),
          });
          return;
        }
      }
    } catch {
      // Fall back cleanly to grounded deterministic summary
    }
  }

  res.status(200).json({
    scheme_id: schemeResult.scheme_id,
    match_status: schemeResult.match_status,
    language,
    explanation: fallbackExplanation,
    source: 'deterministic_grounded',
    disclaimer: getDisclaimer(language),
  });
}
