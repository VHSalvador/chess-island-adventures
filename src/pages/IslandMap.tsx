import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { CharacterSVG, CHARACTER_INFO, type CharacterId } from '@/components/characters/CharacterSVG';
import { Lock, Star, Coins, TreePine, Gamepad2, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const characterOrder: CharacterId[] = ['bence', 'erno', 'szonja', 'huba', 'vanda', 'balazs'];

// Map positions for each chapter zone (percentage-based)
const mapPositions = [
  { x: 15, y: 70 },  // Bence - bottom left
  { x: 75, y: 65 },  // Ernő - bottom right
  { x: 20, y: 40 },  // Szonja - middle left
  { x: 80, y: 35 },  // Huba - middle right
  { x: 30, y: 15 },  // Vanda - top left
  { x: 70, y: 10 },  // Balázs - top right
];

const IslandMap = () => {
  const { childProfile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: progress } = useQuery({
    queryKey: ['chapter-progress', childProfile?.id],
    queryFn: async () => {
      if (!childProfile) return [];
      const { data } = await supabase
        .from('chapter_progress')
        .select('*')
        .eq('child_profile_id', childProfile.id)
        .order('chapter_number');
      return data || [];
    },
    enabled: !!childProfile,
  });

  const getChapterStatus = (chapterNum: number) => {
    const cp = progress?.find(p => p.chapter_number === chapterNum);
    if (cp?.completed) return 'completed';
    if (chapterNum <= (childProfile?.current_chapter || 1)) return 'unlocked';
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-island-sky via-island-sky to-island-water relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CharacterSVG characterId={childProfile?.character_id || 'bence'} size={40} />
          <div>
            <p className="font-display text-lg text-foreground leading-tight">{childProfile?.character_name}</p>
            <div className="flex items-center gap-1 text-gold-foreground">
              <Coins className="w-4 h-4 text-accent" />
              <span className="font-bold text-sm">{childProfile?.aranytaller || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/games')} className="rounded-xl font-display">
            <Gamepad2 className="w-4 h-4 mr-1" /> Játékok
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/my-island')} className="rounded-xl font-display">
            <TreePine className="w-4 h-4 mr-1" /> Szigetem
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/parent')} className="rounded-xl font-display">
            <LayoutDashboard className="w-4 h-4 mr-1" /> Szülő
          </Button>
        </div>
      </div>

      {/* Island */}
      <div className="relative w-full h-screen">
        {/* Island shape */}
        <div className="absolute inset-x-[5%] top-[8%] bottom-[5%]">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <ellipse cx="50" cy="55" rx="48" ry="42" fill="hsl(var(--island-grass))" opacity="0.3" />
            <ellipse cx="50" cy="55" rx="45" ry="40" fill="hsl(var(--island-grass))" opacity="0.5" />
            <ellipse cx="50" cy="56" rx="42" ry="38" fill="hsl(var(--island-sand))" opacity="0.3" />
          </svg>
        </div>

        {/* Balance Tree in center */}
        <motion.div
          className="absolute z-10"
          style={{ left: '45%', top: '42%' }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="text-5xl">🌳</div>
          <p className="text-xs font-display text-foreground text-center mt-1">Egyensúly Fája</p>
        </motion.div>

        {/* Character zones */}
        {characterOrder.map((charId, index) => {
          const pos = mapPositions[index];
          const status = getChapterStatus(index + 1);
          const info = CHARACTER_INFO[charId];

          return (
            <motion.button
              key={charId}
              className="absolute z-10 flex flex-col items-center"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              whileHover={status !== 'locked' ? { scale: 1.1 } : {}}
              whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
              onClick={() => {
                if (status !== 'locked') navigate(`/chapter/${index + 1}`);
              }}
              disabled={status === 'locked'}
            >
              <div className={`relative ${status === 'locked' ? 'opacity-40 grayscale' : ''}`}>
                <div className={status === 'unlocked' ? 'animate-breathe' : ''}>
                  <CharacterSVG characterId={charId} size={70} />
                </div>
                {status === 'completed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-accent rounded-full p-1"
                  >
                    <Star className="w-4 h-4 text-accent-foreground fill-current" />
                  </motion.div>
                )}
                {status === 'locked' && (
                  <div className="absolute -top-1 -right-1 bg-muted rounded-full p-1">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
              </div>
              <span className={`font-display text-sm mt-1 ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
                {info.name}
              </span>
              <span className={`text-xs ${status === 'locked' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                {info.piece}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Logout */}
      <button onClick={signOut} className="absolute bottom-4 right-4 text-sm text-muted-foreground hover:underline z-20">
        Kijelentkezés
      </button>
    </div>
  );
};

export default IslandMap;
