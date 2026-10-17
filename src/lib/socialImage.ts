import type { City } from '../data/cities';
import { getCityImageAlt, getCityImageUrl, getCityPhoto } from '../data/cityImages';
import { findCityBySlug } from './citySlug';

export const SITE_URL = 'https://www.digitalnomadspin.com';
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/og-preview.png`;
export const DEFAULT_SOCIAL_IMAGE_ALT = 'Nomad Spin: spin the globe to find your next digital nomad city';

/** og:image / twitter:image width for city photos. */
export const SOCIAL_IMAGE_WIDTH = 1200;

export interface SocialImage {
  url: string;
  alt: string;
}

/** City photo for og:image and twitter:image, or the site default when the city has no verified photo. */
export function citySocialImage(cityId: string): SocialImage {
  const photo = getCityPhoto(cityId);
  if (!photo) return { url: DEFAULT_SOCIAL_IMAGE, alt: DEFAULT_SOCIAL_IMAGE_ALT };
  return { url: getCityImageUrl(cityId, undefined, SOCIAL_IMAGE_WIDTH), alt: photo.alt };
}

/** The city a living guide covers ("living-in-<destination slug>"), if any. */
export function guideCity(guideSlug: string): City | null {
  if (!guideSlug.startsWith('living-in-')) return null;
  return findCityBySlug(guideSlug.slice('living-in-'.length))?.city ?? null;
}

export function guideSocialImage(guideSlug: string): SocialImage {
  const city = guideCity(guideSlug);
  return city ? citySocialImage(city.id) : { url: DEFAULT_SOCIAL_IMAGE, alt: DEFAULT_SOCIAL_IMAGE_ALT };
}

/** Hero for a living guide: the verified photo, or the neutral image with a "City, Country" alt. */
export function guideHeroImage(guideSlug: string, width: number): (SocialImage & { cityId: string }) | null {
  const city = guideCity(guideSlug);
  if (!city) return null;
  return {
    cityId: city.id,
    url: getCityImageUrl(city.id, city.region, width),
    alt: getCityImageAlt(city.name, city.country, city.id),
  };
}
