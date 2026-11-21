import { useState, useEffect, useRef, useCallback } from 'react';
import { SupportedLanguage } from '@/types/i18n';

// Language locale codes for Web Speech API
const SPEECH_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

// Define Web Speech API types for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: (lang?: SupportedLanguage) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  onFinalTranscript?: (text: string) => void
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== 'undefined' && !!(
    (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition
  );

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionConstructor =
      (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition;

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalStr += text + ' ';
        } else {
          interimStr += text;
        }
      }

      if (finalStr) {
        setTranscript((prev) => {
          const updated = (prev ? prev + ' ' : '') + finalStr.trim();
          if (onFinalTranscript) {
            onFinalTranscript(updated);
          }
          return updated;
        });
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: any) => {
      // Don't treat no-speech or aborted as fatal errors
      if (event.error === 'no-speech') {
        return;
      }
      if (event.error === 'aborted') {
        setIsListening(false);
        return;
      }
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [isSupported, onFinalTranscript]);

  const startListening = useCallback(
    (lang: SupportedLanguage = 'en') => {
      if (!isSupported || !recognitionRef.current) {
        setError('speech_not_supported');
        return;
      }

      setError(null);
      setInterimTranscript('');

      try {
        const locale = SPEECH_LOCALE_MAP[lang] || 'en-IN';
        recognitionRef.current.lang = locale;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        // If already started, ignore or restart
        if (err.name !== 'InvalidStateError') {
          setError(err.message || 'error_starting_speech');
          setIsListening(false);
        }
      }
    },
    [isSupported]
  );

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
