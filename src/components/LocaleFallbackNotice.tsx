import { Link } from 'react-router-dom';
import { DEFAULT_LOCALE, LOCALE_INFO } from '@/i18n/config';
import { useLocaleState } from '@/i18n/LocaleProvider';

/**
 * Shown on an English page opened by a reader of another language because the
 * page has not been translated. Says so in their language and offers the way back.
 */
export default function LocaleFallbackNotice() {
  const { locale, linkLocale } = useLocaleState();
  if (locale !== DEFAULT_LOCALE || linkLocale === DEFAULT_LOCALE) return null;
  const info = LOCALE_INFO[linkLocale];
  return (
    <div
      lang={info.htmlLang}
      role="status"
      className="pointer-events-auto relative z-[70] border-b border-border bg-accent/60 px-4 py-2 text-center text-sm text-foreground"
    >
      {info.fallbackNotice}{' '}
      <Link to={`/${linkLocale}`} className="font-medium text-primary underline underline-offset-2">
        {info.fallbackHome}
      </Link>
    </div>
  );
}
