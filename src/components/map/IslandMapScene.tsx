import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ChapterMarker from './ChapterMarker';
import HexIslandCanvas from './HexIslandCanvas';
import { CHARACTER_INFO, type CharacterId } from '@/components/characters/CharacterSVG';

const PIECE_COLORS: Record<string, string> = {
  bence: '#4CAF50',
  erno: '#8B7355',
  szonja: '#9C5FBF',
  huba: '#E8B830',
  vanda: '#E89830',
  balazs: '#5A8040',
};

const characterOrder: CharacterId[] = ['bence', 'erno', 'szonja', 'huba', 'vanda', 'balazs'];

// Kept for backward-compat exports; canvas provides real positions now
const MARKER_POSITIONS: Array<{ left: string; top: string }> = [];

interface IslandMapSceneProps {
  getChapterStatus: (chapterNum: number) => 'unlocked' | 'completed' | 'locked';
  onChapterClick: (chapterIndex: number) => void;
}

const CLOUDS = [
  {
    initialX: '-5vw',
    targetX: '108vw',
    top: '6%',
    width: 180,
    height: 70,
    duration: 38,
    delay: 0,
    opacity: 0.65,
  },
  {
    initialX: '110vw',
    targetX: '-20vw',
    top: '14%',
    width: 140,
    height: 55,
    duration: 48,
    delay: 8,
    opacity: 0.5,
  },
  {
    initialX: '30vw',
    targetX: '-25vw',
    top: '20%',
    width: 110,
    height: 44,
    duration: 55,
    delay: 20,
    opacity: 0.45,
  },
];

const CloudBlob: React.FC<{
  width: number;
  height: number;
  opacity: number;
  top: string;
  initialX: string;
  targetX: string;
  duration: number;
  delay: number;
}> = ({ width, height, opacity, top, initialX, targetX, duration, delay }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ top, opacity }}
    initial={{ x: initialX }}
    animate={{ x: targetX }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <ellipse cx={width * 0.5} cy={height * 0.65} rx={width * 0.42} ry={height * 0.32} fill="white" />
      <ellipse cx={width * 0.3} cy={height * 0.55} rx={width * 0.24} ry={height * 0.28} fill="white" />
      <ellipse cx={width * 0.68} cy={height * 0.52} rx={width * 0.2} ry={height * 0.24} fill="white" />
      <ellipse cx={width * 0.5} cy={height * 0.48} rx={width * 0.3} ry={height * 0.3} fill="white" />
    </svg>
  </motion.div>
);

const STARS = [
  { top: '3%',  left: '12%', size: 2   },
  { top: '7%',  left: '78%', size: 1.5 },
  { top: '5%',  left: '45%', size: 1.5 },
  { top: '11%', left: '22%', size: 1   },
  { top: '9%',  left: '60%', size: 2   },
  { top: '15%', left: '88%', size: 1.5 },
  { top: '4%',  left: '95%', size: 1   },
  { top: '12%', left: '35%', size: 1   },
];

const IslandMapScene: React.FC<IslandMapSceneProps> = ({ getChapterStatus, onChapterClick }) => {
  const [chapterPositions, setChapterPositions] = useState<Array<{ x: number; y: number }>>([]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #0d1b4b 0%, #1a3a6b 20%, #2d6eb5 50%, #4a90d9 75%, #a8d8f0 100%)',
      }}
    >
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {STARS.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Animated clouds */}
      {CLOUDS.map((cloud, i) => (
        <CloudBlob key={i} {...cloud} />
      ))}

      {/* Canvas island container */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: 'translate(-50%, -48%)',
          width: 'min(760px, 98vw)',
          height: 'min(580px, 85vw)',
          zIndex: 5,
          position: 'relative',
        }}
      >
        <HexIslandCanvas
          getChapterStatus={getChapterStatus}
          onChapterClick={onChapterClick}
          onChapterPositions={setChapterPositions}
        />

        {/* Water shimmer overlay — pointer-events:none so canvas clicks pass through */}
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 6, opacity: 0.18 }}
          viewBox="0 0 760 580"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M0,520 C120,505 240,535 360,520 C480,505 600,535 760,520 L760,580 L0,580 Z"
            fill="#4ab0f5"
            animate={{ x: ['0%', '-5%', '0%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M0,535 C100,520 220,548 380,535 C520,520 640,548 760,535 L760,580 L0,580 Z"
            fill="#2178cc"
            animate={{ x: ['0%', '5%', '0%'] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </motion.svg>

        {chapterPositions.length === 6 &&
          (() => {
            const primaryIndex = characterOrder.findIndex((_, i) => getChapterStatus(i + 1) === 'unlocked');
            return characterOrder.map((charId, index) => {
              const pos = chapterPositions[index];
              if (!pos) return null;
              const status = getChapterStatus(index + 1);
              const info = CHARACTER_INFO[charId];
              return (
                <ChapterMarker
                  key={charId}
                  characterId={charId}
                  characterName={info.name}
                  color={PIECE_COLORS[charId]}
                  status={status}
                  position={{ left: pos.x + 'px', top: pos.y + 'px' }}
                  onClick={() => onChapterClick(index)}
                  animationDelay={0.1 + index * 0.12}
                  isPrimary={index === primaryIndex}
                />
              );
            });
          })()}
      </div>

      {/* Bottom wave band */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
        style={{ height: '18%', zIndex: 4 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, #1e6fcc44 30%, #1a5faa88 60%, #0f3d7acc 100%)',
          }}
        />
        <motion.svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute bottom-8 left-0 w-full"
          style={{ height: 48, opacity: 0.55 }}
          animate={{ x: ['0%', '-8%', '0%'] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            d="M0,40 C180,10 360,70 540,40 C720,10 900,70 1080,40 C1260,10 1350,55 1440,40 L1440,80 L0,80 Z"
            fill="#3a8fd4"
            fillOpacity="0.5"
          />
        </motion.svg>
        <motion.svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full"
          style={{ height: 56, opacity: 0.65 }}
          animate={{ x: ['0%', '8%', '0%'] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          <path
            d="M0,30 C200,60 400,15 600,38 C800,60 1000,15 1200,38 C1320,55 1400,30 1440,38 L1440,80 L0,80 Z"
            fill="#2060b0"
            fillOpacity="0.6"
          />
        </motion.svg>
      </div>
    </div>
  );
};

export { PIECE_COLORS, MARKER_POSITIONS };
export default IslandMapScene;
