import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const GRID_SIZE = 6;

const MyIsland = () => {
  const { childProfile, refreshChildProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showShop, setShowShop] = useState(false);
  const [placingItem, setPlacingItem] = useState<{ item_type: string; item_name: string; emoji: string } | null>(null);

  const { data: shopItems } = useQuery({
    queryKey: ['shop-items'],
    queryFn: async () => {
      const { data } = await supabase.from('shop_items').select('*');
      return data || [];
    },
  });

  const { data: inventory } = useQuery({
    queryKey: ['island-inventory', childProfile?.id],
    queryFn: async () => {
      if (!childProfile) return [];
      const { data } = await supabase.from('island_inventory').select('*').eq('child_profile_id', childProfile.id);
      return data || [];
    },
    enabled: !!childProfile,
  });

  const buyItem = async (item: typeof shopItems extends (infer T)[] ? T : never) => {
    if (!childProfile) return;
    if ((childProfile.aranytaller || 0) < item.price) {
      toast.error('Nincs elég Aranytallérод!');
      return;
    }
    setPlacingItem({ item_type: item.item_type, item_name: item.item_name, emoji: item.emoji });
    setShowShop(false);
    toast.info('Kattints egy üres mezőre a szigeten!');
  };

  const placeItem = async (x: number, y: number) => {
    if (!placingItem || !childProfile) return;

    // Check if cell is occupied
    if (inventory?.some(i => i.grid_x === x && i.grid_y === y)) {
      toast.error('Ez a mező foglalt!');
      return;
    }

    const item = shopItems?.find(s => s.item_name === placingItem.item_name);
    if (!item) return;

    await supabase.from('island_inventory').insert({
      child_profile_id: childProfile.id,
      item_type: placingItem.item_type,
      item_name: placingItem.item_name,
      grid_x: x,
      grid_y: y,
    });

    await supabase.from('child_profiles').update({
      aranytaller: (childProfile.aranytaller || 0) - item.price,
    }).eq('id', childProfile.id);

    setPlacingItem(null);
    await refreshChildProfile();
    queryClient.invalidateQueries({ queryKey: ['island-inventory'] });
    toast.success(`${placingItem.emoji} Elhelyezve!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-island-sky to-island-grass p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="font-display">
              <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
            </Button>
            <h1 className="text-2xl font-display text-foreground">🏝️ Az én szigetem</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-card px-3 py-1 rounded-full border border-border">
              <Coins className="w-4 h-4 text-accent" />
              <span className="font-bold text-foreground">{childProfile?.aranytaller || 0}</span>
            </div>
            <Button onClick={() => setShowShop(!showShop)} className="child-button bg-accent text-accent-foreground py-2 px-4">
              <ShoppingBag className="w-5 h-5 mr-1" /> Bolt
            </Button>
          </div>
        </div>

        {placingItem && (
          <div className="bg-accent/20 border-2 border-accent rounded-2xl p-3 text-center mb-4">
            <p className="font-display text-foreground">
              {placingItem.emoji} Kattints egy üres mezőre a {placingItem.item_name} elhelyezéséhez!
            </p>
            <Button variant="ghost" size="sm" onClick={() => setPlacingItem(null)} className="mt-1">Mégse</Button>
          </div>
        )}

        {/* Island grid */}
        <div className="flex justify-center mb-6">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const item = inventory?.find(inv => inv.grid_x === x && inv.grid_y === y);
              const shopItem = item ? shopItems?.find(s => s.item_name === item.item_name) : null;

              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => placingItem && placeItem(x, y)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                    item
                      ? 'bg-island-grass/30 border-island-grass'
                      : placingItem
                        ? 'bg-card border-accent border-dashed cursor-pointer hover:bg-accent/10'
                        : 'bg-card/50 border-border'
                  }`}
                >
                  {shopItem?.emoji || ''}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Shop */}
        {showShop && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-card rounded-3xl border-2 border-border p-6 shadow-xl"
          >
            <h2 className="font-display text-xl text-foreground mb-4">🛒 Bolt</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {shopItems?.map((item) => (
                <button
                  key={item.id}
                  onClick={() => buyItem(item)}
                  disabled={(childProfile?.aranytaller || 0) < item.price}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    (childProfile?.aranytaller || 0) >= item.price
                      ? 'border-accent bg-card hover:shadow-md hover:scale-105'
                      : 'border-border bg-muted opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-1">{item.emoji}</div>
                  <p className="font-display text-sm text-foreground">{item.item_name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Coins className="w-3 h-3 text-accent" />
                    <span className="font-bold text-sm text-foreground">{item.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyIsland;
