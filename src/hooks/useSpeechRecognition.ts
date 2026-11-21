import { useState, useEffect, useRef, useCallback } from 'react';
import { SupportedLanguage } from '@/types/i18n';

const SPEECH_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface IWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
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

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef('');
  const onFinalRef = useRef(onFinalTranscript);

  // Keep latest callback ref without tearing down SpeechRecognition instance on re-render!
  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const isSupported =
    typeof window !== 'undefined' &&
    Boolean((window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionConstructor =
      (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) return;

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript || '';
        if (result.isFinal) {
          finalStr += text + ' ';
        } else {
          interimStr += text;
        }
      }

      if (finalStr.trim()) {
        const nextTranscript =
          (transcriptRef.current ? transcriptRef.current + ' ' : '') + finalStr.trim();
        transcriptRef.current = nextTranscript;
        setTranscript(nextTranscript);
        if (onFinalRef.current) {
          onFinalRef.current(nextTranscript);
        }
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === 'no-speech') {
        return;
      }
      if (event.error === 'aborted') {
        setIsListening(false);
        return;
      }
      setError(event.error || 'speech_error');
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
        // Ignore stop errors on unmount
      }
    };
  }, [isSupported]);

  const startListening = useCallback(
    (lang: SupportedLanguage = 'en') => {
      if (!isSupported || !recognitionRef.current) {
        setError('speech_not_supported');
        return;
      }

      setError(null);
      setInterimTranscript('');

      try {
        recognitionRef.current.lang = SPEECH_LOCALE_MAP[lang] || 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: unknown) {
        const errorObj = err as { name?: string; message?: string };
        if (errorObj?.name === 'InvalidStateError') {
          setIsListening(true);
        } else {
          setError(errorObj?.message || 'error_starting_speech');
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
      // Ignore stop errors
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = '';
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
