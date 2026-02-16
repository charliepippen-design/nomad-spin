import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function GuideArticle() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="noise-overlay min-h-screen bg-background">
      <Helmet>
        <title>{slug ? `${slug.replace(/-/g, ' ')} — Nomad Spin Guides` : 'Guides — Nomad Spin'}</title>
        <meta name="description" content="Nomad Spin travel guides — coming soon." />
      </Helmet>

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        <Link to="/" className="self-start text-[10px] font-mono tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors uppercase mb-16">
          <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Spin
        </Link>

        <div className="rounded-full w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Sparkles className="w-6 h-6 text-primary/60" />
        </div>

        <h1 className="font-mono text-lg tracking-[0.15em] text-foreground uppercase mb-4">
          Coming Soon
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-8">
          We're working on in-depth travel guides for digital nomads. Check back soon for neighborhood breakdowns, coworking tips, and cost-of-living deep dives.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary/10 border border-primary/30 text-xs font-mono tracking-wider text-primary hover:bg-primary/20 transition-colors uppercase"
        >
          Spin for a new city
        </Link>
      </div>
    </div>
  );
}
