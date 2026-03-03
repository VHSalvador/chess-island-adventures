import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const IslandTerrain: React.FC = () => {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y = -1.8 + Math.sin(clock.elapsedTime * 0.5) * 0.05;
      (waterRef.current.material as THREE.MeshStandardMaterial).opacity = 0.55 + Math.sin(clock.elapsedTime * 0.8) * 0.1;
    }
  });

  const grassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5daa4a',
    roughness: 0.9,
    flatShading: true,
  }), []);

  const dirtMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8B6914',
    roughness: 1,
    flatShading: true,
  }), []);

  const sandMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e8d5a3',
    roughness: 0.95,
    flatShading: true,
  }), []);

  return (
    <group>
      {/* Main island top - grass */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[8, 8, 0.6, 32]} />
        <primitive object={grassMaterial} attach="material" />
      </mesh>

      {/* Island sides - dirt */}
      <mesh position={[0, -1, 0]} castShadow>
        <cylinderGeometry args={[8, 7, 2, 32]} />
        <primitive object={dirtMaterial} attach="material" />
      </mesh>

      {/* Bottom of island */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[7, 5, 0.5, 32]} />
        <primitive object={dirtMaterial} attach="material" />
      </mesh>

      {/* Sand ring */}
      <mesh position={[0, 0.32, 0]} receiveShadow>
        <cylinderGeometry args={[8.5, 8.5, 0.08, 32]} />
        <primitive object={sandMaterial} attach="material" />
      </mesh>

      {/* Water plane */}
      <mesh ref={waterRef} position={[0, -1.8, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[18, 18, 0.1, 48]} />
        <meshStandardMaterial
          color="#4a9eda"
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Small grass bumps for texture */}
      {[
        [2, 0.35, 1, 1.2],
        [-3, 0.35, -2, 1.5],
        [4, 0.35, -1, 1],
        [-1, 0.35, 3, 1.3],
        [0, 0.35, -4, 1.1],
      ].map(([x, y, z, s], i) => (
        <mesh key={`bump-${i}`} position={[x as number, y as number, z as number]} receiveShadow>
          <sphereGeometry args={[s as number, 8, 6]} />
          <meshStandardMaterial color="#6bb85a" roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
};

export default IslandTerrain;
