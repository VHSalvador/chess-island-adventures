# Chess Island Adventures — CLAUDE.md

## Project Purpose

An interactive educational web app that teaches children chess piece movements through a story-driven adventure. Each of the 6 chess pieces is personified as a Hungarian character with a unique moral virtue. The app is localized in Hungarian and targets young learners.

**Core loop:** Story → Movement Demo → Adventure → Quiz → Song → Badge

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| 3D Rendering | Three.js 0.160, @react-three/fiber, @react-three/drei |
| Styling | Tailwind CSS 3, shadcn-ui, Radix UI |
| Animation | Framer Motion |
| Backend | Supabase (auth + database) |
| State | @tanstack/react-query, React Hook Form, Zod |
| Testing | Vitest, @testing-library/react |
| Deployment | Lovable.dev (GitHub-integrated CI/CD) |

---

## Characters (Chess Pieces)

| Character | Piece | Color | Virtue |
|---|---|---|---|
| Bence | ♙ Pawn | Green | Perseverance |
| Ernő | ♖ Rook | Brown | Honesty |
| Szonja | ♗ Bishop | Purple | Creativity |
| Huba | ♘ Knight | Yellow | Cleverness |
| Vanda | ♕ Queen | Orange | Empathy |
| Balázs | ♚ King | Dark Green | Wisdom |

---

## Core Components

### Pages (`src/pages/`)
- `Auth.tsx` — Login/signup
- `Onboarding.tsx` — Character selection & naming (2 steps)
- `IslandMap.tsx` — Main 3D island with chapter markers
- `Chapter.tsx` — Multi-step chapter flow (story → quiz → badge)
- `GamePlay.tsx` — Pawn War mini-game (8x8 board, AI opponent)
- `Games.tsx` — Game selection screen
- `MyIsland.tsx` — 3D sandbox builder (6×6 grid, shop)
- `ParentDashboard.tsx` — Child progress analytics

### 3D Components (`src/components/3d/`)
- `SceneSetup.tsx` — Canvas, camera (orthographic, [10,10,10]), lighting, error boundary
- `IslandTerrain.tsx` — Layered island: grass top, dirt sides, sand, animated ocean
- `ChessPiece3D.tsx` — Procedural piece meshes with hover/completion states
- `DomainMarker.tsx` — Chapter location markers
- `BalanceTree.tsx` — Central progress tree (grows with chapter count)
- `PathRoad.tsx` — Connection paths between chapters
- `SandboxIsland.tsx` — My Island terrain
- `PlacedItem3D.tsx` — Shop items rendered on grid
- `GridOverlay.tsx` — Click-to-place grid in sandbox

### Data (`src/data/`)
- `chapters.ts` — 6 chapter definitions (story text, poem, adventure)
- `quizzes.ts` — 36 quiz questions, 6 per chapter (types: `chess`, `eq`, `math`)

### Characters (`src/components/characters/`)
- `CharacterSVG.tsx` — 6 SVG character definitions

---

## Routing

```
/auth            → Auth (public)
/onboarding      → Character selection (protected)
/map             → Island map (protected)
/chapter/:id     → Chapter 1–6 (protected)
/games           → Game selection (protected)
/game/:gameId    → Game play (protected)
/my-island       → Sandbox (protected)
/parent          → Parent dashboard (protected)
/                → Redirects to /map
```

---

## Database (Supabase)

Key tables:
- `child_profiles` — user_id, character_id, character_name, aranytaller (coins), current_chapter
- `chapter_progress` — child_profile_id, chapter_number, step, completed, stars_earned
- `quiz_results` — child_profile_id, chapter_number, question, correct, aranytaller_earned
- `island_inventory` — child_profile_id, item_type, item_name, grid_x, grid_y
- `shop_items` — item_type, item_name, emoji, price, description

Currency: **Aranytallér** (gold coins) — earned from quizzes and chapter completion.

---

## Development Guidelines

### General
- Keep all UI text in **Hungarian** (the app is fully localized)
- Target audience is **children** — keep UI friendly, playful, clear
- Follow existing component patterns before creating new abstractions
- Do not add comments unless logic is non-obvious

### 3D / WebGL (Critical)
- Always use **demand-based rendering** (`frameloop="demand"`) — never continuous rendering
- Dispose geometries/materials/textures on component unmount
- Use low polygon counts (8–12 segments max for most meshes)
- Keep canvas DPR adaptive (1–1.5 range)
- Never render two Three.js canvases simultaneously
- Wrap 3D scenes in the existing `SceneSetup` error boundary
- Handle WebGL context loss/restore events

### Styling
- Use **Tailwind utility classes** — avoid custom CSS unless necessary
- Primary fonts: `Baloo 2` (display/headings), `Nunito` (body)
- Custom animations defined in `tailwind.config.ts`: `breathe`, `float`, `sparkle`
- Character colors must match the defined palette per character

### State & Data
- Use **@tanstack/react-query** for all Supabase data fetching
- Use **Supabase client** from `src/integrations/supabase/client.ts`
- Auth state lives in `AuthContext` — do not bypass it

### Performance
- Memoize expensive 3D components with `React.memo`
- Prefer shared geometries/materials over per-instance allocation
- `Preload` drei utility is used globally — leverage it

### Testing
- Tests live in `src/test/`
- Run with `npm run test` (Vitest)
- Keep unit tests focused on game logic and utilities

### Build & Deploy
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Deployment is automatic via Lovable.dev on push to `main`

---

## Product Decisions

### Chapter Unlock Logic
- Chapters are **strictly sequential** — chapter N+1 unlocks only after chapter N is fully completed
- Children can **replay any completed chapter** freely (for fun / extra coins)
- `getChapterStatus()` in `IslandMap.tsx` drives locked/unlocked/completed state
- Completion is stored in `chapter_progress.completed` in Supabase

### Audio (Song Step)
- Song step is currently a **placeholder** (text/lyrics + physical action instructions)
- Will use **ElevenLabs** in the future with **uploaded audio files** — NOT the ElevenLabs API
- No audio infrastructure needed yet; implement when assets are ready

### Pawn War AI
- AI difficulty stays at **beginner level permanently** — suitable for young children
- No adaptive/progressive difficulty needed

### Data Persistence
- **All child progress must persist** per child profile in Supabase, including:
  - Chapter progress and completed steps
  - Quiz results and coins earned
  - Island builder placements (`island_inventory` table)
- Parent access will be added through Supabase with username/password credentials
- `island_inventory` table must be wired to persist sandbox state across sessions

### 3D vs 2D
- **Island map** → 3D (Three.js) — keep and improve
- **Island builder (My Island)** → 3D (Three.js) — keep and improve
- **Game screens (Chapter flow, quizzes, Pawn War)** → stay 2D — do not add 3D here
- The 3D island felt "rigid" — visual quality improvement is a future task

## Key Design Decisions (from `.lovable/plan.md`)

- **Three.js over Babylon.js** — decided to stay with Three.js for consistency
- **WebGL resilience** is a priority — context loss handling, error boundaries, proper cleanup
- **Orthographic camera** on the island map — gives a stylized top-down perspective
- **Procedural 3D pieces** — chess pieces built from primitive geometries, not imported models
- **`frameloop="always"`** — scene has continuous animations (ocean, piece bobbing, particles); demand mode was incorrectly used alongside an `AnimationLoop` that called `invalidate()` every frame anyway
- **Never call `gl.forceContextLoss()`** on unmount — it permanently destroys the WebGL context; only call `gl.dispose()`
- **Ocean geometry: 8×8 segments** (not 32×32) — 81 vertices vs 1,089; CPU vertex animation on 1,089 verts + `computeVertexNormals()` every frame caused crashes
- **No `Math.random()` during render** — tree scales must be deterministic (seeded from position or static constants)

---

## Files to Know First

```
src/data/chapters.ts          ← Chapter definitions and story content
src/data/quizzes.ts           ← All 36 quiz questions
src/components/3d/SceneSetup.tsx     ← 3D scene root
src/components/3d/IslandTerrain.tsx  ← Main island geometry
src/components/3d/ChessPiece3D.tsx   ← Piece meshes
src/pages/Chapter.tsx         ← Chapter multi-step flow
src/pages/GamePlay.tsx        ← Pawn War game logic
src/contexts/AuthContext.tsx  ← Auth state
```
