import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { CharacterSVG, CHARACTER_INFO, type CharacterId } from '@/components/characters/CharacterSVG';
import { onboardingAudio } from '@/data/onboardingAudio';

const TOTAL_SCREENS = 5;

// ── Screen 0: A Titokzatos Üzenet ────────────────────────────────────────────
const ParchmentScreen = ({ characterName, onNext }: { characterName: string; onNext: () => void }) => (
  <div className="flex flex-col items-center gap-8 text-center">
    <motion.p
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-display text-white/70 text-lg"
    >
      Pszt... érkezett valami...
    </motion.p>

    <motion.div
      initial={{ scale: 0.75, opacity: 0, rotate: -3 }}
      animate={{ scale: 1, opacity: 1, rotate: -1 }}
      transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
      className="relative"
    >
      <div
        className="w-72 h-52 rounded-2xl flex flex-col items-center justify-center gap-3 border-4"
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)',
          borderColor: '#92400e',
          boxShadow: '0 0 40px rgba(251,191,36,0.4), 0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <p className="text-amber-800/60 font-body text-sm">Titkos üzenet</p>
        <div className="w-32 border-t border-amber-800/30" />
        <p className="font-display text-amber-900 text-2xl font-bold px-4 leading-tight">
          {characterName}
        </p>
        <p className="text-amber-800/70 font-body text-sm">a Sakk-Szigetre vár!</p>
      </div>

      {/* Corner stars */}
      {[
        { top: '-12px', left: '-12px' },
        { top: '-12px', right: '-12px' },
        { bottom: '-12px', left: '-12px' },
        { bottom: '-12px', right: '-12px' },
      ].map((style, i) => (
        <motion.span
          key={i}
          className="absolute text-yellow-300 text-lg select-none"
          style={style as React.CSSProperties}
          animate={{ rotate: 360, scale: [1, 1.3, 1] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 0.4 }}
        >
          ⭐
        </motion.span>
      ))}
    </motion.div>

    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onNext}
      className="child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display text-xl px-10 py-4 rounded-2xl border-0 shadow-lg"
    >
      Megnyitom ✨
    </motion.button>
  </div>
);

// ── Screen 1: A Sziget Megnyílik ──────────────────────────────────────────────
const IslandScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex flex-col items-center gap-6 text-center">
    <motion.h2
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-display text-white text-3xl"
    >
      A Sakk-Sziget
    </motion.h2>

    {/* Island illustration */}
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 160 }}
      className="rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl"
      style={{ width: 280, height: 200 }}
    >
      {/* Sky + ocean */}
      <div
        className="relative w-full h-full"
        style={{ background: 'linear-gradient(180deg, #1a3a6b 0%, #2d6eb5 55%, #1a4a8a 100%)' }}
      >
        {/* Island terrain */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 200,
            height: 110,
            borderRadius: '50% 50% 0 0',
            background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 45%, #92400e 100%)',
          }}
        />
        {/* Trunk */}
        <div
          className="absolute"
          style={{
            bottom: 90,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 12,
            height: 40,
            borderRadius: 4,
            background: '#92400e',
          }}
        />
        {/* Canopy */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 124,
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, #4ade80, #15803d)',
            marginLeft: -35,
          }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Golden glow */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 148,
            width: 60,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255,215,0,0.5)',
            filter: 'blur(8px)',
            marginLeft: -30,
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Water wave */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-6"
          style={{ background: 'rgba(74,176,245,0.45)' }}
          animate={{ x: [-6, 6, -6] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-white/80 font-body text-lg max-w-xs"
    >
      64 mező, 64 titok. A sziget közepén áll az Egyensúly Fája — ő mindenkit ismer.
    </motion.p>

    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onNext}
      className="child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display text-xl px-10 py-4 rounded-2xl border-0 shadow-lg"
    >
      Tovább →
    </motion.button>
  </div>
);

// ── Screen 2: A Te Barátod Előlép ─────────────────────────────────────────────
const CharacterScreen = ({
  charId,
  charInfo,
  onNext,
}: {
  charId: string;
  charInfo: { name: string; motto: string };
  onNext: () => void;
}) => (
  <div className="flex flex-col items-center gap-6 text-center">
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-display text-white/70 text-lg"
    >
      Nézd csak, ki lépett elő!
    </motion.p>

    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
      className="animate-float"
    >
      <CharacterSVG characterId={charId} size={160} />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-5 border border-white/20"
    >
      <p className="font-display text-white text-2xl">{charInfo.name}</p>
      <p className="text-white/60 font-body text-sm mt-1">a te barátod a Sakk-Szigeten</p>
      <p className="font-display text-amber-300 text-lg mt-2 italic">„{charInfo.motto}"</p>
    </motion.div>

    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onNext}
      className="child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display text-xl px-10 py-4 rounded-2xl border-0 shadow-lg"
    >
      Szia, {charInfo.name}! 👋
    </motion.button>
  </div>
);

// ── Screen 3: A Kalandozó Feladata ────────────────────────────────────────────
const TaskScreen = ({
  charInfo,
  onNext,
}: {
  charInfo: { name: string };
  onNext: () => void;
}) => {
  const cards = [
    { icon: '📖', text: `Hallgasd ${charInfo.name} meséjét!` },
    { icon: '♟️', text: 'Tanulj tőle egy titkos mozdulatot!' },
    { icon: '🪙', text: 'Gyűjts Aranytalléreket a Szigetedre!' },
  ];

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-white text-2xl"
      >
        Mi lesz a feladatod?
      </motion.h2>

      <div className="flex flex-col gap-3 w-full">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.3 }}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20"
          >
            <span className="text-3xl flex-shrink-0">{card.icon}</span>
            <p className="font-display text-white text-lg text-left">{card.text}</p>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display text-xl px-10 py-4 rounded-2xl border-0 shadow-lg"
      >
        Értem! Kezdjük! 🚀
      </motion.button>
    </div>
  );
};

// ── Screen 4: Az Egyensúly Fája Szól ──────────────────────────────────────────
const TreeScreen = ({
  charId,
  characterName,
  onNext,
}: {
  charId: string;
  characterName: string;
  onNext: () => void;
}) => (
  <div className="flex flex-col items-center gap-6 text-center">
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 150, delay: 0.1 }}
    >
      <svg width="120" height="148" viewBox="0 0 120 148">
        <ellipse cx="60" cy="80" rx="58" ry="48" fill="rgba(255,215,0,0.08)" />
        <rect x="50" y="98" width="20" height="46" rx="6" fill="#92400e" />
        <ellipse cx="60" cy="96" rx="44" ry="30" fill="#166534" />
        <ellipse cx="60" cy="74" rx="36" ry="28" fill="#16a34a" />
        <ellipse cx="60" cy="55" rx="28" ry="24" fill="#22c55e" />
        <ellipse cx="60" cy="38" rx="20" ry="20" fill="#4ade80" />
        <motion.ellipse
          cx="60" cy="24" rx="16" ry="8"
          fill="rgba(255,215,0,0.7)"
          animate={{ opacity: [0.4, 1, 0.4], ry: [8, 12, 8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <p className="font-display text-white text-xl">Az Egyensúly Fája így szól:</p>
      <p className="text-white/80 font-body text-lg mt-3 max-w-xs mx-auto italic leading-relaxed">
        „Üdvözöllek, Kalandozó. A Sakk-Sziget vár. Barátaid várnak. A kaland most kezdődik."
      </p>
    </motion.div>

    {/* Entry badge */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.7, type: 'spring' }}
      className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-amber-400/40"
      style={{ boxShadow: '0 0 20px rgba(251,191,36,0.2)' }}
    >
      <CharacterSVG characterId={charId} size={40} />
      <div className="text-left">
        <p className="text-amber-300 font-display text-xs uppercase tracking-wide">Kalandozó</p>
        <p className="text-white font-display text-lg leading-tight">{characterName}</p>
      </div>
    </motion.div>

    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onNext}
      className="child-button bg-gradient-to-r from-amber-500 to-orange-500 text-white font-display text-xl px-10 py-4 rounded-2xl border-0 shadow-lg"
    >
      ⭐ Megérkeztem a Szigetre!
    </motion.button>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const OnboardingIntro = () => {
  const { childProfile } = useAuth();
  const navigate = useNavigate();
  const [screen, setScreen] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const charId = (childProfile?.character_id || 'bence') as CharacterId;
  const charInfo = CHARACTER_INFO[charId];
  const characterName = childProfile?.character_name || charInfo.name;

  const playAudio = useCallback((src?: string) => {
    if (!src) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = new Audio(src);
    audioRef.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    const audioMap: Record<number, string> = {
      0: onboardingAudio.screen1,
      1: onboardingAudio.screen2,
      2: onboardingAudio.screen3[charId] || '',
      3: onboardingAudio.screen4,
      4: onboardingAudio.screen5,
    };
    playAudio(audioMap[screen]);
  }, [screen, charId, playAudio]);

  const next = () => {
    if (screen < TOTAL_SCREENS - 1) {
      setScreen(s => s + 1);
    } else {
      navigate('/map');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1b4b] via-[#1a3a6b] to-[#2d6eb5] flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-lg"
        >
          {screen === 0 && <ParchmentScreen characterName={characterName} onNext={next} />}
          {screen === 1 && <IslandScreen onNext={next} />}
          {screen === 2 && <CharacterScreen charId={charId} charInfo={charInfo} onNext={next} />}
          {screen === 3 && <TaskScreen charInfo={charInfo} onNext={next} />}
          {screen === 4 && <TreeScreen charId={charId} characterName={characterName} onNext={next} />}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === screen ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingIntro;
