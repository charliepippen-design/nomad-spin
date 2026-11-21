import manifestJson from '../locales/manifest.generated.json';
import {
  DEFAULT_LOCALE,
  PUBLISHED_LOCALES,
  SEGMENTS,
  SITE_ORIGIN,
  STATIC_SEGMENTS,
  isLocale,
  isPublished,
  LOCALE_INFO,
  type Locale,
  type StaticSegment,
} from './config';

/**
 * URL mapping between English and the other languages.
 *
 * The app always thinks in English paths ("/destinations/lisbon"). This file
 * turns one into the URL of another language, but only when that page has
 * really been translated. No translation means no URL: callers fall back to
 * the English page instead of a half-translated copy.
 */

interface LocaleManifest {
  /** City slugs with a published translation. */
  cities: string[];
  /** English guide slug -> slug in this language. */
  guides: Record<string, string>;
}

const manifest = manifestJson as Partial<Record<Locale, LocaleManifest>>;

function manifestFor(locale: Locale): LocaleManifest {
  return manifest[locale] ?? { cities: [], guides: {} };
}

const citySets = new Map<Locale, Set<string>>();
function citySet(locale: Locale): Set<string> {
  let set = citySets.get(locale);
  if (!set) {
    set = new Set(manifestFor(locale).cities);
    citySets.set(locale, set);
  }
  return set;
}

const reverseGuides = new Map<Locale, Map<string, string>>();
function guideReverse(locale: Locale): Map<string, string> {
  let map = reverseGuides.get(locale);
  if (!map) {
    map = new Map(Object.entries(manifestFor(locale).guides).map(([en, local]) => [local, en]));
    reverseGuides.set(locale, map);
  }
  return map;
}

function splitSuffix(path: string): [string, string] {
  const i = path.search(/[?#]/);
  return i === -1 ? [path, ''] : [path.slice(0, i), path.slice(i)];
}

function segmentsOf(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}

/** True when the city page has a published translation in `locale`. */
export function hasCityTranslation(citySlug: string, locale: Locale): boolean {
  return locale === DEFAULT_LOCALE || (isPublished(locale) && citySet(locale).has(citySlug));
}

/** Slug of a guide in `locale`, or null when it has not been translated. */
export function localizedGuideSlug(enSlug: string, locale: Locale): string | null {
  if (locale === DEFAULT_LOCALE) return enSlug;
  if (!isPublished(locale)) return null;
  return manifestFor(locale).guides[enSlug] ?? null;
}

/** English slug behind a localized guide slug, or null when unknown. */
export function englishGuideSlug(localSlug: string, locale: Locale): string | null {
  if (locale === DEFAULT_LOCALE) return localSlug;
  return guideReverse(locale).get(localSlug) ?? null;
}

/**
 * URL of an English path in `locale`, query string and hash kept.
 * Returns null when the page does not exist in that language.
 */
export function localizePath(enPath: string, locale: Locale): string | null {
  if (locale === DEFAULT_LOCALE) return enPath;
  if (!isPublished(locale)) return null;
  const [pathname, suffix] = splitSuffix(enPath);
  const segs = segmentsOf(pathname);
  if (segs.length === 0) return `/${locale}${suffix}`;
  const first = segs[0] as StaticSegment;
  const mapped = SEGMENTS[locale as Exclude<Locale, 'en'>][first];
  if (!mapped) return null;
  if (segs.length === 1) return `/${locale}/${mapped}${suffix}`;
  if (segs.length === 2 && first === 'destinations') {
    return hasCityTranslation(segs[1], locale) ? `/${locale}/${mapped}/${segs[1]}${suffix}` : null;
  }
  if (segs.length === 2 && first === 'guides') {
    const slug = localizedGuideSlug(segs[1], locale);
    return slug ? `/${locale}/${mapped}/${slug}${suffix}` : null;
  }
  return null;
}

export function hasTranslation(enPath: string, locale: Locale): boolean {
  return localizePath(enPath, locale) !== null;
}

export interface ParsedPath {
  locale: Locale;
  /** The same page as an English path. Not guaranteed to exist. */
  enPath: string;
}

/** Language and English path of any URL of the site (query string and hash kept). */
export function parsePath(path: string): ParsedPath {
  const [pathname, suffix] = splitSuffix(path);
  const segs = segmentsOf(pathname);
  const head = segs[0];
  if (!isLocale(head) || head === DEFAULT_LOCALE || !isPublished(head)) {
    return { locale: DEFAULT_LOCALE, enPath: path };
  }
  const locale = head;
  const rest = segs.slice(1);
  if (rest.length === 0) return { locale, enPath: `/${suffix}` };
  const table = SEGMENTS[locale as Exclude<Locale, 'en'>];
  // Localized segment, or the English one typed under the prefix (/it/destinations/...).
  const first =
    STATIC_SEGMENTS.find((seg) => table[seg] === rest[0]) ?? STATIC_SEGMENTS.find((seg) => seg === rest[0]) ?? rest[0];
  const tail = rest.slice(1);
  if (first === 'guides' && tail.length === 1) {
    tail[0] = englishGuideSlug(tail[0], locale) ?? tail[0];
  }
  return { locale, enPath: `/${[first, ...tail].join('/')}${suffix}` };
}

/**
 * Where a link written as an English path should point for a reader in `locale`:
 * the translated page when there is one, otherwise the English page.
 * External links, anchors and already-localized paths are returned untouched.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith('/') || href.startsWith('//')) return href;
  if (parsePath(href).locale !== DEFAULT_LOCALE) return href;
  return localizePath(href, locale) ?? href;
}

/** Same as localizeHref for absolute URLs of this site; other hosts are untouched. */
export function localizeUrl(url: string, locale: Locale): string {
  if (url.startsWith(SITE_ORIGIN + '/') || url === SITE_ORIGIN) {
    return SITE_ORIGIN + localizeHref(url.slice(SITE_ORIGIN.length) || '/', locale);
  }
  return localizeHref(url, locale);
}

/** Absolute URL of an English path in `locale`. Falls back to the English URL. */
export function absoluteUrl(enPath: string, locale: Locale = DEFAULT_LOCALE): string {
  const path = localizePath(enPath, locale) ?? enPath;
  return `${SITE_ORIGIN}${path === '/' ? '/' : path}`;
}

export interface Alternate {
  hreflang: string;
  href: string;
}

/**
 * hreflang set for a page: one row per language that has it, plus x-default
 * (English). Empty when the page exists in English only, so untranslated
 * pages keep exactly the head they had before.
 */
export function alternatesFor(enPath: string): Alternate[] {
  const [pathname] = splitSuffix(enPath);
  const rows: Alternate[] = [];
  for (const locale of PUBLISHED_LOCALES) {
    const path = localizePath(pathname, locale);
    if (path) rows.push({ hreflang: LOCALE_INFO[locale].htmlLang, href: `${SITE_ORIGIN}${path}` });
  }
  if (rows.length < 2) return [];
  rows.push({ hreflang: 'x-default', href: `${SITE_ORIGIN}${pathname}` });
  return rows;
}

/** React Router pattern of an English route pattern in `locale` ("/destinations/:citySlug" -> "/it/destinazioni/:citySlug"). */
export function routePattern(enPattern: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return enPattern;
  const segs = segmentsOf(enPattern);
  if (segs.length === 0) return `/${locale}`;
  const mapped = SEGMENTS[locale as Exclude<Locale, 'en'>][segs[0] as StaticSegment] ?? segs[0];
  return `/${[locale, mapped, ...segs.slice(1)].join('/')}`;
}
