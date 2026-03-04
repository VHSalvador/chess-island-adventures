import React from 'react';

export const TILE_W = 72;
export const TILE_H = 36;

export function tilePosition(x: number, y: number): { left: number; top: number } {
  return {
    left: (x - y) * (TILE_W / 2),
    top:  (x + y) * (TILE_H / 2),
  };
}

interface IsoTileProps {
  x: number;
  y: number;
  isOccupied: boolean;
  isHovered: boolean;
  isPlacingMode: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const IsoTile: React.FC<IsoTileProps> = ({
  x,
  y,
  isOccupied,
  isHovered,
  isPlacingMode,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { left, top } = tilePosition(x, y);

  let background: string;
  let boxShadow: string;
  let border: string;
  let cursor: string;
  let animation: string | undefined;

  if (isHovered && isPlacingMode && !isOccupied) {
    background = 'linear-gradient(135deg, #ffe082, #ffd54f)';
    boxShadow = '0 0 0 2px #ff8f00 inset, 0 4px 12px rgba(255,160,0,0.45)';
    border = 'none';
    cursor = 'pointer';
    animation = 'iso-tile-pulse 0.9s ease-in-out infinite';
  } else if (isOccupied) {
    background = 'linear-gradient(135deg, #2e7d32, #1b5e20)';
    boxShadow = '0 0 0 1px rgba(0,0,0,0.25) inset';
    border = 'none';
    cursor = 'default';
  } else if (isHovered && !isPlacingMode) {
    background = 'linear-gradient(135deg, #66bb6a, #43a047)';
    boxShadow = '0 0 0 2px #81c784 inset, 0 3px 8px rgba(56,142,60,0.35)';
    border = 'none';
    cursor = 'default';
  } else {
    background = 'linear-gradient(135deg, #4caf50, #388e3c)';
    boxShadow = '0 0 0 1.5px rgba(255,255,255,0.18) inset';
    border = 'none';
    cursor = isPlacingMode ? 'not-allowed' : 'default';
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        left: left + 'px',
        top:  top  + 'px',
        width:  TILE_W + 'px',
        height: TILE_H + 'px',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        background,
        boxShadow,
        border,
        cursor,
        animation,
        transition: 'background 0.15s ease, box-shadow 0.15s ease',
        willChange: 'transform',
      }}
      aria-label={`Mező ${x}-${y}`}
    />
  );
};

export default IsoTile;
