import React from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { TestTube2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SampleProfileBanner: React.FC = () => {
  const { isSample, resetProfile } = useProfileStore();
  const { pick, getFontClass } = useLanguage();

  if (!isSample) return null;

  return (
    <div
      role="status"
      className="bg-amber-100/90 border-b border-amber-300 text-amber-950 px-4 py-2 text-xs md:text-sm font-medium"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TestTube2 className="h-4 w-4 text-amber-800 shrink-0" aria-hidden="true" />
          <span className={getFontClass()}>
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
          onClick={resetProfile}
          className="h-8 px-2.5 text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-50"
        >
          <RotateCcw className="h-3 w-3 mr-1" aria-hidden="true" />
          <span>{pick('Reset', 'రీసెట్ చేయండి', 'रीसेट करें')}</span>
        </Button>
      </div>
    </div>
  );
};
