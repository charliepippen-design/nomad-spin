import { useId, useState } from 'react';
import { Link } from '@/i18n/Link';
import { useT } from '@/i18n/LocaleProvider';
import { rich } from '@/i18n/rich';

type Status = 'idle' | 'sending' | 'success' | 'error';

interface NewsletterSignupProps {
  /**
   * Sends the address to the newsletter provider and rejects on failure.
   * No provider is connected yet, so this component is not mounted anywhere:
   * mount it only once a real `onSubscribe` exists, never with a stub.
   */
  onSubscribe: (email: string) => Promise<void>;
  title?: string;
  blurb?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email field, explicit consent, and success and error states. */
export default function NewsletterSignup({
  onSubscribe,
  title: titleProp,
  blurb: blurbProp,
}: NewsletterSignupProps) {
  const t = useT();
  const title = titleProp ?? t('common.newsletter.title');
  const blurb = blurbProp ?? t('common.newsletter.blurb');
  const id = useId();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setStatus('error');
      setMessage(t('common.newsletter.invalidEmail'));
      return;
    }
    if (!consent) {
      setStatus('error');
      setMessage(t('common.newsletter.consentRequired'));
      return;
    }
    setStatus('sending');
    setMessage('');
    try {
      await onSubscribe(value);
      setStatus('success');
      setMessage(t('common.newsletter.success'));
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(t('common.newsletter.failed'));
    }
  };

  return (
    <section className="dns-card p-6" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-display text-xl font-bold text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{blurb}</p>

      {status === 'success' ? (
        <p role="status" className="mt-4 text-sm font-medium text-primary">
          {message}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-4 space-y-3">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <label htmlFor={`${id}-email`} className="sr-only">
              {t('common.newsletter.emailLabel')}
            </label>
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={t('common.newsletter.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={status === 'error'}
              aria-describedby={message ? `${id}-message` : undefined}
              className="dns-input sm:flex-1"
            />
            <button type="submit" disabled={status === 'sending'} className="dns-btn-primary disabled:opacity-60">
              {status === 'sending' ? t('common.newsletter.sending') : t('common.newsletter.subscribe')}
            </button>
          </div>
          <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span>
              {rich(t('common.newsletter.consent'), {
                link: (children) => (
                  <Link to="/privacy-policy" className="underline underline-offset-4 hover:text-foreground">
                    {children}
                  </Link>
                ),
              })}
            </span>
          </label>
          {status === 'error' && message ? (
            <p id={`${id}-message`} role="alert" className="text-sm text-warning">
              {message}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
