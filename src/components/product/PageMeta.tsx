import { Helmet } from 'react-helmet-async';
import { DEFAULT_SOCIAL_IMAGE, SITE_URL } from '@/lib/socialImage';

interface PageMetaProps {
  title: string;
  description: string;
  /** Canonical path, e.g. "/compare". Query strings are never canonical. */
  path: string;
  jsonLd?: Record<string, unknown>;
}

/** Title, description, canonical, Open Graph and Twitter tags for a product page. */
export default function PageMeta({ title, description, path, jsonLd }: PageMetaProps) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
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
