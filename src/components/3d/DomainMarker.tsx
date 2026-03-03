import React from 'react';

interface DomainMarkerProps {
  position: [number, number, number];
  color: string;
  locked?: boolean;
  completed?: boolean;
}

const DomainMarker: React.FC<DomainMarkerProps> = ({ position, color, locked, completed }) => {
  return (
    <group position={position}>
      {/* Platform disc */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.1, 24]} />
        <meshStandardMaterial
          color={locked ? '#aaa' : color}
          roughness={0.7}
          transparent
          opacity={locked ? 0.3 : 0.6}
          flatShading
        />
      </mesh>

      {/* Inner ring */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.85, 24]} />
        <meshStandardMaterial
          color={completed ? '#ffd700' : locked ? '#888' : color}
          transparent
          opacity={locked ? 0.2 : 0.4}
        />
      </mesh>

      {/* Grass patches around */}
      {!locked && [0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 1.3, 0.08, Math.sin(angle) * 1.3]} receiveShadow>
          <sphereGeometry args={[0.2, 6, 4]} />
          <meshStandardMaterial color="#5daa4a" roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
};

export default DomainMarker;
