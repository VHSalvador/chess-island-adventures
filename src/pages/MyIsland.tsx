import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, ShoppingBag, TreePine, Home, Flower2, X } from 'lucide-react';
import { toast } from 'sonner';

const GRID_SIZE = 6;

const shopCategories = [
  { id: 'tree', label: 'Fák', icon: TreePine },
  { id: 'building', label: 'Épületek', icon: Home },
  { id: 'decoration', label: 'Díszek', icon: Flower2 },
];

const MyIsland = () => {
  const { childProfile, refreshChildProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showShop, setShowShop] = useState(false);
  const [activeCategory, setActiveCategory] = useState('tree');
  const [placingItem, setPlacingItem] = useState<{ item_type: string; item_name: string; emoji: string } | null>(null);
  const [draggingOver, setDraggingOver] = useState<{ x: number; y: number } | null>(null);

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

  const buyItem = async (item: any) => {
    if (!childProfile) return;
    if ((childProfile.aranytaller || 0) < item.price) {
      toast.error('Nincs elég Aranytallérод!');
      return;
    }
    setPlacingItem({ item_type: item.item_type, item_name: item.item_name, emoji: item.emoji });
    setShowShop(false);
    toast.info('Koppints egy üres mezőre!');
  };

  const placeItem = async (x: number, y: number) => {
    if (!placingItem || !childProfile) return;
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
    setDraggingOver(null);
    await refreshChildProfile();
    queryClient.invalidateQueries({ queryKey: ['island-inventory'] });
    toast.success(`${placingItem.emoji} Elhelyezve!`);
  };

  const filteredItems = shopItems?.filter(item => {
    if (activeCategory === 'tree') return item.item_type === 'tree' || item.item_type === 'nature';
    if (activeCategory === 'building') return item.item_type === 'building' || item.item_type === 'structure';
    return item.item_type === 'decoration' || item.item_type === 'flower' || !['tree', 'nature', 'building', 'structure'].includes(item.item_type);
  }) || shopItems;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-island-sky via-island-sky to-island-water" />
      
      {/* Water */}
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(to top, hsl(var(--island-water-deep)), hsl(var(--island-water)))' }} />

      <div className="relative z-10 p-3 sm:p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="font-display rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
            </Button>
            <h1 className="text-xl sm:text-2xl font-display text-foreground">Az én szigetem</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="isometric-card px-3 py-1.5 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-accent" />
              <span className="font-bold text-sm text-card-foreground">{childProfile?.aranytaller || 0}</span>
            </div>
            <Button onClick={() => setShowShop(!showShop)} className="child-button bg-accent text-accent-foreground py-2 px-4 text-base">
              <ShoppingBag className="w-4 h-4 mr-1" /> Bolt
            </Button>
          </div>
        </div>

        {/* Placing indicator */}
        <AnimatePresence>
          {placingItem && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="bg-accent/20 border-2 border-accent rounded-2xl p-3 text-center mb-3 backdrop-blur-sm"
            >
              <p className="font-display text-foreground text-sm">
                {placingItem.emoji} Koppints egy üres mezőre a {placingItem.item_name} elhelyezéséhez!
              </p>
              <Button variant="ghost" size="sm" onClick={() => { setPlacingItem(null); setDraggingOver(null); }} className="mt-1 text-xs">Mégse</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Island terrain container */}
        <div className="relative mx-auto mb-4">
          {/* Island shape background */}
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-island-sand/50"
            style={{ background: `linear-gradient(135deg, hsl(var(--island-grass-light)), hsl(var(--island-grass)))` }}
          >
            {/* Sand border effect */}
            <div className="absolute inset-0 rounded-[2rem]" style={{
              boxShadow: 'inset 0 0 30px hsl(var(--island-sand) / 0.4)',
            }} />

            {/* Grid */}
            <div className="p-3 sm:p-4">
              <div className="inline-grid gap-1.5 w-full" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  const item = inventory?.find(inv => inv.grid_x === x && inv.grid_y === y);
                  const shopItem = item ? shopItems?.find(s => s.item_name === item.item_name) : null;
                  const isHovered = draggingOver?.x === x && draggingOver?.y === y;

                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => placingItem && placeItem(x, y)}
                      onPointerEnter={() => placingItem && setDraggingOver({ x, y })}
                      onPointerLeave={() => setDraggingOver(null)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-2xl sm:text-3xl transition-all relative ${
                        item
                          ? 'bg-island-grass-light/40 border-2 border-island-grass/50 shadow-inner'
                          : placingItem
                            ? `border-2 border-dashed cursor-pointer ${isHovered ? 'bg-accent/30 border-accent scale-105' : 'bg-card/30 border-island-sand hover:bg-accent/15'}`
                            : 'bg-island-grass-light/15 border border-island-grass/20'
                      }`}
                    >
                      {shopItem && (
                        <motion.span
                          initial={{ scale: 0, y: 10 }}
                          animate={{ scale: 1, y: 0 }}
                          className="drop-shadow-md"
                        >
                          {shopItem.emoji}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Shop panel */}
        <AnimatePresence>
          {showShop && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="isometric-card p-4 sm:p-6 relative"
            >
              <button onClick={() => setShowShop(false)} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <h2 className="font-display text-lg text-card-foreground mb-3">Bolt</h2>

              {/* Category tabs */}
              <div className="flex gap-2 mb-4">
                {shopCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-display transition-all ${
                      activeCategory === cat.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(filteredItems || shopItems)?.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => buyItem(item)}
                    disabled={(childProfile?.aranytaller || 0) < item.price}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                      (childProfile?.aranytaller || 0) >= item.price
                        ? 'border-border bg-card hover:shadow-lg hover:border-accent'
                        : 'border-border bg-muted/50 opacity-45 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-3xl mb-1 drop-shadow-sm">{item.emoji}</div>
                    <p className="font-display text-xs sm:text-sm text-card-foreground">{item.item_name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</p>
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <Coins className="w-3 h-3 text-accent" />
                      <span className="font-bold text-xs text-card-foreground">{item.price}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyIsland;
