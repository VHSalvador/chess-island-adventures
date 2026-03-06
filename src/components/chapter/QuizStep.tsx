import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AudioButton } from './AudioButton';
import type { QuizQuestion } from '@/data/quizzes';
import type { ChapterAudio } from '@/data/chapterAudio';

interface QuizStepProps {
  currentQuiz: QuizQuestion;
  quizIndex: number;
  totalQuizzes: number;
  answered: boolean;
  selectedAnswer: number | null;
  audio?: ChapterAudio;
  playAudio: (src?: string) => void;
  onAnswer: (optionIndex: number) => void;
  onNext: () => void;
  onPlayClick: () => void;
}

export const QuizStep: React.FC<QuizStepProps> = ({
  currentQuiz,
  quizIndex,
  totalQuizzes,
  answered,
  selectedAnswer,
  audio,
  playAudio,
  onAnswer,
  onNext,
  onPlayClick,
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-display text-white">Kvíz</h2>
      <span className="text-sm text-white/60 font-medium">
        {quizIndex + 1} / {totalQuizzes}
      </span>
    </div>
    <div className="bg-black/20 rounded-2xl p-6 border border-white/20">
      <div className="flex items-start gap-3 mb-4">
        <p className="text-xl font-display text-white flex-1">{currentQuiz.question}</p>
        <AudioButton src={audio?.quiz[quizIndex]} playAudio={playAudio} />
      </div>
      <div className="space-y-3">
        {currentQuiz.options.map((option, i) => {
          let btnClass = 'w-full text-left p-4 rounded-xl border-2 text-lg font-body transition-all ';
          if (answered) {
            if (i === currentQuiz.correctIndex) btnClass += 'border-emerald-400 bg-emerald-400/30 text-white';
            else if (i === selectedAnswer) btnClass += 'border-red-400 bg-red-400/30 text-white';
            else btnClass += 'border-white/10 bg-white/5 text-white/50';
          } else {
            btnClass += 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/60';
          }
          return (
            <motion.button
              key={i}
              whileHover={!answered ? { scale: 1.02 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              onClick={() => onAnswer(i)}
              className={btnClass}
              disabled={answered}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
      {answered && (
        <Button
          onClick={() => { onPlayClick(); onNext(); }}
          className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display rounded-2xl border-0"
        >
          {quizIndex < totalQuizzes - 1 ? 'Következő kérdés ➡️' : 'Tovább a dalhoz! 🎵'}
        </Button>
      )}
    </div>
  </div>
);
