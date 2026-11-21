import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

export interface PiiAlertBannerProps {
  onClear: () => void;
  detectedTypes?: string[];
}

const PII_TYPE_LABELS: Record<string, { en: string; te: string; hi: string }> = {
  aadhaar_or_12_digit: {
    en: '12-Digit ID / Aadhaar',
    te: '12 అంకెల సంఖ్య / ఆధార్',
    hi: '12 अंकों की आईडी / आधार',
  },
  phone_number: {
    en: 'Phone Number',
    te: 'ఫోన్ నంబర్',
    hi: 'फ़ोन नंबर',
  },
  pan_number: {
    en: 'PAN Number',
    te: 'పాన్ (PAN) నంబర్',
    hi: 'पैन (PAN) नंबर',
  },
  voter_id: {
    en: 'Voter ID',
    te: 'ఓటర్ ఐడి',
    hi: 'वोटर आईडी',
  },
  bank_or_card_number: {
    en: 'Bank Account / Card Number',
    te: 'బ్యాంక్ ఖాతా / కార్డు నంబర్',
    hi: 'बैंक खाता / कार्ड नंबर',
  },
  ifsc_code: {
    en: 'Bank IFSC Code',
    te: 'బ్యాంక్ IFSC కోడ్',
    hi: 'बैंक IFSC कोड',
  },
  email_address: {
    en: 'Email Address',
    te: 'ఈమెయిల్ చిరునామా',
    hi: 'ईमेल पता',
  },
};

export const PiiAlertBanner: React.FC<PiiAlertBannerProps> = ({
  onClear,
  detectedTypes = [],
}) => {
  const { pick, getFontClass } = useLanguage();

  const titleEn = 'Personal Identification Number Detected';
  const titleTe = 'వ్యక్తిగత గుర్తింపు సంఖ్య గుర్తించబడింది';
  const titleHi = 'व्यक्तिगत पहचान संख्या का पता चला';

  const descEn =
    'Please do not enter ID numbers such as Aadhaar, PAN, phone, Voter ID, or bank account numbers. ClaimSaathi only uses coarse details like your age group, occupation, and approximate income.';
  const descTe =
    'దయచేసి ఆధార్, పాన్, ఫోన్, ఓటర్ ఐడి లేదా బ్యాంక్ ఖాతా నంబర్లు నమోదు చేయవద్దు. క్లెయిమ్ సాథీకి మీ వయోపరిమితి, వృత్తి మరియు సుమారు ఆదాయం వంటి సాధారణ వివరాలు మాత్రమే అవసరం.';
  const descHi =
    'कृपया आधार, पैन, फ़ोन, वोटर आईडी या बैंक खाता संख्या दर्ज न करें। क्लेम साथी को केवल आपकी आयु वर्ग, व्यवसाय और अनुमानित आय जैसे बुनियादी विवरणों की आवश्यकता है।';

  const clearBtnEn = 'Remove Sensitive Numbers Only';
  const clearBtnTe = 'గుర్తింపు సంఖ్యలను మాత్రమే తొలగించండి';
  const clearBtnHi = 'केवल पहचान नंबर हटाएं';

  const formatDetectedType = (typeKey: string): string => {
    const entry = PII_TYPE_LABELS[typeKey];
    if (entry) {
      return pick(entry.en, entry.te, entry.hi);
    }
    return typeKey.replace(/_/g, ' ');
  };

  return (
    <div
      role="alert"
      aria-label={pick(titleEn, titleTe, titleHi)}
      className="rounded-lg border-2 border-danger bg-danger-surface p-4 text-danger mb-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-6 w-6 shrink-0 text-danger mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-bold text-sm md:text-base leading-snug', getFontClass())}>
            {pick(titleEn, titleTe, titleHi)}
          </h4>

          {detectedTypes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className={cn('text-xs font-semibold text-red-950', getFontClass())}>
                {pick('Detected:', 'గుర్తించినవి:', 'पता चला:')}
              </span>
              {detectedTypes.map((typeKey) => (
                <Badge
                  key={typeKey}
                  variant="danger"
                  className={cn('bg-white border-danger text-danger', getFontClass())}
                >
                  {formatDetectedType(typeKey)}
                </Badge>
              ))}
            </div>
          )}

          <p className={cn('text-sm mt-2 leading-relaxed text-red-950', getFontClass())}>
            {pick(descEn, descTe, descHi)}
          </p>

          <div className="mt-3">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onClear}
              className={cn('inline-flex items-center gap-1.5 font-semibold', getFontClass())}
            >
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{pick(clearBtnEn, clearBtnTe, clearBtnHi)}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
