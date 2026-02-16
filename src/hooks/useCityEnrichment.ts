import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { City, LandscapeOption } from '@/data/cities/types';

interface EnrichmentData {
  language?: string;
  landscape?: LandscapeOption[];
  taxation?: { incomeTax: string; notes: string };
  healthInsurance?: { costMonthly: number; quality: number };
  esim?: { available: boolean; costMonthly: number };
  legalNotes?: string[];
}

/**
 * Lazy-loads AI enrichment for a city when it has empty enrichable fields.
 * Merges enriched data back onto the city object.
 */
export function useCityEnrichment(city: City | null) {
  const [enrichedCity, setEnrichedCity] = useState<City | null>(city);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) {
      setEnrichedCity(null);
      return;
    }

    // If city already has enriched data, skip
    const needsEnrichment = !city.language || city.language === 'English' && city.countryCode !== 'US' && city.countryCode !== 'GB' && city.countryCode !== 'AU'
      || (city.legalNotes?.length === 0)
      || (city.taxation?.incomeTax === 'Unknown');

    if (!needsEnrichment) {
      setEnrichedCity(city);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const enrich = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('enrich-city', {
          body: { cityName: city.name, country: city.country, slug: city.id },
        });

        if (error || !data) {
          console.warn('[Enrichment] Failed:', error);
          setEnrichedCity(city);
          return;
        }

        if (cancelled) return;

        const enrichment = data as EnrichmentData;
        setEnrichedCity({
          ...city,
          language: enrichment.language || city.language,
          landscape: enrichment.landscape?.length ? enrichment.landscape : city.landscape,
          taxation: enrichment.taxation?.incomeTax ? enrichment.taxation : city.taxation,
          healthInsurance: enrichment.healthInsurance?.costMonthly ? enrichment.healthInsurance : city.healthInsurance,
          esim: enrichment.esim ? enrichment.esim : city.esim,
          legalNotes: enrichment.legalNotes?.length ? enrichment.legalNotes : city.legalNotes,
          dataSource: 'estimated',
        });
      } catch (e) {
        console.warn('[Enrichment] Error:', e);
        setEnrichedCity(city);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    enrich();
    return () => { cancelled = true; };
  }, [city?.id]);

  return { enrichedCity, loading };
}
