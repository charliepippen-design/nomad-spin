import { useState, useCallback } from 'react';
import { haversineKm } from '@/lib/distance';
import { origins, type Origin } from '@/data/origins';
import { toast } from '@/hooks/use-toast';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { cityDisplayName } from '@/i18n/content';

interface GeoState {
  locating: boolean;
  acquiredCity: string | null;
}

export function useGeolocation(onOriginFound: (origin: Origin) => void) {
  const [state, setState] = useState<GeoState>({ locating: false, acquiredCity: null });
  const t = useT();
  const locale = useLocale();

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: t('globe.geo.unavailable.title'), description: t('globe.geo.unavailable.description') });
      return;
    }

    setState({ locating: true, acquiredCity: null });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Find closest origin (skip "anywhere")
        let closest: Origin | null = null;
        let minDist = Infinity;
        for (const o of origins) {
          if (o.id === 'anywhere') continue;
          const d = haversineKm(latitude, longitude, o.lat, o.lng);
          if (d < minDist) {
            minDist = d;
            closest = o;
          }
        }

        if (closest) {
          onOriginFound(closest);
          setState({ locating: false, acquiredCity: cityDisplayName(closest, locale) });
          // Clear the acquired text after 3s
          setTimeout(() => setState(s => ({ ...s, acquiredCity: null })), 3000);
        } else {
          toast({ title: t('globe.geo.notFound.title'), description: t('globe.geo.notFound.description') });
          setState({ locating: false, acquiredCity: null });
        }
      },
      (err) => {
        console.debug('Geolocation error:', err.message);
        toast({ title: t('globe.geo.denied.title'), description: t('globe.geo.denied.description') });
        setState({ locating: false, acquiredCity: null });
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [onOriginFound, t, locale]);

  return { ...state, locate };
}
