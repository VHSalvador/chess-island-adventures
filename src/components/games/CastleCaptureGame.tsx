import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Undo2, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
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
  const backRow: PieceType[] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  backRow.forEach((t, c) => { b[0][c] = { type: t, color: 'b' }; });
  for (let c = 0; c < 8; c++) b[1][c] = { type: 'P', color: 'b' };
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

function findKing(board: Board, color: Color): [number, number] | null {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c]?.type === 'K' && board[r][c]?.color === color) return [r, c];
  }
  return null;
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

// ── Story intro modal ──────────────────────────────────────────────────────────

const StoryIntro: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [page, setPage] = useState(0);

  const pages = [
    {
      title: 'A Fekete Sereg Támadása',
      emoji: '🏰',
      text: 'Ernő, a Bástya büszkén őrizte a Sakk-Sziget leghatalmasabb várát. Kőfalai eget vertek, tornyai csillogtak a napfényben.\n\nEgy éjszaka azonban sötét felhők ereszkedtek a szigetre. Egy titokzatos fekete sereg szállt partra a ködfátyolban — és hajnalra bevette a várat. A fekete Király bevonult a trónterembe, és becsukta maga után a kaput.',
    },
    {
      title: 'A Figurák Összegyűlnek',
      emoji: '⚔️',
      text: 'Reggel a figurák összegyűltek a vár kapuja előtt. Ott volt Bence, aki sosem adja fel. Szonja, aki átlósan kerül minden akadályt. Huba, aki L-alakban ugrik át a falakon. Vanda, aki minden irányba eljut. És Balázs, a bölcs király.\n\n„Visszafoglaljuk a várat!" — mondta Vanda határozottan. „Mindenki tudja a saját titkos mozdulatát. Együtt erősebbek vagyunk!"',
    },
    {
      title: 'A Te Küldetésed',
      emoji: '👑',
      text: 'Most te vezeted a fehér figurákat!\n\n🎯 Cél: keresd meg a fekete Királyt ♚ a táblán — ő az arany fénnyel ragyog — és üsd le!\n\n♟ Minden figura úgy mozog, ahogy a kalandjaiból megtanultad.\n\n💡 Ha elakadsz, nyomd meg a Tipp gombot — megmutatjuk, kit érdemes mozgatni.\n\nHa leütöd a fekete Királyt, a vár felszabadul!',
    },
  ];

  const current = pages[page];
  const isLast = page === pages.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 30, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="w-full max-w-md bg-gradient-to-b from-stone-800 to-amber-900 border-2 border-amber-400/50 rounded-3xl p-7 shadow-2xl"
      >
        {/* Page dots */}
        <div className="flex justify-center gap-2 mb-5">
          {pages.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${i === page ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/25'}`}
            />
          ))}
        </div>

        <div className="text-5xl text-center mb-3">{current.emoji}</div>
        <h2 className="font-display text-amber-300 text-xl text-center mb-4">{current.title}</h2>
        <p className="font-body text-white/85 text-base leading-relaxed whitespace-pre-line mb-7">
          {current.text}
        </p>

        <Button
          onClick={() => isLast ? onStart() : setPage(p => p + 1)}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-display text-xl py-4 rounded-2xl shadow-lg"
        >
          {isLast ? '⚔️ Kezdjük a rohamot!' : 'Tovább →'}
        </Button>
      </motion.div>
    </motion.div>
  );
};

// ── How-to-play collapsible ────────────────────────────────────────────────────

const HowToPlay: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 font-display text-white text-sm"
      >
        <span>📖 Hogyan játssz?</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 text-sm font-body text-white/80 border-t border-white/10 pt-3">
              <p>🎯 <strong className="text-white">Cél:</strong> üsd le a fekete Királyt ♚ — az arany fénnyel ragyogó figurát.</p>
              <p>🖱️ <strong className="text-white">Mozgás:</strong> koppints egy fehér figurára, majd koppints oda, ahova lépjen (zöld/fehér pontok mutatják a lehetséges lépéseket).</p>
              <p>⚔️ <strong className="text-white">Ütés:</strong> ha egy fehér keretes mezőre lépsz, leütöd az ott lévő fekete figurát.</p>
              <p>♟ <strong className="text-white">Előlépés:</strong> ha egy gyalog eléri a túlsó oldalt, automatikusan Vezérré változik.</p>
              <p>🔄 <strong className="text-white">Visszavonás:</strong> a Vissza gomb visszavonja a te és az ellenfél legutóbbi lépését.</p>
              <p>💡 <strong className="text-white">Tipp:</strong> a Tipp gomb kijelöl egy mozgatható figurát, ha elakadtál.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const CastleCaptureGame: React.FC = () => {
  const navigate = useNavigate();
  const { playClick, playCorrect, playWrong, playBadge } = useSound();

  const [showIntro, setShowIntro] = useState(true);
  const [board, setBoard] = useState<Board>(createBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<Color>('w');
  const [history, setHistory] = useState<Board[]>([]);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  const blackKingPos = useMemo(() => findKing(board, 'b'), [board]);

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
          setGameOver('🎉 Megszerezted a várat! A Sakk-Sziget megmenekült!');
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
    setShowIntro(true);
    playClick();
  }, [playClick]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-stone-800 to-amber-700 p-4">

      {/* Story intro modal */}
      <AnimatePresence>
        {showIntro && <StoryIntro onStart={() => setShowIntro(false)} />}
      </AnimatePresence>

      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost" size="sm"
            onClick={() => { playClick(); navigate('/games'); }}
            className="font-display text-white hover:text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Vissza
          </Button>
          <h1 className="text-2xl font-display text-white">🏰 Kastélyfoglalás</h1>
        </div>

        {/* Goal banner */}
        <div className="bg-amber-500/20 border border-amber-400/50 rounded-2xl px-4 py-2.5 mb-3 flex items-center justify-center gap-3">
          <motion.span
            className="text-2xl"
            animate={{ scale: [1, 1.18, 1], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            ♚
          </motion.span>
          <p className="font-display text-amber-200 text-sm leading-snug text-center">
            Cél: üsd le a <span className="text-yellow-300 font-bold">ragyogó fekete Királyt ♚</span> — ő védi a várat!
          </p>
        </div>

        {/* How to play */}
        <HowToPlay />

        {/* Game over banner */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white/20 border-2 border-amber-400 rounded-2xl p-4 text-center mb-3"
            >
              <p className="text-2xl font-display text-white mb-3">{gameOver}</p>
              <Button
                onClick={reset}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-display"
              >
                🔄 Újra!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Turn indicator */}
        {!gameOver && (
          <p className="text-center text-white/70 font-body text-sm mb-3">
            {aiThinking ? '🖤 A vár védekezik...' : '🤍 Te jössz! Vezesd a figurákat!'}
          </p>
        )}

        {/* Board */}
        <div className="flex justify-center mb-4">
          <div className="inline-grid grid-cols-8 gap-0 rounded-xl overflow-hidden border-4 border-amber-400/40 shadow-2xl">
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => {
                const sq = board[row][col];
                const isLight = (row + col) % 2 === 0;
                const isSel = selected?.[0] === row && selected?.[1] === col;
                const isMove = moveSet.has(`${row},${col}`);
                const isCapture = isMove && !!sq;
                const isBlackKing = sq?.type === 'K' && sq?.color === 'b';
                const isKingCell = blackKingPos?.[0] === row && blackKingPos?.[1] === col;

                return (
                  <div
                    key={`${row}-${col}`}
                    className="relative"
                    style={{ width: 40, height: 40 }}
                  >
                    {/* Pulsing golden glow behind the black King's cell */}
                    {isKingCell && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{ background: 'rgba(255,200,0,0.55)', borderRadius: 0 }}
                        animate={{ opacity: [0.45, 1, 0.45] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}

                    <button
                      onClick={() => handleClick(row, col)}
                      className={[
                        'w-full h-full flex items-center justify-center relative z-10 transition-all',
                        isKingCell ? '' : isLight ? 'bg-amber-100' : 'bg-amber-700',
                        isSel ? 'ring-4 ring-inset ring-white' : '',
                      ].join(' ')}
                      style={isKingCell ? { background: 'transparent' } : undefined}
                    >
                      {sq && (
                        <span
                          className="leading-none select-none"
                          style={{
                            fontSize: isBlackKing ? 26 : 20,
                            filter: isBlackKing
                              ? 'drop-shadow(0 0 5px rgba(255,215,0,1)) drop-shadow(0 0 10px rgba(255,160,0,0.9))'
                              : undefined,
                          }}
                        >
                          {EMOJI[sq.color][sq.type]}
                        </span>
                      )}

                      {/* Move dot */}
                      {isMove && !isCapture && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-3 h-3 rounded-full bg-white/55" />
                        </div>
                      )}

                      {/* Capture highlight */}
                      {isCapture && (
                        <div className="absolute inset-0 border-4 border-white/65 pointer-events-none" />
                      )}

                      {/* Extra pulsing ring around the King */}
                      {isKingCell && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none border-2 border-yellow-300"
                          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        {!gameOver && (
          <div className="flex justify-center gap-4 mb-4 text-xs font-body text-white/60">
            <span className="flex items-center gap-1">
              <span
                style={{
                  fontSize: 16,
                  filter: 'drop-shadow(0 0 4px rgba(255,215,0,1))',
                }}
              >♚</span>
              = a célpont
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white/55 inline-block" />
              = szabad mező
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 border-2 border-white/65 inline-block" />
              = ütheted
            </span>
          </div>
        )}

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
