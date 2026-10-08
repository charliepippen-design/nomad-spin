import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Clock, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useGuides } from '@/hooks/useGuides';
import { indexGuides } from '@/data/guides';

const BASE_URL = 'https://www.digitalnomadspin.com';
const PAGE_URL = `${BASE_URL}/guides`;
const TITLE = 'Guides & Articles | Nomad Spin';
const DESCRIPTION = 'In-depth guides, tax residency breakdowns, and digital nomad strategies.';

export default function GuidesList() {
  const { data: liveGuides, isLoading, isError } = useGuides();

  // Same published list as the sitemap. Live rows can refresh those slugs only.
  const mergedGuides = indexGuides(liveGuides);

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
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header section */}
        <div className="flex flex-col gap-6 mb-16">
          <div>
            <div className="rounded-full w-12 h-12 bg-primary/10 border border-primary/20 flex flex-shrink-0 items-center justify-center mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl text-foreground mb-3">
              Guides and articles
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              No fluff. No discovery calls. Just the actual mechanics of moving, living, and optimizing taxes as a remote worker.
            </p>
          </div>
        </div>

        {/* Spinner only when there is nothing cached to show. */}
        {isLoading && mergedGuides.length === 0 && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading guides…
          </div>
        )}

        {/* Error state, still shows static guides below */}
        {isError && (
          <div className="flex items-center gap-2 text-sm text-foreground mb-6 border border-border bg-muted/50 rounded-lg px-4 py-3">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Could not reach the live guide database. Showing cached content.
          </div>
        )}

        {/* Guides Grid. Static guides stay visible while the live query is in flight. */}
        {mergedGuides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mergedGuides.map((guide) => (
              <Link 
                key={guide.id} 
                to={`/guides/${guide.slug}`}
                className="group block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col h-full"
              >
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(`${(guide.updated ?? guide.date).slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {guide.readTime}</span>
                  </div>
                  
                  <h2 className="text-xl text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
                    {guide.title}
                  </h2>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
                    {guide.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
