import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import dnsLogo from '@/assets/dns-logo.png';
import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { to: '/', label: 'Spin', end: true },
  { to: '/guides', label: 'Guides', end: false },
  { to: '/destinations', label: 'Destinations', end: false },
  { to: '/about', label: 'About', end: true },
] as const;

function linkClass(isActive: boolean): string {
  return `text-sm font-medium transition-colors ${
    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
  }`;
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-[80] border-b border-border/60 bg-background/85 backdrop-blur-md pointer-events-auto">
      <div className="flex items-center justify-between gap-3 px-4 h-14">
        <div className="flex items-center gap-5 min-w-0">
          <NavLink to="/" end className="shrink-0" aria-label="Nomad Spin home">
            <img src={dnsLogo} alt="Digital Nomad Spin" className="h-8 md:h-10 w-auto" />
          </NavLink>
          <nav className="hidden lg:flex items-center gap-5" aria-label="Site">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => linkClass(isActive)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg border border-border bg-background text-foreground"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1" aria-label="Site">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `rounded-lg px-3 py-3 ${linkClass(isActive)} ${isActive ? 'bg-primary/10' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
