import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { chapters } from '@/data/chapters';
import { quizQuestions } from '@/data/quizzes';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterSVG, CHARACTER_INFO } from '@/components/characters/CharacterSVG';
import { ChessMovementDemo } from '@/components/ChessMovementDemo';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Star, Music, BookOpen, Swords, Sparkles, HelpCircle } from 'lucide-react';

type Step = 'story' | 'movement' | 'adventure' | 'practice' | 'song' | 'badge';
const STEPS: Step[] = ['story', 'movement', 'adventure', 'practice', 'song', 'badge'];
const STEP_LABELS: Record<Step, string> = {
  story: 'Történet',
  movement: 'Lépések',
  adventure: 'Kaland',
  practice: 'Kvíz',
  song: 'Dal',
  badge: 'Csillag',
};
const STEP_ICONS: Record<Step, React.ReactNode> = {
  story: <BookOpen className="w-5 h-5" />,
  movement: <Swords className="w-5 h-5" />,
  adventure: <Sparkles className="w-5 h-5" />,
  practice: <HelpCircle className="w-5 h-5" />,
  song: <Music className="w-5 h-5" />,
  badge: <Star className="w-5 h-5" />,
};

const Chapter = () => {
  const { id } = useParams<{ id: string }>();
  const chapterNum = parseInt(id || '1');
  const chapter = chapters[chapterNum - 1];
  const navigate = useNavigate();
  const { childProfile, refreshChildProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [chapterComplete, setChapterComplete] = useState(false);

  const chapterQuizzes = quizQuestions.filter(q => q.chapterNumber === chapterNum);
  const currentQuiz = chapterQuizzes[quizIndex];
  const step = STEPS[currentStep];

  if (!chapter) {
    return <div className="min-h-screen flex items-center justify-center">Fejezet nem található</div>;
  }

  const info = CHARACTER_INFO[chapter.characterId as keyof typeof CHARACTER_INFO];

  const handleAnswer = async (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(optionIndex);
    const correct = optionIndex === currentQuiz.correctIndex;

    if (correct) {
      setQuizScore(prev => prev + currentQuiz.reward);
      toast.success(`✅ Helyes! +${currentQuiz.reward} Aranytallér!`);
    } else {
      toast.error('❌ Nem jó, de ne add fel!');
    }

    if (childProfile) {
      await supabase.from('quiz_results').insert({
        child_profile_id: childProfile.id,
        chapter_number: chapterNum,
        quiz_type: currentQuiz.type,
        question: currentQuiz.question,
        answer: currentQuiz.options[optionIndex],
        correct,
        aranytaller_earned: correct ? currentQuiz.reward : 0,
      });
    }
  };

  const nextQuiz = () => {
    if (quizIndex < chapterQuizzes.length - 1) {
      setQuizIndex(prev => prev + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const completeChapter = async () => {
    if (!childProfile) return;
    setChapterComplete(true);

    // Award coins
    await supabase.from('child_profiles').update({
      aranytaller: (childProfile.aranytaller || 0) + quizScore + 10,
      current_chapter: Math.max(childProfile.current_chapter, chapterNum + 1),
    }).eq('id', childProfile.id);

    // Update progress
    await supabase.from('chapter_progress').upsert({
      child_profile_id: childProfile.id,
      chapter_number: chapterNum,
      step: 'badge',
      completed: true,
      stars_earned: 1,
    }, { onConflict: 'child_profile_id,chapter_number' });

    // Create next chapter progress if needed
    if (chapterNum < 6) {
      await supabase.from('chapter_progress').upsert({
        child_profile_id: childProfile.id,
        chapter_number: chapterNum + 1,
        step: 'story',
      }, { onConflict: 'child_profile_id,chapter_number' });
    }

    await refreshChildProfile();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'story':
        return (
          <div className="text-center space-y-6">
            <div className="animate-float">
              <CharacterSVG characterId={chapter.characterId} size={140} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-display text-foreground">{chapter.title}</h2>
            <div className="bg-muted rounded-2xl p-6 text-left">
              <p className="font-display text-lg text-foreground italic whitespace-pre-line">{chapter.poem}</p>
            </div>
            <p className="text-lg text-foreground leading-relaxed">{chapter.story}</p>
          </div>
        );
      case 'movement':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display text-center text-foreground">Hogyan lép {info.name}?</h2>
            <p className="text-center text-lg text-foreground">{chapter.movementDescription}</p>
            <ChessMovementDemo pieceType={chapter.movePattern} />
          </div>
        );
      case 'adventure':
        return (
          <div className="text-center space-y-6">
            <div className="animate-breathe">
              <CharacterSVG characterId={chapter.characterId} size={100} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-display text-foreground">{info.name} kalandja</h2>
            <div className="bg-muted rounded-2xl p-6">
              <p className="text-lg text-foreground leading-relaxed">{chapter.adventure}</p>
            </div>
          </div>
        );
      case 'practice':
        if (!currentQuiz) return null;
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display text-foreground">Kvíz</h2>
              <span className="text-sm text-muted-foreground font-medium">
                {quizIndex + 1} / {chapterQuizzes.length}
              </span>
            </div>
            <div className="bg-muted rounded-2xl p-6">
              <p className="text-xl font-display text-foreground mb-4">{currentQuiz.question}</p>
              <div className="space-y-3">
                {currentQuiz.options.map((option, i) => {
                  let btnClass = 'w-full text-left p-4 rounded-xl border-2 text-lg font-body transition-all ';
                  if (answered) {
                    if (i === currentQuiz.correctIndex) btnClass += 'border-primary bg-primary/20 text-foreground';
                    else if (i === selectedAnswer) btnClass += 'border-destructive bg-destructive/20 text-foreground';
                    else btnClass += 'border-border bg-card text-muted-foreground';
                  } else {
                    btnClass += 'border-border bg-card text-foreground hover:border-accent hover:bg-accent/10';
                  }
                  return (
                    <motion.button
                      key={i}
                      whileHover={!answered ? { scale: 1.02 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(i)}
                      className={btnClass}
                      disabled={answered}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
              {answered && (
                <Button onClick={nextQuiz} className="w-full mt-4 child-button bg-accent text-accent-foreground">
                  {quizIndex < chapterQuizzes.length - 1 ? 'Következő kérdés ➡️' : 'Tovább a dalhoz! 🎵'}
                </Button>
              )}
            </div>
          </div>
        );
      case 'song':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-display text-foreground">🎵 {info.name} dala</h2>
            <div className="bg-accent/20 rounded-2xl p-6 border-2 border-accent">
              <p className="text-xl font-display text-foreground whitespace-pre-line">{chapter.song}</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-display text-lg text-foreground">Csináld velem! 💃</h3>
              {chapter.songActions.map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="bg-card rounded-xl p-3 text-lg font-body text-foreground border border-border"
                >
                  {i + 1}. {action}
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'badge':
        return (
          <div className="text-center space-y-6">
            {!chapterComplete ? (
              <>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: 2 }}>
                  <Star className="w-24 h-24 mx-auto text-accent fill-current" />
                </motion.div>
                <h2 className="text-3xl font-display text-foreground">Szuper munka! 🎉</h2>
                <p className="text-lg text-foreground">
                  Összegyűjtöttél <span className="font-bold text-accent">{quizScore + 10}</span> Aranytallért!
                </p>
                <Button onClick={completeChapter} className="child-button bg-accent text-accent-foreground text-2xl px-12">
                  ⭐ Megszereztem a csillagot!
                </Button>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: 'spring', duration: 1 }}
                >
                  <Star className="w-32 h-32 mx-auto text-accent fill-current" />
                </motion.div>
                <h2 className="text-3xl font-display text-foreground">
                  {info.name} csillaga a tiéd! ⭐
                </h2>
                <Button onClick={() => navigate('/map')} className="child-button bg-primary text-primary-foreground text-xl">
                  🗺️ Vissza a térképre
                </Button>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-island-sky to-background p-4">
      {/* Progress bar */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/map')} className="font-display">
            <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
          </Button>
          <span className="font-display text-foreground">{chapter.title}</span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-accent' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {STEPS.map((s, i) => (
            <span key={s} className={`text-xs ${i === currentStep ? 'text-accent-foreground font-bold' : 'text-muted-foreground'}`}>
              {STEP_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${quizIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-3xl shadow-xl p-6 border-2 border-border"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons (except for practice/badge which have their own) */}
        {step !== 'practice' && step !== 'badge' && (
          <div className="flex gap-3 mt-4">
            {currentStep > 0 && (
              <Button
                onClick={() => setCurrentStep(prev => prev - 1)}
                variant="outline"
                className="flex-1 child-button"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Előző
              </Button>
            )}
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex-1 child-button bg-primary text-primary-foreground"
            >
              Következő <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapter;
