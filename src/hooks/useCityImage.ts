import { useMemo } from 'react';
import { getCityImageAlt, getCityImageUrl, getCityPhoto } from '@/data/cityImages';

export interface UnsplashAttribution {
  photographerName: string;
  photographerUrl: string;
  unsplashUrl: string;
}

const UTM = 'utm_source=digital_nomad_spin&utm_medium=referral';

function withUtm(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}${UTM}`;
}

export function cityAttribution(cityId: string): UnsplashAttribution | null {
  const photo = getCityPhoto(cityId);
  if (!photo) return null;
  return {
    photographerName: photo.photographer,
    photographerUrl: withUtm(photo.photographerUrl),
    unsplashUrl: withUtm(photo.unsplashUrl),
  };
}

/**
 * Resolves a city hero image from the curated, verified list in code.
 * Cities without a verified photo get the neutral image and no attribution.
 */
export function useCityImage(cityId: string, cityName: string, country: string, region: string, width = 800) {
  return useMemo(() => {
    const attribution = cityAttribution(cityId);
    return {
      imageUrl: getCityImageUrl(cityId, region, width),
      attribution,
      alt: getCityImageAlt(cityName, country, cityId),
      isLoading: false,
    };
  }, [cityId, cityName, country, region, width]);
}
