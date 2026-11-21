import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface VerificationBadgeProps {
  isVerified: boolean;
  verifiedAt: string | null;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  verifiedAt,
  className,
}) => {
  const { pick } = useLanguage();

  if (isVerified && verifiedAt) {
    return (
      <Badge
        variant="info"
        className={`inline-flex items-center gap-1 font-medium ${className}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
        <span>
          {pick(
            `Verified: ${verifiedAt}`,
            `${verifiedAt} న ధృవీకరించబడింది`,
            `सत्यापित: ${verifiedAt}`
          )}
        </span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="warning"
      className={`inline-flex items-center gap-1 font-semibold ${className}`}
    >
      <AlertCircle className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
      <span>
        {pick(
          'PENDING VERIFICATION',
          'ధృవీకరణ పెండింగ్‌లో ఉంది',
          'सत्यापन लंबित'
        )}
      </span>
    </Badge>
  );
};
