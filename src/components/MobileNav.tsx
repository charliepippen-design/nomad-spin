import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, Info, Mail } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { to: '/', label: 'Home', icon: Compass },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail },
];

interface MobileNavProps {
  onExplore?: () => void;
}

export default function MobileNav({ onExplore }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!isMobile) return null;

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-50 p-2.5 rounded-xl bg-background/60 backdrop-blur-md border border-border/30 pointer-events-auto"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Slide-in drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm pointer-events-auto"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] z-[70] bg-background/95 backdrop-blur-2xl border-l border-border/30 pointer-events-auto flex flex-col"
            >
              <div className="flex items-center justify-between p-4">
                <span className="text-[10px] font-mono tracking-[0.25em] text-muted-foreground uppercase">Menu</span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                      location.pathname === item.to
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-mono tracking-wider">{item.label}</span>
                  </Link>
                ))}

                {onExplore && (
                  <button
                    onClick={() => { setOpen(false); onExplore(); }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full text-left text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Compass className="w-4 h-4" />
                    <span className="text-sm font-mono tracking-wider">Explore Cities</span>
                  </button>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
