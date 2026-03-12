import { Link } from 'react-router-dom';
import { Twitter, Instagram, Github, Coffee } from 'lucide-react';

const navLinks = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms-of-use', label: 'Terms of Use' },
];

const socialLinks = [
  { href: 'https://twitter.com/nomadspin', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com/nomadspin', icon: Instagram, label: 'Instagram' },
  { href: 'https://github.com/nomadspin', icon: Github, label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="relative z-10 pointer-events-auto w-full border-t border-border/30 bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-8">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs tracking-[0.25em] text-foreground/80 uppercase font-medium">
              NOMAD SPIN
            </span>
            <span className="text-[11px] text-muted-foreground">
              Travel discovery for digital nomads.
            </span>
          </div>

          {/* Nav — stacked on mobile */}
          <nav className="flex flex-col md:flex-row md:flex-wrap gap-y-3 gap-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm md:text-[11px] font-mono tracking-wider text-muted-foreground hover:text-foreground transition-colors uppercase py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Socials — bigger tap targets on mobile */}
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="p-3 md:p-2 rounded-lg border border-border/30 bg-muted/10 hover:bg-muted/20 transition-colors text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <s.icon className="w-4 h-4 md:w-3.5 md:h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Buy Me a Coffee */}
        <a
          href="https://buymeacoffee.com/nomadspin"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] hover:border-amber-500/50 transition-all group"
        >
          <Coffee className="w-4 h-4 text-amber-400/70 group-hover:text-amber-400 transition-colors" />
          <span className="text-[11px] font-mono tracking-[0.2em] text-amber-400/70 group-hover:text-amber-400 transition-colors uppercase">
            Buy me a coffee — support this project
          </span>
        </a>

        {/* Affiliate Disclosure */}
        <div className="rounded-lg border border-border/20 bg-muted/5 px-4 py-3">
          <p className="text-[10px] font-mono text-muted-foreground/60 leading-relaxed tracking-wide">
            <span className="text-muted-foreground/80 uppercase tracking-[0.15em]">Affiliate Disclosure:</span>{' '}
            I may earn a commission from qualifying bookings at no extra cost to you. This helps keep the tool free and the data updated.
          </p>
        </div>

        {/* Copyright */}
        <p className="text-[10px] font-mono text-muted-foreground/40 text-center tracking-wider pt-2 md:pt-0">
          © {new Date().getFullYear()} Nomad Spin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
