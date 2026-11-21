import { en, type Dictionary } from '../locales/en';
import type { Guide } from '../data/guides';
import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from './config';

/** Translated text of one city (content/cities/<locale>/<cityId>.json). */
export interface CityTranslation {
  /** Name of the city in this language when it differs (Lisbona, Londra). */
  name?: string;
  pros: string[];
  cons: string[];
  legalNotes?: string[];
  taxation?: { incomeTax?: string; notes?: string };
  visaNote?: string;
}

/** A translated guide. `sourceSlug` is the slug of the English guide it translates. */
export type LocalizedGuide = Guide & { sourceSlug: string };

/** Everything one language ships: interface text, city text, guides. */
export interface LocaleBundle {
  dictionary: { [N in keyof Dictionary]?: Partial<Dictionary[N]> };
  /** By city id. */
  cities: Record<string, CityTranslation>;
  guides: LocalizedGuide[];
}

export type TKey = {
  [N in keyof Dictionary]: `${N}.${Extract<keyof Dictionary[N], string>}`;
}[keyof Dictionary];

export type TVars = Record<string, string | number>;

export interface TFunction {
  /** Text for a known key. `{name}` placeholders are filled from `vars`. */
  (key: TKey, vars?: TVars): string;
  /** Plural form: looks up `${key}_one` / `${key}_other` (and `_many` etc. where the language has them). `{count}` is filled in. */
  n(key: string, count: number, vars?: TVars): string;
  /** Key built at runtime (a vibe tag, a region). Returns `fallback` when it does not exist. */
  dyn(key: string, fallback?: string, vars?: TVars): string;
  has(key: string): boolean;
  locale: Locale;
}

const EN_BUNDLE: LocaleBundle = { dictionary: en, cities: {}, guides: [] };

const loaders: Record<Locale, () => Promise<LocaleBundle>> = {
  en: async () => EN_BUNDLE,
  it: () => import('../locales/it/index').then((m) => m.default),
  es: () => import('../locales/es/index').then((m) => m.default),
  fr: () => import('../locales/fr/index').then((m) => m.default),
};

const bundles = new Map<Locale, LocaleBundle>([[DEFAULT_LOCALE, EN_BUNDLE]]);
const pending = new Map<Locale, Promise<LocaleBundle>>();

export function isLoaded(locale: Locale): boolean {
  return bundles.has(locale);
}

/** Load a language once. English is always there; the others are fetched on first use. */
export function loadLocale(locale: Locale): Promise<LocaleBundle> {
  const ready = bundles.get(locale);
  if (ready) return Promise.resolve(ready);
  let job = pending.get(locale);
  if (!job) {
    job = loaders[locale]().then((bundle) => {
      bundles.set(locale, bundle);
      tCache.delete(locale);
      return bundle;
    });
    pending.set(locale, job);
  }
  return job;
}

/** The loaded bundle of a language. English when it has not been loaded. */
export function getBundle(locale: Locale): LocaleBundle {
  return bundles.get(locale) ?? EN_BUNDLE;
}

function lookup(bundle: LocaleBundle, key: string): string | undefined {
  const dot = key.indexOf('.');
  if (dot === -1) return undefined;
  const ns = bundle.dictionary[key.slice(0, dot) as keyof Dictionary] as Record<string, string> | undefined;
  const value = ns?.[key.slice(dot + 1)];
  return typeof value === 'string' && value !== '' ? value : undefined;
}

export function interpolate(text: string, vars?: TVars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

const pluralRules = new Map<Locale, Intl.PluralRules>();
function pluralCategory(locale: Locale, count: number): string {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(LOCALE_INFO[locale].intl);
    pluralRules.set(locale, rules);
  }
  return rules.select(count);
}

function buildT(locale: Locale): TFunction {
  const bundle = getBundle(locale);
  const find = (key: string): string | undefined => lookup(bundle, key) ?? lookup(EN_BUNDLE, key);
  const t = ((key: string, vars?: TVars) => interpolate(find(key) ?? key, vars)) as TFunction;
  t.n = (key, count, vars) => {
    const text = find(`${key}_${pluralCategory(locale, count)}`) ?? find(`${key}_other`) ?? key;
    return interpolate(text, { count, ...vars });
  };
  t.dyn = (key, fallback, vars) => interpolate(find(key) ?? fallback ?? key, vars);
  t.has = (key) => find(key) !== undefined;
  t.locale = locale;
  return t;
}

const tCache = new Map<Locale, TFunction>();

/**
 * Translator for a language that is already loaded (await loadLocale first
 * outside React). A key missing in that language falls back to English.
 */
export function getT(locale: Locale = DEFAULT_LOCALE): TFunction {
  let t = tCache.get(locale);
  if (!t) {
    t = buildT(locale);
    if (isLoaded(locale)) tCache.set(locale, t);
  }
  return t;
}
