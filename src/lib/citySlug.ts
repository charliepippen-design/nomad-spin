import { cities } from '../data/cities';
import type { City } from '../data/cities';
import { accentPreservingSlug, legacySlugify, slugify } from './slugify';

/**
 * Canonical /destinations/:slug for every city.
 *
 * Normally slugify(city.name). When several cities share a name
 * (e.g. Granada in Spain and Nicaragua) every city in that group gets
 * slugify(`${name} ${country}`) instead, so no URL is ambiguous.
 */
const nameGroups = new Map<string, City[]>();
for (const c of cities) {
  const base = slugify(c.name);
  const group = nameGroups.get(base) ?? [];
  if (!group.some((g) => g.id === c.id)) group.push(c);
  nameGroups.set(base, group);
}

const slugById = new Map<string, string>();
const cityBySlug = new Map<string, City>();
for (const [base, group] of nameGroups) {
  for (const c of group) {
    let slug = group.length > 1 ? slugify(`${c.name} ${c.country}`) : base;
    // Same name *and* country (shouldn't happen after de-duplication): fall back to id.
    if (cityBySlug.has(slug)) slug = slugify(c.id);
    slugById.set(c.id, slug);
    cityBySlug.set(slug, c);
  }
}

/** Legacy slugs (bare name for collided names, pre-NFD accent slugs) → first matching city. */
const legacyCityBySlug = new Map<string, City>();
for (const c of cities) {
  for (const legacy of [slugify(c.name), legacySlugify(c.name)]) {
    if (!cityBySlug.has(legacy) && !legacyCityBySlug.has(legacy)) legacyCityBySlug.set(legacy, c);
  }
}

export function citySlug(city: Pick<City, 'id' | 'name' | 'country'>): string {
  return slugById.get(city.id) ?? slugify(city.name);
}

export function cityPath(city: Pick<City, 'id' | 'name' | 'country'>): string {
  return `/destinations/${citySlug(city)}`;
}

/**
 * Resolve a URL slug to a city. `canonicalSlug` differs from the input when
 * the URL is a legacy/alias slug and the caller should redirect.
 */
export function findCityBySlug(slug: string | undefined): { city: City; canonicalSlug: string } | null {
  if (!slug) return null;
  const s = slug.toLowerCase();
  const exact = cityBySlug.get(s);
  if (exact) return { city: exact, canonicalSlug: s };
  const legacy = legacyCityBySlug.get(s);
  if (legacy) return { city: legacy, canonicalSlug: citySlug(legacy) };
  return null;
}

/** Every city exactly once, with its canonical slug (for sitemap / prerender). */
export function allCitySlugs(): { city: City; slug: string }[] {
  return [...cityBySlug.entries()].map(([slug, city]) => ({ city, slug }));
}

function comparePath(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function containsNonAscii(value: string): boolean {
  for (const char of value) {
    if (char.charCodeAt(0) > 127) return true;
  }
  return false;
}

export type LegacySlugRedirect = {
  legacySlug: string;
  canonicalSlug: string;
};

/**
 * Slugs the destination page sends to a different URL with `<Navigate>`.
 * Pre-NFD accent slugs ("medell-n" -> "medellin") and bare names when
 * several cities share a name ("granada" -> "granada-nicaragua").
 * Keys are ASCII: legacySlugify drops non [a-z0-9], so a percent-encoded
 * copy of the path is the same string as the raw path.
 */
export function legacySlugRedirects(): LegacySlugRedirect[] {
  const rows: LegacySlugRedirect[] = [];
  for (const legacySlug of legacyCityBySlug.keys()) {
    const resolved = findCityBySlug(legacySlug);
    if (!resolved || resolved.canonicalSlug === legacySlug) continue;
    rows.push({ legacySlug, canonicalSlug: resolved.canonicalSlug });
  }
  rows.sort((a, b) => comparePath(a.legacySlug, b.legacySlug));
  return rows;
}

export type AccentSlugRedirect = {
  /** Raw accented slug, e.g. "medellín" or "são-paulo". */
  slug: string;
  canonicalSlug: string;
};

/**
 * City-name paths that still contain a non-ASCII letter.
 * `<Navigate>` does not match these (findCityBySlug returns null).
 * They are listed so server redirects can send both the raw spelling
 * and its percent-encoded form at the canonical ASCII slug.
 * Collided names (Mérida) follow the same first-city rule as the legacy map.
 */
export function accentSlugRedirects(): AccentSlugRedirect[] {
  const rows: AccentSlugRedirect[] = [];
  const seen = new Set<string>();
  for (const city of cities) {
    const slug = accentPreservingSlug(city.name);
    if (seen.has(slug) || !containsNonAscii(slug)) continue;
    seen.add(slug);
    const resolved = findCityBySlug(slugify(city.name));
    if (!resolved || resolved.canonicalSlug === slug) continue;
    rows.push({ slug, canonicalSlug: resolved.canonicalSlug });
  }
  rows.sort((a, b) => comparePath(a.slug, b.slug));
  return rows;
}

export type ServerSlugRedirect = {
  source: string;
  destination: string;
};

/** vercel.json redirect paths: legacy map, plus raw and percent-encoded accent slugs. */
export function serverSlugRedirects(): ServerSlugRedirect[] {
  const rules: ServerSlugRedirect[] = [];
  const seen = new Set<string>();

  const add = (slug: string, canonicalSlug: string) => {
    const destination = `/destinations/${canonicalSlug}`;
    const sources = [`/destinations/${slug}`];
    const encoded = `/destinations/${encodeURIComponent(slug)}`;
    if (encoded !== sources[0]) sources.push(encoded);
    for (const source of sources) {
      if (seen.has(source) || source === destination) continue;
      seen.add(source);
      rules.push({ source, destination });
    }
  };

  for (const row of legacySlugRedirects()) add(row.legacySlug, row.canonicalSlug);
  for (const row of accentSlugRedirects()) add(row.slug, row.canonicalSlug);
  rules.sort((a, b) => comparePath(a.source, b.source));
  return rules;
}
