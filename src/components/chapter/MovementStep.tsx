import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessMovementDemo } from '@/components/ChessMovementDemo';
import { MovementPracticeBoard } from '@/components/chess/MovementPracticeBoard';
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
  const [showPractice, setShowPractice] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);

  const { boardSize, startPositions } = chapter.practiceConfig;

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-display text-center text-white">
        Hogyan lép {info.name}?
      </h2>

      {/* Story card — shown while the child watches the animated demo */}
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

      {/* Phase toggle tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowPractice(false)}
          className={`flex-1 py-2 rounded-xl text-sm font-display transition-all ${
            !showPractice
              ? 'bg-white/20 text-white border border-white/40'
              : 'bg-white/5 text-white/50 border border-white/10'
          }`}
        >
          👁 Nézd meg
        </button>
        <button
          onClick={() => setShowPractice(true)}
          className={`flex-1 py-2 rounded-xl text-sm font-display transition-all ${
            showPractice
              ? 'bg-white/20 text-white border border-white/40'
              : 'bg-white/5 text-white/50 border border-white/10'
          }`}
        >
          {practiceComplete ? '✅ Próbáld ki' : '🎮 Próbáld ki'}
        </button>
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        {!showPractice ? (
          <motion.div
            key="watch"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Animated demo board */}
            <ChessMovementDemo pieceType={chapter.movePattern} />

            {/* Rule summary */}
            <p className="text-center text-white/70 text-sm leading-relaxed px-2">
              {chapter.movementDescription}
            </p>

            {/* CTA to practice */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPractice(true)}
              className="w-full py-3 rounded-2xl font-display text-white text-base bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/30 shadow-lg"
            >
              🎮 Próbáld ki te is! →
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="practice"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <MovementPracticeBoard
              pieceType={chapter.movePattern}
              boardSize={boardSize}
              initialPos={startPositions[0]}
              onComplete={() => setPracticeComplete(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
