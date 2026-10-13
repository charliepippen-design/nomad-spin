/**
 * City images come only from verified Unsplash photo IDs listed here.
 * Every entry was checked by hand: the Unsplash page names the city and the photo
 * shows a recognisable landmark. See docs/city-images.md for the checklist.
 * No API key, no database, no edge function.
 */

export interface CityPhoto {
  id: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  /** Unsplash photo page */
  unsplashUrl: string;
}

export const PUBLISHED_DESTINATIONS: string[] = [
  'bali', 'bangkok', 'barcelona', 'budapest', 'buenos-aires', 'cape-town',
  'chiang-mai', 'da-nang', 'ho-chi-minh-city', 'hoi-an', 'kuala-lumpur', 'lisbon',
  'madrid', 'medellin', 'mexico-city', 'porto', 'prague', 'split', 'tallinn',
  'tbilisi', 'tirana', 'valencia',
];

export const NEUTRAL_IMAGE = '/images/city-neutral.svg';

export const CITY_PHOTOS: Record<string, CityPhoto> = {
  lisbon: {
    id: '1754151630904-da4334bddfbf',
    alt: 'Lisbon, Portugal: yellow 28E tram on a city street',
    photographer: 'Paul Keiffer',
    photographerUrl: 'https://unsplash.com/@daisymupp',
    unsplashUrl: 'https://unsplash.com/photos/Am61s2Rya2Y',
  },
  porto: {
    id: '1709978337276-d0474ed6064f',
    alt: 'Porto, Portugal: Ribeira waterfront on the Douro River from above',
    photographer: 'Paulo De Jesus',
    photographerUrl: 'https://unsplash.com/@tuit',
    unsplashUrl: 'https://unsplash.com/photos/JB3p-ujvCuk',
  },
  split: {
    id: '1759764399318-c50fb28c3ce5',
    alt: 'Split, Croatia: harbour and waterfront with mountains behind',
    photographer: 'Ian Mackey',
    photographerUrl: 'https://unsplash.com/@ianmackey',
    unsplashUrl: 'https://unsplash.com/photos/MScg-GJ-LBs',
  },
  'kuala-lumpur': {
    id: '1576506730652-f0e4ad14828f',
    alt: 'Kuala Lumpur, Malaysia: Petronas Twin Towers lit up at night',
    photographer: 'Kevin Olson',
    photographerUrl: 'https://unsplash.com/@kev01218',
    unsplashUrl: 'https://unsplash.com/photos/WD9oyVCqHho',
  },
  tirana: {
    id: '1742500481926-f61a4be9abfe',
    alt: 'Tirana, Albania: Skanderbeg Square with the Skanderbeg statue',
    photographer: 'Adventure Albania',
    photographerUrl: 'https://unsplash.com/@adventurealbania',
    unsplashUrl: 'https://unsplash.com/photos/h8T7LOBJn94',
  },
};

// Published destinations with no verified photo yet. They show the neutral image
// until a verified photo is added to CITY_PHOTOS (see docs/city-images.md).
export const UNVERIFIED_DESTINATIONS: string[] = [
  'bali', 'bangkok', 'barcelona', 'budapest', 'buenos-aires', 'cape-town',
  'chiang-mai', 'da-nang', 'ho-chi-minh-city', 'hoi-an', 'madrid', 'medellin',
  'mexico-city', 'prague', 'tallinn', 'tbilisi', 'valencia',
];

function normaliseSlug(cityId: string): string {
  const lower = cityId.toLowerCase();
  // Exact match first so slugs like "hoi-an" are not mistaken for a country suffix.
  if (lower in CITY_PHOTOS) return lower;
  return lower.replace(/-[a-z]{2}$/, '');
}

export function getCityPhoto(cityId: string): CityPhoto | null {
  return CITY_PHOTOS[normaliseSlug(cityId)] ?? null;
}

export function isCurated(cityId: string): boolean {
  return getCityPhoto(cityId) !== null;
}

/** Curated CDN URL for a verified photo, otherwise the local neutral image. Region is ignored. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getCityImageUrl(cityId: string, _region?: string, width = 800): string {
  const photo = getCityPhoto(cityId);
  if (!photo) return NEUTRAL_IMAGE;
  return `https://images.unsplash.com/photo-${photo.id}?w=${width}&h=${Math.round(width * 0.56)}&fit=crop&auto=format&q=80`;
}

export function getCityThumbnailUrl(cityId: string, region?: string): string {
  return getCityImageUrl(cityId, region, 400);
}

export function getCityImageAlt(cityName: string, country: string, cityId: string): string {
  return getCityPhoto(cityId)?.alt ?? `${cityName}, ${country}`;
}
