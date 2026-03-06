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
}

export const BadgeStep: React.FC<BadgeStepProps> = ({
  characterId,
  quizScore,
  chapterComplete,
  onComplete,
  onNavigateMap,
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
          <Button
            onClick={onNavigateMap}
            className="child-button bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xl"
          >
            🗺️ Vissza a térképre
          </Button>
        </>
      )}
    </div>
  );
};
