import { useState, useCallback } from 'react';
import { haversineKm } from '@/lib/distance';
import { origins, type Origin } from '@/data/origins';
import { toast } from '@/hooks/use-toast';

interface GeoState {
  locating: boolean;
  acquiredCity: string | null;
}

export function useGeolocation(onOriginFound: (origin: Origin) => void) {
  const [state, setState] = useState<GeoState>({ locating: false, acquiredCity: null });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: 'Location unavailable', description: 'Geolocation not supported. Please select your city manually.' });
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
          setState({ locating: false, acquiredCity: closest.name });
          // Clear the acquired text after 3s
          setTimeout(() => setState(s => ({ ...s, acquiredCity: null })), 3000);
        } else {
          toast({ title: 'No nearby city found', description: 'No nearby city found in our database. Please select manually.' });
          setState({ locating: false, acquiredCity: null });
        }
      },
      (err) => {
        console.debug('Geolocation error:', err.message);
        toast({ title: 'Location access denied', description: 'Please select your city manually.' });
        setState({ locating: false, acquiredCity: null });
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [onOriginFound]);

  return { ...state, locate };
}
