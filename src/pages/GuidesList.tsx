import { Link } from '@/i18n/Link';
import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { City } from '@/data/cities';
import { CityGuideCard, EssayRow, SectionRule, splitGuides } from '@/components/guides/GuideIndex';
import { useGuides } from '@/hooks/useGuides';
import { indexGuides } from '@/data/guides';
import { GUIDES_INDEX_DESCRIPTION, guidesIndexBreadcrumbJsonLd } from '@/lib/guideJsonLd';

const BASE_URL = 'https://www.digitalnomadspin.com';
const PAGE_URL = `${BASE_URL}/guides`;
const TITLE = 'Digital Nomad Guides & Analysis | Nomad Spin';
const DESCRIPTION = GUIDES_INDEX_DESCRIPTION;

const REGION_ORDER: City['region'][] = ['Europe', 'Asia', 'LATAM', 'North America', 'Africa', 'Oceania'];
const regionName = (r: City['region']) => (r === 'LATAM' ? 'Latin America' : r);

export default function GuidesList() {
  const { data: liveGuides, isLoading, isError } = useGuides();

  // Same published list as the sitemap. Live rows can refresh those slugs only.
  const mergedGuides = indexGuides(liveGuides);
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
        .sort((a, b) => Number(b.hasPhoto) - Number(a.hasPhoto) || a.city.name.localeCompare(b.city.name)),
    [cityGuides, region],
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: TITLE,
    url: PAGE_URL,
    description: DESCRIPTION,
    hasPart: mergedGuides.map(g => ({
      '@type': 'Article',
      headline: g.title,
      url: `${BASE_URL}/guides/${g.slug}`,
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
        <script type="application/ld+json">{JSON.stringify(guidesIndexBreadcrumbJsonLd())}</script>
      </Helmet>

      <div className="dns-container py-12 md:py-20">
        {/* Masthead */}
        <header className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-end md:gap-16">
          <div>
            <p className="dns-eyebrow">Field guides</p>
            <h1 className="mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">
              Digital nomad guides
            </h1>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            No fluff. No discovery calls. Just the actual mechanics of moving, living, and optimizing taxes as a remote worker.
          </p>
        </header>

        {/* Spinner only when there is nothing cached to show. */}
        {isLoading && mergedGuides.length === 0 && (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading guides…
          </div>
        )}

        {/* Error state, still shows static guides below */}
        {isError && (
          <div className="mt-10 flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Could not reach the live guide database. Showing cached content.
          </div>
        )}

        {/* City living guides. Static guides stay visible while the live query is in flight. */}
        {cityGuides.length > 0 && (
          <section aria-labelledby="living-guides" className="mt-12 md:mt-16">
            <SectionRule id="living-guides" title="Living guides" count={shownCityGuides.length} />
            {regions.length > 1 && (
              <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Filter living guides by region">
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
                      {value === 'all' ? 'All regions' : regionName(value)}
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
            <SectionRule id="decide-and-plan" title="Decide and plan" count={essays.length} />
            <ol className="mt-2">
              {essays.map((guide, i) => (
                <EssayRow key={guide.slug} guide={guide} index={i} showDate />
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
