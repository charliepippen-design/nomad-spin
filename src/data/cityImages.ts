/**
 * Curated Unsplash photo IDs for top nomad cities + region fallbacks.
 * No API key needed — direct CDN URLs.
 */

// Hand-picked photo IDs for the top 60 nomad destinations
const CITY_PHOTOS: Record<string, string> = {
  // Southeast Asia
  'bangkok': '1508009603885-50cf7c579365',
  'chiang-mai': '1598935898639-81c5c0f41f54',
  'da-nang': '1559592413-7cec4d0cae2b',
  'ho-chi-minh-city': '1583417319070-4a69db38a482',
  'hanoi': '1509030449809-7e23fda007f0',
  'bali': '1537996194471-e657df975ab4',
  'kuala-lumpur': '1596422846543-75c6fc197f07',
  'bangkok-th': '1508009603885-50cf7c579365',
  'phnom-penh': '1609600225439-7f7b23e4347e',
  'singapore': '1525625293386-3f8f99389edd',
  'manila': '1573455494060-c5910929e31e',
  'phuket': '1589394815804-964ed0be2eb5',
  'canggu': '1555400038-63f5ba517a47',
  'ubud': '1537953773345-d172ccf13cf4',

  // Europe
  'lisbon': '1548707309-dcebeab9ea9b',
  'porto': '1555881400-74d7acaacd8b',
  'barcelona': '1583422409516-2895a77efded',
  'madrid': '1539037116277-4db20889f2d4',
  'berlin': '1560969184-aec3c51fdeea',
  'budapest': '1549923746-c502d488b3ea',
  'prague': '1541849546-216549ae216d',
  'tbilisi': '1565008576549-57569a49371d',
  'split': '1555990538-1b0e0729f756',
  'dubrovnik': '1555990538-7b4a6e0a00f0',
  'athens': '1555993539-1b7e1cdaf3be',
  'tallinn': '1561455590-085c97aaec5f',
  'bucharest': '1587974928442-77dc3e0748d4',
  'sofia': '1601283399158-79f460e41ab3',
  'belgrade': '1558441244-df7e2e5a1a40',
  'warsaw': '1519197924070-60859c84f01a',
  'amsterdam': '1534351590666-13e3e96b5017',
  'london': '1513635269975-59663e0ac1ad',
  'paris': '1502602898657-3e91760cbb34',
  'rome': '1552832230-c0197dd311b5',
  'vienna': '1516550893923-42d28e5677af',

  // Latin America
  'medellin': '1599057035850-4389f12c8e4f',
  'bogota': '1568372930-aa6bc8d90c04',
  'mexico-city': '1585464231875-edf2600f5e51',
  'playa-del-carmen': '1552074284-5e88ef1aef18',
  'buenos-aires': '1589909202802-8f4aadce1849',
  'lima': '1531968455986-8bf7fc7c4887',
  'santiago': '1558029137-58a71b4f2646',
  'cartagena': '1583000893-a6c1bd3d2e9f',
  'montevideo': '1584646098378-0874163ee2c7',
  'san-jose': '1600794788753-56a5baa94e48',
  'tulum': '1547003652-d3fb9300f3e2',

  // Africa & Middle East
  'cape-town': '1580060839134-75a5edca2014',
  'nairobi': '1611348524140-53c9a25263d6',
  'marrakech': '1597211684635-10c8f5e6c5f3',
  'dubai': '1512453913507-36f190fea668',
  'tel-aviv': '1544967082-d9d25d867d66',

  // East Asia
  'tokyo': '1540959733332-eab4deabeeaf',
  'seoul': '1546874177-9e664de1264a',
  'taipei': '1508354517594-2b8c37888e32',

  // Oceania
  'melbourne': '1514395462725-fb4566210144',
  'sydney': '1506973035872-a4ec16b8e8d9',
  'auckland': '1507699622108-4be3abd695ad',
};

// Region-based fallback photos for cities not in the curated map
const REGION_FALLBACKS: Record<string, string> = {
  'Asia':           '1506665131138-e866141fb205', // tropical coast
  'Europe':         '1467269204594-9661b134dd2b', // European old town
  'LATAM':          '1518105779142-d975f22f1b0a', // colorful Latin street
  'Africa':         '1547471080-7cc2caa01a7e', // African savanna
  'Oceania':        '1523482580672-f109ba8cb9be', // beach reef
  'North America':  '1480714378408-67cf0d13bc1b', // city skyline
};

const DEFAULT_FALLBACK = '1488646953014-85cb44e25828'; // generic travel

/**
 * Get a high-quality Unsplash CDN URL for a city.
 */
export function getCityImageUrl(cityId: string, region: string, width = 800): string {
  const slug = cityId.toLowerCase().replace(/-[a-z]{2}$/, '');
  const photoId = CITY_PHOTOS[slug] ?? REGION_FALLBACKS[region] ?? DEFAULT_FALLBACK;
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&h=${Math.round(width * 0.56)}&fit=crop&auto=format&q=80`;
}

/**
 * Get a smaller thumbnail version.
 */
export function getCityThumbnailUrl(cityId: string, region: string): string {
  return getCityImageUrl(cityId, region, 400);
}
