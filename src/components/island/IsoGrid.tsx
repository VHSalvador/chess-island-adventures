import React, { useState } from 'react';
import { motion } from 'framer-motion';
import IsoTile, { TILE_W, tilePosition } from './IsoTile';
import IslandItemSVG from './IslandItemSVG';

const GRID_N = 6;
const TILE_H = 36;

// Grid canvas dimensions (6×6 diamond grid):
// Horizontal span: (GRID_N-1)*TILE_W + TILE_W = 432px
// Vertical span:   (GRID_N-1)*TILE_H + TILE_H = 252px
// Leftmost tile left = (0 - (GRID_N-1)) * (TILE_W/2) = -180  (compensated in parent with left:180px)
const CANVAS_W = (GRID_N - 1) * TILE_W + TILE_W; // 432
const CANVAS_H = (GRID_N - 1) * TILE_H + TILE_H; // 252

// Item sits above the tile — shift it up so it appears to stand on the tile surface
const ITEM_OFFSET_Y = -48;
const ITEM_SIZE = 56;

interface InventoryItem {
  id: string;
  grid_x: number;
  grid_y: number;
  item_name: string;
  item_type: string;
}

interface IsoGridProps {
  occupiedCells: Set<string>;
  placingMode: boolean;
  onCellClick: (x: number, y: number) => void;
  inventory: InventoryItem[];
}

const IsoGrid: React.FC<IsoGridProps> = ({
  occupiedCells,
  placingMode,
  onCellClick,
  inventory,
}) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Render tiles back-to-front so items at the front overlap items at the back.
  // Isometric back-to-front order: lower y rows first, then lower x within same y.
  const tileOrder: Array<[number, number]> = [];
  for (let y = 0; y < GRID_N; y++) {
    for (let x = 0; x < GRID_N; x++) {
      tileOrder.push([x, y]);
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width:  CANVAS_W + 'px',
        height: CANVAS_H + 'px',
      }}
    >
      {/* Tile layer */}
      {tileOrder.map(([x, y]) => {
        const key = `${x}-${y}`;
        return (
          <IsoTile
            key={key}
            x={x}
            y={y}
            isOccupied={occupiedCells.has(key)}
            isHovered={hoveredCell === key}
            isPlacingMode={placingMode}
            onClick={() => {
              if (!occupiedCells.has(key)) onCellClick(x, y);
            }}
            onMouseEnter={() => setHoveredCell(key)}
            onMouseLeave={() => setHoveredCell(null)}
          />
        );
      })}

      {/* Item layer — rendered in the same back-to-front order */}
      {tileOrder.map(([x, y]) => {
        const key = `${x}-${y}`;
        const item = inventory.find(i => i.grid_x === x && i.grid_y === y);
        if (!item) return null;
        const pos = tilePosition(x, y);
        return (
          <motion.div
            key={`item-${item.id}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{
              position: 'absolute',
              left: pos.left + (TILE_W - ITEM_SIZE) / 2 + 'px',
              top:  pos.top  + ITEM_OFFSET_Y + 'px',
              width:  ITEM_SIZE + 'px',
              height: ITEM_SIZE + 'px',
              pointerEvents: 'none',
              zIndex: x + y + 1,
            }}
          >
            <IslandItemSVG itemName={item.item_name} size={ITEM_SIZE} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default IsoGrid;
