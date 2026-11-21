/**
 * Languages of the site.
 *
 * English is the default and keeps every URL it has always had (no prefix).
 * Every other language lives under its own prefix: /it/..., /es/..., /fr/...
 *
 * To add a language: add it to LOCALES, LOCALE_INFO and SEGMENTS, create
 * src/locales/<code>/, translate, and only then add it to PUBLISHED_LOCALES.
 */
export const LOCALES = ['en', 'it', 'es', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Languages that have public URLs, a switcher entry, hreflang and sitemap rows.
 * A language in LOCALES but not here is plumbing only: nothing is routed,
 * prerendered or linked for it.
 */
export const PUBLISHED_LOCALES: readonly Locale[] = ['en', 'it'];

export interface LocaleInfo {
  /** Name of the language in that language, for the switcher. */
  name: string;
  /** Value of <html lang> and hreflang. */
  htmlLang: string;
  /** Value of og:locale. */
  ogLocale: string;
  /** BCP 47 tag used for number, date and country-name formatting. */
  intl: string;
  /** Shown on an English page reached from this language because no translation exists. */
  fallbackNotice: string;
  /** Link text of the notice above: back to the home page in this language. */
  fallbackHome: string;
  /** "8 min read" in this language; {n} is the number. */
  readTime: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: {
    name: 'English',
    htmlLang: 'en',
    ogLocale: 'en_US',
    intl: 'en-US',
    fallbackNotice: '',
    fallbackHome: '',
    readTime: '{n} min read',
  },
  it: {
    name: 'Italiano',
    htmlLang: 'it',
    ogLocale: 'it_IT',
    intl: 'it-IT',
    fallbackNotice: 'Questa pagina non è ancora disponibile in italiano: la vedi in inglese.',
    fallbackHome: 'Torna alla home in italiano',
    readTime: '{n} min di lettura',
  },
  es: {
    name: 'Español',
    htmlLang: 'es',
    ogLocale: 'es_ES',
    intl: 'es-ES',
    fallbackNotice: 'Esta página aún no está disponible en español: la ves en inglés.',
    fallbackHome: 'Volver al inicio en español',
    readTime: '{n} min de lectura',
  },
  fr: {
    name: 'Français',
    htmlLang: 'fr',
    ogLocale: 'fr_FR',
    intl: 'fr-FR',
    fallbackNotice: "Cette page n'est pas encore disponible en français : elle s'affiche en anglais.",
    fallbackHome: "Retour à l'accueil en français",
    readTime: '{n} min de lecture',
  },
};

/** First path segment of every English page that is not the home page. */
export const STATIC_SEGMENTS = [
  'about',
  'contact',
  'privacy-policy',
  'terms-of-use',
  'destinations',
  'compare',
  'find-your-base',
  'methodology',
  'guides',
] as const;
export type StaticSegment = (typeof STATIC_SEGMENTS)[number];

/** Localized first path segment, per language. City slugs are never translated. */
export const SEGMENTS: Record<Exclude<Locale, 'en'>, Record<StaticSegment, string>> = {
  it: {
    about: 'chi-siamo',
    contact: 'contatti',
    'privacy-policy': 'privacy',
    'terms-of-use': 'termini-di-utilizzo',
    destinations: 'destinazioni',
    compare: 'confronta',
    'find-your-base': 'trova-la-tua-base',
    methodology: 'metodologia',
    guides: 'guide',
  },
  es: {
    about: 'sobre-nosotros',
    contact: 'contacto',
    'privacy-policy': 'privacidad',
    'terms-of-use': 'terminos-de-uso',
    destinations: 'destinos',
    compare: 'comparar',
    'find-your-base': 'encuentra-tu-base',
    methodology: 'metodologia',
    guides: 'guias',
  },
  fr: {
    about: 'a-propos',
    contact: 'contact',
    'privacy-policy': 'confidentialite',
    'terms-of-use': 'conditions-utilisation',
    destinations: 'destinations',
    compare: 'comparer',
    'find-your-base': 'trouver-sa-base',
    methodology: 'methodologie',
    guides: 'guides',
  },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function isPublished(locale: Locale): boolean {
  return PUBLISHED_LOCALES.includes(locale);
}

export const SITE_ORIGIN = 'https://www.digitalnomadspin.com';
