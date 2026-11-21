import { Link } from '@/i18n/Link';
import { Helmet } from 'react-helmet-async';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { formatDate } from '@/i18n/format';
import { rich } from '@/i18n/rich';
import { LocaleLinks, canonicalUrl } from '@/i18n/seo';

const BASE_URL = 'https://www.digitalnomadspin.com';

/** Month these terms were last revised. Keep in step with src/lib/staticPagesPrerender.ts. */
const UPDATED = '2026-11-01';

export default function TermsOfUse() {
  const t = useT();
  const locale = useLocale();
  const PAGE_URL = canonicalUrl('/terms-of-use', locale);
  const TITLE = t('legal.terms.title');
  const DESCRIPTION = t('legal.terms.description');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: TITLE,
    url: PAGE_URL,
    description: DESCRIPTION,
  };
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
      <LocaleLinks enPath="/terms-of-use" />

      <div className="dns-container py-12 md:py-20">
        <div className="max-w-3xl">
        <p className="dns-eyebrow">{t('legal.eyebrow')}</p>
        <h1 className="mb-10 mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">
          {t('legal.terms.h1')}
        </h1>

        <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            {rich(t('legal.lastUpdated', { date: formatDate(UPDATED, locale, { year: 'numeric', month: 'long' }) }), {
              b: (children) => <strong className="text-foreground">{children}</strong>,
            })}
          </p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">{t('legal.terms.s1.title')}</h2>
          <p>{t('legal.terms.s1.body')}</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">{t('legal.terms.s2.title')}</h2>
          <p>{t('legal.terms.s2.body')}</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">{t('legal.terms.s3.title')}</h2>
          <p>{t('legal.terms.s3.body')}</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">{t('legal.terms.s4.title')}</h2>
          <p>{t('legal.terms.s4.body')}</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">{t('legal.terms.s5.title')}</h2>
          <p>{t('legal.terms.s5.body')}</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">{t('legal.terms.s6.title')}</h2>
          <p>{t('legal.terms.s6.body')}</p>

          <h2 className="border-t border-border pt-8 text-2xl text-foreground">{t('legal.terms.s7.title')}</h2>
          <p>
            {rich(t('legal.terms.s7.body'), {
              link: (children) => (
                <Link to="/contact" className="text-primary/70 hover:text-primary transition-colors">{children}</Link>
              ),
            })}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
