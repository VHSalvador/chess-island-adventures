import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPieceEmoji } from '@/components/ChessMovementDemo';

type PieceType = 'pawn' | 'rook' | 'bishop' | 'knight' | 'queen' | 'king';

interface Props {
  pieceType: PieceType;
  boardSize: number;
  initialPos: [number, number];
  onComplete: () => void;
}

const CELL = 52;
const DISCOVERY_MOVES = 3;
const PRACTICE_MOVES  = 3;
const TOTAL_MOVES     = DISCOVERY_MOVES + PRACTICE_MOVES;

function getLegalMoves(type: PieceType, row: number, col: number, B: number): [number, number][] {
  const moves: [number, number][] = [];
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
      const offs: [number, number][] = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of offs) {
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

const PIECE_STYLE: React.CSSProperties = {
  color: '#1a0a00',
  filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.65))',
  lineHeight: 1,
  userSelect: 'none',
};

export const MovementPracticeBoard: React.FC<Props> = ({
  pieceType, boardSize, initialPos, onComplete,
}) => {
  const [piecePos, setPiecePos]     = useState<[number, number]>(initialPos);
  const [moveCount, setMoveCount]   = useState(0);
  const [selected, setSelected]     = useState(false);   // practice phase: piece selected
  const [shaking, setShaking]       = useState(false);
  const [flashCell, setFlashCell]   = useState<[number, number] | null>(null); // correct move flash
  const [done, setDone]             = useState(false);

  const phase = moveCount < DISCOVERY_MOVES ? 'discovery' : 'practice';
  const phaseMove = moveCount < DISCOVERY_MOVES ? moveCount : moveCount - DISCOVERY_MOVES;

  const legalMoves = getLegalMoves(pieceType, piecePos[0], piecePos[1], boardSize);
  const isLegal = useCallback(
    (r: number, c: number) => legalMoves.some(([mr, mc]) => mr === r && mc === c),
    [legalMoves],
  );

  // In discovery phase dots are always visible; in practice only when piece is selected
  const showDots = phase === 'discovery' || selected;

  const doMove = (row: number, col: number) => {
    setFlashCell([row, col]);
    setTimeout(() => setFlashCell(null), 600);
    setPiecePos([row, col]);
    setSelected(false);
    const next = moveCount + 1;
    setMoveCount(next);
    if (next >= TOTAL_MOVES) {
      setTimeout(() => { setDone(true); onComplete(); }, 700);
    }
  };

  const triggerShake = () => {
    if (shaking) return;
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  const handleCell = (row: number, col: number) => {
    if (shaking || done) return;
    const isPiece = row === piecePos[0] && col === piecePos[1];

    if (phase === 'discovery') {
      if (isLegal(row, col)) doMove(row, col);
      // tapping piece cell or non-move in discovery is a no-op
    } else {
      if (!selected) {
        if (isPiece) setSelected(true);
        else triggerShake();
      } else {
        if (isLegal(row, col)) doMove(row, col);
        else if (isPiece) setSelected(false); // deselect
        else triggerShake();
      }
    }
  };

  const phaseLabel  = phase === 'discovery' ? '🔍 Felfedezés' : '⚡ Gyakorlás';
  const instruction = phase === 'discovery'
    ? 'Koppints egy zöld mezőre!'
    : selected ? 'Most koppints oda, ahova lép!' : 'Először koppints a figurára!';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Phase badge + progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-display text-white/80 bg-white/10 px-3 py-1 rounded-full">
          {phaseLabel}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_MOVES }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < moveCount ? 'bg-amber-400' : i === moveCount ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instruction */}
      <p className="text-white/80 text-sm text-center">{instruction}</p>

      {/* Board */}
      <div
        className="relative rounded-xl overflow-hidden border-4 border-foreground/20 shadow-xl"
        style={{ width: boardSize * CELL, height: boardSize * CELL }}
      >
        {/* Grid cells */}
        {Array.from({ length: boardSize }, (_, row) =>
          Array.from({ length: boardSize }, (_, col) => {
            const isLight      = (row + col) % 2 === 0;
            const isPiece      = row === piecePos[0] && col === piecePos[1];
            const isValidMove  = showDots && isLegal(row, col);
            const isFlash      = flashCell?.[0] === row && flashCell?.[1] === col;
            const isPieceSelected = isPiece && selected;

            return (
              <div
                key={`${row}-${col}`}
                className="absolute flex items-center justify-center cursor-pointer"
                style={{
                  left: col * CELL, top: row * CELL,
                  width: CELL, height: CELL,
                  backgroundColor: isFlash
                    ? 'rgba(251,191,36,0.6)'
                    : isPieceSelected
                    ? 'rgba(251,191,36,0.35)'
                    : isLight ? '#fef3c7' : '#92400e',
                }}
                onClick={() => handleCell(row, col)}
              >
                {/* Valid move dot */}
                {isValidMove && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-5 h-5 rounded-full pointer-events-none"
                    style={{ background: 'rgba(16,185,129,0.75)' }}
                  />
                )}
              </div>
            );
          })
        )}

        {/* Smoothly sliding piece */}
        <motion.div
          className="absolute flex items-center justify-center pointer-events-none z-20"
          style={{ width: CELL, height: CELL }}
          animate={{
            x: piecePos[1] * CELL,
            y: piecePos[0] * CELL,
            rotate: shaking ? [0, -8, 8, -8, 8, 0] : 0,
          }}
          initial={false}
          transition={shaking
            ? { duration: 0.35, ease: 'easeInOut' }
            : { duration: 0.55, ease: 'easeInOut' }
          }
        >
          <motion.span
            className="text-4xl"
            style={PIECE_STYLE}
            animate={{ scale: selected ? 1.2 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {getPieceEmoji(pieceType)}
          </motion.span>
        </motion.div>
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-white font-display text-lg"
          >
            🌟 Szuper! Már tudod, hogyan lép!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
