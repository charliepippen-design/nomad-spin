import type { City } from '@/data/cities';
import { allCitySlugs } from '@/lib/citySlug';
import { haversineKm } from '@/lib/distance';
import { subAreaBySlug } from '@/lib/subAreaDestinations';
import { DEFAULT_LOCALE, type Locale } from '../i18n/config';
import { cityDisplayName } from '../i18n/content';
import { getT } from '../i18n/dictionary';
import { countryName } from '../i18n/format';
import { absoluteUrl } from '../i18n/paths';

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

/** Name and country of a linked city in the reader's language. The link itself keeps its English path. */
export function cityLinkLabel(link: CityLink, locale: Locale = DEFAULT_LOCALE): { name: string; country: string } {
  return {
    name: cityDisplayName(link.city, locale),
    country: countryName(link.city.countryCode, link.city.country, locale),
  };
}

/**
 * Home > Destinations > City. `pageUrl` is the page's own absolute URL,
 * already in `locale`; the two parent items are localized here.
 */
export function destinationBreadcrumbJsonLd(
  city: City,
  pageUrl: string,
  locale: Locale = DEFAULT_LOCALE,
): Record<string, unknown> {
  const t = getT(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('city.breadcrumb.home'), item: absoluteUrl('/', locale) },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('city.breadcrumb.destinations'),
        item: absoluteUrl('/destinations', locale),
      },
      { '@type': 'ListItem', position: 3, name: cityDisplayName(city, locale), item: pageUrl },
    ],
  };
}
