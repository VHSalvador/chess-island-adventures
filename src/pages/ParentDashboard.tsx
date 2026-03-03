import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CharacterSVG, CHARACTER_INFO, type CharacterId } from '@/components/characters/CharacterSVG';
import { ArrowLeft, Star, Coins, BookOpen } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const characterOrder: CharacterId[] = ['bence', 'erno', 'szonja', 'huba', 'vanda', 'balazs'];

const ProgressRing = ({ percent, size = 56, strokeWidth = 5, color }: { percent: number; size?: number; strokeWidth?: number; color: string }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="progress-ring -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
};

const ParentDashboard = () => {
  const { childProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: progress } = useQuery({
    queryKey: ['parent-progress', childProfile?.id],
    queryFn: async () => {
      if (!childProfile) return [];
      const { data } = await supabase.from('chapter_progress').select('*').eq('child_profile_id', childProfile.id).order('chapter_number');
      return data || [];
    },
    enabled: !!childProfile,
  });

  const { data: quizResults } = useQuery({
    queryKey: ['parent-quiz-results', childProfile?.id],
    queryFn: async () => {
      if (!childProfile) return [];
      const { data } = await supabase.from('quiz_results').select('*').eq('child_profile_id', childProfile.id);
      return data || [];
    },
    enabled: !!childProfile,
  });

  const { data: inventory } = useQuery({
    queryKey: ['parent-inventory', childProfile?.id],
    queryFn: async () => {
      if (!childProfile) return [];
      const { data } = await supabase.from('island_inventory').select('*').eq('child_profile_id', childProfile.id);
      return data || [];
    },
    enabled: !!childProfile,
  });

  const completedChapters = progress?.filter(p => p.completed).length || 0;
  const totalStars = progress?.reduce((sum, p) => sum + p.stars_earned, 0) || 0;

  const chessCorrect = quizResults?.filter(q => q.quiz_type === 'chess' && q.correct).length || 0;
  const chessTotal = quizResults?.filter(q => q.quiz_type === 'chess').length || 1;
  const eqCorrect = quizResults?.filter(q => q.quiz_type === 'eq' && q.correct).length || 0;
  const eqTotal = quizResults?.filter(q => q.quiz_type === 'eq').length || 1;
  const mathCorrect = quizResults?.filter(q => q.quiz_type === 'math' && q.correct).length || 0;
  const mathTotal = quizResults?.filter(q => q.quiz_type === 'math').length || 1;

  const radarData = [
    { skill: 'Sakk', value: Math.round((chessCorrect / chessTotal) * 100), fullMark: 100 },
    { skill: 'EQ', value: Math.round((eqCorrect / eqTotal) * 100), fullMark: 100 },
    { skill: 'Matek', value: Math.round((mathCorrect / mathTotal) * 100), fullMark: 100 },
  ];

  const charInfo = childProfile ? CHARACTER_INFO[childProfile.character_id as keyof typeof CHARACTER_INFO] : null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="font-display rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
            </Button>
            <h1 className="text-xl sm:text-2xl font-display text-foreground">Szülői felület</h1>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="rounded-xl font-display">Kijelentkezés</Button>
        </div>

        {childProfile && (
          <>
            {/* Profile card */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="isometric-card p-5 sm:p-6 mb-5 flex items-center gap-4"
            >
              <CharacterSVG characterId={childProfile.character_id} size={80} />
              <div className="flex-1">
                <h2 className="font-display text-xl text-card-foreground">{childProfile.character_name}</h2>
                <p className="text-muted-foreground text-sm">{charInfo?.name} a {charInfo?.piece}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-accent" />
                    <span className="font-bold text-sm text-card-foreground">{childProfile.aranytaller}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-current" />
                    <span className="font-bold text-sm text-card-foreground">{totalStars} csillag</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chapter progress with rings */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="isometric-card p-5 sm:p-6 mb-5"
            >
              <h3 className="font-display text-lg text-card-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Fejezetek ({completedChapters}/6)
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {characterOrder.map((charId, i) => {
                  const ch = progress?.find(p => p.chapter_number === i + 1);
                  const completed = ch?.completed || false;
                  const pct = completed ? 100 : ch ? 50 : 0;
                  const info = CHARACTER_INFO[charId];
                  return (
                    <div key={charId} className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <ProgressRing percent={pct} color={completed ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CharacterSVG characterId={charId} size={32} />
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-xs font-display text-muted-foreground">{info.name}</span>
                      <span className="text-[10px] font-bold text-card-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Radar chart + stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="isometric-card p-5"
              >
                <h3 className="font-display text-lg text-card-foreground mb-2">Képességek</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12, fontFamily: "'Baloo 2', cursive", fill: 'hsl(var(--foreground))' }} />
                    <Radar name="Képesség" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="isometric-card p-5"
              >
                <h3 className="font-display text-lg text-card-foreground mb-3">Kvíz eredmények</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Sakk (Logika)', correct: chessCorrect, total: chessTotal, icon: '♟️' },
                    { label: 'EQ (Empátia)', correct: eqCorrect, total: eqTotal, icon: '💚' },
                    { label: 'Matek (Számok)', correct: mathCorrect, total: mathTotal, icon: '🔢' },
                  ].map((q) => {
                    const pct = Math.round((q.correct / q.total) * 100);
                    return (
                      <div key={q.label}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-display text-card-foreground">{q.icon} {q.label}</span>
                          <span className="font-bold text-card-foreground">{q.correct}/{q.total}</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Island stats */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="isometric-card p-5"
            >
              <h3 className="font-display text-lg text-card-foreground mb-2">Sziget</h3>
              <p className="text-3xl font-bold text-primary">{inventory?.length || 0}</p>
              <p className="text-muted-foreground text-sm">tárgy elhelyezve a szigeten</p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
