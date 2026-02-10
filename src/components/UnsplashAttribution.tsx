import type { UnsplashAttribution } from '@/hooks/useCityImage';

interface Props {
  attribution: UnsplashAttribution | null;
  className?: string;
}

/**
 * Renders Unsplash-compliant photographer credit with UTM parameters.
 * Only shown when the image was fetched from Unsplash (not for curated/fallback).
 */
export default function UnsplashAttributionLine({ attribution, className = '' }: Props) {
  if (!attribution) return null;

  return (
    <p className={`text-[9px] font-mono text-muted-foreground/50 tracking-wider ${className}`}>
      Photo by{' '}
      <a
        href={attribution.photographerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-muted-foreground/80 transition-colors"
      >
        {attribution.photographerName}
      </a>
      {' '}on{' '}
      <a
        href={attribution.unsplashUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-muted-foreground/80 transition-colors"
      >
        Unsplash
      </a>
    </p>
  );
}
