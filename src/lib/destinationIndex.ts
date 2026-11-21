import type { City } from '@/data/cities';
import { allCitySlugs } from '@/lib/citySlug';
import type { Locale } from '../i18n/config';
import { cityDisplayName } from '../i18n/content';
import { getT } from '../i18n/dictionary';
import { countryName } from '../i18n/format';

export interface DestinationIndexRow {
  city: City;
  slug: string;
}

export interface DestinationIndexGroup {
  region: City['region'];
  cities: DestinationIndexRow[];
}

const REGION_ORDER = ['Europe', 'Asia', 'North America', 'LATAM', 'Africa', 'Oceania'] as const;

type ListedRegion = (typeof REGION_ORDER)[number];
type UnlistedRegion = Exclude<City['region'], ListedRegion>;

/** Compile-time check: every city region is listed in REGION_ORDER. */
const regionOrderCoversAll: UnlistedRegion extends never ? true : never = true;
void regionOrderCoversAll;

/** Region heading. English is the dataset's own label; other languages use `data.region.*`. */
export function regionLabel(region: City['region'], locale: Locale = 'en'): string {
  if (locale !== 'en') return getT(locale).dyn(`data.region.${region}`, region);
  switch (region) {
    case 'Europe':
    case 'Asia':
    case 'North America':
    case 'LATAM':
    case 'Africa':
    case 'Oceania':
      return region;
    default: {
      const exhaustive: never = region;
      return exhaustive;
    }
  }
}

/**
 * Cities grouped by region, A to Z. In another language the search also matches
 * the translated city, country and region names, and the order follows the
 * translated city name. The rows always carry the English city record.
 */
export function citiesByRegion(query = '', locale: Locale = 'en'): DestinationIndexGroup[] {
  const q = query.trim().toLowerCase();
  const translated = locale !== 'en';
  const rows = allCitySlugs().filter(({ city }) => {
    if (!q) return true;
    return (
      city.name.toLowerCase().includes(q) ||
      city.country.toLowerCase().includes(q) ||
      city.region.toLowerCase().includes(q) ||
      (translated &&
        (cityDisplayName(city, locale).toLowerCase().includes(q) ||
          countryName(city.countryCode, city.country, locale).toLowerCase().includes(q) ||
          regionLabel(city.region, locale).toLowerCase().includes(q)))
    );
  });
  if (translated) {
    rows.sort(
      (a, b) =>
        cityDisplayName(a.city, locale).localeCompare(cityDisplayName(b.city, locale), locale) ||
        countryName(a.city.countryCode, a.city.country, locale).localeCompare(
          countryName(b.city.countryCode, b.city.country, locale),
          locale,
        ),
    );
  } else {
    rows.sort(
      (a, b) => a.city.name.localeCompare(b.city.name) || a.city.country.localeCompare(b.city.country),
    );
  }

  return REGION_ORDER.map((region) => ({
    region,
    cities: rows.filter((row) => row.city.region === region),
  })).filter((group) => group.cities.length > 0);
}
