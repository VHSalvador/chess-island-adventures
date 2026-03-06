import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCompleteChapter } from '@/hooks/data/useCompleteChapter';
import { chapters } from '@/data/chapters';
import { chapterAudio } from '@/data/chapterAudio';
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

const Chapter = () => {
  const { id } = useParams<{ id: string }>();
  const chapterNum = parseInt(id || '1');
  const chapter = chapters[chapterNum - 1];
  const navigate = useNavigate();
  const { childProfile, refreshChildProfile } = useAuth();
  const { playClick, playBadge } = useSound();
  const { praiseBadge } = useSpeech();
  const audio = chapterAudio[chapterNum];
  const { playAudio } = useAudio();

  const { initialStep, initialQuizIndex, loaded, saveStep } = useChapterProgress(
    childProfile?.id,
    chapterNum
  );

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [chapterComplete, setChapterComplete] = useState(false);

  // Sync initial step once loaded
  React.useEffect(() => {
    if (loaded) {
      setCurrentStep(initialStep);
    }
  }, [loaded, initialStep]);

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
  } = useQuiz(chapterNum, childProfile?.id, saveStep, initialQuizIndex);

  const step = STEPS[currentStep];

  const completeChapter = useCallback(async () => {
    if (!childProfile) return;
    playBadge();
    praiseBadge();
    setChapterComplete(true);

    confetti({ particleCount: 90, spread: 75, origin: { x: 0.5, y: 0.55 }, colors: ['#FFD700', '#FF6B6B', '#4CAF50', '#9C5FBF', '#FF9800'] });
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 100, origin: { x: 0.3, y: 0.6 }, colors: ['#FFD700', '#ffffff', '#4ab0f5'] });
    }, 350);

    await (supabase.rpc as any)('adjust_aranytaller', { profile_id: childProfile.id, delta: quizScore + 10 });
    await supabase.from('child_profiles').update({ current_chapter: Math.max(childProfile.current_chapter, chapterNum + 1) }).eq('id', childProfile.id);
    await supabase.from('chapter_progress').upsert({ child_profile_id: childProfile.id, chapter_number: chapterNum, step: 'badge', completed: true, stars_earned: 1 }, { onConflict: 'child_profile_id,chapter_number' });

    if (chapterNum < 6) {
      await supabase.from('chapter_progress').upsert({ child_profile_id: childProfile.id, chapter_number: chapterNum + 1, step: 'story' }, { onConflict: 'child_profile_id,chapter_number' });
    }

    await refreshChildProfile();
  }, [childProfile, chapterNum, quizScore, playBadge, praiseBadge, refreshChildProfile]);

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
          />
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${CHAPTER_BACKGROUNDS[chapterNum] || 'from-blue-900 to-blue-700'} p-4`}>
      <ChapterHeader title={chapter.title} currentStep={currentStep} onBack={handleBack} />

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

        {step !== 'practice' && step !== 'badge' && (
          <ChapterNavigation currentStep={currentStep} onPrev={handlePrev} onNext={handleNext} />
        )}
      </div>
    </div>
  );
};

export default Chapter;
