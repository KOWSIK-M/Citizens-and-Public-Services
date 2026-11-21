import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { APP_CONSTANTS } from '@/config/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export interface VerificationBadgeProps {
  isVerified: boolean;
  verifiedAt: string | null;
  className?: string;
}

const LOCALE_MAP = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
} as const;

function parseVerificationDate(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const isoCandidate = trimmed.includes('T') ? trimmed : `${trimmed}T00:00:00`;
  const parsed = new Date(isoCandidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  isVerified,
  verifiedAt,
  className,
}) => {
  const { language, pick, getFontClass } = useLanguage();

  if (isVerified && verifiedAt) {
    const parsedDate = parseVerificationDate(verifiedAt);

    let formattedDate = verifiedAt;
    let isStale = false;

    if (parsedDate) {
      try {
        formattedDate = new Intl.DateTimeFormat(LOCALE_MAP[language], {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(parsedDate);
      } catch {
        formattedDate = verifiedAt;
      }

      const ageDays = (Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
      isStale = ageDays > APP_CONSTANTS.STALE_VERIFICATION_DAYS;
    }

    if (isStale) {
      return (
        <Badge
          variant="warning"
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold',
            getFontClass(),
            className
          )}
        >
          <Clock className="h-3.5 w-3.5 text-warning shrink-0" aria-hidden="true" />
          <span>
            {pick(
              `Demo date ${formattedDate} · Check the official portal`,
              `${formattedDate} • పాత డేటా — పోర్టల్‌లో సరిచూసుకోండి`,
              `${formattedDate} • पुराना डेटा — पोर्टल पर पुनः जांचें`
            )}
          </span>
        </Badge>
      );
    }

    return (
      <Badge
        variant="info"
        className={cn(
          'inline-flex items-center gap-1.5 font-medium',
          getFontClass(),
          className
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-info shrink-0" aria-hidden="true" />
        <span>
          {pick(
            `Demo verification date ${formattedDate}`,
            `నమూనా ధృవీకరణ తేదీ ${formattedDate}`,
            `डेमो सत्यापन तिथि ${formattedDate}`
          )}
        </span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="warning"
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold',
        language === 'en' ? 'uppercase tracking-wide' : '',
        getFontClass(),
        className
      )}
    >
      <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0" aria-hidden="true" />
      <span>
        {pick(
          'Pending Verification',
          'ధృవీకరణ పెండింగ్‌లో ఉంది',
          'सत्यापन लंबित है'
        )}
      </span>
    </Badge>
  );
};
