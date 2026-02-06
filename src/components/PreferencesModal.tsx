import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, MapPin } from 'lucide-react';
import { useSpinStore, type VibeOption, type RegionOption } from '@/store/useSpinStore';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

const vibeOptions: { label: string; value: VibeOption; emoji: string }[] = [
  { label: 'Beach', value: 'beach', emoji: '🏖️' },
  { label: 'Party', value: 'party', emoji: '🎉' },
  { label: 'Workhub', value: 'workhub', emoji: '💻' },
  { label: 'Mountain', value: 'mountain', emoji: '⛰️' },
  { label: 'Adventure', value: 'adventure', emoji: '🧗' },
  { label: 'Family', value: 'family', emoji: '👨‍👩‍👧‍👦' },
  { label: 'Foodie', value: 'foodie', emoji: '🍜' },
];

const regionOptions: { label: string; value: RegionOption }[] = [
  { label: '🌍 All', value: 'All' },
  { label: '🏯 Asia', value: 'Asia' },
  { label: '🏰 Europe', value: 'Europe' },
  { label: '🌴 LATAM', value: 'LATAM' },
  { label: '🦁 Africa', value: 'Africa' },
  { label: '🦘 Oceania', value: 'Oceania' },
  { label: '🗽 N. America', value: 'North America' },
];

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
  onSpin: () => void;
}

export default function PreferencesModal({ open, onClose, onSpin }: PreferencesModalProps) {
  const { preferences, setPreferences, filterCities, filteredCities } = useSpinStore();
  const [localBudget, setLocalBudget] = useState(preferences.budgetRange);
  const [localInternet, setLocalInternet] = useState(preferences.internetMin);
  const [localSafety, setLocalSafety] = useState(preferences.safetyMin);

  useEffect(() => {
    setPreferences({
      budgetRange: localBudget,
      internetMin: localInternet,
      safetyMin: localSafety,
    });
    filterCities();
  }, [localBudget, localInternet, localSafety, preferences.vibes, preferences.region]);

  const toggleVibe = (vibe: VibeOption) => {
    const current = preferences.vibes;
    const updated = current.includes(vibe)
      ? current.filter((v) => v !== vibe)
      : [...current, vibe];
    setPreferences({ vibes: updated });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          
          {/* Panel */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto glass-strong rounded-t-2xl sm:rounded-2xl p-6 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">Customize Your Spin</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Budget */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Monthly Budget: <span className="text-primary font-bold">${localBudget[0]} – ${localBudget[1]}</span>
              </label>
              <Slider
                min={500}
                max={5000}
                step={100}
                value={localBudget}
                onValueChange={(v) => setLocalBudget(v as [number, number])}
                className="mt-2"
              />
            </div>

            {/* Internet */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Min Internet Speed: <span className="text-primary font-bold">{localInternet} Mbps</span>
              </label>
              <Slider
                min={10}
                max={500}
                step={10}
                value={[localInternet]}
                onValueChange={(v) => setLocalInternet(v[0])}
                className="mt-2"
              />
            </div>

            {/* Safety */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Min Safety Score: <span className="text-primary font-bold">{localSafety}/10</span>
              </label>
              <Slider
                min={1}
                max={10}
                step={0.5}
                value={[localSafety]}
                onValueChange={(v) => setLocalSafety(v[0])}
                className="mt-2"
              />
            </div>

            {/* Vibes */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Vibe</label>
              <div className="flex flex-wrap gap-2">
                {vibeOptions.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => toggleVibe(v.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      preferences.vibes.includes(v.value)
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {v.emoji} {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Region */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Region</label>
              <div className="flex flex-wrap gap-2">
                {regionOptions.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => { setPreferences({ region: r.value }); filterCities(); }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      preferences.region === r.value
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Counter + CTA */}
            <div className="sticky bottom-0 pt-4 border-t border-border bg-card/80 backdrop-blur-sm -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  <span className="text-primary font-bold">{filteredCities.length}</span> spots ready to spin
                </span>
              </div>
              {filteredCities.length === 0 ? (
                <p className="text-sm text-destructive mb-3">Too specific! Try loosening your filters.</p>
              ) : null}
              <Button
                onClick={onSpin}
                disabled={filteredCities.length === 0}
                className="w-full h-12 font-display font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
              >
                🎰 LOCK IN & SPIN
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
