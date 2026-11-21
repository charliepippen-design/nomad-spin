import type { UnsplashAttribution } from '@/hooks/useCityImage';
import { useT } from '@/i18n/LocaleProvider';
import { rich } from '@/i18n/rich';

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
 *   - Photographer link: the photographer profile + ?utm_source=digital_nomad_spin&utm_medium=referral
 *   - Unsplash link: https://unsplash.com/?utm_source=digital_nomad_spin&utm_medium=referral
 *
 * Rendered wherever a curated Unsplash photo is shown. Not rendered for the neutral image (attribution is null).
 */
export default function UnsplashCredit({ attribution, className = '', compact = false }: Props) {
  const t = useT();
  if (!attribution) return null;

  return (
    <p
      className={`
        font-mono tracking-wider
        ${compact ? 'text-[7px]' : 'text-[9px]'}
        ${className}
      `}
    >
      {rich(t('common.credit.photoBy'), {
        // The photographer's name comes from the photo record, not from the sentence.
        author: () => (
          <a
            href={attribution.photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/20 hover:decoration-white/60 transition-colors"
          >
            {attribution.photographerName}
          </a>
        ),
        unsplash: (children) => (
          <a
            href="https://unsplash.com/?utm_source=digital_nomad_spin&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-white/20 hover:decoration-white/60 transition-colors"
          >
            {children}
          </a>
        ),
      })}
    </p>
  );
}
