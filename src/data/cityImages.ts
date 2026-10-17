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
  bali: {
    id: '1557093793-d149a38a1be8',
    alt: 'Bali, Indonesia: Tegalalang rice terraces in Ubud',
    photographer: 'Radoslav Bali',
    photographerUrl: 'https://unsplash.com/@radoslavbali',
    unsplashUrl: 'https://unsplash.com/photos/rice-terraces-jN9JnZ-SyVc',
  },
  bangkok: {
    id: '1768392810963-017c92313d79',
    alt: 'Bangkok, Thailand: Wat Arun across the Chao Phraya River',
    photographer: 'Martijn Vonk',
    photographerUrl: 'https://unsplash.com/@vonkm737',
    unsplashUrl: 'https://unsplash.com/photos/7KSiPWt82us',
  },
  barcelona: {
    id: '1758471206484-0eaa2568320c',
    alt: 'Barcelona, Spain: cityscape with the Sagrada Familia at sunset',
    photographer: 'Salma Abdelnaby',
    photographerUrl: 'https://unsplash.com/@salma_abdelnaby',
    unsplashUrl: 'https://unsplash.com/photos/u5DXeHhcQUc',
  },
  budapest: {
    id: '1755465172040-971aadb0fcf3',
    alt: 'Budapest, Hungary: Parliament building on the Danube at dusk',
    photographer: 'Maria Lupan',
    photographerUrl: 'https://unsplash.com/@luandmario',
    unsplashUrl: 'https://unsplash.com/photos/hcZk8oBvVV0',
  },
  'buenos-aires': {
    id: '1755302733410-c797e958bff4',
    alt: 'Buenos Aires, Argentina: Obelisco monument and the city skyline',
    photographer: 'Guilherme Ramos',
    photographerUrl: 'https://unsplash.com/@theguilhermeramos',
    unsplashUrl: 'https://unsplash.com/photos/PIQ_gP_6VQ0',
  },
  'cape-town': {
    id: '1755251418399-c56a9579858f',
    alt: 'Cape Town, South Africa: Table Mountain over the city from Signal Hill',
    photographer: 'Asher Pardey',
    photographerUrl: 'https://unsplash.com/@asherpardey',
    unsplashUrl: 'https://unsplash.com/photos/jHgNgTtYykM',
  },
  'chiang-mai': {
    id: '1733505395987-631e64eb55b8',
    alt: 'Chiang Mai, Thailand: colourful ribbons hanging from a roof at Wat Phra That Doi Suthep',
    photographer: 'Letian Zhang',
    photographerUrl: 'https://unsplash.com/@clippit',
    unsplashUrl: 'https://unsplash.com/photos/a-row-of-colorful-ribbons-hanging-from-a-roof-HeGGB69Yglo',
  },
  'da-nang': {
    id: '1603054561323-09f79d5df183',
    alt: 'Da Nang, Vietnam: Dragon Bridge lit up at night',
    photographer: 'Sandip Roy',
    photographerUrl: 'https://unsplash.com/@sandiproy_kolkata',
    unsplashUrl: 'https://unsplash.com/photos/BXErCS6Yam8',
  },
  'ho-chi-minh-city': {
    id: '1738697587041-184841d5d23a',
    alt: 'Ho Chi Minh City, Vietnam: Landmark 81 tower',
    photographer: 'Tom Dausy',
    photographerUrl: 'https://unsplash.com/@tomdausy',
    unsplashUrl: 'https://unsplash.com/photos/a-very-tall-building-towering-over-a-city-0yjsdmgkBYE',
  },
  'hoi-an': {
    id: '1761150285834-7ab9ce6dbfd4',
    alt: 'Hoi An, Vietnam: lanterns over a narrow old town street in the evening',
    photographer: 'Juup Schram',
    photographerUrl: 'https://unsplash.com/@jsrm99',
    unsplashUrl: 'https://unsplash.com/photos/tj9LPxkFRx0',
  },
  madrid: {
    id: '1543785734-4b6e564642f8',
    alt: 'Madrid, Spain: Gran Vía with the Edificio Metropolis',
    photographer: 'Jorge Fernández Salas',
    photographerUrl: 'https://unsplash.com/@jorgefdezsalas',
    unsplashUrl: 'https://unsplash.com/photos/v8XeGZf8tcs',
  },
  medellin: {
    id: '1727813658887-abf22d586862',
    alt: 'Medellín, Colombia: sunset view of the city with mountains behind',
    photographer: 'Michael Fischer',
    photographerUrl: 'https://unsplash.com/@photo_fish',
    unsplashUrl: 'https://unsplash.com/photos/fbQzaqvx4YY',
  },
  'mexico-city': {
    id: '1547686669-9a8cb1a22d91',
    alt: 'Mexico City, Mexico: aerial view of the Palacio de Bellas Artes dome',
    photographer: 'Carlos Aguilar',
    photographerUrl: 'https://unsplash.com/@carlosaguilar',
    unsplashUrl: 'https://unsplash.com/photos/oGRrpBX2ER4',
  },
  prague: {
    id: '1771777247272-cf7b7dc51bae',
    alt: 'Prague, Czech Republic: Charles Bridge over the Vltava',
    photographer: 'Jan Oblak',
    photographerUrl: 'https://unsplash.com/@joblak01',
    unsplashUrl: 'https://unsplash.com/photos/tTFKtqlzULI',
  },
  tallinn: {
    id: '1742409657355-4a6138f02d94',
    alt: 'Tallinn, Estonia: historic skyline with towers and churches',
    photographer: 'Maria Bobrova',
    photographerUrl: 'https://unsplash.com/@yamiable',
    unsplashUrl: 'https://unsplash.com/photos/pEFRGvCmfoY',
  },
  tbilisi: {
    id: '1707833634547-cb94dfa3b7d9',
    alt: 'Tbilisi, Georgia: night view of the old town with the castle on the hill',
    photographer: 'Viktor SOLOMONIK',
    photographerUrl: 'https://unsplash.com/@solomonikvik',
    unsplashUrl: 'https://unsplash.com/photos/UXC2Mez8rrE',
  },
  valencia: {
    id: '1577990432593-6bf35f43beed',
    alt: 'Valencia, Spain: City of Arts and Sciences under a blue and white sky',
    photographer: 'Diego Olguin',
    photographerUrl: 'https://unsplash.com/@dieshock',
    unsplashUrl: 'https://unsplash.com/photos/jKywkUgB4X4',
  },
};

// Published destinations with no verified photo yet. They show the neutral image
// until a verified photo is added to CITY_PHOTOS (see docs/city-images.md).
export const UNVERIFIED_DESTINATIONS: string[] = [];

// City ids whose name part differs from the destination slug used as the CITY_PHOTOS key.
const CITY_ID_ALIASES: Record<string, string> = {
  'ho-chi-minh': 'ho-chi-minh-city',
};

function normaliseSlug(cityId: string): string {
  const lower = cityId.toLowerCase();
  // Exact match first so slugs like "hoi-an" are not mistaken for a country suffix.
  if (lower in CITY_PHOTOS) return lower;
  const stripped = lower.replace(/-[a-z]{2}$/, '');
  return CITY_ID_ALIASES[stripped] ?? stripped;
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
