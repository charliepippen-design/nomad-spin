import type { City } from '@/data/cities';
import { allCitySlugs } from '@/lib/citySlug';

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

export function regionLabel(region: City['region']): string {
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

export function citiesByRegion(query = ''): DestinationIndexGroup[] {
  const q = query.trim().toLowerCase();
  const rows = allCitySlugs().filter(({ city }) => {
    if (!q) return true;
    return (
      city.name.toLowerCase().includes(q) ||
      city.country.toLowerCase().includes(q) ||
      city.region.toLowerCase().includes(q)
    );
  });
  rows.sort(
    (a, b) => a.city.name.localeCompare(b.city.name) || a.city.country.localeCompare(b.city.country),
  );

  return REGION_ORDER.map((region) => ({
    region,
    cities: rows.filter((row) => row.city.region === region),
  })).filter((group) => group.cities.length > 0);
}
