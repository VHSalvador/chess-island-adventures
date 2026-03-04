import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, ShoppingBag, TreePine, Home, Flower2, X } from 'lucide-react';
import { toast } from 'sonner';
import IsoGrid from '@/components/island/IsoGrid';
import IslandItemSVG from '@/components/island/IslandItemSVG';

// Pulse keyframe for placing-mode tiles
const PULSE_STYLE = `
@keyframes iso-tile-pulse {
  0%,100% { filter: brightness(1);   }
  50%      { filter: brightness(1.18); }
}
`;

let pulseInjected = false;
function injectPulseStyle() {
  if (pulseInjected) return;
  pulseInjected = true;
  const s = document.createElement('style');
  s.textContent = PULSE_STYLE;
  document.head.appendChild(s);
}

const shopCategories = [
  { id: 'tree',       label: 'Fák',      icon: TreePine },
  { id: 'building',   label: 'Épületek', icon: Home },
  { id: 'decoration', label: 'Díszek',   icon: Flower2 },
];

const MyIsland = () => {
  const { childProfile, refreshChildProfile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showShop, setShowShop]             = useState(false);
  const [activeCategory, setActiveCategory] = useState('tree');
  const [placingItem, setPlacingItem]       = useState<{ item_type: string; item_name: string } | null>(null);

  useEffect(() => { injectPulseStyle(); }, []);

  // --- Data queries ---

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
      const { data } = await supabase
        .from('island_inventory')
        .select('*')
        .eq('child_profile_id', childProfile.id);
      return data || [];
    },
    enabled: !!childProfile,
  });

  // --- Derived state ---

  const occupiedCells = useMemo(() => {
    const s = new Set<string>();
    inventory?.forEach(i => s.add(`${i.grid_x}-${i.grid_y}`));
    return s;
  }, [inventory]);

  const filteredItems = useMemo(() => {
    if (!shopItems) return [];
    return shopItems.filter(item => {
      if (activeCategory === 'tree')     return item.item_type === 'tree'     || item.item_type === 'nature';
      if (activeCategory === 'building') return item.item_type === 'building' || item.item_type === 'structure';
      return (
        item.item_type === 'decoration' ||
        item.item_type === 'flower' ||
        !['tree', 'nature', 'building', 'structure'].includes(item.item_type)
      );
    });
  }, [shopItems, activeCategory]);

  // --- Actions ---

  const buyItem = (item: NonNullable<typeof shopItems>[number]) => {
    if (!childProfile) return;
    if ((childProfile.aranytaller || 0) < item.price) {
      toast.error('Nincs elég Aranytallér!');
      return;
    }
    setPlacingItem({ item_type: item.item_type, item_name: item.item_name });
    setShowShop(false);
    toast.info('Koppints egy üres mezőre!');
  };

  const placeItem = async (x: number, y: number) => {
    if (!placingItem || !childProfile) return;
    const item = shopItems?.find(s => s.item_name === placingItem.item_name);
    if (!item) return;

    await supabase.from('island_inventory').insert({
      child_profile_id: childProfile.id,
      item_type:  placingItem.item_type,
      item_name:  placingItem.item_name,
      grid_x: x,
      grid_y: y,
    });
    await supabase
      .from('child_profiles')
      .update({ aranytaller: (childProfile.aranytaller || 0) - item.price })
      .eq('id', childProfile.id);

    setPlacingItem(null);
    await refreshChildProfile();
    queryClient.invalidateQueries({ queryKey: ['island-inventory'] });
    toast.success('Elhelyezve!');
  };

  // --- Render ---

  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0d1b4b 0%, #1a3a6b 25%, #2d6eb5 55%, #4a90d9 80%, #7ec8e3 100%)',
      }}
    >
      {/* ── Header ── */}
      <div className="relative z-30 p-3 sm:p-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/map')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-display text-sm hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Térkép</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-display text-white drop-shadow-lg">
              Az én szigetem
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Coin badge */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Coins className="w-4 h-4 text-yellow-300" />
              <span className="font-bold text-sm text-white">
                {childProfile?.aranytaller || 0}
              </span>
            </div>
            {/* Shop button */}
            <button
              onClick={() => { setShowShop(s => !s); setPlacingItem(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-display text-sm font-bold transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bolt</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Placing banner ── */}
      <AnimatePresence>
        {placingItem && (
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{    y: -16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl bg-yellow-400/20 border-2 border-yellow-400 backdrop-blur-sm"
          >
            <IslandItemSVG itemName={placingItem.item_name} size={32} />
            <p className="font-display text-white text-sm drop-shadow">
              Koppints egy üres mezőre!
            </p>
            <button
              onClick={() => setPlacingItem(null)}
              className="ml-1 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Mégse"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Island platform + grid ── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {/* Island "platform" — decorative CSS island shape */}
        <div
          style={{
            position: 'relative',
            padding: '32px 48px 48px',
            background: 'radial-gradient(ellipse 85% 75% at 50% 42%, #43a047 0%, #2e7d32 55%, #1b5e20 100%)',
            borderRadius: '60% 60% 55% 55% / 50% 50% 60% 60%',
            boxShadow: '0 8px 0 #8d6e63, 0 16px 0 #6d4c41, 0 20px 32px rgba(0,0,0,0.45)',
            border: '4px solid #a5d6a7',
          }}
        >
          {/* Sand rim at the bottom of platform */}
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left:   '8px',
              right:  '8px',
              height: '18px',
              background: 'linear-gradient(180deg, #ffe082, #ffc107)',
              borderRadius: '0 0 55% 55% / 0 0 70% 70%',
              zIndex: 0,
            }}
          />

          {/* The isometric grid, centered inside the platform */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/*
              The IsoGrid uses absolute positioning internally.
              We need to give it a positioned container whose size matches
              the grid canvas so it centers correctly.
              CANVAS_W = 432, CANVAS_H = 252
              Tiles have negative left values (left side of diamond), so we shift
              the grid right by half the horizontal spread = (GRID_N-1)*TILE_W/2 = 180px
            */}
            <div
              style={{
                position: 'relative',
                width:  '432px',
                height: '252px',
                // Compensate: the leftmost tile is at left = -180px inside IsoGrid,
                // so we shift the inner grid content right by 180px.
                // We do this by wrapping with an offset div.
              }}
            >
              <div style={{ position: 'absolute', left: '180px', top: '0' }}>
                <IsoGrid
                  occupiedCells={occupiedCells}
                  placingMode={!!placingItem}
                  onCellClick={placeItem}
                  inventory={inventory || []}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Responsive note: on small screens scroll horizontally ── */}
      {/* This is handled by the inner overflow on the grid wrapper */}

      {/* ── Shop panel ── */}
      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0,      opacity: 1 }}
            exit={{    y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="absolute bottom-0 left-0 right-0 z-50 max-h-[55vh] flex flex-col"
          >
            <div className="max-w-2xl mx-auto w-full px-3 pb-3">
              <div
                className="rounded-3xl border-2 border-white/20 overflow-hidden"
                style={{
                  background: 'rgba(15,30,80,0.92)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* Shop header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <h2 className="font-display text-lg text-white">Bolt</h2>
                  <button
                    onClick={() => setShowShop(false)}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Bezárás"
                  >
                    <X className="w-4 h-4 text-white/70" />
                  </button>
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 px-4 pb-3">
                  {shopCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-display transition-all ${
                        activeCategory === cat.id
                          ? 'bg-yellow-400 text-yellow-900 shadow-md'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <cat.icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Item grid — scrollable */}
                <div className="overflow-y-auto max-h-[34vh] px-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(filteredItems.length > 0 ? filteredItems : shopItems || []).map(item => {
                      const canAfford = (childProfile?.aranytaller || 0) >= item.price;
                      return (
                        <motion.button
                          key={item.id}
                          whileHover={canAfford ? { scale: 1.04 } : {}}
                          whileTap={canAfford  ? { scale: 0.96 } : {}}
                          onClick={() => canAfford && buyItem(item)}
                          disabled={!canAfford}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-center transition-all min-h-[80px] ${
                            canAfford
                              ? 'border-white/20 bg-white/5 hover:border-yellow-400/60 hover:bg-white/10'
                              : 'border-white/10 bg-white/[0.03] opacity-45 cursor-not-allowed'
                          }`}
                        >
                          {/* SVG preview */}
                          <div className="flex-shrink-0">
                            <IslandItemSVG itemName={item.item_name} size={48} />
                          </div>
                          <p className="font-display text-xs sm:text-sm text-white leading-tight">
                            {item.item_name}
                          </p>
                          {item.description && (
                            <p className="text-[10px] text-white/50 line-clamp-1 w-full">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-auto">
                            <Coins className="w-3 h-3 text-yellow-400" />
                            <span className="font-bold text-xs text-yellow-300">
                              {item.price}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}

                    {(filteredItems.length === 0 && !shopItems?.length) && (
                      <p className="col-span-3 text-center text-white/50 text-sm py-6 font-display">
                        Nincs elérhető tárgy ebben a kategóriában.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: make grid scrollable if viewport is too narrow ── */}
      <style>{`
        @media (max-width: 520px) {
          .iso-grid-scroll {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

export default MyIsland;
