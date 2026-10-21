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
3. Add the entry to `CITY_PHOTOS` and remove the slug from `UNVERIFIED_DESTINATIONS`. The alt text is also used for `og:image:alt` and `twitter:image:alt`.
4. Run `npx vitest run`, and `npx tsx scripts/check-city-image-urls.ts` to confirm the CDN returns 200.

## Where the photo appears

- Destination page hero and living guide hero (`/guides/living-in-<slug>`), each with the Unsplash credit.
  Living guides for cities without a verified photo show the neutral image with a `City, Country` alt.
- `og:image`, `og:image:alt`, `twitter:image` and `twitter:image:alt`, both in the browser (react-helmet-async)
  and in the prerendered HTML from `scripts/generate-seo-pages.ts`, so link previews without JavaScript get the photo.
- The defaults in `index.html` carry `data-rh="true"`, so page tags replace them instead of being added after them.
  After `npm run build`, `npm run check:meta` checks every page in `dist` has exactly one of each tag
  and the expected photo on guide and destination pages.
- City ids that differ from the destination slug (for example `ho-chi-minh-vn` and `ho-chi-minh-city`)
  are mapped in `CITY_ID_ALIASES` in `src/data/cityImages.ts`.
