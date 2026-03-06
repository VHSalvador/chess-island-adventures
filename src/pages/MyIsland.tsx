import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, ShoppingBag, TreePine, Home, Flower2, X } from 'lucide-react';
import { toast } from 'sonner';
import HexGrid from '@/components/island/HexGrid';
import IslandItemSVG from '@/components/island/IslandItemSVG';
import { useShopItems } from '@/hooks/data/useShopItems';
import { useIslandInventoryQuery, usePlaceItem } from '@/hooks/data/useIslandInventory';
import { onboardingAudio } from '@/data/onboardingAudio';

const shopCategories = [
  { id: 'tree',       label: 'Fák',      icon: TreePine },
  { id: 'building',   label: 'Épületek', icon: Home },
  { id: 'decoration', label: 'Díszek',   icon: Flower2 },
];

const MyIsland = () => {
  const { childProfile } = useAuth();
  const navigate = useNavigate();

  const [showShop, setShowShop]             = useState(false);
  const [activeCategory, setActiveCategory] = useState('tree');
  const [placingItem, setPlacingItem]       = useState<{ item_type: string; item_name: string } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [shopHintVisible, setShopHintVisible] = useState(false);
  const [placeHintVisible, setPlaceHintVisible] = useState(false);

  const playAudio = useCallback((src?: string) => {
    if (!src) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    audioRef.current = new Audio(src);
    audioRef.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!childProfile?.id) return;
    const key = `hint_island_shop_${childProfile.id}`;
    if (!localStorage.getItem(key)) {
      setShopHintVisible(true);
      playAudio(onboardingAudio.hints.islandFirstVisit);
    }
    return () => { audioRef.current?.pause(); };
  }, [childProfile?.id, playAudio]);

  useEffect(() => {
    if (!placingItem || !childProfile?.id) return;
    const key = `hint_island_place_${childProfile.id}`;
    if (!localStorage.getItem(key)) {
      setPlaceHintVisible(true);
      playAudio(onboardingAudio.hints.islandPlaceItem);
    }
  }, [placingItem, childProfile?.id, playAudio]);

  const { data: shopItems } = useShopItems();
  const { data: inventory } = useIslandInventoryQuery(childProfile?.id);
  const placeItemMutation = usePlaceItem();

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
    setShopHintVisible(false);
    toast.info('Koppints egy üres mezőre!');
  };

  const placeItem = (x: number, y: number) => {
    if (!placingItem || !childProfile) return;
    const item = shopItems?.find(s => s.item_name === placingItem.item_name);
    if (!item) return;

    placeItemMutation.mutate({
      profileId: childProfile.id,
      itemType: placingItem.item_type,
      itemName: placingItem.item_name,
      gridX: x,
      gridY: y,
      price: item.price,
    });
    if (childProfile?.id) {
      localStorage.setItem(`hint_island_place_${childProfile.id}`, '1');
    }
    setPlaceHintVisible(false);
    setPlacingItem(null);
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
              onClick={() => {
                if (childProfile?.id) {
                  localStorage.setItem(`hint_island_shop_${childProfile.id}`, '1');
                }
                setShopHintVisible(false);
                setShowShop(s => !s);
                setPlacingItem(null);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-display text-sm font-bold transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bolt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shop hint bubble */}
      <AnimatePresence>
        {shopHintVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-20 right-3 sm:right-4 z-50 max-w-[200px]"
          >
            <div className="bg-amber-400 text-amber-900 font-display text-sm rounded-2xl px-4 py-3 shadow-lg relative">
              Nyomd meg a Bolt gombot, és vásárolj az Aranytallérjeidből!
              {/* Triangle pointing up-right */}
              <div className="absolute -top-2 right-6 w-0 h-0"
                style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #FBBF24' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* ── Hex grid (floating on sky background) ── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {/* Place hint bubble */}
        <AnimatePresence>
          {placeHintVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className="bg-emerald-400 text-emerald-900 font-display text-sm rounded-2xl px-5 py-3 shadow-lg text-center whitespace-nowrap">
                Koppints egy üres mezőre!
                {/* Triangle pointing down */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #34D399' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <HexGrid
          occupiedCells={occupiedCells}
          placingMode={!!placingItem}
          onCellClick={placeItem}
          inventory={inventory || []}
        />
      </div>

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

    </div>
  );
};

export default MyIsland;
