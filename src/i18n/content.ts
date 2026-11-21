import type { City } from '../data/cities';
import type { Guide } from '../data/guides';
import { DEFAULT_LOCALE, type Locale } from './config';
import { getBundle, type LocalizedGuide } from './dictionary';
import { countryName } from './format';

/** Translated content (cities, guides) for a language that is already loaded. */

/** True when the city has a published translation in `locale`. */
export function isCityTranslated(cityId: string, locale: Locale): boolean {
  return locale === DEFAULT_LOCALE || cityId in getBundle(locale).cities;
}

/**
 * The city with its text in `locale`. Numbers are untouched. A city without a
 * translation is returned as it is, in English: callers that must not mix
 * languages check isCityTranslated first.
 */
export function localizeCity(city: City, locale: Locale): City {
  if (locale === DEFAULT_LOCALE) return city;
  const tr = getBundle(locale).cities[city.id];
  const country = countryName(city.countryCode, city.country, locale);
  if (!tr) return country === city.country ? city : { ...city, country };
  return {
    ...city,
    name: tr.name ?? city.name,
    country,
    pros: tr.pros,
    cons: tr.cons,
    legalNotes: tr.legalNotes ?? city.legalNotes,
    taxation: {
      incomeTax: tr.taxation?.incomeTax ?? city.taxation.incomeTax,
      notes: tr.taxation?.notes ?? city.taxation.notes,
    },
    meta: { ...city.meta, visaNote: tr.visaNote ?? city.meta.visaNote },
  };
}

/** Name of a city in `locale` (Lisbona), for lists that do not need the whole record. */
export function cityDisplayName(city: Pick<City, 'id' | 'name'>, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return city.name;
  return getBundle(locale).cities[city.id]?.name ?? city.name;
}

/** Guides published in `locale`. For English, pass the English list yourself. */
export function localizedGuides(locale: Locale): LocalizedGuide[] {
  return locale === DEFAULT_LOCALE ? [] : getBundle(locale).guides;
}

/** The translation of an English guide in `locale`, or null. */
export function localizedGuide(enSlug: string, locale: Locale): LocalizedGuide | null {
  if (locale === DEFAULT_LOCALE) return null;
  return getBundle(locale).guides.find((guide) => guide.sourceSlug === enSlug) ?? null;
}

/** The guide in the reader's language when translated, otherwise the English guide. */
export function guideForLocale<G extends Guide>(guide: G, locale: Locale): Guide {
  return localizedGuide(guide.slug, locale) ?? guide;
}
