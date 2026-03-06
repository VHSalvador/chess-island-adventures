import React from 'react';
import { BookOpen, Swords, Sparkles, HelpCircle, Music, Star } from 'lucide-react';
import type { Step } from './types';

export const STEPS: Step[] = ['story', 'movement', 'adventure', 'practice', 'song', 'badge'];

export const STEP_LABELS: Record<Step, string> = {
  story: 'Történet',
  movement: 'Lépések',
  adventure: 'Kaland',
  practice: 'Kvíz',
  song: 'Dal',
  badge: 'Csillag',
};

export const STEP_ICONS: Record<Step, React.ReactNode> = {
  story: React.createElement(BookOpen, { className: 'w-5 h-5' }),
  movement: React.createElement(Swords, { className: 'w-5 h-5' }),
  adventure: React.createElement(Sparkles, { className: 'w-5 h-5' }),
  practice: React.createElement(HelpCircle, { className: 'w-5 h-5' }),
  song: React.createElement(Music, { className: 'w-5 h-5' }),
  badge: React.createElement(Star, { className: 'w-5 h-5' }),
};

export const CHAPTER_BACKGROUNDS: Record<number, string> = {
  1: 'from-emerald-900 via-green-800 to-emerald-700',
  2: 'from-amber-900 via-stone-800 to-amber-700',
  3: 'from-purple-900 via-violet-800 to-purple-700',
  4: 'from-yellow-800 via-amber-700 to-yellow-600',
  5: 'from-orange-900 via-rose-800 to-orange-700',
  6: 'from-teal-900 via-green-900 to-teal-800',
};
