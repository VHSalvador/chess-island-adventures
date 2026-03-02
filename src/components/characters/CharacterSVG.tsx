import React from 'react';

interface CharacterSVGProps {
  characterId: string;
  size?: number;
  className?: string;
}

const BenceSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* Pawn body - green sprout */}
    <ellipse cx="60" cy="95" rx="25" ry="12" fill="hsl(130, 55%, 35%)" />
    <rect x="50" y="50" width="20" height="45" rx="10" fill="hsl(130, 55%, 45%)" />
    <circle cx="60" cy="40" r="22" fill="hsl(130, 55%, 50%)" />
    {/* Eyes */}
    <circle cx="52" cy="36" r="6" fill="white" />
    <circle cx="68" cy="36" r="6" fill="white" />
    <circle cx="53" cy="37" r="3" fill="hsl(220, 60%, 25%)" />
    <circle cx="69" cy="37" r="3" fill="hsl(220, 60%, 25%)" />
    <circle cx="54" cy="36" r="1.2" fill="white" />
    <circle cx="70" cy="36" r="1.2" fill="white" />
    {/* Smile */}
    <path d="M52 46 Q60 54 68 46" stroke="hsl(220, 60%, 25%)" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Leaf on top */}
    <ellipse cx="60" cy="18" rx="6" ry="12" fill="hsl(120, 60%, 50%)" transform="rotate(-15 60 18)" />
    <ellipse cx="65" cy="20" rx="5" ry="10" fill="hsl(120, 55%, 45%)" transform="rotate(20 65 20)" />
  </svg>
);

const ErnoSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* Rook body - stone tower */}
    <rect x="35" y="85" width="50" height="20" rx="3" fill="hsl(25, 20%, 35%)" />
    <rect x="38" y="40" width="44" height="48" rx="4" fill="hsl(25, 20%, 50%)" />
    {/* Battlements */}
    <rect x="35" y="30" width="12" height="14" rx="2" fill="hsl(25, 20%, 55%)" />
    <rect x="54" y="30" width="12" height="14" rx="2" fill="hsl(25, 20%, 55%)" />
    <rect x="73" y="30" width="12" height="14" rx="2" fill="hsl(25, 20%, 55%)" />
    {/* Eyes */}
    <circle cx="52" cy="58" r="6" fill="white" />
    <circle cx="68" cy="58" r="6" fill="white" />
    <circle cx="53" cy="59" r="3" fill="hsl(220, 60%, 25%)" />
    <circle cx="69" cy="59" r="3" fill="hsl(220, 60%, 25%)" />
    <circle cx="54" cy="58" r="1.2" fill="white" />
    <circle cx="70" cy="58" r="1.2" fill="white" />
    {/* Determined mouth */}
    <path d="M50 70 L70 70" stroke="hsl(220, 60%, 25%)" strokeWidth="2.5" strokeLinecap="round" />
    {/* Stone texture */}
    <line x1="45" y1="52" x2="50" y2="52" stroke="hsl(25, 15%, 42%)" strokeWidth="1" />
    <line x1="65" y1="75" x2="75" y2="75" stroke="hsl(25, 15%, 42%)" strokeWidth="1" />
  </svg>
);

const SzonjaSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* Bishop body - flowing purple figure */}
    <ellipse cx="60" cy="98" rx="22" ry="10" fill="hsl(270, 45%, 40%)" />
    <path d="M42 98 Q42 55 60 25 Q78 55 78 98" fill="hsl(270, 50%, 55%)" />
    {/* Bishop hat slit */}
    <line x1="60" y1="22" x2="60" y2="38" stroke="hsl(270, 40%, 42%)" strokeWidth="2" />
    {/* Top point */}
    <circle cx="60" cy="20" r="5" fill="hsl(270, 55%, 60%)" />
    {/* Eyes */}
    <circle cx="53" cy="55" r="5" fill="white" />
    <circle cx="67" cy="55" r="5" fill="white" />
    <circle cx="54" cy="56" r="2.5" fill="hsl(270, 60%, 30%)" />
    <circle cx="68" cy="56" r="2.5" fill="hsl(270, 60%, 30%)" />
    <circle cx="55" cy="55" r="1" fill="white" />
    <circle cx="69" cy="55" r="1" fill="white" />
    {/* Creative smile */}
    <path d="M52 64 Q60 72 68 64" stroke="hsl(270, 60%, 30%)" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Sparkles */}
    <circle cx="38" cy="45" r="2" fill="hsl(280, 70%, 75%)" opacity="0.7" />
    <circle cx="82" cy="50" r="1.5" fill="hsl(280, 70%, 75%)" opacity="0.7" />
  </svg>
);

const HubaSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* Knight body - energetic yellow figure */}
    <ellipse cx="60" cy="98" rx="20" ry="10" fill="hsl(45, 70%, 40%)" />
    <path d="M45 98 L45 55 Q45 35 60 30 Q75 35 80 50 L80 65 L70 70 L70 98" fill="hsl(50, 90%, 55%)" />
    {/* Horse head shape */}
    <path d="M50 55 Q45 30 60 25 Q72 28 75 40 L78 48 L70 52 Z" fill="hsl(50, 85%, 60%)" />
    {/* Ears */}
    <polygon points="52,28 48,15 56,25" fill="hsl(50, 80%, 55%)" />
    <polygon points="62,25 66,12 68,24" fill="hsl(50, 80%, 55%)" />
    {/* Eyes */}
    <circle cx="55" cy="38" r="5" fill="white" />
    <circle cx="68" cy="40" r="4.5" fill="white" />
    <circle cx="56" cy="39" r="2.5" fill="hsl(220, 60%, 25%)" />
    <circle cx="69" cy="41" r="2.2" fill="hsl(220, 60%, 25%)" />
    {/* Excited smile */}
    <path d="M54 48 Q60 55 68 48" stroke="hsl(220, 60%, 25%)" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Lightning bolt */}
    <polygon points="82,20 78,35 83,33 79,48 88,28 83,30" fill="hsl(45, 100%, 55%)" stroke="hsl(40, 100%, 45%)" strokeWidth="1" />
  </svg>
);

const VandaSVG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* Queen body - golden glowing figure */}
    <ellipse cx="60" cy="98" rx="24" ry="12" fill="hsl(30, 70%, 40%)" />
    <path d="M38 98 L42 50 Q60 35 78 50 L82 98" fill="hsl(35, 90%, 55%)" />
    {/* Crown */}
    <polygon points="42,50 38,30 48,40 55,25 60,38 65,25 72,40 82,30 78,50" fill="hsl(40, 100%, 55%)" />
    {/* Jewels on crown */}
    <circle cx="48" cy="40" r="2.5" fill="hsl(0, 70%, 55%)" />
    <circle cx="60" cy="36" r="3" fill="hsl(200, 70%, 55%)" />
    <circle cx="72" cy="40" r="2.5" fill="hsl(130, 70%, 55%)" />
    {/* Eyes */}
    <circle cx="52" cy="62" r="5.5" fill="white" />
    <circle cx="68" cy="62" r="5.5" fill="white" />
    <circle cx="53" cy="63" r="2.8" fill="hsl(35, 60%, 30%)" />
    <circle cx="69" cy="63" r="2.8" fill="hsl(35, 60%, 30%)" />
    <circle cx="54" cy="62" r="1.2" fill="white" />
    <circle cx="70" cy="62" r="1.2" fill="white" />
    {/* Kind smile */}
    <path d="M50 72 Q60 80 70 72" stroke="hsl(35, 60%, 30%)" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Rays */}
    <line x1="60" y1="15" x2="60" y2="8" stroke="hsl(40, 100%, 60%)" strokeWidth="2" opacity="0.6" />
    <line x1="35" y1="28" x2="28" y2="23" stroke="hsl(40, 100%, 60%)" strokeWidth="2" opacity="0.6" />
    <line x1="85" y1="28" x2="92" y2="23" stroke="hsl(40, 100%, 60%)" strokeWidth="2" opacity="0.6" />
  </svg>
);

const BalazsSTG = ({ size = 120 }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* King body - tree-like figure with leaf crown */}
    <ellipse cx="60" cy="98" rx="22" ry="11" fill="hsl(90, 25%, 30%)" />
    <rect x="48" y="55" width="24" height="43" rx="8" fill="hsl(30, 30%, 45%)" />
    {/* Tree trunk texture */}
    <path d="M52 65 Q55 70 52 80" stroke="hsl(30, 25%, 38%)" strokeWidth="1.5" fill="none" />
    <path d="M68 60 Q65 68 68 78" stroke="hsl(30, 25%, 38%)" strokeWidth="1.5" fill="none" />
    {/* Head */}
    <circle cx="60" cy="42" r="20" fill="hsl(90, 35%, 45%)" />
    {/* Leaf crown */}
    <ellipse cx="48" cy="26" rx="8" ry="5" fill="hsl(120, 50%, 45%)" transform="rotate(-30 48 26)" />
    <ellipse cx="60" cy="20" rx="7" ry="6" fill="hsl(120, 55%, 50%)" />
    <ellipse cx="72" cy="26" rx="8" ry="5" fill="hsl(120, 50%, 45%)" transform="rotate(30 72 26)" />
    {/* Cross on top */}
    <line x1="60" y1="12" x2="60" y2="6" stroke="hsl(40, 80%, 55%)" strokeWidth="3" strokeLinecap="round" />
    <line x1="56" y1="9" x2="64" y2="9" stroke="hsl(40, 80%, 55%)" strokeWidth="3" strokeLinecap="round" />
    {/* Wise eyes */}
    <circle cx="52" cy="40" r="5" fill="white" />
    <circle cx="68" cy="40" r="5" fill="white" />
    <circle cx="53" cy="41" r="2.5" fill="hsl(90, 40%, 22%)" />
    <circle cx="69" cy="41" r="2.5" fill="hsl(90, 40%, 22%)" />
    <circle cx="54" cy="40" r="1" fill="white" />
    <circle cx="70" cy="40" r="1" fill="white" />
    {/* Gentle smile */}
    <path d="M54 50 Q60 56 66 50" stroke="hsl(90, 40%, 22%)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
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
