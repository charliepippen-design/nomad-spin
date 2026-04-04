import { useState, useRef, useEffect, useCallback, type TouchEvent as ReactTouchEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import TrustBadge from '@/components/social-proof/TrustBadge';
import AvatarCluster from '@/components/social-proof/AvatarCluster';
import {
  Compass, X, ChevronUp, Globe2, Sun, Moon, Volume2, VolumeX,
  Flame, Bookmark, LogOut, MapPin, DollarSign, Wifi, Clock,
  BarChart3, ShoppingBag, ArrowUp, Coffee
} from 'lucide-react';
import PublisherLogoCloud from '@/components/social-proof/PublisherLogoCloud';
import TestimonialGrid from '@/components/social-proof/TestimonialGrid';
import SpinButton from '@/components/SpinButton';
import SavedSpins from '@/components/SavedSpins';
import OriginSelector from '@/components/OriginSelector';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { featuredDestinations } from '@/data/featuredDestinations';
import type { Origin } from '@/data/origins';
import type { User as SupaUser } from '@supabase/supabase-js';

// Featured destinations
const FEATURED_SLUGS = ['buenos-aires', 'medellin', 'bangkok', 'lisbon', 'tbilisi', 'mexico-city'];
const featuredCities = FEATURED_SLUGS
  .map((slug) => cities.find((c) => slugify(c.name) === slug))
  .filter(Boolean) as typeof cities;

// How it works data
const steps = [
  { icon: Globe2, number: '01', title: 'Spin & Select', description: 'Spin the globe and discover a city matched to your preferences.' },
  { icon: BarChart3, number: '02', title: 'Compare Metrics', description: 'Review cost of living, internet speed, safety, and more at a glance.' },
  { icon: ShoppingBag, number: '03', title: 'Book What You Need', description: 'Find stays, flights, eSIMs, and insurance — all in one place.' },
];

const benefits = [
  { icon: Wifi, text: 'Avoid slow internet traps' },
  { icon: DollarSign, text: 'Optimize cost vs. quality of life' },
  { icon: Clock, text: 'Plan trips in minutes instead of days' },
];

// Mobile bottom sheet states
type SheetState = 'hidden' | 'peeking' | 'expanded';
const PEEK_HEIGHT_VH = 15; // 15% of viewport

interface LandingDrawerProps {
  onConfigureMission: () => void;
  onOpenCityWall: () => void;
  autoSpin: boolean;
  setAutoSpin: (v: boolean | ((prev: boolean) => boolean)) => void;
  dayMode: boolean;
  setDayMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  soundMuted: boolean;
  toggleSound: () => void;
  origin: Origin | null;
  setOrigin: (origin: Origin | null) => void;
  isAuthenticated: boolean;
  user: SupaUser | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
  streak: number;
  spinCount: number;
}

export default function LandingDrawer({
  onConfigureMission, onOpenCityWall,
  autoSpin, setAutoSpin, dayMode, setDayMode, soundMuted, toggleSound,
  origin, setOrigin,
  isAuthenticated, user, onSignOut, onOpenAuth,
  streak, spinCount,
}: LandingDrawerProps) {
  // Desktop: simple open/close
  const [desktopOpen, setDesktopOpen] = useState(false);
  // Mobile: three-state bottom sheet
  const [sheetState, setSheetState] = useState<SheetState>('peeking');

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Touch gesture tracking
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isDraggingHandle = useRef(false);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Desktop: click outside to close
  useEffect(() => {
    if (isMobile || !desktopOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setDesktopOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [desktopOpen, isMobile]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobile) {
          setSheetState((s) => (s === 'expanded' ? 'peeking' : 'hidden'));
        } else {
          setDesktopOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isMobile]);

  const handleSpin = useCallback(() => {
    if (isMobile) setSheetState('hidden');
    else setDesktopOpen(false);
    onConfigureMission();
  }, [onConfigureMission, isMobile]);

  // --- Mobile touch gesture handlers ---
  const onHandleTouchStart = useCallback((e: ReactTouchEvent) => {
    isDraggingHandle.current = true;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }, []);

  const onHandleTouchEnd = useCallback((e: ReactTouchEvent) => {
    if (!isDraggingHandle.current) return;
    isDraggingHandle.current = false;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const elapsed = Date.now() - touchStartTime.current;
    const velocity = Math.abs(deltaY) / elapsed; // px/ms
    const isSwipe = velocity > 0.3 || Math.abs(deltaY) > 60;

    if (!isSwipe) return;

    if (deltaY < 0) {
      // Swipe up
      setSheetState((s) => (s === 'peeking' ? 'expanded' : s));
    } else {
      // Swipe down
      setSheetState((s) => (s === 'expanded' ? 'peeking' : s === 'peeking' ? 'hidden' : s));
    }
  }, []);

  // Desktop animation variants
  const desktopPanel = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 300 } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.25 } },
  };

  // Section divider
  const Divider = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 pt-2">
      <div className="flex-1 h-px bg-white/[0.06]" />
      <span className="text-[9px] font-mono tracking-[0.25em] text-muted-foreground/50 uppercase">{label}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );

  // Toggle row
  const ToggleRow = ({ label, checked, onChange, icon: Icon }: { label: string; checked: boolean; onChange: () => void; icon: React.ElementType }) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[10px] font-mono tracking-[0.15em] text-foreground/70 uppercase">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} className="scale-75" />
    </div>
  );

  // Shared scrollable content (used by both desktop panel and mobile sheet)
  const DrawerContent = () => (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-5 overscroll-contain">
      {/* Badge */}
      <span className="inline-block self-start px-3 py-1 rounded-full border border-border/40 bg-white/[0.03] text-[9px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
        Travel Discovery Tool for Digital Nomads
      </span>

      {/* Tagline */}
      <TrustBadge />
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-mono tracking-wide text-foreground leading-tight">
          Spin the globe.<br />Find your next digital nomad base.
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Compare cost of living, internet, safety, and book stays, flights, and eSIMs in one place.
        </p>
        <AvatarCluster />
      </div>

      {/* Spin button */}
      <SpinButton onClick={handleSpin} label="SPIN & COMPARE DESTINATIONS" />

      {/* Explore Cities button */}
      <button
        onClick={() => { if (isMobile) setSheetState('hidden'); else setDesktopOpen(false); onOpenCityWall(); }}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all"
      >
        <Globe2 className="w-4 h-4 text-foreground/70" />
        <span className="text-[10px] font-mono tracking-[0.2em] text-foreground/70 uppercase font-medium">Explore All Cities</span>
      </button>

      {/* Globe Controls */}
      <Divider label="Globe Controls" />
      <div className="space-y-1">
        <ToggleRow label="Auto-spin" checked={autoSpin} onChange={() => setAutoSpin(s => !s)} icon={Globe2} />
        <ToggleRow label={dayMode ? 'Day mode' : 'Night mode'} checked={dayMode} onChange={() => setDayMode(d => !d)} icon={dayMode ? Sun : Moon} />
        <ToggleRow label={soundMuted ? 'Sound off' : 'Sound on'} checked={!soundMuted} onChange={toggleSound} icon={soundMuted ? VolumeX : Volume2} />
      </div>

      {/* Your Base */}
      <Divider label="Your Base" />
      <OriginSelector value={origin} onChange={setOrigin} />

      {/* Account */}
      <Divider label="Account" />
      <div className="space-y-2">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[9px] font-mono font-bold text-primary">
                  {(user?.user_metadata?.display_name || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <span className="text-[10px] font-mono text-foreground/70 tracking-wider">My picks</span>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-primary/30 bg-primary/[0.06] hover:bg-primary/[0.12] hover:border-primary/50 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-[10px] font-mono text-primary/80 tracking-wider font-medium">Sign in · Save picks</span>
          </button>
        )}
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/40 bg-white/[0.03]">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] font-mono text-foreground/70 tracking-wider">{streak}D</span>
            </div>
          )}
          {spinCount > 0 && (
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{spinCount} spins</span>
          )}
        </div>
      </div>

      {/* Saved Spins */}
      <Divider label="Saved Spins" />
      <SavedSpins />

      {/* Where to Stay */}
      <Divider label="Where to Stay" />
      <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
        Explore our top destination guides — cost breakdowns, neighborhoods, Wi-Fi intel, and more.
      </p>
      <div className="grid grid-cols-1 gap-3">
        {featuredCities.map((city) => (
          <Link
            key={city.id}
            to={`/destinations/${slugify(city.name)}`}
            className="group block rounded-xl overflow-hidden border border-border/30 hover:border-border/60 transition-all"
          >
            <div className="relative h-28 overflow-hidden">
              <img
                src={getCityThumbnailUrl(city.id, city.region)}
                alt={`${city.name}, ${city.country}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-mono text-xs tracking-[0.12em] text-white uppercase truncate">
                  {city.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-white/50" />
                  <span className="text-[9px] font-mono text-white/50">{city.country}</span>
                </div>
              </div>
            </div>
            <div className="bg-card p-2.5 flex items-center gap-1.5">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-mono text-foreground/70">From ${city.costUSD}/mo</span>
            </div>
          </Link>
        ))}
      </div>

      {/* How It Works */}
      <Divider label="How It Works" />
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.number} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{step.number}</span>
              <step.icon className="w-4 h-4 text-foreground/70" />
            </div>
            <h3 className="font-mono text-sm tracking-wider text-foreground">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="space-y-3 pt-1">
        {benefits.map((b) => (
          <div key={b.text} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
              <b.icon className="w-3 h-3 text-foreground/60" />
            </div>
            <span className="text-xs text-muted-foreground">{b.text}</span>
          </div>
        ))}
      </div>

      {/* Data note */}
      <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed pt-2">
        Our dataset covers 1,200+ cities worldwide with curated cost, internet speed, safety, and visa data — updated regularly.
      </p>

      {/* Buy Me a Coffee */}
      <a
        href="https://buymeacoffee.com/digitalnomadspin"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] hover:bg-amber-500/[0.14] hover:border-amber-500/50 transition-all group"
      >
        <Coffee className="w-4 h-4 text-amber-400/70 group-hover:text-amber-400 transition-colors" />
        <span className="text-[11px] font-mono tracking-[0.18em] text-amber-400/70 group-hover:text-amber-400 transition-colors uppercase">
          Buy me a coffee ☕
        </span>
      </a>

      {/* Back to top */}
      <motion.button
        onClick={scrollToTop}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="flex items-center justify-center gap-2 w-full py-3 cursor-pointer"
        aria-label="Back to top"
      >
        <ArrowUp className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono tracking-[0.2em] text-primary uppercase">Back to top</span>
        <ArrowUp className="w-4 h-4 text-primary" />
      </motion.button>
    </div>
  );

  // ============ MOBILE: Three-state bottom sheet ============
  if (isMobile) {
    const peekPx = `${PEEK_HEIGHT_VH}vh`;

    return (
      <>
        {/* Peeking state — always-visible bottom bar */}
        <AnimatePresence>
          {sheetState === 'hidden' && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.4 }}
              onClick={() => setSheetState('peeking')}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2.5 px-7 py-4 rounded-full bg-black/70 backdrop-blur-2xl border border-primary/25 hover:border-primary/50 transition-all shadow-[0_0_30px_rgba(var(--primary-rgb,139,92,246),0.2),0_4px_20px_rgba(0,0,0,0.4)]"
              aria-label="Explore Destinations"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              >
                <Compass className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="text-[11px] font-mono tracking-[0.2em] text-foreground/90 uppercase font-semibold">
                Explore
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Bottom Sheet — peek + expanded */}
        <AnimatePresence>
          {sheetState !== 'hidden' && (
            <>
              {/* Backdrop — only when expanded */}
              {sheetState === 'expanded' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-30 bg-black/30 pointer-events-auto"
                  onClick={() => setSheetState('peeking')}
                />
              )}

              <motion.div
                ref={panelRef}
                initial={{ y: '100%' }}
                animate={{
                  y: sheetState === 'peeking' ? `calc(100% - ${peekPx})` : '20%',
                }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-40 pointer-events-auto rounded-t-2xl flex flex-col bg-black/80 backdrop-blur-2xl border-t border-white/[0.1] shadow-[0_-8px_40px_rgba(0,0,0,0.6)]"
                style={{ height: '100vh', touchAction: 'none' }}
              >
                {/* Grab handle area — swipe target */}
                <div
                  ref={handleRef}
                  onTouchStart={onHandleTouchStart}
                  onTouchEnd={onHandleTouchEnd}
                  className="flex flex-col items-center pt-3 pb-2 cursor-grab shrink-0"
                >
                  {/* Pill handle */}
                  <div className="w-10 h-1 rounded-full bg-white/20 mb-2" />

                  {sheetState === 'peeking' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-primary/60 animate-bounce" />
                      <span className="text-[10px] font-mono tracking-[0.15em] text-foreground/50 uppercase">
                        Swipe up to explore destinations
                      </span>
                      <ChevronUp className="w-3.5 h-3.5 text-primary/60 animate-bounce" />
                    </motion.div>
                  )}

                  {sheetState === 'expanded' && (
                    <div className="flex items-center justify-between w-full px-5">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-primary/70" />
                        <span className="text-[10px] font-mono tracking-[0.25em] text-foreground/60 uppercase">Nomad Spin</span>
                      </div>
                      <button
                        onClick={() => setSheetState('peeking')}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground"
                        aria-label="Collapse"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Peeking preview content */}
                {sheetState === 'peeking' && (
                  <div
                    className="px-5 pb-3 flex items-center gap-3"
                    onTouchStart={onHandleTouchStart}
                    onTouchEnd={onHandleTouchEnd}
                  >
                    <button
                      onClick={() => { setSheetState('hidden'); onConfigureMission(); }}
                      className="flex-1 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-center"
                    >
                      <span className="text-[10px] font-mono tracking-[0.15em] text-primary uppercase font-medium">Spin Globe</span>
                    </button>
                    <button
                      onClick={() => setSheetState('expanded')}
                      className="flex-1 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-center"
                    >
                      <span className="text-[10px] font-mono tracking-[0.15em] text-foreground/70 uppercase font-medium">View All</span>
                    </button>
                  </div>
                )}

                {/* Expanded scrollable content — touch events isolated via overscroll-contain */}
                {sheetState === 'expanded' && (
                  <div
                    className="flex-1 overflow-hidden"
                    style={{ touchAction: 'pan-y' }}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <DrawerContent />
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <PublisherLogoCloud />
        <TestimonialGrid />
      </>
    );
  }

  // ============ DESKTOP: Right-side slide panel ============
  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!desktopOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.5 }}
            onClick={() => setDesktopOpen(true)}
            className="fixed z-30 pointer-events-auto group right-6 bottom-8 flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-black/70 backdrop-blur-2xl border border-primary/25 hover:border-primary/50 hover:bg-black/80 transition-all cursor-pointer shadow-[0_0_30px_rgba(var(--primary-rgb,139,92,246),0.2),0_4px_20px_rgba(0,0,0,0.4)]"
            aria-label="Explore Destinations"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            >
              <Compass className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-[11px] font-mono tracking-[0.2em] text-foreground/90 group-hover:text-foreground uppercase transition-colors font-semibold">
              Explore Destinations
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {desktopOpen && (
          <motion.div
            ref={panelRef}
            variants={desktopPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed z-40 pointer-events-auto right-0 top-0 bottom-0 w-[400px] bg-black/75 backdrop-blur-2xl border-l border-white/[0.08] shadow-[-10px_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary/70" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-foreground/60 uppercase">Nomad Spin</span>
              </div>
              <button
                onClick={() => setDesktopOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <DrawerContent />

            {/* Floating scroll-up button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={scrollToTop}
              className="absolute bottom-4 right-6 z-10 w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <PublisherLogoCloud />
      <TestimonialGrid />
    </>
  );
}
