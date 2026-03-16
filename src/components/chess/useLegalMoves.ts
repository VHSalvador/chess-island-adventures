import { useMemo } from 'react';

export type PieceType = 'pawn' | 'rook' | 'bishop' | 'knight' | 'queen' | 'king';

export function getLegalMoves(
  type: PieceType,
  row: number,
  col: number,
  boardSize = 8,
): [number, number][] {
  const moves: [number, number][] = [];
  const B = boardSize;

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

export function useLegalMoves(
  type: PieceType,
  row: number,
  col: number,
  boardSize = 8,
): [number, number][] {
  return useMemo(
    () => getLegalMoves(type, row, col, boardSize),
    [type, row, col, boardSize],
  );
}
