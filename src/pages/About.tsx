import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Globe2, BarChart3, Heart } from 'lucide-react';

const BASE_URL = 'https://www.digitalnomadspin.com';
const PAGE_URL = `${BASE_URL}/about`;
const TITLE = 'About | Nomad Spin';
const DESCRIPTION = 'Learn about Nomad Spin, a travel discovery tool helping digital nomads find their next base with data-driven city recommendations.';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: TITLE,
  url: PAGE_URL,
  description: DESCRIPTION,
  mainEntity: {
    '@type': 'Organization',
    name: 'Nomad Spin',
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    description: 'Travel discovery tool for digital nomads and remote workers.',
  },
};

export default function About() {
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

      <div className="dns-container py-12 md:py-20">
        <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <p className="dns-eyebrow">About</p>
          <h1 className="mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">
            About Nomad Spin
          </h1>
        </div>

        <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          <p>
            Nomad Spin is a travel discovery tool built for digital nomads, remote workers, and long-term travelers. We help you cut through decision paralysis and find your next destination based on what actually matters: cost of living, internet speed, safety, and vibe.
          </p>
          <p>
            Our database covers <strong className="text-foreground">780+ cities worldwide</strong> with figures on budgets, internet, safety, visa rules, coworking density, and more. Some of those records are estimates, and every page says which. Each city is scored against your own preferences.
          </p>
        </div>

        </div>

        {/* Values */}
        <div className="mt-14 grid grid-cols-1 gap-5 border-t border-border pt-10 md:mt-20 md:grid-cols-3">
          {[
            { icon: Globe2, title: 'Discovery First', desc: 'We prioritize serendipity. Spin the globe and let the data surprise you.' },
            { icon: BarChart3, title: 'Numbers, not ads', desc: 'Scores and rankings use the city figures and your preferences. Partner links have no input.' },
            { icon: Heart, title: 'Honest about gaps', desc: 'Estimates are tagged, missing figures say "No data", and the methodology page lists what we do not know yet.' },
          ].map((v) => (
            <div key={v.title} className="dns-card flex flex-col gap-3 p-6">
              <v.icon className="h-5 w-5 text-primary" />
              <h2 className="text-xl text-foreground">{v.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            Have feedback or a city suggestion?{' '}
            <Link to="/contact" className="font-semibold text-primary hover:underline">Get in touch</Link>.
          </p>
          <Link to="/methodology" className="text-sm font-semibold text-primary hover:underline">
            How our data is built
          </Link>
        </div>
      </div>
    </div>
  );
}
