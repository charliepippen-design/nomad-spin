import { useState, useEffect, useRef } from 'react';
import { getCityImageUrl, isCurated } from '@/data/cityImages';
import { supabase } from '@/integrations/supabase/client';

export interface UnsplashAttribution {
  photographerName: string;
  photographerUrl: string;
  unsplashUrl: string;
}

/**
 * Resolves a city hero image through:
 * 1. Curated map (instant render) — then fetches attribution from API
 * 2. DB cache / Unsplash API via edge function (with full attribution)
 * 3. Region fallback (safe default, no attribution)
 *
 * Triggers the Unsplash download endpoint once per display (API compliance).
 */
export function useCityImage(cityId: string, cityName: string, country: string, region: string, width = 800) {
  const slug = cityId.toLowerCase().replace(/-[a-z]{2}$/, '');
  const fallbackUrl = getCityImageUrl(cityId, region, width);
  const curated = isCurated(slug);

  const [imageUrl, setImageUrl] = useState(fallbackUrl);
  const [attribution, setAttribution] = useState<UnsplashAttribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const downloadTriggered = useRef(false);

  useEffect(() => {
    downloadTriggered.current = false;
    // Always start with curated/fallback image for instant render
    setImageUrl(curated ? getCityImageUrl(cityId, region, width) : fallbackUrl);
    setAttribution(null);

    let cancelled = false;

    async function resolve() {
      try {
        const { data } = await supabase.functions.invoke('city-image', {
          body: { slug, cityName, country, region },
        });

        if (cancelled) return;

        if (data?.image_url) {
          // For non-curated cities, use the API-provided image URL
          if (!curated) {
            setImageUrl(data.image_url);
          }
          // Always set attribution if available
          if (data.photographer_name) {
            setAttribution({
              photographerName: data.photographer_name,
              photographerUrl: data.photographer_url || `https://unsplash.com/?utm_source=digital_nomad_spin&utm_medium=referral`,
              unsplashUrl: data.unsplash_url || `https://unsplash.com/?utm_source=digital_nomad_spin&utm_medium=referral`,
            });
          }

          // Trigger Unsplash download endpoint (required by API guidelines)
          if (data.download_location && !downloadTriggered.current) {
            downloadTriggered.current = true;
            supabase.functions.invoke('city-image', {
              body: { action: 'download', downloadLocation: data.download_location },
            }).catch(() => { /* fire-and-forget */ });
          }
        }
      } catch (err) {
        console.warn('City image fetch failed, using fallback', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [slug, cityName, country, region, width, cityId, curated, fallbackUrl]);

  return { imageUrl, attribution, isLoading };
}
