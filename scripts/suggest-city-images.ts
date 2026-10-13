/**
 * Suggest Unsplash photo candidates for published destinations that have no verified photo.
 *
 *   UNSPLASH_ACCESS_KEY=... npx tsx scripts/suggest-city-images.ts [slug ...]
 *
 * Writes scripts/out/city-image-candidates.json for manual review. Never edits code or the DB.
 * Without a key it writes manual search URLs instead and exits 0.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CITY_PHOTOS, PUBLISHED_DESTINATIONS } from '../src/data/cityImages';
import { findCityBySlug } from '../src/lib/citySlug';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out', 'city-image-candidates.json');

interface UnsplashResult {
  urls: { raw: string };
  links: { html: string };
  user: { name: string; links: { html: string } };
  location?: { name?: string | null };
  description?: string | null;
  alt_description?: string | null;
  tags?: { title: string }[];
}

function photoId(raw: string): string {
  return raw.match(/photo-([0-9]+-[0-9a-f]+)/)?.[1] ?? '';
}

async function main() {
  const args = process.argv.slice(2);
  const slugs = args.length ? args : PUBLISHED_DESTINATIONS.filter((s) => !(s in CITY_PHOTOS));
  const key = process.env.UNSPLASH_ACCESS_KEY;
  const out: Record<string, unknown> = {};

  for (const slug of slugs) {
    const city = findCityBySlug(slug)?.city;
    const name = city?.name ?? slug.replace(/-/g, ' ');
    const country = city?.country ?? '';
    const searchUrl = `https://unsplash.com/s/photos/${slug}-${country.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (!key) {
      out[slug] = { city: name, country, manualSearchUrl: searchUrl };
      continue;
    }
    const q = encodeURIComponent(`${name}, ${country} skyline`);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${q}&per_page=10&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` } },
    );
    if (!res.ok) {
      out[slug] = { city: name, country, manualSearchUrl: searchUrl, error: `HTTP ${res.status}` };
      continue;
    }
    const json = (await res.json()) as { results: UnsplashResult[] };
    const needle = name.toLowerCase();
    out[slug] = {
      city: name,
      country,
      manualSearchUrl: searchUrl,
      candidates: json.results.map((r) => {
        const location = r.location?.name ?? null;
        return {
          id: photoId(r.urls.raw),
          pageUrl: r.links.html,
          photographer: r.user.name,
          photographerUrl: r.user.links.html,
          location,
          description: r.description ?? null,
          altDescription: r.alt_description ?? null,
          tags: (r.tags ?? []).map((t) => t.title),
          locationMatches: [location, r.description].some((t) => t?.toLowerCase().includes(needle)),
        };
      }),
    };
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`Wrote ${OUT}${key ? '' : ' (no UNSPLASH_ACCESS_KEY: manual search URLs only)'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
