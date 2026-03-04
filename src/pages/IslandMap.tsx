import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CHARACTER_INFO, CharacterSVG, type CharacterId } from '@/components/characters/CharacterSVG';
import { motion } from 'framer-motion';
import { Coins, Gamepad2, TreePine, LayoutDashboard } from 'lucide-react';
import IslandMapScene from '@/components/map/IslandMapScene';

const IslandMap = () => {
  const { childProfile, signOut } = useAuth();
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

  const getChapterStatus = (chapterNum: number): 'unlocked' | 'completed' | 'locked' => {
    const cp = progress?.find(p => p.chapter_number === chapterNum);
    if (cp?.completed) return 'completed';
    if (chapterNum <= (childProfile?.current_chapter || 1)) return 'unlocked';
    return 'locked';
  };

  const handleChapterClick = (index: number) => {
    const status = getChapterStatus(index + 1);
    if (status !== 'locked') {
      navigate(`/chapter/${index + 1}`);
    }
  };

  const charId = (childProfile?.character_id || 'bence') as CharacterId;
  const charInfo = CHARACTER_INFO[charId];

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Full-screen 2.5D island scene */}
      <IslandMapScene
        getChapterStatus={getChapterStatus}
        onChapterClick={handleChapterClick}
      />

      {/* Header bar — HTML overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Character card */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div
              className="rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                background: `rgba(255,255,255,0.15)`,
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              <CharacterSVG characterId={charId} size={34} />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm sm:text-base text-white font-bold leading-none">
                {childProfile?.character_name || charInfo.name}
              </p>
              <p className="text-white/60 text-xs leading-none mt-0.5">{charInfo.piece}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Coins className="w-3 h-3 text-yellow-300" />
                <span className="font-bold text-xs text-yellow-200">
                  {childProfile?.aranytaller || 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Navigation buttons */}
          <motion.div
            className="flex gap-1.5 sm:gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <button
              onClick={() => navigate('/games')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl font-display text-xs sm:text-sm text-white font-semibold transition-all duration-150 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Játékok</span>
            </button>
            <button
              onClick={() => navigate('/my-island')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl font-display text-xs sm:text-sm text-white font-semibold transition-all duration-150 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              <TreePine className="w-4 h-4" />
              <span className="hidden sm:inline">Szigetem</span>
            </button>
            <button
              onClick={() => navigate('/parent')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl font-display text-xs sm:text-sm text-white font-semibold transition-all duration-150 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Szülő</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Logout button */}
      <motion.button
        onClick={signOut}
        className="absolute bottom-4 right-4 text-xs z-30 px-3 py-1.5 rounded-full font-body transition-all duration-150 hover:scale-105 active:scale-95"
        style={{
          color: 'rgba(220,235,255,0.75)',
          background: 'rgba(0,0,0,0.28)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Kijelentkezés
      </motion.button>
    </div>
  );
};

export default IslandMap;
