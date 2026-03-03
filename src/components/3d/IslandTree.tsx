import React from 'react';

interface IslandTreeProps {
  position: [number, number, number];
  scale?: number;
  trunkColor?: string;
  leafColor?: string;
}

const IslandTree: React.FC<IslandTreeProps> = ({
  position,
  scale = 1,
  trunkColor = '#7a5230',
  leafColor = '#3d8c32',
}) => {
  return (
    <group position={position} scale={scale}>
      {/* Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 12]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.08} />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={1} flatShading />
      </mesh>
      {/* Foliage layers */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[0.5, 0.8, 6]} />
        <meshStandardMaterial color={leafColor} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.38, 0.6, 6]} />
        <meshStandardMaterial color="#4ca840" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <coneGeometry args={[0.25, 0.45, 6]} />
        <meshStandardMaterial color="#5cb850" roughness={0.85} flatShading />
      </mesh>
    </group>
  );
};

export default IslandTree;
