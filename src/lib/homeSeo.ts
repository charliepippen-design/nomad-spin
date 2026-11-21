import type { Guide } from '../data/guides';
import { DEFAULT_LOCALE, type Locale } from '../i18n/config';
import { guideForLocale } from '../i18n/content';
import { getT } from '../i18n/dictionary';
import { localizeHref } from '../i18n/paths';

export const HOME_TITLE = 'Spin the Globe for Your Next Digital Nomad Base | Nomad Spin';
export const HOME_DESCRIPTION =
  'Spin a 3D globe and discover your next digital nomad destination. Compare cost, internet, and safety across 780+ cities.';
export const HOME_H1 = 'Find your next digital nomad base';
export const HOME_INTRO =
  'Not sure where to go next? Spin the 3D globe to discover a city, then compare cost, internet speed and safety across 780+ cities. Open a destination page to see visa length and best months for that place. For a closer look, read our living guides for cities like Lisbon, Chiang Mai, Bali, Mexico City and Cape Town. You can also read our decision framework, How to Choose Your Next Nomad Base.';
export const HOME_GUIDES_LINK = { href: '/guides', label: 'Digital nomad guides' } as const;

/** The constants above in the reader's language. English returns the same text (home.* in src/locales). */
export function homeTitle(locale: Locale = DEFAULT_LOCALE): string {
  return getT(locale)('home.seo.title');
}
export function homeDescription(locale: Locale = DEFAULT_LOCALE): string {
  return getT(locale)('home.seo.description');
}
export function homeH1(locale: Locale = DEFAULT_LOCALE): string {
  return getT(locale)('home.h1');
}
export function homeIntro(locale: Locale = DEFAULT_LOCALE): string {
  return getT(locale)('home.intro');
}
/** `href` stays an English path: the Link component or localizeHref translates it. */
export function homeGuidesLink(locale: Locale = DEFAULT_LOCALE): { href: string; label: string } {
  return { href: HOME_GUIDES_LINK.href, label: getT(locale)('home.guidesLink') };
}

export type HomeGuideLink = Pick<Guide, 'slug' | 'title'>;

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Crawlable home body for the prerender. Mirrors the visible section in Index.tsx.
 * `guides` is always the English list; for another language (already loaded with
 * loadLocale) each title is shown translated when it exists and links are localized.
 */
export function homeBodyHtml(guides: readonly HomeGuideLink[], locale: Locale = DEFAULT_LOCALE): string {
  const link = homeGuidesLink(locale);
  const items = guides
    .map((guide) => {
      const title = guideForLocale(guide as Guide, locale).title;
      return `<li><a href="${esc(localizeHref(`/guides/${guide.slug}`, locale))}">${esc(title)}</a></li>`;
    })
    .join('');
  return `<main id="seo-home"><h1>${esc(homeH1(locale))}</h1><p>${esc(homeIntro(locale))}</p><ul><li><a href="${esc(localizeHref(link.href, locale))}">${esc(link.label)}</a></li>${items}</ul></main>`;
}
