import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated ocean with vertex displacement
const AnimatedOcean: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => new THREE.PlaneGeometry(40, 40, 32, 32), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a9eda',
    transparent: true,
    opacity: 0.55,
    roughness: 0.2,
    metalness: 0.1,
    side: THREE.DoubleSide,
  }), []);

  useEffect(() => {
    return () => { geo.dispose(); mat.dispose(); };
  }, [geo, mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = geo.attributes.position;
    const t = clock.elapsedTime;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      posAttr.setZ(i, Math.sin(x * 0.4 + t * 0.8) * 0.15 + Math.cos(y * 0.3 + t * 0.6) * 0.1);
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} geometry={geo} material={mat} />
  );
};

const IslandTerrain: React.FC = React.memo(() => {
  // Memoize all geometries
  const topGeo = useMemo(() => new THREE.CylinderGeometry(8, 8, 0.6, 24), []);
  const sideGeo = useMemo(() => new THREE.CylinderGeometry(8, 7, 2, 24), []);
  const bottomGeo = useMemo(() => new THREE.CylinderGeometry(7, 5, 0.5, 24), []);
  const sandGeo = useMemo(() => new THREE.CylinderGeometry(8.5, 8.5, 0.08, 24), []);

  const grassMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5daa4a', roughness: 0.9, flatShading: true,
  }), []);
  const dirtMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8B6914', roughness: 1, flatShading: true,
  }), []);
  const sandMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e8d5a3', roughness: 0.95, flatShading: true,
  }), []);

  // Dispose on unmount
  useEffect(() => {
    return () => {
      [topGeo, sideGeo, bottomGeo, sandGeo].forEach(g => g.dispose());
      [grassMat, dirtMat, sandMat].forEach(m => m.dispose());
    };
  }, [topGeo, sideGeo, bottomGeo, sandGeo, grassMat, dirtMat, sandMat]);

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

      {/* Animated ocean replaces static water disc */}
      <AnimatedOcean />

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
