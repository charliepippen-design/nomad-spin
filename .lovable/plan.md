# Clean Globe-First Landing

## Problem

The LandingDrawer component is rendered inside the central content area (`flex-col items-center justify-end`), which still positions it in the middle of the page. The globe should be the only thing visible on load.

## Changes

### 1. Move LandingDrawer out of the central content area (`src/pages/Index.tsx`)

- Remove the `LandingDrawer` from inside the `flex-1 flex flex-col items-center justify-end` container
- Place it as a sibling at the root level (like SocialShareBar), so it uses fixed positioning independently
- The central content area will be empty during the landing phase -- only the globe shows

### 2. Simplify LandingDrawer to start fully collapsed (`src/components/LandingDrawer.tsx`)

- Starts closed by default (already does this)
- The tab/handle on the left edge becomes the primary call-to-action, styled slightly more prominent so first-time visitors notice it
- Add a subtle initial animation (gentle pulse or glow) on the tab to draw attention on first load
- Keep the current slide-out panel behavior when opened

### 3.    Other layout changes

- Header bar stays as-is (top)  
Freeze the upper menu so that if user scrolls down he can still see explore and all those options on the top  
Social share bar stays on the right
- Results phase stays as-is
- FeaturedDestinations and HowItWorks sections below the fold stay unchanged

## Technical Details

### `src/pages/Index.tsx`

- Move lines 390-402 (the LandingDrawer block) outside the main content `div`, placing it at the same level as `SocialShareBar` (around line 520)
- Remove the `motion.div` wrapper and AnimatePresence around LandingDrawer since the drawer handles its own animations
- Keep the conditional: only render when `(phase === 'landing' || phase === 'preferences') && !isSpinning`

### `src/components/LandingDrawer.tsx`

- Make the collapsed tab slightly larger and more noticeable with a soft pulsing glow on first appearance
- Add a one-time subtle animation (e.g., the tab slides in from the left after 1s delay, with a brief glow) to signal interactivity to new visitors