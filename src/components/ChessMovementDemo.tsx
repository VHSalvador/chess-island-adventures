import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type PieceType = 'pawn' | 'rook' | 'bishop' | 'knight' | 'queen' | 'king';

interface Props {
  pieceType: PieceType;
}

const BOARD_SIZE = 6;
const CELL = 52; // px per cell — 6×52=312px, fits on 375px mobile

export const getPieceEmoji = (type: PieceType): string => {
  switch (type) {
    case 'pawn':   return '♟';
    case 'rook':   return '♜';
    case 'bishop': return '♝';
    case 'knight': return '♞';
    case 'queen':  return '♛';
    case 'king':   return '♚';
  }
};

export function getLegalMovesDemo(type: PieceType, row: number, col: number): [number, number][] {
  const moves: [number, number][] = [];
  const B = BOARD_SIZE;
  switch (type) {
    case 'pawn':
      if (row > 0) moves.push([row - 1, col]);
      if (row === B - 1 && row > 1) moves.push([row - 2, col]);
      if (row > 0 && col > 0) moves.push([row - 1, col - 1]);
      if (row > 0 && col < B - 1) moves.push([row - 1, col + 1]);
      break;
    case 'rook':
      for (let i = 0; i < B; i++) {
        if (i !== row) moves.push([i, col]);
        if (i !== col) moves.push([row, i]);
      }
      break;
    case 'bishop':
      for (let d = 1; d < B; d++) {
        if (row + d < B && col + d < B) moves.push([row + d, col + d]);
        if (row + d < B && col - d >= 0) moves.push([row + d, col - d]);
        if (row - d >= 0 && col + d < B) moves.push([row - d, col + d]);
        if (row - d >= 0 && col - d >= 0) moves.push([row - d, col - d]);
      }
      break;
    case 'knight': {
      const offsets: [number, number][] = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of offsets) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < B && nc >= 0 && nc < B) moves.push([nr, nc]);
      }
      break;
    }
    case 'queen':
      for (let i = 0; i < B; i++) {
        if (i !== row) moves.push([i, col]);
        if (i !== col) moves.push([row, i]);
      }
      for (let d = 1; d < B; d++) {
        if (row + d < B && col + d < B) moves.push([row + d, col + d]);
        if (row + d < B && col - d >= 0) moves.push([row + d, col - d]);
        if (row - d >= 0 && col + d < B) moves.push([row - d, col + d]);
        if (row - d >= 0 && col - d >= 0) moves.push([row - d, col - d]);
      }
      break;
    case 'king':
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr, nc = col + dc;
          if (nr >= 0 && nr < B && nc >= 0 && nc < B) moves.push([nr, nc]);
        }
      }
      break;
  }
  return moves;
}

// Positions the piece visits during the auto-demo
const DEMO_SEQUENCES: Record<PieceType, [number, number][]> = {
  pawn:   [[5,2],[4,2],[3,2],[5,2],[4,1],[5,2],[4,3]],
  rook:   [[2,2],[0,2],[2,5],[2,2],[5,2],[2,0],[2,2]],
  bishop: [[2,2],[0,0],[2,2],[0,4],[2,2],[4,4],[2,2],[4,0]],
  knight: [[0,0],[2,1],[0,0],[1,2],[2,3],[4,2],[3,4],[2,3]],
  queen:  [[2,2],[0,2],[2,2],[2,5],[2,2],[0,0],[2,2],[5,5],[2,2]],
  king:   [[2,2],[2,3],[3,3],[3,2],[3,1],[2,1],[1,1],[1,2],[1,3],[2,2]],
};

// Midpoint square shown as ghost during knight move to visualise the L decomposition
const KNIGHT_MIDS: Record<string, [number, number]> = {
  '0,0->2,1': [1,0], '0,0->1,2': [0,1],
  '2,3->4,2': [3,2], '3,4->2,3': [3,3], '4,2->3,4': [4,3],
};

const MOVE_MS  = 1400; // pause between moves (ms)
const SLIDE_MS = 0.9;  // Framer Motion transition duration (s) — slow hover feel
const SHOW_ALL_MS = 2200;

// Piece colours: dark on light squares, lighter on dark squares
const PIECE_STYLE: React.CSSProperties = {
  color: '#1a0a00',
  filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.65))',
  lineHeight: 1,
  userSelect: 'none',
};

export const ChessMovementDemo: React.FC<Props> = ({ pieceType }) => {
  const sequence = DEMO_SEQUENCES[pieceType];
  const [seqIndex, setSeqIndex] = useState(0);
  const [trail, setTrail] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [knightMid, setKnightMid] = useState<[number, number] | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    setSeqIndex(0);
    setTrail(new Set());
    setShowAll(false);
    setKnightMid(null);

    const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

    const run = async () => {
      for (let i = 0; i < sequence.length; i++) {
        if (cancelRef.current) return;
        const prev = sequence[i - 1];
        const curr = sequence[i];

        // Knight: briefly show midpoint ghost so child sees the 2+1 decomposition
        if (pieceType === 'knight' && prev) {
          const mid = KNIGHT_MIDS[`${prev[0]},${prev[1]}->${curr[0]},${curr[1]}`];
          if (mid) {
            setKnightMid(mid);
            await delay(420);
            if (cancelRef.current) return;
            setKnightMid(null);
            await delay(80);
            if (cancelRef.current) return;
          }
        }

        setSeqIndex(i);
        if (prev) {
          setTrail(t => {
            const next = new Set(t);
            if (next.size >= 3) {
              const first = next.values().next().value;
              if (first !== undefined) next.delete(first);
            }
            next.add(`${prev[0]},${prev[1]}`);
            return next;
          });
        }

        await delay(MOVE_MS);
        if (cancelRef.current) return;
      }

      setShowAll(true);
      setTrail(new Set());
      await delay(SHOW_ALL_MS);
      if (cancelRef.current) return;

      setShowAll(false);
      setSeqIndex(0);
      await delay(500);
      if (cancelRef.current) return;
      run();
    };

    run();
    return () => { cancelRef.current = true; };
  }, [pieceType]); // eslint-disable-line react-hooks/exhaustive-deps

  const [pieceRow, pieceCol] = sequence[seqIndex];
  const legalMoves = getLegalMovesDemo(pieceType, pieceRow, pieceCol);

  return (
    <div className="flex justify-center">
      <div
        className="relative rounded-xl overflow-hidden border-4 border-foreground/20 shadow-xl"
        style={{ width: BOARD_SIZE * CELL, height: BOARD_SIZE * CELL }}
      >
        {/* Static grid cells */}
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const isLight = (row + col) % 2 === 0;
            const isTrail = trail.has(`${row},${col}`);
            const isLegal = showAll && legalMoves.some(([r, c]) => r === row && c === col);
            const isMid = knightMid?.[0] === row && knightMid?.[1] === col;

            return (
              <div
                key={`${row}-${col}`}
                className="absolute flex items-center justify-center"
                style={{
                  left: col * CELL, top: row * CELL,
                  width: CELL, height: CELL,
                  backgroundColor: isTrail
                    ? 'rgba(74,222,128,0.45)'
                    : isLight ? '#fef3c7' : '#92400e',
                }}
              >
                {isLegal && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.7)' }}
                  />
                )}
                {/* Knight midpoint ghost: faint piece silhouette showing intermediate step */}
                {isMid && (
                  <span className="text-3xl pointer-events-none" style={{ ...PIECE_STYLE, opacity: 0.25, fontSize: 28 }}>
                    {getPieceEmoji(pieceType)}
                  </span>
                )}
              </div>
            );
          })
        )}

        {/* Single smoothly-sliding piece — absolutely positioned over the grid */}
        <motion.div
          className="absolute flex items-center justify-center pointer-events-none z-20"
          style={{ width: CELL, height: CELL }}
          animate={{ x: pieceCol * CELL, y: pieceRow * CELL }}
          initial={false}
          transition={{
            duration: SLIDE_MS,
            ease: 'easeInOut',
          }}
        >
          <span className="text-4xl" style={PIECE_STYLE}>
            {getPieceEmoji(pieceType)}
          </span>
        </motion.div>
      </div>
    </div>
  );
};
