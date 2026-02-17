

## Fix Mexico City Image and Improve Text Visibility

### 1. Replace Mexico City photo ID (verified working)

Replace the broken ID in `src/data/cityImages.ts` with `1547686669-9a8cb1a22d91` -- an aerial shot of Palacio de Bellas Artes, confirmed loading from Unsplash right now.

**File:** `src/data/cityImages.ts` -- line 50, single value change.

### 2. Add dark backdrop behind hero text and "Where to Stay" heading

The globe's varying surface colors (bright oceans, light landmasses) wash out the overlaid text. The fix adds a semi-transparent dark gradient backdrop behind text-heavy areas so they remain readable regardless of globe rotation.

**Changes in `src/pages/Index.tsx`:**

- Wrap the hero text block (badge, headline, subtitle) in a container with `bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-5`. This creates a subtle frosted-glass panel behind the text that ensures contrast against any globe position.
- Apply the same treatment to the "Scroll to explore" indicator.

**Changes in `src/components/FeaturedDestinations.tsx`:**

- Add `bg-black/50 backdrop-blur-sm rounded-2xl px-6 py-4` to the "Where to Stay" heading wrapper, so the section title and subtitle remain visible when the globe's bright areas are behind them.

### Technical summary

| File | Change |
|------|--------|
| `src/data/cityImages.ts` | Line 50: replace photo ID with `1547686669-9a8cb1a22d91` |
| `src/pages/Index.tsx` | Add `bg-black/40 backdrop-blur-sm rounded-2xl` container around hero text block (lines 397-412) and around scroll indicator (lines 424-442) |
| `src/components/FeaturedDestinations.tsx` | Add `bg-black/50 backdrop-blur-sm rounded-2xl` to the heading `motion.div` (line 31) |

