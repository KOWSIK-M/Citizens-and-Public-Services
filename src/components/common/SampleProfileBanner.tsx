import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { TestTube2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export const SampleProfileBanner: React.FC = () => {
  const { isSample, resetProfile } = useProfileStore();
  const { resetAssessment } = useAssessmentStore();
  const { pick, getFontClass } = useLanguage();

  if (!isSample) return null;

  const handleResetAll = () => {
    resetProfile();
    resetAssessment();
  };

  return (
    <div
      role="status"
      aria-label={pick(
        'Synthetic demo profile notice',
        'నమూనా ప్రొఫైల్ గమనిక',
        'सिंथेटिक डेमो प्रोफ़ाइल सूचना'
      )}
      className="bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-2 text-xs md:text-sm font-medium"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          <TestTube2 className="h-4 w-4 text-amber-800 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <span className={cn('leading-snug', getFontClass())}>
            {pick(
              'Demo Mode: Using synthetic test scenario. No real personal records are processed.',
              'డెమో మోడ్: నమూనా పరీక్ష ప్రొఫైల్ ఉపయోగించబడుతోంది. ఎటువంటి వాస్తవ వ్యక్తిగత డేటా ప్రాసెస్ చేయబడదు.',
              'डेमो मोड: सिंथेटिक परीक्षण परिदृश्य का उपयोग किया जा रहा है। कोई वास्तविक डेटा संसाधित नहीं किया जाता है।'
            )}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetAll}
          className={cn(
            'min-h-[44px] px-3.5 py-2 text-xs font-semibold bg-white text-amber-950 border-amber-700 hover:bg-amber-50 shrink-0 inline-flex items-center gap-1.5',
            getFontClass()
          )}
        >
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{pick('Reset', 'రీసెట్ చేయండి', 'रीसेट करें')}</span>
        </Button>
      </div>
    </div>
  );
};
