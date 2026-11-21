import { cities } from '@/data/cities';
import { citySlug } from '@/lib/citySlug';
import { buildBookingStayUrl } from '@/utils/affiliateEngine';
import { DEFAULT_LOCALE, type Locale } from '../i18n/config';
import { cityDisplayName } from '../i18n/content';
import { getT } from '../i18n/dictionary';

interface GuideStayCtaConfig {
  /** City id from src/data/cities.ts. Omit for guides that are not about one city. */
  cityId?: string;
  /** Heading and body for a guide that is not about one city: guides.stayCta.<text>.heading / .body. */
  text?: 'list' | 'season' | 'shortlist';
}

/**
 * Every published guide. Started with the 5 most visited (Vercel Web Analytics,
 * last 30 days) and the October launch guides, then extended to the rest. An entry only renders once
 * that guide is published.
 */
export const GUIDE_STAY_CTAS: Record<string, GuideStayCtaConfig> = {
  'living-in-chiang-mai': { cityId: 'chiang-mai-th' },
  'living-in-da-nang': { cityId: 'da-nang-vn' },
  'living-in-medellin': { cityId: 'medellin-co' },
  'living-in-budapest': { cityId: 'budapest-hu' },
  'living-in-madrid': { cityId: 'madrid-es' },
  'living-in-hoi-an': { cityId: 'hoi-an-vn' },
  'living-in-tallinn': { cityId: 'tallinn-ee' },
  'living-in-kuala-lumpur': { cityId: 'kuala-lumpur-my' },
  'living-in-split': { cityId: 'split-hr' },
  'living-in-tirana': { cityId: 'tirana-al' },
  'living-in-penang': { cityId: 'penang-my' },
  'living-in-kotor': { cityId: 'kotor-me' },
  'living-in-bali': { cityId: 'bali-id' },
  'living-in-bangkok': { cityId: 'bangkok-th' },
  'living-in-barcelona': { cityId: 'barcelona-es' },
  'living-in-buenos-aires': { cityId: 'buenos-aires-ar' },
  'living-in-cape-town': { cityId: 'cape-town-za' },
  'living-in-ho-chi-minh-city': { cityId: 'ho-chi-minh-vn' },
  'living-in-lisbon': { cityId: 'lisbon-pt' },
  'living-in-mexico-city': { cityId: 'mexico-city-mx' },
  'living-in-porto': { cityId: 'porto-pt' },
  'living-in-prague': { cityId: 'prague-cz' },
  'living-in-tbilisi': { cityId: 'tbilisi-ge' },
  'living-in-valencia': { cityId: 'valencia-es' },
  'paraguay-tax-residency-remote-workers': { cityId: 'asuncion-py' },
  'best-places-digital-nomads-2025': { text: 'list' },
  'where-to-go-next-by-season': { text: 'season' },
  'how-to-choose-next-nomad-base': { text: 'shortlist' },
};

export interface GuideStayCta {
  heading: string;
  body: string;
  url: string;
  partner: 'Booking.com';
  /** English city name when the guide is about one city. Used for tracking: never translated. */
  city?: string;
  /** City name in the reader's language, for visible text. */
  cityLabel?: string;
  destinationSlug?: string;
}

/** `slug` is always the English guide slug: it names the tracking campaign. */
export function guideStayCta(slug: string, locale: Locale = DEFAULT_LOCALE): GuideStayCta | null {
  const config = GUIDE_STAY_CTAS[slug];
  if (!config) return null;
  const t = getT(locale);
  const campaign = `guide-${slug}`;

  if (!config.cityId) {
    return {
      heading: config.text ? t(`guides.stayCta.${config.text}.heading`) : '',
      body: config.text ? t(`guides.stayCta.${config.text}.body`) : '',
      url: buildBookingStayUrl({ campaign }),
      partner: 'Booking.com',
    };
  }

  const city = cities.find((c) => c.id === config.cityId);
  if (!city) return null;
  const cityLabel = cityDisplayName(city, locale);
  return {
    heading: t('guides.stayCta.city.heading', { city: cityLabel }),
    body: t('guides.stayCta.city.body', { city: cityLabel }),
    url: buildBookingStayUrl({ city: city.name, country: city.country, campaign }),
    partner: 'Booking.com',
    city: city.name,
    cityLabel,
    destinationSlug: citySlug(city),
  };
}
