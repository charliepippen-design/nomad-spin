

# More Visible Scrollbar for Landing Drawer

## Problem
The drawer's scrollable area uses the default thin/invisible scrollbar, making it hard for users to realize they can scroll back up when deep in the content.

## Solution
Add a custom visible scrollbar to the drawer's scrollable container using Tailwind CSS utility classes. This will render a slim but clearly visible track and thumb on the right edge of the drawer.

## Technical Details

### `src/components/LandingDrawer.tsx`
- On the scrollable `<div>` (line 213), add custom scrollbar classes
- Add a "Back to top" floating button that appears when the user scrolls down past a threshold, allowing one-click scroll to top

### `src/index.css`
- Add custom scrollbar CSS utilities for a styled, always-visible scrollbar:
  - Thin track with subtle background (`bg-white/5`)
  - Visible thumb with a brighter color (`bg-white/20`, hover `bg-white/40`)
  - Rounded corners for a polished look
  - Works in both Webkit (Chrome/Safari) and Firefox

### Files modified:
- `src/index.css` -- add custom scrollbar utility class
- `src/components/LandingDrawer.tsx` -- apply scrollbar class + add floating "scroll to top" button

