import { useCallback, useRef } from 'react';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  };

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3, delay = 0) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = type;
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.05);
    } catch {}
  }, []);

  const playClick = useCallback(() => {
    playTone(440, 0.08, 'sine', 0.2);
  }, [playTone]);

  const playCorrect = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.3, 0);
    playTone(659, 0.15, 'sine', 0.3, 0.15);
    playTone(784, 0.25, 'sine', 0.3, 0.30);
  }, [playTone]);

  const playWrong = useCallback(() => {
    playTone(300, 0.1, 'sawtooth', 0.2, 0);
    playTone(250, 0.2, 'sawtooth', 0.2, 0.1);
  }, [playTone]);

  const playBadge = useCallback(() => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      playTone(freq, 0.2, 'sine', 0.3, i * 0.12);
    });
  }, [playTone]);

  const playSuccess = useCallback(() => {
    playTone(784, 0.3, 'sine', 0.25, 0);
    playTone(1047, 0.4, 'sine', 0.25, 0.15);
  }, [playTone]);

  return { playClick, playCorrect, playWrong, playBadge, playSuccess };
}
