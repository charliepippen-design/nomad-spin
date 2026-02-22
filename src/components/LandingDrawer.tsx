import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import TrustBadge from '@/components/social-proof/TrustBadge';
import AvatarCluster from '@/components/social-proof/AvatarCluster';
import {
  Compass, X, ChevronRight, Globe2, Sun, Moon, Volume2, VolumeX,
  Flame, Bookmark, LogOut, MapPin, DollarSign, Wifi, Clock,
  BarChart3, ShoppingBag, ArrowUp
} from 'lucide-react';
import PublisherLogoCloud from '@/components/social-proof/PublisherLogoCloud';
import TestimonialGrid from '@/components/social-proof/TestimonialGrid';
import SpinButton from '@/components/SpinButton';
import SavedSpins from '@/components/SavedSpins';
import OriginSelector from '@/components/OriginSelector';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { cities } from '@/data/cities';
import { getCityThumbnailUrl } from '@/data/cityImages';
import { slugify } from '@/lib/slugify';
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

interface LandingDrawerProps {
  onConfigureMission: () => void;
  onOpenCityWall: () => void;
  // Globe controls
  autoSpin: boolean;
  setAutoSpin: (v: boolean | ((prev: boolean) => boolean)) => void;
  dayMode: boolean;
  setDayMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  soundMuted: boolean;
  toggleSound: () => void;
  // Origin
  origin: Origin | null;
  setOrigin: (origin: Origin | null) => void;
  // Auth
  isAuthenticated: boolean;
  user: SupaUser | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
  // Stats
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
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
                  ? 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh]'
                  : 'left-0 top-0 bottom-0 w-[360px]'
              } bg-black/70 backdrop-blur-2xl border-r border-white/10 flex flex-col overflow-hidden`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
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

              {/* Scrollable content */}
              <div ref={scrollRef} className="flex-1 overflow-y-scroll px-5 py-4 space-y-5 scrollbar-visible">
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
                  onClick={() => { setOpen(false); onOpenCityWall(); }}
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
                  {/* Stats */}
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


                {/* Back to top hint */}
                <motion.button
                  onClick={scrollToTop}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="flex items-center justify-center gap-2 w-full py-3 cursor-pointer"
                  aria-label="Back to top"
                >
                  <ArrowUp className="w-4 h-4 text-[#ffeb3b]" />
                  <span className="text-xs font-mono tracking-[0.2em] text-[#ffeb3b] uppercase">Back to top</span>
                  <ArrowUp className="w-4 h-4 text-[#ffeb3b]" />
                </motion.button>
              </div>

              {/* Always-visible floating scroll-up button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={scrollToTop}
                className="absolute bottom-4 right-6 z-10 w-12 h-12 rounded-full bg-[#ffeb3b] hover:bg-[#fff176] text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,235,59,0.4)] transition-colors"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-6 h-6" strokeWidth={3} />
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Overlays — fixed on desktop, rendered inline on mobile via their own logic */}
      <PublisherLogoCloud />
      <TestimonialGrid />
    </>
  );
}
