import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from './queryKeys';
import { toast } from 'sonner';

export const useIslandInventoryQuery = (profileId?: string) => {
  return useQuery({
    queryKey: queryKeys.islandInventory(profileId),
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from('island_inventory')
        .select('*')
        .eq('child_profile_id', profileId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId,
  });
};

interface PlaceItemParams {
  profileId: string;
  itemType: string;
  itemName: string;
  gridX: number;
  gridY: number;
  price: number;
}

export const usePlaceItem = () => {
  const queryClient = useQueryClient();
  const { refreshChildProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ profileId, itemType, itemName, gridX, gridY, price }: PlaceItemParams) => {
      const { error: insertError } = await supabase.from('island_inventory').insert({
        child_profile_id: profileId,
        item_type: itemType,
        item_name: itemName,
        grid_x: gridX,
        grid_y: gridY,
      });
      if (insertError) throw insertError;

      const { error: rpcError } = await (supabase.rpc as any)('adjust_aranytaller', {
        profile_id: profileId,
        delta: -price,
      });
      if (rpcError) throw rpcError;
    },
    onSuccess: async () => {
      await refreshChildProfile();
      queryClient.invalidateQueries({ queryKey: ['island-inventory'] });
      toast.success('Elhelyezve!');
    },
    onError: () => {
      toast.error('Hiba történt az elhelyezés során!');
    },
  });
};
