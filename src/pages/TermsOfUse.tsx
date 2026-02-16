import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function TermsOfUse() {
  return (
    <div className="noise-overlay min-h-screen bg-background">
      <Helmet>
        <title>Terms of Use — Nomad Spin</title>
        <meta name="description" content="Nomad Spin terms of use — rules and conditions for using the service." />
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
