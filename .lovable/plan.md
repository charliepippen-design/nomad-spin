

## Fix Mexico City Image and Add Smooth Page Navigation

Two issues to address:

---

### Issue 1: Mexico City Image Still Broken

Both the original and replacement Unsplash photo IDs for Mexico City return 404 errors -- these photos have been removed from Unsplash.

**Fix:** Replace with a verified working photo ID: `1547995886-6dc09384c6e6` (a Mexican city aerial shot confirmed to load).

**File:** `src/data/cityImages.ts` -- single line change on the `mexico-city` entry.

---

### Issue 2: Globe Traps Mouse Scroll (Cannot Reach Below-the-Fold Content)

**Root cause:** The Three.js `OrbitControls` component has `enableZoom={true}`, which intercepts all mouse wheel events for camera zoom. Since the globe canvas covers the full viewport (`absolute inset-0`), scrolling the page is impossible -- the wheel only zooms the 3D camera.

**Fix approach -- "Scroll Navigation Bar":**

1. **Disable zoom on OrbitControls** (`enableZoom={false}`) so the mouse wheel passes through to normal page scrolling. Users can still rotate the globe by dragging.

2. **Add a visual scroll indicator** at the bottom of the hero section -- a subtle animated chevron or "Scroll to explore" prompt that hints there is content below. Clicking it smooth-scrolls to the Featured Destinations section.

3. **Wrap the page in a proper scroll container** -- the current layout uses `absolute inset-0` for the globe and `min-h-screen` for content, but the below-fold sections (FeaturedDestinations, HowItWorks) sit outside the scrollable flow when the globe canvas blocks events. Fix: add `pointer-events-none` to the globe container (it already has z-0) so scroll events pass through, and ensure OrbitControls only captures drag (not wheel).

**Files to modify:**

| File | Change |
|------|--------|
| `src/data/cityImages.ts` | Replace Mexico City photo ID |
| `src/components/Globe.tsx` | Set `enableZoom={false}` on OrbitControls |
| `src/pages/Index.tsx` | Add a scroll-down indicator/button at the bottom of the hero area that smooth-scrolls to the "Where to Stay" section |

### Technical Details

- In `Globe.tsx` line ~398: change `enableZoom={true}` to `enableZoom={false}`
- In `Index.tsx`: add an `id="featured"` anchor to the FeaturedDestinations wrapper, and a small animated down-chevron button above it that calls `document.getElementById('featured').scrollIntoView({ behavior: 'smooth' })`
- The globe container (`absolute inset-0 z-0`) already sits behind `z-10` content; disabling zoom is sufficient for scroll passthrough since the canvas won't consume wheel events
- Globe drag-to-rotate remains fully functional via OrbitControls

