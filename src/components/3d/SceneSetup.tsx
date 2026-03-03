import React, { Suspense, Component, type ReactNode, useEffect, useRef, memo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, AdaptiveDpr, Preload } from '@react-three/drei';

// Error boundary that auto-reloads on persistent WebGL failure
class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; retryCount: number }
> {
  state = { hasError: false, retryCount: 0 };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    if (this.state.retryCount < 1) {
      setTimeout(() => this.setState({ hasError: false, retryCount: this.state.retryCount + 1 }), 500);
    }
  }

  render() {
    if (this.state.hasError && this.state.retryCount >= 1) {
      return <WebGLFallback />;
    }
    return this.props.children;
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

// Cleanup component - disposes renderer on unmount + handles context loss
const RendererCleanup: React.FC = () => {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('[SceneSetup] WebGL context lost — waiting for restore…');
    };

    const handleContextRestored = () => {
      console.info('[SceneSetup] WebGL context restored');
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      gl.dispose();
    };
  }, [gl]);

  return null;
};

interface SceneSetupProps {
  children: React.ReactNode;
  orbitEnabled?: boolean;
}

const SceneContent: React.FC<SceneSetupProps> = memo(({ children, orbitEnabled = true }) => {
  return (
    <>
      <RendererCleanup />
      <AdaptiveDpr pixelated />

      <color attach="background" args={['#8ec8e8']} />
      <fog attach="fog" args={['#8ec8e8', 30, 60]} />

      <ambientLight intensity={0.7} color="#fff5e6" />
      <directionalLight position={[8, 12, 6]} intensity={1.2} color="#fff8f0" />
      <directionalLight position={[-4, 6, -4]} intensity={0.3} color="#b0d0ff" />

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.35}
        scale={25}
        blur={2}
        far={8}
        resolution={256}
        color="#2a4a1a"
      />

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

      <Preload all />
    </>
  );
});

SceneContent.displayName = 'SceneContent';

const SceneSetup: React.FC<SceneSetupProps> = ({ children, orbitEnabled = true }) => {
  const canvasKey = useRef(0);

  return (
    <WebGLErrorBoundary>
      <Canvas
        key={canvasKey.current}
        orthographic
        camera={{
          position: [10, 10, 10],
          zoom: 50,
          near: 0.1,
          far: 1000,
        }}
        frameloop="always"
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
        gl={{
          antialias: false,
          alpha: true,
          stencil: false,
          depth: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        shadows={false}
        onCreated={({ camera, invalidate }) => {
          camera.lookAt(0, 0, 0);
          invalidate();
        }}
      >
        <SceneContent orbitEnabled={orbitEnabled}>
          {children}
        </SceneContent>
      </Canvas>
    </WebGLErrorBoundary>
  );
};

export default SceneSetup;
