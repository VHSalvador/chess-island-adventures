import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, ShoppingBag, TreePine, Home, Flower2, X } from 'lucide-react';
import { toast } from 'sonner';
import SceneSetup from '@/components/3d/SceneSetup';
import SandboxIsland from '@/components/3d/SandboxIsland';
import GridOverlay from '@/components/3d/GridOverlay';
import PlacedItem3D from '@/components/3d/PlacedItem3D';

const GRID_SIZE = 6;
const CELL_SIZE = 1.4;

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

  const occupiedCells = useMemo(() => {
    const set = new Set<string>();
    inventory?.forEach(item => set.add(`${item.grid_x}-${item.grid_y}`));
    return set;
  }, [inventory]);

  const buyItem = async (item: any) => {
    if (!childProfile) return;
    if ((childProfile.aranytaller || 0) < item.price) {
      toast.error('Nincs elég Aranytallérод!');
      return;
    }
    setPlacingItem({ item_type: item.item_type, item_name: item.item_name, emoji: item.emoji });
    setShowShop(false);
    toast.info('Koppints egy üres mezőre a 3D szigeten!');
  };

  const placeItem = async (x: number, y: number) => {
    if (!placingItem || !childProfile) return;
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

  const filteredItems = shopItems?.filter(item => {
    if (activeCategory === 'tree') return item.item_type === 'tree' || item.item_type === 'nature';
    if (activeCategory === 'building') return item.item_type === 'building' || item.item_type === 'structure';
    return item.item_type === 'decoration' || item.item_type === 'flower' || !['tree', 'nature', 'building', 'structure'].includes(item.item_type);
  }) || shopItems;

  // Convert grid coords to 3D world position
  const gridTo3D = (gx: number, gy: number): [number, number, number] => {
    const offset = (GRID_SIZE * CELL_SIZE) / 2 - CELL_SIZE / 2;
    return [gx * CELL_SIZE - offset, 0.25, gy * CELL_SIZE - offset];
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <SceneSetup>
          <SandboxIsland />

          <GridOverlay
            gridSize={GRID_SIZE}
            cellSize={CELL_SIZE}
            onCellClick={placeItem}
            occupiedCells={occupiedCells}
            placingMode={!!placingItem}
          />

          {/* Placed items */}
          {inventory?.map((item) => (
            <PlacedItem3D
              key={item.id}
              itemType={item.item_type}
              itemName={item.item_name}
              position={gridTo3D(item.grid_x, item.grid_y)}
            />
          ))}
        </SceneSetup>
      </div>

      {/* Header — HTML overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="font-display rounded-xl bg-card/80 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
            </Button>
            <h1 className="text-xl sm:text-2xl font-display text-foreground drop-shadow-md">Az én szigetem</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="isometric-card px-3 py-1.5 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm">
              <Coins className="w-4 h-4 text-accent" />
              <span className="font-bold text-sm text-card-foreground">{childProfile?.aranytaller || 0}</span>
            </div>
            <Button onClick={() => setShowShop(!showShop)} className="child-button bg-accent text-accent-foreground py-2 px-4 text-base">
              <ShoppingBag className="w-4 h-4 mr-1" /> Bolt
            </Button>
          </div>
        </div>
      </div>

      {/* Placing indicator */}
      <AnimatePresence>
        {placingItem && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-accent/20 border-2 border-accent rounded-2xl p-3 text-center backdrop-blur-sm"
          >
            <p className="font-display text-foreground text-sm">
              {placingItem.emoji} Koppints egy üres mezőre!
            </p>
            <Button variant="ghost" size="sm" onClick={() => setPlacingItem(null)} className="mt-1 text-xs">Mégse</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop panel — HTML overlay */}
      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 z-30 max-h-[50vh] overflow-y-auto"
          >
            <div className="max-w-2xl mx-auto p-3">
              <div className="isometric-card p-4 sm:p-6 relative bg-card/95 backdrop-blur-md">
                <button onClick={() => setShowShop(false)} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
                <h2 className="font-display text-lg text-card-foreground mb-3">Bolt</h2>

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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyIsland;
