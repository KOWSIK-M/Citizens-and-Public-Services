import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/store/useLanguageStore';
import { useSchemeStore } from '@/store/useSchemeStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { useTrackerStore } from '@/store/useTrackerStore';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer';
import {
  createInitialVoiceCallSession,
  processVoiceCallTurn,
  VoiceCallSessionState,
} from '@/services/voiceCallEngine';
import { SchemeMatchResult } from '@/types/eligibility';
import { SupportedLanguage } from '@/types/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/config/routes';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Megaphone,
  Hand,
} from 'lucide-react';

const TTS_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const VoiceCallPage: React.FC = () => {
  const { language, setLanguage, pick, getFontClass } = useLanguage();
  const { schemes } = useSchemeStore();
  const { confirmedProfile, setConfirmedProfile } = useProfileStore();
  const { setAssessment } = useAssessmentStore();
  const { trackSchemeFromResult } = useTrackerStore();
  const navigate = useNavigate();

  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [typedTurn, setTypedTurn] = useState('');
  const [session, setSession] = useState<VoiceCallSessionState>(() =>
    createInitialVoiceCallSession(language, confirmedProfile)
  );

  const silenceTimerRef = useRef<number | null>(null);
  const latestSpokenTurnIdRef = useRef<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const callActiveRef = useRef(callActive);
  const isMutedRef = useRef(isMuted);
  const languageRef = useRef(language);
  const sessionPhaseRef = useRef(session.phase);

  callActiveRef.current = callActive;
  isMutedRef.current = isMuted;
  languageRef.current = language;
  sessionPhaseRef.current = session.phase;

  const handleCommitUtterance = useCallback(
    (utteranceText: string) => {
      const cleaned = utteranceText.trim();
      if (!cleaned) return;

      setSession((prev) => {
        const next = processVoiceCallTurn(prev, cleaned, languageRef.current, schemes);
        return next;
      });
    },
    [schemes]
  );

  const {
    isSupported: sttSupported,
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition((accumulatedFinal) => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
    }
    silenceTimerRef.current = window.setTimeout(() => {
      stopListening();
      resetTranscript();
      handleCommitUtterance(accumulatedFinal);
    }, 900);
  });

  const audioEnergy = useAudioVisualizer(isListening && callActive, isAgentSpeaking);

  // Call duration timer
  useEffect(() => {
    if (!callActive) return;
    const interval = window.setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [callActive]);

  // Auto-scroll transcript container
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [session.turns.length, interimTranscript]);

  // Cleanup speech & timers on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current !== null) {
        window.clearTimeout(silenceTimerRef.current);
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakAgentText = useCallback(
    (text: string, lang: SupportedLanguage, autoListenAfter: boolean) => {
      if (
        !speakerOn ||
        typeof window === 'undefined' ||
        !('speechSynthesis' in window) ||
        !('SpeechSynthesisUtterance' in window)
      ) {
        setIsAgentSpeaking(false);
        if (autoListenAfter && sttSupported && !isMutedRef.current && callActiveRef.current) {
          startListening(lang);
        }
        return;
      }

      stopListening();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const locale = TTS_LOCALE_MAP[lang] || 'en-IN';
      utterance.lang = locale;
      utterance.rate = 0.96;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice =
        voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setIsAgentSpeaking(true);
      utterance.onend = () => {
        setIsAgentSpeaking(false);
        if (
          autoListenAfter &&
          sttSupported &&
          callActiveRef.current &&
          !isMutedRef.current &&
          sessionPhaseRef.current !== 'completed'
        ) {
          startListening(languageRef.current);
        }
      };
      utterance.onerror = () => {
        setIsAgentSpeaking(false);
      };

      setIsAgentSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [speakerOn, sttSupported, startListening, stopListening]
  );

  // Speak new agent turns automatically while call is active
  useEffect(() => {
    if (!callActive) return;
    const lastTurn = session.turns[session.turns.length - 1];
    if (!lastTurn || lastTurn.speaker !== 'agent') return;
    if (latestSpokenTurnIdRef.current === lastTurn.id) return;

    latestSpokenTurnIdRef.current = lastTurn.id;
    speakAgentText(lastTurn.text, lastTurn.language, session.phase !== 'completed');
  }, [callActive, session.turns, session.phase, speakAgentText]);

  const handleProceedWithScheme = useCallback(
    (schemeItem: SchemeMatchResult) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      stopListening();
      setConfirmedProfile(session.profile);
      if (session.assessment) {
        setAssessment(session.assessment);
      }
      trackSchemeFromResult(schemeItem);
      navigate(ROUTES.APPLICATION_GUIDE(schemeItem.scheme_id));
    },
    [navigate, session.assessment, session.profile, setAssessment, setConfirmedProfile, stopListening, trackSchemeFromResult]
  );

  // Auto-navigate when voice command triggers `proceedWithSchemeId`
  useEffect(() => {
    if (!session.proceedWithSchemeId) return;
    const chosen = session.recommendedSchemes.find(
      (s) => s.scheme_id === session.proceedWithSchemeId
    );
    if (!chosen) return;

    const timer = window.setTimeout(() => {
      handleProceedWithScheme(chosen);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [session.proceedWithSchemeId, session.recommendedSchemes, handleProceedWithScheme]);

  const handleStartCall = () => {
    const fresh = createInitialVoiceCallSession(language, confirmedProfile);
    latestSpokenTurnIdRef.current = null;
    setSession(fresh);
    setCallSeconds(0);
    setCallActive(true);
  };

  const handleEndCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopListening();
    resetTranscript();
    setIsAgentSpeaking(false);
    setCallActive(false);
  };

  const handleBargeIn = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAgentSpeaking(false);
    setIsMuted(false);
    if (sttSupported) {
      resetTranscript();
      startListening(language);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopListening();
    } else if (callActive && !isAgentSpeaking && sttSupported) {
      startListening(language);
    }
  };

  const handleLanguageSwitch = (nextLang: SupportedLanguage) => {
    setLanguage(nextLang);
    if (!callActive) {
      setSession(createInitialVoiceCallSession(nextLang, confirmedProfile));
    } else if (isListening) {
      stopListening();
      window.setTimeout(() => startListening(nextLang), 150);
    }
  };

  const handleSendTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedTurn.trim()) return;
    if (!callActive) {
      setCallActive(true);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAgentSpeaking(false);
    }
    stopListening();
    const toSend = typedTurn;
    setTypedTurn('');
    handleCommitUtterance(toSend);
  };

  const handleQuickReplyClick = (utterance: string) => {
    if (!callActive) {
      setCallActive(true);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAgentSpeaking(false);
    }
    stopListening();
    handleCommitUtterance(utterance);
  };

  const orbScale = 1 + audioEnergy * 0.24;

  return (
    <div className="max-w-5xl mx-auto py-5 md:py-8 px-3 sm:px-6 lg:px-8 space-y-6">
      {/* Main Dark Slate / Indigo Phone-Call Stage */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-800/50 overflow-hidden">
        {/* Top Call Status Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-black/25 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                callActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
              aria-hidden="true"
            />
            <span className={`text-xs sm:text-sm font-semibold tracking-wide ${getFontClass()}`}>
              {callActive
                ? `${pick('Saathi Live Call', 'సాథీ లైవ్ కాల్', 'साथी लाइव कॉल')} • ${formatDuration(callSeconds)}`
                : pick('Saathi Voice Agent Ready', 'సాథీ వాయిస్ ఏజెంట్ సిద్ధంగా ఉంది', 'साथी वॉइस एजेंट तैयार')}
            </span>
            <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] hidden sm:inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {pick('On-Device • No IDs Stored', 'ఆన్-డివైస్ • గోప్యత రక్షణ', 'ऑन-डिवाइस • गोपनीय')}
            </Badge>
          </div>

          {/* Call Language Selector */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
            {(['en', 'te', 'hi'] as SupportedLanguage[]).map((langCode) => (
              <button
                key={langCode}
                type="button"
                onClick={() => handleLanguageSwitch(langCode)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors min-h-[32px] ${
                  language === langCode
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {langCode === 'en' ? 'EN' : langCode === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>

        {/* Center Voice Orb & Status */}
        <div className="px-4 sm:px-8 pt-7 pb-5 flex flex-col items-center text-center space-y-4">
          <div className="relative flex items-center justify-center h-32 w-32 sm:h-36 sm:w-36">
            <div
              style={{ transform: `scale(${orbScale})` }}
              className={`absolute inset-0 rounded-full transition-transform duration-150 blur-md ${
                isAgentSpeaking
                  ? 'bg-amber-400/35'
                  : isListening
                  ? 'bg-emerald-400/35'
                  : 'bg-indigo-400/20'
              }`}
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={callActive ? handleBargeIn : handleStartCall}
              aria-label={
                callActive
                  ? pick('Tap to speak now', 'ఇప్పుడు మాట్లాడటానికి నొక్కండి', 'बोलने के लिए टैप करें')
                  : pick('Start live voice call', 'లైవ్ వాయిస్ కాల్ ప్రారంభించండి', 'लाइव वॉइस कॉल शुरू करें')
              }
              className={`relative z-10 h-24 w-24 sm:h-28 sm:w-28 rounded-full flex flex-col items-center justify-center shadow-2xl border-2 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${
                !callActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300'
                  : isAgentSpeaking
                  ? 'bg-amber-500 text-slate-950 border-amber-200'
                  : isListening
                  ? 'bg-emerald-600 border-emerald-200'
                  : 'bg-indigo-700 hover:bg-indigo-600 border-indigo-300'
              }`}
            >
              {!callActive ? (
                <>
                  <PhoneCall className="h-8 w-8 mb-1" aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {pick('Start Call', 'కాల్ చేయండి', 'कॉल करें')}
                  </span>
                </>
              ) : isAgentSpeaking ? (
                <>
                  <Volume2 className="h-8 w-8 mb-1 animate-bounce" aria-hidden="true" />
                  <span className="text-[10px] font-extrabold uppercase">
                    {pick('Speaking', 'మాట్లాడుతోంది', 'बोल रहा है')}
                  </span>
                </>
              ) : isListening ? (
                <>
                  <Mic className="h-8 w-8 mb-1 animate-pulse" aria-hidden="true" />
                  <span className="text-[10px] font-extrabold uppercase">
                    {pick('Listening…', 'వింటోంది…', 'सुन रहा है…')}
                  </span>
                </>
              ) : (
                <>
                  <Hand className="h-7 w-7 mb-1" aria-hidden="true" />
                  <span className="text-[10px] font-bold uppercase">
                    {pick('Tap to Speak', 'మాట్లాడండి', 'बोलें')}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1 max-w-xl">
            <h1 className={`text-xl sm:text-2xl font-extrabold text-white ${getFontClass()}`}>
              {pick(
                'Talk Directly with Saathi to Pick Your Scheme',
                'సాథీతో నేరుగా మాట్లాడి మీ పథకాన్ని ఎంచుకోండి',
                'अपनी योजना चुनने के लिए सीधे साथी से बात करें'
              )}
            </h1>
            <p className={`text-xs sm:text-sm text-indigo-200 ${getFontClass()}`}>
              {!sttSupported
                ? pick(
                    'Voice mic recognition is unavailable in this browser—use the quick-reply chips or message box below while Saathi speaks back!',
                    'ఈ బ్రౌజర్‌లో మైక్ అందుబాటులో లేదు—క్రింది బటన్లు లేదా టెక్స్ట్ బాక్స్ ఉపయోగించండి, సాథీ మీకు వినిపిస్తుంది!',
                    'इस ब्राउज़र में माइक उपलब्ध नहीं है—नीचे दिए गए विकल्पों या टाइपिंग का उपयोग करें, साथी बोलकर जवाब देगा!'
                  )
                : pick(
                    'Speak naturally like a phone call. Saathi asks up to 3 quick questions, suggests likely-eligible schemes, and helps you proceed.',
                    'ఫోన్ కాల్ లాగే సహజంగా మాట్లాడండి. సాథీ 3 చిన్న ప్రశ్నలు అడిగి, అర్హత ఉండే అవకాశం ఉన్న పథకాలను సూచిస్తుంది.',
                    'फ़ोन कॉल की तरह सहज रूप से बात करें। साथी 3 छोटे सवाल पूछकर संभावित पात्र योजनाएं सुझाएगा।'
                  )}
            </p>
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div
          aria-live="polite"
          className="mx-3 sm:mx-6 mb-4 rounded-2xl bg-slate-900/90 border border-white/10 p-3.5 sm:p-5 max-h-[290px] overflow-y-auto space-y-3"
        >
          {session.turns.map((turn) => (
            <div
              key={turn.id}
              className={`flex flex-col ${
                turn.speaker === 'citizen' ? 'items-end' : 'items-start'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 mb-1 px-1">
                {turn.speaker === 'agent'
                  ? pick('Saathi Voice Guide', 'సాథీ వాయిస్ గైడ్', 'साथी वॉइस गाइड')
                  : pick('You', 'మీరు', 'आप')}
              </span>
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${getFontClass()} ${
                  turn.speaker === 'agent'
                    ? 'bg-indigo-950/90 border border-indigo-700/60 text-slate-100'
                    : 'bg-emerald-700 text-white'
                }`}
              >
                {turn.text}
                {turn.hadPiiRedacted && (
                  <div className="mt-1.5 text-[11px] text-amber-200 font-semibold">
                    {pick(
                      'Sensitive ID/phone digits automatically removed.',
                      'గోప్యత కోసం ఆధార్/ఫోన్ అంకెలు తొలగించబడ్డాయి.',
                      'सुरक्षा के लिए संवेदनशील नंबर हटा दिए गए।'
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {interimTranscript && (
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-emerald-300 mb-1 px-1">
                {pick('Listening…', 'వింటోంది…', 'सुन रहा है…')}
              </span>
              <div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm italic bg-emerald-900/50 border border-emerald-500/40 text-emerald-100">
                {interimTranscript}
              </div>
            </div>
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* One-Tap Quick Replies (Works during call OR without mic!) */}
        {session.quickReplies.length > 0 && (
          <div className="px-3 sm:px-6 pb-4">
            <p className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold mb-2">
              {pick(
                'Say aloud or tap a quick answer:',
                'పైకి చెప్పండి లేదా ఒక ఎంపికను నొక్కండి:',
                'बोलें या त्वरित उत्तर चुनें:'
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {session.quickReplies.map((qr) => {
                const label = pick(qr.label_en, qr.label_te, qr.label_hi);
                const utt = pick(qr.utterance_en, qr.utterance_te, qr.utterance_hi);
                return (
                  <button
                    key={qr.id}
                    type="button"
                    onClick={() => {
                      if (qr.id === 'gap-request') {
                        setConfirmedProfile(session.profile);
                        navigate(`${ROUTES.COMMUNITY}?tab=proposals&raise=1`);
                        return;
                      }
                      handleQuickReplyClick(utt);
                    }}
                    className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white border border-white/20 transition-colors min-h-[40px] ${getFontClass()}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback Text Turn Input inside Call */}
        <form
          onSubmit={handleSendTyped}
          className="px-3 sm:px-6 pb-4 flex items-center gap-2"
        >
          <Input
            value={typedTurn}
            onChange={(e) => setTypedTurn(e.target.value)}
            placeholder={pick(
              'Or type what you want to tell Saathi… (no Aadhaar/phone)',
              'లేదా సాథీకి చెప్పాలనుకున్నది ఇక్కడ టైప్ చేయండి…',
              'या साथी से कहने के लिए यहाँ टाइप करें…'
            )}
            className={`bg-slate-900/90 border-white/20 text-white placeholder:text-slate-400 min-h-[44px] ${getFontClass()}`}
          />
          <Button
            type="submit"
            disabled={!typedTurn.trim()}
            className="min-h-[44px] min-w-[44px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0"
            aria-label={pick('Send reply', 'పంపండి', 'भेजें')}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        {/* Bottom Phone Call Dock */}
        <div className="px-4 sm:px-6 py-4 bg-black/40 border-t border-white/10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          {!callActive ? (
            <Button
              type="button"
              onClick={handleStartCall}
              className={`min-h-[48px] px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg ${getFontClass()}`}
            >
              <PhoneCall className="h-5 w-5 mr-2" aria-hidden="true" />
              {pick('Start Live Voice Call', 'లైవ్ వాయిస్ కాల్ ప్రారంభించండి', 'लाइव वॉइस कॉल शुरू करें')}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleMute}
                className={`min-h-[44px] rounded-full border-white/25 ${
                  isMuted
                    ? 'bg-rose-600/80 text-white hover:bg-rose-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isMuted ? (
                  <MicOff className="h-4 w-4 mr-1.5" aria-hidden="true" />
                ) : (
                  <Mic className="h-4 w-4 mr-1.5" aria-hidden="true" />
                )}
                {isMuted
                  ? pick('Unmute', 'అన్‌మ్యూట్', 'अनम्यूट')
                  : pick('Mute', 'మ్యూట్', 'म्यूट')}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleBargeIn}
                className="min-h-[44px] rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 border-amber-300 font-bold"
              >
                <Sparkles className="h-4 w-4 mr-1.5" aria-hidden="true" />
                {pick('Interrupt & Speak', 'ఇప్పుడే మాట్లాడండి', 'अभी बोलें')}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const next = !speakerOn;
                  setSpeakerOn(next);
                  if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setIsAgentSpeaking(false);
                  }
                }}
                className="min-h-[44px] rounded-full bg-white/10 text-white hover:bg-white/20 border-white/25"
              >
                {speakerOn ? (
                  <Volume2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4 mr-1.5" aria-hidden="true" />
                )}
                {speakerOn
                  ? pick('Speaker On', 'స్పీకర్ ఆన్', 'स्पीकर ऑन')
                  : pick('Speaker Off', 'స్పీకర్ ఆఫ్', 'स्पीकर ऑफ')}
              </Button>

              <Button
                type="button"
                onClick={handleEndCall}
                className="min-h-[44px] rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold px-5"
              >
                <PhoneOff className="h-4 w-4 mr-1.5" aria-hidden="true" />
                {pick('End Call', 'కాల్ ముగించు', 'कॉल समाप्त करें')}
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              handleEndCall();
              setSession(createInitialVoiceCallSession(language, null));
            }}
            className="min-h-[44px] rounded-full text-slate-300 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {pick('Reset', 'రీసెట్', 'रीसेट')}
          </Button>
        </div>
      </div>

      {/* Live Suggested Likely-Eligible Schemes Ready to Pick & Proceed */}
      {session.recommendedSchemes.length > 0 && (
        <section className="space-y-4" aria-label="Voice Suggested Schemes">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className={`text-lg sm:text-xl font-extrabold text-primary flex items-center gap-2 ${getFontClass()}`}>
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>
                  {pick(
                    `Saathi’s Likely-Eligible Suggestions (${session.recommendedSchemes.length})`,
                    `సాథీ సూచించిన అర్హత ఉండే అవకాశం ఉన్న పథకాలు (${session.recommendedSchemes.length})`,
                    `साथी द्वारा सुझाई गई संभावित पात्र योजनाएं (${session.recommendedSchemes.length})`
                  )}
                </span>
              </h2>
              <p className={`text-xs sm:text-sm text-muted ${getFontClass()}`}>
                {pick(
                  'Say "Pick #1 and proceed" in the call or tap Pick & Proceed below to save to your tracker and open exact steps.',
                  'కాల్‌లో "మొదటి పథకం" అని చెప్పండి లేదా క్రింది బటన్ నొక్కి దరఖాస్తు విధానం తెరవండి.',
                  'कॉल में "पहली योजना" बोलें या नीचे चुनें और आगे बढ़ें पर टैप करें।'
                )}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmedProfile(session.profile);
                if (session.assessment) setAssessment(session.assessment);
                navigate(ROUTES.RESULTS);
              }}
              className={`min-h-[44px] shrink-0 ${getFontClass()}`}
            >
              {pick('Open Full Results Breakdown', 'పూర్తి ఫలితాలు చూడండి', 'पूरे परिणाम देखें')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {session.recommendedSchemes.map((item, idx) => {
              const isSelected = session.selectedSchemeId === item.scheme_id;
              return (
                <Card
                  key={item.scheme_id}
                  className={`border-2 transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-md'
                      : 'border-border bg-white'
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                        #{idx + 1} •{' '}
                        {pick(
                          'Likely Eligible',
                          'అర్హత ఉండే అవకాశం ఉంది',
                          'संभावित पात्र'
                        )}
                      </Badge>
                      <span className="text-xs font-mono text-muted">{item.scheme_code}</span>
                    </div>

                    <h3 className={`text-base sm:text-lg font-bold text-primary ${getFontClass()}`}>
                      {pick(item.name_en, item.name_te, item.name_hi)}
                    </h3>
                    <p className={`text-xs sm:text-sm text-body ${getFontClass()}`}>
                      {pick(
                        item.benefit_summary_en,
                        item.benefit_summary_te,
                        item.benefit_summary_hi
                      )}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleProceedWithScheme(item)}
                        className={`min-h-[44px] flex-1 bg-primary hover:bg-primary/90 text-white font-bold ${getFontClass()}`}
                      >
                        {pick('Pick & Proceed', 'ఎంచుకుని ముందుకు వెళ్ళండి', 'चुनें और आगे बढ़ें')}
                        <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Missing-Scheme Escalation Prompt if Zero Likely Matches */}
      {session.suggestWelfareGapRequest && (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className={`text-base sm:text-lg font-bold text-amber-950 flex items-center gap-2 ${getFontClass()}`}>
                <Megaphone className="h-5 w-5 text-amber-700 shrink-0" aria-hidden="true" />
                <span>
                  {pick(
                    'No Proper Scheme Suggested for Your Situation?',
                    'మీ పరిస్థితికి తగిన పథకం కనిపించలేదా?',
                    'क्या आपकी स्थिति के लिए कोई उपयुक्त योजना नहीं मिली?'
                  )}
                </span>
              </h2>
              <p className={`text-xs sm:text-sm text-amber-900 ${getFontClass()}`}>
                {pick(
                  'Raise a Missing-Scheme Welfare Gap Request. Once validated with 10+ local votes, ClaimSaathi generates an official AP Collectorate / 1902 & NGO escalation dossier.',
                  'కొత్త పథకం కోసం అభ్యర్థన పెట్టండి. 10+ ఓట్లు రాగానే ప్రభుత్వ (1902 / కలెక్టరేట్) & NGO ఎస్కలేషన్ నివేదిక సిద్ధమవుతుంది.',
                  'नई योजना के लिए अनुरोध दर्ज करें। 10+ वोट मिलने पर सरकारी (1902 / कलेक्टरेट) और NGO एस्केलेशन रिपोर्ट तैयार हो जाएगी।'
                )}
              </p>
            </div>
            <Button
              onClick={() => {
                setConfirmedProfile(session.profile);
                navigate(`${ROUTES.COMMUNITY}?tab=proposals&raise=1`);
              }}
              className={`min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 ${getFontClass()}`}
            >
              {pick('Request New Scheme', 'కొత్త పథకం కోరండి', 'नई योजना का अनुरोध करें')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
