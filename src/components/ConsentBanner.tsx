import { useEffect, useState } from 'react';
import { Link } from '@/i18n/Link';
import { CONSENT_OPEN_EVENT, getConsent, setConsent } from '@/lib/consent';

/**
 * Cookie banner. Shown until the visitor picks, and again from the footer
 * "Cookie settings" link. Both buttons carry the same weight on purpose.
 */
export default function ConsentBanner() {
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
        Cookies and tracking
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        With your OK we load Google Analytics, to see which pages are used, and Impact, which lets partners credit us
        when you book through a link. If you decline, neither loads and the site works the same.{' '}
        <Link to="/privacy-policy" className="underline underline-offset-4 hover:text-foreground">
          Privacy policy
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button type="button" onClick={decline} className="dns-btn-secondary">
          Decline
        </button>
        <button type="button" onClick={accept} className="dns-btn-secondary">
          Accept
        </button>
      </div>
    </div>
  );
}
