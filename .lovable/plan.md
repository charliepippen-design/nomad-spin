

## Fix: "Current Location" Search Must Query All 600+ Cities

### Root Cause

The "Current Location" dropdown in PreferencesModal.tsx searches against the `origins` array, which contains only **25 hand-picked cities**. Da Nang and hundreds of other cities exist in the full `cities` array (600+ entries) but are invisible to the search because it never queries that array.

This is NOT a CSV loading issue -- all data loads correctly. The bug is that the search input is wired to the wrong dataset.

### The Fix

**File: `src/components/PreferencesModal.tsx`**

1. Import the full `cities` array from `src/data/cities`
2. Build a combined searchable list that merges the 25 curated origins with all 600+ cities (deduped by ID)
3. When a user searches, filter against this combined list (case-insensitive match on name and country)
4. When a city from the full dataset is selected (not in origins), dynamically create an `Origin` object from it using its `name`, `country`, `lat`, `lng`
5. No `.slice()` or result limit -- show all matches
6. Add `console.info` logging the total searchable city count at component mount

**File: `src/components/OriginSelector.tsx`**

Same fix: import the full `cities` array and merge with origins for the header dropdown search.

**File: `src/data/origins.ts`** (optional helper)

Add a utility function `cityToOrigin(city)` that converts a City object to an Origin object, so both components can use it consistently.

### Technical Details

The combined search list will be:

```text
// Pseudocode
const allSearchable = [
  ...origins,                          // 25 curated origins (includes "ANYWHERE")
  ...cities                             // 600+ cities
    .filter(c => !origins.some(o => o.id === c.id))  // dedupe
    .map(c => ({ id: c.id, name: c.name, country: c.country, lat: c.lat, lng: c.lng }))
];
```

This is computed once (memoized) and filtered on each keystroke. The search matches case-insensitively against both `name` and `country` fields.

When a user selects Da Nang from the list, it creates:
```text
{ id: 'da-nang-vn', name: 'Da Nang', country: 'Vietnam', lat: 16.0544, lng: 108.2022 }
```

This Origin object works identically with the existing scoring/distance logic.

### What Does NOT Change

- The `cities` data loading (already correct, all 600+ cities load)
- The scoring engine (`src/lib/scoring.ts`)
- The spin store logic
- The `origins.ts` base list (kept for quick access / geolocation snapping)

### Files Changed

| File | Change |
|------|--------|
| `src/components/PreferencesModal.tsx` | Import `cities`, build merged searchable list, update `filteredOrigins` to query all cities |
| `src/components/OriginSelector.tsx` | Same: import `cities`, merge with origins for header search |
| `src/data/origins.ts` | Add `cityToOrigin()` helper function |

### Verification

After this fix:
- Searching "Da Nang" in Current Location will show the result
- Searching any of the 600+ cities will work
- Console will log: `[NomadSpin] Searchable origins: 625 cities` (or similar count)
- Selected cities work correctly with distance scoring and flight link generation
