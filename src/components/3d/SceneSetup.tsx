import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface SceneSetupProps {
  children: React.ReactNode;
  orbitEnabled?: boolean;
}

const SceneSetup: React.FC<SceneSetupProps> = ({ children, orbitEnabled = true }) => {
  return (
    <Canvas
      orthographic
      camera={{
        position: [10, 10, 10],
        zoom: 50,
        near: 0.1,
        far: 1000,
      }}
      shadows
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0, 0);
      }}
    >
      <color attach="background" args={['#8ec8e8']} />
      <fog attach="fog" args={['#8ec8e8', 30, 60]} />

      <ambientLight intensity={0.6} color="#fff5e6" />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.001}
      />
      <directionalLight position={[-4, 6, -4]} intensity={0.3} color="#b0d0ff" />

      {orbitEnabled && (
        <OrbitControls
          enablePan={false}
          minZoom={30}
          maxZoom={80}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={Math.PI / 6}
          enableDamping
          dampingFactor={0.05}
        />
      )}

      <Suspense fallback={null}>
        {children}
      </Suspense>
    </Canvas>
  );
};

export default SceneSetup;
