

# Sakk-Sziget Visual & UX Overhaul Plan

This is a major visual and functional upgrade across the entire app. The work breaks down into 5 areas.

---

## 1. Isometric Island Map Redesign (`IslandMap.tsx`)

**Current:** Flat SVG ellipses with character buttons scattered on percentage positions.

**New:**
- Full isometric (2.5D) island SVG with terrain zones: grass, sand, water, palm trees, rocks
- Each character gets a distinct "domain" zone on the island (e.g., Bence's meadow, Ernő's castle, Szonja's crystal grove)
- Winding roads/paths connecting domains — visually showing the progression path
- Locked domains shown with fog/clouds overlay + lock icon
- Completed domains glow with a subtle golden border
- Characters have idle "breathing" + "float" animations on their domains
- The Balance Tree (Egyensúly Fája) in the center, growing as chapters complete
- Ocean waves animation around the island edges
- Header bar redesigned with isometric-style rounded card for profile/coins

## 2. Character SVG Upgrade (`CharacterSVG.tsx`)

**Current:** Simple 2D flat SVG shapes.

**New:**
- Add 3D-ish depth: gradients, highlights, shadows on each character
- Add subtle drop shadows beneath characters
- Rounder, friendlier proportions with more detail (blush on cheeks, gradient fills)
- Keep the same viewBox and interface — just enhance the SVG paths
- Consistent art style across all 6 characters

## 3. My Island Sandbox Redesign (`MyIsland.tsx`)

**Current:** Plain grid of square cells.

**New:**
- Green island background with grass texture, sand edges, water border
- Grid cells styled as natural terrain patches (grass tiles) instead of plain boxes
- Placed items rendered with slight 3D shadow/elevation
- Shop redesigned as a floating panel with categorized tabs (Trees, Buildings, Decorations)
- Drag-and-drop: use `onPointerDown/Move/Up` for touch-friendly drag placement instead of click-to-place
- Island state persists via existing `island_inventory` table (no schema change needed)

## 4. Parent Dashboard with Radar Chart (`ParentDashboard.tsx`)

**Current:** Simple text-based stats cards.

**New:**
- Use `recharts` RadarChart for Sakk/EQ/Matek skill visualization
- Percentage-based progress bars per character chapter (e.g., "Bence: 100%, Ernő: 60%")
- Cleaner card layout with icons and progress rings
- Keep the existing data queries — just improve the presentation layer

## 5. Global Visual Consistency

- Update `index.css` color tokens for warmer pastel tones with better contrast
- Add isometric-style utility classes (e.g., `isometric-card` with transform perspective)
- Ensure all pages use consistent rounded-3xl cards, soft shadows, and the display font
- Touch-safe: minimum 48px touch targets everywhere, tested on mobile viewports
- Loading states: replace emoji spinner with animated character SVG

---

## Technical Notes

- **No database schema changes needed** — all changes are frontend/visual
- **recharts** is already installed for the radar chart
- **Framer Motion** is already installed for animations
- All existing Supabase queries and auth flow remain unchanged
- The isometric island will be a large SVG component with `viewBox` for responsive scaling
- Drag-and-drop on MyIsland uses pointer events (no new library needed)

## Implementation Order

1. Character SVG upgrade (foundation for everything else)
2. Global design tokens & utility classes
3. Island Map redesign
4. My Island sandbox redesign
5. Parent Dashboard radar chart

