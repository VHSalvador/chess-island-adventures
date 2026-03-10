import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CharacterSVG, CHARACTER_INFO } from '@/components/characters/CharacterSVG';
import { useSound } from '@/hooks/useSound';
import { useSpeech } from '@/hooks/useSpeech';

type PieceType = 'pawn' | 'rook' | 'bishop' | 'knight' | 'queen' | 'king';

interface Level {
  id: number;
  pieceType: PieceType;
  characterId: string;
  boardSize: number;
  startPos: [number, number];
  stars: [number, number][];
  tutorialText: string;
}

const LEVELS: Level[] = [
  {
    id: 1,
    pieceType: 'pawn',
    characterId: 'bence',
    boardSize: 6,
    startPos: [5, 2],
    // Zigzag path: [5,2]→[4,2]→[3,3]→[2,2]→[1,3]→[0,2]
    stars: [[4, 2], [3, 3], [2, 2], [1, 3], [0, 2]],
    tutorialText: 'Bence előre lép, és átlósan is tud ütni! Gyűjtsd össze a csillagokat!',
  },
  {
    id: 2,
    pieceType: 'rook',
    characterId: 'erno',
    boardSize: 8,
    startPos: [7, 4],
    stars: [[7, 0], [0, 0], [0, 7], [7, 7], [3, 4], [4, 0]],
    tutorialText: 'Ernő egyenesen siet: előre, hátra, jobbra, balra! Tervezd meg az útvonalat!',
  },
  {
    id: 3,
    pieceType: 'bishop',
    characterId: 'szonja',
    boardSize: 6,
    startPos: [5, 0],
    // All stars share the same diagonal color (row+col = 5, odd).
    // Solution: [5,0]→[3,2]→[1,4]→[0,5]→[2,3]→[4,1]
    stars: [[4, 1], [3, 2], [1, 4], [0, 5], [2, 3]],
    tutorialText: 'Szonja csak átlósan tud lépni — de akármennyit egyszerre! Kövess minden ferde irányt!',
  },
  {
    id: 4,
    pieceType: 'knight',
    characterId: 'huba',
    boardSize: 6,
    startPos: [5, 2],
    // Forced L-jump chain: [5,2]→[3,1]→[1,2]→[2,4]→[4,5]→[5,3]
    stars: [[3, 1], [1, 2], [2, 4], [4, 5], [5, 3]],
    tutorialText: 'Huba okosan L-alakban ugrik: két lépés egy irányba, egy lépés oldalra! Ugorj sorban!',
  },
  {
    id: 5,
    pieceType: 'queen',
    characterId: 'vanda',
    boardSize: 7,
    startPos: [6, 3],
    stars: [[0, 3], [3, 0], [3, 6], [6, 0], [6, 6], [2, 2]],
    tutorialText: 'Vanda mindenhova eljut: egyenesen és átlósan is! Tervezd meg a legjobb útvonalat!',
  },
  {
    id: 6,
    pieceType: 'king',
    characterId: 'balazs',
    boardSize: 5,
    startPos: [4, 2],
    // S-shaped winding path: [4,2]→[3,1]→[2,0]→[1,1]→[0,2]→[1,3]→[2,4]→[3,3]
    stars: [[3, 1], [2, 0], [1, 1], [0, 2], [1, 3], [2, 4], [3, 3]],
    tutorialText: 'Balázs bölcsen lép: egyszerre csak egyet, de bármely irányba! Figyeld a körültekintő útját!',
  },
];

const PIECE_EMOJI: Record<PieceType, string> = {
  pawn: '♟',
  rook: '♜',
  bishop: '♝',
  knight: '♞',
  queen: '♛',
  king: '♚',
};

const BG: Record<PieceType, string> = {
  pawn: 'from-emerald-900 via-green-800 to-emerald-700',
  rook: 'from-amber-900 via-stone-800 to-amber-700',
  bishop: 'from-purple-900 via-violet-800 to-purple-700',
  knight: 'from-yellow-900 via-amber-800 to-yellow-700',
  queen: 'from-orange-900 via-amber-800 to-orange-700',
  king: 'from-teal-900 via-emerald-800 to-teal-700',
};

function getLegalMoves(
  type: PieceType,
  row: number,
  col: number,
  boardSize: number,
): [number, number][] {
  const moves: [number, number][] = [];
  const B = boardSize;
  const inBounds = (r: number, c: number) => r >= 0 && r < B && c >= 0 && c < B;

  if (type === 'pawn') {
    if (row - 1 >= 0) {
      moves.push([row - 1, col]);
      if (col - 1 >= 0) moves.push([row - 1, col - 1]);
      if (col + 1 < B) moves.push([row - 1, col + 1]);
    }
  }

  if (type === 'rook') {
    for (let i = 0; i < B; i++) {
      if (i !== row) moves.push([i, col]);
      if (i !== col) moves.push([row, i]);
    }
  }

  if (type === 'bishop') {
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      let r = row + dr, c = col + dc;
      while (inBounds(r, c)) { moves.push([r, c]); r += dr; c += dc; }
    }
  }

  if (type === 'knight') {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
      const r = row + dr, c = col + dc;
      if (inBounds(r, c)) moves.push([r, c]);
    }
  }

  if (type === 'queen') {
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      let r = row + dr, c = col + dc;
      while (inBounds(r, c)) { moves.push([r, c]); r += dr; c += dc; }
    }
  }

  if (type === 'king') {
    for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
      const r = row + dr, c = col + dc;
      if (inBounds(r, c)) moves.push([r, c]);
    }
  }

  return moves;
}

function getCellSize(boardSize: number): string {
  if (boardSize <= 5) return 'w-16 h-16 sm:w-20 sm:h-20';
  if (boardSize === 6) return 'w-14 h-14 sm:w-16 sm:h-16';
  if (boardSize === 7) return 'w-11 h-11 sm:w-13 sm:h-13';
  return 'w-10 h-10 sm:w-12 sm:h-12';
}

function initStars(level: Level): Set<string> {
  return new Set(level.stars.map(([r, c]) => `${r},${c}`));
}

const PieceCollectGame: React.FC = () => {
  const navigate = useNavigate();
  const { playCorrect, playWrong, playBadge, playClick } = useSound();
  const { praiseStar, praiseBadge } = useSpeech();

  const [levelIndex, setLevelIndex] = useState(0);
  const [piecePos, setPiecePos] = useState<[number, number]>(LEVELS[0].startPos);
  const [remainingStars, setRemainingStars] = useState<Set<string>>(() => initStars(LEVELS[0]));
  const [collectedCount, setCollectedCount] = useState(0);
  const [selected, setSelected] = useState(false);
  const [phase, setPhase] = useState<'playing' | 'levelComplete' | 'allComplete' | 'stuck'>('playing');

  const level = LEVELS[levelIndex];
  const info = CHARACTER_INFO[level.characterId as keyof typeof CHARACTER_INFO];
  const totalStars = level.stars.length;

  const legalMoves = useMemo(
    () => selected ? getLegalMoves(level.pieceType, piecePos[0], piecePos[1], level.boardSize) : [],
    [selected, level.pieceType, piecePos, level.boardSize],
  );

  const legalMoveSet = useMemo(
    () => new Set(legalMoves.map(([r, c]) => `${r},${c}`)),
    [legalMoves],
  );

  const handleCellClick = useCallback((row: number, col: number) => {
    if (phase !== 'playing') return;
    const key = `${row},${col}`;

    if (row === piecePos[0] && col === piecePos[1]) {
      setSelected(s => !s);
      playClick();
      return;
    }

    if (!selected) return;

    if (!legalMoveSet.has(key)) {
      setSelected(false);
      playWrong();
      return;
    }

    setPiecePos([row, col]);
    setSelected(false);

    const nextStars = new Set(remainingStars);
    if (nextStars.has(key)) {
      playCorrect();
      praiseStar();
      nextStars.delete(key);
      setRemainingStars(nextStars);
      setCollectedCount(c => c + 1);

      if (nextStars.size === 0) {
        setTimeout(() => {
          playBadge();
          praiseBadge();
          setPhase(levelIndex + 1 >= LEVELS.length ? 'allComplete' : 'levelComplete');
        }, 350);
        return;
      }
    }

    // Stuck detection: only for pawn (can only move forward)
    if (level.pieceType === 'pawn' && nextStars.size > 0) {
      const allBehind = [...nextStars].every(k => {
        const starRow = parseInt(k.split(',')[0]);
        return starRow >= row;
      });
      if (allBehind) setTimeout(() => setPhase('stuck'), 400);
    }
  }, [phase, piecePos, selected, legalMoveSet, remainingStars, levelIndex, level.pieceType,
      playClick, playCorrect, playWrong, playBadge, praiseStar, praiseBadge]);

  const handleNextLevel = useCallback(() => {
    playClick();
    const next = levelIndex + 1;
    setLevelIndex(next);
    setPiecePos(LEVELS[next].startPos);
    setRemainingStars(initStars(LEVELS[next]));
    setCollectedCount(0);
    setSelected(false);
    setPhase('playing');
  }, [levelIndex, playClick]);

  const handleReset = useCallback(() => {
    playClick();
    setPiecePos(level.startPos);
    setRemainingStars(initStars(level));
    setCollectedCount(0);
    setSelected(false);
    setPhase('playing');
  }, [level, playClick]);

  const cellSize = getCellSize(level.boardSize);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${BG[level.pieceType]} p-4`}>
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playClick(); navigate('/games'); }}
            className="font-display text-white hover:text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Játékok
          </Button>
          <span className="font-display text-white text-lg">
            ⭐ {collectedCount} / {totalStars}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="font-display text-white/70 hover:text-white hover:bg-white/20 text-sm"
          >
            🔄 Újra
          </Button>
        </div>

        {/* Level progress dots */}
        <div className="flex justify-center gap-2 mt-2">
          {LEVELS.map((l, i) => (
            <div
              key={l.id}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < levelIndex ? 'bg-yellow-400' : i === levelIndex ? 'bg-white scale-125' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col items-center gap-4">
        {/* Character + tutorial */}
        <div className="flex items-center gap-4 w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex-shrink-0">
            <CharacterSVG characterId={level.characterId} size={72} />
          </div>
          <div>
            <p className="font-display text-white text-lg">{info.name}</p>
            <p className="text-white/80 text-sm leading-relaxed">{level.tutorialText}</p>
          </div>
        </div>

        {/* Board */}
        <div className="relative">
          <div
            className="inline-grid rounded-xl overflow-hidden border-4 border-white/30 shadow-2xl"
            style={{ gridTemplateColumns: `repeat(${level.boardSize}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: level.boardSize }, (_, row) =>
              Array.from({ length: level.boardSize }, (_, col) => {
                const isLight = (row + col) % 2 === 0;
                const isPiece = row === piecePos[0] && col === piecePos[1];
                const key = `${row},${col}`;
                const isStar = remainingStars.has(key);
                const isLegal = legalMoveSet.has(key);
                const isSelected = isPiece && selected;

                return (
                  <div
                    key={key}
                    onClick={() => handleCellClick(row, col)}
                    className={[
                      cellSize,
                      'flex items-center justify-center relative cursor-pointer select-none',
                      isLight ? 'bg-amber-100' : 'bg-amber-700',
                      isSelected ? 'ring-4 ring-inset ring-white' : '',
                    ].join(' ')}
                  >
                    {isPiece && (
                      <motion.span
                        className="text-3xl sm:text-4xl z-10"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {PIECE_EMOJI[level.pieceType]}
                      </motion.span>
                    )}

                    {isStar && !isPiece && (
                      <motion.span
                        className="text-2xl sm:text-3xl"
                        animate={{ scale: [1, 1.25, 1], rotate: [0, 12, -12, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ⭐
                      </motion.span>
                    )}

                    {isLegal && !isPiece && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      >
                        {isStar ? (
                          <div className="absolute inset-0 border-4 border-white/80 rounded animate-pulse" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-white/50" />
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Stuck overlay */}
          <AnimatePresence>
            {phase === 'stuck' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl"
              >
                <div className="text-5xl mb-3">😅</div>
                <p className="font-display text-white text-xl mb-2 text-center px-4">
                  Jaj, lemaradtak csillagok!
                </p>
                <p className="text-white/70 text-sm mb-5 text-center px-4">
                  Próbáld más irányból!
                </p>
                <Button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-display text-lg px-8"
                >
                  🔄 Próbáljuk újra!
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level complete / all complete overlay */}
          <AnimatePresence>
            {(phase === 'levelComplete' || phase === 'allComplete') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-6xl mb-3"
                >
                  {phase === 'allComplete' ? '🏆' : '⭐'}
                </motion.div>
                <p className="font-display text-white text-2xl mb-1">
                  {phase === 'allComplete' ? 'Minden csillag a tiéd!' : 'Szint teljesítve!'}
                </p>
                <p className="text-white/70 text-sm mb-5">
                  {totalStars} csillag összegyűjtve
                </p>
                {phase === 'levelComplete' ? (
                  <Button
                    onClick={handleNextLevel}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 font-display text-lg px-8"
                  >
                    Következő szint ➡️
                  </Button>
                ) : (
                  <Button
                    onClick={() => { playClick(); navigate('/games'); }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 font-display text-lg px-8"
                  >
                    🎮 Vissza a játékokhoz
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instruction hint */}
        {phase === 'playing' && (
          <p className="text-white/60 text-sm text-center">
            {selected
              ? 'Koppints egy zöld mezőre, ahova lépjen!'
              : `Koppints ${info.name}re a kijelöléshez!`}
          </p>
        )}
      </div>
    </div>
  );
};

export default PieceCollectGame;
