import React from 'react';
import { motion } from 'framer-motion';
import { AudioButton } from './AudioButton';
import { CHARACTER_INFO } from '@/components/characters/CharacterSVG';
import type { ChapterData } from '@/data/chapters';
import type { ChapterAudio } from '@/data/chapterAudio';

interface SongStepProps {
  chapter: ChapterData;
  audio?: ChapterAudio;
  playAudio: (src?: string) => void;
}

export const SongStep: React.FC<SongStepProps> = ({ chapter, audio, playAudio }) => {
  const info = CHARACTER_INFO[chapter.characterId as keyof typeof CHARACTER_INFO];
  return (
    <div className="text-center space-y-6">
      <h2 className="text-2xl font-display text-white">🎵 {info.name} dala</h2>
      <div className="bg-black/20 rounded-2xl p-6 border border-white/20">
        <div className="flex justify-end mb-2">
          <AudioButton src={audio?.song} playAudio={playAudio} />
        </div>
        <p className="text-xl font-display text-white whitespace-pre-line">{chapter.song}</p>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-lg text-white">Csináld velem! 💃</h3>
        {chapter.songActions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3 }}
            className="bg-white/10 rounded-xl p-3 text-lg font-body text-white border border-white/20"
          >
            {i + 1}. {action}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
