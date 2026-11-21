import { marked } from 'marked';
import type { Guide } from '@/data/guides';
import { relatedDestinationsHtml, relatedGuidesHtml } from '@/lib/relatedGuides';
import { rewriteSubAreaDestinationHrefs } from '@/lib/subAreaDestinations';
import { DEFAULT_LOCALE, type Locale } from '../i18n/config';
import { getT } from '../i18n/dictionary';
import { formatDate } from '../i18n/format';
import { localizeHref } from '../i18n/paths';

marked.use({ gfm: true, breaks: false });

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export { GUIDES_INDEX_DESCRIPTION, guidesIndexDescription, guidesIndexTitle } from '@/lib/guideJsonLd';

export const TITLE_SUFFIX = ' | Nomad Spin';
/** Hard cap for a guide's short title tag (seo.short_title), suffix included. */
export const SHORT_TITLE_MAX = 60;

/**
 * Appends the site suffix to a headline. A value that already ends with
 * " | Nomad Spin" is returned unchanged, so the suffix is never doubled.
 */
export function guidePageTitle(headline: string): string {
  const trimmed = headline.trim();
  return trimmed.endsWith(TITLE_SUFFIX) ? trimmed : `${trimmed}${TITLE_SUFFIX}`;
}

/**
 * Guide <title>, og:title, twitter:title and the in-app document title.
 * Shared by the article page and the prerender. The H1 always stays `guide.title`.
 *
 * Order of precedence:
 * 1. `shortTitle` (content JSON `seo.short_title`), the short search title:
 *    - already ends with " | Nomad Spin": used exactly as written;
 *    - with the suffix appended it fits in SHORT_TITLE_MAX (60) chars: suffix appended;
 *    - otherwise the field is treated as the full title tag text and used as written.
 *    scripts/sync-content-guides.ts rejects a short title whose rendered tag is over 60.
 * 2. `seoTitle` (content JSON `seo.meta_title`), then `title`, with the suffix appended.
 *
 * Pass the translated guide for another language. The rules and the brand
 * suffix are the same in every language, so `locale` changes nothing today.
 */
export function guideTitleTag(
  guide: Pick<Guide, 'title' | 'seoTitle' | 'shortTitle'>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _locale: Locale = DEFAULT_LOCALE,
): string {
  const short = guide.shortTitle?.trim();
  if (short) {
    const withSuffix = guidePageTitle(short);
    return withSuffix.length <= SHORT_TITLE_MAX ? withSuffix : short;
  }
  return guidePageTitle(guide.seoTitle ?? guide.title);
}

/**
 * Crawlable /guides index. One link per guide from the sitemap list
 * (src/data/guides.ts), with the guide title and its one-line meta description.
 *
 * English: `guidesIndexBodyHtml(guides)`, as before.
 * Another language: `items` are the guides translated into `locale`
 * (localizedGuides(locale)) and `englishGuides` is the full English list. The
 * English guides that have no translation among `items` follow under their own
 * heading, linked to the English articles.
 */
export function guidesIndexBodyHtml(
  items: readonly IndexGuide[],
  locale: Locale = DEFAULT_LOCALE,
  englishGuides: readonly Pick<Guide, 'slug' | 'title' | 'excerpt'>[] = [],
): string {
  const t = getT(locale);
  const list = items
    .map(
      (guide) =>
        `<li><a href="${esc(localizeHref(`/guides/${guide.sourceSlug ?? guide.slug}`, locale))}">${esc(guide.title)}</a><p>${esc(guide.excerpt)}</p></li>`,
    )
    .join('');
  const translated = new Set(items.map((guide) => guide.sourceSlug ?? guide.slug));
  const rest =
    locale === DEFAULT_LOCALE ? [] : englishGuides.filter((guide) => !translated.has(guide.slug));
  const main = list || rest.length === 0 ? `<ul>${list}</ul>` : '';
  const others =
    rest.length > 0
      ? `<h2>${esc(t('guides.index.otherEnglish'))}</h2><ul lang="en">${rest
          .map(
            (guide) =>
              `<li><a href="/guides/${esc(guide.slug)}" hreflang="en">${esc(guide.title)}</a><p>${esc(guide.excerpt)}</p></li>`,
          )
          .join('')}</ul>`
      : '';
  return `<main id="seo-guides"><h1>${esc(t('guides.index.h1'))}</h1>${main}${others}</main>`;
}

type IndexGuide = Pick<Guide, 'slug' | 'title' | 'excerpt'> & { sourceSlug?: string };

/** Internal links written as English paths point to the translated page when it exists. */
function localizeBodyLinks(html: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return html;
  return html.replace(/(<a\b[^>]*?\shref=)(["'])(\/[^"']*)\2/gi, (_match, head: string, quote: string, href: string) => {
    return `${head}${quote}${localizeHref(href.replace(/&amp;/g, '&'), locale).replace(/&/g, '&amp;')}${quote}`;
  });
}

/** Full article HTML for crawlers. Markdown and existing HTML both render. */
export function renderGuideMarkdown(markdown: string): string {
  const parsed = marked.parse(markdown, { async: false });
  if (typeof parsed !== 'string') {
    throw new Error('Guide markdown renderer must stay synchronous');
  }
  return parsed.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

/**
 * English: `guideBodyHtml(guide)`, as before. Another language: pass the
 * translated guide (a LocalizedGuide, with `sourceSlug`) and its `locale`.
 */
export function guideBodyHtml(guide: Guide & { sourceSlug?: string }, locale: Locale = DEFAULT_LOCALE): string {
  const t = getT(locale);
  const body = localizeBodyLinks(renderGuideMarkdown(rewriteSubAreaDestinationHrefs(guide.content)), locale);
  const isoDate = guide.date.split('T')[0] ?? guide.date;
  const published = esc(locale === DEFAULT_LOCALE ? isoDate : formatDate(isoDate, locale));
  const relatedGuides = relatedGuidesHtml(guide.sourceSlug ?? guide.slug, locale);
  const relatedDestinations = relatedDestinationsHtml(guide, locale);
  const home = esc(localizeHref('/', locale));
  const spin = esc(t('guides.article.spin'));

  return `
<main id="seo-guide" style="max-width:42rem;margin:2rem auto;padding:0 1.25rem;font-family:Georgia,'Source Serif 4',serif;font-weight:400;line-height:1.65;color:#1c1917;background:#fff">
  <p><a href="${esc(localizeHref('/guides', locale))}" style="color:#007a52">${esc(t('guides.breadcrumb.guides'))}</a> · <a href="${home}" style="color:#007a52">${spin}</a></p>
  <h1>${esc(guide.title)}</h1>
  <p>${esc(guide.excerpt)}</p>
  <p>${t('guides.article.published', { readTime: esc(guide.readTime), date: published })}</p>
  <article>${body}</article>
  ${relatedGuides}
  ${relatedDestinations}
  <p><a href="${home}" style="color:#007a52">${spin}</a></p>
</main>`;
}
