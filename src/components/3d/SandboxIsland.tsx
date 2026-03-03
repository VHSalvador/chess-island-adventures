import React from 'react';

const SandboxIsland: React.FC = () => {
  return (
    <group>
      {/* Main island surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[5, 5, 0.4, 24]} />
        <meshStandardMaterial color="#5daa4a" roughness={0.9} flatShading />
      </mesh>

      {/* Dirt sides */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[5, 4.5, 1, 24]} />
        <meshStandardMaterial color="#8B6914" roughness={1} flatShading />
      </mesh>

      {/* Sand ring */}
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <cylinderGeometry args={[5.3, 5.3, 0.05, 24]} />
        <meshStandardMaterial color="#e8d5a3" roughness={0.95} flatShading />
      </mesh>

      {/* Water */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[12, 12, 0.08, 32]} />
        <meshStandardMaterial color="#4a9eda" transparent opacity={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
};

export default SandboxIsland;
