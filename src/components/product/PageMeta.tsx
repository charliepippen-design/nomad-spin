import { Helmet } from 'react-helmet-async';
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/socialImage';
import { LOCALE_INFO } from '@/i18n/config';
import { useLocale } from '@/i18n/LocaleProvider';
import { absoluteUrl, alternatesFor } from '@/i18n/paths';

interface PageMetaProps {
  title: string;
  description: string;
  /** English path of the page, e.g. "/compare". The canonical URL is that page in the reader's language. */
  path: string;
  jsonLd?: Record<string, unknown>;
}

/** Title, description, canonical, Open Graph and Twitter tags for a product page. */
export default function PageMeta({ title, description, path, jsonLd }: PageMetaProps) {
  const locale = useLocale();
  const url = absoluteUrl(path, locale);
  const alternates = alternatesFor(path);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {alternates.map((row) => (
        <link key={row.hreflang} rel="alternate" hrefLang={row.hreflang} href={row.href} />
      ))}
      <meta property="og:locale" content={LOCALE_INFO[locale].ogLocale} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={DEFAULT_SOCIAL_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_SOCIAL_IMAGE} />
      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
}
