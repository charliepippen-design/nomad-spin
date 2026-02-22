

# Redesign: Non-Disruptive Navigation Layout

## Problem
The current layout places the hero content (title, spin button, scroll indicator) and social share buttons directly over the 3D globe, causing:
- Mouse wheel conflicts between page scroll and globe zoom
- Click/drag confusion between UI elements and globe rotation
- The globe -- the visual centerpiece -- is obscured on load

## Solution Overview

### 1. Move Social Share Bar to the Right
Relocate the vertical social bar from the left edge to the right edge of the screen. On mobile, keep it as a horizontal bar at the bottom. This is a simple CSS change.

### 2. Collapse Hero Content into a Minimal Left-Edge Drawer
Instead of a centered overlay that covers the globe, the landing content (tagline, spin button, scroll indicator) will live inside a slim, slide-out panel anchored to the left edge:

- **Collapsed state (default)**: A narrow vertical tab/handle visible at the left edge with the text "SPIN" or a compass icon, inviting the user to drag or click to open.
- **Expanded state**: A ~320px wide frosted-glass panel slides in from the left, containing the tagline, spin button, saved spins, and scroll-to-explore button.
- The panel can be opened by clicking the tab or swiping right on mobile.
- Clicking outside or pressing the close button slides it back.

This keeps the globe fully visible and interactive by default, while all controls remain one click/swipe away.

### 3. Keep the Top Header Bar As-Is
The top bar (brand, streak, controls, auth) is compact and works well. No changes needed there.

### 4. Results Phase Unchanged
When results appear, they still overlay the bottom of the screen as they do now -- this is expected since the user has already interacted.

## Technical Details

### Files to modify:

**`src/components/SocialShareBar.tsx`**
- Change desktop position from `left-3` to `right-3`
- No other changes needed

**`src/pages/Index.tsx`**
- Extract the landing-phase content block into a new `LandingDrawer` component
- Replace the centered `motion.div` (landing phase) with the drawer
- The drawer uses framer-motion `animate` for slide-in/out from the left
- Add a persistent tab/handle on the left edge when the drawer is closed
- The drawer has `pointer-events-auto` while the rest stays `pointer-events-none`

**`src/components/LandingDrawer.tsx`** (new file)
- A slide-out panel component with:
  - A visible edge handle (always shown when closed)
  - Glassmorphism styling (`bg-black/60 backdrop-blur-xl border-r border-white/10`)
  - Contains: tagline, "SPIN & COMPARE" button, saved spins, scroll-to-explore
  - Framer Motion `AnimatePresence` for smooth open/close
  - Click-outside-to-close behavior
  - On mobile: slides up from the bottom instead of from the left

### Interaction flow:
1. User lands on page -- sees full globe with a subtle tab on the left edge reading "EXPLORE"
2. Clicks/taps the tab -- panel slides out with the mission brief and spin button
3. Clicks "SPIN & COMPARE" -- panel closes, preferences modal opens as before
4. Globe remains fully interactive (zoom, drag, hover tooltips) whenever the panel is closed

