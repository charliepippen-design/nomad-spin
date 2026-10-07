import type { City } from '../data/cities';
import { guides, type Guide } from '../data/guides';
import { citySlug } from './citySlug';
import { visaPathSentence } from './visaCopy';

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

export function destinationJsonLd(city: City, pageUrl: string): Record<string, unknown> {
  const description = destinationIntro(city);
  const additionalProperty = [
    { '@type': 'PropertyValue', name: 'Monthly cost (USD)', value: city.costUSD },
    { '@type': 'PropertyValue', name: 'Internet Mbps', value: city.internetMbps },
    { '@type': 'PropertyValue', name: 'Safety score', value: city.safety },
    { '@type': 'PropertyValue', name: 'Visa days', value: city.meta.visaDays },
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
