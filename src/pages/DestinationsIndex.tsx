import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { citiesByRegion, regionLabel } from '@/lib/destinationIndex';

const BASE_URL = 'https://www.digitalnomadspin.com';
const PAGE_URL = `${BASE_URL}/destinations`;
const TITLE = 'Destinations | Nomad Spin';
const DESCRIPTION =
  'Browse digital nomad cities by region. Each page lists cost, internet, safety, and visa notes from the Nomad Spin dataset.';

export default function DestinationsIndex() {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => citiesByRegion(query), [query]);
  const matchCount = groups.reduce((sum, group) => sum + group.cities.length, 0);

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

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl text-foreground mb-4">Destinations</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          City pages from the Nomad Spin dataset, grouped by region. Open a city for cost, internet, safety, and visa notes.
        </p>

        <label className="block max-w-md mb-8">
          <span className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="City, country, or region"
            aria-label="Search destinations"
            className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </label>

        <p className="font-mono text-xs tracking-wider text-muted-foreground mb-8">
          {matchCount} {matchCount === 1 ? 'city' : 'cities'}
        </p>

        {groups.length === 0 ? (
          <p className="text-muted-foreground">No cities match that search.</p>
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.region} aria-labelledby={`region-${group.region}`}>
                <h2 id={`region-${group.region}`} className="text-2xl text-foreground mb-4">
                  {regionLabel(group.region)}
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.cities.map(({ city, slug }) => (
                    <li key={slug}>
                      <Link
                        to={`/destinations/${slug}`}
                        className="flex items-baseline justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/50 transition-colors"
                      >
                        <span>
                          <span className="text-foreground">{city.name}</span>
                          <span className="text-muted-foreground">, {city.country}</span>
                        </span>
                        <span className="font-mono text-xs text-muted-foreground shrink-0">${city.costUSD}/mo</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
