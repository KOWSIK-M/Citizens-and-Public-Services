import React, { useState } from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PiiAlertBanner } from '@/components/common/PiiAlertBanner';
import { VoiceInputModal } from './VoiceInputModal';
import { inspectTextForPii } from '@/utils/piiValidator';
import { APP_CONSTANTS } from '@/config/constants';
import { ArrowRight, Sparkles, RefreshCw, Mic } from 'lucide-react';

export interface PlainTextInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

export const PlainTextInput: React.FC<PlainTextInputProps> = ({ onSubmit, isLoading = false }) => {
  const { rawDescription, setRawDescription } = useProfileStore();
  const { pick, getFontClass } = useLanguage();
  const [piiDetected, setPiiDetected] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= APP_CONSTANTS.MAX_DESCRIPTION_LENGTH) {
      setRawDescription(text);
      const piiCheck = inspectTextForPii(text);
      setPiiDetected(piiCheck.hasPii);
    }
  };

  const handleVoiceAccept = (spokenText: string) => {
    setRawDescription(spokenText);
    const piiCheck = inspectTextForPii(spokenText);
    setPiiDetected(piiCheck.hasPii);
  };

  const handleClearPii = () => {
    const piiCheck = inspectTextForPii(rawDescription);
    setRawDescription(piiCheck.sanitizedText);
    setPiiDetected(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawDescription.trim() && !piiDetected && !isLoading) {
      onSubmit(rawDescription.trim());
    }
  };

  const placeholderEn =
    'Example: "I am a 68-year-old widow living in a rural village in Andhra Pradesh. I have no land or pension." Or "I am 17 and in Class 10, parents are daily wage workers."';
  const placeholderTe =
    'ఉదాహరణ: "నా వయస్సు 68 సంవత్సరాలు, నేను గ్రామంలో ఉంటున్న వితంతువును. నాకు ఎటువంటి భూమి లేదా పెన్షన్ లేదు." లేదా "నేను 10వ తరగతి చదువుతున్న విద్యార్థిని, తల్లిదండ్రులు కూలీలు."';
  const placeholderHi =
    'उदाहरण: "मेरी उम्र 68 वर्ष है और मैं गांव में रहने वाली विधवा हूँ। मेरी कोई पेंशन या जमीन नहीं है।" या "मैं 10वीं कक्षा में पढ़ रहा हूँ, माता-पिता दिहाड़ी मजदूर हैं।"';

  const charCount = rawDescription.length;
  const isTooLong = charCount > APP_CONSTANTS.MAX_DESCRIPTION_LENGTH;
  const isDisabled = !rawDescription.trim() || piiDetected || isTooLong || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {piiDetected && <PiiAlertBanner onClear={handleClearPii} />}

      <div className="relative rounded-lg border border-border bg-white shadow-xs focus-within:ring-2 focus-within:ring-focus">
        <label htmlFor="situation-input" className="sr-only">
          {pick(
            'Describe your personal and financial situation',
            'మీ పరిస్థితిని వివరించండి',
            'अपनी व्यक्तिगत स्थिति का वर्णन करें'
          )}
        </label>
        <Textarea
          id="situation-input"
          value={rawDescription}
          onChange={handleChange}
          placeholder={pick(placeholderEn, placeholderTe, placeholderHi)}
          rows={5}
          className={`border-0 p-4 focus-visible:ring-0 resize-y text-base md:text-lg leading-relaxed ${getFontClass()}`}
          disabled={isLoading}
        />
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 rounded-b-lg text-xs text-muted">
          <span>
            {pick(
              'Plain language intake – no ID numbers needed',
              'సరళమైన భాషా వివరణ – గుర్తింపు సంఖ్యలు అవసరం లేదు',
              'सरल भाषा में विवरण – किसी आईडी नंबर की आवश्यकता नहीं'
            )}
          </span>
          <span
            className={
              isTooLong ? 'text-danger font-bold' : charCount > 450 ? 'text-warning font-semibold' : ''
            }
          >
            {charCount} / {APP_CONSTANTS.MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
      </div>

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAcceptTranscript={handleVoiceAccept}
        initialText={rawDescription}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Left: Voice Button (prominent, designed for elders) + Clear */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsVoiceModalOpen(true)}
            disabled={isLoading}
            className="border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-bold inline-flex items-center gap-2 touch-target"
            aria-label={pick('Open voice input', 'వాయిస్ ఇన్పుట్ తెరవండి', 'वॉइस इनपुट खोलें')}
          >
            <Mic className="h-5 w-5 text-primary" aria-hidden="true" />
            {pick('Speak (Voice Input)', 'మాట్లాడండి (వాయిస్)', 'बोलकर बताएं (वॉइस)')}
          </Button>
          {rawDescription && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setRawDescription(''); setPiiDetected(false); }}
              disabled={isLoading}
              className="text-xs text-muted hover:text-body"
            >
              {pick('Clear', 'తొలగించండి', 'साफ़ करें')}
            </Button>
          )}
        </div>

        {/* Right: Submit button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={isDisabled}
          className={`w-full sm:w-auto shadow-sm inline-flex items-center gap-2 ${getFontClass()}`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span>
                {pick(
                  'Understanding details…',
                  'వివరాలను విశ్లేషిస్తోంది…',
                  'विवरण समझा जा रहा है…'
                )}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-amber-300" aria-hidden="true" />
              <span>
                {pick(
                  'Understand My Situation',
                  'వివరాలను విశ్లేషించండి',
                  'मेरी स्थिति का विश्लेषण करें'
                )}
              </span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
