import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import type { CharacterId } from '@/components/characters/CharacterSVG';

interface ChapterMarkerProps {
  characterId: CharacterId;
  characterName: string;
  color: string;
  status: 'unlocked' | 'completed' | 'locked';
  position: { left: string; top: string };
  onClick: () => void;
  animationDelay?: number;
}

const ChapterMarker: React.FC<ChapterMarkerProps> = ({
  characterId,
  characterName,
  color,
  status,
  position,
  onClick,
  animationDelay = 0,
}) => {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const canInteract = !isLocked;

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        left: position.left,
        top: position.top,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: animationDelay,
      }}
    >
      {/* Outer glow ring for completed */}
      {isCompleted && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 88,
            height: 88,
            top: -8,
            left: -8,
            background: 'radial-gradient(circle, rgba(255,215,0,0.35) 0%, rgba(255,215,0,0) 70%)',
            border: '2px solid rgba(255,215,0,0.6)',
            boxShadow: '0 0 16px 4px rgba(255,200,0,0.4)',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Platform circle */}
      <motion.button
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 72,
          height: 72,
          background: isLocked
            ? 'rgba(80,80,90,0.55)'
            : `radial-gradient(circle at 35% 30%, ${color}ee, ${color}99)`,
          border: isLocked
            ? '3px solid rgba(150,150,160,0.4)'
            : isCompleted
            ? '4px solid rgba(255,215,0,0.9)'
            : `4px solid ${color}`,
          boxShadow: isLocked
            ? 'none'
            : isCompleted
            ? `0 0 18px rgba(255,215,0,0.5), 0 4px 16px rgba(0,0,0,0.4)`
            : `0 0 12px ${color}66, 0 4px 12px rgba(0,0,0,0.35)`,
          cursor: canInteract ? 'pointer' : 'default',
          filter: isLocked ? 'grayscale(0.8) brightness(0.7)' : 'none',
          flexShrink: 0,
        }}
        onClick={canInteract ? onClick : undefined}
        whileHover={canInteract ? { scale: 1.12 } : {}}
        whileTap={canInteract ? { scale: 0.95 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        aria-label={characterName}
        aria-disabled={isLocked}
      >
        {/* Character SVG */}
        <div
          style={{
            filter: isLocked ? 'grayscale(1) brightness(0.6)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          <CharacterSVG characterId={characterId} size={48} />
        </div>

        {/* Lock icon overlay */}
        {isLocked && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          >
            <Lock
              style={{ width: 20, height: 20, color: 'rgba(220,220,230,0.85)' }}
            />
          </div>
        )}
      </motion.button>

      {/* Gold star badge — completed only */}
      {isCompleted && (
        <motion.div
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            top: -4,
            right: -4,
            background: 'linear-gradient(135deg, #ffe066, #ffa500)',
            border: '2px solid #fff8',
            boxShadow: '0 2px 6px rgba(255,160,0,0.6)',
            zIndex: 20,
          }}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: animationDelay + 0.3 }}
        >
          <Star style={{ width: 12, height: 12, color: '#7a4000', fill: '#7a4000' }} />
        </motion.div>
      )}

      {/* Name badge */}
      <motion.div
        className="mt-2 px-2 py-0.5 rounded-full font-display text-white text-center whitespace-nowrap"
        style={{
          fontSize: 11,
          fontWeight: 700,
          background: isLocked ? 'rgba(100,100,110,0.65)' : `${color}cc`,
          border: isLocked ? '1px solid rgba(160,160,170,0.3)' : `1px solid ${color}88`,
          boxShadow: isLocked ? 'none' : `0 2px 8px ${color}44`,
          backdropFilter: 'blur(4px)',
          maxWidth: 90,
          lineHeight: 1.3,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: animationDelay + 0.15 }}
      >
        {characterName}
      </motion.div>
    </motion.div>
  );
};

export default ChapterMarker;
