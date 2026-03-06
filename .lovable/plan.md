

# Plan: Stick with Three.js — Do NOT Switch to Babylon.js

## Why Not Babylon.js

Switching to Babylon.js would be a **high-risk, low-reward** move:

1. **`react-babylonjs` is poorly maintained** — low adoption, sparse docs, React 18 compatibility issues. It's nowhere near as battle-tested as `@react-three/fiber`.
2. **Complete rewrite of 10 components** for no functional gain. The WebGL context loss issue was already fixed with proper disposal and `failIfMajorPerformanceCaveat: false`.
3. **Babylon.js bundle is ~3x larger** than Three.js — bad for a children's app that needs fast loading on tablets.
4. **The existing Three.js setup already works** — the context loss was an HMR artifact, not a Three.js deficiency.

## What I Recommend Instead

Fix the remaining stability issues and polish the existing Three.js 3D environment:

### 1. Harden WebGL Resilience (`SceneSetup.tsx`)
- Add `onContextLost` / `onContextRestored` handlers on the canvas to gracefully recover instead of crashing
- Limit simultaneous canvases: ensure only one `<Canvas>` is mounted at a time (IslandMap OR MyIsland, never both)

### 2. Improve Visual Quality (existing components)
- Add animated ocean plane with vertex displacement in `IslandTerrain.tsx`
- Enhance tree variety with randomized scales/colors in `IslandTree.tsx`
- Add subtle particle effects (floating leaves/sparkles) near the Balance Tree

### 3. Performance Guard
- Add `useEffect` cleanup in every 3D component that creates geometries/materials
- Use `drei`'s `Preload` to warm up assets before the scene renders

This approach keeps the working codebase, fixes the actual issues, and improves visuals — without the massive risk of a framework swap.

