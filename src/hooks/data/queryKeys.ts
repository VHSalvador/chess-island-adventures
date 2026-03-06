export const queryKeys = {
  shopItems: () => ['shop-items'] as const,
  islandInventory: (profileId?: string) => ['island-inventory', profileId] as const,
  chapterProgress: (profileId?: string) => ['chapter-progress', profileId] as const,
  quizResults: (profileId?: string) => ['quiz-results', profileId] as const,
};
