import React from 'react';
import { CharacterSVG } from '@/components/characters/CharacterSVG';
import { AudioButton } from './AudioButton';
import { CHARACTER_INFO } from '@/components/characters/CharacterSVG';
import type { ChapterData } from '@/data/chapters';
import type { ChapterAudio } from '@/data/chapterAudio';

interface AdventureStepProps {
  chapter: ChapterData;
  audio?: ChapterAudio;
  playAudio: (src?: string) => void;
}

export const AdventureStep: React.FC<AdventureStepProps> = ({ chapter, audio, playAudio }) => {
  const info = CHARACTER_INFO[chapter.characterId as keyof typeof CHARACTER_INFO];
  return (
    <div className="text-center space-y-6">
      <div className="animate-breathe">
        <CharacterSVG characterId={chapter.characterId} size={100} className="mx-auto" />
      </div>
      <h2 className="text-2xl font-display text-white">{info.name} kalandja</h2>
      <div className="bg-black/20 rounded-2xl p-6 border border-white/20">
        <div className="flex justify-end mb-2">
          <AudioButton src={audio?.narrator[2]} playAudio={playAudio} />
        </div>
        <p className="text-lg text-white/90 leading-relaxed">{chapter.adventure}</p>
      </div>
    </div>
  );
};
