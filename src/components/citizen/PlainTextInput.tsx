import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { useProfileStore } from '@/store/useProfileStore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PiiAlertBanner } from '@/components/common/PiiAlertBanner';
import { VoiceInputModal } from './VoiceInputModal';
import { inspectTextForPii } from '@/utils/piiValidator';
import { APP_CONSTANTS } from '@/config/constants';
import { cn } from '@/utils/cn';
import { ArrowRight, Sparkles, RefreshCw, Mic, ShieldCheck, AlertCircle } from 'lucide-react';

export interface PlainTextInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
}

export const PlainTextInput: React.FC<PlainTextInputProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const { rawDescription, setRawDescription } = useProfileStore();
  const { pick, getFontClass } = useLanguage();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [wasClampedWarning, setWasClampedWarning] = useState(false);

  const piiCheck = useMemo(() => inspectTextForPii(rawDescription), [rawDescription]);
  const piiDetected = piiCheck.hasPii;

  const maxLen = APP_CONSTANTS.MAX_DESCRIPTION_LENGTH;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    // Allow normal typing up to maxLen AND always allow deleting/shortening if over maxLen
    if (text.length <= maxLen || text.length < rawDescription.length) {
      setRawDescription(text);
      if (wasClampedWarning && text.length < maxLen) {
        setWasClampedWarning(false);
      }
    }
  };

  const handleVoiceAccept = (spokenText: string) => {
    if (spokenText.length > maxLen) {
      setRawDescription(spokenText.slice(0, maxLen));
      setWasClampedWarning(true);
    } else {
      setRawDescription(spokenText);
      setWasClampedWarning(false);
    }
  };

  const handleClearPii = () => {
    const sanitized = piiCheck.sanitizedText;
    if (sanitized.length > maxLen) {
      setRawDescription(sanitized.slice(0, maxLen));
      setWasClampedWarning(true);
    } else {
      setRawDescription(sanitized);
      setWasClampedWarning(false);
    }
  };

  const handleClearAll = () => {
    setRawDescription('');
    setWasClampedWarning(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const charLen = rawDescription.length;
    if (rawDescription.trim() && !piiDetected && charLen <= maxLen && !isLoading) {
      onSubmit(rawDescription.trim());
    }
  };

  const placeholderEn =
    'Example: "I am a 68-year-old widow living in a rural village in Krishna district, Andhra Pradesh. I have no farmland or pension." Or "I am 34, daily wage worker, my daughter is in Class 8."';
  const placeholderTe =
    'ఉదాహరణ: "నా వయస్సు 68 సంవత్సరాలు, నేను కృష్ణా జిల్లా గ్రామంలో ఉంటున్న వితంతువును. నాకు భూమి లేదా పెన్షన్ లేదు." లేదా "నా వయస్సు 34 ఏళ్లు, నేను కూలీని, నా కుమార్తె 8వ తరగతి చదువుతోంది."';
  const placeholderHi =
    'उदाहरण: "मेरी उम्र 68 वर्ष है और मैं कृष्णा जिले के गांव में रहने वाली विधवा हूँ। मेरी कोई पेंशन या जमीन नहीं है।" या "मेरी उम्र 34 वर्ष है, दिहाड़ी मजदूर हूँ, बेटी कक्षा 8 में है।"';

  const tipChips = [
    { en: 'Age', te: 'వయస్సు', hi: 'आयु' },
    { en: 'Work / Farming', te: 'వృత్తి / వ్యవసాయం', hi: 'काम / खेती' },
    { en: 'Ration Card / Income', te: 'రేషన్ కార్డు / ఆదాయం', hi: 'राशन कार्ड / आय' },
    { en: 'Children in School', te: 'పిల్లల చదువు', hi: 'बच्चों की पढ़ाई' },
    { en: 'District', te: 'జిల్లా', hi: 'जिला' },
  ];

  const charCount = rawDescription.length;
  const isTooLong = charCount > maxLen;
  const isDisabled = !rawDescription.trim() || piiDetected || isTooLong || isLoading;

  const describedByIds = [
    'situation-tips',
    'situation-helper',
    'situation-counter',
    wasClampedWarning || isTooLong ? 'situation-length-notice' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {piiDetected && (
        <PiiAlertBanner
          onClear={handleClearPii}
          detectedTypes={piiCheck.detectedTypes}
        />
      )}

      {/* Visible Label + Persistent 1-Line Tip Chips */}
      <div className="space-y-2">
        <label
          htmlFor="situation-input"
          className={cn(
            'block text-sm md:text-base font-bold text-body leading-snug',
            getFontClass()
          )}
        >
          {pick(
            'Tell us about your household situation (in your own words)',
            'మీ కుటుంబ పరిస్థితిని మీ సొంత మాటల్లో వివరించండి',
            'अपनी पारिवारिक स्थिति अपने शब्दों में बताएं'
          )}
        </label>

        <div
          id="situation-tips"
          className="flex flex-wrap items-center gap-1.5"
        >
          <span className={cn('text-xs font-semibold text-slate-700 mr-0.5', getFontClass())}>
            {pick('Helpful to mention:', 'ఇవి ప్రస్తావించండి:', 'ये बातें लिखें:')}
          </span>
          {tipChips.map((chip) => (
            <Badge
              key={chip.en}
              variant="secondary"
              className={cn('bg-slate-100 border-slate-300 text-slate-800 font-medium', getFontClass())}
            >
              {pick(chip.en, chip.te, chip.hi)}
            </Badge>
          ))}
          <Badge
            variant="success"
            className={cn('inline-flex items-center gap-1 font-semibold', getFontClass())}
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'No Aadhaar / Phone needed',
                'ఆధార్ / ఫోన్ నంబర్ వద్దు',
                'आधार / फ़ोन नंबर आवश्यक नहीं'
              )}
            </span>
          </Badge>
        </div>
      </div>

      {/* Accessible High-Contrast Textarea Container */}
      <div
        className={cn(
          'relative rounded-lg border bg-white shadow-sm focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-1',
          piiDetected || isTooLong ? 'border-danger border-2' : 'border-slate-500'
        )}
      >
        <Textarea
          id="situation-input"
          value={rawDescription}
          onChange={handleChange}
          placeholder={pick(placeholderEn, placeholderTe, placeholderHi)}
          rows={5}
          aria-describedby={describedByIds}
          aria-invalid={piiDetected || isTooLong}
          className={cn(
            'border-0 p-4 focus-visible:ring-0 focus-visible:ring-offset-0 resize-y text-base md:text-lg leading-relaxed rounded-b-none',
            getFontClass()
          )}
          disabled={isLoading}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-t border-slate-200 rounded-b-lg text-xs text-slate-700">
          <span id="situation-helper" className={getFontClass()}>
            {pick(
              'Plain language intake — coarse details only, zero ID numbers',
              'సరళమైన భాషా వివరణ — సాధారణ వివరాలు మాత్రమే, గుర్తింపు సంఖ్యలు వద్దు',
              'सरल भाषा में विवरण — केवल सामान्य जानकारी, पहचान संख्या नहीं'
            )}
          </span>
          <span
            id="situation-counter"
            aria-live="polite"
            className={cn(
              'font-mono font-semibold ml-auto',
              isTooLong
                ? 'text-danger font-bold'
                : charCount >= maxLen - 50
                ? 'text-warning font-bold'
                : 'text-slate-700'
            )}
          >
            {charCount} / {maxLen}
          </span>
        </div>
      </div>

      {(wasClampedWarning || isTooLong) && (
        <div
          id="situation-length-notice"
          role="status"
          className={cn(
            'rounded-md border px-3.5 py-2.5 text-xs flex items-start gap-2',
            isTooLong
              ? 'border-danger-border bg-danger-surface text-danger font-semibold'
              : 'border-warning-border bg-warning-surface text-amber-950 font-medium',
            getFontClass()
          )}
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            {isTooLong
              ? pick(
                  `Your description exceeds ${maxLen} characters. Please shorten it by ${charCount - maxLen} characters to continue.`,
                  `మీ వివరణ ${maxLen} అక్షరాలను మించిపోయింది. కొనసాగించడానికి దయచేసి ${charCount - maxLen} అక్షరాలు తగ్గించండి.`,
                  `आपका विवरण ${maxLen} अक्षरों से अधिक है। आगे बढ़ने के लिए कृपया ${charCount - maxLen} अक्षर कम करें।`
                )
              : pick(
                  `Note: Text was trimmed to fit the ${maxLen}-character limit. Please review before continuing.`,
                  `గమనిక: ${maxLen} అక్షరాల పరిమితికి అనుగుణంగా పాఠ్యం సర్దుబాటు చేయబడింది. దయచేసి ఒకసారి సరిచూసుకోండి.`,
                  `ध्यान दें: ${maxLen} अक्षरों की सीमा के अनुसार पाठ को समायोजित किया गया है। कृपया जांच लें।`
                )}
          </span>
        </div>
      )}

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAcceptTranscript={handleVoiceAccept}
        initialText={rawDescription}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Left: Voice Button (prominent, elder-friendly) + Clear */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsVoiceModalOpen(true)}
            disabled={isLoading}
            className={cn(
              'flex-1 sm:flex-initial border-2 border-primary bg-primary/5 hover:bg-primary/10 text-primary font-bold inline-flex items-center justify-center gap-2 touch-target',
              getFontClass()
            )}
            aria-label={pick(
              'Speak using voice input',
              'వాయిస్ ఇన్‌పుట్ ద్వారా మాట్లాడండి',
              'वॉइस इनपुट द्वारा बोलकर बताएं'
            )}
          >
            <Mic className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
            <span>
              {pick(
                'Speak (Voice Input)',
                'మాట్లాడండి (వాయిస్)',
                'बोलकर बताएं (वॉइस)'
              )}
            </span>
          </Button>

          {rawDescription && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading}
              className={cn('text-xs text-slate-700 hover:text-body', getFontClass())}
            >
              {pick('Clear', 'తొలగించండి', 'साफ़ करें')}
            </Button>
          )}
        </div>

        {/* Right: Primary Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={isDisabled}
          className={cn(
            'w-full sm:w-auto shadow-sm inline-flex items-center justify-center gap-2',
            getFontClass()
          )}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin shrink-0" aria-hidden="true" />
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
              <Sparkles className="h-5 w-5 text-amber-300 shrink-0" aria-hidden="true" />
              <span>
                {pick(
                  'Understand My Situation',
                  'వివరాలను విశ్లేషించండి',
                  'मेरी स्थिति का विश्लेषण करें'
                )}
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
