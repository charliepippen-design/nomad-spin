import { Link } from '@/i18n/Link';
import { ExternalLink } from 'lucide-react';
import { guideStayCta } from '@/lib/guideStayCta';
import { trackAffiliateClick } from '@/utils/analytics';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { getT } from '@/i18n/dictionary';

/** `slug` is the English guide slug, in every language. */
export default function GuideStayCta({ slug }: { slug: string }) {
  const t = useT();
  const locale = useLocale();
  const cta = guideStayCta(slug, locale);
  if (!cta) return null;

  const cityLabel = cta.cityLabel ?? cta.city;
  const label = cityLabel ? t('guides.stayCta.searchCity', { city: cityLabel }) : t('guides.stayCta.search');
  // Analytics keeps the English link text, whatever the language on screen.
  const en = getT(DEFAULT_LOCALE);
  const trackedLabel = cta.city ? en('guides.stayCta.searchCity', { city: cta.city }) : en('guides.stayCta.search');

  return (
    <aside className="max-w-3xl mx-auto px-6 mt-8">
      <div className="rounded-lg border border-border/30 bg-card p-5">
        <h2 className="text-xl font-serif text-foreground mb-2">{cta.heading}</h2>
        <p className="text-base text-muted-foreground">{cta.body}</p>
        <a
          href={cta.url}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={() => trackAffiliateClick(cta.partner, 'accommodation', cta.city ?? '', cta.url, trackedLabel, { placement: 'guide_stay_box', citySlug: cta.destinationSlug })}
          className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary/10 border border-primary/30 text-sm text-primary hover:bg-primary/20 transition-colors"
        >
          {label} <ExternalLink className="w-3 h-3" />
        </a>
        {cta.destinationSlug && cta.city ? (
          <p className="mt-3 text-sm">
            <Link to={`/destinations/${cta.destinationSlug}`} className="text-primary underline underline-offset-4">
              {t('guides.stayCta.destinationLink', { city: cityLabel ?? cta.city })}
            </Link>
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">
          {t('guides.stayCta.disclosure')}
        </p>
      </div>
    </aside>
  );
}
