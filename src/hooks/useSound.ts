import { useCallback, useRef } from 'react';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = (): AudioContext => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctxRef.current;
  };

  const playHarmonic = useCallback((
    ctx: AudioContext,
    freq: number,
    volume: number,
    decaySeconds: number,
    startTime: number
  ): void => {
    const harmonics: [number, number][] = [
      [freq, volume],
      [freq * 2, volume * 0.4],
      [freq * 3, volume * 0.15],
    ];

    for (const [f, v] of harmonics) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(v, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + decaySeconds);
      osc.start(startTime);
      osc.stop(startTime + decaySeconds + 0.01);
    }
  }, []);

  const playClick = useCallback(() => {
    try {
      const ctx = getCtx();
      playHarmonic(ctx, 880, 0.15, 0.06, ctx.currentTime);
    } catch {}
  }, [playHarmonic]);

  const playCorrect = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const notes = [523, 659, 784];
      notes.forEach((freq, i) => {
        playHarmonic(ctx, freq, 0.28, 0.5, now + i * 0.12);
      });
    } catch {}
  }, [playHarmonic]);

  const playWrong = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      playHarmonic(ctx, 220, 0.22, 0.35, now);
      playHarmonic(ctx, 196, 0.22, 0.35, now + 0.08);
    } catch {}
  }, [playHarmonic]);

  const playBadge = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((freq, i) => {
        playHarmonic(ctx, freq, 0.25, 0.9, now + i * 0.11);
      });
    } catch {}
  }, [playHarmonic]);

  const playSuccess = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const notes = [523, 659, 784];
      notes.forEach((freq) => {
        playHarmonic(ctx, freq, 0.2, 0.8, now);
      });
    } catch {}
  }, [playHarmonic]);

  return { playClick, playCorrect, playWrong, playBadge, playSuccess };
}
