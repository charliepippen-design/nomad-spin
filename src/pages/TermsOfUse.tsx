import { Link } from '@/i18n/Link';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://www.digitalnomadspin.com';
const PAGE_URL = `${BASE_URL}/terms-of-use`;
const TITLE = 'Terms of Use | Nomad Spin';
const DESCRIPTION = 'Nomad Spin terms of use. Rules and conditions for using the service.';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: TITLE,
  url: PAGE_URL,
  description: DESCRIPTION,
};

export default function TermsOfUse() {
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
        <div className="max-w-3xl">
        <p className="dns-eyebrow">Legal</p>
        <h1 className="mb-10 mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">
          Terms of Use
        </h1>

        <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
          <p><strong className="text-foreground">Last updated:</strong> November 2026</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">1. Acceptance</h2>
          <p>By using Nomad Spin, you agree to these terms. If you do not agree, please do not use the service.</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">2. Service Description</h2>
          <p>Nomad Spin is a travel discovery tool that provides city recommendations from its own dataset of editorial figures and estimates. Recommendations are for informational purposes only and should not be considered professional travel, legal, or financial advice.</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">3. Data Accuracy</h2>
          <p>While we strive to keep data current, we cannot guarantee the accuracy of all information. Cost of living, visa rules, safety conditions, and other metrics can change. Always verify critical details before making travel plans.</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">4. Affiliate Links</h2>
          <p>Some outbound links are affiliate links. Nomad Spin may earn a commission at no extra cost to you. These links have no input into any score or ranking.</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">5. User Accounts</h2>
          <p>You are responsible for maintaining the security of your account credentials. We reserve the right to suspend accounts that violate these terms.</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">6. Limitation of Liability</h2>
          <p>Nomad Spin is provided "as is" without warranties of any kind. We are not liable for any decisions made based on our recommendations.</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">7. Contact</h2>
          <p>
            Questions? <Link to="/contact" className="text-primary/70 hover:text-primary transition-colors">Contact us</Link>.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
