import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from './queryKeys';

interface CompleteChapterParams {
  profileId: string;
  chapterNum: number;
  quizScore: number;
  currentChapter: number;
}

export const useCompleteChapter = () => {
  const queryClient = useQueryClient();
  const { refreshChildProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ profileId, chapterNum, quizScore, currentChapter }: CompleteChapterParams) => {
      await (supabase.rpc as any)('adjust_aranytaller', {
        profile_id: profileId,
        delta: quizScore + 10,
      });

      await supabase
        .from('child_profiles')
        .update({ current_chapter: Math.max(currentChapter, chapterNum + 1) })
        .eq('id', profileId);

      await supabase.from('chapter_progress').upsert(
        {
          child_profile_id: profileId,
          chapter_number: chapterNum,
          step: 'badge',
          completed: true,
          stars_earned: 1,
        },
        { onConflict: 'child_profile_id,chapter_number' }
      );

      if (chapterNum < 6) {
        await supabase.from('chapter_progress').upsert(
          {
            child_profile_id: profileId,
            chapter_number: chapterNum + 1,
            step: 'story',
          },
          { onConflict: 'child_profile_id,chapter_number' }
        );
      }
    },
    onSuccess: async () => {
      await refreshChildProfile();
      queryClient.invalidateQueries({ queryKey: queryKeys.chapterProgress() });
    },
  });
};
