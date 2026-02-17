import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Globe2, BarChart3, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="noise-overlay min-h-screen bg-background">
      <Helmet>
        <title>About — Nomad Spin</title>
        <meta name="description" content="Learn about Nomad Spin — a travel discovery tool helping digital nomads find their next base with data-driven city recommendations." />
      </Helmet>

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Back link */}
        <Link to="/" className="inline-block text-[10px] font-mono tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors uppercase mb-12">
          ← Back to Spin
        </Link>

        <h1 className="font-mono text-lg md:text-2xl tracking-[0.15em] text-foreground uppercase mb-8">
          About Nomad Spin
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p>
            Nomad Spin is a travel discovery tool built for digital nomads, remote workers, and long-term travelers. We help you cut through decision paralysis and find your next destination based on what actually matters — cost of living, internet speed, safety, and vibe.
          </p>
          <p>
            Our database covers <strong className="text-foreground">1,200+ cities worldwide</strong> with curated data on budgets, Wi-Fi reliability, visa requirements, coworking density, and more. Each city is scored against your personal preferences to surface the best matches.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          {[
            { icon: Globe2, title: 'Discovery First', desc: 'We prioritize serendipity. Spin the globe and let the data surprise you.' },
            { icon: BarChart3, title: 'Data-Driven', desc: 'Every recommendation is backed by real metrics, not sponsored placements.' },
            { icon: Heart, title: 'By Nomads, For Nomads', desc: 'Built by people who\'ve lived the lifestyle and know what matters on the ground.' },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border border-border/30 bg-card p-5 flex flex-col gap-3">
              <v.icon className="w-5 h-5 text-foreground/60" />
              <h3 className="font-mono text-xs tracking-wider text-foreground uppercase">{v.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/20">
          <p className="text-xs text-muted-foreground/60">
            Have feedback or a city suggestion?{' '}
            <Link to="/contact" className="text-primary/70 hover:text-primary transition-colors">Get in touch</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
