import { Link } from 'react-router-dom';
import { Twitter, Instagram, Github } from 'lucide-react';

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

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[11px] font-mono tracking-wider text-muted-foreground hover:text-foreground transition-colors uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="p-2 rounded-lg border border-border/30 bg-white/[0.02] hover:bg-white/[0.06] transition-colors text-muted-foreground hover:text-foreground"
              >
                <s.icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div className="rounded-lg border border-border/20 bg-white/[0.01] px-4 py-3">
          <p className="text-[10px] font-mono text-muted-foreground/60 leading-relaxed tracking-wide">
            <span className="text-muted-foreground/80 uppercase tracking-[0.15em]">Affiliate Disclosure:</span>{' '}
            I may earn a commission from qualifying bookings at no extra cost to you. This helps keep the tool free and the data updated.
          </p>
        </div>

        {/* Copyright */}
        <p className="text-[10px] font-mono text-muted-foreground/40 text-center tracking-wider">
          © {new Date().getFullYear()} Nomad Spin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
