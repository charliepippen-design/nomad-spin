import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://spin-nomad-quest.lovable.app';
const PAGE_URL = `${BASE_URL}/privacy-policy`;
const TITLE = 'Privacy Policy — Nomad Spin';
const DESCRIPTION = 'Nomad Spin privacy policy — how we handle your data.';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: TITLE,
  url: PAGE_URL,
  description: DESCRIPTION,
};

export default function PrivacyPolicy() {
  return (
    <div className="noise-overlay min-h-screen bg-background">
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

      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <Link to="/" className="inline-block text-[10px] font-mono tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors uppercase mb-12">
          ← Back to Spin
        </Link>

        <h1 className="font-mono text-lg md:text-2xl tracking-[0.15em] text-foreground uppercase mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Last updated:</strong> February 2026</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">1. Information We Collect</h2>
          <p>We collect minimal data to provide the service: your email address (if you sign up), spin preferences, and saved destinations. We use browser geolocation only when you explicitly request it to find your nearest city.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">2. How We Use Your Data</h2>
          <p>Your data is used solely to personalize recommendations, sync your saved spins across devices, and improve the service. We do not sell your data to third parties.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">3. Affiliate Links</h2>
          <p>When you click booking links (accommodation, flights, eSIM, insurance), you may be redirected to third-party sites. These sites have their own privacy policies. We may earn commissions from qualifying bookings at no extra cost to you.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">4. Cookies & Analytics</h2>
          <p>We use minimal analytics to understand usage patterns. No invasive tracking or advertising cookies are used.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">5. Data Security</h2>
          <p>All data is stored securely with encryption at rest and in transit. Authentication is handled via industry-standard protocols.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">6. Contact</h2>
          <p>
            Questions about this policy? <Link to="/contact" className="text-primary/70 hover:text-primary transition-colors">Contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
