import { Link } from '@/i18n/Link';
import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { City } from '@/data/cities';
import { CityGuideCard, EssayRow, SectionRule, guideEnSlug, splitGuides } from '@/components/guides/GuideIndex';
import { useGuides } from '@/hooks/useGuides';
import { indexGuides } from '@/data/guides';
import { guidesIndexBreadcrumbJsonLd, guidesIndexDescription, guidesIndexTitle } from '@/lib/guideJsonLd';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { DEFAULT_LOCALE, LOCALE_INFO } from '@/i18n/config';
import { cityDisplayName, localizedGuides } from '@/i18n/content';
import { absoluteUrl } from '@/i18n/paths';
import { LocaleLinks, canonicalUrl } from '@/i18n/seo';

const BASE_URL = 'https://www.digitalnomadspin.com';

const REGION_ORDER: City['region'][] = ['Europe', 'Asia', 'LATAM', 'North America', 'Africa', 'Oceania'];
const regionName = (r: City['region']) => (r === 'LATAM' ? 'Latin America' : r);

export default function GuidesList() {
  const t = useT();
  const locale = useLocale();
  const isEnglish = locale === DEFAULT_LOCALE;
  // Live rows are English. A translated index reads its guides from the language bundle.
  const { data: liveGuides, isLoading, isError } = useGuides({ enabled: isEnglish });

  const PAGE_URL = canonicalUrl('/guides', locale);
  const TITLE = guidesIndexTitle(locale);
  const DESCRIPTION = guidesIndexDescription(locale);

  // Same published list as the sitemap. Live rows can refresh those slugs only.
  const mergedGuides = useMemo(
    () => (isEnglish ? indexGuides(liveGuides) : localizedGuides(locale)),
    [isEnglish, liveGuides, locale],
  );
  // English guides with no translation yet, listed apart on a translated index.
  const englishOnly = useMemo(() => {
    if (isEnglish) return [];
    const translated = new Set(mergedGuides.map(guideEnSlug));
    return indexGuides().filter((guide) => !translated.has(guide.slug));
  }, [isEnglish, mergedGuides]);
  const [region, setRegion] = useState<City['region'] | 'all'>('all');
  const { cityGuides, essays } = useMemo(() => splitGuides(mergedGuides), [mergedGuides]);
  const regions = useMemo(
    () => REGION_ORDER.filter((r) => cityGuides.some((entry) => entry.city.region === r)),
    [cityGuides],
  );
  const shownCityGuides = useMemo(
    () =>
      cityGuides
        .filter((entry) => region === 'all' || entry.city.region === region)
        // Photo cards first, then alphabetical, so the grid opens strong.
        .sort(
          (a, b) =>
            Number(b.hasPhoto) - Number(a.hasPhoto) ||
            cityDisplayName(a.city, locale).localeCompare(cityDisplayName(b.city, locale)),
        ),
    [cityGuides, region, locale],
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: TITLE,
    url: PAGE_URL,
    description: DESCRIPTION,
    ...(isEnglish ? {} : { inLanguage: LOCALE_INFO[locale].htmlLang }),
    hasPart: mergedGuides.map(g => ({
      '@type': 'Article',
      headline: g.title,
      url: absoluteUrl(`/guides/${guideEnSlug(g)}`, locale),
      datePublished: g.date,
      dateModified: g.updated ?? g.date,
    })),
  };

  return (
    <div className="page-content min-h-screen bg-background pb-24">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${BASE_URL}/og-preview.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${BASE_URL}/og-preview.png`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(guidesIndexBreadcrumbJsonLd(locale))}</script>
      </Helmet>
      <LocaleLinks enPath="/guides" />

      <div className="dns-container py-12 md:py-20">
        {/* Masthead */}
        <header className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-end md:gap-16">
          <div>
            <p className="dns-eyebrow">{t('guides.index.eyebrow')}</p>
            <h1 className="mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">
              {t('guides.index.h1')}
            </h1>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('guides.index.intro')}
          </p>
        </header>

        {/* Spinner only when there is nothing cached to show. */}
        {isLoading && mergedGuides.length === 0 && (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('guides.index.loading')}
          </div>
        )}

        {/* Error state, still shows static guides below */}
        {isError && (
          <div className="mt-10 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {t('guides.index.liveError')}
          </div>
        )}

        {/* City living guides. Static guides stay visible while the live query is in flight. */}
        {cityGuides.length > 0 && (
          <section aria-labelledby="living-guides" className="mt-12 md:mt-16">
            <SectionRule id="living-guides" title={t('guides.index.living')} count={shownCityGuides.length} />
            {regions.length > 1 && (
              <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label={t('guides.index.filterAria')}>
                {(['all', ...regions] as const).map((value) => {
                  const on = region === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setRegion(value)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        on
                          ? 'border-primary/60 bg-primary/15 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {value === 'all'
                        ? t('guides.index.allRegions')
                        : t.dyn(`data.region.${value}`, regionName(value))}
                    </button>
                  );
                })}
              </div>
            )}
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shownCityGuides.map((entry) => (
                <CityGuideCard key={entry.guide.slug} {...entry} />
              ))}
            </ul>
          </section>
        )}

        {/* Essays and frameworks */}
        {essays.length > 0 && (
          <section aria-labelledby="decide-and-plan" className="mt-14 md:mt-20">
            <SectionRule id="decide-and-plan" title={t('guides.index.essays')} count={essays.length} />
            <ol className="mt-2">
              {essays.map((guide, i) => (
                <EssayRow key={guide.slug} guide={guide} index={i} showDate />
              ))}
            </ol>
          </section>
        )}

        {/* Guides not translated yet: listed apart, linked to the English articles. */}
        {englishOnly.length > 0 && (
          <section aria-labelledby="english-guides" className="mt-14 md:mt-20">
            <SectionRule id="english-guides" title={t('guides.index.otherEnglish')} count={englishOnly.length} />
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t('guides.index.otherEnglishNote')}
            </p>
            <ol className="mt-2">
              {englishOnly.map((guide, i) => (
                <EssayRow key={guide.slug} guide={guide} index={i} lang="en" />
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
