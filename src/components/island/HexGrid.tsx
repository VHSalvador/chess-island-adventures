import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import IslandItemSVG from './IslandItemSVG';

// ---------------------------------------------------------------------------
// Hex geometry constants
// ---------------------------------------------------------------------------

const HEX_SIZE = 36;
const ISO_Y = 0.55;
const DEPTH = 20;

// ---------------------------------------------------------------------------
// Build a radius-2 hex cluster (19 tiles) using axial coordinates
// ---------------------------------------------------------------------------

const GRID_TILES: Array<{ q: number; r: number }> = [];
for (let q = -2; q <= 2; q++) {
  for (let r = -2; r <= 2; r++) {
    if (Math.abs(q) + Math.abs(r) + Math.abs(q + r) <= 4) {
      GRID_TILES.push({ q, r });
    }
  }
}

// Painter's algorithm order (back-to-front)
const SORTED_TILES = [...GRID_TILES].sort((a, b) => {
  const ka = a.r + a.q / 2;
  const kb = b.r + b.q / 2;
  if (ka !== kb) return ka - kb;
  return a.q - b.q;
});

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

function hexVerts(cx: number, cy: number, size: number): Array<[number, number]> {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return [cx + size * Math.cos(a), cy + size * Math.sin(a) * ISO_Y] as [number, number];
  });
}

function axialToScreen(
  q: number,
  r: number,
  size: number,
  ox: number,
  oy: number,
): { cx: number; cy: number } {
  return {
    cx: ox + q * size * 1.5,
    cy: oy + (r + q / 2) * size * Math.sqrt(3) * ISO_Y,
  };
}

// Mouse → nearest axial coordinates
function screenToAxial(
  mx: number,
  my: number,
  size: number,
  ox: number,
  oy: number,
): { q: number; r: number } {
  const qf = (mx - ox) / (size * 1.5);
  const rf = (my - oy) / (size * Math.sqrt(3) * ISO_Y) - qf / 2;

  // Cube coordinate rounding
  let x = qf;
  let z = rf;
  let y = -x - z;

  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const dx = Math.abs(rx - x);
  const dy = Math.abs(ry - y);
  const dz = Math.abs(rz - z);

  if (dx > dy && dx > dz) {
    rx = -ry - rz;
  } else if (dy > dz) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { q: rx, r: rz };
}

// ---------------------------------------------------------------------------
// Compute canvas size from tile bounding box
// ---------------------------------------------------------------------------

function computeCanvasSize(): { width: number; height: number; ox: number; oy: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const { q, r } of GRID_TILES) {
    const { cx, cy } = axialToScreen(q, r, HEX_SIZE, 0, 0);
    minX = Math.min(minX, cx - HEX_SIZE);
    maxX = Math.max(maxX, cx + HEX_SIZE);
    minY = Math.min(minY, cy - HEX_SIZE * ISO_Y);
    maxY = Math.max(maxY, cy + HEX_SIZE * ISO_Y + DEPTH);
  }
  const pad = HEX_SIZE;
  const width = Math.ceil(maxX - minX + pad * 2);
  const height = Math.ceil(maxY - minY + pad * 2);
  const ox = -minX + pad;
  const oy = -minY + pad;
  return { width, height, ox, oy };
}

const { width: CANVAS_W, height: CANVAS_H, ox: ORIGIN_X, oy: ORIGIN_Y } = computeCanvasSize();

export const CANVAS_WIDTH = CANVAS_W;
export const CANVAS_HEIGHT = CANVAS_H;

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const C = {
  grass_top:    '#4caf50',
  grass_side_l: '#1b5e20',
  grass_side_f: '#2e7d32',
  grass_side_r: '#388e3c',
  hover_top:    '#ffe082',
  hover_side_l: '#b8860b',
  hover_side_f: '#d4a017',
  hover_side_r: '#daa520',
  occ_top:    '#2e7d32',
  occ_side_l: '#1a4721',
  occ_side_f: '#215e28',
  occ_side_r: '#276930',
  outline: 'rgba(0,0,0,0.18)',
};

// ---------------------------------------------------------------------------
// Draw one voxel hex
// ---------------------------------------------------------------------------

function drawHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  top: string,
  sideL: string,
  sideF: string,
  sideR: string,
): void {
  const v = hexVerts(cx, cy, HEX_SIZE);

  const face = (pts: Array<[number, number]>, color: string) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  };

  // Left face: v[3]→v[4] drop down
  face([v[3], v[4], [v[4][0], v[4][1] + DEPTH], [v[3][0], v[3][1] + DEPTH]], sideL);
  // Front face: v[4]→v[5] drop down
  face([v[4], v[5], [v[5][0], v[5][1] + DEPTH], [v[4][0], v[4][1] + DEPTH]], sideF);
  // Right face: v[5]→v[0] drop down
  face([v[5], v[0], [v[0][0], v[0][1] + DEPTH], [v[5][0], v[5][1] + DEPTH]], sideR);
  // Top
  face(v, top);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InventoryItem {
  id: string;
  grid_x: number;
  grid_y: number;
  item_name: string;
  item_type: string;
}

interface HexGridProps {
  occupiedCells: Set<string>;
  placingMode: boolean;
  onCellClick: (q: number, r: number) => void;
  inventory: InventoryItem[];
}

const ITEM_SIZE = 52;
const ITEM_OFFSET_Y = DEPTH + HEX_SIZE * ISO_Y * 0.5 + 18;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const HexGrid: React.FC<HexGridProps> = ({
  occupiedCells,
  placingMode,
  onCellClick,
  inventory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(CANVAS_W * dpr)) {
      canvas.width = Math.floor(CANVAS_W * dpr);
      canvas.height = Math.floor(CANVAS_H * dpr);
      canvas.style.width = CANVAS_W + 'px';
      canvas.style.height = CANVAS_H + 'px';
    }

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    for (const { q, r } of SORTED_TILES) {
      const key = `${q}-${r}`;
      const { cx, cy } = axialToScreen(q, r, HEX_SIZE, ORIGIN_X, ORIGIN_Y);
      const isOccupied = occupiedCells.has(key);
      const isHovered = hovered === key;

      let top: string, sideL: string, sideF: string, sideR: string;
      if (isOccupied) {
        top = C.occ_top; sideL = C.occ_side_l; sideF = C.occ_side_f; sideR = C.occ_side_r;
      } else if (isHovered && placingMode) {
        top = C.hover_top; sideL = C.hover_side_l; sideF = C.hover_side_f; sideR = C.hover_side_r;
      } else {
        top = C.grass_top; sideL = C.grass_side_l; sideF = C.grass_side_f; sideR = C.grass_side_r;
      }

      drawHex(ctx, cx, cy, top, sideL, sideF, sideR);
    }

    ctx.restore();
  }, [occupiedCells, placingMode, hovered]);

  useEffect(() => { redraw(); }, [redraw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { q, r } = screenToAxial(mx, my, HEX_SIZE, ORIGIN_X, ORIGIN_Y);
    const key = `${q}-${r}`;
    const valid = GRID_TILES.some(t => t.q === q && t.r === r);
    setHovered(valid ? key : null);
  }, []);

  const handleMouseLeave = useCallback(() => { setHovered(null); }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { q, r } = screenToAxial(mx, my, HEX_SIZE, ORIGIN_X, ORIGIN_Y);
    const key = `${q}-${r}`;
    const valid = GRID_TILES.some(t => t.q === q && t.r === r);
    if (valid && !occupiedCells.has(key)) onCellClick(q, r);
  }, [occupiedCells, onCellClick]);

  return (
    <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', cursor: placingMode ? 'crosshair' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* Item overlays — rendered as HTML so SVG animations work */}
      {inventory.map((item) => {
        const { cx, cy } = axialToScreen(item.grid_x, item.grid_y, HEX_SIZE, ORIGIN_X, ORIGIN_Y);
        return (
          <motion.div
            key={item.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{
              position: 'absolute',
              left: cx - ITEM_SIZE / 2,
              top: cy - ITEM_OFFSET_Y,
              width: ITEM_SIZE,
              height: ITEM_SIZE,
              pointerEvents: 'none',
              zIndex: item.grid_x + item.grid_y + 1,
            }}
          >
            <IslandItemSVG itemName={item.item_name} size={ITEM_SIZE} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default HexGrid;
