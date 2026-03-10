import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Undo2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import PieceCollectGame from '@/components/games/PieceCollectGame';

type Piece = { type: string; color: 'w' | 'b' } | null;

const PIECE_EMOJI: Record<string, Record<string, string>> = {
  w: { P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔' },
  b: { P: '♟', R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚' },
};

function createPawnWarBoard(): Piece[][] {
  const board: Piece[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let c = 0; c < 8; c++) {
    board[1][c] = { type: 'P', color: 'b' };
    board[6][c] = { type: 'P', color: 'w' };
  }
  return board;
}

function getPawnMoves(board: Piece[][], row: number, col: number, color: 'w' | 'b'): [number, number][] {
  const moves: [number, number][] = [];
  const dir = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;

  // Forward
  if (row + dir >= 0 && row + dir < 8 && !board[row + dir][col]) {
    moves.push([row + dir, col]);
    // Double step
    if (row === startRow && !board[row + 2 * dir][col]) {
      moves.push([row + 2 * dir, col]);
    }
  }
  // Captures
  for (const dc of [-1, 1]) {
    const nr = row + dir, nc = col + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] && board[nr][nc]!.color !== color) {
      moves.push([nr, nc]);
    }
  }
  return moves;
}

const GamePlay = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Piece[][]>(createPawnWarBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [history, setHistory] = useState<Piece[][][]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);

  const legalMoves = useMemo(() => {
    if (!selected) return [];
    const [r, c] = selected;
    const piece = board[r][c];
    if (!piece || piece.color !== turn) return [];
    if (piece.type === 'P') return getPawnMoves(board, r, c, piece.color);
    return [];
  }, [selected, board, turn]);

  if (gameId === 'piece-collect') return <PieceCollectGame />;

  const isLegal = (r: number, c: number) => legalMoves.some(([mr, mc]) => mr === r && mc === c);

  const handleClick = (row: number, col: number) => {
    if (gameOver) return;

    const piece = board[row][col];

    if (selected) {
      if (isLegal(row, col)) {
        // Make move
        const newBoard = board.map(r => [...r]);
        setHistory(prev => [...prev, board.map(r => [...r])]);
        newBoard[row][col] = newBoard[selected[0]][selected[1]];
        newBoard[selected[0]][selected[1]] = null;

        // Check promotion
        if (newBoard[row][col]?.type === 'P') {
          if ((newBoard[row][col]!.color === 'w' && row === 0) || (newBoard[row][col]!.color === 'b' && row === 7)) {
            newBoard[row][col] = { type: 'Q', color: newBoard[row][col]!.color };
            toast.success('👑 Vezérré változott!');
          }
        }

        setBoard(newBoard);
        setSelected(null);

        // Check win
        const opponent = turn === 'w' ? 'b' : 'w';
        const opponentPawns = newBoard.flat().filter(p => p?.color === opponent && p?.type === 'P');
        if (opponentPawns.length === 0) {
          setGameOver(turn === 'w' ? '🎉 Nyertél!' : '😔 A gép nyert!');
          return;
        }

        // Simple AI for black - random move
        if (turn === 'w') {
          setTurn('b');
          setTimeout(() => makeAIMove(newBoard), 500);
        }
      } else {
        setSelected(piece && piece.color === turn ? [row, col] : null);
      }
    } else if (piece && piece.color === turn) {
      setSelected([row, col]);
    }
  };

  const makeAIMove = (currentBoard: Piece[][]) => {
    const moves: { from: [number, number]; to: [number, number] }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && p.color === 'b' && p.type === 'P') {
          const pawnMoves = getPawnMoves(currentBoard, r, c, 'b');
          pawnMoves.forEach(to => moves.push({ from: [r, c], to }));
        }
      }
    }

    if (moves.length === 0) {
      setGameOver('🎉 Nyertél! A gép nem tud lépni!');
      setTurn('w');
      return;
    }

    // Prefer captures
    const captures = moves.filter(m => currentBoard[m.to[0]][m.to[1]]);
    const move = captures.length > 0 ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];

    const newBoard = currentBoard.map(r => [...r]);
    setHistory(prev => [...prev, currentBoard.map(r => [...r])]);
    newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
    newBoard[move.from[0]][move.from[1]] = null;

    // Check promotion
    if (newBoard[move.to[0]][move.to[1]]?.type === 'P' && move.to[0] === 7) {
      newBoard[move.to[0]][move.to[1]] = { type: 'Q', color: 'b' };
    }

    // Check if player has pawns left
    const playerPawns = newBoard.flat().filter(p => p?.color === 'w' && p?.type === 'P');
    if (playerPawns.length === 0) {
      setGameOver('😔 A gép nyert!');
    }

    setBoard(newBoard);
    setTurn('w');
  };

  const undo = () => {
    if (history.length < 2) return;
    setBoard(history[history.length - 2]);
    setHistory(prev => prev.slice(0, -2));
    setTurn('w');
  };

  const hint = () => {
    // Find a legal move for white
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === 'w' && p.type === 'P') {
          const moves = getPawnMoves(board, r, c, 'w');
          if (moves.length > 0) {
            setSelected([r, c]);
            toast.info('💡 Próbáld ezt a gyalogot mozgatni!');
            return;
          }
        }
      }
    }
  };

  const title = gameId === 'pawn-war' ? '⚔️ Gyalogháború' : '🎮 Játék';

  return (
    <div className="min-h-screen bg-gradient-to-b from-island-sky to-background p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/games')} className="font-display">
            <ArrowLeft className="w-4 h-4 mr-1" /> Vissza
          </Button>
          <h1 className="text-2xl font-display text-foreground">{title}</h1>
        </div>

        {gameOver && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-accent/20 border-2 border-accent rounded-2xl p-4 text-center mb-4"
          >
            <p className="text-2xl font-display text-foreground">{gameOver}</p>
            <Button onClick={() => { setBoard(createPawnWarBoard()); setGameOver(null); setTurn('w'); setHistory([]); }} className="mt-2 child-button bg-primary text-primary-foreground">
              🔄 Újra!
            </Button>
          </motion.div>
        )}

        <div className="flex justify-center mb-4">
          <div className="inline-grid grid-cols-8 gap-0 rounded-xl overflow-hidden border-4 border-foreground/20 shadow-xl">
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => {
                const piece = board[row][col];
                const isLight = (row + col) % 2 === 0;
                const isSelected = selected?.[0] === row && selected?.[1] === col;
                const isLegalMove = isLegal(row, col);

                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => handleClick(row, col)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center relative transition-all ${
                      isLight ? 'bg-amber-100' : 'bg-amber-700'
                    } ${isSelected ? 'ring-4 ring-accent ring-inset' : ''}`}
                  >
                    {piece && (
                      <span className="text-2xl sm:text-3xl">{PIECE_EMOJI[piece.color][piece.type]}</span>
                    )}
                    {isLegalMove && !piece && (
                      <div className="w-3 h-3 rounded-full bg-primary/50" />
                    )}
                    {isLegalMove && piece && (
                      <div className="absolute inset-0 border-4 border-primary/50 rounded-sm" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={undo} variant="outline" className="child-button" disabled={history.length < 2 || !!gameOver}>
            <Undo2 className="w-5 h-5 mr-2" /> Vissza
          </Button>
          <Button onClick={hint} variant="outline" className="child-button" disabled={turn !== 'w' || !!gameOver}>
            <Lightbulb className="w-5 h-5 mr-2" /> Tipp
          </Button>
        </div>

        <p className="text-center text-muted-foreground mt-4 font-body">
          {turn === 'w' && !gameOver ? '🤍 Te jössz!' : turn === 'b' && !gameOver ? '🖤 A gép gondolkodik...' : ''}
        </p>
      </div>
    </div>
  );
};

export default GamePlay;
