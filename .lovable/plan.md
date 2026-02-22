

# Fix: Render Two Thumbs in Slider Component

## Problem
The `Slider` component (`src/components/ui/slider.tsx`) hardcodes a single `<SliderPrimitive.Thumb>`. Radix UI requires one `<Thumb>` element per handle -- it does NOT auto-generate them from the `value` array.

## Fix

### `src/components/ui/slider.tsx`
Add a second `<SliderPrimitive.Thumb>` element inside the slider. Both thumbs use the same styling. When the slider receives a single-value array, only the first thumb is interactive (Radix handles this gracefully). When it receives a two-value array, both thumbs appear and work as a range.

The fix is simply duplicating line 18 (the `<SliderPrimitive.Thumb>` element) so there are two thumb elements rendered.

### Files modified
- `src/components/ui/slider.tsx` -- add second Thumb element

