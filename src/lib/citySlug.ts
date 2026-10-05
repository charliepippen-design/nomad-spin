import { cities } from '../data/cities';
import type { City } from '../data/cities';
import { slugify, legacySlugify } from './slugify';

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
