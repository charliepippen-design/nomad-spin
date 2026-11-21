import type { Guide } from '@/data/guides';
import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from '../i18n/config';
import { getT } from '../i18n/dictionary';
import { absoluteUrl } from '../i18n/paths';

export const SITE_URL = 'https://www.digitalnomadspin.com';
/** /guides meta description, og/twitter description and CollectionPage description. */
export const GUIDES_INDEX_DESCRIPTION =
  'Living guides for Lisbon, Chiang Mai, Bali, Mexico City and Cape Town, plus how to choose your next base, when to go and a Paraguay tax residency guide.';

/** /guides <title>, og/twitter title and CollectionPage name in `locale`. */
export function guidesIndexTitle(locale: Locale = DEFAULT_LOCALE): string {
  return getT(locale)('guides.index.title');
}

/** GUIDES_INDEX_DESCRIPTION in `locale`. */
export function guidesIndexDescription(locale: Locale = DEFAULT_LOCALE): string {
  return locale === DEFAULT_LOCALE ? GUIDES_INDEX_DESCRIPTION : getT(locale)('guides.index.description');
}

/** `inLanguage` for structured data. English keeps the JSON-LD it always had. */
function languageOf(locale: Locale): { inLanguage?: string } {
  return locale === DEFAULT_LOCALE ? {} : { inLanguage: LOCALE_INFO[locale].htmlLang };
}

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-preview.png`;

type GuideLdInput = Pick<Guide, 'title' | 'excerpt' | 'date' | 'updated'>;

export function guideArticleJsonLd(
  guide: GuideLdInput,
  url: string,
  image: string = DEFAULT_OG_IMAGE,
  locale: Locale = DEFAULT_LOCALE,
) {
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
    ...languageOf(locale),
  };
}

export function guideBreadcrumbJsonLd(guide: Pick<Guide, 'title'>, url: string, locale: Locale = DEFAULT_LOCALE) {
  const t = getT(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('guides.breadcrumb.home'), item: absoluteUrl('/', locale) },
      { '@type': 'ListItem', position: 2, name: t('guides.breadcrumb.guides'), item: absoluteUrl('/guides', locale) },
      { '@type': 'ListItem', position: 3, name: guide.title, item: url },
    ],
  };
}

export function guidesIndexBreadcrumbJsonLd(locale: Locale = DEFAULT_LOCALE) {
  const t = getT(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('guides.breadcrumb.home'), item: absoluteUrl('/', locale) },
      { '@type': 'ListItem', position: 2, name: t('guides.breadcrumb.guides'), item: absoluteUrl('/guides', locale) },
    ],
  };
}
