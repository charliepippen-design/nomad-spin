/**
 * Translation status, per language. This is the to-do list for whoever
 * translates (a person or an AI assistant): no paid service involved.
 *
 *   npx tsx scripts/i18n-status.ts            what is missing or out of date
 *   npx tsx scripts/i18n-status.ts it         one language only
 *   npx tsx scripts/i18n-status.ts it --stamp record the English version each
 *                                             translation was made from
 *
 * Workflow for new content:
 *   1. Interface text: add the key to src/locales/en/<area>.json, then the same
 *      key to src/locales/<locale>/<area>.json. The build fails on a missing key.
 *   2. A city: create content/cities/<locale>/<cityId>.json with the same number
 *      of pros / cons / legal notes as the English record, "status": "draft".
 *   3. A guide: create content/guides/<locale>/<english-slug>.md and .json
 *      (slug, title, seo, "status": "draft").
 *   4. Review, set "status": "published", run with --stamp, commit.
 * When the English source changes later, this report lists the translation as
 * out of date; it stays online until someone updates it and stamps it again.
 */
import fs from 'fs';
import { en } from '../src/locales/en';
import { DEFAULT_LOCALE, LOCALES, PUBLISHED_LOCALES, isLocale, type Locale } from '../src/i18n/config';
import { loadLocale } from '../src/i18n/dictionary';
import { cities } from '../src/data/cities';
import { guides } from '../src/data/guides';
import { citySourceHash, guideSourceHash, readCityFiles, readGuideFiles } from './locale-content';

const args = process.argv.slice(2);
const stamp = args.includes('--stamp');
const only = args.find((arg) => isLocale(arg)) as Locale | undefined;
const targets = (only ? [only] : LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)) as Locale[];

function placeholders(text: string): string {
  return [...text.matchAll(/\{(\w+)\}|<\/?(\w+)>/g)].map((m) => m[0]).sort().join(' ');
}

(async () => {
  let problems = 0;
  for (const locale of targets) {
    const published = PUBLISHED_LOCALES.includes(locale);
    console.log(`\n== ${locale} ${published ? '(published)' : '(not published)'} ==`);

    const bundle = await loadLocale(locale);
    const missing: string[] = [];
    const mismatched: string[] = [];
    let total = 0;
    for (const [ns, entries] of Object.entries(en)) {
      const translated = (bundle.dictionary as Record<string, Record<string, string> | undefined>)[ns] ?? {};
      for (const [key, source] of Object.entries(entries as Record<string, string>)) {
        total++;
        const value = translated[key];
        if (!value || !value.trim()) missing.push(`${ns}.${key}`);
        else if (placeholders(value) !== placeholders(source)) mismatched.push(`${ns}.${key}`);
      }
    }
    console.log(`interface text: ${total - missing.length}/${total} keys`);
    if (missing.length) console.log(`  missing (${missing.length}): ${missing.slice(0, 40).join(', ')}${missing.length > 40 ? ' …' : ''}`);
    if (mismatched.length) console.log(`  placeholders differ from English (${mismatched.length}): ${mismatched.join(', ')}`);
    if (published) problems += missing.length + mismatched.length;

    const cityFiles = readCityFiles(locale);
    const livePublished = cityFiles.filter((entry) => entry.data.status === 'published');
    console.log(`cities: ${livePublished.length} published, ${cityFiles.length - livePublished.length} draft, ${cities.length - cityFiles.length} not started`);
    for (const entry of cityFiles) {
      if (entry.stale) console.log(`  out of date: ${entry.id} (English changed since translation)`);
      if (stamp && (entry.stale || !entry.data.source_hash)) {
        fs.writeFileSync(entry.file, JSON.stringify({ ...entry.data, source_hash: citySourceHash(entry.city) }, null, 2) + '\n');
      }
    }

    const guideFiles = readGuideFiles(locale);
    const liveGuides = guideFiles.filter((entry) => entry.data.status === 'published');
    console.log(`guides: ${liveGuides.length} published, ${guideFiles.length - liveGuides.length} draft, ${guides.length - guideFiles.length} not started`);
    for (const entry of guideFiles) {
      if (entry.stale) console.log(`  out of date: ${entry.sourceSlug} (English changed since translation)`);
      if (stamp && (entry.stale || !entry.data.source_hash)) {
        fs.writeFileSync(entry.file, JSON.stringify({ ...entry.data, source_hash: guideSourceHash(entry.source) }, null, 2) + '\n');
      }
    }
    if (stamp) console.log('stamped: every translation now records the current English version');
  }
  if (problems) {
    console.error(`\n${problems} problem(s) in published languages.`);
    process.exit(1);
  }
})();
