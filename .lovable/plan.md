

## Dynamic City Images: Auto-Fetch and Cache System

### Problem
Only ~60 of the 600+ cities have curated Unsplash photos. All others fall back to a generic regional image, which means most cities show an irrelevant photo.

### Solution Architecture

Build a three-tier image resolution system:

1. **Tier 1 -- Curated** (instant, ~60 cities): Existing `CITY_PHOTOS` map in `src/data/cityImages.ts`
2. **Tier 2 -- Cached** (instant after first fetch): Photo IDs stored in a `city_image_cache` database table
3. **Tier 3 -- Live fetch** (one-time per city): Backend function calls Unsplash API, caches the result, returns URL
4. **Tier 4 -- Fallback** (always safe): Region-based generic photo, never another city's photo

### Implementation Steps

#### Step 1: Database Table

Create `city_image_cache` table:
- `slug` (text, primary key) -- e.g. `lisbon`, `medellin`
- `photo_id` (text, not null) -- Unsplash photo ID
- `city_name` (text) -- original city name for reference
- `country` (text) -- country for reference
- `fetched_at` (timestamptz, default now())
- RLS: public read access (no auth needed for images), no public write

#### Step 2: Unsplash API Key

You will need a free Unsplash API key (get one at unsplash.com/developers). It will be stored as a secret called `UNSPLASH_ACCESS_KEY`.

#### Step 3: Backend Function (`city-image`)

A backend function that:
1. Receives `slug`, `cityName`, `country`, `region`
2. Checks `city_image_cache` for existing entry -- if found, returns it
3. If not cached, calls Unsplash search API: `GET /search/photos?query={cityName} {country} cityscape&per_page=1&orientation=landscape`
4. Stores the photo ID in `city_image_cache`
5. Returns the photo URL
6. If Unsplash fails, returns the region fallback -- never a wrong city

#### Step 4: Client-Side Hook (`useCityImage`)

A React hook that:
1. First renders using the synchronous `getCityImageUrl()` (curated or fallback -- instant, no flash)
2. If the city is NOT in the curated `CITY_PHOTOS`, fires a request to the backend function
3. When the response arrives, swaps in the city-specific photo with a fade transition
4. On subsequent visits, the cached photo loads instantly from the database

#### Step 5: Update ResultCard

Replace the direct `getCityImageUrl()` call with the `useCityImage` hook, so photos resolve dynamically.

### File Changes

| File | Action | What |
|------|--------|------|
| Migration SQL | CREATE | `city_image_cache` table with public read RLS |
| `supabase/functions/city-image/index.ts` | CREATE | Backend function: check cache, fetch Unsplash, store, return |
| `src/hooks/useCityImage.ts` | CREATE | Hook that resolves image: curated, then cached/fetched |
| `src/data/cityImages.ts` | EDIT | Export `CITY_PHOTOS` and `REGION_FALLBACKS` so the hook can check membership |
| `src/components/ResultCard.tsx` | EDIT | Use `useCityImage` hook instead of direct `getCityImageUrl` |

### How to Extend Coverage

To add a curated photo for any city, just add one line to `CITY_PHOTOS` in `src/data/cityImages.ts`:

```
'city-slug': 'unsplash-photo-id',
```

Curated entries always take priority over auto-fetched ones. The auto-fetch system handles everything else automatically.

### Technical Notes

- The Unsplash free tier allows 50 requests/hour -- more than enough since each city is fetched only once and then cached permanently
- The slug derivation (strip `-xx` country code suffix) remains unchanged
- No city will ever show another city's photo: the fallback chain is curated -> cached -> region-generic -> default-generic
- The image swap uses a CSS fade so there is no visual flash

