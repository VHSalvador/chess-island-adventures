import React from 'react';

interface IslandItemSVGProps {
  itemName: string;
  size?: number;
}

// --- Animation keyframes injected once via a style tag ---
const KEYFRAMES = `
@keyframes smoke-puff {
  0%   { transform: translateY(0) scale(1);   opacity: 0.55; }
  60%  { transform: translateY(-14px) scale(1.3); opacity: 0.3; }
  100% { transform: translateY(-22px) scale(1.6); opacity: 0; }
}
@keyframes sway {
  0%,100% { transform: rotate(-5deg); transform-origin: 50% 90%; }
  50%      { transform: rotate(5deg);  transform-origin: 50% 90%; }
}
@keyframes breathe-tree {
  0%,100% { transform: scale(1);    transform-origin: 50% 100%; }
  50%      { transform: scale(1.03); transform-origin: 50% 100%; }
}
@keyframes crystal-shimmer {
  0%,100% { opacity: 0.25; }
  50%      { opacity: 0.85; }
}
@keyframes star-spin {
  from { transform: rotate(0deg);   transform-origin: 32px 32px; }
  to   { transform: rotate(360deg); transform-origin: 32px 32px; }
}
@keyframes center-spin {
  from { transform: rotate(0deg);   transform-origin: 32px 28px; }
  to   { transform: rotate(360deg); transform-origin: 32px 28px; }
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

// --- Individual item renderers ---

function HouseSVG() {
  return (
    <>
      {/* Chimney */}
      <rect x="42" y="12" width="6" height="12" fill="#8d6e63" rx="1" />
      {/* Smoke puff */}
      <ellipse
        cx="45" cy="11" rx="3" ry="2"
        fill="#bdbdbd"
        style={{ animation: 'smoke-puff 2s ease-out infinite' }}
      />
      {/* Roof */}
      <polygon points="10,30 32,10 54,30" fill="#e64a19" />
      <polygon points="10,30 32,14 54,30" fill="#ff7043" />
      {/* House body */}
      <rect x="13" y="29" width="38" height="24" fill="#fff9f6" rx="2" />
      {/* Door */}
      <rect x="27" y="40" width="10" height="13" fill="#795548" rx="2" />
      <circle cx="35" cy="47" r="1" fill="#ffd54f" />
      {/* Left window */}
      <rect x="16" y="34" width="9" height="8" fill="#b3e5fc" rx="1.5" />
      <line x1="20.5" y1="34" x2="20.5" y2="42" stroke="#90caf9" strokeWidth="1" />
      <line x1="16" y1="38" x2="25" y2="38" stroke="#90caf9" strokeWidth="1" />
      {/* Right window */}
      <rect x="39" y="34" width="9" height="8" fill="#b3e5fc" rx="1.5" />
      <line x1="43.5" y1="34" x2="43.5" y2="42" stroke="#90caf9" strokeWidth="1" />
      <line x1="39" y1="38" x2="48" y2="38" stroke="#90caf9" strokeWidth="1" />
      {/* Ground line */}
      <rect x="10" y="53" width="44" height="3" fill="#a5d6a7" rx="1.5" />
    </>
  );
}

function FlowerSVG() {
  return (
    <g style={{ animation: 'sway 3s ease-in-out infinite' }}>
      {/* Stem */}
      <rect x="30" y="36" width="4" height="20" fill="#4caf50" rx="2" />
      {/* Leaf */}
      <ellipse cx="24" cy="44" rx="7" ry="3" fill="#66bb6a" transform="rotate(-30 24 44)" />
      {/* Petals */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse
          key={i}
          cx={32 + Math.cos((angle * Math.PI) / 180) * 11}
          cy={26 + Math.sin((angle * Math.PI) / 180) * 11}
          rx="7"
          ry="4.5"
          fill={i % 2 === 0 ? '#f06292' : '#e91e63'}
          transform={`rotate(${angle} ${32 + Math.cos((angle * Math.PI) / 180) * 11} ${26 + Math.sin((angle * Math.PI) / 180) * 11})`}
        />
      ))}
      {/* Center */}
      <circle cx="32" cy="26" r="7" fill="#fdd835" />
      <circle cx="30" cy="24" r="1.5" fill="#f9a825" />
      <circle cx="34" cy="24" r="1.5" fill="#f9a825" />
      <circle cx="32" cy="28" r="1.5" fill="#f9a825" />
    </g>
  );
}

function TreeSVG() {
  return (
    <g style={{ animation: 'breathe-tree 3s ease-in-out infinite' }}>
      {/* Trunk */}
      <rect x="27" y="48" width="10" height="12" fill="#795548" rx="2" />
      {/* Bottom tier */}
      <polygon points="8,50 32,28 56,50" fill="#2e7d32" />
      <polygon points="10,50 32,30 54,50" fill="#388e3c" />
      {/* Middle tier */}
      <polygon points="12,38 32,18 52,38" fill="#388e3c" />
      <polygon points="14,38 32,20 50,38" fill="#43a047" />
      {/* Top tier */}
      <polygon points="17,26 32,10 47,26" fill="#43a047" />
      <polygon points="19,26 32,12 45,26" fill="#66bb6a" />
      {/* Snow hints */}
      <polygon points="19,26 32,12 45,26" fill="none" />
      <ellipse cx="32" cy="13" rx="5" ry="2" fill="#e8f5e9" opacity="0.6" />
    </g>
  );
}

function SunflowerSVG() {
  return (
    <>
      {/* Stem */}
      <rect x="30" y="38" width="4" height="20" fill="#4caf50" rx="2" />
      {/* Leaves */}
      <ellipse cx="23" cy="46" rx="8" ry="3" fill="#66bb6a" transform="rotate(-25 23 46)" />
      <ellipse cx="41" cy="50" rx="8" ry="3" fill="#66bb6a" transform="rotate(20 41 50)" />
      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={i}
          cx={32 + Math.cos((angle * Math.PI) / 180) * 13}
          cy={26 + Math.sin((angle * Math.PI) / 180) * 13}
          rx="6"
          ry="3.5"
          fill="#ffee58"
          transform={`rotate(${angle} ${32 + Math.cos((angle * Math.PI) / 180) * 13} ${26 + Math.sin((angle * Math.PI) / 180) * 13})`}
        />
      ))}
      {/* Center — spins on hover via parent */}
      <circle cx="32" cy="26" r="9" fill="#5d4037" style={{ animation: 'center-spin 8s linear infinite' }} />
      <circle cx="32" cy="26" r="9" fill="#6d4c41" style={{ animation: 'center-spin 8s linear infinite' }} />
      {/* Dot pattern on center */}
      {[-4, 0, 4].map(dx =>
        [-4, 0, 4].map((dy, j) => (
          <circle key={`${dx}-${j}`} cx={32 + dx} cy={26 + dy} r="1.2" fill="#8d6e63" style={{ animation: 'center-spin 8s linear infinite' }} />
        ))
      )}
    </>
  );
}

function RockSVG() {
  return (
    <>
      {/* Shadow */}
      <ellipse cx="32" cy="56" rx="18" ry="4" fill="rgba(0,0,0,0.12)" />
      {/* Main boulder */}
      <ellipse cx="32" cy="40" rx="20" ry="16" fill="#9e9e9e" />
      <ellipse cx="32" cy="40" rx="20" ry="16" fill="url(#rock-grad)" />
      <defs>
        <radialGradient id="rock-grad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#bdbdbd" />
          <stop offset="100%" stopColor="#757575" />
        </radialGradient>
      </defs>
      {/* Highlight */}
      <ellipse cx="26" cy="33" rx="6" ry="4" fill="#e0e0e0" opacity="0.6" />
      {/* Small pebble */}
      <ellipse cx="46" cy="50" rx="7" ry="5" fill="#8d8d8d" />
      <ellipse cx="44" cy="48" rx="2.5" ry="1.5" fill="#bdbdbd" opacity="0.5" />
    </>
  );
}

function CrystalSVG() {
  return (
    <>
      {/* Shadow */}
      <ellipse cx="32" cy="58" rx="10" ry="3" fill="rgba(100,50,200,0.18)" />
      {/* Outer crystal body */}
      <polygon points="32,6 46,24 40,56 24,56 18,24" fill="#7c4dff" opacity="0.9" />
      {/* Mid facet */}
      <polygon points="32,6 46,24 32,32 18,24" fill="#b388ff" />
      {/* Inner shimmer */}
      <polygon
        points="32,10 43,26 32,30 21,26"
        fill="#e8d5ff"
        style={{ animation: 'crystal-shimmer 2s ease-in-out infinite' }}
      />
      {/* Sparkle top */}
      <line x1="32" y1="2" x2="32" y2="8" stroke="#e040fb" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="4" x2="36" y2="4" stroke="#e040fb" strokeWidth="1.5" strokeLinecap="round" />
      {/* Bottom shard */}
      <polygon points="24,56 40,56 36,62 28,62" fill="#651fff" opacity="0.7" />
    </>
  );
}

function StarSVG() {
  const points = Array.from({ length: 5 }, (_, i) => {
    const outerAngle = (i * 72 - 90) * (Math.PI / 180);
    const innerAngle = (i * 72 - 90 + 36) * (Math.PI / 180);
    const ox = 32 + 26 * Math.cos(outerAngle);
    const oy = 32 + 26 * Math.sin(outerAngle);
    const ix = 32 + 11 * Math.cos(innerAngle);
    const iy = 32 + 11 * Math.sin(innerAngle);
    return `${ox},${oy} ${ix},${iy}`;
  }).join(' ');

  return (
    <polygon
      points={points}
      fill="#ff9800"
      stroke="#f57c00"
      strokeWidth="1.5"
      style={{ animation: 'star-spin 6s linear infinite' }}
    />
  );
}

// --- Matcher ---

function matchItem(name: string): 'house' | 'flower' | 'tree' | 'sunflower' | 'rock' | 'crystal' | 'star' {
  const n = name.toLowerCase();
  if (/ház|house|kastély|épület|building/.test(n)) return 'house';
  if (/napraforgó|sunflower/.test(n)) return 'sunflower';
  if (/virág|flower|rózsa/.test(n)) return 'flower';
  if (/fa|tree|fenyő|pine/.test(n)) return 'tree';
  if (/szikla|rock|kő|stone/.test(n)) return 'rock';
  if (/kristály|crystal/.test(n)) return 'crystal';
  return 'star';
}

// --- Public component ---

const IslandItemSVG: React.FC<IslandItemSVGProps> = ({ itemName, size = 64 }) => {
  React.useEffect(() => { injectStyles(); }, []);

  const kind = matchItem(itemName);

  const content = {
    house:     <HouseSVG />,
    flower:    <FlowerSVG />,
    tree:      <TreeSVG />,
    sunflower: <SunflowerSVG />,
    rock:      <RockSVG />,
    crystal:   <CrystalSVG />,
    star:      <StarSVG />,
  }[kind];

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {content}
    </svg>
  );
};

export default IslandItemSVG;
