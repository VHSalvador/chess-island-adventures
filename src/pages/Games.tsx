import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Swords, Castle, Target, Crown } from 'lucide-react';
import { useSound } from '@/hooks/useSound';

interface GameMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requiredChapter: number;
  emoji: string;
}

const gameModes: GameMode[] = [
  { id: 'pawn-war', title: 'Gyalogháború', description: 'Csak gyalogokkal! Ki éri el előbb a túlsó oldalt?', icon: <Swords className="w-8 h-8" />, requiredChapter: 1, emoji: '⚔️' },
  { id: 'capture-castle', title: 'Kastélyfoglalás', description: 'Üsd ki az ellenfél figuráit!', icon: <Castle className="w-8 h-8" />, requiredChapter: 2, emoji: '🏰' },
  { id: 'piece-collect', title: 'Csillaggyűjtés', description: 'Mozgasd a figurát és gyűjtsd össze a csillagokat!', icon: <Target className="w-8 h-8" />, requiredChapter: 3, emoji: '⭐' },
  { id: 'full-game', title: 'Teljes Sakkjátszma', description: 'Játssz teljes sakkot az AI ellen!', icon: <Crown className="w-8 h-8" />, requiredChapter: 7, emoji: '👑' },
];

const Games = () => {
  const { childProfile } = useAuth();
  const navigate = useNavigate();
  const { playClick } = useSound();
  const currentChapter = childProfile?.current_chapter || 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1b4b] via-[#1a3a6b] to-[#2d6eb5] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playClick(); navigate('/map'); }}
            className="font-display text-white hover:text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
          </Button>
          <h1 className="text-3xl font-display text-white">🎮 Játékok</h1>
        </div>

        <div className="grid gap-4">
          {gameModes.map((game) => {
            const unlocked = currentChapter >= game.requiredChapter;
            return (
              <motion.div
                key={game.id}
                whileHover={unlocked ? { scale: 1.04 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
              >
                <button
                  onClick={() => { if (unlocked) { playClick(); navigate(`/game/${game.id}`); } }}
                  disabled={!unlocked}
                  className={`w-full p-6 rounded-2xl text-left flex items-center gap-4 transition-all border ${
                    unlocked
                      ? 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 hover:border-amber-400/60'
                      : 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-4xl">{game.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-white flex items-center gap-2">
                      {game.title}
                      {!unlocked && <Lock className="w-4 h-4 text-white/50" />}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">{game.description}</p>
                    {!unlocked && (
                      <span className="inline-block mt-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-0.5">
                        🔒 {game.requiredChapter > 6 ? 'Fejezd be mind a 6 fejezetet!' : `${game.requiredChapter}. fejezet szükséges`}
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Games;
