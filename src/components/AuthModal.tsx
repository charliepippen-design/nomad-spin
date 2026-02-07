import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, LogIn, UserPlus, AlertCircle } from 'lucide-react';

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
