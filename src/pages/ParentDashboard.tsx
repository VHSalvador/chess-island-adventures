import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CharacterSVG, CHARACTER_INFO } from '@/components/characters/CharacterSVG';
import { ArrowLeft, Star, Coins, BookOpen, Brain, Calculator } from 'lucide-react';

const ParentDashboard = () => {
  const { childProfile, user, signOut } = useAuth();
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
  const chessTotal = quizResults?.filter(q => q.quiz_type === 'chess').length || 0;
  const eqCorrect = quizResults?.filter(q => q.quiz_type === 'eq' && q.correct).length || 0;
  const eqTotal = quizResults?.filter(q => q.quiz_type === 'eq').length || 0;
  const mathCorrect = quizResults?.filter(q => q.quiz_type === 'math' && q.correct).length || 0;
  const mathTotal = quizResults?.filter(q => q.quiz_type === 'math').length || 0;

  const charInfo = childProfile ? CHARACTER_INFO[childProfile.character_id as keyof typeof CHARACTER_INFO] : null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="font-display">
              <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
            </Button>
            <h1 className="text-2xl font-display text-foreground">👨‍👩‍👧 Szülői felület</h1>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>Kijelentkezés</Button>
        </div>

        {childProfile && (
          <>
            {/* Child info */}
            <div className="bg-card rounded-2xl border-2 border-border p-6 mb-6 flex items-center gap-4">
              <CharacterSVG characterId={childProfile.character_id} size={80} />
              <div>
                <h2 className="font-display text-xl text-foreground">{childProfile.character_name}</h2>
                <p className="text-muted-foreground">{charInfo?.name} a {charInfo?.piece}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-accent" />
                    <span className="font-bold text-foreground">{childProfile.aranytaller} Aranytallér</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-current" />
                    <span className="font-bold text-foreground">{totalStars} csillag</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-card rounded-2xl border-2 border-border p-4">
                <h3 className="font-display text-lg text-foreground mb-3">
                  <BookOpen className="w-5 h-5 inline mr-2" />Fejezetek
                </h3>
                <p className="text-3xl font-bold text-primary">{completedChapters} / 6</p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map(ch => {
                    const completed = progress?.some(p => p.chapter_number === ch && p.completed);
                    return (
                      <div key={ch} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {completed ? '⭐' : ch}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card rounded-2xl border-2 border-border p-4">
                <h3 className="font-display text-lg text-foreground mb-3">🏝️ Sziget</h3>
                <p className="text-3xl font-bold text-primary">{inventory?.length || 0}</p>
                <p className="text-muted-foreground text-sm">tárgy a szigeten</p>
              </div>
            </div>

            {/* Quiz scores */}
            <div className="bg-card rounded-2xl border-2 border-border p-6">
              <h3 className="font-display text-lg text-foreground mb-4">📊 Kvíz eredmények</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-1">♟️</div>
                  <p className="font-display text-sm text-foreground">Sakk</p>
                  <p className="text-lg font-bold text-primary">{chessCorrect}/{chessTotal}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">💚</div>
                  <p className="font-display text-sm text-foreground">EQ</p>
                  <p className="text-lg font-bold text-primary">{eqCorrect}/{eqTotal}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">🔢</div>
                  <p className="font-display text-sm text-foreground">Matek</p>
                  <p className="text-lg font-bold text-primary">{mathCorrect}/{mathTotal}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
