/**
 * Post-build check over dist: every prerendered page has exactly one og:image, og:image:alt,
 * twitter:image, twitter:image:alt (and title/description/canonical tags), and guide and
 * destination pages carry their city photo. Run after `npm run build`:
 *   npx tsx scripts/check-dist-meta.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { guides } from '../src/data/guides';
import { allCitySlugs } from '../src/lib/citySlug';
import { headProblems } from '../src/lib/prerenderHead';
import { citySocialImage, guideSocialImage, type SocialImage } from '../src/lib/socialImage';

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');

function htmlFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

const expected = new Map<string, SocialImage>();
for (const guide of guides) expected.set(`guides/${guide.slug}/index.html`, guideSocialImage(guide.slug));
for (const { city, slug } of allCitySlugs()) expected.set(`destinations/${slug}/index.html`, citySocialImage(city.id));

const failures: string[] = [];
let pages = 0;
let photoPages = 0;
for (const file of htmlFiles(distDir)) {
  const rel = path.relative(distDir, file).split(path.sep).join('/');
  // The static 404 document is not an app shell and has no social tags.
  if (rel === '404.html') continue;
  pages++;
  const want = expected.get(rel);
  if (want?.url.includes('images.unsplash.com')) photoPages++;
  for (const problem of headProblems(fs.readFileSync(file, 'utf8'), want)) failures.push(`${rel}: ${problem}`);
}

for (const rel of expected.keys()) {
  if (!fs.existsSync(path.join(distDir, rel))) failures.push(`${rel}: missing from dist`);
}

if (failures.length) {
  console.error(`❌ ${failures.length} meta tag problem(s):\n${failures.slice(0, 50).join('\n')}`);
  process.exit(1);
}
console.log(`✅ ${pages} prerendered pages have one og:image, og:image:alt, twitter:image, twitter:image:alt; ${photoPages} carry a city photo.`);
