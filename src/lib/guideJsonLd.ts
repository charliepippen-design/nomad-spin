import type { Guide } from '@/data/guides';

export const SITE_URL = 'https://www.digitalnomadspin.com';
/** /guides meta description, og/twitter description and CollectionPage description. */
export const GUIDES_INDEX_DESCRIPTION =
  'Living guides for Lisbon, Chiang Mai, Bali, Mexico City and Cape Town, plus how to choose your next base, when to go and a Paraguay tax residency guide.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-preview.png`;

type GuideLdInput = Pick<Guide, 'title' | 'excerpt' | 'date' | 'updated'>;

export function guideArticleJsonLd(guide: GuideLdInput, url: string, image: string = DEFAULT_OG_IMAGE) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    url,
    mainEntityOfPage: url,
    image,
    datePublished: guide.date,
    dateModified: guide.updated ?? guide.date,
    description: guide.excerpt,
    author: { '@type': 'Organization', name: 'Nomad Spin', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Nomad Spin', logo: `${SITE_URL}/favicon.svg` },
  };
}

export function guideBreadcrumbJsonLd(guide: Pick<Guide, 'title'>, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: guide.title, item: url },
    ],
  };
}

export function guidesIndexBreadcrumbJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
    ],
  };
}
