import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CHARACTER_INFO, CharacterSVG, type CharacterId } from '@/components/characters/CharacterSVG';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Gamepad2, TreePine, LayoutDashboard, Volume2, VolumeX } from 'lucide-react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { toast } from 'sonner';
import IslandMapScene from '@/components/map/IslandMapScene';
import { onboardingAudio } from '@/data/onboardingAudio';

const IslandMap = () => {
  const { childProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showMapHint, setShowMapHint] = useState(false);
  const { isPlaying: musicPlaying, toggle: toggleMusic } = useBackgroundMusic('island');

  const playAudio = useCallback((src?: string) => {
    if (!src) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = new Audio(src);
    audioRef.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!childProfile?.id) return;
    const key = `first_arrival_${childProfile.id}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      playAudio(onboardingAudio.mapFirstArrival);
    }
    const hintKey = `hint_map_tap_${childProfile.id}`;
    if (!localStorage.getItem(hintKey)) {
      const t = setTimeout(() => setShowMapHint(true), 1200);
      return () => { clearTimeout(t); audioRef.current?.pause(); };
    }
    return () => { audioRef.current?.pause(); };
  }, [childProfile?.id, playAudio]);

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

  const dismissMapHint = useCallback(() => {
    if (!childProfile?.id) return;
    localStorage.setItem(`hint_map_tap_${childProfile.id}`, '1');
    setShowMapHint(false);
  }, [childProfile?.id]);

  const handleChapterClick = (index: number) => {
    dismissMapHint();
    const chapterNum = index + 1;
    const status = getChapterStatus(chapterNum);
    if (status === 'locked') {
      toast.info('Először fejezd be az előző fejezetet!', { duration: 2500 });
      return;
    }
    navigate(`/chapter/${chapterNum}`);
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
              onClick={toggleMusic}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl font-display text-xs sm:text-sm text-white font-semibold transition-all duration-150 hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
              title={musicPlaying ? 'Zene ki' : 'Zene be'}
            >
              {musicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </motion.div>
        </div>
      </div>

      {/* T1: Map tap hint bubble */}
      <AnimatePresence>
        {showMapHint && (
          <motion.div
            className="absolute bottom-20 left-1/2 z-40 flex flex-col items-center pointer-events-none"
            style={{ transform: 'translateX(-50%)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="px-5 py-3 rounded-2xl text-center shadow-xl pointer-events-auto"
              style={{
                background: 'rgba(255,248,210,0.97)',
                border: '2px solid rgba(255,200,60,0.7)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
                maxWidth: 260,
              }}
            >
              <p className="font-display text-base text-amber-900 font-bold leading-snug">
                👆 Koppints egy helyszínre a kalandhoz!
              </p>
              <p className="font-body text-xs text-amber-700 mt-1 leading-snug">
                Az arany jelzés mutatja, hol tartasz.
              </p>
              <button
                onClick={dismissMapHint}
                className="mt-2 text-xs font-body text-amber-600 underline underline-offset-2"
              >
                Értem!
              </button>
            </div>
            {/* Tail */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '12px solid rgba(255,200,60,0.7)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-right: parent dashboard + logout */}
      <motion.div
        className="absolute bottom-4 right-4 z-30 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={() => navigate('/parent')}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-body transition-all duration-150 hover:scale-105 active:scale-95"
          style={{
            color: 'rgba(220,235,255,0.6)',
            background: 'rgba(0,0,0,0.22)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <LayoutDashboard className="w-3 h-3" />
          <span>Szülői felület</span>
        </button>
        <button
          onClick={signOut}
          className="text-xs px-3 py-1.5 rounded-full font-body transition-all duration-150 hover:scale-105 active:scale-95"
          style={{
            color: 'rgba(220,235,255,0.6)',
            background: 'rgba(0,0,0,0.22)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          Kilépés
        </button>
      </motion.div>
    </div>
  );
};

export default IslandMap;
