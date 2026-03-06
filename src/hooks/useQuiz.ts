import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { quizQuestions, type QuizQuestion } from '@/data/quizzes';
import { useSound } from '@/hooks/useSound';
import { useSpeech } from '@/hooks/useSpeech';
import { toast } from 'sonner';
import { STEPS } from '@/components/chapter/constants';
import type { Step } from '@/components/chapter/types';

interface UseQuizResult {
  chapterQuizzes: QuizQuestion[];
  currentQuiz: QuizQuestion | undefined;
  quizIndex: number;
  quizScore: number;
  answered: boolean;
  selectedAnswer: number | null;
  quizFeedback: 'correct' | 'wrong' | null;
  handleAnswer: (optionIndex: number) => Promise<void>;
  nextQuiz: (currentStep: number, setCurrentStep: (n: number) => void) => void;
}

export function useQuiz(
  chapterNum: number,
  childProfileId: string | undefined,
  saveStep: (step: Step, quizIndex?: number) => Promise<void>,
  initialQuizIndex: number,
  onFirstCorrect?: () => void
): UseQuizResult {
  const [quizIndex, setQuizIndex] = useState(initialQuizIndex);
  const [quizScore, setQuizScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const { playCorrect, playWrong } = useSound();
  const { praiseCorrect } = useSpeech();

  const chapterQuizzes = quizQuestions.filter(q => q.chapterNumber === chapterNum);
  const currentQuiz = chapterQuizzes[quizIndex];

  const handleAnswer = useCallback(
    async (optionIndex: number) => {
      if (answered || !currentQuiz) return;
      setAnswered(true);
      setSelectedAnswer(optionIndex);
      const correct = optionIndex === currentQuiz.correctIndex;

      if (correct) {
        playCorrect();
        praiseCorrect();
        setQuizFeedback('correct');
        setQuizScore(prev => prev + currentQuiz.reward);
        toast.success(`Helyes! +${currentQuiz.reward} Aranytallér!`);
        onFirstCorrect?.();
      } else {
        playWrong();
        setQuizFeedback('wrong');
        toast.error('Nem jó, de ne add fel!');
      }

      if (childProfileId) {
        await supabase.from('quiz_results').insert({
          child_profile_id: childProfileId,
          chapter_number: chapterNum,
          quiz_type: currentQuiz.type,
          question: currentQuiz.question,
          answer: currentQuiz.options[optionIndex],
          correct,
          aranytaller_earned: correct ? currentQuiz.reward : 0,
        });
      }

      if (quizIndex < chapterQuizzes.length - 1) {
        void saveStep('practice', quizIndex + 1);
      } else {
        void saveStep('song', 0);
      }
    },
    [answered, currentQuiz, childProfileId, chapterNum, quizIndex, chapterQuizzes.length, saveStep, playCorrect, playWrong, praiseCorrect, onFirstCorrect]
  );

  const nextQuiz = useCallback(
    (currentStep: number, setCurrentStep: (n: number) => void) => {
      setQuizFeedback(null);
      if (quizIndex < chapterQuizzes.length - 1) {
        const nextQIdx = quizIndex + 1;
        setQuizIndex(nextQIdx);
        setAnswered(false);
        setSelectedAnswer(null);
        void saveStep('practice', nextQIdx);
      } else {
        const nextIndex = currentStep + 1;
        setCurrentStep(nextIndex);
        void saveStep(STEPS[nextIndex]);
      }
    },
    [quizIndex, chapterQuizzes.length, saveStep]
  );

  return {
    chapterQuizzes,
    currentQuiz,
    quizIndex,
    quizScore,
    answered,
    selectedAnswer,
    quizFeedback,
    handleAnswer,
    nextQuiz,
  };
}
