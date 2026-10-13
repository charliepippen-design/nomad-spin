/** HEAD every curated city image URL. Exits 1 if any is not 200.  Usage: npx tsx scripts/check-city-image-urls.ts */
import { CITY_PHOTOS, getCityImageUrl } from '../src/data/cityImages';

let failed = 0;
for (const slug of Object.keys(CITY_PHOTOS)) {
  const url = getCityImageUrl(slug, undefined, 1200);
  const res = await fetch(url, { method: 'HEAD' });
  console.log(`${res.status} ${slug}`);
  if (res.status !== 200) failed++;
}
process.exit(failed ? 1 : 0);
