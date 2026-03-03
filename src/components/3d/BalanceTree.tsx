import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Points, PointMaterial } from '@react-three/drei';

// Floating sparkle particles around the tree
const TreeParticles: React.FC<{ count: number }> = ({ count }) => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 1.2;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = 1.2 + Math.random() * 2;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const baseY = 1.2 + ((i * 0.618) % 1) * 2;
      posAttr.setY(i, baseY + Math.sin(t * 0.8 + i * 1.3) * 0.2);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#ffd700"
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
};

interface BalanceTreeProps {
  completedCount: number;
}

const BalanceTree: React.FC<BalanceTreeProps> = ({ completedCount }) => {
  const glowRef = useRef<THREE.Mesh>(null);

  const treeScale = 1 + completedCount * 0.15;

  useFrame(({ clock }) => {
    if (glowRef.current && completedCount > 0) {
      (glowRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.15 + Math.sin(clock.elapsedTime * 1.5) * 0.08;
    }
  });

  return (
    <group position={[0, 0.3, 0]} scale={treeScale}>
      {/* Trunk */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.15, 0.22, 1.6, 8]} />
        <meshStandardMaterial color="#6b4226" roughness={1} flatShading />
      </mesh>

      {/* Main crown */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.9, 8, 6]} />
        <meshStandardMaterial color="#3aa832" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.3, 2.3, 0.2]}>
        <sphereGeometry args={[0.6, 8, 6]} />
        <meshStandardMaterial color="#4cc240" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[-0.25, 2.4, -0.15]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color="#48b83c" roughness={0.8} flatShading />
      </mesh>

      {/* Golden glow when chapters completed */}
      {completedCount > 0 && (
        <>
          <mesh ref={glowRef} position={[0, 2, 0]}>
            <sphereGeometry args={[1.5, 12, 8]} />
            <meshStandardMaterial
              color="#ffd700"
              transparent
              opacity={0.15}
              emissive="#ffd700"
              emissiveIntensity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <TreeParticles count={Math.min(completedCount * 8, 48)} />
        </>
      )}

      {/* Small golden fruits based on completed count */}
      {Array.from({ length: completedCount }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 0.6;
        return (
          <mesh
            key={`fruit-${i}`}
            position={[Math.cos(angle) * r, 2 + Math.sin(angle * 2) * 0.3, Math.sin(angle) * r]}
          >
            <sphereGeometry args={[0.1, 6, 4]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.4} roughness={0.3} metalness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

export default BalanceTree;
