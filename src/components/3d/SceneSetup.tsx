import React, { Suspense, Component, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Error boundary to catch WebGL failures gracefully
class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const WebGLFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-island-sky to-island-water">
    <div className="isometric-card p-8 text-center max-w-sm bg-card/90 backdrop-blur-sm">
      <p className="font-display text-lg text-card-foreground mb-2">🏝️ 3D Sziget</p>
      <p className="text-sm text-muted-foreground mb-4">
        A böngésződ jelenleg nem tudja megjeleníteni a 3D-s tartalmat. Próbáld meg frissíteni az oldalt!
      </p>
      <button
        onClick={() => window.location.reload()}
        className="child-button bg-primary text-primary-foreground px-6 py-2 text-sm"
      >
        Frissítés
      </button>
    </div>
  </div>
);

interface SceneSetupProps {
  children: React.ReactNode;
  orbitEnabled?: boolean;
}

const SceneSetup: React.FC<SceneSetupProps> = ({ children, orbitEnabled = true }) => {
  return (
    <WebGLErrorBoundary fallback={<WebGLFallback />}>
      <Canvas
        orthographic
        camera={{
          position: [10, 10, 10],
          zoom: 50,
          near: 0.1,
          far: 1000,
        }}
        shadows
        frameloop="demand"
        style={{ width: '100%', height: '100%' }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ camera, invalidate }) => {
          camera.lookAt(0, 0, 0);
          // Switch to continuous after first render
          invalidate();
          setTimeout(() => {
            // Re-enable continuous loop after mount
          }, 100);
        }}
      >
        <AutoInvalidate />
        <color attach="background" args={['#8ec8e8']} />
        <fog attach="fog" args={['#8ec8e8', 30, 60]} />

        <ambientLight intensity={0.6} color="#fff5e6" />
        <directionalLight
          position={[8, 12, 6]}
          intensity={1.2}
          color="#fff8f0"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
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
    </WebGLErrorBoundary>
  );
};

// Component that continuously invalidates for animations
import { useFrame } from '@react-three/fiber';

const AutoInvalidate = () => {
  useFrame(({ invalidate }) => {
    invalidate();
  });
  return null;
};

export default SceneSetup;
