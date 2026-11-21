import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/store/useLanguageStore';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/button';
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

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition((newText) => {
    setAccumulatedText(newText);
  });

  // Start listening automatically when modal opens if supported
  useEffect(() => {
    if (isOpen && isSupported) {
      setAccumulatedText(initialText);
      resetTranscript();
      startListening(language);
    } else {
      stopListening();
    }
  }, [isOpen, isSupported, language, initialText, resetTranscript, startListening, stopListening]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  };

  const handleDone = () => {
    stopListening();
    const finalText = (accumulatedText + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    if (finalText) {
      onAcceptTranscript(finalText);
    }
    onClose();
  };

  const handleClear = () => {
    setAccumulatedText('');
    resetTranscript();
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'te':
        return 'Telugu (తెలుగు – భారత్)';
      case 'hi':
        return 'Hindi (हिन्दी – भारत)';
      case 'en':
      default:
        return 'English (India)';
    }
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
      en: 'My son is studying in Class 10, family has low daily wage income.',
      te: 'మా అబ్బాయి 10వ తరగతి చదువుతున్నాడు, మేము దినసరి కూలీలం.',
      hi: 'मेरा बेटा 10वीं कक्षा में पढ़ रहा है, हम दिहाड़ी मजदूर हैं।',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Volume2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="voice-modal-title" className={`text-base md:text-lg font-bold text-body ${getFontClass()}`}>
                {pick(
                  'Voice Input (Speak in Your Language)',
                  'వాయిస్ ఇన్‌పుట్ (మీ భాషలో మాట్లాడండి)',
                  'वॉइस इनपुट (अपनी भाषा में बोलें)'
                )}
              </h3>
              <p className="text-xs text-muted font-medium">
                {getLanguageLabel()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-center">
          {!isSupported ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs md:text-sm text-amber-900 text-left flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {pick(
                    'Microphone speech recognition is not supported in this browser.',
                    'ఈ బ్రౌజర్‌లో మైక్రోఫోన్ వాయిస్ సదుపాయం అందుబాటులో లేదు.',
                    'इस ब्राउज़र में माइक्रोफ़ोन वॉइस सुविधा समर्थित नहीं है।'
                  )}
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  {pick(
                    'Please use Google Chrome, Microsoft Edge, or Android Browser, or type your description directly.',
                    'దయచేసి గూగుల్ క్రోమ్ లేదా మైక్రోసాఫ్ట్ ఎడ్జ్ బ్రౌజర్ ఉపయోగించండి లేదా నేరుగా టైప్ చేయండి.',
                    'कृपया क्रोम या एज ब्राउज़र का उपयोग करें अथवा सीधे लिखकर बताएं।'
                  )}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Big Interactive Microphone Circle */}
              <div className="flex flex-col items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={handleToggleListening}
                  className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isListening
                      ? 'bg-danger text-white ring-8 ring-danger/20 scale-105'
                      : 'bg-primary text-white hover:bg-primary-hover'
                  }`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                  {isListening && (
                    <span className="absolute inset-0 rounded-full bg-danger animate-ping opacity-25" />
                  )}
                  {isListening ? (
                    <Mic className="h-10 w-10 md:h-12 md:w-12 animate-pulse" aria-hidden="true" />
                  ) : (
                    <MicOff className="h-10 w-10 md:h-12 md:w-12" aria-hidden="true" />
                  )}
                </button>

                {/* Animated Listening Status */}
                <div className="mt-4">
                  <span
                    className={`inline-block text-sm md:text-base font-bold ${
                      isListening ? 'text-danger' : 'text-muted'
                    } ${getFontClass()}`}
                  >
                    {isListening
                      ? pick(
                          'Listening... Speak now about your family and income',
                          'వింటున్నాము... మీ వయస్సు, కుటుంబం, ఆదాయం గురించి మాట్లాడండి',
                          'सुन रहे हैं... कृपया अपनी आयु, परिवार और आय के बारे में बोलें'
                        )
                      : pick(
                          'Tap the microphone to start speaking',
                          'మాట్లాడడం ప్రారంభించడానికి మైక్రోఫోన్‌ను తాకండి',
                          'बोलना शुरू करने के लिए माइक पर टैप करें'
                        )}
                  </span>
                </div>
              </div>

              {/* Real-Time Live Spoken Transcript Preview */}
              <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[110px] max-h-[180px] overflow-y-auto">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                  {pick('Spoken Transcript Preview:', 'మీరు చెప్పిన సమాచారం:', 'बोला गया विवरण:')}
                </span>

                {accumulatedText || interimTranscript ? (
                  <p className={`text-base md:text-lg text-body leading-relaxed font-medium ${getFontClass()}`}>
                    <span>{accumulatedText}</span>
                    {interimTranscript && (
                      <span className="text-slate-400 italic"> {interimTranscript}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    {pick(
                      'Your spoken words will appear here in real-time as you speak...',
                      'మీరు మాట్లాడుతుంటే మీ మాటలు ఇక్కడ తెలుగులో కనిపిస్తాయి...',
                      'आपके द्वारा बोले गए शब्द यहां वास्तविक समय में दिखाई देंगे...'
                    )}
                  </p>
                )}
              </div>

              {/* Helpful Suggested Prompts */}
              <div className="text-left">
                <span className="text-xs font-semibold text-muted flex items-center gap-1 mb-2">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>{pick('Helpful Examples to Speak:', 'మాట్లాడటానికి ఉదాహరణలు:', 'बोलने के लिए उदाहरण:')}</span>
                </span>
                <div className="space-y-1.5">
                  {samplePrompts.map((p, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-600 bg-white border border-slate-200/80 rounded-md p-2 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setAccumulatedText(pick(p.en, p.te, p.hi))}
                    >
                      "{pick(p.en, p.te, p.hi)}"
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-xs text-danger font-medium">
              Speech status: {error}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!accumulatedText && !transcript}
            className="text-xs text-muted"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span>{pick('Clear', 'తొలగించండి', 'साफ़ करें')}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                stopListening();
                onClose();
              }}
              className="text-xs"
            >
              {pick('Cancel', 'రద్దు చేయండి', 'रद्द करें')}
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDone}
              disabled={!accumulatedText.trim()}
              className="text-xs px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold inline-flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{pick('Use This Spoken Text', 'ఈ సమాచారాన్ని ఉపయోగించండి', 'यह विवरण उपयोग करें')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
