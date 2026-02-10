import { useState, useEffect } from 'react';
import { getCityImageUrl, isCurated } from '@/data/cityImages';
import { supabase } from '@/integrations/supabase/client';

/**
 * Resolves a city hero image through:
 * 1. Curated map (instant)
 * 2. DB cache (fast)
 * 3. Unsplash fetch via edge function (one-time)
 * 4. Region fallback (safe default)
 */
export function useCityImage(cityId: string, cityName: string, country: string, region: string, width = 800) {
  const slug = cityId.toLowerCase().replace(/-[a-z]{2}$/, '');
  const fallbackUrl = getCityImageUrl(cityId, region, width);
  const [imageUrl, setImageUrl] = useState(fallbackUrl);
  const [isLoading, setIsLoading] = useState(!isCurated(slug));

  useEffect(() => {
    if (isCurated(slug)) {
      setImageUrl(getCityImageUrl(cityId, region, width));
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function resolve() {
      try {
        const { data, error } = await supabase.functions.invoke('city-image', {
          body: { slug, cityName, country, region },
        });

        if (cancelled) return;

        if (data?.photoId) {
          const h = Math.round(width * 0.56);
          setImageUrl(`https://images.unsplash.com/photo-${data.photoId}?w=${width}&h=${h}&fit=crop&auto=format&q=80`);
        }
        // If no photoId, keep fallback
      } catch (err) {
        console.warn('City image fetch failed, using fallback', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [slug, cityName, country, region, width, cityId]);

  return { imageUrl, isLoading };
}
