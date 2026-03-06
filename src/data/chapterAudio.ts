export interface ChapterAudio {
  poem?: string;
  narrator: (string | undefined)[];  // [story, movement, adventure]
  quiz: (string | undefined)[];
  song?: string;
}

export const chapterAudio: Record<number, ChapterAudio> = {
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
