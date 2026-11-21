import { Link } from '@/i18n/Link';
import { useT } from '@/i18n/LocaleProvider';
import type { TKey } from '@/i18n/dictionary';
import { openConsentBanner } from '@/lib/consent';
import dnsLogo from '@/assets/dns-logo.png';

const columns: { title: TKey; links: { to: string; label: TKey }[] }[] = [
  {
    title: 'common.footer.product',
    links: [
      { to: '/', label: 'common.footer.exploreGlobe' },
      { to: '/compare', label: 'common.nav.compare' },
      { to: '/find-your-base', label: 'common.nav.findYourBase' },
      { to: '/destinations', label: 'common.nav.destinations' },
    ],
  },
  {
    title: 'common.footer.read',
    links: [
      { to: '/guides', label: 'common.footer.guidesArticles' },
      { to: '/methodology', label: 'common.footer.methodology' },
      { to: '/about', label: 'common.nav.about' },
      { to: '/contact', label: 'common.footer.contact' },
    ],
  },
  {
    title: 'common.footer.legal',
    links: [
      { to: '/privacy-policy', label: 'common.footer.privacy' },
      { to: '/terms-of-use', label: 'common.footer.terms' },
    ],
  },
];

export default function Footer() {
  const t = useT();
  return (
    <footer className="relative z-10 pointer-events-auto w-full border-t border-border bg-background">
      <div className="dns-container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand */}
          <div>
            <Link to="/" aria-label={t('common.nav.homeAria')} className="inline-block">
              <img src={dnsLogo} alt="Digital Nomad Spin" className="h-10 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs font-display text-xl font-bold leading-snug tracking-tight text-foreground">
              {t('common.footer.tagline')}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t('common.footer.subtitle')}</p>
          </div>

          {/* Link columns */}
          {columns.map((column) => (
            <nav key={column.title} aria-label={t(column.title)}>
              <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-foreground">{t(column.title)}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {t(link.label)}
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
            <span className="font-semibold text-foreground">{t('common.footer.disclosureLabel')}</span>{' '}
            {t('common.footer.disclosureText')}
          </p>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          {t('common.footer.rights', { year: new Date().getFullYear() })}{' '}
          <button type="button" onClick={openConsentBanner} className="underline underline-offset-4 hover:text-foreground">
            {t('common.footer.cookieSettings')}
          </button>
        </p>
      </div>
    </footer>
  );
}
