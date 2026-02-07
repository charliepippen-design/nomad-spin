import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
}

export default function AuthModal({ open, onClose, onSignUp, onSignIn }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = mode === 'signup'
      ? await onSignUp(email, password, name)
      : await onSignIn(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error.message || 'Authentication failed');
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail('');
        setPassword('');
        setName('');
      }, 1000);
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
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm"
        >
          <div className="gradient-border-wrap rounded-lg">
            <div className="bg-black/90 backdrop-blur-[60px] rounded-lg p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                    {mode === 'login' ? 'AUTHENTICATE' : 'CREATE IDENTITY'}
                  </h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-sm transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Tab Toggle */}
              <div className="flex gap-1 mb-6 p-1 rounded-sm bg-white/[0.03] border border-white/[0.06]">
                <button
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
                    mode === 'login' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  <LogIn className="w-3 h-3" />
                  SIGN IN
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
                    mode === 'signup' ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  REGISTER
                </button>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={async () => {
                  setError('');
                  setLoading(true);
                  const { error } = await lovable.auth.signInWithOAuth('google', {
                    redirect_uri: window.location.origin,
                  });
                  if (error) {
                    setError(error.message || 'Google sign-in failed');
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm font-mono text-xs tracking-[0.15em] uppercase transition-all bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] disabled:opacity-50 text-foreground"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="font-mono text-[9px] text-muted-foreground/50 tracking-[0.2em]">OR</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block font-mono text-[10px] text-muted-foreground tracking-[0.15em] uppercase mb-1.5">
                      CALLSIGN
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="OPERATIVE"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-sm px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[10px] text-muted-foreground tracking-[0.15em] uppercase mb-1.5">
                    COMM CHANNEL
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operative@hq.io"
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-sm px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-muted-foreground tracking-[0.15em] uppercase mb-1.5">
                    ACCESS CODE
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-sm px-3 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-sm bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
                    <p className="font-mono text-[10px] text-destructive">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-sm font-mono text-xs tracking-[0.2em] uppercase transition-all bg-white/[0.08] border border-white/[0.1] hover:bg-white/[0.12] hover:border-white/[0.2] disabled:opacity-50 text-foreground"
                >
                  {loading ? 'PROCESSING...' : success ? 'ACCESS GRANTED ✓' : mode === 'login' ? 'AUTHENTICATE' : 'INITIALIZE IDENTITY'}
                </button>
              </form>

              <p className="mt-4 text-center font-mono text-[9px] text-muted-foreground/50 tracking-wider">
                {mode === 'login' ? 'SYNC DATA ACROSS DEVICES' : 'GUEST DATA WILL BE MIGRATED'}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
