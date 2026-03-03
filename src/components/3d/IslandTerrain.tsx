import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const IslandTerrain: React.FC = React.memo(() => {
  const waterRef = useRef<THREE.Mesh>(null);

  // Memoize all geometries
  const topGeo = useMemo(() => new THREE.CylinderGeometry(8, 8, 0.6, 24), []);
  const sideGeo = useMemo(() => new THREE.CylinderGeometry(8, 7, 2, 24), []);
  const bottomGeo = useMemo(() => new THREE.CylinderGeometry(7, 5, 0.5, 24), []);
  const sandGeo = useMemo(() => new THREE.CylinderGeometry(8.5, 8.5, 0.08, 24), []);
  const waterGeo = useMemo(() => new THREE.CylinderGeometry(18, 18, 0.1, 24), []);

  const grassMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5daa4a', roughness: 0.9, flatShading: true,
  }), []);
  const dirtMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8B6914', roughness: 1, flatShading: true,
  }), []);
  const sandMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e8d5a3', roughness: 0.95, flatShading: true,
  }), []);
  const waterMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a9eda', transparent: true, opacity: 0.6, roughness: 0.2, metalness: 0.1,
  }), []);

  // Dispose on unmount
  useEffect(() => {
    return () => {
      [topGeo, sideGeo, bottomGeo, sandGeo, waterGeo].forEach(g => g.dispose());
      [grassMat, dirtMat, sandMat, waterMat].forEach(m => m.dispose());
    };
  }, [topGeo, sideGeo, bottomGeo, sandGeo, waterGeo, grassMat, dirtMat, sandMat, waterMat]);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y = -1.8 + Math.sin(clock.elapsedTime * 0.5) * 0.05;
      waterMat.opacity = 0.55 + Math.sin(clock.elapsedTime * 0.8) * 0.1;
    }
  });

  const bumps = useMemo(() => [
    { pos: [2, 0.35, 1] as [number, number, number], s: 1.2 },
    { pos: [-3, 0.35, -2] as [number, number, number], s: 1.5 },
    { pos: [4, 0.35, -1] as [number, number, number], s: 1 },
    { pos: [-1, 0.35, 3] as [number, number, number], s: 1.3 },
    { pos: [0, 0.35, -4] as [number, number, number], s: 1.1 },
  ], []);

  return (
    <group>
      <mesh position={[0, 0, 0]} geometry={topGeo} material={grassMat} />
      <mesh position={[0, -1, 0]} geometry={sideGeo} material={dirtMat} />
      <mesh position={[0, -2.2, 0]} geometry={bottomGeo} material={dirtMat} />
      <mesh position={[0, 0.32, 0]} geometry={sandGeo} material={sandMat} />
      <mesh ref={waterRef} position={[0, -1.8, 0]} geometry={waterGeo} material={waterMat} />

      {bumps.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <sphereGeometry args={[b.s, 6, 4]} />
          <meshStandardMaterial color="#6bb85a" roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
});

IslandTerrain.displayName = 'IslandTerrain';
export default IslandTerrain;
