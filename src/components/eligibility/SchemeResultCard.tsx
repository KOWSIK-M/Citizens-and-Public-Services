import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { SchemeMatchResult } from '@/types/eligibility';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { RuleReasonCard } from './RuleReasonCard';
import { MissingInfoList } from './MissingInfoList';
import { ROUTES } from '@/config/routes';
import { getDaysUntilDeadline } from '@/utils/calendarReminder';
import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Navigation,
  ExternalLink,
  IndianRupee,
  Volume2,
  VolumeX,
  BookmarkCheck,
  BookmarkPlus,
  CalendarClock,
  ShieldAlert,
} from 'lucide-react';

export interface SchemeResultCardProps {
  result: SchemeMatchResult;
  onAddMissingField?: (fieldName: string) => void;
}

export const SchemeResultCard: React.FC<SchemeResultCardProps> = ({
  result,
  onAddMissingField,
}) => {
  const { pick, getFontClass, language } = useLanguage();
  const { isSchemeTracked, trackSchemeFromResult } = useTrackerStore();
  const { isSupported: ttsSupported, isSpeaking, toggleSpeak } = useSpeechSynthesis();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(result.match_status !== 'not_likely_eligible');

  const tracked = isSchemeTracked(result.scheme_id);
  const daysLeft = getDaysUntilDeadline(result.application_close_on);
  const speakingThisCard = isSpeaking(result.scheme_id);

  const handleReadAloud = () => {
    const schemeTitle = pick(result.name_en, result.name_te, result.name_hi);
    const benefit = pick(
      result.benefit_summary_en,
      result.benefit_summary_te,
      result.benefit_summary_hi
    );
    const statusPhrase =
      result.match_status === 'likely_eligible'
        ? pick(
            'Status: Likely eligible based on your provided profile.',
            'స్థితి: మీ వివరాల ఆధారంగా అర్హత పొందే అవకాశం ఉంది.',
            'स्थिति: आपके विवरण के आधार पर पात्र होने की संभावना है।'
          )
        : result.pending_verification_hold
        ? pick(
            'Status: Rules match, awaiting official Government Order verification.',
            'స్థితి: నిబంధనలు సరిపోలాయి, అధికారిక ఉత్తర్వుల ధృవీకరణ పెండింగ్‌లో ఉంది.',
            'स्थिति: नियम मेल खाते हैं, आधिकारिक सत्यापन लंबित है।'
          )
        : pick(
            'Status: Additional household details needed to confirm.',
            'స్థితి: నిర్ధారించడానికి మరిన్ని వివరాలు అవసరం.',
            'स्थिति: पुष्टि के लिए अतिरिक्त विवरण आवश्यक है।'
          );
    const reasons = result.matched_rules
      .filter((r) => r.status === 'matched')
      .map((r) => pick(r.reason_en, r.reason_te, r.reason_hi))
      .join(' ');

    toggleSpeak(result.scheme_id, `${schemeTitle}. ${statusPhrase} ${benefit} ${reasons}`, language);
  };

  const handleTrackAndRemind = () => {
    trackSchemeFromResult(result);
    navigate(ROUTES.MY_SCHEMES);
  };

  const getStatusBadge = () => {
    if (result.pending_verification_hold) {
      return (
        <Badge
          variant="warning"
          className={`inline-flex items-center gap-1.5 py-1 px-3 text-sm font-bold ${getFontClass()}`}
        >
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {pick(
              'Rules Match • Source Pending Verification',
              'నిబంధనలు సరిపోలాయి • ధృవీకరణ పెండింగ్',
              'नियम मेल खाते हैं • स्रोत सत्यापन लंबित'
            )}
          </span>
        </Badge>
      );
    }

    switch (result.match_status) {
      case 'likely_eligible':
        return (
          <Badge
            variant="success"
            className={`inline-flex items-center gap-1.5 py-1 px-3 text-sm font-bold ${getFontClass()}`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Likely eligible',
                'అర్హత పొందే అవకాశం ఉంది',
                'पात्र होने की संभावना है'
              )}
            </span>
          </Badge>
        );
      case 'needs_more_info':
        return (
          <Badge
            variant="warning"
            className={`inline-flex items-center gap-1.5 py-1 px-3 text-sm font-bold ${getFontClass()}`}
          >
            <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Need more information',
                'మరిన్ని వివరాలు అవసరం',
                'अधिक जानकारी आवश्यक है'
              )}
            </span>
          </Badge>
        );
      case 'not_likely_eligible':
      default:
        return (
          <Badge
            variant="secondary"
            className={`inline-flex items-center gap-1.5 py-1 px-3 text-sm font-semibold ${getFontClass()}`}
          >
            <XCircle className="h-4 w-4 text-slate-600 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Not likely eligible',
                'అర్హత పొందే అవకాశం తక్కువ',
                'पात्र होने की संभावना कम है'
              )}
            </span>
          </Badge>
        );
    }
  };

  const getLevelBadge = () => {
    return result.level === 'state' ? (
      <Badge variant="outline" className={`border-primary/40 text-primary font-semibold text-sm ${getFontClass()}`}>
        {pick('AP State Scheme', 'ఆంధ్రప్రదేశ్ రాష్ట్ర పథకం', 'आंध्र प्रदेश राज्य योजना')}
      </Badge>
    ) : (
      <Badge variant="outline" className={`border-indigo-400 text-indigo-800 font-semibold text-sm ${getFontClass()}`}>
        {pick('Central Scheme', 'కేంద్ర ప్రభుత్వ పథకం', 'केंद्र सरकार की योजना')}
      </Badge>
    );
  };

  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow my-4 overflow-hidden">
      <CardHeader className="p-5 md:p-6 pb-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge()}
            {getLevelBadge()}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge isVerified={result.is_verified} verifiedAt={result.verified_at} />
            {ttsSupported && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReadAloud}
                className={`min-h-[44px] px-3 text-sm inline-flex items-center gap-1.5 ${
                  speakingThisCard ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/40'
                } ${getFontClass()}`}
                aria-pressed={speakingThisCard}
                aria-label={pick('Read scheme summary aloud', 'పథకం వివరాలను వినండి', 'योजना विवरण सुनें')}
              >
                {speakingThisCard ? (
                  <VolumeX className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span>{speakingThisCard ? pick('Stop', 'ఆపండి', 'रोकें') : pick('Listen', 'వినండి', 'सुनें')}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Clickable Title */}
        <h3 className={`text-lg md:text-xl font-bold text-body leading-snug ${getFontClass()}`}>
          <Link
            to={ROUTES.SCHEME_DETAIL(result.scheme_id)}
            className="hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
          >
            {pick(result.name_en, result.name_te, result.name_hi)}
          </Link>
        </h3>

        {/* Benefit Summary + Deadline Callout */}
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-md p-3 text-sm text-slate-800 font-medium">
            <IndianRupee className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <span className={getFontClass()}>
              {pick(result.benefit_summary_en, result.benefit_summary_te, result.benefit_summary_hi)}
            </span>
          </div>

          {(result.deadline_label_en || result.application_close_on) && (
            <div
              className={`flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 text-sm border ${
                daysLeft !== null && daysLeft >= 0 && daysLeft <= 20
                  ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                  : 'bg-blue-50/60 border-blue-200 text-blue-950'
              } ${getFontClass()}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {pick(
                    result.deadline_label_en || `Deadline: ${result.application_close_on}`,
                    result.deadline_label_te || `గడువు: ${result.application_close_on}`,
                    result.deadline_label_hi || `अंतिम तिथि: ${result.application_close_on}`
                  )}
                </span>
              </span>
              {daysLeft !== null && daysLeft >= 0 && (
                <Badge variant={daysLeft <= 15 ? 'warning' : 'info'} className="text-sm font-bold">
                  {daysLeft === 0
                    ? pick('Closes today!', 'ఈరోజే చివరి తేదీ!', 'आज अंतिम दिन!')
                    : pick(`${daysLeft} days left`, `మరో ${daysLeft} రోజులు`, `${daysLeft} दिन शेष`)}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 md:px-6 py-2">
        {/* FR-09 Unverified Source Hold Explanation */}
        {result.pending_verification_hold && (
          <div
            className={`rounded-lg border border-amber-300 bg-amber-50/80 p-3.5 my-2 text-sm text-amber-950 leading-relaxed ${getFontClass()}`}
          >
            <strong>
              {pick(
                'Transparency Hold (Guardrail):',
                'పారదర్శకత నిబంధన:',
                'पारदर्शिता सुरक्षा नियम:'
              )}
            </strong>{' '}
            {pick(
              'Your profile satisfies the draft criteria, but ClaimSaathi withholds "Likely eligible" status until an administrator records primary G.O. verification.',
              'మీ వివరాలు నిబంధనలకు సరిపోలినప్పటికీ, అధికారిక ప్రభుత్వ ఉత్తర్వుల (G.O.) ధృవీకరణ పూర్తయ్యే వరకు దీనిని పెండింగ్‌లో ఉంచాము.',
              'आपका प्रोफ़ाइल मानदंडों से मेल खाता है, लेकिन प्राथमिक सरकारी आदेश (G.O.) सत्यापित होने तक इसे "संभावित पात्र" में नहीं रखा गया है।'
            )}
          </div>
        )}

        {/* Missing Information Prompt */}
        {result.match_status === 'needs_more_info' &&
          !result.pending_verification_hold &&
          onAddMissingField && (
            <MissingInfoList
              missingFields={result.missing_fields}
              onAddDetail={onAddMissingField}
            />
          )}

        {/* Collapsible Rule Reasoning Breakdown */}
        <div className="mt-2 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full min-h-[44px] flex items-center justify-between text-sm font-semibold text-primary py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded ${getFontClass()}`}
            aria-expanded={isExpanded}
          >
            <span className="flex items-center gap-1.5 text-left">
              <span>
                {pick(
                  'Why this scheme matches or differs from your profile',
                  'ఈ పథకం మీకు ఎందుకు సరిపోతుందో నిబంధనల వారీగా చూడండి',
                  'यह योजना आपके विवरण से क्यों मेल खाती है (नियम-वार कारण)'
                )}
              </span>
              <span className="text-muted font-normal">
                ({result.matched_rules.length} {pick('rules', 'నిబంధనలు', 'नियम')})
              </span>
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-2">
              {result.matched_rules.map((rule) => (
                <RuleReasonCard key={rule.rule_id} evaluation={rule} />
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 md:p-6 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70">
        <a
          href={result.official_source_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`min-h-[44px] inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline transition-colors focus-visible:ring-2 focus-visible:ring-focus rounded px-2 ${getFontClass()}`}
        >
          <span>{pick('Official Source Portal', 'అధికారిక ప్రభుత్వ పోర్టల్', 'आधिकारिक पोर्टल')}</span>
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>

        <div className="flex flex-wrap items-center gap-2">
          {result.match_status !== 'not_likely_eligible' && (
            <Button
              type="button"
              variant={tracked ? 'secondary' : 'outline'}
              size="sm"
              onClick={handleTrackAndRemind}
              className={`min-h-[44px] text-sm px-3.5 inline-flex items-center gap-1.5 ${
                tracked ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold' : 'border-amber-500 text-amber-900 bg-amber-50/60 hover:bg-amber-100 font-semibold'
              } ${getFontClass()}`}
            >
              {tracked ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span>{pick('Tracked • View Reminders', 'ట్రాక్ చేయబడింది', 'ट्रैक किया गया')}</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 text-amber-800 shrink-0" aria-hidden="true" />
                  <span>{pick('Track & Set Reminder', 'ట్రాక్ & రిమైండర్', 'ट्रैक व रिमाइंडर')}</span>
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.DOCUMENT_CHECKLIST(result.scheme_id))}
            className={`min-h-[44px] text-sm px-3.5 inline-flex items-center gap-1.5 bg-white ${getFontClass()}`}
          >
            <FileText className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
            <span>{pick('Documents Checklist', 'పత్రాల జాబితా', 'दस्तावेज़ सूची')}</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => navigate(ROUTES.APPLICATION_GUIDE(result.scheme_id))}
            className={`min-h-[44px] text-sm px-3.5 inline-flex items-center gap-1.5 ${getFontClass()}`}
          >
            <Navigation className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{pick('How to Apply', 'దరఖాస్తు విధానం', 'आवेदन कैसे करें')}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
