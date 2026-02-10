import type { UnsplashAttribution } from '@/hooks/useCityImage';

interface Props {
  attribution: UnsplashAttribution | null;
  className?: string;
  /** Compact mode for smaller cards (runner-ups) */
  compact?: boolean;
}

/**
 * Unsplash-compliant photographer credit with UTM parameters.
 *
 * Renders: "Photo by [Photographer Name] on [Unsplash]"
 *   - Photographer link: {user.links.html}?utm_source=digital_nomad_spin&utm_medium=referral
 *   - Unsplash link: https://unsplash.com/?utm_source=digital_nomad_spin&utm_medium=referral
 *
 * Only rendered when the image was fetched via the Unsplash API (not for curated static IDs or fallbacks).
 */
export default function UnsplashCredit({ attribution, className = '', compact = false }: Props) {
  if (!attribution) return null;

  return (
    <p
      className={`
        font-mono tracking-wider
        ${compact ? 'text-[7px]' : 'text-[9px]'}
        ${className}
      `}
    >
      Photo by{' '}
      <a
        href={attribution.photographerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-white/20 hover:decoration-white/60 transition-colors"
      >
        {attribution.photographerName}
      </a>
      {' '}on{' '}
      <a
        href="https://unsplash.com/?utm_source=digital_nomad_spin&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-white/20 hover:decoration-white/60 transition-colors"
      >
        Unsplash
      </a>
    </p>
  );
}
