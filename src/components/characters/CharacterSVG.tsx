import React from 'react';

interface CharacterSVGProps {
  characterId: string;
  size?: number;
  className?: string;
}

const BenceSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <defs>
      <radialGradient id="bence-body" cx="45%" cy="35%" r="60%">
        <stop offset="0%" stopColor="hsl(130, 60%, 62%)" />
        <stop offset="100%" stopColor="hsl(130, 55%, 40%)" />
      </radialGradient>
      <radialGradient id="bence-head" cx="40%" cy="30%" r="65%">
        <stop offset="0%" stopColor="hsl(130, 55%, 60%)" />
        <stop offset="100%" stopColor="hsl(130, 55%, 42%)" />
      </radialGradient>
      <filter id="bence-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Ground shadow */}
    <ellipse cx="60" cy="102" rx="26" ry="6" fill="black" opacity="0.12" />
    {/* Base */}
    <ellipse cx="60" cy="95" rx="26" ry="13" fill="hsl(130, 55%, 32%)" />
    <ellipse cx="60" cy="93" rx="24" ry="11" fill="hsl(130, 55%, 38%)" />
    {/* Body */}
    <rect x="48" y="50" width="24" height="45" rx="12" fill="url(#bence-body)" filter="url(#bence-shadow)" />
    {/* Highlight stripe on body */}
    <rect x="52" y="55" width="6" height="30" rx="3" fill="white" opacity="0.12" />
    {/* Head */}
    <circle cx="60" cy="40" r="23" fill="url(#bence-head)" />
    {/* Highlight on head */}
    <ellipse cx="52" cy="32" rx="8" ry="6" fill="white" opacity="0.15" />
    {/* Blush */}
    <ellipse cx="44" cy="42" rx="5" ry="3" fill="hsl(0, 60%, 75%)" opacity="0.4" />
    <ellipse cx="76" cy="42" rx="5" ry="3" fill="hsl(0, 60%, 75%)" opacity="0.4" />
    {/* Eyes */}
    <circle cx="52" cy="36" r="6.5" fill="white" />
    <circle cx="68" cy="36" r="6.5" fill="white" />
    <circle cx="53" cy="37" r="3.5" fill="hsl(220, 60%, 22%)" />
    <circle cx="69" cy="37" r="3.5" fill="hsl(220, 60%, 22%)" />
    <circle cx="54.5" cy="35.5" r="1.5" fill="white" />
    <circle cx="70.5" cy="35.5" r="1.5" fill="white" />
    {/* Smile */}
    <path d="M52 46 Q60 55 68 46" stroke="hsl(220, 60%, 22%)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    {/* Leaf on top */}
    <ellipse cx="58" cy="17" rx="7" ry="13" fill="hsl(120, 60%, 50%)" transform="rotate(-15 58 17)" />
    <ellipse cx="66" cy="19" rx="6" ry="11" fill="hsl(120, 55%, 45%)" transform="rotate(20 66 19)" />
    {/* Leaf vein */}
    <line x1="58" y1="10" x2="58" y2="26" stroke="hsl(120, 50%, 38%)" strokeWidth="1" opacity="0.5" />
    {/* Leaf highlight */}
    <ellipse cx="55" cy="14" rx="3" ry="5" fill="white" opacity="0.2" transform="rotate(-15 55 14)" />
  </svg>
);

const ErnoSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <defs>
      <linearGradient id="erno-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(25, 25%, 58%)" />
        <stop offset="100%" stopColor="hsl(25, 20%, 42%)" />
      </linearGradient>
      <linearGradient id="erno-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="hsl(25, 25%, 62%)" />
        <stop offset="100%" stopColor="hsl(25, 20%, 50%)" />
      </linearGradient>
      <filter id="erno-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Ground shadow */}
    <ellipse cx="60" cy="108" rx="28" ry="6" fill="black" opacity="0.12" />
    {/* Base */}
    <rect x="33" y="88" width="54" height="18" rx="4" fill="hsl(25, 20%, 32%)" />
    <rect x="35" y="86" width="50" height="16" rx="3" fill="hsl(25, 20%, 38%)" />
    {/* Body */}
    <rect x="36" y="40" width="48" height="50" rx="5" fill="url(#erno-body)" filter="url(#erno-shadow)" />
    {/* Body highlight */}
    <rect x="40" y="44" width="10" height="38" rx="5" fill="white" opacity="0.1" />
    {/* Battlements */}
    <rect x="33" y="28" width="14" height="16" rx="3" fill="url(#erno-top)" />
    <rect x="53" y="28" width="14" height="16" rx="3" fill="url(#erno-top)" />
    <rect x="73" y="28" width="14" height="16" rx="3" fill="url(#erno-top)" />
    {/* Battlement highlights */}
    <rect x="35" y="30" width="4" height="10" rx="2" fill="white" opacity="0.15" />
    <rect x="55" y="30" width="4" height="10" rx="2" fill="white" opacity="0.15" />
    <rect x="75" y="30" width="4" height="10" rx="2" fill="white" opacity="0.15" />
    {/* Blush */}
    <ellipse cx="44" cy="64" rx="5" ry="3" fill="hsl(0, 55%, 72%)" opacity="0.35" />
    <ellipse cx="76" cy="64" rx="5" ry="3" fill="hsl(0, 55%, 72%)" opacity="0.35" />
    {/* Eyes */}
    <circle cx="52" cy="58" r="7" fill="white" />
    <circle cx="68" cy="58" r="7" fill="white" />
    <circle cx="53" cy="59" r="3.5" fill="hsl(220, 60%, 22%)" />
    <circle cx="69" cy="59" r="3.5" fill="hsl(220, 60%, 22%)" />
    <circle cx="54.5" cy="57.5" r="1.5" fill="white" />
    <circle cx="70.5" cy="57.5" r="1.5" fill="white" />
    {/* Determined mouth */}
    <path d="M50 70 Q60 74 70 70" stroke="hsl(220, 60%, 22%)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Stone texture lines */}
    <line x1="42" y1="52" x2="50" y2="52" stroke="hsl(25, 15%, 45%)" strokeWidth="1" opacity="0.4" />
    <line x1="62" y1="75" x2="76" y2="75" stroke="hsl(25, 15%, 45%)" strokeWidth="1" opacity="0.4" />
    <line x1="44" y1="80" x2="55" y2="80" stroke="hsl(25, 15%, 45%)" strokeWidth="1" opacity="0.4" />
  </svg>
);

const SzonjaSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <defs>
      <linearGradient id="szonja-body" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="hsl(270, 55%, 65%)" />
        <stop offset="100%" stopColor="hsl(270, 50%, 42%)" />
      </linearGradient>
      <radialGradient id="szonja-orb" cx="40%" cy="30%">
        <stop offset="0%" stopColor="hsl(270, 60%, 72%)" />
        <stop offset="100%" stopColor="hsl(270, 55%, 55%)" />
      </radialGradient>
      <filter id="szonja-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    {/* Ground shadow */}
    <ellipse cx="60" cy="105" rx="24" ry="5" fill="black" opacity="0.12" />
    {/* Base */}
    <ellipse cx="60" cy="98" rx="24" ry="11" fill="hsl(270, 45%, 35%)" />
    <ellipse cx="60" cy="96" rx="22" ry="9" fill="hsl(270, 45%, 42%)" />
    {/* Body */}
    <path d="M40 98 Q40 55 60 24 Q80 55 80 98" fill="url(#szonja-body)" />
    {/* Body highlight */}
    <path d="M50 90 Q50 60 60 32 Q55 60 52 90" fill="white" opacity="0.1" />
    {/* Bishop hat slit */}
    <line x1="60" y1="22" x2="60" y2="40" stroke="hsl(270, 40%, 38%)" strokeWidth="2.5" />
    {/* Top orb */}
    <circle cx="60" cy="20" r="6" fill="url(#szonja-orb)" filter="url(#szonja-glow)" />
    <circle cx="58" cy="18" r="2" fill="white" opacity="0.3" />
    {/* Blush */}
    <ellipse cx="44" cy="60" rx="5" ry="3" fill="hsl(310, 50%, 75%)" opacity="0.4" />
    <ellipse cx="76" cy="60" rx="5" ry="3" fill="hsl(310, 50%, 75%)" opacity="0.4" />
    {/* Eyes */}
    <circle cx="53" cy="55" r="6" fill="white" />
    <circle cx="67" cy="55" r="6" fill="white" />
    <circle cx="54" cy="56" r="3" fill="hsl(270, 60%, 28%)" />
    <circle cx="68" cy="56" r="3" fill="hsl(270, 60%, 28%)" />
    <circle cx="55.5" cy="54.5" r="1.3" fill="white" />
    <circle cx="69.5" cy="54.5" r="1.3" fill="white" />
    {/* Creative smile */}
    <path d="M52 64 Q60 73 68 64" stroke="hsl(270, 60%, 28%)" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Sparkles */}
    <circle cx="36" cy="42" r="2.5" fill="hsl(280, 70%, 80%)" opacity="0.7" filter="url(#szonja-glow)" />
    <circle cx="84" cy="48" r="2" fill="hsl(280, 70%, 80%)" opacity="0.6" filter="url(#szonja-glow)" />
    <circle cx="40" cy="72" r="1.5" fill="hsl(290, 70%, 82%)" opacity="0.5" />
  </svg>
);

const HubaSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <defs>
      <radialGradient id="huba-body" cx="40%" cy="30%">
        <stop offset="0%" stopColor="hsl(50, 90%, 68%)" />
        <stop offset="100%" stopColor="hsl(45, 85%, 48%)" />
      </radialGradient>
      <linearGradient id="huba-head" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="hsl(50, 88%, 70%)" />
        <stop offset="100%" stopColor="hsl(50, 85%, 52%)" />
      </linearGradient>
      <filter id="huba-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2" />
      </filter>
    </defs>
    {/* Ground shadow */}
    <ellipse cx="62" cy="106" rx="22" ry="5" fill="black" opacity="0.12" />
    {/* Base */}
    <ellipse cx="62" cy="98" rx="22" ry="11" fill="hsl(45, 70%, 35%)" />
    <ellipse cx="62" cy="96" rx="20" ry="9" fill="hsl(45, 70%, 42%)" />
    {/* Body */}
    <path d="M44 98 L44 55 Q44 34 60 28 Q76 34 82 50 L82 65 L72 70 L72 98" fill="url(#huba-body)" filter="url(#huba-shadow)" />
    {/* Body highlight */}
    <path d="M48 90 L48 58 Q48 40 58 32 Q50 45 50 60 L50 90" fill="white" opacity="0.12" />
    {/* Horse head shape */}
    <path d="M48 55 Q44 28 60 23 Q74 26 77 40 L80 48 L72 52 Z" fill="url(#huba-head)" />
    {/* Head highlight */}
    <ellipse cx="54" cy="32" rx="6" ry="8" fill="white" opacity="0.15" />
    {/* Ears */}
    <polygon points="51,26 46,12 57,23" fill="hsl(50, 80%, 58%)" />
    <polygon points="63,23 67,10 69,22" fill="hsl(50, 80%, 58%)" />
    {/* Ear inner */}
    <polygon points="52,24 48,15 55,22" fill="hsl(50, 75%, 50%)" opacity="0.5" />
    {/* Blush */}
    <ellipse cx="48" cy="46" rx="4" ry="2.5" fill="hsl(0, 60%, 75%)" opacity="0.4" />
    <ellipse cx="74" cy="48" rx="4" ry="2.5" fill="hsl(0, 60%, 75%)" opacity="0.4" />
    {/* Eyes */}
    <circle cx="55" cy="38" r="5.5" fill="white" />
    <circle cx="68" cy="40" r="5" fill="white" />
    <circle cx="56" cy="39" r="2.8" fill="hsl(220, 60%, 22%)" />
    <circle cx="69" cy="41" r="2.5" fill="hsl(220, 60%, 22%)" />
    <circle cx="57.5" cy="37.5" r="1.3" fill="white" />
    <circle cx="70.5" cy="39.5" r="1.2" fill="white" />
    {/* Excited smile */}
    <path d="M54 48 Q60 56 68 48" stroke="hsl(220, 60%, 22%)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    {/* Lightning bolt */}
    <polygon points="84,18 79,34 85,31 80,48 90,26 84,29" fill="hsl(45, 100%, 55%)" stroke="hsl(40, 100%, 42%)" strokeWidth="1.2" />
    {/* Lightning glow */}
    <polygon points="84,18 79,34 85,31 80,48 90,26 84,29" fill="hsl(45, 100%, 65%)" opacity="0.3" />
  </svg>
);

const VandaSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <defs>
      <linearGradient id="vanda-body" x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor="hsl(38, 92%, 65%)" />
        <stop offset="100%" stopColor="hsl(30, 80%, 45%)" />
      </linearGradient>
      <linearGradient id="vanda-crown" x1="0.5" y1="0" x2="0.5" y2="1">
        <stop offset="0%" stopColor="hsl(45, 100%, 68%)" />
        <stop offset="100%" stopColor="hsl(40, 100%, 50%)" />
      </linearGradient>
      <filter id="vanda-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="vanda-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Ground shadow */}
    <ellipse cx="60" cy="108" rx="26" ry="6" fill="black" opacity="0.12" />
    {/* Base */}
    <ellipse cx="60" cy="98" rx="26" ry="13" fill="hsl(30, 70%, 35%)" />
    <ellipse cx="60" cy="96" rx="24" ry="11" fill="hsl(30, 70%, 42%)" />
    {/* Body */}
    <path d="M36 98 L40 50 Q60 34 80 50 L84 98" fill="url(#vanda-body)" filter="url(#vanda-shadow)" />
    {/* Body highlight */}
    <path d="M46 90 L48 55 Q58 42 55 55 L52 90" fill="white" opacity="0.1" />
    {/* Crown */}
    <polygon points="40,50 36,28 48,40 55,22 60,36 65,22 72,40 84,28 80,50" fill="url(#vanda-crown)" />
    {/* Crown highlight */}
    <polygon points="44,48 40,32 50,42 55,28 58,38" fill="white" opacity="0.15" />
    {/* Jewels on crown */}
    <circle cx="48" cy="40" r="3" fill="hsl(0, 70%, 58%)" />
    <circle cx="48" cy="40" r="1.2" fill="white" opacity="0.4" />
    <circle cx="60" cy="35" r="3.5" fill="hsl(200, 70%, 58%)" />
    <circle cx="60" cy="35" r="1.5" fill="white" opacity="0.4" />
    <circle cx="72" cy="40" r="3" fill="hsl(130, 70%, 55%)" />
    <circle cx="72" cy="40" r="1.2" fill="white" opacity="0.4" />
    {/* Blush */}
    <ellipse cx="44" cy="68" rx="5" ry="3" fill="hsl(0, 55%, 75%)" opacity="0.4" />
    <ellipse cx="76" cy="68" rx="5" ry="3" fill="hsl(0, 55%, 75%)" opacity="0.4" />
    {/* Eyes */}
    <circle cx="52" cy="62" r="6" fill="white" />
    <circle cx="68" cy="62" r="6" fill="white" />
    <circle cx="53" cy="63" r="3" fill="hsl(35, 60%, 28%)" />
    <circle cx="69" cy="63" r="3" fill="hsl(35, 60%, 28%)" />
    <circle cx="54.5" cy="61.5" r="1.3" fill="white" />
    <circle cx="70.5" cy="61.5" r="1.3" fill="white" />
    {/* Eyelashes */}
    <line x1="46" y1="58" x2="48" y2="60" stroke="hsl(35, 60%, 28%)" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="74" y1="58" x2="72" y2="60" stroke="hsl(35, 60%, 28%)" strokeWidth="1.2" strokeLinecap="round" />
    {/* Kind smile */}
    <path d="M50 72 Q60 81 70 72" stroke="hsl(35, 60%, 28%)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    {/* Rays */}
    <line x1="60" y1="14" x2="60" y2="6" stroke="hsl(40, 100%, 62%)" strokeWidth="2.5" opacity="0.5" strokeLinecap="round" />
    <line x1="33" y1="26" x2="26" y2="20" stroke="hsl(40, 100%, 62%)" strokeWidth="2.5" opacity="0.5" strokeLinecap="round" />
    <line x1="87" y1="26" x2="94" y2="20" stroke="hsl(40, 100%, 62%)" strokeWidth="2.5" opacity="0.5" strokeLinecap="round" />
  </svg>
);

const BalazsSTG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <defs>
      <radialGradient id="balazs-head" cx="40%" cy="30%">
        <stop offset="0%" stopColor="hsl(90, 40%, 55%)" />
        <stop offset="100%" stopColor="hsl(90, 35%, 38%)" />
      </radialGradient>
      <linearGradient id="balazs-trunk" x1="0.3" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="hsl(30, 35%, 52%)" />
        <stop offset="100%" stopColor="hsl(30, 30%, 38%)" />
      </linearGradient>
      <filter id="balazs-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" />
      </filter>
    </defs>
    {/* Ground shadow */}
    <ellipse cx="60" cy="106" rx="24" ry="5" fill="black" opacity="0.12" />
    {/* Base */}
    <ellipse cx="60" cy="98" rx="24" ry="12" fill="hsl(90, 25%, 25%)" />
    <ellipse cx="60" cy="96" rx="22" ry="10" fill="hsl(90, 25%, 32%)" />
    {/* Trunk */}
    <rect x="46" y="55" width="28" height="43" rx="10" fill="url(#balazs-trunk)" filter="url(#balazs-shadow)" />
    {/* Trunk highlight */}
    <rect x="50" y="58" width="7" height="32" rx="3.5" fill="white" opacity="0.1" />
    {/* Tree trunk texture */}
    <path d="M52 65 Q55 72 52 82" stroke="hsl(30, 25%, 35%)" strokeWidth="1.5" fill="none" opacity="0.5" />
    <path d="M68 60 Q65 70 68 80" stroke="hsl(30, 25%, 35%)" strokeWidth="1.5" fill="none" opacity="0.5" />
    {/* Head */}
    <circle cx="60" cy="42" r="22" fill="url(#balazs-head)" />
    {/* Head highlight */}
    <ellipse cx="52" cy="32" rx="8" ry="6" fill="white" opacity="0.12" />
    {/* Leaf crown */}
    <ellipse cx="46" cy="24" rx="9" ry="6" fill="hsl(120, 55%, 48%)" transform="rotate(-30 46 24)" />
    <ellipse cx="60" cy="18" rx="8" ry="7" fill="hsl(120, 58%, 52%)" />
    <ellipse cx="74" cy="24" rx="9" ry="6" fill="hsl(120, 55%, 48%)" transform="rotate(30 74 24)" />
    {/* Leaf highlights */}
    <ellipse cx="44" cy="22" rx="4" ry="3" fill="white" opacity="0.2" transform="rotate(-30 44 22)" />
    <ellipse cx="58" cy="16" rx="4" ry="3" fill="white" opacity="0.2" />
    {/* Cross on top */}
    <line x1="60" y1="10" x2="60" y2="3" stroke="hsl(40, 85%, 55%)" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="55.5" y1="7" x2="64.5" y2="7" stroke="hsl(40, 85%, 55%)" strokeWidth="3.5" strokeLinecap="round" />
    {/* Cross glow */}
    <circle cx="60" cy="7" r="5" fill="hsl(40, 90%, 60%)" opacity="0.15" />
    {/* Blush */}
    <ellipse cx="44" cy="46" rx="5" ry="3" fill="hsl(0, 55%, 72%)" opacity="0.35" />
    <ellipse cx="76" cy="46" rx="5" ry="3" fill="hsl(0, 55%, 72%)" opacity="0.35" />
    {/* Eyes */}
    <circle cx="52" cy="40" r="5.5" fill="white" />
    <circle cx="68" cy="40" r="5.5" fill="white" />
    <circle cx="53" cy="41" r="2.8" fill="hsl(90, 40%, 20%)" />
    <circle cx="69" cy="41" r="2.8" fill="hsl(90, 40%, 20%)" />
    <circle cx="54.5" cy="39.5" r="1.2" fill="white" />
    <circle cx="70.5" cy="39.5" r="1.2" fill="white" />
    {/* Gentle smile */}
    <path d="M54 50 Q60 57 66 50" stroke="hsl(90, 40%, 20%)" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const characters: Record<string, React.FC<{ size: number }>> = {
  bence: BenceSVG,
  erno: ErnoSVG,
  szonja: SzonjaSVG,
  huba: HubaSVG,
  vanda: VandaSVG,
  balazs: BalazsSTG,
};

export const CharacterSVG: React.FC<CharacterSVGProps> = ({ characterId, size = 120, className }) => {
  const Component = characters[characterId];
  if (!Component) return null;
  return (
    <div className={className}>
      <Component size={size} />
    </div>
  );
};

export const CHARACTER_INFO = {
  bence: { name: 'Bence', piece: 'Gyalog', color: 'bence', motto: 'Előre!', virtue: 'Kitartás' },
  erno: { name: 'Ernő', piece: 'Bástya', color: 'erno', motto: 'Egyenesen!', virtue: 'Becsületesség' },
  szonja: { name: 'Szonja', piece: 'Futó', color: 'szonja', motto: 'Átlósan!', virtue: 'Kreativitás' },
  huba: { name: 'Huba', piece: 'Huszár', color: 'huba', motto: 'Hoppsza!', virtue: 'Ötletesség' },
  vanda: { name: 'Vanda', piece: 'Vezér', color: 'vanda', motto: 'Együtt!', virtue: 'Empátia' },
  balazs: { name: 'Balázs', piece: 'Király', color: 'balazs', motto: 'Bölcsen!', virtue: 'Bölcsesség' },
} as const;

export type CharacterId = keyof typeof CHARACTER_INFO;
