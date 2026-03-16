export interface ChapterAudio {
  poem?: string;
  narrator: (string | undefined)[];  // [story, movement/watchStoryText, adventure]
  quiz: (string | undefined)[];
  song?: string;
}

const chars = ['Bence', 'Erno', 'Szonja', 'Huba', 'Vanda', 'Balazs'] as const;

function chapterEntries(): Record<number, ChapterAudio> {
  return Object.fromEntries(
    chars.map((c, i) => [
      i + 1,
      {
        poem: `/Hangok/${c}/${c}Mondoka.mp3`,
        narrator: [
          `/Hangok/${c}/Narrator${c}1.mp3`,
          `/Hangok/${c}/Narrator${c}2.mp3`,
          `/Hangok/${c}/Narrator${c}3.mp3`,
        ],
        quiz: [1, 2, 3, 4, 5, 6].map(n => `/Hangok/${c}/${c}Kviz${n}.mp3`),
        song: `/Hangok/${c}/${c}Dala.mp3`,
      },
    ])
  );
}

export const chapterAudio: Record<number, ChapterAudio> = {
  ...chapterEntries(),
  // Chapter 1 keeps original filenames (already recorded)
  1: {
    poem: '/Hangok/Bence/BenceMondoka.mp3',
    narrator: [
      '/Hangok/Bence/NarratorBence1.mp3',
      '/Hangok/Bence/NarratorBence2.mp3',
      '/Hangok/Bence/NarrattorBence3.mp3',
    ],
    quiz: [1, 2, 3, 4, 5, 6].map(n => `/Hangok/Bence/BenceKviz${n}.mp3`),
    song: '/Hangok/Bence/BenceDala.mp3',
  },
};
