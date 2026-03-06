import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCompleteChapter } from '@/hooks/data/useCompleteChapter';
import { chapters } from '@/data/chapters';
import { chapterAudio } from '@/data/chapterAudio';
import { onboardingAudio } from '@/data/onboardingAudio';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import { useSpeech } from '@/hooks/useSpeech';
import { useChapterProgress } from '@/hooks/useChapterProgress';
import { useQuiz } from '@/hooks/useQuiz';
import { useAudio } from '@/components/chapter/AudioButton';
import { STEPS, CHAPTER_BACKGROUNDS } from '@/components/chapter/constants';
import { ChapterHeader } from '@/components/chapter/ChapterHeader';
import { ChapterNavigation } from '@/components/chapter/ChapterNavigation';
import { StoryStep } from '@/components/chapter/StoryStep';
import { MovementStep } from '@/components/chapter/MovementStep';
import { AdventureStep } from '@/components/chapter/AdventureStep';
import { QuizStep } from '@/components/chapter/QuizStep';
import { SongStep } from '@/components/chapter/SongStep';
import { BadgeStep } from '@/components/chapter/BadgeStep';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { Button } from '@/components/ui/button';

const Chapter = () => {
  const { id } = useParams<{ id: string }>();
  const chapterNum = parseInt(id || '1');
  const chapter = chapters[chapterNum - 1];
  const navigate = useNavigate();
  const { childProfile } = useAuth();
  const { playClick, playBadge } = useSound();
  const { praiseBadge } = useSpeech();
  const audio = chapterAudio[chapterNum];
  const { playAudio } = useAudio();
  const completeChapterMutation = useCompleteChapter();

  const { initialStep, initialQuizIndex, loaded, saveStep } = useChapterProgress(
    childProfile?.id,
    chapterNum
  );

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [chapterComplete, setChapterComplete] = useState(false);
  const [showChapterIntro, setShowChapterIntro] = useState(false);
  const [showFirstCoinHint, setShowFirstCoinHint] = useState(false);

  // Sync initial step once loaded
  React.useEffect(() => {
    if (loaded) {
      setCurrentStep(initialStep);
    }
  }, [loaded, initialStep]);

  // T2: Show chapter intro splash for chapter 1, once per child
  React.useEffect(() => {
    if (chapterNum === 1 && childProfile) {
      const key = `hint_chapter_intro_${childProfile.id}`;
      if (!localStorage.getItem(key)) {
        setShowChapterIntro(true);
        playAudio(onboardingAudio.hints.chapterIntro);
      }
    }
  }, [chapterNum, childProfile, playAudio]);

  const onFirstCorrect = useCallback(() => {
    if (!childProfile) return;
    const coinKey = `hint_first_coin_${childProfile.id}`;
    if (!localStorage.getItem(coinKey)) {
      localStorage.setItem(coinKey, '1');
      setShowFirstCoinHint(true);
      playAudio(onboardingAudio.hints.firstCoin);
      setTimeout(() => setShowFirstCoinHint(false), 3500);
    }
  }, [childProfile, playAudio]);

  const {
    chapterQuizzes,
    currentQuiz,
    quizIndex,
    quizScore,
    answered,
    selectedAnswer,
    quizFeedback,
    handleAnswer,
    nextQuiz,
  } = useQuiz(chapterNum, childProfile?.id, saveStep, initialQuizIndex, onFirstCorrect);

  const step = STEPS[currentStep];

  const completeChapter = useCallback(async () => {
    if (!childProfile) return;
    playBadge();
    praiseBadge();
    setChapterComplete(true);
    playAudio(onboardingAudio.hints.badgeComplete);

    confetti({ particleCount: 90, spread: 75, origin: { x: 0.5, y: 0.55 }, colors: ['#FFD700', '#FF6B6B', '#4CAF50', '#9C5FBF', '#FF9800'] });
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 100, origin: { x: 0.3, y: 0.6 }, colors: ['#FFD700', '#ffffff', '#4ab0f5'] });
    }, 350);

    completeChapterMutation.mutate({
      profileId: childProfile.id,
      chapterNum,
      quizScore,
      currentChapter: childProfile.current_chapter,
    });
  }, [childProfile, chapterNum, quizScore, playBadge, praiseBadge, completeChapterMutation, playAudio]);

  if (!chapter) {
    return <div className="min-h-screen flex items-center justify-center text-white">Fejezet nem található</div>;
  }

  const handleBack = () => { playClick(); navigate('/map'); };
  const handlePrev = () => { playClick(); setCurrentStep(prev => prev - 1); };
  const handleNext = () => {
    playClick();
    const nextIndex = currentStep + 1;
    setCurrentStep(nextIndex);
    void saveStep(STEPS[nextIndex]);
  };

  const renderStep = () => {
    switch (step) {
      case 'story':
        return <StoryStep chapter={chapter} audio={audio} playAudio={playAudio} />;
      case 'movement':
        return <MovementStep chapter={chapter} audio={audio} playAudio={playAudio} />;
      case 'adventure':
        return <AdventureStep chapter={chapter} audio={audio} playAudio={playAudio} />;
      case 'practice':
        if (!currentQuiz) return null;
        return (
          <QuizStep
            currentQuiz={currentQuiz}
            quizIndex={quizIndex}
            totalQuizzes={chapterQuizzes.length}
            answered={answered}
            selectedAnswer={selectedAnswer}
            audio={audio}
            playAudio={playAudio}
            onAnswer={handleAnswer}
            onNext={() => nextQuiz(currentStep, setCurrentStep)}
            onPlayClick={playClick}
          />
        );
      case 'song':
        return <SongStep chapter={chapter} audio={audio} playAudio={playAudio} />;
      case 'badge':
        return (
          <BadgeStep
            characterId={chapter.characterId}
            quizScore={quizScore}
            chapterComplete={chapterComplete}
            onComplete={completeChapter}
            onNavigateMap={() => { playClick(); navigate('/map'); }}
            onNavigateMyIsland={() => { playClick(); navigate('/my-island'); }}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${CHAPTER_BACKGROUNDS[chapterNum] || 'from-blue-900 to-blue-700'} p-4`}>
      <ChapterHeader title={chapter.title} currentStep={currentStep} onBack={handleBack} />

      <AnimatePresence>
        {showChapterIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl"
            >
              <div className="animate-float">
                <CharacterSVG characterId={chapter.characterId} size={100} className="mx-auto" />
              </div>
              <h2 className="font-display text-white text-2xl">{chapter.title}</h2>
              <div className="space-y-3 text-left">
                {[
                  { icon: '📖', text: 'Hallgasd a mesét!' },
                  { icon: '♟️', text: 'Tanulj egy titkos mozdulatot!' },
                  { icon: '🪙', text: 'Helyes válaszokért Aranytallért kapsz!' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-display text-white">{item.text}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => {
                  localStorage.setItem(`hint_chapter_intro_${childProfile!.id}`, '1');
                  setShowChapterIntro(false);
                }}
                className="w-full child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display text-xl border-0"
              >
                Kezdjük! →
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${quizIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl text-white"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showFirstCoinHint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-80 bg-amber-500/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-2xl border border-amber-300/50 text-center pointer-events-none"
            >
              <p className="text-2xl mb-1">🪙🪙🪙</p>
              <p className="font-display text-white text-base leading-snug">
                Az első Aranytalléreid!
              </p>
              <p className="text-white/80 font-body text-sm mt-1">
                Gyűjts sokat — velük szép dolgokat vehetsz a Szigetedre!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'practice' && step !== 'badge' && (
          <ChapterNavigation currentStep={currentStep} onPrev={handlePrev} onNext={handleNext} />
        )}
      </div>
    </div>
  );
};

export default Chapter;
