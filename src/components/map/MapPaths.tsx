import React from 'react';
import { motion } from 'framer-motion';

interface MarkerPosition {
  left: string;
  top: string;
}

interface MapPathsProps {
  markerPositions: MarkerPosition[];
  getChapterStatus: (chapterNum: number) => 'unlocked' | 'completed' | 'locked';
  containerWidth: number;
  containerHeight: number;
}

// Connections: from index → to index (0-based chapter indices)
const PATH_CONNECTIONS = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 2, to: 4 },
  { from: 1, to: 3 },
  { from: 4, to: 5 },
  { from: 3, to: 5 },
];

const MapPaths: React.FC<MapPathsProps> = ({
  markerPositions,
  getChapterStatus,
  containerWidth,
  containerHeight,
}) => {
  const toPixel = (pos: MarkerPosition) => ({
    x: (parseFloat(pos.left) / 100) * containerWidth,
    y: (parseFloat(pos.top) / 100) * containerHeight,
  });

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerWidth}
      height={containerHeight}
      style={{ zIndex: 1 }}
    >
      <defs>
        <filter id="path-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {PATH_CONNECTIONS.map((conn, i) => {
        const fromPos = toPixel(markerPositions[conn.from]);
        const toPos = toPixel(markerPositions[conn.to]);

        // Status of the destination chapter (1-based)
        const toStatus = getChapterStatus(conn.to + 1);
        const isLocked = toStatus === 'locked';

        // Compute a slight bezier curve midpoint offset for organic feel
        const midX = (fromPos.x + toPos.x) / 2 + (i % 2 === 0 ? 12 : -12);
        const midY = (fromPos.y + toPos.y) / 2 - 10;
        const pathD = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${midY} ${toPos.x} ${toPos.y}`;

        // Approximate path length for dash animation
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const approxLen = Math.sqrt(dx * dx + dy * dy) * 1.1;
        const dashLen = 8;
        const gapLen = 6;

        if (isLocked) {
          return (
            <path
              key={`path-${i}`}
              d={pathD}
              stroke="rgba(180,180,180,0.35)"
              strokeWidth="3"
              strokeDasharray={`${dashLen} ${gapLen}`}
              fill="none"
              strokeLinecap="round"
            />
          );
        }

        return (
          <motion.path
            key={`path-${i}`}
            d={pathD}
            stroke="rgba(255,245,200,0.75)"
            strokeWidth="3.5"
            strokeDasharray={`${dashLen} ${gapLen}`}
            fill="none"
            strokeLinecap="round"
            filter="url(#path-glow)"
            initial={{ strokeDashoffset: approxLen }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: 1.8,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </svg>
  );
};

export default MapPaths;
