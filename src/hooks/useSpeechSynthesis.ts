import { useState, useEffect, useCallback } from 'react';
import { SupportedLanguage } from '@/types/i18n';

const TTS_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

export function useSpeechSynthesis() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [isSupported]);

  const toggleSpeak = useCallback(
    (id: string, text: string, lang: SupportedLanguage = 'en') => {
      if (!isSupported || !text.trim()) return;

      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const targetLocale = TTS_LOCALE_MAP[lang] || 'en-IN';
      utterance.lang = targetLocale;
      utterance.rate = 0.95; // Slightly slower for elderly / rural citizen clarity

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice =
        voices.find((v) => v.lang.toLowerCase() === targetLocale.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, speakingId]
  );

  return {
    isSupported,
    speakingId,
    isSpeaking: (id: string) => speakingId === id,
    toggleSpeak,
    stop,
  };
}
