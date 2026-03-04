import React, { useRef, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TileType = 'water' | 'sand' | 'grass' | 'tree' | 'chapter';

interface TileDef {
  q: number;
  r: number;
  type: TileType;
  level: number;
  chapterIndex?: number;
}

interface HexIslandCanvasProps {
  getChapterStatus: (chapterNum: number) => 'unlocked' | 'completed' | 'locked';
  onChapterClick: (chapterIndex: number) => void;
  onChapterPositions?: (positions: Array<{ x: number; y: number }>) => void;
}

// ---------------------------------------------------------------------------
// Island tile layout
// ---------------------------------------------------------------------------

const ISLAND_TILES: TileDef[] = [
  // Water ring (level 0, flat blue)
  ...([
    [-5,  2], [-5,  1], [-5,  0], [-5, -1],
    [-4,  3], [-4,  2], [-4,  1], [-4,  0], [-4, -1], [-4, -2],
    [-3,  4], [-3,  3], [-3, -2], [-3, -3],
    [-2,  4], [-2, -3], [-2, -4],
    [-1,  4], [-1, -4],
    [ 0,  4], [ 0, -4],
    [ 1,  3], [ 1, -4],
    [ 2,  3], [ 2, -3],
    [ 3,  2], [ 3, -2], [ 3, -3],
    [ 4,  1], [ 4,  0], [ 4, -1], [ 4, -2],
    [ 5,  0], [ 5, -1],
  ] as [number, number][]).map(([q, r]) => ({ q, r, type: 'water' as const, level: 0 })),

  // Sand fringe (level 1)
  ...([
    [-3,  2], [-3,  1], [-3,  0], [-3, -1],
    [-2,  3], [-2, -2],
    [-1,  3], [-1, -3],
    [ 0,  3], [ 0, -3],
    [ 1,  2], [ 1, -3],
    [ 2,  2], [ 2, -2],
    [ 3,  1], [ 3,  0], [ 3, -1],
  ] as [number, number][]).map(([q, r]) => ({ q, r, type: 'sand' as const, level: 1 })),

  // Trees (level 2)
  ...([
    [-2,  2],
    [-1,  2], [-1,  1],
    [ 0,  2], [ 0,  1],
    [ 1,  1],
    [ 2,  1],
  ] as [number, number][]).map(([q, r]) => ({ q, r, type: 'tree' as const, level: 2 })),

  // Grass (level 2)
  ...([
    [-2,  1],
    [-2,  0],
    [-1,  0],
    [ 0,  0],
    [ 0, -1],
    [ 1,  0],
    [ 1, -1],
    [ 2,  0],
    [ 2, -1],
  ] as [number, number][]).map(([q, r]) => ({ q, r, type: 'grass' as const, level: 2 })),

  // Chapter tiles (level 3) — one per chess character, well spread
  { q: -2, r:  1, type: 'chapter', level: 3, chapterIndex: 0 }, // Bence  — west
  { q:  0, r:  2, type: 'chapter', level: 3, chapterIndex: 1 }, // Ernő   — south coast
  { q: -1, r: -1, type: 'chapter', level: 3, chapterIndex: 2 }, // Szonja — center-west
  { q:  2, r: -1, type: 'chapter', level: 3, chapterIndex: 3 }, // Huba   — east
  { q:  1, r:  2, type: 'chapter', level: 3, chapterIndex: 4 }, // Vanda  — south-east
  { q:  2, r:  0, type: 'chapter', level: 3, chapterIndex: 5 }, // Balázs — center-east
];

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  water_top:    '#1a6db5',
  water_side_l: '#124d85',
  water_side_f: '#155fa0',
  water_side_r: '#1869b0',

  sand_top:    '#e8c97a',
  sand_side_l: '#b8924a',
  sand_side_f: '#c9a355',
  sand_side_r: '#d4ae60',

  grass_top:    '#4caf50',
  grass_side_l: '#1b5e20',
  grass_side_f: '#2e7d32',
  grass_side_r: '#388e3c',

  tree_top:    '#43a047',
  tree_side_l: '#1b5e20',
  tree_side_f: '#2e7d32',
  tree_side_r: '#388e3c',

  high_top:    '#5cb85c',
  high_side_l: '#1b5e20',
  high_side_f: '#2e7d32',
  high_side_r: '#388e3c',

  outline: 'rgba(0,0,0,0.18)',
};

const CHAPTER_COLORS = ['#4CAF50', '#8B7355', '#9C5FBF', '#E8B830', '#E89830', '#5A8040'];

// ---------------------------------------------------------------------------
// Geometry constants
// ---------------------------------------------------------------------------

const ISO_Y_SCALE = 0.55;
const DEPTH_PER_LEVEL_NOMINAL = 10;
const NOMINAL_HEX_SIZE = 40;

// ---------------------------------------------------------------------------
// Hex geometry helpers
// ---------------------------------------------------------------------------

function hexVertices(cx: number, cy: number, size: number): Array<{ x: number; y: number }> {
  const verts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    verts.push({
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle) * ISO_Y_SCALE,
    });
  }
  return verts;
}

function axialToScreen(
  q: number,
  r: number,
  size: number,
  originX: number,
  originY: number,
): { cx: number; cy: number } {
  return {
    cx: originX + q * size * 1.5,
    cy: originY + (r + q / 2) * size * Math.sqrt(3) * ISO_Y_SCALE,
  };
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function fillPolygon(
  ctx: CanvasRenderingContext2D,
  pts: Array<{ x: number; y: number }>,
  color: string,
  outlineColor?: string,
): void {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (outlineColor) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
}

function drawVoxelHex(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  depth: number,
  topColor: string,
  sideL: string,
  sideF: string,
  sideR: string,
): void {
  const v = hexVertices(cx, cy, size);

  if (depth > 0) {
    fillPolygon(ctx, [
      v[3], v[4],
      { x: v[4].x, y: v[4].y + depth },
      { x: v[3].x, y: v[3].y + depth },
    ], sideL, COLORS.outline);

    fillPolygon(ctx, [
      v[4], v[5],
      { x: v[5].x, y: v[5].y + depth },
      { x: v[4].x, y: v[4].y + depth },
    ], sideF, COLORS.outline);

    fillPolygon(ctx, [
      v[5], v[0],
      { x: v[0].x, y: v[0].y + depth },
      { x: v[5].x, y: v[5].y + depth },
    ], sideR, COLORS.outline);
  }

  fillPolygon(ctx, v, topColor, COLORS.outline);
}

// ---------------------------------------------------------------------------
// Pine tree — deterministic, no Math.random
// ---------------------------------------------------------------------------

function drawTree(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  const topY = cy - size * (Math.sqrt(3) / 2) * ISO_Y_SCALE;
  const s = size / NOMINAL_HEX_SIZE;

  const trunkW = 3 * s;
  const trunkH = 7 * s;
  ctx.fillStyle = '#6d4c2a';
  ctx.fillRect(cx - trunkW / 2, topY - trunkH, trunkW, trunkH);

  const bw = 20 * s;
  const bh = 11 * s;
  ctx.beginPath();
  ctx.moveTo(cx, topY - trunkH - bh);
  ctx.lineTo(cx + bw / 2, topY - trunkH);
  ctx.lineTo(cx - bw / 2, topY - trunkH);
  ctx.closePath();
  ctx.fillStyle = '#1b5e20';
  ctx.fill();

  const mBase = topY - trunkH - bh * 0.55;
  const mw = 15 * s;
  const mh = 10 * s;
  ctx.beginPath();
  ctx.moveTo(cx, mBase - mh);
  ctx.lineTo(cx + mw / 2, mBase);
  ctx.lineTo(cx - mw / 2, mBase);
  ctx.closePath();
  ctx.fillStyle = '#2e7d32';
  ctx.fill();

  const tBase = mBase - mh * 0.6;
  const tw = 10 * s;
  const th = 8 * s;
  ctx.beginPath();
  ctx.moveTo(cx, tBase - th);
  ctx.lineTo(cx + tw / 2, tBase);
  ctx.lineTo(cx - tw / 2, tBase);
  ctx.closePath();
  ctx.fillStyle = '#43a047';
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Chapter platform
// ---------------------------------------------------------------------------

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number): void {
  const innerR = outerR * 0.4;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#FFD700';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

function drawChapterPlatform(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  chapterIndex: number,
  isCompleted: boolean,
): void {
  const radius = size * 0.38;
  const color = CHAPTER_COLORS[chapterIndex];

  if (isCompleted) {
    const grad = ctx.createRadialGradient(cx, cy, radius - 2, cx, cy, radius + 9);
    grad.addColorStop(0, 'rgba(255,215,0,0.55)');
    grad.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 9, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.32)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(chapterIndex + 1), cx, cy + 1);

  if (isCompleted) {
    drawStar(ctx, cx, cy - radius - 9, 6);
  }
}

// ---------------------------------------------------------------------------
// Bounding box computation
// ---------------------------------------------------------------------------

function computeBounds(tiles: TileDef[], hexSize: number, depthPerLevel: number) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const tile of tiles) {
    const { cx, cy } = axialToScreen(tile.q, tile.r, hexSize, 0, 0);
    const v = hexVertices(cx, cy, hexSize);
    for (const pt of v) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
    const depth = tile.level * depthPerLevel;
    const bottomY = cy + hexSize * ISO_Y_SCALE + depth;
    if (bottomY > maxY) maxY = bottomY;
    if (tile.type === 'tree') {
      const s = hexSize / NOMINAL_HEX_SIZE;
      const topY = cy - hexSize * (Math.sqrt(3) / 2) * ISO_Y_SCALE - (7 + 11 + 10 + 8) * s;
      if (topY < minY) minY = topY;
    }
  }
  return { minX, maxX, minY, maxY };
}

// ---------------------------------------------------------------------------
// Core draw function
// ---------------------------------------------------------------------------

function drawIsland(
  ctx: CanvasRenderingContext2D,
  cssW: number,
  cssH: number,
  getChapterStatus: (n: number) => 'unlocked' | 'completed' | 'locked',
): Array<{ x: number; y: number }> {
  ctx.clearRect(0, 0, cssW, cssH);

  const nomDepth = DEPTH_PER_LEVEL_NOMINAL / NOMINAL_HEX_SIZE;
  const nomBounds = computeBounds(ISLAND_TILES, 1, nomDepth);
  const nomW = nomBounds.maxX - nomBounds.minX;
  const nomH = nomBounds.maxY - nomBounds.minY;
  const hexSize = Math.min((cssW * 0.88) / nomW, (cssH * 0.88) / nomH);
  const depthPerLevel = nomDepth * hexSize;

  const bounds = computeBounds(ISLAND_TILES, hexSize, depthPerLevel);
  const gridW = bounds.maxX - bounds.minX;
  const gridH = bounds.maxY - bounds.minY;
  const originX = (cssW - gridW) / 2 - bounds.minX;
  const originY = (cssH - gridH) / 2 - bounds.minY;

  const sorted = [...ISLAND_TILES].sort((a, b) => {
    const ka = a.r + a.q / 2;
    const kb = b.r + b.q / 2;
    if (ka !== kb) return ka - kb;
    return a.q - b.q;
  });

  const chapterPositions: Array<{ x: number; y: number }> = new Array(6);

  for (const tile of sorted) {
    const { cx, cy } = axialToScreen(tile.q, tile.r, hexSize, originX, originY);
    const tileDepth = tile.level * depthPerLevel;

    let topColor: string, sideL: string, sideF: string, sideR: string;
    switch (tile.type) {
      case 'water':
        topColor = COLORS.water_top; sideL = COLORS.water_side_l;
        sideF = COLORS.water_side_f; sideR = COLORS.water_side_r; break;
      case 'sand':
        topColor = COLORS.sand_top; sideL = COLORS.sand_side_l;
        sideF = COLORS.sand_side_f; sideR = COLORS.sand_side_r; break;
      case 'tree':
        topColor = COLORS.tree_top; sideL = COLORS.tree_side_l;
        sideF = COLORS.tree_side_f; sideR = COLORS.tree_side_r; break;
      case 'chapter':
        topColor = COLORS.high_top; sideL = COLORS.high_side_l;
        sideF = COLORS.high_side_f; sideR = COLORS.high_side_r; break;
      default:
        topColor = COLORS.grass_top; sideL = COLORS.grass_side_l;
        sideF = COLORS.grass_side_f; sideR = COLORS.grass_side_r;
    }

    drawVoxelHex(ctx, cx, cy, hexSize, tileDepth, topColor, sideL, sideF, sideR);

    if (tile.type === 'tree') {
      drawTree(ctx, cx, cy, hexSize);
    }

    if (tile.type === 'chapter' && tile.chapterIndex !== undefined) {
      const status = getChapterStatus(tile.chapterIndex + 1);
      drawChapterPlatform(ctx, cx, cy, hexSize, tile.chapterIndex, status === 'completed');
      chapterPositions[tile.chapterIndex] = { x: cx, y: cy };
    }
  }

  return chapterPositions;
}

// ---------------------------------------------------------------------------
// React component
// ---------------------------------------------------------------------------

const HexIslandCanvas: React.FC<HexIslandCanvasProps> = ({
  getChapterStatus,
  onChapterClick,
  onChapterPositions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chapterPosRef = useRef<Array<{ x: number; y: number }>>(new Array(6));

  const renderFrame = useCallback(
    (cssW: number, cssH: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const physW = Math.floor(cssW * dpr);
      const physH = Math.floor(cssH * dpr);

      if (canvas.width !== physW || canvas.height !== physH) {
        canvas.width = physW;
        canvas.height = physH;
        canvas.style.width = cssW + 'px';
        canvas.style.height = cssH + 'px';
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const positions = drawIsland(ctx, cssW, cssH, getChapterStatus);
      ctx.restore();

      chapterPosRef.current = positions;
      onChapterPositions?.(positions);
    },
    [getChapterStatus, onChapterPositions],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) renderFrame(width, height);
      }
    });
    ro.observe(container);

    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) renderFrame(rect.width, rect.height);

    return () => ro.disconnect();
  }, [renderFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const positions = chapterPosRef.current;
      const nomDepth = DEPTH_PER_LEVEL_NOMINAL / NOMINAL_HEX_SIZE;
      const nomBounds = computeBounds(ISLAND_TILES, 1, nomDepth);
      const nomW = nomBounds.maxX - nomBounds.minX;
      const nomH = nomBounds.maxY - nomBounds.minY;
      const hexSize = Math.min((rect.width * 0.88) / nomW, (rect.height * 0.88) / nomH);
      const hitRadius = hexSize * 0.85;

      let closest = -1;
      let closestDist = hitRadius;

      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        if (!p) continue;
        const dist = Math.hypot(mx - p.x, my - p.y);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      }

      if (closest >= 0) onChapterClick(closest);
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [onChapterClick]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', cursor: 'pointer' }} />
    </div>
  );
};

export default HexIslandCanvas;
