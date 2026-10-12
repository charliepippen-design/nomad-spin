# City images

Production shows city photos only from verified Unsplash IDs in `src/data/cityImages.ts` (`CITY_PHOTOS`).
Cities without one show `/images/city-neutral.svg` and no credit. Production does not call the Unsplash API,
`city_image_cache` or the `city-image` edge function.

## Adding a photo

1. Find candidates: `UNSPLASH_ACCESS_KEY=... npx tsx scripts/suggest-city-images.ts [slug ...]`
   writes `scripts/out/city-image-candidates.json` (gitignored). Without a key it lists manual search URLs.
   The script never edits code or the database.
2. Verify each candidate by hand:
   - the Unsplash page location names the city
   - the photo shows a recognisable landmark of that city
   - record the photo ID, photographer name and profile URL
   - alt text is `City, Country: what it shows`
3. Add the entry to `CITY_PHOTOS` and remove the slug from `UNVERIFIED_DESTINATIONS`.
4. Run `npx vitest run`, and `npx tsx scripts/check-city-image-urls.ts` to confirm the CDN returns 200.
