
# Giant Scrollbar, Always-Visible Arrow, and Scroll Hint

## Overview
Three hard-guarantee mechanisms so a user at the bottom of the drawer always has an obvious way back up.

---

## 1. Chunky, High-Contrast Scrollbar (`src/index.css`)

Replace the current `.scrollbar-visible` styles (inside `@layer utilities`) with the user's exact spec -- moved **outside** `@layer utilities` so Tailwind can't lower its specificity:

- `width: 20px`
- Track: solid `#000000`
- Thumb: bright yellow `#ffeb3b`, `border-radius: 999px`, `4px solid #000` border
- Firefox: `scrollbar-width: auto; scrollbar-color: #ffeb3b #000`
- Force `overflow-y: scroll !important`

Also change `overflow-y-auto` to `overflow-y-scroll` on the drawer container in the component.

## 2. Always-Visible "Scroll Up" Button (`src/components/LandingDrawer.tsx`)

Currently the floating arrow only shows after scrolling 300px. Changes:

- Remove the `showBackToTop` conditional -- the button is **always visible** when the drawer is open
- Make it larger and brighter: `w-12 h-12`, bright yellow `bg-[#ffeb3b]` with dark arrow icon
- Position: bottom-right of the drawer, always rendered (no AnimatePresence toggle)

## 3. "Back to Top" Hint at the Fold (`src/components/LandingDrawer.tsx`)

Add a new element **at the very bottom of the scrollable content** (after the "Scroll to explore" button and data note):

- Text: "Back to top" with an up-arrow icon
- Pulsing/breathing animation so it catches the eye
- Always visible on first load; fades after user scrolls up past a threshold (optional, but present by default)

---

## Files Modified

| File | What changes |
|---|---|
| `src/index.css` | Replace `.scrollbar-visible` block with chunky yellow scrollbar styles, moved outside `@layer utilities` |
| `src/components/LandingDrawer.tsx` | (a) Change `overflow-y-auto` to `overflow-y-scroll`; (b) Make arrow button always visible, larger, yellow; (c) Add "Back to top" hint text at bottom of scroll content |

## Technical Details

### `src/index.css`
- Remove the `.scrollbar-visible` block from inside `@layer utilities` (lines ~108-128)
- Add a new block **after** the `@layer utilities` closing brace with the exact CSS the user specified (20px wide, yellow thumb, black track, forced scroll)

### `src/components/LandingDrawer.tsx`
- **Line 226**: Change `overflow-y-auto` to `overflow-y-scroll`
- **Lines 70, 76-80**: Remove `showBackToTop` state and `handleScroll2` callback (no longer needed for conditional display)
- **Lines 391-405**: Replace the conditional `AnimatePresence` block with an always-visible `motion.button` -- larger (`w-12 h-12`), yellow background (`bg-[#ffeb3b] text-black`), with a chunky `ArrowUp` icon
- **After line 388** (after the "Scroll to explore" button): Add a new `motion.div` with text "Back to top" and an ArrowUp icon, with a pulsing opacity animation, that calls `scrollToTop` on click
