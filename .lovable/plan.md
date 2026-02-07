

## Problem

The drag-spin stops working because the bottom content area (`flex-1` div at line 248) has `pointer-events-auto` applied to the **entire container**, which stretches to fill most of the screen. This large invisible area sits on top of the canvas (z-10 vs z-0), intercepting all mouse events and preventing them from reaching the Three.js `OrbitControls`.

It works "for a few seconds" because there's a brief moment during page load/animation where the content hasn't fully rendered yet.

## Solution

Remove `pointer-events-auto` from the large flex container and instead apply it **only to the specific interactive children** (the landing buttons, spinning text, and result cards). This way, the empty space between UI elements remains transparent to mouse events, allowing drag-spin on the globe at all times.

## Technical Details

**File: `src/pages/Index.tsx`**

1. Line 248: Remove `pointer-events-auto` from the main content wrapper div -- keep it as `pointer-events-none` (inherited from parent).
2. Add `pointer-events-auto` to each individual content block inside AnimatePresence:
   - The landing `motion.div` (line 252-277)
   - The spinning `motion.div` (line 282-298)  
   - The results `motion.div` (line 303+)
   - Any other interactive elements at the bottom

This is a small, surgical CSS change -- no logic or component restructuring needed.

