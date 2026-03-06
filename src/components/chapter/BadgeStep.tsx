import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CHARACTER_INFO } from '@/components/characters/CharacterSVG';

interface BadgeStepProps {
  characterId: string;
  quizScore: number;
  chapterComplete: boolean;
  onComplete: () => void;
  onNavigateMap: () => void;
  onNavigateMyIsland: () => void;
}

export const BadgeStep: React.FC<BadgeStepProps> = ({
  characterId,
  quizScore,
  chapterComplete,
  onComplete,
  onNavigateMap,
  onNavigateMyIsland,
}) => {
  const info = CHARACTER_INFO[characterId as keyof typeof CHARACTER_INFO];
  return (
    <div className="text-center space-y-6">
      {!chapterComplete ? (
        <>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: 2 }}>
            <Star className="w-24 h-24 mx-auto text-amber-400 fill-current" />
          </motion.div>
          <h2 className="text-3xl font-display text-white">Szuper munka! 🎉</h2>
          <p className="text-lg text-white/90">
            Összegyűjtöttél <span className="font-bold text-amber-400">{quizScore + 10}</span> Aranytallért!
          </p>
          <Button
            onClick={onComplete}
            className="child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-2xl px-12"
          >
            ⭐ Megszereztem a csillagot!
          </Button>
        </>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', duration: 1 }}
          >
            <Star className="w-32 h-32 mx-auto text-amber-400 fill-current" />
          </motion.div>
          <h2 className="text-3xl font-display text-white">
            {info.name} csillaga a tiéd! ⭐
          </h2>
          <p className="text-lg text-white/80">
            Összegyűjtöttél{' '}
            <span className="font-bold text-amber-400">{quizScore + 10}</span>{' '}
            Aranytallért!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onNavigateMyIsland}
              className="child-button bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 text-lg"
            >
              🏝️ Szigetem
            </Button>
            <Button
              onClick={onNavigateMap}
              className="child-button bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 text-lg"
            >
              🗺️ Térkép
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
