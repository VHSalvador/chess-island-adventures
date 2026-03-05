import React, { useState } from 'react';
import confetti from 'canvas-confetti';
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
import { useSound } from '@/hooks/useSound';

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

const CHAPTER_BACKGROUNDS: Record<number, string> = {
  1: 'from-emerald-900 via-green-800 to-emerald-700',
  2: 'from-amber-900 via-stone-800 to-amber-700',
  3: 'from-purple-900 via-violet-800 to-purple-700',
  4: 'from-yellow-800 via-amber-700 to-yellow-600',
  5: 'from-orange-900 via-rose-800 to-orange-700',
  6: 'from-teal-900 via-green-900 to-teal-800',
};

const Chapter = () => {
  const { id } = useParams<{ id: string }>();
  const chapterNum = parseInt(id || '1');
  const chapter = chapters[chapterNum - 1];
  const navigate = useNavigate();
  const { childProfile, refreshChildProfile } = useAuth();
  const { playClick, playCorrect, playWrong, playBadge } = useSound();

  const [currentStep, setCurrentStep] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [chapterComplete, setChapterComplete] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const chapterQuizzes = quizQuestions.filter(q => q.chapterNumber === chapterNum);
  const currentQuiz = chapterQuizzes[quizIndex];
  const step = STEPS[currentStep];

  if (!chapter) {
    return <div className="min-h-screen flex items-center justify-center text-white">Fejezet nem található</div>;
  }

  const info = CHARACTER_INFO[chapter.characterId as keyof typeof CHARACTER_INFO];

  const handleAnswer = async (optionIndex: number) => {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(optionIndex);
    const correct = optionIndex === currentQuiz.correctIndex;

    if (correct) {
      playCorrect();
      setQuizFeedback('correct');
      setQuizScore(prev => prev + currentQuiz.reward);
      toast.success(`Helyes! +${currentQuiz.reward} Aranytallér!`);
    } else {
      playWrong();
      setQuizFeedback('wrong');
      toast.error('Nem jó, de ne add fel!');
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
    setQuizFeedback(null);
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
    playBadge();
    setChapterComplete(true);
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { x: 0.5, y: 0.55 },
      colors: ['#FFD700', '#FF6B6B', '#4CAF50', '#9C5FBF', '#FF9800'],
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { x: 0.3, y: 0.6 },
        colors: ['#FFD700', '#ffffff', '#4ab0f5'],
      });
    }, 350);

    await (supabase.rpc as any)('adjust_aranytaller', {
      profile_id: childProfile.id,
      delta: quizScore + 10,
    });
    await supabase.from('child_profiles').update({
      current_chapter: Math.max(childProfile.current_chapter, chapterNum + 1),
    }).eq('id', childProfile.id);

    await supabase.from('chapter_progress').upsert({
      child_profile_id: childProfile.id,
      chapter_number: chapterNum,
      step: 'badge',
      completed: true,
      stars_earned: 1,
    }, { onConflict: 'child_profile_id,chapter_number' });

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
            <motion.div
              className="animate-float"
              animate={
                quizFeedback === 'correct'
                  ? { y: [0, -20, 0] }
                  : quizFeedback === 'wrong'
                  ? { x: [0, -5, 5, -5, 5, 0] }
                  : { y: 0 }
              }
            >
              <CharacterSVG characterId={chapter.characterId} size={140} className="mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-display text-white">{chapter.title}</h2>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/20 text-left">
              <p className="font-display text-lg text-white italic whitespace-pre-line">{chapter.poem}</p>
            </div>
            <p className="text-lg text-white/90 leading-relaxed">{chapter.story}</p>
          </div>
        );
      case 'movement':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-display text-center text-white">Hogyan lép {info.name}?</h2>
            <p className="text-center text-lg text-white/90">{chapter.movementDescription}</p>
            <ChessMovementDemo pieceType={chapter.movePattern} />
          </div>
        );
      case 'adventure':
        return (
          <div className="text-center space-y-6">
            <div className="animate-breathe">
              <CharacterSVG characterId={chapter.characterId} size={100} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-display text-white">{info.name} kalandja</h2>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/20">
              <p className="text-lg text-white/90 leading-relaxed">{chapter.adventure}</p>
            </div>
          </div>
        );
      case 'practice':
        if (!currentQuiz) return null;
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display text-white">Kvíz</h2>
              <span className="text-sm text-white/60 font-medium">
                {quizIndex + 1} / {chapterQuizzes.length}
              </span>
            </div>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/20">
              <p className="text-xl font-display text-white mb-4">{currentQuiz.question}</p>
              <div className="space-y-3">
                {currentQuiz.options.map((option, i) => {
                  let btnClass = 'w-full text-left p-4 rounded-xl border-2 text-lg font-body transition-all ';
                  if (answered) {
                    if (i === currentQuiz.correctIndex) btnClass += 'border-emerald-400 bg-emerald-400/30 text-white';
                    else if (i === selectedAnswer) btnClass += 'border-red-400 bg-red-400/30 text-white';
                    else btnClass += 'border-white/10 bg-white/5 text-white/50';
                  } else {
                    btnClass += 'border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/60';
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
                <Button
                  onClick={() => { playClick(); nextQuiz(); }}
                  className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display rounded-2xl border-0"
                >
                  {quizIndex < chapterQuizzes.length - 1 ? 'Következő kérdés ➡️' : 'Tovább a dalhoz! 🎵'}
                </Button>
              )}
            </div>
          </div>
        );
      case 'song':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-display text-white">🎵 {info.name} dala</h2>
            <div className="bg-black/20 rounded-2xl p-6 border border-white/20">
              <p className="text-xl font-display text-white whitespace-pre-line">{chapter.song}</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-display text-lg text-white">Csináld velem! 💃</h3>
              {chapter.songActions.map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="bg-white/10 rounded-xl p-3 text-lg font-body text-white border border-white/20"
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
                  <Star className="w-24 h-24 mx-auto text-amber-400 fill-current" />
                </motion.div>
                <h2 className="text-3xl font-display text-white">Szuper munka! 🎉</h2>
                <p className="text-lg text-white/90">
                  Összegyűjtöttél <span className="font-bold text-amber-400">{quizScore + 10}</span> Aranytallért!
                </p>
                <Button
                  onClick={completeChapter}
                  className="child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-2xl px-12"
                >
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
                  <Star className="w-32 h-32 mx-auto text-amber-400 fill-current" />
                </motion.div>
                <h2 className="text-3xl font-display text-white">
                  {info.name} csillaga a tiéd! ⭐
                </h2>
                <Button
                  onClick={() => { playClick(); navigate('/map'); }}
                  className="child-button bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xl"
                >
                  🗺️ Vissza a térképre
                </Button>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${CHAPTER_BACKGROUNDS[chapterNum] || 'from-blue-900 to-blue-700'} p-4`}>
      {/* Header & Progress bar */}
      <div className="max-w-2xl mx-auto mb-4">
        <div className="flex items-center justify-between mb-2 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { playClick(); navigate('/map'); }}
            className="font-display text-white hover:text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Térkép
          </Button>
          <span className="font-display text-white">{chapter.title}</span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < currentStep ? 'bg-yellow-400' : i === currentStep ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`text-xs ${
                i < currentStep ? 'text-white' : i === currentStep ? 'text-white font-bold' : 'text-white/50'
              }`}
            >
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
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl text-white"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons (except for practice/badge which have their own) */}
        {step !== 'practice' && step !== 'badge' && (
          <div className="flex gap-3 mt-4">
            {currentStep > 0 && (
              <Button
                onClick={() => { playClick(); setCurrentStep(prev => prev - 1); }}
                variant="outline"
                className="flex-1 child-button bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Előző
              </Button>
            )}
            <Button
              onClick={() => { playClick(); setCurrentStep(prev => prev + 1); }}
              className="flex-1 child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
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
