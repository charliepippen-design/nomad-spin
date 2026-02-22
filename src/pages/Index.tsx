import { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
import dnsLogo from '@/assets/dns-logo.png';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpinStore } from '@/store/useSpinStore';
import { useSoundManager } from '@/hooks/useSoundManager';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useCityEnrichment } from '@/hooks/useCityEnrichment';
import { calculateMatchScore, generateIntel, generateRisks } from '@/lib/scoring';
import PreferencesModal from '@/components/PreferencesModal';
import ResultCard from '@/components/ResultCard';
import TopResultsGrid from '@/components/TopResultsGrid';
import LandingDrawer from '@/components/LandingDrawer';
import AuthModal from '@/components/AuthModal';
import SEO from '@/components/SEO';
import SocialShareBar from '@/components/SocialShareBar';
import CityWallModal from '@/components/explore/CityWallModal';
import MobileNav from '@/components/MobileNav';
import MobileHeroCopy from '@/components/MobileHeroCopy';
import GlobeTapHint from '@/components/GlobeTapHint';
import { RotateCcw } from 'lucide-react';
import CityTooltip from '@/components/CityTooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import type { City } from '@/data/cities';
import { AnimatePresence as TooltipPresence } from 'framer-motion';

const Globe = lazy(() => import('@/components/Globe'));

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
  const { phase, setPhase, filterCities, spin, resultCity, topResults, selectResult, saveResult, spinCount, streak, resetForRespin, preferences, setPreferences, getShareableUrl } = useSpinStore();
  const sound = useSoundManager();
  const auth = useAuth();
  const cloudSync = useCloudSync(auth.user?.id);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(0.003);
  const [resetCamera, setResetCamera] = useState(false);
  const [dayMode, setDayMode] = useState(true);
  const [autoSpin, setAutoSpin] = useState(false);
  const [hoveredCity, setHoveredCity] = useState<{ city: City; pos: { x: number; y: number } } | null>(null);
  const [isCityWallOpen, setIsCityWallOpen] = useState(false);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const hasMigrated = useRef(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleCityHover = useCallback((city: City | null, pos: { x: number; y: number } | null) => {
    if (city && pos) {
      setHoveredCity({ city, pos });
    } else {
      setHoveredCity(null);
    }
  }, []);

  // Load from URL params on mount
  useEffect(() => {
    const loaded = useSpinStore.getState().loadFromUrl();
    if (loaded) setShowPrefs(true);
  }, []);

  // Sync from cloud when user authenticates
  useEffect(() => {
    if (auth.isAuthenticated && auth.user && !hasMigrated.current) {
      hasMigrated.current = true;
      cloudSync.loadSavedSpins();
      cloudSync.loadStreaks();
      cloudSync.loadPreferences();
      cloudSync.migrateLocalData();
      toast({
        title: "You're in",
        description: "Your picks and settings will now be saved.",
      });
    }
  }, [auth.isAuthenticated, auth.user?.id]);

  // Idle hum on mount
  useEffect(() => {
    const t = setTimeout(() => sound.startIdle(), 2000);
    return () => { clearTimeout(t); sound.stopIdle(); };
  }, []);

  const handleConfigureMission = useCallback(() => {
    setShowPrefs(true);
  }, []);

  const startSpin = useCallback(() => {
    setShowPrefs(false);
    setResetCamera(false);
    setPhase('spinning');
    setIsSpinning(true);
    setSpinSpeed(0.8);

    sound.startSpin();
    sound.updateSpinPitch(0.8);

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    setTimeout(() => { setSpinSpeed(0.3); sound.updateSpinPitch(0.3); }, 1000);
    setTimeout(() => {
      setSpinSpeed(0.08);
      sound.updateSpinPitch(0.08);
      let tickCount = 0;
      tickIntervalRef.current = setInterval(() => {
        sound.playTick();
        tickCount++;
        if (tickCount > 6) clearInterval(tickIntervalRef.current);
      }, 200);
    }, 2000);
    setTimeout(() => {
      setSpinSpeed(0.015);
      sound.updateSpinPitch(0.015);
      spin();
    }, 2800);
    setTimeout(() => {
      setIsSpinning(false);
      setSpinSpeed(0.003);
      sound.stopSpin();
      sound.playResult();
      setPhase('results');
      clearInterval(tickIntervalRef.current);
      if (auth.isAuthenticated) {
        cloudSync.syncStreaks();
        cloudSync.syncPreferences();
      }
    }, 3500);
  }, [spin, setPhase, sound, auth.isAuthenticated, cloudSync]);

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
        text: `Next stop: ${resultCity.name}, ${resultCity.country} — Cost: $${resultCity.costUSD}/mo | Safety: ${resultCity.safety}/10`,
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
        title={resultCity ? `${resultCity.name} — Nomad Spin` : 'Digital Nomad Spin | Find Your Next Destination'}
        description={resultCity ? `Next stop: ${resultCity.name}, ${resultCity.country}. Cost: $${resultCity.costUSD}/mo.` : 'Stop overthinking. Spin the globe. Find your next destination.'}
        city={resultCity}
      />

      {/* Mobile hamburger nav */}
      <MobileNav onExplore={() => setIsCityWallOpen(true)} />

      {/* Globe */}
      <div className={`${isMobile ? 'relative h-[70vh]' : 'absolute inset-0'} z-0`}>
        <Suspense fallback={<GlobeFallback />}>
          <Globe
            spinning={isSpinning}
            spinSpeed={spinSpeed}
            resetCamera={resetCamera}
            dayMode={dayMode}
            autoSpin={autoSpin}
            focusCity={phase === 'results' ? resultCity : null}
            onAutoSpinOff={() => setAutoSpin(false)}
            onCityHover={handleCityHover}
          />
        </Suspense>

        {/* Mobile tap hint */}
        {phase === 'landing' && !isSpinning && <GlobeTapHint />}

        {/* Mobile hero copy overlay */}
        {phase === 'landing' && !isSpinning && (
          <MobileHeroCopy onCTA={handleConfigureMission} />
        )}
      </div>

      {/* City Tooltip */}
      <TooltipPresence>
        {hoveredCity && (
          <CityTooltip
            key={hoveredCity.city.id}
            city={hoveredCity.city}
            x={hoveredCity.pos.x}
            y={hoveredCity.pos.y}
          />
        )}
      </TooltipPresence>

      {/* Gradient overlays — desktop only */}
      {!isMobile && (
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 ${isMobile ? '' : 'min-h-screen'} flex flex-col pointer-events-none`}>
        {/* Header — desktop only (mobile uses MobileNav) */}
        {!isMobile && (
          <header className="pointer-events-auto sticky top-0 z-20 flex items-center px-4 md:px-8 py-2 bg-background/60 backdrop-blur-md">
            <img src={dnsLogo} alt="Digital Nomad Spin" className="h-10 w-auto" />
          </header>
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

      {/* Auth Modal */}
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSignUp={async (email, password, name) => {
          const result = await auth.signUp(email, password, name);
          if (!result.error) {
            setTimeout(() => cloudSync.migrateLocalData(), 1000);
          }
          return result;
        }}
        onSignIn={async (email, password) => {
          const result = await auth.signIn(email, password);
          return result;
        }}
      />

      {/* Landing Drawer — unified landing surface */}
      {(phase === 'landing' || phase === 'preferences') && !isSpinning && (
        <LandingDrawer
          onConfigureMission={handleConfigureMission}
          onOpenCityWall={() => setIsCityWallOpen(true)}
          autoSpin={autoSpin}
          setAutoSpin={setAutoSpin}
          dayMode={dayMode}
          setDayMode={setDayMode}
          soundMuted={sound.muted}
          toggleSound={sound.toggleMute}
          origin={preferences.origin}
          setOrigin={(origin) => setPreferences({ origin })}
          isAuthenticated={auth.isAuthenticated}
          user={auth.user}
          onSignOut={auth.signOut}
          onOpenAuth={() => setShowAuth(true)}
          streak={streak}
          spinCount={spinCount}
        />
      )}


      {/* Social Share Bar — always visible */}
      <SocialShareBar
        cityName={resultCity?.name}
        country={resultCity?.country}
        shareUrl={shareUrl}
      />

      {/* City Wall Modal */}
      <CityWallModal isOpen={isCityWallOpen} onClose={() => setIsCityWallOpen(false)} />
    </div>
  );
}
