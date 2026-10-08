import type { City } from '../data/cities';
import { guides, type Guide } from '../data/guides';
import { citySlug } from './citySlug';
import { isMaxInitialNomadVisa, visaPathSentence } from './visaCopy';

const BASE_URL = 'https://www.digitalnomadspin.com';

/** Format month lists for prose / meta (e.g. "Nov, Dec, Jan"). */
export function formatMonths(months: string[] | undefined): string {
  if (!months || months.length === 0) return '';
  return months.join(', ');
}

/**
 * Deterministic intro from the same City fields the globe scores.
 * No LLM: stable output for prerender + React.
 */
export function destinationIntro(city: City): string {
  const best = formatMonths(city.weather?.bestMonths);
  const rainy = formatMonths(city.weather?.rainyMonths);
  const vibes = city.vibe?.length ? city.vibe.join(', ') : 'mixed';
  const landscapes = city.landscape?.length ? city.landscape.join(', ') : 'urban';

  const regionArticle = city.region === 'Asia' || city.region === 'Africa' || city.region === 'Oceania' ? 'an' : 'a';
  let intro =
    `${city.name}, ${city.country} is ${regionArticle} ${city.region} base for digital nomads ` +
    `with a typical solo monthly cost around $${city.costUSD}, average internet around ` +
    `${city.internetMbps} Mbps, and a safety score of ${city.safety}/10.`;

  if (best) {
    intro += ` In our dataset the friendliest months are ${best}`;
    if (rainy) intro += `, while rainy months to plan around are ${rainy}`;
    intro += '.';
  } else if (rainy) {
    intro += ` Rainy months to plan around are ${rainy}.`;
  }

  const tz = city.meta.timeZoneUtc ? ` Time zone ${city.meta.timeZoneUtc}.` : '';
  intro +=
    ` Place feel leans ${landscapes} with vibes tagged ${vibes}. ` +
    `Visa: ${visaPathSentence(city.meta)}` +
    tz;

  return intro;
}

function visaMetaClause(city: City): string {
  if (city.countryCode === 'TH') return 'tourism exemption (passport-dependent)';
  if (city.meta.visaNote) return `${city.meta.visaType} (permit path; verify)`;
  return `${city.meta.visaType} (${city.meta.visaDays} days)`;
}

export function destinationMetaDescription(city: City): string {
  const best = formatMonths(city.weather?.bestMonths);
  const base =
    `${city.name} for digital nomads: $${city.costUSD}/mo, ${city.internetMbps} Mbps, ` +
    `safety ${city.safety}/10, ${visaMetaClause(city)}`;
  const withMonths = best ? `${base}. Best months: ${best}.` : `${base}.`;
  return withMonths.length <= 160 ? withMonths : `${withMonths.slice(0, 157).replace(/\s+\S*$/, '')}…`;
}

export function destinationPageTitle(city: City): string {
  return `${city.name}, ${city.country}: Digital Nomad Guide | Nomad Spin`;
}

/** Guides whose relatedDestinations include this city slug (Bali living, season calendar, etc.). */
export function relatedGuidesForCity(city: City): Guide[] {
  const slug = citySlug(city);
  return guides.filter((g) => g.relatedDestinations?.includes(slug));
}

/**
 * Peer living guides when a hub does not already surface 2.
 * Same region, or the comparison the city's own guide already makes.
 * Values are destination slugs. Only slugs with a published living guide are used.
 */
const LIVING_GUIDE_PEERS: Record<string, readonly string[]> = {
  bali: ['chiang-mai', 'bangkok', 'da-nang'],
  'cape-town': ['lisbon', 'bali', 'buenos-aires'],
  'chiang-mai': ['bangkok', 'da-nang', 'bali'],
  bangkok: ['chiang-mai', 'da-nang', 'bali'],
  'da-nang': ['ho-chi-minh-city', 'chiang-mai', 'bali'],
  'ho-chi-minh-city': ['da-nang', 'bangkok', 'chiang-mai'],
  'mexico-city': ['medellin', 'buenos-aires', 'chiang-mai'],
  medellin: ['mexico-city', 'buenos-aires', 'chiang-mai'],
  'buenos-aires': ['medellin', 'mexico-city', 'lisbon'],
  lisbon: ['porto', 'barcelona', 'valencia'],
  porto: ['lisbon', 'valencia', 'barcelona'],
  barcelona: ['valencia', 'lisbon', 'porto'],
  valencia: ['barcelona', 'lisbon', 'porto'],
  budapest: ['lisbon', 'prague', 'barcelona'],
  prague: ['budapest', 'lisbon', 'barcelona'],
  tbilisi: ['budapest', 'chiang-mai', 'lisbon'],
};

function escHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** This city's own living guide, when one is published. */
export function livingGuideForCity(city: City): Guide | null {
  return guides.find((guide) => guide.slug === `living-in-${citySlug(city)}`) ?? null;
}

function isPeerLivingGuide(guide: Guide, ownSlug: string): boolean {
  return guide.slug.startsWith('living-in-') && guide.slug !== ownSlug;
}

/**
 * Guides to list on a destination hub.
 * Keeps guides that already name the city, and fills in 2 to 4 peer living
 * guides when fewer than 2 are present.
 */
export function hubRelatedGuides(city: City): Guide[] {
  const ownSlug = `living-in-${citySlug(city)}`;
  const existing = relatedGuidesForCity(city).filter((guide) => guide.slug !== ownSlug);
  const peers = existing.filter((guide) => isPeerLivingGuide(guide, ownSlug));
  if (peers.length >= 2) {
    if (peers.length <= 4) return existing;
    const keep = new Set(peers.slice(0, 4).map((guide) => guide.slug));
    return existing.filter((guide) => !isPeerLivingGuide(guide, ownSlug) || keep.has(guide.slug));
  }

  const extras: Guide[] = [];
  for (const peerCity of LIVING_GUIDE_PEERS[citySlug(city)] ?? []) {
    if (peers.length + extras.length >= 4) break;
    const guide = guides.find((item) => item.slug === `living-in-${peerCity}`);
    if (!guide || guide.slug === ownSlug) continue;
    if (peers.some((item) => item.slug === guide.slug) || extras.some((item) => item.slug === guide.slug)) {
      continue;
    }
    extras.push(guide);
  }
  return [...existing, ...extras];
}

/** Crawlable living-guide link for prerendered destination HTML. Empty when the city has no living guide. */
export function destinationFieldGuideHtml(city: City): string {
  const guide = livingGuideForCity(city);
  if (!guide) return '';
  return `<h2>Field guide</h2><p><a href="/guides/${escHtml(guide.slug)}" style="color:#34d399">${escHtml(guide.title)}</a></p>`;
}

export function destinationJsonLd(city: City, pageUrl: string): Record<string, unknown> {
  const description = destinationIntro(city);
  const additionalProperty = [
    { '@type': 'PropertyValue', name: 'Monthly cost (USD)', value: city.costUSD },
    { '@type': 'PropertyValue', name: 'Internet Mbps', value: city.internetMbps },
    { '@type': 'PropertyValue', name: 'Safety score', value: city.safety },
    {
      '@type': 'PropertyValue',
      name: isMaxInitialNomadVisa(city.countryCode, city.meta.visaType)
        ? 'Visa days (maximum initial validity of the nomad visa)'
        : 'Visa days',
      value: city.meta.visaDays,
    },
    { '@type': 'PropertyValue', name: 'Visa type', value: city.meta.visaType },
  ];
  if (city.meta.visaNote) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Visa note',
      value: city.meta.visaNote,
    });
  }
  if (city.weather?.bestMonths?.length) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Best months',
      value: city.weather.bestMonths.join(', '),
    });
  }
  if (city.weather?.rainyMonths?.length) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Rainy months',
      value: city.weather.rainyMonths.join(', '),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': ['TouristDestination', 'Place'],
    name: `${city.name}, ${city.country}`,
    description,
    url: pageUrl,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.lat,
      longitude: city.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressCountry: city.countryCode,
    },
    touristType: 'Digital nomad',
    additionalProperty,
  };
}

export { BASE_URL as DESTINATION_SEO_BASE_URL };
