import { useState, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpinStore } from '@/store/useSpinStore';
import SpinButton from '@/components/SpinButton';
import PreferencesModal from '@/components/PreferencesModal';
import ResultCard from '@/components/ResultCard';
import SavedSpins from '@/components/SavedSpins';
import { Sliders, Zap, Globe2, RotateCcw } from 'lucide-react';

const Globe = lazy(() => import('@/components/Globe'));

const GlobeFallback = () => (
  <div className="w-full h-full absolute inset-0 flex items-center justify-center">
    <div className="w-32 h-32 rounded-full border-2 border-primary/30 animate-pulse flex items-center justify-center">
      <Globe2 className="w-12 h-12 text-primary/50" />
    </div>
  </div>
);

export default function Index() {
  const { phase, setPhase, filterCities, spin, resultCity, saveResult, spinCount } = useSpinStore();
  const [showPrefs, setShowPrefs] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(0.005);

  const handleQuickSpin = useCallback(() => {
    filterCities();
    startSpin();
  }, []);

  const handleCustomSpin = useCallback(() => {
    setShowPrefs(true);
  }, []);

  const startSpin = useCallback(() => {
    setShowPrefs(false);
    setPhase('spinning');
    setIsSpinning(true);
    setSpinSpeed(0.4);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // Ramp up then decay
    setTimeout(() => setSpinSpeed(0.15), 1500);
    setTimeout(() => setSpinSpeed(0.05), 3000);
    setTimeout(() => {
      setSpinSpeed(0.01);
      spin();
    }, 4000);
    setTimeout(() => {
      setIsSpinning(false);
      setSpinSpeed(0.005);
      setPhase('results');
    }, 5000);
  }, [spin, setPhase]);

  const handleRespin = useCallback(() => {
    setPhase('landing');
    setTimeout(() => {
      filterCities();
      startSpin();
    }, 300);
  }, [startSpin, setPhase, filterCities]);

  const handleShare = useCallback(() => {
    if (!resultCity) return;
    if (navigator.share) {
      navigator.share({
        title: `Digital Nomad Spin: ${resultCity.name}!`,
        text: `I spun the globe and got ${resultCity.name}, ${resultCity.country}! 🌍✈️ Cost: $${resultCity.costUSD}/mo | Safety: ${resultCity.safety}/10`,
        url: window.location.href,
      }).catch(() => {});
    }
  }, [resultCity]);

  const matchScore = resultCity
    ? Math.min(99, Math.round(50 + resultCity.safety * 3 + Math.min(resultCity.internetMbps / 10, 15) + Math.max(0, 15 - resultCity.costUSD / 200)))
    : 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Globe background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<GlobeFallback />}>
          <Globe spinning={isSpinning} spinSpeed={spinSpeed} />
        </Suspense>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-primary" />
            <h1 className="font-display font-bold text-lg text-foreground neon-text">
              Digital Nomad Spin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {spinCount > 0 && (
              <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded-full font-medium border border-accent/20">
                🎰 {spinCount} spins
              </span>
            )}
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center justify-end pb-8 px-4">
          <AnimatePresence mode="wait">
            {/* Landing phase */}
            {(phase === 'landing' || phase === 'preferences') && !isSpinning && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-6 w-full max-w-lg"
              >
                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center text-muted-foreground text-sm md:text-base max-w-sm"
                >
                  Spin the globe. Find your next destination.
                  <br />
                  <span className="text-primary">No more analysis paralysis.</span>
                </motion.p>

                {/* Main CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <SpinButton onClick={handleQuickSpin} />
                </motion.div>

                {/* Secondary CTA */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={handleCustomSpin}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  Customize preferences first
                </motion.button>

                <SavedSpins />
              </motion.div>
            )}

            {/* Spinning phase */}
            {phase === 'spinning' && (
              <motion.div
                key="spinning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-center"
                >
                  <Zap className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="font-display text-xl font-bold text-foreground neon-text-gold">
                    Spinning the globe...
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Where will destiny take you?</p>
                </motion.div>
              </motion.div>
            )}

            {/* Results phase */}
            {phase === 'results' && resultCity && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center gap-4"
              >
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-sm uppercase tracking-[0.3em] text-accent"
                >
                  ✨ Your destination awaits ✨
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
                  transition={{ delay: 1 }}
                  onClick={() => setPhase('landing')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer mt-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Back to globe
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
