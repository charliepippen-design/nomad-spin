

## Phase 5: Intelligence and Visibility — "Radar and Comms"

This upgrade adds geolocation-based city snapping ("Locate Asset"), a proximity filter preset ("Short Range Ops"), and dynamic SEO via react-helmet-async.

---

### 1. "LOCATE ASSET" — Geolocation Snap to Nearest City

**File: `src/components/PreferencesModal.tsx`**

- Add a "LOCATE ME" button (Crosshair icon) inside the Extraction Point section, next to the origin dropdown trigger.
- On click, call `navigator.geolocation.getCurrentPosition`.
- Use the existing `haversineKm` function from `src/lib/distance.ts` to find the closest city in the `origins` array (not the 600-city dataset — origins are the valid base cities).
- Auto-select that origin via `setPreferences({ origin: closestOrigin })`.
- Show a brief animated text: "COORDINATES ACQUIRED: [City Name]" using a typing effect (CSS animation with `steps()`).
- On geolocation denial, show a toast: "SIGNAL LOST. MANUAL INPUT REQUIRED."
- Button styling: tactical crosshair icon, red glow on hover via `hover:text-red-500 hover:shadow-[0_0_12px_rgba(255,0,0,0.3)]`.

**Also update `src/components/OriginSelector.tsx`** (header selector):
- Add the same "Locate Me" mini-button (small Crosshair icon) so users can trigger geolocation from the header as well.

### 2. "PROXIMITY SCRAMBLE" — Short Range Ops Preset

**File: `src/components/PreferencesModal.tsx`**

- Add a 4th preset button: "SHORT RANGE" with a Crosshair/Radar icon.
- Logic:
  - If no origin is set, trigger the "Locate Me" geolocation flow first, then apply the preset.
  - If origin is set, apply filters: budget flexible (500-5000), internet > 30 Mbps, safety flexible, region = All.
  - The spin store's `filterCities` already factors in distance from origin — the proximity is naturally handled by the existing flight-cost filter.
- Update the mission summary to show "SCANNING LOCAL SECTOR (<1000KM)..." when this preset is active.
- Store a flag `isShortRange` in local component state to drive the summary text.

### 3. SEO Architecture — react-helmet-async

**Install:** `react-helmet-async`

**File: `src/components/SEO.tsx`** (new)
- Create a reusable `<SEO title="" description="" image="" />` component using `<Helmet>` from react-helmet-async.
- Sets `<title>`, `<meta name="description">`, OG tags, and Twitter card tags.
- Default image: `/og-preview.png` (already exists).

**File: `src/App.tsx`**
- Wrap the app in `<HelmetProvider>`.

**File: `src/pages/Index.tsx`**
- Import `<SEO />`.
- Landing state: title = "Digital Nomad Spin | Tactical Decision Engine", description = "Stop overthinking. Spin the globe. Find your next mission."
- Result state: When `resultCity` is set, update to "Target Acquired: [City] // Nomad Spin".

### 4. Distance Utility Consolidation

The `haversineKm` function already exists in `src/lib/distance.ts` and is exported. It is already used by the spin store for scoring. No new file needed — we will import it directly where needed (PreferencesModal, OriginSelector).

### 5. Error Handling

- Geolocation denial: toast notification with tactical language.
- Geolocation timeout: same fallback toast.
- If no origins match within reasonable distance (edge case), show "NO NEARBY ASSETS DETECTED" and keep the manual selector open.

---

### Summary of File Changes

| File | Action |
|------|--------|
| `src/components/PreferencesModal.tsx` | Add "Locate Me" button, "SHORT RANGE" preset, geolocation logic |
| `src/components/OriginSelector.tsx` | Add mini "Locate Me" button with same geolocation logic |
| `src/components/SEO.tsx` | New reusable SEO component |
| `src/App.tsx` | Wrap in `HelmetProvider` |
| `src/pages/Index.tsx` | Add dynamic `<SEO />` based on app phase |
| `package.json` | Add `react-helmet-async` dependency |

### Technical Notes

- The geolocation snap uses `haversineKm` against the `origins` array (25 cities), not the full 600-city dataset, since origins are the valid base cities for flight calculations.
- The "Short Range" preset works with existing filter logic — the spin store already penalizes destinations where estimated flight cost exceeds 60% of budget, which naturally limits results to nearby cities when origin is set.
- SEO tags update dynamically via react-helmet-async's `<Helmet>` which modifies `document.head` in-place — no SSR required.
- All new UI elements maintain the Obsidian/Tactical dark aesthetic with `bg-white/[0.03]`, `font-mono`, `tracking-wider`, and dark borders.

