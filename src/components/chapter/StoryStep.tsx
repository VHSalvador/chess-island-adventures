import React from 'react';
import { motion } from 'framer-motion';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { AudioButton } from './AudioButton';
import type { ChapterData } from '@/data/chapters';
import type { ChapterAudio } from '@/data/chapterAudio';

interface StoryStepProps {
  chapter: ChapterData;
  audio?: ChapterAudio;
  playAudio: (src?: string) => void;
}

export const StoryStep: React.FC<StoryStepProps> = ({ chapter, audio, playAudio }) => (
  <div className="text-center space-y-6">
    <motion.div className="animate-float">
      <CharacterSVG characterId={chapter.characterId} size={140} className="mx-auto" />
    </motion.div>
    <h2 className="text-2xl font-display text-white">{chapter.title}</h2>
    <div className="bg-black/20 rounded-2xl p-6 border border-white/20 text-left">
      <div className="flex justify-end mb-2">
        <AudioButton src={audio?.poem} playAudio={playAudio} />
      </div>
      <p className="font-display text-lg text-white italic whitespace-pre-line">{chapter.poem}</p>
    </div>
    <div className="flex items-start gap-3">
      <p className="text-lg text-white/90 leading-relaxed flex-1">{chapter.story}</p>
      <AudioButton src={audio?.narrator[0]} playAudio={playAudio} />
    </div>
  </div>
);
