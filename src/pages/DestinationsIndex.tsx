import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Search } from 'lucide-react';
import type { City } from '@/data/cities';
import { citiesByRegion, regionLabel, type DestinationIndexRow } from '@/lib/destinationIndex';
import { canonicalDestinationPath } from '@/lib/subAreaDestinations';
import { SectionRule } from '@/components/guides/GuideIndex';

const BASE_URL = 'https://www.digitalnomadspin.com';
const PAGE_URL = `${BASE_URL}/destinations`;
const TITLE = 'Destinations | Nomad Spin';
const DESCRIPTION =
  'Browse digital nomad cities by region. Each page lists cost, internet, safety, and visa notes from the Nomad Spin dataset.';

type SortKey = 'name' | 'cost' | 'internet' | 'safety';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'A to Z' },
  { key: 'cost', label: 'Lowest cost' },
  { key: 'internet', label: 'Fastest internet' },
  { key: 'safety', label: 'Safest' },
];

function sortRows(rows: DestinationIndexRow[], sort: SortKey): DestinationIndexRow[] {
  if (sort === 'name') return rows; // citiesByRegion already returns A to Z
  const by: Record<Exclude<SortKey, 'name'>, (a: City, b: City) => number> = {
    cost: (a, b) => a.costUSD - b.costUSD,
    internet: (a, b) => b.internetMbps - a.internetMbps,
    safety: (a, b) => b.safety - a.safety,
  };
  return [...rows].sort((a, b) => by[sort](a.city, b.city) || a.city.name.localeCompare(b.city.name));
}

export default function DestinationsIndex() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<City['region'] | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('name');

  const allGroups = useMemo(() => citiesByRegion(query), [query]);
  const groups = useMemo(
    () =>
      allGroups
        .filter((group) => region === 'all' || group.region === region)
        .map((group) => ({ ...group, cities: sortRows(group.cities, sort) })),
    [allGroups, region, sort],
  );
  const matchCount = groups.reduce((sum, group) => sum + group.cities.length, 0);
  const totalMatches = allGroups.reduce((sum, group) => sum + group.cities.length, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Destinations',
    url: PAGE_URL,
    description: DESCRIPTION,
  };

  return (
    <div className="page-content min-h-screen bg-background">
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
      </Helmet>

      <main className="dns-container py-12 md:py-20">
        {/* Masthead */}
        <header className="grid gap-6 md:grid-cols-[1fr_1.1fr] md:items-end md:gap-16">
          <div>
            <p className="dns-eyebrow">The index</p>
            <h1 className="mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">Destinations</h1>
          </div>
          <div>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              City pages from the Nomad Spin dataset, grouped by region. Open a city for cost, internet, safety, and visa notes.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link to="/compare" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                Compare cities <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/find-your-base" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                Find your base <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="sticky top-14 z-20 -mx-4 mt-10 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative block md:w-80">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="City, country, or region"
                aria-label="Search destinations"
                className="dns-input pl-10"
              />
            </label>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sort destinations">
              {SORTS.map((option) => {
                const on = sort === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSort(option.key)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      on
                        ? 'border-primary/60 bg-primary/15 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-sm tabular-nums text-muted-foreground md:ml-auto" aria-live="polite">
              {matchCount.toLocaleString('en-US')} {matchCount === 1 ? 'city' : 'cities'}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm" role="group" aria-label="Filter by region">
            <RegionTab label="All regions" count={totalMatches} on={region === 'all'} onClick={() => setRegion('all')} />
            {allGroups.map((group) => (
              <RegionTab
                key={group.region}
                label={regionLabel(group.region)}
                count={group.cities.length}
                on={region === group.region}
                onClick={() => setRegion(group.region)}
              />
            ))}
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="mt-10 dns-card p-6">
            <h2 className="text-lg text-foreground">No cities match that search.</h2>
            <p className="mt-2 text-sm text-muted-foreground">Try a country name, or clear the search to see every city.</p>
            {(query || region !== 'all') && (
              <button
                type="button"
                className="dns-btn-secondary mt-4"
                onClick={() => {
                  setQuery('');
                  setRegion('all');
                }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-14 pt-10">
            {groups.map((group) => (
              <section key={group.region} aria-labelledby={`region-${group.region}`}>
                <SectionRule id={`region-${group.region}`} title={regionLabel(group.region)} count={group.cities.length} />
                <ul className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
                  {group.cities.map(({ city, slug }) => (
                    <li key={slug} className="min-w-0 border-b border-border">
                      <Link
                        to={canonicalDestinationPath(slug)}
                        className="group flex items-baseline justify-between gap-4 py-3"
                      >
                        <span className="min-w-0 truncate">
                          <span className="font-display text-base font-semibold text-foreground group-hover:text-primary">
                            {city.name}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground">{city.country}</span>
                        </span>
                        <span className="flex shrink-0 items-baseline gap-3 text-sm tabular-nums text-muted-foreground">
                          <span className={sort === 'internet' ? 'text-foreground' : 'hidden sm:inline'}>
                            {city.internetMbps} Mbps
                          </span>
                          <span className={sort === 'safety' ? 'text-foreground' : 'hidden sm:inline'}>{city.safety}/10</span>
                          <span className={`w-[5.5rem] text-right ${sort === 'cost' || sort === 'name' ? 'text-foreground' : ''}`}>
                            ${city.costUSD.toLocaleString('en-US')}/mo
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <p className="mt-12 text-xs text-muted-foreground">
          Figures are editorial values, and some city records are estimates.{' '}
          <Link to="/methodology" className="underline underline-offset-4 hover:text-foreground">
            How the data is built
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

function RegionTab({ label, count, on, onClick }: { label: string; count: number; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`border-b-2 py-1 font-medium transition-colors ${
        on ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {label} <span className="tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}
