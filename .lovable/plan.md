
## Four Upgrades: Globe Focus, Dynamic SEO, City Images Fix, Social Sharing

---

### 1. Globe Navigation -- Focus on Selected City

**Problem**: When a spin result lands, the globe stays at whatever random rotation it stopped at. It should smoothly rotate to center the winning city in view.

**Solution**: Add a `focusCity` prop to Globe. When set, the Earth group lerps its Y-rotation to place that city's longitude facing the camera, and CameraRig lerps the camera to a closer zoom position.

**Files changed:**
- `src/components/Globe.tsx` -- Add `focusCity?: City` prop. In `Earth`, add a `useEffect` + `useFrame` that targets `lngToYRotation(focusCity.lng)` with smooth lerp. In `CameraRig`, when `focusCity` is set, lerp camera to a closer position (z=4.2 instead of 5.5) and tilt slightly based on latitude.
- `src/pages/Index.tsx` -- Pass `focusCity={resultCity}` to `<Globe>` when in results phase.

**Technical detail:**
```text
// In Earth component:
const targetRotY = lngToYRotation(focusCity.lng);
// In useFrame:
groupRef.current.rotation.y = THREE.MathUtils.lerp(
  groupRef.current.rotation.y, targetRotY, 0.04
);
```

The lerp factor of 0.04 gives a smooth ~1 second transition. Auto-spin is paused when focusCity is active.

---

### 2. Dynamic SEO with JSON-LD Schema

**Problem**: SEO tags are basic. No JSON-LD structured data for search engines.

**Solution**: Enhance the SEO component to accept a `city` prop and generate:
- Dynamic OG tags with city-specific image from Unsplash
- JSON-LD `TouristDestination` schema markup
- Canonical URL

**Files changed:**
- `src/components/SEO.tsx` -- Add optional `city?: City` prop. When present:
  - Title: `"{City}, {Country} -- Digital Nomad Guide | Nomad Spin"`
  - Description: `"Explore {City}: ${cost}/mo, {internet}Mbps WiFi, safety {safety}/10. Find stays, flights, and eSIMs."`
  - OG image: `getCityImageUrl(city.id, city.region, 1200)` for social sharing
  - Add JSON-LD script block with `TouristDestination` schema including name, description, geo coordinates, and cost info
- `src/pages/Index.tsx` -- Pass `city={resultCity}` to `<SEO>` when in results phase.

**JSON-LD structure:**
```text
{
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  "name": "Da Nang, Vietnam",
  "description": "...",
  "geo": { "@type": "GeoCoordinates", "latitude": 16.05, "longitude": 108.20 },
  "touristType": ["Digital Nomad", "Remote Worker"]
}
```

Also add a `WebApplication` schema on the landing page for the app itself.

---

### 3. City Hero Images -- Already Done, Minor Fix

The Unsplash integration is already implemented in `src/data/cityImages.ts` and used in `ResultCard.tsx`. The curated map has 60+ cities with region fallbacks. No API key needed. This is already working. No changes needed here unless you want to expand the image map (can be done later).

---

### 4. Social Sharing Buttons (Floating Bar)

**Problem**: The only share option is a single Share2 icon in the action row that uses `navigator.share`. Need visible, platform-specific sharing buttons.

**Solution**: Create a floating social share bar in the bottom-left corner that appears when results are shown.

**Files changed:**
- NEW: `src/components/SocialShareBar.tsx` -- Floating vertical bar with share buttons for:
  - **Twitter/X**: Opens `https://twitter.com/intent/tweet?text=...&url=...`
  - **WhatsApp**: Opens `https://wa.me/?text=...`
  - **Facebook**: Opens `https://www.facebook.com/sharer/sharer.php?u=...`
  - **LinkedIn**: Opens `https://www.linkedin.com/sharing/share-offsite/?url=...`
  - **Copy Link**: Copies URL to clipboard with toast confirmation
  - Each button uses a simple SVG icon or lucide icon, styled as a glass pill
  - Bar animates in from left with staggered children using framer-motion
  - Share text: "I just found my next nomad destination: {City}, {Country}! Check it out:"
  - URL: the shareable URL from `getShareableUrl()`
- `src/pages/Index.tsx` -- Render `<SocialShareBar>` when `phase === 'results'` with `resultCity` and shareable URL. Position it `fixed bottom-4 left-4 z-20`.

**Design:**
- Vertical stack of circular glass buttons (40x40px)
- `bg-white/10 backdrop-blur-md border border-white/20 rounded-full`
- Hover: scale 1.1, glow effect
- Each icon is 18x18px, white color
- The bar fades in with 0.5s delay after results appear

---

### Summary

| File | Action | What |
|------|--------|------|
| `src/components/Globe.tsx` | EDIT | Add `focusCity` prop, smooth rotation to city coordinates |
| `src/pages/Index.tsx` | EDIT | Pass `focusCity`, pass `city` to SEO, render SocialShareBar |
| `src/components/SEO.tsx` | EDIT | Add `city` prop, JSON-LD schema, dynamic OG image |
| `src/components/SocialShareBar.tsx` | NEW | Floating social share buttons (Twitter, WhatsApp, FB, LinkedIn, Copy) |

All changes sync to GitHub automatically.
