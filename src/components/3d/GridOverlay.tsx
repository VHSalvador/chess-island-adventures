import React, { useState } from 'react';
import * as THREE from 'three';

interface GridOverlayProps {
  gridSize: number;
  cellSize: number;
  onCellClick: (x: number, y: number) => void;
  occupiedCells: Set<string>;
  placingMode: boolean;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  gridSize,
  cellSize,
  onCellClick,
  occupiedCells,
  placingMode,
}) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const offset = (gridSize * cellSize) / 2 - cellSize / 2;

  return (
    <group position={[0, 0.22, 0]}>
      {Array.from({ length: gridSize * gridSize }, (_, i) => {
        const gx = i % gridSize;
        const gy = Math.floor(i / gridSize);
        const key = `${gx}-${gy}`;
        const x = gx * cellSize - offset;
        const z = gy * cellSize - offset;
        const occupied = occupiedCells.has(key);
        const isHovered = hoveredCell === key;

        return (
          <mesh
            key={key}
            position={[x, 0, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              if (placingMode && !occupied) onCellClick(gx, gy);
            }}
            onPointerEnter={() => placingMode && !occupied && setHoveredCell(key)}
            onPointerLeave={() => setHoveredCell(null)}
          >
            <planeGeometry args={[cellSize * 0.9, cellSize * 0.9]} />
            <meshStandardMaterial
              color={
                isHovered && placingMode
                  ? '#ffd700'
                  : occupied
                    ? '#6bb85a'
                    : placingMode
                      ? '#8ed880'
                      : '#5daa4a'
              }
              transparent
              opacity={
                placingMode
                  ? isHovered ? 0.5 : occupied ? 0.15 : 0.2
                  : 0.05
              }
              roughness={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default GridOverlay;
