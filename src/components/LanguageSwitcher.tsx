import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Languages } from 'lucide-react';
import { DEFAULT_LOCALE, LOCALE_INFO, PUBLISHED_LOCALES, type Locale } from '@/i18n/config';
import { localizePath } from '@/i18n/paths';
import { useLocaleState, writePreferredLocale } from '@/i18n/LocaleProvider';

/**
 * Language menu. Choosing a language opens the same page in it when a
 * translation exists. When it does not, the reader stays on the English page
 * and the rest of the site switches to their language.
 */
export default function LanguageSwitcher() {
  const { locale, enPath, linkLocale, t } = useLocaleState();
  const { search, hash } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // On an English fallback page the reader's language is still the active choice.
  const active = linkLocale;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (PUBLISHED_LOCALES.length < 2) return null;

  const choose = (target: Locale) => {
    setOpen(false);
    writePreferredLocale(target);
    const translated = localizePath(enPath, target);
    navigate(`${translated ?? enPath}${search}${hash}`, { replace: target === active });
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('common.language.label')}: ${LOCALE_INFO[active].name}`}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
        {active}
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t('common.language.label')}
          className="absolute right-0 top-full z-[90] mt-2 min-w-[11rem] rounded-xl border border-border bg-popover p-1 shadow-2xl"
        >
          {PUBLISHED_LOCALES.map((target) => {
            const available = target === DEFAULT_LOCALE || localizePath(enPath, target) !== null;
            return (
              <button
                key={target}
                type="button"
                role="menuitemradio"
                aria-checked={target === active}
                lang={LOCALE_INFO[target].htmlLang}
                onClick={() => choose(target)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-white/[0.06]"
              >
                <span>
                  {LOCALE_INFO[target].name}
                  {!available && locale === DEFAULT_LOCALE && (
                    <span className="block text-[11px] text-muted-foreground">{t('common.language.unavailable')}</span>
                  )}
                </span>
                {target === active && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
