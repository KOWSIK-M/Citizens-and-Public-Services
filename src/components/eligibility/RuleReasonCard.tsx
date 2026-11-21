import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { RuleEvaluation } from '@/types/eligibility';
import { CheckCircle2, XCircle, HelpCircle, GitBranch } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface RuleReasonCardProps {
  evaluation: RuleEvaluation;
}

export const RuleReasonCard: React.FC<RuleReasonCardProps> = ({ evaluation }) => {
  const { pick, getFontClass } = useLanguage();

  const isAlternativeBypassed =
    evaluation.status !== 'matched' &&
    Boolean(evaluation.condition_group) &&
    Boolean(evaluation.is_group_satisfied);

  const getStatusIcon = () => {
    if (evaluation.status === 'matched') {
      return (
        <CheckCircle2
          className="h-5 w-5 text-success shrink-0 mt-0.5"
          aria-label={pick('Rule satisfied', 'నిబంధన నెరవేరింది', 'नियम पूरा हुआ')}
        />
      );
    }
    if (isAlternativeBypassed) {
      return (
        <GitBranch
          className="h-5 w-5 text-blue-700 shrink-0 mt-0.5"
          aria-label={pick(
            'Alternative category already matched',
            'ప్రత్యామ్నాయ నిబంధన ద్వారా అర్హత',
            'वैकल्पिक श्रेणी से पात्र'
          )}
        />
      );
    }
    if (evaluation.status === 'not_matched') {
      return (
        <XCircle
          className="h-5 w-5 text-danger shrink-0 mt-0.5"
          aria-label={pick('Rule not satisfied', 'నిబంధన సరిపోలలేదు', 'नियम पूरा नहीं हुआ')}
        />
      );
    }
    return (
      <HelpCircle
        className="h-5 w-5 text-warning shrink-0 mt-0.5"
        aria-label={pick('Rule information needed', 'వివరాలు అవసరం', 'जानकारी आवश्यक')}
      />
    );
  };

  const getStatusBorder = () => {
    if (evaluation.status === 'matched') {
      return 'border-l-4 border-l-success bg-emerald-50/40';
    }
    if (isAlternativeBypassed) {
      return 'border-l-4 border-l-blue-500 bg-blue-50/30';
    }
    if (evaluation.status === 'not_matched') {
      return 'border-l-4 border-l-danger bg-red-50/40';
    }
    return 'border-l-4 border-l-warning bg-amber-50/40';
  };

  return (
    <div
      className={cn(
        'rounded-md border border-slate-200 p-3.5 my-2 transition-all',
        getStatusBorder()
      )}
    >
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className={`font-semibold text-body text-sm ${getFontClass()}`}>
              {pick(
                evaluation.condition_description_en,
                evaluation.condition_description_te,
                evaluation.condition_description_hi
              )}
            </span>
            <span
              className={`text-sm text-slate-700 font-medium bg-white px-2.5 py-0.5 rounded border border-slate-300 w-fit ${getFontClass()}`}
            >
              {pick(
                evaluation.user_value_description_en,
                evaluation.user_value_description_te,
                evaluation.user_value_description_hi
              )}
            </span>
          </div>

          {isAlternativeBypassed ? (
            <p className={`mt-1.5 text-sm text-blue-900 leading-relaxed ${getFontClass()}`}>
              <strong>{pick('Alternative Rule:', 'ప్రత్యామ్నాయ అర్హత:', 'वैकल्पिक नियम:')}</strong>{' '}
              {pick(
                'Not required because you already qualify through another category in this scheme.',
                'ఈ పథకంలోని మరొక విభాగం ద్వారా మీకు ఇప్పటికే అర్హత లభించింది కాబట్టి ఇది అవసరం లేదు.',
                'आवश्यक नहीं है क्योंकि आप इस योजना की दूसरी पात्र श्रेणी को पहले ही पूरा करते हैं।'
              )}
            </p>
          ) : (
            <p className={`mt-1.5 text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
              <strong>{pick('Reason:', 'కారణం:', 'कारण:')}</strong>{' '}
              {pick(evaluation.reason_en, evaluation.reason_te, evaluation.reason_hi)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
