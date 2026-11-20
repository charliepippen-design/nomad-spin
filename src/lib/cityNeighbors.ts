import type { City } from '@/data/cities';
import { allCitySlugs } from '@/lib/citySlug';
import { haversineKm } from '@/lib/distance';
import { subAreaBySlug } from '@/lib/subAreaDestinations';

/**
 * Internal links between city pages, built only from the dataset:
 * straight-line distance from stored coordinates, and shared country.
 * Sub-area pages (noindex) are never link targets.
 */

export interface CityLink {
  city: City;
  slug: string;
  /** Straight-line distance, rounded to 10 km. */
  km: number;
}

const BASE_URL = 'https://www.digitalnomadspin.com';

let cache: { city: City; slug: string }[] | null = null;
function linkable(): { city: City; slug: string }[] {
  cache ??= allCitySlugs().filter(({ slug }) => !subAreaBySlug(slug));
  return cache;
}

function withDistance(from: City): CityLink[] {
  return linkable()
    .filter(({ city }) => city.id !== from.id)
    .map(({ city, slug }) => ({
      city,
      slug,
      km: Math.max(10, Math.round(haversineKm(from.lat, from.lng, city.lat, city.lng) / 10) * 10),
    }))
    .sort((a, b) => a.km - b.km || a.city.name.localeCompare(b.city.name));
}

/** Closest cities in another country first is not the goal: simply the nearest ones. */
export function nearbyCities(from: City, limit = 6): CityLink[] {
  return withDistance(from).slice(0, limit);
}

/** Other cities in the same country, nearest first, skipping any already listed as nearby. */
export function sameCountryCities(from: City, limit = 8, exclude: readonly CityLink[] = []): CityLink[] {
  const skip = new Set(exclude.map((link) => link.city.id));
  return withDistance(from)
    .filter(({ city }) => city.countryCode === from.countryCode && !skip.has(city.id))
    .slice(0, limit);
}

/** Home > Destinations > City. */
export function destinationBreadcrumbJsonLd(city: City, pageUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${BASE_URL}/destinations` },
      { '@type': 'ListItem', position: 3, name: city.name, item: pageUrl },
    ],
  };
}
