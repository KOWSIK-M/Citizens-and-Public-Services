import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { Info } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DisclaimerBanner: React.FC<{ className?: string }> = ({ className }) => {
  const { pick, getFontClass } = useLanguage();

  const textEn =
    'ClaimSaathi demo. Try a sample story and check current eligibility rules and deadlines on the official portals.';
  const textTe =
    'క్లెయిమ్ సాథీ నమూనా. నమూనా కుటుంబ కథను ప్రయత్నించండి. తాజా అర్హత నియమాలు, గడువు తేదీల కోసం అధికారిక పోర్టల్స్ చూడండి.';
  const textHi =
    'क्लेम साथी का डेमो। एक नमूना कहानी आज़माएँ और मौजूदा पात्रता नियम व अंतिम तिथियाँ आधिकारिक पोर्टल पर देखें।';

  return (
    <div
      className={cn(
        'bg-info-surface border-b border-info-border text-slate-900 px-4 py-2 text-xs md:text-sm font-medium',
        className
      )}
      role="note"
      aria-label={pick(
        'Statutory disclaimer',
        'చట్టపరమైన గమనిక',
        'वैधानिक सूचना'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-center gap-2 sm:text-center">
        <Info className="h-4 w-4 shrink-0 text-info mt-0.5 sm:mt-0" aria-hidden="true" />
        <span className={cn('leading-snug', getFontClass())}>
          {pick(textEn, textTe, textHi)}
        </span>
      </div>
    </div>
  );
};
