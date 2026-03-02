

# 🏝️ Sakk-Sziget Hősei (Chess Island Heroes) — Implementation Plan

## Overview
A Hungarian-language chess learning app for children aged 4-8, based on the uploaded book "A Sakk-Sziget Hősei." Six charming characters each represent a chess piece and teach children chess rules, emotional intelligence, logic, and life skills through stories, quizzes, and mini-games.

---

## 1. 🔐 Authentication & Onboarding

**Parent Login:**
- Simple username + password login (Supabase Auth)
- Parent creates an account, then the child's session begins

**Child Onboarding (first login only):**
- Choose a character avatar (one of the 6 heroes)
- Give the character a name
- Fun, colorful wizard-style onboarding with large buttons
- After first setup, the child goes directly to the island map on subsequent logins

**Database:** Profiles table for parent info, child_profiles table for character choice, name, progress, and Aranytallér balance

---

## 2. 🗺️ Island Map (Main Navigation)

- Beautiful illustrated map of Sakk-Sziget with the 6 character zones
- **Linear unlock system:** Bence → Ernő → Szonja → Huba → Vanda → Balázs
- Locked chapters shown with a lock icon, completed ones with a star ⭐
- The Egyensúly Fája (Balance Tree) visible in the center
- Animated characters with idle "breathing" animations
- Large, rounded, high-contrast buttons suitable for small children

---

## 3. 📖 Chapter System (6 Chapters)

Each chapter follows the same structure from the book:

1. **Story Introduction** — Character poem and backstory with illustrations
2. **Movement Rules** — Interactive chess board showing how the piece moves
3. **Story Adventure** — The character's adventure (Bence finds a new path, Ernő saves Bence, etc.)
4. **Practice Tasks** — Interactive exercises (draw paths, identify moves, math questions)
5. **Character Song** — The character's song with "Csináld velem!" (Do it with me!) actions
6. **Star Badge** — Earn the character's star upon completion

**Content directly from the book:**
- Bence (Pawn): Persistence, forward movement, promotion
- Ernő (Rook): Honesty, straight-line movement
- Szonja (Bishop): Creativity, diagonal movement, color-bound
- Huba (Knight): Out-of-the-box thinking, L-shaped jumps
- Vanda (Queen): Empathy, all-direction movement
- Balázs (King): Wisdom & patience, one-step movement

---

## 4. 🧩 Quiz Engine

Three types of questions after each chapter:

- **Chess Questions:** "Where can this piece move?", legal move validation on an interactive board
- **EQ Questions:** "How did Bence feel when he was blocked?", "Why is honesty important like Ernő?"
- **Logic & Math:** Counting squares (8×8=64), simple addition (3+2=5), drawing + and X patterns

Correct answers earn **Aranytallér** (Gold Coins) 🪙

---

## 5. ♟️ Chess Mini-Games

**Progressive chess games (unlocked as chapters complete):**

- **Gyalogháború (Pawn War):** Only pawns on the board — first to promote or capture all wins
- **Capture the Castle:** Simplified piece vs. piece challenges
- **Piece-specific exercises:** Move a single piece to collect stars on the board
- **Full board setup:** Only available after ALL 6 chapters are completed

**Board Features:**
- Legal move highlights (green dots)
- "Tipp" button (AI hint)
- "Vissza" button (Undo last move)
- Friendly chess piece designs on the board
- Child-friendly terminology: "Vigyázz, Balázs!" instead of "Check", "Körbezárás" instead of "Checkmate"

**AI Difficulty (Stockfish.js via Web Worker):**
- Kezdő (Beginner): Skill 0
- Közepes (Medium): Skill 5
- Profi (Pro): Skill 12

---

## 6. 🏠 My Island (Building Mode)

- Personal island grid where children spend their Aranytallér
- **Shop items:** Cottage, trees, the Balance Tree, decorations, flowers, fences
- **Drag-and-drop** placement on a simple grid
- Items persist in the database
- Motivates children to complete chapters and quizzes to earn more coins

---

## 7. 👨‍👩‍👧 Parent Dashboard

- View child's current chapter progress
- See which stars/badges have been earned
- Track Aranytallér balance and island items
- View quiz performance (chess, EQ, math scores)
- Simple, clean dashboard accessible after parent login

---

## 8. 🎨 Visual Design & Characters

- **Color scheme:** Warm, friendly colors — greens, blues, golds
- **Characters:** Custom SVG chess pieces with friendly faces, inspired by the book descriptions:
  - Bence: Small green sprout with big eyes
  - Ernő: Grey-brown stone tower with determined expression
  - Szonja: Blue-purple flowing figure
  - Huba: Yellow-white energetic figure with lightning
  - Vanda: Gold-orange glowing figure with rays
  - Balázs: Brown-green tree figure with a leaf crown
- **UI:** Extra-large touch targets, rounded corners, playful animations (Framer Motion)
- **Language:** All UI text in simple Hungarian for 4-8 year olds

---

## 9. 🔊 Audio (Planned for Later)
- Placeholder structure for narrator voice-overs
- Character voice hooks ready (Bence: "Előre!", Huba: "Hoppsza!")
- ElevenLabs integration can be added in a future phase

---

## Technical Architecture
- **Frontend:** React + Vite + Tailwind + Framer Motion
- **Backend:** Supabase (Auth, Database, Storage)
- **Chess Engine:** Stockfish.js running in a Web Worker
- **State:** React Query for server state, React context for game state
- **Database tables:** profiles, child_profiles, chapter_progress, quiz_results, island_inventory, shop_items

