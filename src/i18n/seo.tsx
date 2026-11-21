import { Helmet } from 'react-helmet-async';
import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from './config';
import { useLocale } from './LocaleProvider';
import { absoluteUrl, alternatesFor } from './paths';

/**
 * Canonical URL of a page in the reader's language.
 * `enPath` is the English path of the page ("/about").
 */
export function canonicalUrl(enPath: string, locale: Locale = DEFAULT_LOCALE): string {
  return absoluteUrl(enPath, locale);
}

/**
 * hreflang links and og:locale for a page. Add next to a page's own <Helmet>
 * when it does not use <SEO> or <PageMeta> (those already include it).
 * Renders no hreflang when the page exists in English only.
 */
export function LocaleLinks({ enPath }: { enPath: string }) {
  const locale = useLocale();
  const alternates = alternatesFor(enPath);
  return (
    <Helmet>
      <meta property="og:locale" content={LOCALE_INFO[locale].ogLocale} />
      {alternates.map((row) => (
        <link key={row.hreflang} rel="alternate" hrefLang={row.hreflang} href={row.href} />
      ))}
    </Helmet>
  );
}
