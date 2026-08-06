import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, RefreshCw, Flame, Mail } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
}

const BENEFITS = [
  { icon: Bookmark, text: 'Save your favorite cities' },
  { icon: RefreshCw, text: 'Sync spins across devices' },
  { icon: Flame, text: 'Track your streak & filters' },
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

  const friendlyError = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('user already registered')) return 'This email is already registered. Try signing in instead.';
    if (lower.includes('invalid login credentials')) return 'Wrong email or password. Please try again.';
    if (lower.includes('email not confirmed')) return 'Please check your email to verify your account.';
    if (lower.includes('password') && lower.includes('characters')) return 'Password must be at least 6 characters.';
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
      const msg = result.error.message || 'Authentication failed';
      setError(friendlyError(msg));
      if (msg.toLowerCase().includes('user already registered')) {
        setMode('login');
      }
    } else {
      setSuccess(true);
      toast({
        title: "You're in ✓",
        description: 'Your picks and settings will now be saved.',
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

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setError(error.message || 'Google sign-in failed');
      setLoading(false);
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
            <div className="bg-black/90 backdrop-blur-[60px] rounded-xl p-6">
              {/* Close */}
              <button onClick={onClose} aria-label="Close authentication modal" className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-sm transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Header */}
              <div className="mb-5">
                <h2 className="font-mono text-sm tracking-wide text-foreground">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Sign in to unlock your nomad dashboard.
                </p>
              </div>

              {/* Benefits */}
              <div className="flex flex-col gap-2 mb-5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
                    <span className="text-[11px] font-mono text-foreground/70">{text}</span>
                  </div>
                ))}
              </div>

              {/* Google — primary CTA */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-lg font-mono text-xs tracking-wide transition-all bg-white text-black hover:bg-white/90 disabled:opacity-50 font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="font-mono text-[9px] text-muted-foreground/50 tracking-[0.2em]">OR USE EMAIL</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Tab Toggle */}
              <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md font-mono text-[10px] tracking-wider uppercase transition-colors ${
                    mode === 'login' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md font-mono text-[10px] tracking-wider uppercase transition-colors ${
                    mode === 'signup' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
                      Display name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-muted-foreground tracking-wider uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors"
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
                  className="w-full py-2.5 rounded-lg font-mono text-xs tracking-wider transition-all bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/[0.2] disabled:opacity-50 text-foreground"
                >
                  {loading ? 'Please wait...' : success ? 'Done ✓' : mode === 'login' ? 'Sign in with email' : 'Create account'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
