import { Link } from '@/i18n/Link';
import PageMeta from '@/components/product/PageMeta';
import { openConsentBanner } from '@/lib/consent';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { formatDate } from '@/i18n/format';
import { canonicalUrl } from '@/i18n/seo';
import { rich } from '@/i18n/rich';

/** Month this policy was last revised. Keep in step with src/lib/staticPagesPrerender.ts. */
const UPDATED = '2026-11-01';

const H2 = 'border-t border-border pt-8 text-2xl text-foreground';

/**
 * Third-party tools, in the order a visitor meets them. Keep in step with index.html and main.tsx.
 * Names are product names and stay as they are; the rest is legal.privacy.tool.<key>.*.
 */
const TOOLS = [
  { name: 'Vercel Web Analytics', key: 'vercel' },
  { name: 'Google Tag Manager', key: 'gtm' },
  { name: 'Google Analytics 4', key: 'ga4' },
  { name: 'Impact', key: 'impact' },
] as const;

export default function PrivacyPolicy() {
  const t = useT();
  const locale = useLocale();
  const title = t('legal.privacy.title');
  const description = t('legal.privacy.description');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: canonicalUrl('/privacy-policy', locale),
    description,
  };

  return (
    <div className="page-content min-h-screen bg-background">
      <PageMeta title={title} description={description} path="/privacy-policy" jsonLd={jsonLd} />

      <div className="dns-container py-12 md:py-20">
        <div className="max-w-3xl">
          <p className="dns-eyebrow">{t('legal.eyebrow')}</p>
          <h1 className="mb-10 mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">{t('legal.privacy.h1')}</h1>

          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              {rich(t('legal.lastUpdated', { date: formatDate(UPDATED, locale, { year: 'numeric', month: 'long' }) }), {
                b: (children) => <strong className="text-foreground">{children}</strong>,
              })}
            </p>

            <h2 className={H2}>{t('legal.privacy.s1.title')}</h2>
            <p>{t('legal.privacy.s1.body')}</p>

            <h2 className={H2}>{t('legal.privacy.s2.title')}</h2>
            <p>{t('legal.privacy.s2.body')}</p>

            <h2 className={H2}>{t('legal.privacy.s3.title')}</h2>
            <p>{t('legal.privacy.s3.intro')}</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th scope="col" className="py-2 pr-4 font-semibold">{t('legal.privacy.table.tool')}</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">{t('legal.privacy.table.job')}</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">{t('legal.privacy.table.cookies')}</th>
                    <th scope="col" className="py-2 font-semibold">{t('legal.privacy.table.when')}</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOLS.map((tool) => (
                    <tr key={tool.name} className="border-b border-border align-top">
                      <th scope="row" className="py-3 pr-4 font-semibold text-foreground">{tool.name}</th>
                      <td className="py-3 pr-4">{t(`legal.privacy.tool.${tool.key}.job`)}</td>
                      <td className="py-3 pr-4">{t(`legal.privacy.tool.${tool.key}.cookies`)}</td>
                      <td className="py-3">{t(`legal.privacy.tool.${tool.key}.when`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              <button
                type="button"
                onClick={openConsentBanner}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {t('legal.privacy.changeChoice')}
              </button>
            </p>

            <h2 className={H2}>{t('legal.privacy.s4.title')}</h2>
            <p>{t('legal.privacy.s4.body')}</p>

            <h2 className={H2}>{t('legal.privacy.s5.title')}</h2>
            <p>{t('legal.privacy.s5.body')}</p>

            <h2 className={H2}>{t('legal.privacy.s6.title')}</h2>
            <p>{t('legal.privacy.s6.body')}</p>

            <h2 className={H2}>{t('legal.privacy.s7.title')}</h2>
            <p>{t('legal.privacy.s7.body')}</p>

            <h2 className={H2}>{t('legal.privacy.s8.title')}</h2>
            <p>
              {rich(t('legal.privacy.s8.body'), {
                link: (children) => (
                  <Link to="/contact" className="font-semibold text-primary hover:underline">
                    {children}
                  </Link>
                ),
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
