import React, { useCallback, useRef, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((src?: string) => {
    if (!src) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = new Audio(src);
    audioRef.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return { playAudio };
}

interface AudioButtonProps {
  src?: string;
  playAudio: (src?: string) => void;
}

export const AudioButton: React.FC<AudioButtonProps> = ({ src, playAudio }) => {
  if (!src) return null;
  return (
    <button
      onClick={() => playAudio(src)}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 border border-white/30 transition-all flex-shrink-0"
      aria-label="Felolvasás"
    >
      <Volume2 className="w-5 h-5 text-white" />
    </button>
  );
};
