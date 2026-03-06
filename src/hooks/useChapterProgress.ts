import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { STEPS } from '@/components/chapter/constants';
import type { Step } from '@/components/chapter/types';

interface UseChapterProgressResult {
  initialStep: number;
  initialQuizIndex: number;
  loaded: boolean;
  saveStep: (stepName: Step, quizIndex?: number) => Promise<void>;
}

export function useChapterProgress(
  childProfileId: string | undefined,
  chapterNum: number
): UseChapterProgressResult {
  const [initialStep, setInitialStep] = useState(0);
  const [initialQuizIndex, setInitialQuizIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!childProfileId) {
      setLoaded(true);
      return;
    }

    let active = true;
    supabase
      .from('chapter_progress')
      .select('step, completed, quiz_index')
      .eq('child_profile_id', childProfileId)
      .eq('chapter_number', chapterNum)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active || error) {
          setLoaded(true);
          return;
        }
        if (!data || data.completed) {
          setLoaded(true);
          return;
        }
        const idx = STEPS.indexOf(data.step as Step);
        setInitialStep(idx >= 0 ? idx : 0);
        setInitialQuizIndex(Math.max(data.quiz_index ?? 0, 0));
        setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [childProfileId, chapterNum]);

  const saveStep = useCallback(
    async (stepName: Step, quizIndex = 0) => {
      if (!childProfileId) return;

      const payload: {
        child_profile_id: string;
        chapter_number: number;
        step: string;
        quiz_index: number;
      } = {
        child_profile_id: childProfileId,
        chapter_number: chapterNum,
        step: stepName,
        quiz_index: quizIndex,
      };

      const { error } = await supabase
        .from('chapter_progress')
        .upsert(payload as any, { onConflict: 'child_profile_id,chapter_number' });

      if (error) {
        console.error('Failed to save chapter progress:', error);
      }
    },
    [childProfileId, chapterNum]
  );

  return { initialStep, initialQuizIndex, loaded, saveStep };
}
