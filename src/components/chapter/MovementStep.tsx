import React from 'react';
import { motion } from 'framer-motion';
import { ChessMovementDemo } from '@/components/ChessMovementDemo';
import { AudioButton } from './AudioButton';
import { CHARACTER_INFO } from '@/components/characters/CharacterSVG';
import type { ChapterData } from '@/data/chapters';
import type { ChapterAudio } from '@/data/chapterAudio';

interface MovementStepProps {
  chapter: ChapterData;
  audio?: ChapterAudio;
  playAudio: (src?: string) => void;
}

export const MovementStep: React.FC<MovementStepProps> = ({ chapter, audio, playAudio }) => {
  const info = CHARACTER_INFO[chapter.characterId as keyof typeof CHARACTER_INFO];

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-display text-center text-white">
        Hogyan lép {info.name}?
      </h2>

      {/* Story card — shown while the child watches the piece move */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/10 backdrop-blur-sm border border-white/25 rounded-2xl p-5"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5 shrink-0">📖</span>
          <p className="text-white text-base sm:text-lg leading-relaxed font-body italic flex-1">
            {chapter.watchStoryText}
          </p>
          <AudioButton src={audio?.narrator[1]} playAudio={playAudio} />
        </div>
      </motion.div>

      {/* Animated board */}
      <ChessMovementDemo pieceType={chapter.movePattern} />

      {/* Rule summary */}
      <p className="text-center text-white/70 text-sm leading-relaxed px-2">
        {chapter.movementDescription}
      </p>
    </div>
  );
};
