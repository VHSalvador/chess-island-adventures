import { useCallback, useEffect, useRef, useState } from 'react';

const PENTATONIC_FREQS = [261.63, 329.63, 392.00, 440.00, 523.25];
const ARPEGGIO_INTERVAL_MS = 700;
const ARPEGGIO_JITTER_MS = 150;
const FADE_IN_DURATION = 1.5;
const FADE_OUT_DURATION = 1.0;
const MASTER_VOLUME = 0.8;

const CHARACTER_SEMITONE_OFFSETS: Record<string, number> = {
  bence: 0,
  erno: 5,
  szonja: 2,
  huba: 7,
  vanda: 3,
  balazs: 9,
};

function semitoneShift(baseFreq: number, semitones: number): number {
  return baseFreq * Math.pow(2, semitones / 12);
}

function getDroneFreq(theme: 'island' | 'chapter', characterId?: string): number {
  if (theme === 'island') return 65.41;
  const semitones = characterId ? (CHARACTER_SEMITONE_OFFSETS[characterId] ?? 0) : 0;
  return semitoneShift(65.41, semitones);
}

function scheduleNote(
  ctx: AudioContext,
  master: GainNode,
  freq: number,
  volume: number,
  startTime: number
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(master);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);
  osc.start(startTime);
  osc.stop(startTime + 1.85);
}

export function useBackgroundMusic(
  theme: 'island' | 'chapter',
  characterId?: string
): { isPlaying: boolean; toggle: () => void } {
  const [isPlaying, setIsPlaying] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const droneRef = useRef<OscillatorNode | null>(null);
  const arpeggioTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arpeggioIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const fadeOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearArpeggioTimeout = () => {
    if (arpeggioTimeoutRef.current !== null) {
      clearTimeout(arpeggioTimeoutRef.current);
      arpeggioTimeoutRef.current = null;
    }
  };

  const clearFadeOutTimeout = () => {
    if (fadeOutTimeoutRef.current !== null) {
      clearTimeout(fadeOutTimeoutRef.current);
      fadeOutTimeoutRef.current = null;
    }
  };

  const startArpeggioLoop = useCallback((ctx: AudioContext, master: GainNode) => {
    if (!isPlayingRef.current) return;

    const idx = arpeggioIndexRef.current;
    const freq = PENTATONIC_FREQS[idx % PENTATONIC_FREQS.length];
    const now = ctx.currentTime;

    scheduleNote(ctx, master, freq, 0.07, now);

    if (idx % 4 === 3) {
      scheduleNote(ctx, master, freq * 2, 0.04, now);
    }

    arpeggioIndexRef.current = (idx + 1) % PENTATONIC_FREQS.length;

    const jitter = (Math.random() * 2 - 1) * ARPEGGIO_JITTER_MS;
    const nextMs = ARPEGGIO_INTERVAL_MS + jitter;

    arpeggioTimeoutRef.current = setTimeout(() => {
      startArpeggioLoop(ctx, master);
    }, nextMs);
  }, []);

  const startMusic = useCallback(() => {
    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = ctxRef.current;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.connect(ctx.destination);
      masterRef.current = master;

      const droneFreq = getDroneFreq(theme, characterId);
      const drone = ctx.createOscillator();
      drone.type = 'triangle';
      drone.frequency.value = droneFreq;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.025;
      drone.connect(droneGain);
      droneGain.connect(master);
      drone.start();
      droneRef.current = drone;

      master.gain.linearRampToValueAtTime(MASTER_VOLUME, ctx.currentTime + FADE_IN_DURATION);

      isPlayingRef.current = true;
      arpeggioIndexRef.current = 0;
      setIsPlaying(true);

      const resumeAndStart = () => {
        ctx.resume().then(() => {
          startArpeggioLoop(ctx, master);
        });
      };

      if (ctx.state === 'suspended') {
        const onUserGesture = () => {
          document.removeEventListener('click', onUserGesture);
          resumeAndStart();
        };
        document.addEventListener('click', onUserGesture, { once: true });
      } else {
        resumeAndStart();
      }
    } catch {}
  }, [theme, characterId, startArpeggioLoop]);

  const stopMusic = useCallback((onDone?: () => void) => {
    isPlayingRef.current = false;
    clearArpeggioTimeout();

    const ctx = ctxRef.current;
    const master = masterRef.current;

    if (ctx && master && ctx.state !== 'closed') {
      try {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0, now + FADE_OUT_DURATION);
      } catch {}

      fadeOutTimeoutRef.current = setTimeout(() => {
        try {
          if (droneRef.current) {
            droneRef.current.stop();
            droneRef.current.disconnect();
            droneRef.current = null;
          }
          if (masterRef.current) {
            masterRef.current.disconnect();
            masterRef.current = null;
          }
          if (ctxRef.current && ctxRef.current.state !== 'closed') {
            ctxRef.current.close();
          }
          ctxRef.current = null;
        } catch {}
        onDone?.();
      }, FADE_OUT_DURATION * 1000 + 100);
    } else {
      onDone?.();
    }

    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stopMusic();
    } else {
      startMusic();
    }
  }, [startMusic, stopMusic]);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      startMusic();
    }, 300);

    return () => {
      clearTimeout(startTimeout);
      clearArpeggioTimeout();
      clearFadeOutTimeout();
      isPlayingRef.current = false;

      const ctx = ctxRef.current;
      const master = masterRef.current;

      if (ctx && master && ctx.state !== 'closed') {
        try {
          const now = ctx.currentTime;
          master.gain.cancelScheduledValues(now);
          master.gain.setValueAtTime(master.gain.value, now);
          master.gain.linearRampToValueAtTime(0, now + FADE_OUT_DURATION);
        } catch {}

        setTimeout(() => {
          try {
            if (droneRef.current) {
              droneRef.current.stop();
              droneRef.current.disconnect();
              droneRef.current = null;
            }
            if (masterRef.current) {
              masterRef.current.disconnect();
              masterRef.current = null;
            }
            if (ctxRef.current && ctxRef.current.state !== 'closed') {
              ctxRef.current.close();
            }
            ctxRef.current = null;
          } catch {}
        }, FADE_OUT_DURATION * 1000 + 100);
      }
    };
  }, [startMusic]);

  return { isPlaying, toggle };
}
