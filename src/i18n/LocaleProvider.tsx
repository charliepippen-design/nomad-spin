import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { DEFAULT_LOCALE, LOCALE_INFO, isLocale, isPublished, type Locale } from './config';
import { getT, isLoaded, loadLocale, type TFunction } from './dictionary';
import { hasTranslation, parsePath } from './paths';

interface LocaleState {
  /** Language of the page on screen, read from the URL. */
  locale: Locale;
  t: TFunction;
  /** The current page as an English path, without query string. */
  enPath: string;
  /**
   * Language links should lead to. Equal to `locale`, except on an English page
   * shown to a reader of another language because no translation exists: links
   * then lead back into that reader's language.
   */
  linkLocale: Locale;
}

const DEFAULT_STATE: LocaleState = {
  locale: DEFAULT_LOCALE,
  t: getT(DEFAULT_LOCALE),
  enPath: '/',
  linkLocale: DEFAULT_LOCALE,
};

const LocaleContext = createContext<LocaleState>(DEFAULT_STATE);

const PREFERRED_KEY = 'nomadspin_locale';

export function readPreferredLocale(): Locale {
  try {
    const value = sessionStorage.getItem(PREFERRED_KEY);
    return isLocale(value) && isPublished(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function writePreferredLocale(locale: Locale): void {
  try {
    sessionStorage.setItem(PREFERRED_KEY, locale);
  } catch {
    // Private mode: the preference just lasts for this page.
  }
}

/** Must sit inside the router. Pages render once their language is loaded. */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { locale, enPath } = useMemo(() => parsePath(pathname), [pathname]);
  const [, bump] = useState(0);

  useEffect(() => {
    if (isLoaded(locale)) return;
    let alive = true;
    loadLocale(locale).then(() => {
      if (alive) bump((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  const preferred = readPreferredLocale();
  // English URL reached by a reader of another language. Either a fallback for a
  // page their language lacks (links keep their language), or a deliberate visit
  // to English (the preference is dropped).
  const isFallback = locale === DEFAULT_LOCALE && preferred !== DEFAULT_LOCALE && !hasTranslation(enPath, preferred);
  const linkLocale = isFallback ? preferred : locale;
  const nextPreferred = isFallback ? preferred : locale;
  useEffect(() => {
    if (nextPreferred !== readPreferredLocale()) writePreferredLocale(nextPreferred);
  }, [nextPreferred]);

  const ready = isLoaded(locale);
  const value = useMemo<LocaleState>(
    () => ({ locale, t: getT(locale), enPath, linkLocale }),
    // `ready` flips when the dictionary arrives, which changes what getT returns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, enPath, linkLocale, ready],
  );

  return (
    <LocaleContext.Provider value={value}>
      <Helmet>
        <html lang={LOCALE_INFO[locale].htmlLang} />
      </Helmet>
      {ready ? children : null}
    </LocaleContext.Provider>
  );
}

export function useLocaleState(): LocaleState {
  return useContext(LocaleContext);
}

/** Language of the page on screen. */
export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

/** Translator for the page on screen: t('common.nav.guides'). */
export function useT(): TFunction {
  return useContext(LocaleContext).t;
}

/** The current page as an English path ("/destinations/lisbon"), whatever the language. */
export function useEnPath(): string {
  return useContext(LocaleContext).enPath;
}
