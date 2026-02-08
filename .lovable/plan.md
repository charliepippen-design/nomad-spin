

## Make It Rich: City Images, Smart Badges, CTA Buttons, and Visual Polish

### Overview

Four upgrades to transform the result cards from data-heavy to visually premium: hero city images, smart contextual badges, a prominent "Check Stays" CTA, and polished card styling. Plus fixing the last remaining military jargon in the affiliate engine labels.

---

### 1. City Hero Images (No API Key Needed)

Instead of requiring an Unsplash API key, we use **Unsplash Source URLs** which work without authentication:

```text
https://images.unsplash.com/photo-{id}?w=800&q=80
```

Since we can't search dynamically without an API key, we take a hybrid approach:

- Create a **curated image map** (`src/data/cityImages.ts`) with hand-picked Unsplash photo IDs for the top 50 most popular nomad cities (Bangkok, Lisbon, Bali, Da Nang, Medellin, etc.)
- For cities NOT in the map, fall back to a **region-based default** (e.g., a generic "Southeast Asia beach" image for Asian coastal cities, a "European old town" for European cities)
- Images display as a **gradient-overlaid hero banner** at the top of ResultCard and as thumbnails on runner-up cards

This approach is:
- Free (no API key)
- Fast (direct CDN URLs)
- Reliable (no runtime API calls that can fail)
- Beautiful (hand-picked, high-quality photos)

**Files:**
- NEW: `src/data/cityImages.ts` -- curated Unsplash photo IDs + region fallbacks
- EDIT: `src/components/ResultCard.tsx` -- add hero image banner
- EDIT: `src/components/TopResultsGrid.tsx` -- add thumbnail image on runner-up cards

---

### 2. Smart Badges

Generate contextual badges from city data. Each badge has an emoji, label, and color. Displayed as a row of pills below the city name.

Badge logic (in a new helper `src/lib/badges.ts`):

| Condition | Badge |
|-----------|-------|
| `internetMbps >= 50` OR `infra.internetSpeedAvg >= 50` | "Digital God Mode" (blue) |
| `costUSD < 1200` | "Wallet Heaven" (green) |
| `vibeMetrics.englishProficiency >= 7` | "No Duolingo Needed" (purple) |
| `safety >= 8` | "Ultra Safe" (emerald) |
| `vibeMetrics.nightlife >= 7` | "Party Central" (pink) |
| `vibe includes 'beach'` | "Beach Life" (cyan) |
| `weather.tempAvgC >= 28` | "Tropical Heat" (orange) |
| `safety < 5` | "Stay Alert" (red/warning) |

Each badge renders as a small colored pill with emoji + text. Max 4 badges shown per city to avoid clutter.

**Files:**
- NEW: `src/lib/badges.ts` -- `generateBadges(city): Badge[]`
- EDIT: `src/components/ResultCard.tsx` -- render badge row replacing the plain vibe tags
- EDIT: `src/components/TopResultsGrid.tsx` -- show top 2 badges on runner-up cards

---

### 3. Prominent "Check Stays" CTA Button

Replace the current small affiliate grid with a **large, attention-grabbing primary CTA** for accommodation, plus keep the secondary links (flights, eSIM, insurance) below it.

- Button text: `Check Stays in {City Name}`
- Style: Full-width, rounded-lg, bg-gradient from emerald-500 to emerald-600, white bold text, hover glow effect, large padding
- Links to the existing Booking.com/Flatio affiliate URL from the affiliate engine
- Secondary links (flights, eSIM, insurance) remain as smaller buttons below

Also fix the remaining military jargon in `src/utils/affiliateEngine.ts`:
- "SECURE SAFE HOUSE IN..." becomes "Find Stays in..."
- "INITIATE AIRLIFT FROM..." becomes "Find Flights from..."
- "ESTABLISH COMMS IN..." becomes "Get eSIM for..."
- "ACTIVATE PROTOCOLS" becomes "Travel Insurance"

**Files:**
- EDIT: `src/utils/affiliateEngine.ts` -- rename labels
- EDIT: `src/components/ResultCard.tsx` -- add large CTA above the deployment grid
- EDIT: `src/components/DeploymentGrid.tsx` -- minor: the existing grid becomes the "secondary links" section

---

### 4. Visual Polish

Update card styling across ResultCard and TopResultsGrid:

- `rounded-sm` becomes `rounded-xl` on all cards
- Add `shadow-2xl shadow-black/50` for depth
- Hero image section gets a gradient overlay (black from bottom for text readability)
- Runner-up cards get a subtle image thumbnail strip at top
- Stat items get `rounded-lg` and slightly more padding
- Score ring background gets a subtle frosted glass effect

**Files:**
- EDIT: `src/components/ResultCard.tsx` -- rounded corners, shadows, image header
- EDIT: `src/components/TopResultsGrid.tsx` -- rounded corners, shadows, image strip

---

### Summary of All File Changes

| File | Action |
|------|--------|
| `src/data/cityImages.ts` | NEW: Curated Unsplash photo map + region fallbacks |
| `src/lib/badges.ts` | NEW: `generateBadges()` smart badge generator |
| `src/components/ResultCard.tsx` | Hero image, badge row, large CTA, rounded corners, shadows |
| `src/components/TopResultsGrid.tsx` | Image thumbnails, badges, rounded corners |
| `src/components/DeploymentGrid.tsx` | Minor style tweaks (secondary role) |
| `src/utils/affiliateEngine.ts` | Fix remaining military label text |

### Technical Notes

- No API key required for images -- all Unsplash URLs are direct CDN links from curated photo IDs
- Badge generation is pure function, no side effects, easily testable
- The large CTA uses the existing affiliate engine URL, so monetization tracking works immediately
- All images use `loading="lazy"` and appropriate `srcset` for performance
- The curated image map can be expanded over time -- cities without a specific photo get a beautiful regional default
