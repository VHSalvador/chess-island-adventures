import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  pieceType: 'pawn' | 'rook' | 'bishop' | 'knight' | 'queen' | 'king';
}

const BOARD_SIZE = 8;
const PIECE_POS = { row: 4, col: 4 }; // center piece for knight, varies for pawn

const getPieceEmoji = (type: string) => {
  switch (type) {
    case 'pawn': return '♟';
    case 'rook': return '♜';
    case 'bishop': return '♝';
    case 'knight': return '♞';
    case 'queen': return '♛';
    case 'king': return '♚';
    default: return '♟';
  }
};

function getLegalMoves(type: string, row: number, col: number): [number, number][] {
  const moves: [number, number][] = [];

  switch (type) {
    case 'pawn':
      if (row > 0) moves.push([row - 1, col]);
      if (row === 6 && row > 1) moves.push([row - 2, col]);
      if (row > 0 && col > 0) moves.push([row - 1, col - 1]); // capture
      if (row > 0 && col < 7) moves.push([row - 1, col + 1]); // capture
      break;
    case 'rook':
      for (let i = 0; i < 8; i++) {
        if (i !== row) moves.push([i, col]);
        if (i !== col) moves.push([row, i]);
      }
      break;
    case 'bishop':
      for (let d = 1; d < 8; d++) {
        if (row + d < 8 && col + d < 8) moves.push([row + d, col + d]);
        if (row + d < 8 && col - d >= 0) moves.push([row + d, col - d]);
        if (row - d >= 0 && col + d < 8) moves.push([row - d, col + d]);
        if (row - d >= 0 && col - d >= 0) moves.push([row - d, col - d]);
      }
      break;
    case 'knight':
      const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, dc] of knightMoves) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) moves.push([nr, nc]);
      }
      break;
    case 'queen':
      for (let i = 0; i < 8; i++) {
        if (i !== row) moves.push([i, col]);
        if (i !== col) moves.push([row, i]);
      }
      for (let d = 1; d < 8; d++) {
        if (row + d < 8 && col + d < 8) moves.push([row + d, col + d]);
        if (row + d < 8 && col - d >= 0) moves.push([row + d, col - d]);
        if (row - d >= 0 && col + d < 8) moves.push([row - d, col + d]);
        if (row - d >= 0 && col - d >= 0) moves.push([row - d, col - d]);
      }
      break;
    case 'king':
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr, nc = col + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) moves.push([nr, nc]);
        }
      }
      break;
  }
  return moves;
}

export const ChessMovementDemo: React.FC<Props> = ({ pieceType }) => {
  const pieceRow = pieceType === 'pawn' ? 6 : PIECE_POS.row;
  const pieceCol = PIECE_POS.col;

  const legalMoves = useMemo(
    () => getLegalMoves(pieceType, pieceRow, pieceCol),
    [pieceType, pieceRow, pieceCol]
  );

  const isLegalMove = (r: number, c: number) =>
    legalMoves.some(([mr, mc]) => mr === r && mc === c);

  return (
    <div className="flex justify-center">
      <div className="inline-grid grid-cols-8 gap-0 rounded-xl overflow-hidden border-4 border-foreground/20 shadow-lg">
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const isLight = (row + col) % 2 === 0;
            const isPiece = row === pieceRow && col === pieceCol;
            const isMove = isLegalMove(row, col);

            return (
              <div
                key={`${row}-${col}`}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center relative ${
                  isLight ? 'bg-amber-100' : 'bg-amber-700'
                }`}
              >
                {isPiece && (
                  <motion.span
                    className="text-2xl sm:text-3xl z-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getPieceEmoji(pieceType)}
                  </motion.span>
                )}
                {isMove && !isPiece && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/50"
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
