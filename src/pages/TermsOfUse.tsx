import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://www.digitalnomadspin.com';
const PAGE_URL = `${BASE_URL}/terms-of-use`;
const TITLE = 'Terms of Use — Nomad Spin';
const DESCRIPTION = 'Nomad Spin terms of use — rules and conditions for using the service.';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: TITLE,
  url: PAGE_URL,
  description: DESCRIPTION,
};

export default function TermsOfUse() {
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
          Terms of Use
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Last updated:</strong> February 2026</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">1. Acceptance</h2>
          <p>By using Nomad Spin, you agree to these terms. If you do not agree, please do not use the service.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">2. Service Description</h2>
          <p>Nomad Spin is a travel discovery tool that provides city recommendations based on publicly available data. Recommendations are for informational purposes only and should not be considered professional travel, legal, or financial advice.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">3. Data Accuracy</h2>
          <p>While we strive to keep data current, we cannot guarantee the accuracy of all information. Cost of living, visa rules, safety conditions, and other metrics can change. Always verify critical details before making travel plans.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">4. Affiliate Links</h2>
          <p>Nomad Spin contains affiliate links to third-party services. We may earn commissions from qualifying bookings. These links do not affect the objectivity of our recommendations.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">5. User Accounts</h2>
          <p>You are responsible for maintaining the security of your account credentials. We reserve the right to suspend accounts that violate these terms.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">6. Limitation of Liability</h2>
          <p>Nomad Spin is provided "as is" without warranties of any kind. We are not liable for any decisions made based on our recommendations.</p>

          <h2 className="font-mono text-xs tracking-[0.15em] text-foreground uppercase pt-4">7. Contact</h2>
          <p>
            Questions? <Link to="/contact" className="text-primary/70 hover:text-primary transition-colors">Contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
