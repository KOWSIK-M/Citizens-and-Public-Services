import { useState, useEffect, useRef } from 'react';

/**
 * Computes a live 0..1 audio energy level for the Saathi Live Call voice orb.
 * Uses Web Audio API when microphone audio is active and falls back cleanly
 * to gentle conversational cadence pulses when speaking or in restricted browsers.
 */
export function useAudioVisualizer(isListening: boolean, isAgentSpeaking: boolean): number {
  const [level, setLevel] = useState(0.12);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isListening && !isAgentSpeaking) {
      setLevel(0.1);
      return;
    }

    // Smooth cadence animation when agent is speaking (or when Web Audio mic stream isn't needed)
    if (isAgentSpeaking && !isListening) {
      let tick = 0;
      const interval = window.setInterval(() => {
        tick += 1;
        const wave = 0.38 + Math.abs(Math.sin(tick * 0.45)) * 0.48;
        setLevel(Number(wave.toFixed(2)));
      }, 110);
      return () => window.clearInterval(interval);
    }

    let cancelled = false;
    let audioCtx: AudioContext | null = null;
    let stream: MediaStream | null = null;

    const startMicMeter = async () => {
      if (
        typeof window === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof window.AudioContext === 'undefined'
      ) {
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        audioCtx = new window.AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const sampleLoop = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length / 255;
          setLevel(Math.min(1, Math.max(0.16, avg * 2.4)));
          rafRef.current = window.requestAnimationFrame(sampleLoop);
        };
        rafRef.current = window.requestAnimationFrame(sampleLoop);
      } catch {
        // Fallback gentle listening pulse if mic stream cannot be shared simultaneously
        setLevel(0.32);
      }
    };

    void startMicMeter();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (audioCtx) {
        void audioCtx.close().catch(() => undefined);
      }
    };
  }, [isListening, isAgentSpeaking]);

  return level;
}
