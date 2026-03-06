import React from 'react';
import { ChessMovementDemo } from '@/components/ChessMovementDemo';
import { AudioButton } from './AudioButton';
import { CHARACTER_INFO } from '@/components/characters/CharacterSVG';
import type { ChapterData } from '@/data/chapters';
import type { ChapterAudio } from '@/data/chapterAudio';

interface MovementStepProps {
  chapter: ChapterData;
  audio?: ChapterAudio;
  playAudio: (src?: string) => void;
}

export const MovementStep: React.FC<MovementStepProps> = ({ chapter, audio, playAudio }) => {
  const info = CHARACTER_INFO[chapter.characterId as keyof typeof CHARACTER_INFO];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display text-center text-white">Hogyan lép {info.name}?</h2>
      <div className="flex items-start justify-center gap-3">
        <p className="text-center text-lg text-white/90 flex-1">{chapter.movementDescription}</p>
        <AudioButton src={audio?.narrator[1]} playAudio={playAudio} />
      </div>
      <ChessMovementDemo pieceType={chapter.movePattern} />
    </div>
  );
};
