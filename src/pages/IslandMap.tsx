import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CHARACTER_INFO, type CharacterId } from '@/components/characters/CharacterSVG';
import { Coins, TreePine, Gamepad2, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SceneSetup from '@/components/3d/SceneSetup';
import IslandTerrain from '@/components/3d/IslandTerrain';
import IslandTree from '@/components/3d/IslandTree';
import BalanceTree from '@/components/3d/BalanceTree';
import ChessPiece3D, { PIECE_COLORS } from '@/components/3d/ChessPiece3D';
import DomainMarker from '@/components/3d/DomainMarker';
import PathRoad from '@/components/3d/PathRoad';
import { CharacterSVG } from '@/components/characters/CharacterSVG';

const characterOrder: CharacterId[] = ['bence', 'erno', 'szonja', 'huba', 'vanda', 'balazs'];

const pieceTypes = ['pawn', 'rook', 'bishop', 'knight', 'queen', 'king'] as const;

// 3D positions for each domain on the island
const domainPositions3D: [number, number, number][] = [
  [-4, 0.4, 3],    // Bence - front left
  [4, 0.4, 2.5],   // Ernő - front right
  [-5, 0.4, -1],   // Szonja - mid left
  [5, 0.4, -1.5],  // Huba - mid right
  [-3, 0.4, -4.5], // Vanda - back left
  [3, 0.4, -5],    // Balázs - back right
];

const pathConnections = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 5 },
];

// Decorative tree positions
const treePlacements: [number, number, number][] = [
  [-7, 0.3, 0], [6.5, 0.3, -0.5], [-2, 0.3, 5.5],
  [2, 0.3, -6.5], [6, 0.3, -5], [-6, 0.3, -4],
  [0, 0.3, 6], [5, 0.3, 5],
];

const IslandMap = () => {
  const { childProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: progress } = useQuery({
    queryKey: ['chapter-progress', childProfile?.id],
    queryFn: async () => {
      if (!childProfile) return [];
      const { data } = await supabase
        .from('chapter_progress')
        .select('*')
        .eq('child_profile_id', childProfile.id)
        .order('chapter_number');
      return data || [];
    },
    enabled: !!childProfile,
  });

  const getChapterStatus = (chapterNum: number) => {
    const cp = progress?.find(p => p.chapter_number === chapterNum);
    if (cp?.completed) return 'completed';
    if (chapterNum <= (childProfile?.current_chapter || 1)) return 'unlocked';
    return 'locked';
  };

  const completedCount = progress?.filter(p => p.completed).length || 0;

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <SceneSetup>
          <IslandTerrain />

          {/* Balance Tree in center */}
          <BalanceTree completedCount={completedCount} />

          {/* Decorative trees */}
          {treePlacements.map((pos, i) => (
            <IslandTree
              key={`tree-${i}`}
              position={pos}
              scale={0.6 + Math.random() * 0.4}
            />
          ))}

          {/* Paths between domains */}
          {pathConnections.map((seg, i) => {
            const toStatus = getChapterStatus(seg.to + 1);
            return (
              <PathRoad
                key={`path-${i}`}
                from={domainPositions3D[seg.from]}
                to={domainPositions3D[seg.to]}
                locked={toStatus === 'locked'}
              />
            );
          })}

          {/* Domain markers and chess pieces */}
          {characterOrder.map((charId, index) => {
            const pos = domainPositions3D[index];
            const status = getChapterStatus(index + 1);
            const info = CHARACTER_INFO[charId];

            return (
              <React.Fragment key={charId}>
                <DomainMarker
                  position={pos}
                  color={PIECE_COLORS[charId] || '#888'}
                  locked={status === 'locked'}
                  completed={status === 'completed'}
                />
                <ChessPiece3D
                  type={pieceTypes[index]}
                  position={[pos[0], pos[1] + 0.1, pos[2]]}
                  color={PIECE_COLORS[charId] || '#888'}
                  name={info.name}
                  pieceName={info.piece}
                  locked={status === 'locked'}
                  completed={status === 'completed'}
                  onClick={() => {
                    if (status !== 'locked') navigate(`/chapter/${index + 1}`);
                  }}
                />
              </React.Fragment>
            );
          })}
        </SceneSetup>
      </div>

      {/* Header bar — HTML overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="isometric-card px-4 py-2 flex items-center gap-3 bg-card/80 backdrop-blur-sm">
            <CharacterSVG characterId={childProfile?.character_id || 'bence'} size={36} />
            <div>
              <p className="font-display text-sm sm:text-base text-card-foreground leading-tight">{childProfile?.character_name}</p>
              <div className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-accent" />
                <span className="font-bold text-xs text-accent-foreground">{childProfile?.aranytaller || 0}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate('/games')} className="rounded-xl font-display text-xs sm:text-sm bg-card/80 backdrop-blur-sm">
              <Gamepad2 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Játékok</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/my-island')} className="rounded-xl font-display text-xs sm:text-sm bg-card/80 backdrop-blur-sm">
              <TreePine className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Szigetem</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/parent')} className="rounded-xl font-display text-xs sm:text-sm bg-card/80 backdrop-blur-sm">
              <LayoutDashboard className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Szülő</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={signOut} className="absolute bottom-4 right-4 text-xs text-muted-foreground hover:underline z-20 bg-card/50 backdrop-blur-sm px-3 py-1 rounded-full">
        Kijelentkezés
      </button>
    </div>
  );
};

export default IslandMap;
