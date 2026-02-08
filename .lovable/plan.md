

## Refactor: Recommendation Engine and UX Logic

### Overview

This refactor addresses four issues: data completeness verification, climate/vibe-weighted scoring, confusing preset names, and single-result display. The core changes touch the spin store (filtering + scoring), the preferences modal (presets + new climate preference), and a new Top 3 results view.

---

### 1. Data Loading Verification

Da Nang and all other cities from the three spreadsheet parts are already loaded and merged in `src/data/cities.ts` (line 646-655 merges 8 arrays). The dataset is complete. No changes needed here, but we will add a `console.info` at initialization logging the total city count so this is always verifiable.

---

### 2. Weighted Scoring Refactor ("Hamburg vs. Tamarindo" Fix)

**Problem:** The current `filterCities()` uses binary pass/fail filters. A city either matches or it doesn't. There is no penalty for climate mismatch. The `spin()` function has a basic weighting system but it doesn't factor in vibe/climate preference strongly enough.

**Solution:** Replace the binary filter + random weighted pick with a proper scoring system that always returns the top N cities by score.

**File: `src/lib/scoring.ts`** -- Add a new `scoreCityForPreferences()` function:

- Budget score (0-30 pts): Non-linear curve (existing `budgetScore` logic, normalized to 0-30)
- Internet score (0-15 pts): Linear scale based on how far above minimum
- Safety score (0-15 pts): Linear scale based on how far above minimum  
- Vibe/Climate match (0-25 pts): Each matching vibe tag = points. If user selects "beach" and city has "beach" vibe, full credit. Cities with zero vibe overlap get 0 points. This is the key fix -- Hamburg (party/workhub/adventure) gets 0 vibe points when user selects "beach", while Tamarindo (beach) gets full credit.
- Proximity score (0-15 pts): Based on distance from origin (existing logic)

Total: 0-100 points, displayed as "Match Score %"

**File: `src/store/useSpinStore.ts`** -- Refactor `spin()`:

- Instead of random weighted selection, compute scores for ALL filtered cities using `scoreCityForPreferences()`
- Sort by score descending
- Store `topResults: City[]` (top 3) instead of single `resultCity`
- Keep `resultCity` as `topResults[0]` for backward compatibility with globe animation target
- Add `matchReasons` map: for each top city, a short string like "Best for Budget", "Ideal Climate", "Closest to Base"

**File: `src/store/useSpinStore.ts`** -- Update `filterCities()`:

- Keep hard filters for region (since it's an explicit sector choice)
- Remove the flight-cost binary cutoff (let scoring handle proximity penalty instead)
- Keep budget range as a soft filter: include cities within 20% overage (they'll just score lower)

---

### 3. Preset Renaming and "Short Range" Replacement

**File: `src/components/PreferencesModal.tsx`**

Rename presets and update their logic:

| Old Name | New Name | Subtitle | Logic |
|---|---|---|---|
| BOOTSTRAPPER | BUDGET SAVER | "Cost < $1,500" | budget: [500, 1500], keep other params |
| EXECUTIVE | HIGH COMFORT | "Fast + Safe" | internet: 150, safety: 8 |
| DEEP FOCUS | QUIET / PRODUCTIVE | "Low nightlife" | vibes: ['workhub', 'mountain'] (no party) |
| SHORT RANGE | PREFERRED REGION | "Pick your sector" | Opens region selector, removes distance constraint |

For "SHORT RANGE" specifically: replace the crosshair button with a "PREFERRED REGION" preset that simply highlights the region selector section and scrolls to it, prompting the user to pick a region. This is clearer than the opaque distance-based filter.

Each preset button will show a one-line subtitle explaining what it does (e.g., "Cost < $1,500/mo").

---

### 4. Top 3 Results Grid

**New component: `src/components/TopResultsGrid.tsx`**

When the spin completes, instead of showing a single `ResultCard`, show a grid of 3 result cards:

- Primary card (rank 1): Full-size `ResultCard` as it exists today, with score ring, health bars, intel, risks, and deployment grid
- Cards 2 and 3: Compact summary cards showing:
  - City name + country
  - Match score ring (smaller)
  - Key reason tag (e.g., "BEST FOR BUDGET")
  - 3 key stats (cost, internet, safety)
  - A "VIEW FULL DOSSIER" button that swaps it into the primary slot

**File: `src/pages/Index.tsx`** -- Update results phase:

- Replace single `<ResultCard>` with `<TopResultsGrid>` component
- Pass `topResults` array + `matchReasons` from store
- Keep the existing `ResultCard` component unchanged (it renders the "primary" selection)
- The two runner-up cards are new compact components

**Layout:**
- Desktop: Primary card full width, two compact cards side by side below
- Mobile: All three stacked vertically, primary first

---

### 5. Store Changes Summary

**`src/store/useSpinStore.ts`** new state fields:

```text
topResults: City[]          // top 3 scored cities
matchReasons: Map<string, string>  // cityId -> reason string
```

New exported function: `selectResult(index: number)` -- swaps a runner-up into the primary slot.

---

### Summary of File Changes

| File | Action |
|------|--------|
| `src/lib/scoring.ts` | Add `scoreCityForPreferences()` with vibe-weighted logic |
| `src/store/useSpinStore.ts` | Refactor `spin()` to return top 3, add `topResults` state |
| `src/components/PreferencesModal.tsx` | Rename presets, add subtitles, replace SHORT RANGE |
| `src/components/TopResultsGrid.tsx` | New component: Top 3 comparison grid |
| `src/components/ResultCard.tsx` | Minor: accept optional `matchReason` prop |
| `src/pages/Index.tsx` | Wire up `TopResultsGrid` in results phase |
| `src/data/cities.ts` | Add city count log at init |

### Technical Notes

- The vibe-weighted scoring is the critical fix. By giving 25% of the total score to vibe match, "beach" preference will naturally push Hamburg down and Tamarindo up, even if both pass budget/internet filters.
- Backward compatibility: `resultCity` stays as the primary selection for globe targeting and analytics.
- The compact runner-up cards use the existing `ScoreRing` component extracted from `ResultCard`.
- No backend changes needed. All scoring is client-side.

