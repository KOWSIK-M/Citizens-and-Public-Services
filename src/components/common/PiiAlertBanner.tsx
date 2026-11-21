import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { ShieldAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PiiAlertBannerProps {
  onClear: () => void;
  detectedTypes?: string[];
}

export const PiiAlertBanner: React.FC<PiiAlertBannerProps> = ({ onClear }) => {
  const { pick, getFontClass } = useLanguage();

  const titleEn = 'Personal Identification Number Detected';
  const titleTe = 'వ్యక్తిగత గుర్తింపు సంఖ్య గుర్తించబడింది';
  const titleHi = 'व्यक्तिगत पहचान संख्या का पता चला';

  const descEn =
    'Please do not type ID numbers such as Aadhaar, PAN, or phone numbers. ClaimSaathi only requires coarse details like your age group, occupation, and approximate income to check scheme eligibility.';
  const descTe =
    'దయచేసి ఆధార్, పాన్ లేదా ఫోన్ నంబర్లు వంటి గుర్తింపు సంఖ్యలను నమోదు చేయవద్దు. క్లెయిమ్ సాథీకి మీ వయోపరిమితి, వృత్తి మరియు సుమారు ఆదాయం వంటి వివరాలు మాత్రమే అవసరం.';
  const descHi =
    'कृपया आधार, पैन या फोन नंबर जैसी पहचान संख्याएं दर्ज न करें। क्लेम साथी को केवल आपकी आयु वर्ग, व्यवसाय और अनुमानित आय जैसे बुनियादी विवरणों की आवश्यकता है।';

  const clearBtnEn = 'Remove ID Numbers';
  const clearBtnTe = 'సంఖ్యలను తొలగించండి';
  const clearBtnHi = 'नंबर हटाएं';

  return (
    <div
      role="alert"
      className="rounded-lg border-2 border-danger bg-danger-surface p-4 text-danger mb-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-6 w-6 shrink-0 text-danger mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h4 className={`font-bold text-sm md:text-base ${getFontClass()}`}>
            {pick(titleEn, titleTe, titleHi)}
          </h4>
          <p className={`text-xs md:text-sm mt-1 leading-relaxed text-red-950 ${getFontClass()}`}>
            {pick(descEn, descTe, descHi)}
          </p>
          <div className="mt-3">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onClear}
              className="inline-flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>{pick(clearBtnEn, clearBtnTe, clearBtnHi)}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
