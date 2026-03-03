import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type PieceType = 'pawn' | 'rook' | 'bishop' | 'knight' | 'queen' | 'king';

interface ChessPiece3DProps {
  type: PieceType;
  position: [number, number, number];
  color: string;
  name: string;
  pieceName: string;
  locked?: boolean;
  completed?: boolean;
  onClick?: () => void;
}

const PIECE_COLORS: Record<string, string> = {
  bence: '#4CAF50',
  erno: '#8B7355',
  szonja: '#9C5FBF',
  huba: '#E8B830',
  vanda: '#E89830',
  balazs: '#5A8040',
};

const PawnMesh: React.FC<{ color: string }> = ({ color }) => (
  <group>
    {/* Base */}
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.4, 0.45, 0.3, 16]} />
      <meshStandardMaterial color={color} roughness={0.6} flatShading />
    </mesh>
    {/* Body */}
    <mesh position={[0, 0.6, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.35, 0.6, 12]} />
      <meshStandardMaterial color={color} roughness={0.6} flatShading />
    </mesh>
    {/* Head */}
    <mesh position={[0, 1.05, 0]} castShadow>
      <sphereGeometry args={[0.25, 12, 10]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    {/* Eyes */}
    <mesh position={[-0.08, 1.1, 0.22]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0.08, 1.1, 0.22]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    {/* Smile */}
    <mesh position={[0, 1.0, 0.24]} rotation={[0.2, 0, 0]}>
      <torusGeometry args={[0.06, 0.015, 8, 8, Math.PI]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  </group>
);

const RookMesh: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.42, 0.48, 0.3, 16]} />
      <meshStandardMaterial color={color} roughness={0.7} flatShading />
    </mesh>
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.3, 0.38, 0.8, 12]} />
      <meshStandardMaterial color={color} roughness={0.7} flatShading />
    </mesh>
    {/* Top platform */}
    <mesh position={[0, 1.15, 0]} castShadow>
      <cylinderGeometry args={[0.35, 0.3, 0.15, 12]} />
      <meshStandardMaterial color={color} roughness={0.6} flatShading />
    </mesh>
    {/* Battlements */}
    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
      <mesh key={i} position={[Math.cos(angle) * 0.25, 1.35, Math.sin(angle) * 0.25]} castShadow>
        <boxGeometry args={[0.12, 0.25, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.6} flatShading />
      </mesh>
    ))}
    {/* Eyes */}
    <mesh position={[-0.1, 0.85, 0.28]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0.1, 0.85, 0.28]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  </group>
);

const BishopMesh: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.4, 0.45, 0.3, 16]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.35, 0.8, 12]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    {/* Pointed top */}
    <mesh position={[0, 1.2, 0]} castShadow>
      <sphereGeometry args={[0.25, 12, 10]} />
      <meshStandardMaterial color={color} roughness={0.4} flatShading />
    </mesh>
    <mesh position={[0, 1.5, 0]} castShadow>
      <coneGeometry args={[0.12, 0.3, 8]} />
      <meshStandardMaterial color={color} roughness={0.4} flatShading />
    </mesh>
    {/* Little ball on top */}
    <mesh position={[0, 1.7, 0]} castShadow>
      <sphereGeometry args={[0.06, 8, 6]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </mesh>
    {/* Eyes */}
    <mesh position={[-0.08, 1.25, 0.22]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0.08, 1.25, 0.22]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  </group>
);

const KnightMesh: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.42, 0.48, 0.3, 16]} />
      <meshStandardMaterial color={color} roughness={0.6} flatShading />
    </mesh>
    {/* Body */}
    <mesh position={[0, 0.65, 0]} castShadow>
      <cylinderGeometry args={[0.25, 0.38, 0.7, 12]} />
      <meshStandardMaterial color={color} roughness={0.6} flatShading />
    </mesh>
    {/* Horse head - tilted box */}
    <mesh position={[0, 1.15, 0.1]} rotation={[0.3, 0, 0]} castShadow>
      <boxGeometry args={[0.3, 0.5, 0.35]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    {/* Snout */}
    <mesh position={[0, 1.05, 0.32]} rotation={[0.5, 0, 0]} castShadow>
      <boxGeometry args={[0.22, 0.25, 0.25]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    {/* Ears */}
    <mesh position={[-0.1, 1.45, 0.05]} rotation={[0, 0, -0.3]} castShadow>
      <coneGeometry args={[0.06, 0.18, 4]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    <mesh position={[0.1, 1.45, 0.05]} rotation={[0, 0, 0.3]} castShadow>
      <coneGeometry args={[0.06, 0.18, 4]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    {/* Eyes */}
    <mesh position={[-0.1, 1.2, 0.28]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0.1, 1.2, 0.28]}>
      <sphereGeometry args={[0.04, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  </group>
);

const QueenMesh: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.42, 0.48, 0.3, 16]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    <mesh position={[0, 0.75, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.38, 0.9, 12]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    {/* Head */}
    <mesh position={[0, 1.3, 0]} castShadow>
      <sphereGeometry args={[0.22, 12, 10]} />
      <meshStandardMaterial color={color} roughness={0.4} flatShading />
    </mesh>
    {/* Crown points */}
    {[0, 1, 2, 3, 4].map((i) => {
      const angle = (i / 5) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(angle) * 0.15, 1.55, Math.sin(angle) * 0.15]} castShadow>
          <coneGeometry args={[0.04, 0.15, 4]} />
          <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.5} />
        </mesh>
      );
    })}
    {/* Crown base ring */}
    <mesh position={[0, 1.45, 0]} castShadow>
      <torusGeometry args={[0.18, 0.03, 8, 16]} />
      <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.5} />
    </mesh>
    {/* Eyes */}
    <mesh position={[-0.07, 1.35, 0.2]}>
      <sphereGeometry args={[0.035, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0.07, 1.35, 0.2]}>
      <sphereGeometry args={[0.035, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  </group>
);

const KingMesh: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.15, 0]} castShadow>
      <cylinderGeometry args={[0.44, 0.5, 0.3, 16]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    <mesh position={[0, 0.8, 0]} castShadow>
      <cylinderGeometry args={[0.24, 0.4, 1, 12]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    {/* Head */}
    <mesh position={[0, 1.4, 0]} castShadow>
      <sphereGeometry args={[0.24, 12, 10]} />
      <meshStandardMaterial color={color} roughness={0.4} flatShading />
    </mesh>
    {/* Crown base */}
    <mesh position={[0, 1.55, 0]} castShadow>
      <torusGeometry args={[0.2, 0.035, 8, 16]} />
      <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.5} />
    </mesh>
    {/* Cross on top */}
    <mesh position={[0, 1.75, 0]} castShadow>
      <boxGeometry args={[0.04, 0.25, 0.04]} />
      <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.5} />
    </mesh>
    <mesh position={[0, 1.8, 0]} castShadow>
      <boxGeometry args={[0.15, 0.04, 0.04]} />
      <meshStandardMaterial color="#ffd700" roughness={0.3} metalness={0.5} />
    </mesh>
    {/* Eyes */}
    <mesh position={[-0.08, 1.45, 0.22]}>
      <sphereGeometry args={[0.035, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
    <mesh position={[0.08, 1.45, 0.22]}>
      <sphereGeometry args={[0.035, 8, 6]} />
      <meshStandardMaterial color="#222" />
    </mesh>
  </group>
);

const PIECE_COMPONENTS: Record<PieceType, React.FC<{ color: string }>> = {
  pawn: PawnMesh,
  rook: RookMesh,
  bishop: BishopMesh,
  knight: KnightMesh,
  queen: QueenMesh,
  king: KingMesh,
};

const ChessPiece3D: React.FC<ChessPiece3DProps> = ({
  type,
  position,
  color,
  name,
  pieceName,
  locked = false,
  completed = false,
  onClick,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Idle float animation
      const floatY = Math.sin(clock.elapsedTime * 1.5 + position[0]) * 0.08;
      groupRef.current.position.y = position[1] + floatY;
      // Subtle rotation
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5 + position[2]) * 0.1;
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.2 + Math.sin(clock.elapsedTime * 2) * 0.1;
    }
  });

  const PieceComponent = PIECE_COMPONENTS[type];
  const displayColor = locked ? '#888888' : color;

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (!locked && onClick) onClick();
      }}
      onPointerEnter={() => {
        if (!locked) {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      scale={hovered ? 1.15 : 1}
    >
      {/* Shadow circle beneath */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color="#000" transparent opacity={locked ? 0.03 : 0.1} />
      </mesh>

      {/* Glow ring on hover */}
      {hovered && (
        <mesh ref={glowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.6, 24]} />
          <meshStandardMaterial color="#ffd700" transparent opacity={0.3} emissive="#ffd700" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Completed golden ring */}
      {completed && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.58, 24]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.5} roughness={0.3} metalness={0.5} />
        </mesh>
      )}

      <group scale={locked ? 0.85 : 1}>
        <PieceComponent color={displayColor} />
      </group>

      {/* Lock icon for locked pieces */}
      {locked && (
        <mesh position={[0.3, 1.2, 0.3]}>
          <boxGeometry args={[0.2, 0.25, 0.1]} />
          <meshStandardMaterial color="#666" roughness={0.8} />
        </mesh>
      )}

      {/* HTML label */}
      <Html position={[0, 1.9, 0]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
        <div className="text-center whitespace-nowrap">
          <p className={`font-display text-sm font-bold drop-shadow-md ${locked ? 'text-muted-foreground' : 'text-foreground'}`}>
            {name}
          </p>
          <p className={`text-xs ${locked ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
            {pieceName}
          </p>
        </div>
      </Html>
    </group>
  );
};

export { PIECE_COLORS };
export default ChessPiece3D;
