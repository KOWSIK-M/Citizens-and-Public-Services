import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { RuleEvaluation } from '@/types/eligibility';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface RuleReasonCardProps {
  evaluation: RuleEvaluation;
}

export const RuleReasonCard: React.FC<RuleReasonCardProps> = ({ evaluation }) => {
  const { pick, getFontClass } = useLanguage();

  const getStatusIcon = () => {
    switch (evaluation.status) {
      case 'matched':
        return <CheckCircle2 className="h-5 w-5 text-success shrink-0" aria-label="Rule satisfied" />;
      case 'not_matched':
        return <XCircle className="h-5 w-5 text-danger shrink-0" aria-label="Rule not satisfied" />;
      case 'unknown':
      default:
        return <HelpCircle className="h-5 w-5 text-warning shrink-0" aria-label="Rule information missing" />;
    }
  };

  const getStatusBorder = () => {
    switch (evaluation.status) {
      case 'matched':
        return 'border-l-4 border-l-success bg-emerald-50/30';
      case 'not_matched':
        return 'border-l-4 border-l-danger bg-red-50/30';
      case 'unknown':
      default:
        return 'border-l-4 border-l-warning bg-amber-50/30';
    }
  };

  return (
    <div
      className={cn(
        'rounded-md border border-border p-3.5 my-2 transition-all',
        getStatusBorder()
      )}
    >
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-semibold text-body text-xs md:text-sm">
              {pick(
                evaluation.condition_description_en,
                evaluation.condition_description_te,
                evaluation.condition_description_hi
              )}
            </span>
            <span className="text-xs text-muted font-medium bg-white px-2 py-0.5 rounded border border-slate-200 w-fit">
              {pick(
                evaluation.user_value_description_en,
                evaluation.user_value_description_te,
                evaluation.user_value_description_hi
              )}
            </span>
          </div>

          <p className={`mt-1.5 text-xs md:text-sm text-slate-700 leading-relaxed ${getFontClass()}`}>
            <strong>{pick('Reason:', 'కారణం:', 'कारण:')}</strong>{' '}
            {pick(evaluation.reason_en, evaluation.reason_te, evaluation.reason_hi)}
          </p>
        </div>
      </div>
    </div>
  );
};
