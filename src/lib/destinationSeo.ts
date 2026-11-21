import type { City } from '../data/cities';
import { guides, type Guide } from '../data/guides';
import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from '../i18n/config';
import { guideForLocale, localizeCity } from '../i18n/content';
import { getT } from '../i18n/dictionary';
import { formatNumber, monthName } from '../i18n/format';
import { localizeHref } from '../i18n/paths';
import { citySlug } from './citySlug';
import { isMaxInitialNomadVisa, visaPathSentence, visaTypeLabel } from './visaCopy';

const BASE_URL = 'https://www.digitalnomadspin.com';

/**
 * A dataset number inside a sentence. English keeps the bare digits it has
 * always printed ("1200"); other languages get their own separators.
 */
export function plainNumber(value: number, locale: Locale = DEFAULT_LOCALE): string {
  return locale === DEFAULT_LOCALE ? String(value) : formatNumber(value, locale);
}

/**
 * A dataset label (region, vibe, landscape, coworking density, language).
 * English shows the dataset value as stored; other languages use data.<group>.<value>.
 */
export function dataLabel(
  group: 'region' | 'vibe' | 'landscape' | 'density' | 'language',
  value: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return locale === DEFAULT_LOCALE ? value : getT(locale).dyn(`data.${group}.${value}`, value);
}

/** Format month lists for prose / meta (e.g. "Nov, Dec, Jan"). */
export function formatMonths(months: string[] | undefined, locale: Locale = DEFAULT_LOCALE): string {
  if (!months || months.length === 0) return '';
  return months.map((month) => monthName(month, locale)).join(', ');
}

/** Tags inside a sentence are lowercase in other languages ("mare, montagna"); English prints the dataset value. */
function inlineTags(group: 'vibe' | 'landscape', values: string[], locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return values.join(', ');
  return values.map((value) => dataLabel(group, value, locale).toLowerCase()).join(', ');
}

/**
 * Deterministic intro from the same City fields the globe scores.
 * No LLM: stable output for prerender + React.
 */
export function destinationIntro(source: City, locale: Locale = DEFAULT_LOCALE): string {
  const t = getT(locale);
  const city = localizeCity(source, locale);
  const best = formatMonths(city.weather?.bestMonths, locale);
  const rainy = formatMonths(city.weather?.rainyMonths, locale);
  const vibes = city.vibe?.length ? inlineTags('vibe', city.vibe, locale) : t('city.intro.vibesMixed');
  const landscapes = city.landscape?.length
    ? inlineTags('landscape', city.landscape, locale)
    : t('city.intro.landscapeUrban');

  // English only: "an Asia base", "a Europe base". Other languages use one wording for both keys.
  const startsWithVowel = city.region === 'Asia' || city.region === 'Africa' || city.region === 'Oceania';
  const parts = [
    t(startsWithVowel ? 'city.intro.leadAn' : 'city.intro.leadA', {
      city: city.name,
      country: city.country,
      region: dataLabel('region', city.region, locale),
      cost: plainNumber(city.costUSD, locale),
      mbps: plainNumber(city.internetMbps, locale),
      safety: plainNumber(city.safety, locale),
    }),
  ];

  if (best && rainy) parts.push(t('city.intro.monthsBoth', { best, rainy }));
  else if (best) parts.push(t('city.intro.monthsBest', { best }));
  else if (rainy) parts.push(t('city.intro.monthsRainy', { rainy }));

  parts.push(t('city.intro.feel', { landscapes, vibes }));
  parts.push(t('city.intro.visa', { visa: visaPathSentence(city.meta, locale) }));
  if (city.meta.timeZoneUtc) parts.push(t('city.intro.timeZone', { tz: city.meta.timeZoneUtc }));

  return parts.join(' ');
}

function visaMetaClause(city: City, locale: Locale): string {
  const t = getT(locale);
  if (city.countryCode === 'TH') return t('city.seo.visaThailand');
  const type = visaTypeLabel(city.meta.visaType, locale);
  if (city.meta.visaNote) return t('city.seo.visaPermit', { type });
  return t('city.seo.visaDays', { type, days: city.meta.visaDays });
}

export function destinationMetaDescription(source: City, locale: Locale = DEFAULT_LOCALE): string {
  const t = getT(locale);
  const city = localizeCity(source, locale);
  const best = formatMonths(city.weather?.bestMonths, locale);
  const vars = {
    city: city.name,
    cost: plainNumber(city.costUSD, locale),
    mbps: plainNumber(city.internetMbps, locale),
    safety: plainNumber(city.safety, locale),
    visa: visaMetaClause(city, locale),
  };
  const withMonths = best
    ? t('city.seo.descriptionMonths', { ...vars, months: best })
    : t('city.seo.description', vars);
  return withMonths.length <= 160 ? withMonths : `${withMonths.slice(0, 157).replace(/\s+\S*$/, '')}…`;
}

export function destinationPageTitle(source: City, locale: Locale = DEFAULT_LOCALE): string {
  const city = localizeCity(source, locale);
  return getT(locale)('city.seo.title', { city: city.name, country: city.country });
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
  'chiang-mai': ['bangkok', 'da-nang', 'bali', 'kuala-lumpur'],
  bangkok: ['chiang-mai', 'da-nang', 'bali', 'kuala-lumpur'],
  'kuala-lumpur': ['bangkok', 'chiang-mai', 'ho-chi-minh-city', 'bali'],
  penang: ['kuala-lumpur', 'chiang-mai', 'da-nang', 'bali'],
  'da-nang': ['hoi-an', 'ho-chi-minh-city', 'chiang-mai', 'bali'],
  'hoi-an': ['da-nang', 'ho-chi-minh-city', 'chiang-mai', 'bali'],
  'ho-chi-minh-city': ['da-nang', 'hoi-an', 'bangkok', 'chiang-mai'],
  'mexico-city': ['medellin', 'buenos-aires', 'chiang-mai'],
  medellin: ['mexico-city', 'buenos-aires', 'chiang-mai'],
  'buenos-aires': ['medellin', 'mexico-city', 'lisbon'],
  lisbon: ['porto', 'barcelona', 'valencia'],
  porto: ['lisbon', 'valencia', 'barcelona'],
  barcelona: ['valencia', 'lisbon', 'porto'],
  valencia: ['barcelona', 'lisbon', 'porto'],
  budapest: ['lisbon', 'prague', 'barcelona'],
  prague: ['budapest', 'lisbon', 'barcelona'],
  madrid: ['barcelona', 'valencia', 'lisbon', 'budapest'],
  split: ['porto', 'valencia', 'budapest', 'lisbon'],
  tallinn: ['prague', 'budapest', 'lisbon', 'tbilisi'],
  tbilisi: ['budapest', 'chiang-mai', 'lisbon'],
  tirana: ['tbilisi', 'budapest', 'prague', 'lisbon'],
  kotor: ['split', 'tirana', 'budapest', 'tbilisi'],
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
export function destinationFieldGuideHtml(city: City, locale: Locale = DEFAULT_LOCALE): string {
  const guide = livingGuideForCity(city);
  if (!guide) return '';
  const title = guideForLocale(guide, locale).title;
  const href = localizeHref(`/guides/${escHtml(guide.slug)}`, locale);
  return `<h2>${escHtml(getT(locale)('city.fieldGuide.title'))}</h2><p><a href="${href}" style="color:#34d399">${escHtml(title)}</a></p>`;
}

export function destinationJsonLd(
  source: City,
  pageUrl: string,
  locale: Locale = DEFAULT_LOCALE,
): Record<string, unknown> {
  const t = getT(locale);
  const city = localizeCity(source, locale);
  const description = destinationIntro(source, locale);
  const additionalProperty = [
    { '@type': 'PropertyValue', name: t('city.ld.monthlyCost'), value: city.costUSD },
    { '@type': 'PropertyValue', name: t('city.ld.internet'), value: city.internetMbps },
    { '@type': 'PropertyValue', name: t('city.ld.safety'), value: city.safety },
    {
      '@type': 'PropertyValue',
      name: isMaxInitialNomadVisa(city.countryCode, city.meta.visaType)
        ? t('city.ld.visaDaysMax')
        : t('city.ld.visaDays'),
      value: city.meta.visaDays,
    },
    { '@type': 'PropertyValue', name: t('city.ld.visaType'), value: visaTypeLabel(city.meta.visaType, locale) },
  ];
  if (city.meta.visaNote) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: t('city.ld.visaNote'),
      value: city.meta.visaNote,
    });
  }
  if (city.weather?.bestMonths?.length) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: t('city.ld.bestMonths'),
      value: formatMonths(city.weather.bestMonths, locale),
    });
  }
  if (city.weather?.rainyMonths?.length) {
    additionalProperty.push({
      '@type': 'PropertyValue',
      name: t('city.ld.rainyMonths'),
      value: formatMonths(city.weather.rainyMonths, locale),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': ['TouristDestination', 'Place'],
    name: `${city.name}, ${city.country}`,
    description,
    url: pageUrl,
    ...(locale === DEFAULT_LOCALE ? {} : { inLanguage: LOCALE_INFO[locale].htmlLang }),
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
    touristType: t('city.ld.touristType'),
    additionalProperty,
  };
}

export { BASE_URL as DESTINATION_SEO_BASE_URL };
