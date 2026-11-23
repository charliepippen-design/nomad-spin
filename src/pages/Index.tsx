import { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpinStore } from '@/store/useSpinStore';
import { useAccountUi } from '@/store/useAccountUi';
import { useOriginPreference } from '@/hooks/useOriginPreference';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useSignOut } from '@/hooks/useSignOut';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useCityEnrichment } from '@/hooks/useCityEnrichment';
import { calculateMatchScore, generateIntel, generateRisks } from '@/lib/scoring';
import PreferencesModal from '@/components/PreferencesModal';
import ResultCard from '@/components/ResultCard';
import TopResultsGrid from '@/components/TopResultsGrid';
import LandingDrawer from '@/components/LandingDrawer';
import SEO from '@/components/SEO';
import HomeHero from '@/components/HomeHero';
import HomeGuides from '@/components/HomeGuides';
import { cities as ALL_CITIES } from '@/data/cities';
import SocialShareBar from '@/components/SocialShareBar';
import CityWallModal from '@/components/explore/CityWallModal';
import GlobeTapHint from '@/components/GlobeTapHint';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { trackEvent } from '@/utils/analytics';
import { citySlug } from '@/lib/citySlug';
import { guides } from '@/data/guides';
import { HOME_DESCRIPTION, HOME_GUIDES_LINK, HOME_H1, HOME_INTRO, HOME_TITLE } from '@/lib/homeSeo';

import { RotateCcw } from 'lucide-react';
import CityTooltip from '@/components/CityTooltip';
import { useIsMobile, useIsPhone } from '@/hooks/use-mobile';
import type { City } from '@/data/cities';
import { AnimatePresence as TooltipPresence } from 'framer-motion';

const Globe = lazy(() => import('@/components/Globe'));

const GLOBE_ONLY_HASH = '#globe';

// Phones (below the sm breakpoint) show a compact hero on top and the Explore button at the bottom.
/** How far the globe slides down so its centre sits in the middle of the space between them. */
const PHONE_GLOBE_OFFSET_PX = 80;
/** Finger travel that counts as dragging the globe rather than tapping it. */
const PHONE_DRAG_THRESHOLD_PX = 8;
/** The hero comes back this long after the finger lifts. */
const PHONE_HERO_RETURN_MS = 2000;

const GlobeFallback = () => (
  <div className="w-full h-full absolute inset-0 flex items-center justify-center bg-background">
    <motion.div
      animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      className="w-32 h-32 rounded-full bg-muted/30 border border-border/20 flex items-center justify-center"
    >
      <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">LOADING</span>
    </motion.div>
  </div>
);

export default function Index() {
  const { phase, setPhase, filterCities, spin, resultCity, topResults, selectResult, saveResult, resetForRespin, preferences, getShareableUrl } = useSpinStore();
  const setPicksOpen = useAccountUi((s) => s.setPicksOpen);
  const setAuthOpen = useAccountUi((s) => s.setAuthOpen);
  const [origin, setOrigin] = useOriginPreference();
  const auth = useAuth();
  const signOut = useSignOut();
  const cloudSync = useCloudSync(auth.user?.id);
  const [showPrefs, setShowPrefs] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(0.003);
  const [resetCamera, setResetCamera] = useState(false);
  // The globe follows the site theme: day texture on light, night texture on dark.
  const { resolvedTheme } = useTheme();
  const dayMode = resolvedTheme === 'light';
  // The globe turns slowly at rest and stops for good at the first drag.
  const [autoSpin, setAutoSpin] = useState(true);
  // City card on the globe. `pinned` = opened by a click or tap, so it stays until dismissed.
  const [activeCity, setActiveCity] = useState<{ city: City; pos: { x: number; y: number }; pinned: boolean } | null>(null);
  const cardHideTimer = useRef<ReturnType<typeof setTimeout>>();
  const cardSwitchTimer = useRef<ReturnType<typeof setTimeout>>();
  // Mirror of activeCity for event handlers, which must decide without waiting for a render.
  const activeCityRef = useRef(activeCity);
  activeCityRef.current = activeCity;
  const [isCityWallOpen, setIsCityWallOpen] = useState(false);
  // Globe-only mode: every overlay is hidden so the visitor can just play with the globe.
  // It lives in the URL hash so the browser Back button leaves it.
  const location = useLocation();
  const navigate = useNavigate();
  const globeOnly = location.hash === GLOBE_ONLY_HASH;
  const setGlobeOnly = useCallback(
    (on: boolean) => {
      if (on) navigate(GLOBE_ONLY_HASH, { state: { enteredHere: true } });
      else if ((location.state as { enteredHere?: boolean } | null)?.enteredHere) navigate(-1);
      else navigate('/', { replace: true });
    },
    [navigate, location.state],
  );
  const selectedOnGlobe = useRef(new Set<string>());
  // True while the globe is being dragged; the hero fades out of the way.
  const [globeBusy, setGlobeBusy] = useState(false);
  const globeBusyTimer = useRef<ReturnType<typeof setTimeout>>();
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [howItWorksRequest, setHowItWorksRequest] = useState(0);
  const isMobile = useIsMobile();
  const isPhone = useIsPhone();
  const isPhoneRef = useRef(isPhone);
  isPhoneRef.current = isPhone;
  // Where a touch on the globe started, to tell a drag from a tap on phones.
  const globeTouchStart = useRef<{ x: number; y: number } | null>(null);

  // A hovered card lingers briefly after the mouse leaves the marker, long enough to reach the card.
  // React reports "entered the card" before the canvas reports "left the globe",
  // so the hide request is ignored while the pointer is known to be on the card.
  const pointerOnCard = useRef(false);
  const scheduleCardHide = useCallback(() => {
    clearTimeout(cardHideTimer.current);
    if (pointerOnCard.current) return;
    cardHideTimer.current = setTimeout(() => setActiveCity((current) => (current?.pinned ? current : null)), 400);
  }, []);
  const keepCardOpen = useCallback(() => {
    pointerOnCard.current = true;
    clearTimeout(cardHideTimer.current);
    clearTimeout(cardSwitchTimer.current);
  }, []);
  const leaveCard = useCallback(() => {
    pointerOnCard.current = false;
    scheduleCardHide();
  }, [scheduleCardHide]);
  const closeCard = useCallback(() => {
    pointerOnCard.current = false;
    clearTimeout(cardHideTimer.current);
    clearTimeout(cardSwitchTimer.current);
    setActiveCity(null);
  }, []);

  const handleCityPick = useCallback(
    (city: City | null, pos: { x: number; y: number } | null, kind: 'hover' | 'tap') => {
      if (city && pos) {
        // One event per city per visit: a hover or tap on its marker.
        if (!selectedOnGlobe.current.has(city.id)) {
          selectedOnGlobe.current.add(city.id);
          trackEvent('globe_city_select', { city: city.id, city_slug: citySlug(city) });
        }
        clearTimeout(cardHideTimer.current);
        clearTimeout(cardSwitchTimer.current);
        if (kind === 'tap') {
          setActiveCity({ city, pos, pinned: true });
          return;
        }
        const next = { city, pos, pinned: false };
        const current = activeCityRef.current;
        // Passing over other markers does not replace a card the visitor pinned.
        if (current?.pinned) return;
        if (!current || current.city.id === city.id) {
          setActiveCity(next);
          return;
        }
        // Another card is open: switch only if the mouse rests on the new marker,
        // so crossing markers on the way to the card does not swap it away.
        cardSwitchTimer.current = setTimeout(() => setActiveCity((now) => (now?.pinned ? now : next)), 250);
        return;
      }
      clearTimeout(cardSwitchTimer.current);
      // A click or tap on empty globe dismisses; the mouse leaving a marker starts the grace period.
      if (kind === 'tap') closeCard();
      else scheduleCardHide();
    },
    [closeCard, scheduleCardHide],
  );

  useEffect(
    () => () => {
      clearTimeout(cardHideTimer.current);
      clearTimeout(cardSwitchTimer.current);
    },
    [],
  );

  // Floating globe controls step aside once the visitor scrolls into the editorial block.
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape leaves globe-only mode.
  useEffect(() => {
    if (!globeOnly) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGlobeOnly(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [globeOnly, setGlobeOnly]);

  // Release anywhere ends a globe drag; the hero comes back shortly after.
  useEffect(() => {
    const onUp = () => {
      globeTouchStart.current = null;
      clearTimeout(globeBusyTimer.current);
      globeBusyTimer.current = setTimeout(
        () => setGlobeBusy(false),
        isPhoneRef.current ? PHONE_HERO_RETURN_MS : 500,
      );
    };
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      clearTimeout(globeBusyTimer.current);
    };
  }, []);

  // Load from URL params on mount
  useEffect(() => {
    const loaded = useSpinStore.getState().loadFromUrl();
    if (loaded) setShowPrefs(true);
  }, []);

  const handleScrollToHowItWorks = useCallback(() => {
    if (phase === 'spinning') return;
    if (phase !== 'landing' && phase !== 'preferences') setPhase('landing');
    setHowItWorksRequest((n) => n + 1);
  }, [phase, setPhase]);

  const handleConfigureMission = useCallback(() => {
    setShowPrefs(true);
  }, []);

  const startSpin = useCallback(() => {
    setShowPrefs(false);
    setResetCamera(false);
    setPhase('spinning');
    setIsSpinning(true);
    setSpinSpeed(0.8);
    // One event per spin: this replaces the old on-screen spin counter.
    const { preferences: prefs } = useSpinStore.getState();
    trackEvent('spin', {
      region: prefs.region,
      has_origin: !!prefs.origin && prefs.origin.id !== 'anywhere',
    });

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    setTimeout(() => setSpinSpeed(0.3), 1000);
    setTimeout(() => setSpinSpeed(0.08), 2000);
    setTimeout(() => {
      setSpinSpeed(0.015);
      spin();
    }, 2800);
    setTimeout(() => {
      setIsSpinning(false);
      setSpinSpeed(0.003);
      setPhase('results');
      if (auth.isAuthenticated) cloudSync.syncPreferences();
    }, 3500);
  }, [spin, setPhase, auth.isAuthenticated, cloudSync]);

  const handleRespin = useCallback(() => {
    resetForRespin();
    setResetCamera(true);
    setTimeout(() => {
      setResetCamera(false);
      startSpin();
    }, 350);
  }, [startSpin, resetForRespin]);

  const handleShare = useCallback(() => {
    if (!resultCity) return;
    const url = getShareableUrl();
    if (navigator.share) {
      navigator.share({
        title: `Destination: ${resultCity.name}`,
        text: `Next stop: ${resultCity.name}, ${resultCity.country}. Cost: $${resultCity.costUSD}/mo | Safety: ${resultCity.safety}/10`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
    }
  }, [resultCity, getShareableUrl]);


  // Use the top result's score if available, otherwise fallback to legacy
  const primaryScored = topResults[0];
  const matchScore = primaryScored?.score ?? (resultCity
    ? calculateMatchScore(resultCity, preferences.budgetRange[1], preferences.internetMin, preferences.safetyMin, preferences.origin)
    : 0);

  // Lazy AI enrichment for the displayed city
  const { enrichedCity } = useCityEnrichment(resultCity);
  const displayCity = enrichedCity || resultCity;

  const intel = displayCity
    ? generateIntel(displayCity, preferences.budgetRange[1], preferences.internetMin, preferences.origin)
    : [];

  const risks = displayCity ? generateRisks(displayCity) : [];

  const shareUrl = resultCity ? getShareableUrl() : window.location.href;

  return (
    <div className="noise-overlay relative min-h-screen w-full overflow-x-hidden bg-background">
      <SEO
        title={HOME_TITLE}
        description={HOME_DESCRIPTION}
        path="/"
      />

      {/* Globe — full-screen background layer */}
      <div
        className="fixed inset-0 z-0"
        onPointerDown={(e) => {
          clearTimeout(globeBusyTimer.current);
          // On phones a tap picks a city; only a real drag clears the hero away.
          if (isPhone) globeTouchStart.current = { x: e.clientX, y: e.clientY };
          else setGlobeBusy(true);
        }}
        onPointerMove={(e) => {
          const start = globeTouchStart.current;
          if (!start || Math.hypot(e.clientX - start.x, e.clientY - start.y) < PHONE_DRAG_THRESHOLD_PX) return;
          globeTouchStart.current = null;
          clearTimeout(globeBusyTimer.current);
          setGlobeBusy(true);
        }}
      >
        <Suspense fallback={<GlobeFallback />}>
          <Globe
            spinning={isSpinning}
            spinSpeed={spinSpeed}
            resetCamera={resetCamera}
            dayMode={dayMode}
            autoSpin={autoSpin}
            focusCity={phase === 'results' ? resultCity : flyToTarget ? ({ lat: flyToTarget.lat, lng: flyToTarget.lng } as City) : null}
            onAutoSpinOff={() => setAutoSpin(false)}
            activeCityId={activeCity?.city.id ?? null}
            onCityPick={handleCityPick}
            offsetY={isPhone && phase === 'landing' && !globeOnly ? PHONE_GLOBE_OFFSET_PX : 0}
          />
        </Suspense>

        {/* Mobile tap hint */}
        {phase === 'landing' && !isSpinning && !globeOnly && <GlobeTapHint />}
      </div>


      {/* City Tooltip */}
      <TooltipPresence>
        {activeCity && !isSpinning && (
          <CityTooltip
            key={activeCity.city.id}
            city={activeCity.city}
            x={activeCity.pos.x}
            y={activeCity.pos.y}
            sheet={isMobile}
            pinned={activeCity.pinned}
            onClose={closeCard}
            onPointerEnter={keepCardOpen}
            onPointerLeave={leaveCard}
          />
        )}
      </TooltipPresence>

      {/* Subtle edge vignette — pointer-events-none so globe stays interactive */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/30 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col pointer-events-none">
        {phase === 'landing' && !isSpinning && !showPrefs && !globeOnly && (
          <HomeHero
            onSpin={handleConfigureMission}
            cityCount={ALL_CITIES.length}
            onGlobeOnly={() => setGlobeOnly(true)}
            onHowItWorks={handleScrollToHowItWorks}
            dimmed={globeBusy}
          />
        )}

        {globeOnly && phase === 'landing' && (
          <button
            type="button"
            onClick={() => setGlobeOnly(false)}
            className="dns-btn-secondary pointer-events-auto fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 !bg-card/90 backdrop-blur"
          >
            Show menu <span className="hidden text-xs font-normal text-muted-foreground sm:inline">Esc</span>
          </button>
        )}

        {/* Main */}
        <div className={`flex-1 flex flex-col items-center justify-end ${isMobile ? 'pb-4 px-3' : 'pb-8 px-4'}`}>
          <AnimatePresence mode="wait">
            {/* Spinning */}
            {phase === 'spinning' && (
              <motion.div
                key="spinning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 pointer-events-auto"
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="text-center"
                >
                  <p className="font-mono text-xs tracking-[0.3em] text-foreground/60 uppercase">
                    FINDING YOUR MATCH...
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Results */}
            {phase === 'results' && resultCity && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-4 pointer-events-auto"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
                >
                  YOUR TOP PICKS
                </motion.p>

                <TopResultsGrid
                  topResults={topResults}
                  onSelectResult={(index) => selectResult(index)}
                  primaryContent={
                    <ResultCard
                      key={displayCity!.id}
                      city={displayCity!}
                      matchScore={matchScore}
                      matchReason={primaryScored?.reason}
                      intel={intel}
                      risks={risks}
                      originCity={preferences.origin?.name}
                      flightInfo={primaryScored?.flightInfo}
                      onSave={() => {
                        saveResult();
                        if (auth.isAuthenticated) {
                          const latestSpin = useSpinStore.getState().savedSpins.at(-1);
                          if (latestSpin) cloudSync.saveSpin(latestSpin);
                        }
                      }}
                      onRespin={handleRespin}
                      onShare={handleShare}
                    />
                  }
                />

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  onClick={() => setPhase('landing')}
                  className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-2 tracking-[0.2em] uppercase"
                >
                  <RotateCcw className="w-3 h-3" />
                  START OVER
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Visible intro and links. Same content as the prerendered #seo-home block. */}
      <HomeGuides guides={guides} />

      {/* Featured Destinations + How It Works now live inside the Command Drawer */}

      {/* Preferences Modal */}
      <PreferencesModal
        open={showPrefs}
        onClose={() => {
          setShowPrefs(false);
          if (auth.isAuthenticated) {
            cloudSync.syncPreferences();
          }
        }}
        onSpin={startSpin}
      />

      {/* Landing Drawer — unified landing surface */}
      {(phase === 'landing' || phase === 'preferences') && !isSpinning && !globeOnly && !pastHero && (
        <LandingDrawer
          onConfigureMission={handleConfigureMission}
          onOpenCityWall={() => setIsCityWallOpen(true)}
          origin={origin}
          setOrigin={setOrigin}
          isAuthenticated={auth.isAuthenticated}
          user={auth.user}
          onSignOut={signOut}
          onOpenPicks={() => setPicksOpen(true)}
          onOpenAuth={() => setAuthOpen(true)}
          onFlyTo={(lat, lng) => setFlyToTarget({ lat, lng })}
          howItWorksRequest={howItWorksRequest}
        />
      )}


      {/* Social Share Bar — always visible */}
      {!globeOnly && !pastHero && (
        <SocialShareBar
          cityName={resultCity?.name}
          country={resultCity?.country}
          shareUrl={shareUrl}
        />
      )}

      {/* City Wall Modal */}
      <CityWallModal isOpen={isCityWallOpen} onClose={() => setIsCityWallOpen(false)} />
    </div>
  );
}
