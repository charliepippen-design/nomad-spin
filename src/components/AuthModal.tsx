import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, RefreshCw, SlidersHorizontal, AlertCircle, MailCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authErrorMessage, type AuthErrorLike } from '@/lib/authErrors';
import type { AuthResult, SignUpResult } from '@/hooks/useAuth';
import type { AuthView } from '@/store/useAccountUi';

interface AuthModalProps {
  open: boolean;
  /** Screen to show. The parent owns it so a password-recovery link can open the right one. */
  view: AuthView;
  onViewChange: (view: AuthView) => void;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<AuthResult>;
  onSignUp: (email: string, password: string, name?: string) => Promise<SignUpResult>;
  onResendConfirmation: (email: string) => Promise<AuthResult>;
  onRequestPasswordReset: (email: string) => Promise<AuthResult>;
  onUpdatePassword: (password: string) => Promise<AuthResult>;
}

const BENEFITS = [
  { icon: Bookmark, text: 'Save your favorite cities' },
  { icon: RefreshCw, text: 'Find them on any device' },
  { icon: SlidersHorizontal, text: 'Keep your filters' },
];

const MIN_PASSWORD = 6;
/** Seconds to wait before another confirmation email can be asked for. */
const RESEND_WAIT = 60;

const TITLES: Record<AuthView, string> = {
  signin: 'Welcome back',
  signup: 'Create your account',
  'check-email': 'Check your inbox',
  forgot: 'Forgot your password?',
  'reset-sent': 'Check your inbox',
  'new-password': 'Choose a new password',
};

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary/60 focus:outline-none';
const labelClass = 'mb-1 block text-xs font-medium text-muted-foreground';
const primaryButton =
  'w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50';
const linkButton = 'text-xs font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline';

export default function AuthModal({
  open, view, onViewChange, onClose,
  onSignIn, onSignUp, onResendConfirmation, onRequestPasswordReset, onUpdatePassword,
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<AuthErrorLike | null>(null);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendWait, setResendWait] = useState(0);
  const { toast } = useToast();

  // Closing forgets what was typed, passwords first of all.
  useEffect(() => {
    if (open) return;
    setEmail('');
    setPassword('');
    setRepeatPassword('');
    setName('');
    setError(null);
    setNotice('');
    setLoading(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Countdown of the "send again" button.
  useEffect(() => {
    if (resendWait <= 0) return;
    const timer = setTimeout(() => setResendWait((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendWait]);

  const go = (next: AuthView) => {
    setError(null);
    setNotice('');
    setPassword('');
    setRepeatPassword('');
    onViewChange(next);
  };

  const run = async <T extends AuthResult>(action: () => Promise<T>): Promise<T | null> => {
    setError(null);
    setNotice('');
    setLoading(true);
    const result = await action();
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return null;
    }
    return result;
  };

  const handleSignIn = async () => {
    const result = await run(() => onSignIn(email, password));
    if (result) onClose();
  };

  const handleSignUp = async () => {
    const result = await run(() => onSignUp(email, password, name));
    if (!result) return;
    if (result.alreadyRegistered) {
      setPassword('');
      onViewChange('signin');
      setError({ code: 'user_already_exists' });
      return;
    }
    if (result.needsConfirmation) {
      setPassword('');
      setResendWait(RESEND_WAIT);
      onViewChange('check-email');
      return;
    }
    onClose();
  };

  const handleResend = async () => {
    const result = await run(() => onResendConfirmation(email));
    if (!result) return;
    setResendWait(RESEND_WAIT);
    setNotice(`We sent a new link to ${email.trim()}.`);
  };

  const handleForgot = async () => {
    const result = await run(() => onRequestPasswordReset(email));
    if (result) onViewChange('reset-sent');
  };

  const handleNewPassword = async () => {
    if (password !== repeatPassword) {
      setError({ message: 'The two passwords do not match.' });
      return;
    }
    const result = await run(() => onUpdatePassword(password));
    if (!result) return;
    toast({ title: 'Password updated', description: 'Use the new password next time you sign in.' });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (view === 'signin') handleSignIn();
    else if (view === 'signup') handleSignUp();
    else if (view === 'forgot') handleForgot();
    else if (view === 'new-password') handleNewPassword();
  };

  if (!open) return null;

  const unconfirmed =
    view === 'signin' && (error?.code === 'email_not_confirmed' || /not confirmed/i.test(error?.message ?? ''));
  const showTabs = view === 'signin' || view === 'signup';
  const sentTo = email.trim();

  const errorBox = error && (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-destructive" />
      <p className="text-xs leading-relaxed text-destructive">{authErrorMessage(error)}</p>
    </div>
  );
  const noticeBox = notice && (
    <p role="status" className="rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-xs leading-relaxed text-foreground">
      {notice}
    </p>
  );
  const resendButton = (
    <button type="button" onClick={handleResend} disabled={loading || resendWait > 0 || !sentTo} className={linkButton}>
      {resendWait > 0 ? `Send the email again in ${resendWait}s` : 'Send the email again'}
    </button>
  );
  const backToSignIn = (
    <button type="button" onClick={() => go('signin')} className={`${linkButton} inline-flex items-center gap-1`}>
      <ArrowLeft className="h-3 w-3" /> Back to sign in
    </button>
  );

  // Rendered on <body>: the site header blurs its backdrop, which would otherwise
  // trap this fixed layer inside the header's own box.
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-auto"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div className="gradient-border-wrap rounded-xl">
            <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-xl bg-popover/95 p-6 backdrop-blur-[60px]">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-sm p-1 transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="mb-5 pr-6">
                <h2 id="auth-modal-title" className="text-base font-semibold text-foreground">
                  {TITLES[view]}
                </h2>
                {showTabs && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    An account keeps your picks and filters, on every device.
                  </p>
                )}
              </div>

              {view === 'signup' && (
                <div className="mb-5 flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3">
                  {BENEFITS.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      <span className="text-xs text-foreground/80">{text}</span>
                    </div>
                  ))}
                </div>
              )}

              {showTabs && (
                <div className="mb-4 flex gap-1 rounded-lg border border-border bg-muted/40 p-1" role="tablist">
                  {(['signin', 'signup'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={view === tab}
                      onClick={() => go(tab)}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                        view === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab === 'signin' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>
              )}

              {/* Sign in / Create account */}
              {showTabs && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {view === 'signup' && (
                    <div>
                      <label htmlFor="auth-name" className={labelClass}>Name (optional)</label>
                      <input
                        id="auth-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        maxLength={60}
                        className={inputClass}
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="auth-email" className={labelClass}>Email</label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      autoFocus
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-baseline justify-between">
                      <label htmlFor="auth-password" className="text-xs font-medium text-muted-foreground">Password</label>
                      {view === 'signin' && (
                        <button type="button" onClick={() => go('forgot')} className={linkButton}>
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
                      required
                      minLength={view === 'signup' ? MIN_PASSWORD : undefined}
                      className={inputClass}
                    />
                    {view === 'signup' && (
                      <p className="mt-1 text-[11px] text-muted-foreground">At least {MIN_PASSWORD} characters.</p>
                    )}
                  </div>

                  {errorBox}
                  {noticeBox}
                  {unconfirmed && <div>{resendButton}</div>}

                  <button type="submit" disabled={loading} className={primaryButton}>
                    {loading ? 'Please wait...' : view === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                  {view === 'signup' && (
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      We will email you a link to confirm the address before you can sign in.
                    </p>
                  )}
                </form>
              )}

              {/* After creating an account */}
              {view === 'check-email' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MailCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-foreground/90">
                      We sent a confirmation link to <strong className="break-all">{sentTo}</strong>. Open it to finish
                      creating your account. You are not signed in until you do.
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    It can take a couple of minutes. If it is not there, look in the spam folder.
                  </p>
                  {errorBox}
                  {noticeBox}
                  <div className="flex flex-col items-start gap-2">
                    {resendButton}
                    <button type="button" onClick={() => go('signup')} className={linkButton}>
                      Wrong address? Change it
                    </button>
                    {backToSignIn}
                  </div>
                </div>
              )}

              {/* Forgot password */}
              {view === 'forgot' && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Enter the email of your account. We will send you a link to choose a new password.
                  </p>
                  <div>
                    <label htmlFor="auth-email" className={labelClass}>Email</label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      autoFocus
                      className={inputClass}
                    />
                  </div>
                  {errorBox}
                  <button type="submit" disabled={loading} className={primaryButton}>
                    {loading ? 'Please wait...' : 'Send the link'}
                  </button>
                  <div>{backToSignIn}</div>
                </form>
              )}

              {view === 'reset-sent' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MailCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-foreground/90">
                      If <strong className="break-all">{sentTo}</strong> has an account, a link to choose a new password is
                      on its way.
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    It can take a couple of minutes. If it is not there, look in the spam folder.
                  </p>
                  {backToSignIn}
                </div>
              )}

              {/* New password, after a recovery link or from the account menu */}
              {view === 'new-password' && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="auth-new-password" className={labelClass}>New password</label>
                    <input
                      id="auth-new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={MIN_PASSWORD}
                      autoFocus
                      className={inputClass}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">At least {MIN_PASSWORD} characters.</p>
                  </div>
                  <div>
                    <label htmlFor="auth-repeat-password" className={labelClass}>Repeat the new password</label>
                    <input
                      id="auth-repeat-password"
                      type="password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={MIN_PASSWORD}
                      className={inputClass}
                    />
                  </div>
                  {errorBox}
                  <button type="submit" disabled={loading} className={primaryButton}>
                    {loading ? 'Please wait...' : 'Save the new password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
