import React, { useMemo } from 'react';

interface IslandTreeProps {
  position: [number, number, number];
  scale?: number;
  trunkColor?: string;
  leafColor?: string;
}

// Seeded pseudo-random from position for stable variety
const hash = (x: number, z: number) => {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

const LEAF_PALETTE = ['#3d8c32', '#4ca840', '#5cb850', '#2e7a28', '#48a03a'];
const TRUNK_PALETTE = ['#7a5230', '#6b4226', '#8a6238'];

const IslandTree: React.FC<IslandTreeProps> = ({
  position,
  scale = 1,
  trunkColor,
  leafColor,
}) => {
  const variety = useMemo(() => {
    const h = hash(position[0], position[2]);
    return {
      trunk: trunkColor || TRUNK_PALETTE[Math.floor(h * TRUNK_PALETTE.length)],
      leaf1: leafColor || LEAF_PALETTE[Math.floor(h * 100 % LEAF_PALETTE.length)],
      leaf2: LEAF_PALETTE[Math.floor(h * 200 % LEAF_PALETTE.length)],
      leaf3: LEAF_PALETTE[Math.floor(h * 300 % LEAF_PALETTE.length)],
      scaleVar: 0.85 + h * 0.3,
      rotY: h * Math.PI * 2,
    };
  }, [position, trunkColor, leafColor]);

  return (
    <group position={position} scale={scale * variety.scaleVar} rotation={[0, variety.rotY, 0]}>
      {/* Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 8]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.08} />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1, 6]} />
        <meshStandardMaterial color={variety.trunk} roughness={1} flatShading />
      </mesh>
      {/* Foliage layers */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.5, 0.8, 6]} />
        <meshStandardMaterial color={variety.leaf1} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <coneGeometry args={[0.38, 0.6, 6]} />
        <meshStandardMaterial color={variety.leaf2} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <coneGeometry args={[0.25, 0.45, 6]} />
        <meshStandardMaterial color={variety.leaf3} roughness={0.85} flatShading />
      </mesh>
    </group>
  );
};

export default IslandTree;
