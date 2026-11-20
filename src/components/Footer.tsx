import { Link } from 'react-router-dom';
import { Twitter, Instagram, Github, Coffee } from 'lucide-react';
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

const socialLinks = [
  { href: 'https://twitter.com/nomadspin', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com/nomadspin', icon: Instagram, label: 'Instagram' },
  { href: 'https://github.com/nomadspin', icon: Github, label: 'GitHub' },
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
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground md:h-9 md:w-9"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
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

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-start md:justify-between">
          {/* Affiliate Disclosure */}
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Affiliate Disclosure:</span>{' '}
            I may earn a commission from qualifying bookings at no extra cost to you. This helps keep the tool free and the data updated.
          </p>
          <a
            href="https://buymeacoffee.com/digitalnomadspin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Coffee className="h-4 w-4" />
            Buy me a coffee. Support this project
          </a>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Nomad Spin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
