import { useCallback } from 'react';

const PHRASES = {
  correct: [
    'Szuper!',
    'Ügyes vagy!',
    'Brávó!',
    'Fantasztikus!',
    'Helyes!',
    'Igen, ez az!',
    'Nagyon jó!',
  ],
  badge: [
    'Megszerezted a csillagot! Nagyon ügyes voltál!',
    'Gratulálok! Teljesítetted a fejezetet!',
    'Brávó! A csillag a tiéd!',
  ],
  star: [
    'Igen!',
    'Szuper!',
    'Csillag!',
    'Ügyes!',
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hu-HU';
  utterance.rate = 0.95;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

export function useSpeech() {
  const praiseCorrect = useCallback(() => speak(pickRandom(PHRASES.correct)), []);
  const praiseBadge   = useCallback(() => speak(pickRandom(PHRASES.badge)),   []);
  const praiseStar    = useCallback(() => speak(pickRandom(PHRASES.star)),     []);

  return { praiseCorrect, praiseBadge, praiseStar };
}
