import { cities } from '@/data/cities';
import { citySlug } from '@/lib/citySlug';
import { buildBookingStayUrl } from '@/utils/affiliateEngine';

interface GuideStayCtaConfig {
  /** City id from src/data/cities.ts. Omit for guides that are not about one city. */
  cityId?: string;
  heading?: string;
  body?: string;
}

/**
 * The 5 most visited guides (Vercel Web Analytics, last 30 days), plus the
 * October launch guides (Madrid, Hoi An, Tallinn). An entry only renders once
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
  'how-to-choose-next-nomad-base': {
    heading: 'Shortlist done?',
    body: 'Once two or three destination pages pass your filters, compare stays for your dates on Booking.com.',
  },
};

export interface GuideStayCta {
  heading: string;
  body: string;
  url: string;
  partner: 'Booking.com';
  /** City name when the guide is about one city. */
  city?: string;
  destinationSlug?: string;
}

export function guideStayCta(slug: string): GuideStayCta | null {
  const config = GUIDE_STAY_CTAS[slug];
  if (!config) return null;
  const campaign = `guide-${slug}`;

  if (!config.cityId) {
    return {
      heading: config.heading ?? '',
      body: config.body ?? '',
      url: buildBookingStayUrl({ campaign }),
      partner: 'Booking.com',
    };
  }

  const city = cities.find((c) => c.id === config.cityId);
  if (!city) return null;
  return {
    heading: `Ready to book a month in ${city.name}?`,
    body: `Search stays in ${city.name} on Booking.com. Filter for a desk and a kitchen, and read recent reviews for Wi-Fi before you pay.`,
    url: buildBookingStayUrl({ city: city.name, country: city.country, campaign }),
    partner: 'Booking.com',
    city: city.name,
    destinationSlug: citySlug(city),
  };
}
