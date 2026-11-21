import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { SchemeMatchResult } from '@/types/eligibility';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/common/VerificationBadge';
import { RuleReasonCard } from './RuleReasonCard';
import { MissingInfoList } from './MissingInfoList';
import { ROUTES } from '@/config/routes';
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
} from 'lucide-react';

export interface SchemeResultCardProps {
  result: SchemeMatchResult;
  onAddMissingField?: (fieldName: string) => void;
}

export const SchemeResultCard: React.FC<SchemeResultCardProps> = ({
  result,
  onAddMissingField,
}) => {
  const { pick, getFontClass } = useLanguage();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(result.match_status !== 'not_likely_eligible');

  const getStatusBadge = () => {
    switch (result.match_status) {
      case 'likely_eligible':
        return (
          <Badge variant="success" className="inline-flex items-center gap-1.5 py-1 px-3 text-xs md:text-sm font-bold">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
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
          <Badge variant="warning" className="inline-flex items-center gap-1.5 py-1 px-3 text-xs md:text-sm font-bold">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
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
          <Badge variant="secondary" className="inline-flex items-center gap-1.5 py-1 px-3 text-xs md:text-sm font-semibold">
            <XCircle className="h-4 w-4 text-slate-500" aria-hidden="true" />
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
      <Badge variant="outline" className="border-primary/40 text-primary font-semibold">
        {pick('Andhra Pradesh State Scheme', 'ఆంధ్రప్రదేశ్ రాష్ట్ర పథకం', 'आंध्र प्रदेश राज्य योजना')}
      </Badge>
    ) : (
      <Badge variant="outline" className="border-indigo-400 text-indigo-800 font-semibold">
        {pick('Central Government Scheme', 'కేంద్ర ప్రభుత్వ పథకం', 'केंद्र सरकार की योजना')}
      </Badge>
    );
  };

  return (
    <Card className="border border-border shadow-xs hover:shadow-sm transition-shadow my-4 overflow-hidden">
      <CardHeader className="p-5 md:p-6 pb-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge()}
            {getLevelBadge()}
          </div>
          <VerificationBadge isVerified={result.is_verified} verifiedAt={result.verified_at} />
        </div>

        {/* Title */}
        <h3 className={`text-lg md:text-xl font-bold text-body leading-snug ${getFontClass()}`}>
          {pick(result.name_en, result.name_te, result.name_hi)}
        </h3>

        {/* Benefit Summary Callout */}
        <div className="mt-3 flex items-start gap-2 bg-slate-50 border border-slate-200/80 rounded-md p-3 text-xs md:text-sm text-slate-800 font-medium">
          <IndianRupee className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <span className={getFontClass()}>
            {pick(result.benefit_summary_en, result.benefit_summary_te, result.benefit_summary_hi)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-5 md:px-6 py-2">
        {/* Missing Information Prompt */}
        {result.match_status === 'needs_more_info' && onAddMissingField && (
          <MissingInfoList
            missingFields={result.missing_fields}
            onAddDetail={onAddMissingField}
          />
        )}

        {/* Collapsible Rule Reasoning Breakdown */}
        <div className="mt-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs md:text-sm font-semibold text-primary py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
            aria-expanded={isExpanded}
          >
            <span className="flex items-center gap-1.5">
              <span>
                {pick(
                  'Deterministic Eligibility Rule Breakdown',
                  'నిబంధనల వారీగా అర్హత కారణాలు',
                  'नियम-दर-नियम पात्रता विवरण'
                )}
              </span>
              <span className="text-muted font-normal">
                ({result.matched_rules.length} {pick('rules checked', 'నిబంధనలు', 'नियम')})
              </span>
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-primary" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 text-primary" aria-hidden="true" />
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

      <CardFooter className="p-5 md:p-6 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
        <a
          href={result.official_source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-focus rounded p-1"
        >
          <span>{pick('Official Source Portal', 'అధికారిక ప్రభుత్వ పోర్టల్', 'आधिकारिक पोर्टल')}</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.DOCUMENT_CHECKLIST(result.scheme_id))}
            className="text-xs h-9 inline-flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>{pick('Documents Checklist', 'పత్రాల జాబితా', 'दस्तावेज़ सूची')}</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => navigate(ROUTES.APPLICATION_GUIDE(result.scheme_id))}
            className="text-xs h-9 inline-flex items-center gap-1.5"
          >
            <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{pick('How to Apply', 'దరఖాస్తు విధానం', 'आवेदन कैसे करें')}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
