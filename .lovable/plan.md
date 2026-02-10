

## Fix: City Image Mapping Mismatch

### Root Cause

The city IDs in the dataset include a country-code suffix (e.g., `lisbon-pt`, `madrid-es`, `bangkok-th`, `medellin-co`), but the `CITY_PHOTOS` map in `src/data/cityImages.ts` uses bare slugs (`lisbon`, `madrid`, `bangkok`, `medellin`). The lookup `CITY_PHOTOS[slug]` never matches, so **every** city falls through to a generic region fallback -- that is why "Lisbon" shows a random European photo instead of actual Lisbon.

### Fix (single file change)

**File: `src/data/cityImages.ts`**

Update `getCityImageUrl()` to strip the country-code suffix before looking up the photo ID. This is a one-line change:

```text
// Before:
const slug = cityId.toLowerCase();

// After:
const slug = cityId.toLowerCase().replace(/-[a-z]{2}$/, '');
```

The regex `/-[a-z]{2}$/` removes the trailing `-pt`, `-es`, `-th`, etc., so `lisbon-pt` becomes `lisbon` and matches the curated map.

No other files need to change. The `ResultCard` already calls `getCityImageUrl(city.id, city.region, 800)` correctly.

### How to extend coverage later

The mapping lives in `src/data/cityImages.ts` in the `CITY_PHOTOS` object. To add a new city, just add a line:

```
'city-slug': 'unsplash-photo-id',
```

Use the bare city name as the key (no country code). The photo ID is the part after `photo-` in any Unsplash image URL (e.g., `unsplash.com/photos/abc123` uses ID `abc123`). No component logic changes are needed.

### Fallback chain (unchanged)

1. City-specific curated photo (60+ cities)
2. Region fallback (generic photo per continent)
3. Default generic travel photo

This ensures no wrong-city photo is ever shown -- unmapped cities get a neutral regional or generic image.

### Summary

| File | Action | What |
|------|--------|------|
| `src/data/cityImages.ts` | EDIT | Strip country-code suffix from city ID before lookup (1 line) |

