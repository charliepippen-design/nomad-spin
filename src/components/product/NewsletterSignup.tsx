import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

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
  title = 'New cities and guides, by email',
  blurb = 'An occasional email when we add a city or publish a guide. Unsubscribe with one click.',
}: NewsletterSignupProps) {
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
      setMessage('Enter a valid email address.');
      return;
    }
    if (!consent) {
      setStatus('error');
      setMessage('Tick the box to agree before you subscribe.');
      return;
    }
    setStatus('sending');
    setMessage('');
    try {
      await onSubscribe(value);
      setStatus('success');
      setMessage('Almost done. Check your inbox to confirm.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('That did not go through. Try again in a moment.');
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
              Email address
            </label>
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={status === 'error'}
              aria-describedby={message ? `${id}-message` : undefined}
              className="dns-input sm:flex-1"
            />
            <button type="submit" disabled={status === 'sending'} className="dns-btn-primary disabled:opacity-60">
              {status === 'sending' ? 'Sending…' : 'Subscribe'}
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
              I agree to receive emails from Nomad Spin. See the{' '}
              <Link to="/privacy-policy" className="underline underline-offset-4 hover:text-foreground">
                privacy policy
              </Link>
              .
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
