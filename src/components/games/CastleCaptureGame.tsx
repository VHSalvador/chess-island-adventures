import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Undo2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { useSound } from '@/hooks/useSound';

type Color = 'w' | 'b';
type PieceType = 'P' | 'R' | 'N' | 'B' | 'Q' | 'K';
type Square = { type: PieceType; color: Color } | null;
type Board = Square[][];

const EMOJI: Record<Color, Record<PieceType, string>> = {
  w: { P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔' },
  b: { P: '♟', R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚' },
};

function createBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  // Black "castle" — standard back row + pawns
  const backRow: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  backRow.forEach((t, c) => { b[0][c] = { type: t, color: 'b' }; });
  for (let c = 0; c < 8; c++) b[1][c] = { type: 'P', color: 'b' };
  // White "attackers" — standard starting position
  for (let c = 0; c < 8; c++) b[6][c] = { type: 'P', color: 'w' };
  backRow.forEach((t, c) => { b[7][c] = { type: t, color: 'w' }; });
  return b;
}

function legalMoves(board: Board, row: number, col: number): [number, number][] {
  const sq = board[row][col];
  if (!sq) return [];
  const { type, color } = sq;
  const opp: Color = color === 'w' ? 'b' : 'w';
  const moves: [number, number][] = [];

  const inB = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const empty = (r: number, c: number) => !board[r][c];
  const enemy = (r: number, c: number) => board[r][c]?.color === opp;
  const ok = (r: number, c: number) => inB(r, c) && (empty(r, c) || enemy(r, c));

  const slide = (dr: number, dc: number) => {
    let r = row + dr, c = col + dc;
    while (inB(r, c)) {
      if (empty(r, c)) { moves.push([r, c]); }
      else { if (enemy(r, c)) moves.push([r, c]); break; }
      r += dr; c += dc;
    }
  };

  switch (type) {
    case 'P': {
      const dir = color === 'w' ? -1 : 1;
      const start = color === 'w' ? 6 : 1;
      if (inB(row + dir, col) && empty(row + dir, col)) {
        moves.push([row + dir, col]);
        if (row === start && empty(row + 2 * dir, col)) moves.push([row + 2 * dir, col]);
      }
      for (const dc of [-1, 1]) {
        if (inB(row + dir, col + dc) && enemy(row + dir, col + dc)) moves.push([row + dir, col + dc]);
      }
      break;
    }
    case 'R': [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc]) => slide(dr, dc)); break;
    case 'B': [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => slide(dr, dc)); break;
    case 'Q': [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => slide(dr, dc)); break;
    case 'N':
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
        .forEach(([dr,dc]) => { if (ok(row+dr, col+dc)) moves.push([row+dr, col+dc]); });
      break;
    case 'K':
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        if (ok(row+dr, col+dc)) moves.push([row+dr, col+dc]);
      }
      break;
  }
  return moves;
}

function promote(board: Board): Board {
  const b = board.map(r => [...r]);
  for (let c = 0; c < 8; c++) {
    if (b[0][c]?.type === 'P' && b[0][c]?.color === 'w') b[0][c] = { type: 'Q', color: 'w' };
    if (b[7][c]?.type === 'P' && b[7][c]?.color === 'b') b[7][c] = { type: 'Q', color: 'b' };
  }
  return b;
}

function applyMove(board: Board, from: [number, number], to: [number, number]): Board {
  const b = board.map(r => [...r]);
  b[to[0]][to[1]] = b[from[0]][from[1]];
  b[from[0]][from[1]] = null;
  return promote(b);
}

function hasKing(board: Board, color: Color): boolean {
  return board.some(row => row.some(sq => sq?.type === 'K' && sq.color === color));
}

function aiMove(board: Board): Board | null {
  const all: { from: [number, number]; to: [number, number] }[] = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c]?.color === 'b') {
      legalMoves(board, r, c).forEach(to => all.push({ from: [r, c], to }));
    }
  }
  if (all.length === 0) return null;
  const captures = all.filter(m => board[m.to[0]][m.to[1]]?.color === 'w');
  const move = captures.length > 0
    ? captures[Math.floor(Math.random() * captures.length)]
    : all[Math.floor(Math.random() * all.length)];
  return applyMove(board, move.from, move.to);
}

const CastleCaptureGame: React.FC = () => {
  const navigate = useNavigate();
  const { playClick, playCorrect, playWrong, playBadge } = useSound();

  const [board, setBoard] = useState<Board>(createBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<Color>('w');
  const [history, setHistory] = useState<Board[]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  const moves = useMemo(
    () => (selected ? legalMoves(board, selected[0], selected[1]) : []),
    [board, selected],
  );
  const moveSet = useMemo(() => new Set(moves.map(([r, c]) => `${r},${c}`)), [moves]);

  const handleAI = useCallback((currentBoard: Board) => {
    setAiThinking(true);
    setTimeout(() => {
      const next = aiMove(currentBoard);
      if (!next) { setGameOver('🎉 Nyertél! A vár elesett!'); setAiThinking(false); return; }

      if (!hasKing(next, 'w')) {
        setBoard(next);
        setGameOver('😔 A vár megvédték magukat...');
        playWrong();
        setAiThinking(false);
        return;
      }
      setBoard(next);
      setTurn('w');
      setAiThinking(false);
    }, 500);
  }, [playWrong]);

  const handleClick = useCallback((row: number, col: number) => {
    if (gameOver || turn !== 'w' || aiThinking) return;
    const sq = board[row][col];
    const key = `${row},${col}`;

    if (selected) {
      if (moveSet.has(key)) {
        const captured = board[row][col];
        const next = applyMove(board, selected, [row, col]);
        setHistory(h => [...h, board]);
        setBoard(next);
        setSelected(null);

        if (captured?.type === 'K') {
          playBadge();
          setGameOver('🎉 Megszerezted a várat! Nyertél!');
          return;
        }
        playCorrect();
        setTurn('b');
        handleAI(next);
      } else {
        setSelected(sq?.color === 'w' ? [row, col] : null);
        playClick();
      }
    } else {
      if (sq?.color === 'w') { setSelected([row, col]); playClick(); }
    }
  }, [gameOver, turn, aiThinking, board, selected, moveSet, handleAI, playClick, playCorrect, playBadge]);

  const undo = useCallback(() => {
    if (history.length < 2 || gameOver) return;
    setBoard(history[history.length - 2]);
    setHistory(h => h.slice(0, -2));
    setSelected(null);
    setTurn('w');
    playClick();
  }, [history, gameOver, playClick]);

  const hint = useCallback(() => {
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color === 'w' && legalMoves(board, r, c).length > 0) {
        setSelected([r, c]);
        toast.info('💡 Próbáld ezt a figurát mozgatni!');
        return;
      }
    }
  }, [board]);

  const reset = useCallback(() => {
    setBoard(createBoard());
    setSelected(null);
    setTurn('w');
    setHistory([]);
    setGameOver(null);
    setAiThinking(false);
    playClick();
  }, [playClick]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-stone-800 to-amber-700 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost" size="sm"
            onClick={() => { playClick(); navigate('/games'); }}
            className="font-display text-white hover:text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Vissza
          </Button>
          <h1 className="text-2xl font-display text-white">🏰 Kastélyfoglalás</h1>
        </div>

        {/* Goal */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 mb-4 text-center">
          <p className="font-display text-white text-sm">
            Cél: üsd ki az ellenfél <span className="text-yellow-300">Királyát ♚</span> a várból!
          </p>
        </div>

        {/* Game over banner */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/20 border-2 border-amber-400 rounded-2xl p-4 text-center mb-4"
            >
              <p className="text-2xl font-display text-white">{gameOver}</p>
              <Button
                onClick={reset}
                className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-display"
              >
                🔄 Újra!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Turn indicator */}
        {!gameOver && (
          <p className="text-center text-white/70 font-body text-sm mb-3">
            {aiThinking ? '🖤 A vár védekezik...' : '🤍 Te jössz! Foglald el a várat!'}
          </p>
        )}

        {/* Board */}
        <div className="flex justify-center mb-4">
          <div className="inline-grid grid-cols-8 gap-0 rounded-xl overflow-hidden border-4 border-white/20 shadow-2xl">
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => {
                const sq = board[row][col];
                const isLight = (row + col) % 2 === 0;
                const isSel = selected?.[0] === row && selected?.[1] === col;
                const isMove = moveSet.has(`${row},${col}`);
                const isCapture = isMove && !!sq;

                return (
                  <button
                    key={`${row}-${col}`}
                    onClick={() => handleClick(row, col)}
                    className={[
                      'w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center relative transition-all',
                      isLight ? 'bg-amber-100' : 'bg-amber-700',
                      isSel ? 'ring-4 ring-inset ring-white' : '',
                    ].join(' ')}
                  >
                    {sq && (
                      <span className={`text-xl sm:text-2xl leading-none select-none ${sq.color === 'b' && sq.type === 'K' ? 'drop-shadow-[0_0_6px_rgba(255,215,0,0.9)]' : ''}`}>
                        {EMOJI[sq.color][sq.type]}
                      </span>
                    )}
                    {isMove && !isCapture && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3 h-3 rounded-full bg-white/50" />
                      </div>
                    )}
                    {isCapture && (
                      <div className="absolute inset-0 border-4 border-white/60 pointer-events-none" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={undo}
            variant="outline"
            className="child-button bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            disabled={history.length < 2 || !!gameOver || aiThinking}
          >
            <Undo2 className="w-4 h-4 mr-2" /> Vissza
          </Button>
          <Button
            onClick={hint}
            variant="outline"
            className="child-button bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            disabled={turn !== 'w' || !!gameOver || aiThinking}
          >
            <Lightbulb className="w-4 h-4 mr-2" /> Tipp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CastleCaptureGame;
