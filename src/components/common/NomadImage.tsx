import { useState, useCallback } from 'react';
import { NEUTRAL_IMAGE } from '@/data/cityImages';

interface NomadImageProps {
  src: string;
  cityName: string;
  countryName: string;
  className?: string;
  alt?: string;
}

export default function NomadImage({ src: primarySrc, cityName, countryName, className = '', alt }: NomadImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const src = failed ? NEUTRAL_IMAGE : primarySrc;

  const handleError = useCallback(() => {
    setFailed(true);
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
