import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PieceType = 'pawn' | 'rook' | 'bishop' | 'knight' | 'queen' | 'king';

interface Props {
  pieceType: PieceType;
}

const BOARD_SIZE = 6;

const getPieceEmoji = (type: PieceType): string => {
  switch (type) {
    case 'pawn':   return '♟';
    case 'rook':   return '♜';
    case 'bishop': return '♝';
    case 'knight': return '♞';
    case 'queen':  return '♛';
    case 'king':   return '♚';
  }
};

function getLegalMoves(type: PieceType, row: number, col: number): [number, number][] {
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
      const offsets: [number, number][] = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
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

// Sequences of positions the piece visits to demonstrate its movement.
// All coordinates are within 0–5 (6×6 board).
// Knight starts at corner to show only 2 options first, then expands.
const DEMO_SEQUENCES: Record<PieceType, [number, number][]> = {
  pawn:   [[5,2], [4,2], [3,2], [5,2], [4,1], [5,2], [4,3]],
  rook:   [[2,2], [0,2], [2,5], [2,2], [5,2], [2,0], [2,2]],
  bishop: [[2,2], [0,0], [2,2], [0,4], [2,2], [4,4], [2,2], [4,0]],
  knight: [[0,0], [2,1], [0,0], [1,2], [2,3], [4,2], [3,4], [2,3]],
  queen:  [[2,2], [0,2], [2,2], [2,5], [2,2], [0,0], [2,2], [5,5], [2,2]],
  king:   [[2,2], [2,3], [3,3], [3,2], [3,1], [2,1], [1,1], [1,2], [1,3], [2,2]],
};

// For knight: midpoint ghost to visualise the L-shape decomposition
const KNIGHT_MIDPOINTS: Record<string, [number, number]> = {
  '0,0->2,1': [1, 0],
  '0,0->1,2': [0, 1],
  '2,3->4,2': [3, 2],
  '3,4->2,3': [3, 3],
  '4,2->3,4': [4, 3],
};

const MOVE_INTERVAL_MS = 1100;
const SHOW_ALL_MS = 2000;

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

        // Knight midpoint ghost to show L decomposition
        if (pieceType === 'knight' && prev) {
          const key = `${prev[0]},${prev[1]}->${curr[0]},${curr[1]}`;
          const mid = KNIGHT_MIDPOINTS[key];
          if (mid) {
            setKnightMid(mid);
            await delay(350);
            if (cancelRef.current) return;
            setKnightMid(null);
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

        await delay(MOVE_INTERVAL_MS);
        if (cancelRef.current) return;
      }

      // End of sequence: flash all legal moves
      setShowAll(true);
      setTrail(new Set());
      await delay(SHOW_ALL_MS);
      if (cancelRef.current) return;

      setShowAll(false);
      setSeqIndex(0);
      await delay(400);
      if (cancelRef.current) return;
      run();
    };

    run();
    return () => { cancelRef.current = true; };
  }, [pieceType]); // eslint-disable-line react-hooks/exhaustive-deps

  const [pieceRow, pieceCol] = sequence[seqIndex];
  const legalMoves = getLegalMoves(pieceType, pieceRow, pieceCol);

  return (
    <div className="flex justify-center">
      <div
        className="inline-grid gap-0 rounded-xl overflow-hidden border-4 border-foreground/20 shadow-xl"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const isLight = (row + col) % 2 === 0;
            const isPiece = row === pieceRow && col === pieceCol;
            const isTrail = trail.has(`${row},${col}`);
            const isKnightMid = knightMid !== null && knightMid[0] === row && knightMid[1] === col;
            const isLegal = showAll && legalMoves.some(([r, c]) => r === row && c === col);

            return (
              <div
                key={`${row}-${col}`}
                className={[
                  'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center relative',
                  isLight ? 'bg-amber-100' : 'bg-amber-700',
                  isTrail && !isPiece ? 'bg-emerald-400/40' : '',
                  isKnightMid ? 'bg-yellow-300/50' : '',
                ].filter(Boolean).join(' ')}
              >
                <AnimatePresence mode="popLayout">
                  {isPiece && (
                    <motion.span
                      key={`piece-${pieceRow}-${pieceCol}`}
                      className="text-3xl sm:text-4xl z-10 select-none"
                      initial={{ scale: 0.65, opacity: 0.5, y: pieceType === 'knight' ? -20 : -6 }}
                      animate={{ scale: 1.05, opacity: 1, y: 0 }}
                      exit={{ scale: 0.65, opacity: 0, y: 4 }}
                      transition={{ type: 'spring', stiffness: pieceType === 'knight' ? 320 : 480, damping: 18 }}
                    >
                      {getPieceEmoji(pieceType)}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Trail dot */}
                {isTrail && !isPiece && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.75 }}
                    className="w-3 h-3 rounded-full bg-emerald-500 absolute pointer-events-none"
                  />
                )}

                {/* Knight midpoint ghost */}
                {isKnightMid && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 0.65, opacity: 0.4 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="text-2xl z-10 select-none absolute pointer-events-none"
                  >
                    {getPieceEmoji(pieceType)}
                  </motion.span>
                )}

                {/* Show-all legal move dots */}
                {isLegal && !isPiece && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 rounded-full bg-primary/60 pointer-events-none"
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
