import { useEffect, useState } from 'react';
import { Link } from '@/i18n/Link';
import { useT } from '@/i18n/LocaleProvider';
import { CONSENT_OPEN_EVENT, getConsent, setConsent } from '@/lib/consent';

/**
 * Cookie banner. Shown until the visitor picks, and again from the footer
 * "Cookie settings" link. Both buttons carry the same weight on purpose.
 */
export default function ConsentBanner() {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getConsent() === null);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const decline = () => {
    const hadAccepted = getConsent() === 'granted';
    setConsent('denied');
    setOpen(false);
    // Tags that already loaded stay in memory until the page reloads.
    if (hadAccepted) window.location.reload();
  };

  const accept = () => {
    setConsent('granted');
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-xl border border-border bg-popover p-5 shadow-2xl sm:inset-x-6 sm:bottom-6"
    >
      <h2 id="consent-title" className="font-display text-base font-bold text-foreground">
        {t('common.consent.title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t('common.consent.body')}{' '}
        <Link to="/privacy-policy" className="underline underline-offset-4 hover:text-foreground">
          {t('common.consent.privacyLink')}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button type="button" onClick={decline} className="dns-btn-secondary">
          {t('common.consent.decline')}
        </button>
        <button type="button" onClick={accept} className="dns-btn-secondary">
          {t('common.consent.accept')}
        </button>
      </div>
    </div>
  );
}
