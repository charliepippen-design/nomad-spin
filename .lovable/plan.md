

## Improve City Name Readability and Dynamic Hero Images

### 1. City Name Readability (ResultCard.tsx)

**Current state**: The city name uses `font-light` weight with a `drop-shadow-lg` over a gradient overlay (`from-black via-black/40 to-transparent`). On bright or busy images, the thin text can still be hard to read.

**Changes to `src/components/ResultCard.tsx`**:

- **Stronger gradient overlay**: Change from `bg-gradient-to-t from-black via-black/40 to-transparent` to `bg-gradient-to-t from-black via-black/60 to-black/10` -- this ensures more consistent darkness behind the text area.
- **Bolder city name**: Change `font-light` to `font-medium` on the h2 element and add a stronger text shadow using inline style (`textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.6)'`).
- **Increase size slightly**: Change from `text-2xl md:text-3xl` to `text-2xl md:text-4xl` for better visual impact.
- **Country code contrast**: Change `text-white/60` on the country code span to `text-white/80` for better readability.
- **Sub-info text**: Bump the location/region text from `text-white/70` to `text-white/80` and from `text-[10px]` to `text-[11px]`.
- **Add a subtle frosted bar**: Add `bg-black/30 backdrop-blur-sm rounded-lg px-4 py-3` wrapper around the text content inside the absolute-positioned bottom container, creating a soft frosted bar effect that ensures readability regardless of image content.

### 2. Dynamic City Images -- Already Working, Expand Coverage

The `getCityImageUrl()` in `src/data/cityImages.ts` already maps 60+ cities to curated Unsplash CDN URLs with region fallbacks. No API key is needed. This is already functional.

**Minor enhancement to `src/data/cityImages.ts`**:
- No structural changes needed -- the system already works with curated photo IDs, region fallbacks, and a generic default.
- The existing implementation at line 81 in `ResultCard.tsx` (`getCityImageUrl(city.id, city.region, 800)`) correctly loads city-specific images.

### Summary of File Changes

| File | Action | What |
|------|--------|------|
| `src/components/ResultCard.tsx` | EDIT | Stronger gradient overlay, bolder/larger city name, text shadow, frosted bar behind text, improved contrast on sub-text |

### Technical Details

The key CSS changes on the hero section (lines 108-136 of ResultCard.tsx):
- Gradient overlay: `from-black via-black/60 to-black/10`
- City name: `font-medium` + inline `textShadow`
- Frosted bar: `bg-black/30 backdrop-blur-sm rounded-lg` wrapping the text block
- All changes maintain the existing premium glass aesthetic
- Contrast ratio will exceed WCAG AA (4.5:1) for the white-on-dark text

