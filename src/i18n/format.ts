import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from './config';

/** Formatting that differs by language but needs no translation file. */

/** 1200 -> "1,200" in English, "1.200" in Italian. */
export function formatNumber(value: number, locale: Locale = DEFAULT_LOCALE, options?: Intl.NumberFormatOptions): string {
  if (locale === DEFAULT_LOCALE) return value.toLocaleString(LOCALE_INFO[locale].intl, options);
  // Italian and Spanish only group from five digits by default ("2200"); prices read better as "2.200".
  return value.toLocaleString(LOCALE_INFO[locale].intl, { useGrouping: 'always', ...options } as Intl.NumberFormatOptions);
}

const countryNames = new Map<Locale, Intl.DisplayNames | null>();

/**
 * Country name in the reader's language from its ISO code ("Portogallo").
 * English keeps the name stored in the dataset, so English pages do not change.
 */
export function countryName(countryCode: string, englishName: string, locale: Locale = DEFAULT_LOCALE): string {
  if (locale === DEFAULT_LOCALE || !countryCode) return englishName;
  let names = countryNames.get(locale);
  if (names === undefined) {
    try {
      names = new Intl.DisplayNames([LOCALE_INFO[locale].intl], { type: 'region' });
    } catch {
      names = null;
    }
    countryNames.set(locale, names);
  }
  try {
    return names?.of(countryCode.toUpperCase()) ?? englishName;
  } catch {
    return englishName;
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Dataset month abbreviation ("Jan") in the reader's language ("gen"). */
export function monthName(enAbbrev: string, locale: Locale = DEFAULT_LOCALE, style: 'short' | 'long' = 'short'): string {
  const index = MONTHS.indexOf(enAbbrev);
  if (index === -1 || (locale === DEFAULT_LOCALE && style === 'short')) return enAbbrev;
  const text = new Date(Date.UTC(2024, index, 15)).toLocaleDateString(LOCALE_INFO[locale].intl, { month: style, timeZone: 'UTC' });
  return text.replace(/\.$/, '');
}

/** "2026-11-21" -> "November 21, 2026" / "21 novembre 2026". */
export function formatDate(iso: string, locale: Locale = DEFAULT_LOCALE, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }): string {
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(LOCALE_INFO[locale].intl, { timeZone: 'UTC', ...options });
}
