import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { Info } from 'lucide-react';
import { cn } from '@/utils/cn';

export const DisclaimerBanner: React.FC<{ className?: string }> = ({ className }) => {
  const { pick, getFontClass } = useLanguage();

  const textEn =
    'Preliminary guidance only. ClaimSaathi provides likely-eligible recommendations based on public criteria. This is not an official government sanction or guarantee.';
  const textTe =
    'ప్రాథమిక సమాచారం మాత్రమే. క్లెయిమ్ సాథీ ప్రభుత్వ నిబంధనల ఆధారంగా మీకు అర్హత ఉండే అవకాశాన్ని మాత్రమే చూపుతుంది. ఇది అధికారిక ప్రభుత్వ మంజూరు కాదు.';
  const textHi =
    'केवल प्रारंभिक मार्गदर्शन। क्लेम साथी सार्वजनिक नियमों के आधार पर संभावित पात्रता बताता है। यह कोई आधिकारिक सरकारी स्वीकृति या गारंटी नहीं है।';

  return (
    <div
      className={cn(
        'bg-blue-50 border-b border-blue-200 text-blue-900 px-4 py-2 text-xs md:text-sm font-medium',
        className
      )}
      role="note"
      aria-label="Statutory disclaimer"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center">
        <Info className="h-4 w-4 shrink-0 text-blue-700" aria-hidden="true" />
        <span className={getFontClass()}>{pick(textEn, textTe, textHi)}</span>
      </div>
    </div>
  );
};
