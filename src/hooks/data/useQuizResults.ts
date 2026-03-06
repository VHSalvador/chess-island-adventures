import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';

export const useQuizResults = (profileId?: string) => {
  return useQuery({
    queryKey: queryKeys.quizResults(profileId),
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('child_profile_id', profileId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId,
  });
};
