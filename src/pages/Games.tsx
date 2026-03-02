import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Swords, Castle, Target, Crown } from 'lucide-react';

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
  const currentChapter = childProfile?.current_chapter || 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-island-sky to-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="font-display">
            <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
          </Button>
          <h1 className="text-3xl font-display text-foreground">🎮 Játékok</h1>
        </div>

        <div className="grid gap-4">
          {gameModes.map((game) => {
            const unlocked = currentChapter >= game.requiredChapter;
            return (
              <motion.div
                key={game.id}
                whileHover={unlocked ? { scale: 1.02 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
              >
                <button
                  onClick={() => unlocked && navigate(`/game/${game.id}`)}
                  disabled={!unlocked}
                  className={`w-full p-6 rounded-2xl border-3 text-left flex items-center gap-4 transition-all ${
                    unlocked
                      ? 'bg-card border-accent hover:shadow-lg border-2'
                      : 'bg-muted border-border opacity-50 cursor-not-allowed border-2'
                  }`}
                >
                  <div className="text-4xl">{game.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-foreground flex items-center gap-2">
                      {game.title}
                      {!unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{game.description}</p>
                    {!unlocked && (
                      <p className="text-xs text-muted-foreground mt-1">
                        🔒 {game.requiredChapter > 6 ? 'Fejezd be mind a 6 fejezetet!' : `Fejezd be a ${game.requiredChapter}. fejezetet!`}
                      </p>
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
