import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { CharacterSVG, CHARACTER_INFO, type CharacterId } from '@/components/characters/CharacterSVG';
import { Lock, Star, Coins, TreePine, Gamepad2, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const characterOrder: CharacterId[] = ['bence', 'erno', 'szonja', 'huba', 'vanda', 'balazs'];

// Isometric positions for each domain on the island (viewBox 0 0 800 600)
const domainPositions = [
  { x: 200, y: 420, label: 'Bence rétje' },
  { x: 580, y: 400, label: 'Ernő vára' },
  { x: 150, y: 280, label: 'Szonja ligete' },
  { x: 620, y: 260, label: 'Huba mezeje' },
  { x: 250, y: 150, label: 'Vanda palotája' },
  { x: 550, y: 130, label: 'Balázs erdeje' },
];

// Path connections between domains
const pathSegments = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 5 },
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
    <div className="min-h-screen bg-gradient-to-b from-island-sky via-island-sky to-island-water-deep relative overflow-hidden">
      {/* Animated ocean waves */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-0">
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-full"
          style={{ background: 'linear-gradient(to top, hsl(var(--island-water-deep)), transparent)' }}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="isometric-card px-4 py-2 flex items-center gap-3">
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

      {/* Main island SVG */}
      <div className="relative w-full h-screen flex items-center justify-center pt-16">
        <svg viewBox="0 0 800 600" className="w-full max-w-4xl h-auto island-terrain" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="island-base" cx="50%" cy="50%">
              <stop offset="0%" stopColor="hsl(var(--island-grass))" />
              <stop offset="60%" stopColor="hsl(var(--island-grass-light))" />
              <stop offset="85%" stopColor="hsl(var(--island-sand))" />
              <stop offset="100%" stopColor="hsl(var(--island-sand))" stopOpacity="0.3" />
            </radialGradient>
            <filter id="terrain-shadow">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="hsl(215,65%,30%)" floodOpacity="0.3" />
            </filter>
            <filter id="fog-filter">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <radialGradient id="domain-glow-gold" cx="50%" cy="50%">
              <stop offset="0%" stopColor="hsl(45,100%,60%)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(45,100%,60%)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ocean */}
          <rect x="0" y="0" width="800" height="600" fill="hsl(var(--island-water))" opacity="0.15" />

          {/* Island shape - organic blob */}
          <ellipse cx="400" cy="310" rx="340" ry="240" fill="url(#island-base)" filter="url(#terrain-shadow)" />
          
          {/* Beach ring */}
          <ellipse cx="400" cy="315" rx="320" ry="225" fill="none" stroke="hsl(var(--island-sand))" strokeWidth="18" opacity="0.5" />

          {/* Grass patches for texture */}
          <ellipse cx="300" cy="280" rx="80" ry="40" fill="hsl(var(--island-grass))" opacity="0.3" />
          <ellipse cx="500" cy="320" rx="90" ry="35" fill="hsl(var(--island-grass))" opacity="0.25" />
          <ellipse cx="380" cy="200" rx="60" ry="30" fill="hsl(var(--island-grass-light))" opacity="0.2" />

          {/* Path connections */}
          {pathSegments.map((seg, i) => {
            const from = domainPositions[seg.from];
            const to = domainPositions[seg.to];
            const mx = (from.x + to.x) / 2 + (i % 2 === 0 ? 30 : -30);
            const my = (from.y + to.y) / 2 + (i % 2 === 0 ? -20 : 20);
            const toStatus = getChapterStatus(seg.to + 1);
            return (
              <path
                key={i}
                d={`M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`}
                stroke="hsl(var(--island-path))"
                strokeWidth="6"
                strokeDasharray={toStatus === 'locked' ? '8 8' : 'none'}
                fill="none"
                opacity={toStatus === 'locked' ? 0.3 : 0.7}
                strokeLinecap="round"
              />
            );
          })}

          {/* Small decorative trees */}
          {[
            { x: 120, y: 350 }, { x: 680, y: 340 }, { x: 350, y: 480 },
            { x: 450, y: 130 }, { x: 700, y: 180 }, { x: 100, y: 200 },
            { x: 300, y: 380 }, { x: 520, y: 450 },
          ].map((t, i) => (
            <g key={`tree-${i}`} transform={`translate(${t.x}, ${t.y})`}>
              <ellipse cx="0" cy="12" rx="8" ry="3" fill="black" opacity="0.08" />
              <rect x="-2" y="-2" width="4" height="14" rx="2" fill="hsl(30, 30%, 40%)" />
              <ellipse cx="0" cy="-8" rx="10" ry="10" fill="hsl(120, 45%, 45%)" opacity="0.8" />
              <ellipse cx="-3" cy="-10" rx="4" ry="4" fill="white" opacity="0.1" />
            </g>
          ))}

          {/* Balance Tree in center */}
          <g transform="translate(400, 290)">
            <ellipse cx="0" cy="25" rx="18" ry="5" fill="black" opacity="0.1" />
            <rect x="-5" y="-5" width="10" height="30" rx="4" fill="hsl(30, 35%, 38%)" />
            {/* Crown grows with completed chapters */}
            <ellipse cx="0" cy={-15 - completedCount * 2} rx={18 + completedCount * 3} ry={16 + completedCount * 2} fill="hsl(120, 55%, 48%)" />
            <ellipse cx="-5" cy={-18 - completedCount * 2} rx={8 + completedCount} ry={6 + completedCount} fill="white" opacity="0.12" />
            {completedCount > 0 && (
              <circle cx="0" cy={-15 - completedCount * 2} r={20 + completedCount * 3} fill="url(#domain-glow-gold)" />
            )}
            <text x="0" y="42" textAnchor="middle" fontSize="11" fontFamily="'Baloo 2', cursive" fill="hsl(var(--foreground))">
              Egyensúly Fája
            </text>
          </g>

          {/* Character domains */}
          {characterOrder.map((charId, index) => {
            const pos = domainPositions[index];
            const status = getChapterStatus(index + 1);
            const info = CHARACTER_INFO[charId];

            return (
              <g key={charId}>
                {/* Domain circle */}
                {status === 'completed' && (
                  <circle cx={pos.x} cy={pos.y} r="55" fill="url(#domain-glow-gold)" />
                )}
                <circle
                  cx={pos.x} cy={pos.y} r="42"
                  fill={status === 'locked' ? 'hsl(var(--muted))' : `hsl(var(--${charId}))`}
                  opacity={status === 'locked' ? 0.3 : 0.2}
                  stroke={status === 'completed' ? 'hsl(45,100%,55%)' : status === 'unlocked' ? `hsl(var(--${charId}))` : 'hsl(var(--border))'}
                  strokeWidth={status === 'completed' ? 3 : 2}
                />

                {/* Fog overlay for locked */}
                {status === 'locked' && (
                  <circle cx={pos.x} cy={pos.y} r="40" fill="hsl(var(--muted))" opacity="0.5" filter="url(#fog-filter)" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Character buttons overlaid on top of SVG */}
        <div className="absolute inset-0 pt-16">
          <div className="relative w-full h-full max-w-4xl mx-auto">
            {characterOrder.map((charId, index) => {
              const pos = domainPositions[index];
              const status = getChapterStatus(index + 1);
              const info = CHARACTER_INFO[charId];

              // Convert SVG coords (800x600) to percentage
              const pctX = (pos.x / 800) * 100;
              const pctY = (pos.y / 600) * 100;

              return (
                <motion.button
                  key={charId}
                  className="absolute z-10 flex flex-col items-center"
                  style={{
                    left: `${pctX}%`,
                    top: `${pctY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  whileHover={status !== 'locked' ? { scale: 1.12 } : {}}
                  whileTap={status !== 'locked' ? { scale: 0.92 } : {}}
                  onClick={() => {
                    if (status !== 'locked') navigate(`/chapter/${index + 1}`);
                  }}
                  disabled={status === 'locked'}
                >
                  <div className={`relative ${status === 'locked' ? 'opacity-35 grayscale' : ''}`}>
                    <motion.div
                      animate={status === 'unlocked' ? {
                        scale: [1, 1.06, 1],
                        y: [0, -4, 0],
                      } : status === 'completed' ? {
                        y: [0, -3, 0],
                      } : {}}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <CharacterSVG characterId={charId} size={64} />
                    </motion.div>
                    {status === 'completed' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-accent rounded-full p-1 shadow-md"
                      >
                        <Star className="w-3.5 h-3.5 text-accent-foreground fill-current" />
                      </motion.div>
                    )}
                    {status === 'locked' && (
                      <div className="absolute -top-1 -right-1 bg-muted rounded-full p-1 shadow-sm">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <span className={`font-display text-xs sm:text-sm mt-0.5 drop-shadow-sm ${status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {info.name}
                  </span>
                  <span className={`text-[10px] sm:text-xs ${status === 'locked' ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                    {info.piece}
                  </span>
                </motion.button>
              );
            })}
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
