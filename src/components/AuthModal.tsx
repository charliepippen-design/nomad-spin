import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, RefreshCw, Flame, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useT } from '@/i18n/LocaleProvider';
import type { TKey } from '@/i18n/dictionary';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
}

const BENEFITS: { icon: typeof Bookmark; text: TKey }[] = [
  { icon: Bookmark, text: 'common.auth.benefit.save' },
  { icon: RefreshCw, text: 'common.auth.benefit.sync' },
  { icon: Flame, text: 'common.auth.benefit.streak' },
];

export default function AuthModal({ open, onClose, onSignUp, onSignIn }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const t = useT();

  const friendlyError = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('user already registered')) return t('common.auth.error.alreadyRegistered');
    if (lower.includes('invalid login credentials')) return t('common.auth.error.wrongCredentials');
    if (lower.includes('email not confirmed')) return t('common.auth.error.notConfirmed');
    if (lower.includes('password') && lower.includes('characters')) return t('common.auth.error.passwordLength');
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = mode === 'signup'
      ? await onSignUp(email, password, name)
      : await onSignIn(email, password);

    setLoading(false);

    if (result.error) {
      const msg = result.error.message || t('common.auth.error.generic');
      setError(friendlyError(msg));
      if (msg.toLowerCase().includes('user already registered')) {
        setMode('login');
      }
    } else {
      setSuccess(true);
      toast({
        title: t('common.auth.toast.title'),
        description: t('common.auth.toast.description'),
      });
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail('');
        setPassword('');
        setName('');
      }, 800);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm"
        >
          <div className="gradient-border-wrap rounded-xl">
            <div className="bg-popover/95 backdrop-blur-[60px] rounded-xl p-6">
              {/* Close */}
              <button onClick={onClose} aria-label={t('common.auth.close')} className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-sm transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Header */}
              <div className="mb-5">
                <h2 className="font-mono text-sm tracking-wide text-foreground">
                  {mode === 'login' ? t('common.auth.welcomeBack') : t('common.auth.createYourAccount')}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('common.auth.subtitle')}
                </p>
              </div>

              {/* Benefits */}
              <div className="flex flex-col gap-2 mb-5 p-3 rounded-lg bg-white/[0.02] border border-border">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                    <span className="text-[11px] font-mono text-foreground/70">{t(text)}</span>
                  </div>
                ))}
              </div>

              {/* Tab Toggle */}
              <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/[0.03] border border-border">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md font-mono text-[10px] tracking-wider uppercase transition-colors ${
                    mode === 'login' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  {t('common.auth.signIn')}
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md font-mono text-[10px] tracking-wider uppercase transition-colors ${
                    mode === 'signup' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  {t('common.auth.register')}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
                      {t('common.auth.displayName')}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('common.auth.namePlaceholder')}
                      className="w-full bg-white/[0.03] border border-border rounded-lg px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
                    {t('common.auth.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('common.auth.emailPlaceholder')}
                    required
                    className="w-full bg-white/[0.03] border border-border rounded-lg px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
                    {t('common.auth.password')}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-white/[0.03] border border-border rounded-lg px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                    <Mail className="w-3 h-3 text-destructive flex-shrink-0" />
                    <p className="font-mono text-[10px] text-destructive">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-mono text-xs tracking-wider transition-all bg-white/[0.06] border border-border hover:bg-white/[0.1] hover:border-white/[0.2] disabled:opacity-50 text-foreground"
                >
                  {loading ? t('common.auth.pleaseWait') : success ? t('common.auth.done') : mode === 'login' ? t('common.auth.signInWithEmail') : t('common.auth.createAccount')}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
