

# 3D Chess Island Transformation Plan

## Overview
Replace the current 2D SVG island map and sandbox with a full 3D environment using `@react-three/fiber@^8.18` and `@react-three/drei@^9.122.0` (+ `three@^0.160`). The Parent Dashboard, Quizzes, and Auth pages remain 2D HTML.

## New Dependencies
- `three@^0.160.0`
- `@react-three/fiber@^8.18.0`
- `@react-three/drei@^9.122.0`

## Implementation

### 1. 3D Scene Infrastructure
**New file: `src/components/3d/SceneSetup.tsx`**
- Reusable `<Canvas>` wrapper with orthographic camera (isometric angle ~35° X, 45° Y rotation)
- `AmbientLight` (intensity 0.6) + `DirectionalLight` with soft shadows
- `OrbitControls` from drei — limited rotation (no flip), zoom bounded
- Sky/environment color matching current `--island-sky` tokens

### 2. 3D Island Map (`IslandMap.tsx` rewrite)
**New files:**
- `src/components/3d/IslandTerrain.tsx` — The floating island mesh
  - Cylinder geometry for the base (thick disc with rounded edges via `RoundedBox` or custom geometry)
  - Top surface: green grass material, sides: brown earth/dirt
  - Sand ring around edges using a slightly larger flat disc
  - Water plane below the island with animated opacity
- `src/components/3d/IslandTree.tsx` — Reusable low-poly tree (cone + cylinder)
- `src/components/3d/BalanceTree.tsx` — Central tree that scales with `completedCount`
- `src/components/3d/ChessPiece3D.tsx` — 6 chess piece meshes (pawn, rook, bishop, knight, queen, king)
  - Built from basic Three.js geometries (lathe/cylinder/sphere combos)
  - Each piece has its character color, rounded friendly look
  - Idle animation: gentle `useFrame` float (sin wave on Y) + subtle rotation
  - Locked pieces: gray material + semi-transparent
  - Hover: scale up + glow ring (drei `Ring` mesh beneath)
- `src/components/3d/DomainMarker.tsx` — Circular platform under each character with terrain variation
- `src/components/3d/PathRoad.tsx` — Curved tube geometry connecting domains

**`IslandMap.tsx` changes:**
- Replace the SVG + HTML overlay with a `<Canvas>` filling the viewport
- Character click detection via `onClick` on meshes (raycasting handled by R3F)
- HTML overlay header (profile, coins, nav buttons) stays as a `position: absolute` div on top of the canvas
- Use drei `Html` component for character name labels floating above pieces

### 3. 3D Sandbox (`MyIsland.tsx` rewrite)
**New files:**
- `src/components/3d/SandboxIsland.tsx` — Smaller personal island terrain
- `src/components/3d/PlacedItem3D.tsx` — 3D versions of shop items (trees, houses, flowers as simple geometry)
- `src/components/3d/GridOverlay.tsx` — Visual grid on the island floor (lines or tile meshes), highlighted on hover during placement

**`MyIsland.tsx` changes:**
- Canvas with the sandbox island
- Pointer interaction: `onPointerMove` on the ground plane to detect grid cell → highlight → `onClick` to place
- Shop panel remains as HTML overlay (bottom sheet) on top of the canvas
- Placed items stored with existing `grid_x`, `grid_y` columns (no schema change — z is always 0/ground level)

### 4. Chess Piece 3D Geometries (detail)
Each piece built from primitive Three.js shapes:
- **Pawn (Bence):** sphere head + tapered cylinder body + disc base — green
- **Rook (Ernő):** cylinder with notched top (4 small boxes) — brown/stone
- **Bishop (Szonja):** pointed oval body + small sphere on top — purple
- **Knight (Huba):** custom shape approximating horse head (box + angled box) — gold
- **Queen (Vanda):** crown shape (cylinder + small spheres/cones on top) — amber
- **King (Balázs):** similar to queen but with cross on top — forest green

All pieces: rounded, oversized heads/features for kid-friendly look, subtle face decals using drei `Decal` or `Html` for eyes/smile.

### 5. Files Unchanged
- `ParentDashboard.tsx` — stays 2D HTML with recharts
- `Chapter.tsx`, `Games.tsx`, `GamePlay.tsx` — stay 2D
- `Auth.tsx`, `Onboarding.tsx` — stay 2D
- All Supabase queries, auth context, data layer — unchanged
- Database schema — unchanged

### 6. Implementation Order
1. Install three + R3F + drei
2. Create `SceneSetup.tsx` with camera/lights
3. Build `IslandTerrain.tsx` + `IslandTree.tsx` + `BalanceTree.tsx`
4. Build `ChessPiece3D.tsx` with all 6 pieces
5. Build `DomainMarker.tsx` + `PathRoad.tsx`
6. Rewrite `IslandMap.tsx` to use 3D canvas
7. Build sandbox 3D components
8. Rewrite `MyIsland.tsx` to use 3D canvas

