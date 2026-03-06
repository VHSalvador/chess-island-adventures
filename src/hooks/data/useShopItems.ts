import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';

export const useShopItems = () => {
  return useQuery({
    queryKey: queryKeys.shopItems(),
    queryFn: async () => {
      const { data, error } = await supabase.from('shop_items').select('*');
      if (error) throw error;
      return data || [];
    },
  });
};
