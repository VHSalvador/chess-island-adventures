import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';

export const useChapterProgressData = (profileId?: string) => {
  return useQuery({
    queryKey: queryKeys.chapterProgress(profileId),
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from('chapter_progress')
        .select('*')
        .eq('child_profile_id', profileId)
        .order('chapter_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId,
  });
};
