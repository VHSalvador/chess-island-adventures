import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MapPaths from './MapPaths';
import ChapterMarker from './ChapterMarker';
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

const MARKER_POSITIONS = [
  { left: '28%', top: '62%' }, // Bence
  { left: '62%', top: '68%' }, // Ernő
  { left: '18%', top: '38%' }, // Szonja
  { left: '72%', top: '42%' }, // Huba
  { left: '32%', top: '18%' }, // Vanda
  { left: '60%', top: '14%' }, // Balázs
];

interface IslandMapSceneProps {
  getChapterStatus: (chapterNum: number) => 'unlocked' | 'completed' | 'locked';
  onChapterClick: (chapterIndex: number) => void;
}

// Static cloud definitions — no Math.random() at render time
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

const IslandMapScene: React.FC<IslandMapSceneProps> = ({ getChapterStatus, onChapterClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 520, height: 400 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #0d1b4b 0%, #1a3a6b 20%, #2d6eb5 50%, #4a90d9 75%, #a8d8f0 100%)',
      }}
    >
      {/* Stars layer — top portion of sky */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {[
          { top: '3%', left: '12%', size: 2 },
          { top: '7%', left: '78%', size: 1.5 },
          { top: '5%', left: '45%', size: 1.5 },
          { top: '11%', left: '22%', size: 1 },
          { top: '9%', left: '60%', size: 2 },
          { top: '15%', left: '88%', size: 1.5 },
          { top: '4%', left: '95%', size: 1 },
          { top: '12%', left: '35%', size: 1 },
        ].map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        ))}
      </div>

      {/* Animated clouds */}
      {CLOUDS.map((cloud, i) => (
        <CloudBlob key={i} {...cloud} />
      ))}

      {/* Island container — perspective 2.5D tilt */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: 'translate(-50%, -46%) perspective(1200px) rotateX(18deg)',
          transformOrigin: 'center center',
          width: 'min(560px, 92vw)',
          height: 'min(430px, 70vw)',
          zIndex: 5,
        }}
      >
        {/* Island SVG — layered organic shapes */}
        <svg
          viewBox="0 0 520 400"
          fill="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <defs>
            <radialGradient id="water-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3aa0ff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1a5fa0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="grass-body" cx="42%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#5bbc5b" />
              <stop offset="100%" stopColor="#2d8c2d" />
            </radialGradient>
            <radialGradient id="center-bump" cx="50%" cy="44%" r="50%">
              <stop offset="0%" stopColor="#3a9e3a" />
              <stop offset="100%" stopColor="#1e6e1e" />
            </radialGradient>
            <filter id="island-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="#0a2a5a" floodOpacity="0.55" />
            </filter>
            <filter id="water-blur">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Water glow halo */}
          <ellipse cx="260" cy="210" rx="250" ry="190" fill="url(#water-glow)" />

          {/* Sand ring */}
          <ellipse
            cx="260"
            cy="210"
            rx="220"
            ry="168"
            fill="#d4a84b"
            filter="url(#island-shadow)"
          />

          {/* Grass body — main island */}
          <ellipse cx="260" cy="205" rx="200" ry="152" fill="url(#grass-body)" />

          {/* Grass highlight edge top */}
          <ellipse cx="255" cy="165" rx="155" ry="58" fill="#6dd86d" opacity="0.22" />

          {/* Forest-green center bump */}
          <ellipse cx="262" cy="195" rx="130" ry="95" fill="url(#center-bump)" opacity="0.65" />

          {/* Decorative trees on island */}
          {/* Tree 1 — far left */}
          <g transform="translate(88, 158)">
            <rect x="-4" y="14" width="8" height="18" rx="2" fill="#7a5230" />
            <polygon points="0,-22 14,14 -14,14" fill="#2a7a2a" />
            <polygon points="0,-34 11,0 -11,0" fill="#369136" />
            <ellipse cx="-3" cy="-20" rx="4" ry="5" fill="#4ab04a" opacity="0.35" />
          </g>
          {/* Tree 2 — right */}
          <g transform="translate(410, 190)">
            <rect x="-4" y="14" width="8" height="16" rx="2" fill="#7a5230" />
            <polygon points="0,-20 12,14 -12,14" fill="#2a7a2a" />
            <polygon points="0,-30 10,0 -10,0" fill="#369136" />
            <ellipse cx="3" cy="-18" rx="4" ry="5" fill="#4ab04a" opacity="0.35" />
          </g>
          {/* Tree 3 — center top */}
          <g transform="translate(260, 112)">
            <rect x="-5" y="16" width="10" height="22" rx="2" fill="#7a5230" />
            <polygon points="0,-26 17,16 -17,16" fill="#2a7a2a" />
            <polygon points="0,-40 13,0 -13,0" fill="#369136" />
            <ellipse cx="-4" cy="-24" rx="5" ry="6" fill="#4ab04a" opacity="0.35" />
          </g>
          {/* Tree 4 — lower right */}
          <g transform="translate(370, 268)">
            <rect x="-4" y="12" width="8" height="15" rx="2" fill="#7a5230" />
            <polygon points="0,-18 11,12 -11,12" fill="#2a7a2a" />
            <polygon points="0,-28 9,0 -9,0" fill="#369136" />
          </g>
        </svg>

        {/* Paths SVG overlay — on top of island, below markers */}
        <div
          ref={containerRef}
          className="absolute inset-0"
          style={{ zIndex: 2 }}
        >
          <MapPaths
            markerPositions={MARKER_POSITIONS}
            getChapterStatus={getChapterStatus}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />

          {/* Chapter markers */}
          {characterOrder.map((charId, index) => {
            const status = getChapterStatus(index + 1);
            const info = CHARACTER_INFO[charId];
            return (
              <ChapterMarker
                key={charId}
                characterId={charId}
                characterName={info.name}
                color={PIECE_COLORS[charId]}
                status={status}
                position={MARKER_POSITIONS[index]}
                onClick={() => onChapterClick(index)}
                animationDelay={0.1 + index * 0.12}
              />
            );
          })}
        </div>
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
        {/* Wave 1 */}
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
        {/* Wave 2 */}
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
