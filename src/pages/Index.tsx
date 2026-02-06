import { useState, useCallback, useRef, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpinStore } from '@/store/useSpinStore';
import { useSoundManager } from '@/hooks/useSoundManager';
import SpinButton from '@/components/SpinButton';
import PreferencesModal from '@/components/PreferencesModal';
import ResultCard from '@/components/ResultCard';
import SavedSpins from '@/components/SavedSpins';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';

const Globe = lazy(() => import('@/components/Globe'));

const GlobeFallback = () => (
  <div className="w-full h-full absolute inset-0 flex items-center justify-center">
    <div className="w-24 h-24 rounded-full border border-border/30 flex items-center justify-center">
      <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em]">LOADING</span>
    </div>
  </div>
);

export default function Index() {
  const { phase, setPhase, filterCities, spin, resultCity, saveResult, spinCount, resetForRespin } = useSpinStore();
  const sound = useSoundManager();
  const [showPrefs, setShowPrefs] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(0.003);
  const [resetCamera, setResetCamera] = useState(false);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval>>();

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
    setSpinSpeed(0.8); // 2x faster

    sound.startSpin();
    sound.updateSpinPitch(0.8);

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // Aggressive ramp + decay
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
    }, 3500);
  }, [spin, setPhase, sound]);

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
    if (navigator.share) {
      navigator.share({
        title: `DROP ZONE: ${resultCity.name}`,
        text: `Deployment target: ${resultCity.name}, ${resultCity.country} // Cost: $${resultCity.costUSD}/mo | Safety: ${resultCity.safety}/10`,
        url: window.location.href,
      }).catch(() => {});
    }
  }, [resultCity]);

  const matchScore = resultCity
    ? Math.min(99, Math.round(50 + resultCity.safety * 3 + Math.min(resultCity.internetMbps / 10, 15) + Math.max(0, 15 - resultCity.costUSD / 200)))
    : 0;

  return (
    <div className="noise-overlay relative min-h-screen w-full overflow-hidden bg-background">
      {/* Globe */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<GlobeFallback />}>
          <Globe spinning={isSpinning} spinSpeed={spinSpeed} resetCamera={resetCamera} />
        </Suspense>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4">
          <h1 className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            NOMAD // DROP
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={sound.toggleMute}
              className="p-2 rounded-sm hover:bg-muted/30 transition-colors text-muted-foreground"
              aria-label={sound.muted ? 'Unmute' : 'Mute'}
            >
              {sound.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {spinCount > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
                {spinCount} DROPS
              </span>
            )}
          </div>
        </header>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-end pb-8 px-4">
          <AnimatePresence mode="wait">
            {/* Landing — config only, no quick spin */}
            {(phase === 'landing' || phase === 'preferences') && !isSpinning && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-8 w-full max-w-lg"
              >
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-muted-foreground text-xs font-mono tracking-[0.15em] max-w-xs leading-relaxed"
                >
                  WHERE WILL YOU DEPLOY NEXT?
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <SpinButton onClick={handleConfigureMission} />
                </motion.div>

                <SavedSpins />
              </motion.div>
            )}

            {/* Spinning */}
            {phase === 'spinning' && (
              <motion.div
                key="spinning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="text-center"
                >
                  <p className="font-mono text-xs tracking-[0.3em] text-foreground/60 uppercase">
                    CALCULATING DROP ZONE...
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
                className="w-full flex flex-col items-center gap-4"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
                >
                  TARGET ACQUIRED
                </motion.p>

                <ResultCard
                  city={resultCity}
                  matchScore={matchScore}
                  onSave={saveResult}
                  onRespin={handleRespin}
                  onShare={handleShare}
                />

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  onClick={() => setPhase('landing')}
                  className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-2 tracking-[0.2em] uppercase"
                >
                  <RotateCcw className="w-3 h-3" />
                  RETURN TO BASE
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Preferences Modal */}
      <PreferencesModal
        open={showPrefs}
        onClose={() => setShowPrefs(false)}
        onSpin={startSpin}
      />
    </div>
  );
}
