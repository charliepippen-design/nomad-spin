import { Link } from '@/i18n/Link';
import { openConsentBanner } from '@/lib/consent';
import dnsLogo from '@/assets/dns-logo.png';

const columns: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { to: '/', label: 'Explore the globe' },
      { to: '/compare', label: 'Compare' },
      { to: '/find-your-base', label: 'Find Your Base' },
      { to: '/destinations', label: 'Destinations' },
    ],
  },
  {
    title: 'Read',
    links: [
      { to: '/guides', label: 'Guides & Articles' },
      { to: '/methodology', label: 'Methodology' },
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { to: '/privacy-policy', label: 'Privacy Policy' },
      { to: '/terms-of-use', label: 'Terms of Use' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative z-10 pointer-events-auto w-full border-t border-border bg-background">
      <div className="dns-container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand */}
          <div>
            <Link to="/" aria-label="Nomad Spin home" className="inline-block">
              <img src={dnsLogo} alt="Digital Nomad Spin" className="h-10 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs font-display text-xl font-bold leading-snug tracking-tight text-foreground">
              Your next base. Better decided.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Travel discovery for digital nomads.</p>
          </div>

          {/* Link columns */}
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-foreground">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          {/* Affiliate Disclosure */}
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Affiliate disclosure:</span>{' '}
            Some outbound links are affiliate links. Nomad Spin may earn a commission at no extra cost to you.
          </p>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nomad Spin. All rights reserved.{' '}
          <button type="button" onClick={openConsentBanner} className="underline underline-offset-4 hover:text-foreground">
            Cookie settings
          </button>
        </p>
      </div>
    </footer>
  );
}
