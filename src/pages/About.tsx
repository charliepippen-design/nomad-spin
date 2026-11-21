import { Link } from '@/i18n/Link';
import { Helmet } from 'react-helmet-async';
import { Globe2, BarChart3, Heart } from 'lucide-react';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { rich } from '@/i18n/rich';
import { LocaleLinks, canonicalUrl } from '@/i18n/seo';

const BASE_URL = 'https://www.digitalnomadspin.com';

const VALUES = [
  { icon: Globe2, key: 'discovery' },
  { icon: BarChart3, key: 'numbers' },
  { icon: Heart, key: 'gaps' },
] as const;

export default function About() {
  const t = useT();
  const locale = useLocale();
  const PAGE_URL = canonicalUrl('/about', locale);
  const TITLE = t('static.about.title');
  const DESCRIPTION = t('static.about.description');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: TITLE,
    url: PAGE_URL,
    description: DESCRIPTION,
    mainEntity: {
      '@type': 'Organization',
      name: 'Nomad Spin',
      url: BASE_URL,
      logo: `${BASE_URL}/favicon.svg`,
      description: t('static.about.orgDescription'),
    },
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
      <LocaleLinks enPath="/about" />

      <div className="dns-container py-12 md:py-20">
        <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <p className="dns-eyebrow">{t('static.about.eyebrow')}</p>
          <h1 className="mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">
            {t('static.about.h1')}
          </h1>
        </div>

        <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          <p>
            {t('static.about.intro')}
          </p>
          <p>
            {rich(t('static.about.database'), { b: (children) => <strong className="text-foreground">{children}</strong> })}
          </p>
        </div>

        </div>

        {/* Values */}
        <div className="mt-14 grid grid-cols-1 gap-5 border-t border-border pt-10 md:mt-20 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.key} className="dns-card flex flex-col gap-3 p-6">
              <v.icon className="h-5 w-5 text-primary" />
              <h2 className="text-xl text-foreground">{t(`static.about.value.${v.key}.title`)}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(`static.about.value.${v.key}.desc`)}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            {rich(t('static.about.feedback'), {
              link: (children) => (
                <Link to="/contact" className="font-semibold text-primary hover:underline">{children}</Link>
              ),
            })}
          </p>
          <Link to="/methodology" className="text-sm font-semibold text-primary hover:underline">
            {t('static.about.methodologyLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
