import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X, ChevronRight } from 'lucide-react';
import SpinButton from '@/components/SpinButton';
import SavedSpins from '@/components/SavedSpins';
import { useIsMobile } from '@/hooks/use-mobile';

interface LandingDrawerProps {
  onConfigureMission: () => void;
  onScrollToExplore: () => void;
}

export default function LandingDrawer({ onConfigureMission, onScrollToExplore }: LandingDrawerProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleSpin = useCallback(() => {
    setOpen(false);
    onConfigureMission();
  }, [onConfigureMission]);

  const handleScroll = useCallback(() => {
    setOpen(false);
    onScrollToExplore();
  }, [onScrollToExplore]);

  // Desktop: left-edge panel. Mobile: bottom sheet.
  const desktopPanel = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 300 } },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.25 } },
  };

  const mobilePanel = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 300 } },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.25 } },
  };

  return (
    <>
      {/* Tab / Handle — always visible when closed */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ delay: 0.5 }}
            onClick={() => setOpen(true)}
            className={`fixed z-30 pointer-events-auto group ${
              isMobile
                ? 'bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3.5 rounded-full'
                : 'left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 pl-4 pr-3 py-5 rounded-r-2xl'
            } bg-black/60 backdrop-blur-xl border border-primary/20 hover:border-primary/40 hover:bg-black/70 transition-all cursor-pointer shadow-[0_0_20px_rgba(var(--primary-rgb,139,92,246),0.15)]`}
            aria-label="Open explore panel"
          >
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(var(--primary-rgb,139,92,246),0)', '0 0 12px rgba(var(--primary-rgb,139,92,246),0.4)', '0 0 0px rgba(var(--primary-rgb,139,92,246),0)'] }}
              transition={{ repeat: 3, duration: 2, ease: 'easeInOut' }}
              className="rounded-full"
            >
              <Compass className="w-5 h-5 text-primary group-hover:text-primary transition-colors" />
            </motion.div>
            <span className="text-[11px] font-mono tracking-[0.2em] text-foreground/80 group-hover:text-foreground uppercase transition-colors font-medium">
              Explore
            </span>
            {!isMobile && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop on mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm pointer-events-auto"
                onClick={() => setOpen(false)}
              />
            )}

            <motion.div
              ref={panelRef}
              variants={isMobile ? mobilePanel : desktopPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`fixed z-40 pointer-events-auto ${
                isMobile
                  ? 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[80vh] overflow-y-auto'
                  : 'left-0 top-0 bottom-0 w-[320px]'
              } bg-black/70 backdrop-blur-2xl border-r border-white/10 flex flex-col`}
            >
              {/* Close button */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary/70" />
                  <span className="text-[10px] font-mono tracking-[0.25em] text-foreground/60 uppercase">Nomad Spin</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-5 px-5 py-4">
                {/* Badge */}
                <span className="inline-block self-start px-3 py-1 rounded-full border border-border/40 bg-white/[0.03] text-[9px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
                  Travel Discovery Tool for Digital Nomads
                </span>

                {/* Tagline */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-mono tracking-wide text-foreground leading-tight">
                    Spin the globe.<br />Find your next digital nomad base.
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Compare cost of living, internet, safety, and book stays, flights, and eSIMs in one place.
                  </p>
                </div>

                {/* Spin button */}
                <SpinButton onClick={handleSpin} label="SPIN & COMPARE DESTINATIONS" />

                {/* Saved spins */}
                <SavedSpins />

                {/* Scroll to explore */}
                <button
                  onClick={handleScroll}
                  className="flex items-center justify-center gap-2 cursor-pointer group bg-white/[0.04] rounded-lg px-6 py-3 border border-white/10 hover:border-white/20 transition-all"
                  aria-label="Scroll to explore destinations"
                >
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="text-xs font-mono tracking-[0.25em] text-foreground/70 uppercase italic"
                  >
                    Scroll to explore ↓
                  </motion.span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
