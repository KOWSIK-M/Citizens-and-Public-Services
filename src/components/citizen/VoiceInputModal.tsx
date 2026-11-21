import React, { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useLanguage } from '@/store/useLanguageStore';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptTranscript: (spokenText: string) => void;
  initialText?: string;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onAcceptTranscript,
  initialText = '',
}) => {
  const { pick, getFontClass, language } = useLanguage();
  const [accumulatedText, setAccumulatedText] = useState(initialText);
  const basePrefixRef = useRef<string>(initialText);
  const wasOpenRef = useRef<boolean>(false);

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition((newSessionText) => {
    const combined = [basePrefixRef.current.trim(), newSessionText.trim()]
      .filter(Boolean)
      .join(' ');
    setAccumulatedText(combined);
  });

  // Sync initialText & auto-start speech recognition cleanly when modal opens
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;
      basePrefixRef.current = initialText;
      setAccumulatedText(initialText);
      resetTranscript();
      if (isSupported) {
        startListening(language);
      }
    } else if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      stopListening();
    }
  }, [isOpen, initialText, isSupported, language, resetTranscript, startListening, stopListening]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      stopListening();
      onClose();
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      // Preserve everything accumulated so far as the new base prefix before restarting
      const currentFull = [accumulatedText.trim(), interimTranscript.trim()]
        .filter(Boolean)
        .join(' ');
      basePrefixRef.current = currentFull;
      setAccumulatedText(currentFull);
      resetTranscript();
      startListening(language);
    }
  };

  const combinedLiveText = [accumulatedText.trim(), interimTranscript.trim()]
    .filter(Boolean)
    .join(' ');
  const canAccept = combinedLiveText.length > 0;

  const handleDone = () => {
    stopListening();
    if (canAccept) {
      onAcceptTranscript(combinedLiveText);
    }
    onClose();
  };

  const handleClear = () => {
    basePrefixRef.current = '';
    setAccumulatedText('');
    resetTranscript();
  };

  const handleSelectSamplePrompt = (sampleText: string) => {
    basePrefixRef.current = sampleText;
    resetTranscript();
    setAccumulatedText(sampleText);
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'te':
        return 'తెలుగు – భారత్ (Telugu India)';
      case 'hi':
        return 'हिन्दी – भारत (Hindi India)';
      case 'en':
      default:
        return 'English (India)';
    }
  };

  const getTranslatedError = (errCode: string): { title: string; instruction: string } => {
    const normalized = errCode.toLowerCase();
    if (normalized.includes('not-allowed') || normalized.includes('permission')) {
      return {
        title: pick(
          'Microphone permission is blocked',
          'మైక్రోఫోన్ అనుమతి నిలిపివేయబడింది',
          'माइक्रोफ़ोन की अनुमति अवरुद्ध है'
        ),
        instruction: pick(
          'Please allow microphone access in your browser address bar, or close this dialog and type your situation directly.',
          'దయచేసి మీ బ్రౌజర్ చిరునామా పట్టీలో మైక్రోఫోన్ అనుమతిని ఇవ్వండి, లేదా నేరుగా టైప్ చేయండి.',
          'कृपया ब्राउज़र एड्रेस बार में माइक्रोफ़ोन की अनुमति दें, या इसे बंद करके सीधे टाइप करें।'
        ),
      };
    }
    if (normalized.includes('audio-capture')) {
      return {
        title: pick(
          'No active microphone detected',
          'మైక్రోఫోన్ కనుగొనబడలేదు',
          'कोई सक्रिय माइक्रोफ़ोन नहीं मिला'
        ),
        instruction: pick(
          'Please check that a working microphone or headset is connected, or type your details in the text box.',
          'దయచేసి మైక్రోఫోన్ సరిగ్గా కనెక్ట్ అయిందో లేదో చూడండి, లేదా టెక్స్ట్ బాక్స్‌లో టైప్ చేయండి.',
          'कृपया जांचें कि माइक जुड़ा हुआ है, या टेक्स्ट बॉक्स में सीधे लिखकर बताएं।'
        ),
      };
    }
    if (normalized.includes('network')) {
      return {
        title: pick(
          'Network needed for live voice recognition',
          'వాయిస్ గుర్తింపు కోసం ఇంటర్నెట్ కనెక్షన్ అవసరం',
          'वॉइस पहचान के लिए इंटरनेट कनेक्शन आवश्यक है'
        ),
        instruction: pick(
          'Check your mobile data / Wi-Fi connection and tap the microphone again, or type your story directly (offline text matching works without internet).',
          'మీ మొబైల్ డేటా / వై-ఫై తనిఖీ చేసి మళ్లీ ప్రయత్నించండి, లేదా నేరుగా టైప్ చేయండి.',
          'अपना मोबाइल डेटा / वाई-फाई जांचें और पुनः प्रयास करें, या सीधे लिखकर बताएं।'
        ),
      };
    }
    if (normalized.includes('speech_not_supported')) {
      return {
        title: pick(
          'Voice input is not supported in this browser',
          'ఈ బ్రౌజర్‌లో వాయిస్ సదుపాయం అందుబాటులో లేదు',
          'इस ब्राउज़र में वॉइस सुविधा उपलब्ध नहीं है'
        ),
        instruction: pick(
          'Please use Google Chrome or Microsoft Edge, or tap an example below / type directly.',
          'దయచేసి గూగుల్ క్రోమ్ లేదా మైక్రోసాఫ్ట్ ఎడ్జ్ ఉపయోగించండి, లేదా క్రింది ఉదాహరణను ఎంచుకోండి.',
          'कृपया गूगल क्रोम या माइक्रोसॉफ्ट एज का उपयोग करें, या नीचे दिए गए उदाहरण चुनें।'
        ),
      };
    }
    return {
      title: pick(
        'Could not capture voice clearly',
        'మీ మాటలు స్పష్టంగా వినబడలేదు',
        'आवाज़ स्पष्ट रूप से रिकॉर्ड नहीं हो सकी'
      ),
      instruction: pick(
        'Tap the microphone button to try speaking again, or select an example below to edit.',
        'మళ్లీ మాట్లాడటానికి మైక్రోఫోన్ బటన్‌ను నొక్కండి, లేదా క్రింది ఉదాహరణను ఎంచుకోండి.',
        'दोबारा बोलने के लिए माइक बटन दबाएं, या नीचे दिए गए उदाहरण का चयन करें।'
      ),
    };
  };

  const samplePrompts = [
    {
      en: 'I am a 68-year-old widow in Andhra Pradesh, no regular pension.',
      te: 'నా వయస్సు 68 ఏళ్లు, నేను ఆంధ్రప్రదేశ్‌లో ఉంటున్న వితంతువును, నాకు ఎటువంటి పెన్షన్ లేదు.',
      hi: 'मेरी उम्र 68 वर्ष है, मैं आंध्र प्रदेश में विधवा हूँ, मुझे कोई पेंशन नहीं मिलती।',
    },
    {
      en: 'I am a small farmer with 2 acres of land growing seasonal crops.',
      te: 'నేను సన్నకారు రైతును, నాకు 2 ఎకరాల సొంత భూమి ఉంది, పంటలు వేస్తున్నాను.',
      hi: 'मैं एक छोटा किसान हूँ, मेरे पास 2 एकड़ जमीन है और मैं फसलें उगाता हूँ।',
    },
    {
      en: 'I am 34 years old, daily wage worker, my daughter is in Class 8.',
      te: 'నా వయస్సు 34 సంవత్సరాలు, నేను దినసరి కూలీని, నా కుమార్తె 8వ తరగతి చదువుతోంది.',
      hi: 'मेरी उम्र 34 वर्ष है, मैं दिहाड़ी मजदूर हूँ, मेरी बेटी कक्षा 8 में पढ़ती है।',
    },
  ];

  const errorDetails = error ? getTranslatedError(error) : null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] focus:outline-none">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <Dialog.Title
                  className={cn(
                    'text-base md:text-lg font-bold text-body leading-snug',
                    getFontClass()
                  )}
                >
                  {pick(
                    'Voice Input (Speak in Your Language)',
                    'వాయిస్ ఇన్‌పుట్ (మీ భాషలో మాట్లాడండి)',
                    'वॉइस इनपुट (अपनी भाषा में बोलें)'
                  )}
                </Dialog.Title>
                <Dialog.Description
                  className={cn('text-xs text-slate-600 font-medium leading-snug', getFontClass())}
                >
                  {getLanguageLabel()}
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-full inline-flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus shrink-0 touch-target"
                aria-label={pick('Close voice input', 'వాయిస్ ఇన్‌పుట్ మూసివేయండి', 'वॉइस इनपुट बंद करें')}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content Body */}
          <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 text-center">
            {!isSupported && (
              <div
                role="status"
                className="rounded-lg bg-warning-surface border border-warning-border p-4 text-sm text-amber-950 text-left flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                <div className={getFontClass()}>
                  <p className="font-semibold leading-snug">
                    {pick(
                      'Microphone speech recognition is not supported in this browser.',
                      'ఈ బ్రౌజర్‌లో మైక్రోఫోన్ వాయిస్ సదుపాయం అందుబాటులో లేదు.',
                      'इस ब्राउज़र में माइक्रोफ़ोन वॉइस सुविधा समर्थित नहीं है।'
                    )}
                  </p>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    {pick(
                      'Please use Google Chrome, Microsoft Edge, or tap any sample sentence below to fill it in.',
                      'దయచేసి గూగుల్ క్రోమ్ లేదా మైక్రోసాఫ్ట్ ఎడ్జ్ ఉపయోగించండి, లేదా క్రింది ఉదాహరణ వాక్యాన్ని ఎంచుకోండి.',
                      'कृपया क्रोम या एज ब्राउज़र का उपयोग करें, अथवा नीचे दिए किसी उदाहरण वाक्य पर टैप करें।'
                    )}
                  </p>
                </div>
              </div>
            )}

            {isSupported && (
              <div className="flex flex-col items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className={cn(
                    'relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus focus-visible:ring-offset-2',
                    isListening
                      ? 'bg-danger text-white ring-8 ring-danger/20 scale-105'
                      : 'bg-primary text-white hover:bg-primary-hover'
                  )}
                  aria-pressed={isListening}
                  aria-label={
                    isListening
                      ? pick('Stop listening', 'వినడం ఆపండి', 'सुनना बंद करें')
                      : pick('Start listening', 'మాట్లాడడం ప్రారంభించండి', 'बोलना शुरू करें')
                  }
                >
                  {isListening && (
                    <span
                      className="absolute inset-0 rounded-full bg-danger animate-ping opacity-25"
                      aria-hidden="true"
                    />
                  )}
                  {isListening ? (
                    <Mic className="h-10 w-10 md:h-12 md:w-12" aria-hidden="true" />
                  ) : (
                    <MicOff className="h-10 w-10 md:h-12 md:w-12" aria-hidden="true" />
                  )}
                </button>

                <div className="mt-3">
                  <span
                    className={cn(
                      'inline-block text-sm md:text-base font-bold leading-snug',
                      isListening ? 'text-danger' : 'text-slate-700',
                      getFontClass()
                    )}
                  >
                    {isListening
                      ? pick(
                          'Listening... Speak now about your age, work, and family',
                          'వింటున్నాము... మీ వయస్సు, వృత్తి, కుటుంబం గురించి మాట్లాడండి',
                          'सुन रहे हैं... कृपया अपनी आयु, काम और परिवार के बारे में बोलें'
                        )
                      : pick(
                          'Tap the microphone to start speaking',
                          'మాట్లాడడం ప్రారంభించడానికి మైక్రోఫోన్‌ను తాకండి',
                          'बोलना शुरू करने के लिए माइक पर टैप करें'
                        )}
                  </span>
                </div>
              </div>
            )}

            {/* Real-Time Live Spoken Transcript Preview (aria-live="polite") */}
            <div
              aria-live="polite"
              aria-atomic="false"
              className="text-left bg-slate-50 border border-slate-300 rounded-xl p-4 min-h-[110px] max-h-[180px] overflow-y-auto"
            >
              <span
                className={cn(
                  'text-xs font-semibold text-slate-700 block mb-1.5',
                  language === 'en' ? 'uppercase tracking-wider' : '',
                  getFontClass()
                )}
              >
                {pick('Spoken Transcript Preview:', 'మీరు చెప్పిన సమాచారం:', 'बोला गया विवरण:')}
              </span>

              {canAccept ? (
                <p
                  className={cn(
                    'text-base md:text-lg text-body leading-relaxed font-medium',
                    getFontClass()
                  )}
                >
                  <span>{accumulatedText}</span>
                  {interimTranscript && (
                    <span className="text-slate-600 italic">
                      {accumulatedText ? ` ${interimTranscript}` : interimTranscript}
                    </span>
                  )}
                </p>
              ) : (
                <p className={cn('text-sm text-slate-600 italic leading-relaxed', getFontClass())}>
                  {pick(
                    'Your spoken words will appear here in real time as you speak...',
                    'మీరు మాట్లాడుతుంటే మీ మాటలు ఇక్కడ తెలుగులో కనిపిస్తాయి...',
                    'आपके द्वारा बोले गए शब्द यहां वास्तविक समय में दिखाई देंगे...'
                  )}
                </p>
              )}
            </div>

            {/* Translated Speech Error Alert */}
            {errorDetails && (
              <div
                role="alert"
                className={cn(
                  'rounded-lg border border-danger-border bg-danger-surface p-3.5 text-left text-danger space-y-1',
                  getFontClass()
                )}
              >
                <p className="text-sm font-bold flex items-center gap-1.5 leading-snug">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{errorDetails.title}</span>
                </p>
                <p className="text-xs text-red-950 leading-relaxed">
                  {errorDetails.instruction}
                </p>
              </div>
            )}

            {/* Helpful Suggested Prompts (Keyboard-accessible <button type="button"> elements) */}
            <div className="text-left">
              <span
                className={cn(
                  'text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2',
                  getFontClass()
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                <span>
                  {pick(
                    'Helpful Examples (Tap to Use or Speak):',
                    'సహాయక ఉదాహరణలు (ఎంచుకోవడానికి నొక్కండి):',
                    'सहायक उदाहरण (उपयोग करने के लिए टैप करें):'
                  )}
                </span>
              </span>
              <div className="space-y-2">
                {samplePrompts.map((p, idx) => {
                  const localizedPrompt = pick(p.en, p.te, p.hi);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSamplePrompt(localizedPrompt)}
                      className={cn(
                        'w-full text-left min-h-[44px] text-xs sm:text-sm text-slate-800 bg-white border border-slate-400 rounded-lg px-3.5 py-2.5 hover:bg-primary/5 hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus leading-snug touch-target',
                        getFontClass()
                      )}
                    >
                      “{localizedPrompt}”
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!canAccept && !transcript}
              className={cn('text-xs text-slate-700 hover:text-body', getFontClass())}
            >
              <RotateCcw className="h-4 w-4 mr-1.5 shrink-0" aria-hidden="true" />
              <span>{pick('Clear', 'తొలగించండి', 'साफ़ करें')}</span>
            </Button>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={stopListening}
                  className={cn('text-xs', getFontClass())}
                >
                  {pick('Cancel', 'రద్దు చేయండి', 'रद्द करें')}
                </Button>
              </Dialog.Close>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleDone}
                disabled={!canAccept}
                className={cn(
                  'text-xs px-4 bg-success hover:bg-emerald-900 text-white font-semibold inline-flex items-center gap-1.5 shadow-sm',
                  getFontClass()
                )}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {pick(
                    'Use This Spoken Text',
                    'ఈ సమాచారాన్ని ఉపయోగించండి',
                    'यह विवरण उपयोग करें'
                  )}
                </span>
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
