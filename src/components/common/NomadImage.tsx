import { useState, useCallback } from 'react';

const COUNTRY_FALLBACKS: Record<string, string> = {
  Paraguay: 'https://images.unsplash.com/photo-1629853380026-6b2191b29cc3?w=1080&fit=crop&auto=format&q=80',
  Vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1080&fit=crop&auto=format&q=80',
  Portugal: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1080&fit=crop&auto=format&q=80',
  Colombia: 'https://images.unsplash.com/photo-1624204719282-dae70e53ccb4?w=1080&fit=crop&auto=format&q=80',
  Thailand: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1080&fit=crop&auto=format&q=80',
  Argentina: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1080&fit=crop&auto=format&q=80',
  Georgia: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1080&fit=crop&auto=format&q=80',
  Mexico: 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=1080&fit=crop&auto=format&q=80',
  'South Africa': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1080&fit=crop&auto=format&q=80',
  Hungary: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=1080&fit=crop&auto=format&q=80',
  Malaysia: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1080&fit=crop&auto=format&q=80',
};

const GLOBAL_FALLBACK = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&fit=crop&auto=format&q=80';

interface NomadImageProps {
  src: string;
  cityName: string;
  countryName: string;
  className?: string;
  alt?: string;
}

export default function NomadImage({ src: primarySrc, cityName, countryName, className = '', alt }: NomadImageProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const src =
    retryCount === 0
      ? primarySrc
      : retryCount === 1
        ? COUNTRY_FALLBACKS[countryName] ?? GLOBAL_FALLBACK
        : GLOBAL_FALLBACK;

  const handleError = useCallback(() => {
    setRetryCount((r) => Math.min(r + 1, 2));
    setLoaded(false);
  }, []);

  return (
    <div className="absolute inset-0">
      {!loaded && (
        <div className="absolute inset-0 z-[1] bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />
        </div>
      )}
      <img
        src={src}
        alt={alt ?? cityName}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  );
}
