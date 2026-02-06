import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useSpinStore, type VibeOption, type RegionOption } from '@/store/useSpinStore';
import { origins, type Origin } from '@/data/origins';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

const vibeOptions: { label: string; value: VibeOption }[] = [
  { label: 'BEACH', value: 'beach' },
  { label: 'PARTY', value: 'party' },
  { label: 'WORKHUB', value: 'workhub' },
  { label: 'MOUNTAIN', value: 'mountain' },
  { label: 'ADVENTURE', value: 'adventure' },
  { label: 'FAMILY', value: 'family' },
  { label: 'FOODIE', value: 'foodie' },
];

const regionOptions: { label: string; value: RegionOption }[] = [
  { label: 'ALL', value: 'All' },
  { label: 'ASIA', value: 'Asia' },
  { label: 'EUROPE', value: 'Europe' },
  { label: 'LATAM', value: 'LATAM' },
  { label: 'AFRICA', value: 'Africa' },
  { label: 'OCEANIA', value: 'Oceania' },
  { label: 'N. AMERICA', value: 'North America' },
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
  const [originOpen, setOriginOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState('');

  useEffect(() => {
    setPreferences({
      budgetRange: localBudget,
      internetMin: localInternet,
      safetyMin: localSafety,
    });
    filterCities();
  }, [localBudget, localInternet, localSafety, preferences.vibes, preferences.region, preferences.origin]);

  const toggleVibe = (vibe: VibeOption) => {
    const current = preferences.vibes;
    const updated = current.includes(vibe)
      ? current.filter((v) => v !== vibe)
      : [...current, vibe];
    setPreferences({ vibes: updated });
  };

  const selectOrigin = (o: Origin) => {
    setPreferences({ origin: o });
    setOriginOpen(false);
    setOriginSearch('');
  };

  const filteredOrigins = origins.filter(o =>
    o.name.toLowerCase().includes(originSearch.toLowerCase()) ||
    o.country.toLowerCase().includes(originSearch.toLowerCase())
  );

  const hasOrigin = preferences.origin && preferences.origin.id !== 'anywhere';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto glass-strong rounded-t-lg sm:rounded-lg p-6 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-mono text-xs tracking-[0.3em] text-muted-foreground">DEPLOYMENT PARAMETERS</h2>
              <button onClick={onClose} className="p-2 rounded-sm hover:bg-muted/50 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Origin */}
            <div className="mb-6">
              <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-2 block uppercase">
                CURRENT ORIGIN BASE
              </label>
              <div className="relative">
                <button
                  onClick={() => setOriginOpen(!originOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-sm glass glass-hover text-sm text-foreground"
                >
                  <span className={hasOrigin ? 'text-foreground' : 'text-muted-foreground'}>
                    {preferences.origin
                      ? `${preferences.origin.name}${preferences.origin.country ? ` — ${preferences.origin.country}` : ''}`
                      : 'Select origin...'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${originOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {originOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1 z-20 glass-strong rounded-sm max-h-48 overflow-y-auto"
                    >
                      <input
                        type="text"
                        value={originSearch}
                        onChange={(e) => setOriginSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full px-4 py-2 bg-transparent text-sm text-foreground border-b border-border/50 placeholder:text-muted-foreground/50 outline-none font-mono"
                        autoFocus
                      />
                      {filteredOrigins.map(o => (
                        <button
                          key={o.id}
                          onClick={() => selectOrigin(o)}
                          className="w-full text-left px-4 py-2 text-sm text-foreground/80 hover:bg-muted/50 hover:text-foreground transition-colors font-mono"
                        >
                          {o.name}{o.country ? ` — ${o.country}` : ''}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Budget */}
            <div className="mb-6">
              <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-3 block uppercase">
                MONTHLY BUDGET <span className="text-foreground">${localBudget[0]} – ${localBudget[1]}</span>
              </label>
              <Slider min={500} max={5000} step={100} value={localBudget} onValueChange={(v) => setLocalBudget(v as [number, number])} />
            </div>

            {/* Internet */}
            <div className="mb-6">
              <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-3 block uppercase">
                MIN INTERNET <span className="text-foreground">{localInternet} MBPS</span>
              </label>
              <Slider min={10} max={500} step={10} value={[localInternet]} onValueChange={(v) => setLocalInternet(v[0])} />
            </div>

            {/* Safety */}
            <div className="mb-6">
              <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-3 block uppercase">
                MIN SAFETY <span className="text-foreground">{localSafety}/10</span>
              </label>
              <Slider min={1} max={10} step={0.5} value={[localSafety]} onValueChange={(v) => setLocalSafety(v[0])} />
            </div>

            {/* Vibes */}
            <div className="mb-6">
              <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-3 block uppercase">MISSION PROFILE</label>
              <div className="flex flex-wrap gap-2">
                {vibeOptions.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => toggleVibe(v.value)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-mono tracking-wider transition-all border ${
                      preferences.vibes.includes(v.value)
                        ? 'border-foreground/40 bg-foreground/10 text-foreground'
                        : 'border-border bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground/70'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Region */}
            <div className="mb-6">
              <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-3 block uppercase">SECTOR</label>
              <div className="flex flex-wrap gap-2">
                {regionOptions.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => { setPreferences({ region: r.value }); filterCities(); }}
                    className={`px-3 py-1.5 rounded-sm text-xs font-mono tracking-wider transition-all border ${
                      preferences.region === r.value
                        ? 'border-foreground/40 bg-foreground/10 text-foreground'
                        : 'border-border bg-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground/70'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 pt-4 border-t border-border/50 -mx-6 px-6 -mb-6 pb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
                  <span className="text-foreground">{filteredCities.length}</span> TARGETS LOCKED
                </span>
              </div>
              {filteredCities.length === 0 && (
                <div className="mb-3">
                  <p className="text-xs text-destructive font-mono mb-2">ZERO TARGETS. PARAMETERS TOO RESTRICTIVE.</p>
                  <button
                    onClick={() => { useSpinStore.getState().autoFixFilters(); setLocalBudget([500, 5000]); setLocalInternet(10); setLocalSafety(1); }}
                    className="text-xs font-mono text-foreground/60 underline hover:text-foreground transition-colors tracking-wider"
                  >
                    AUTO-CALIBRATE FILTERS
                  </button>
                </div>
              )}
              <Button
                onClick={onSpin}
                disabled={filteredCities.length === 0}
                className="w-full h-12 font-mono font-medium text-sm tracking-[0.25em] uppercase rounded-sm bg-foreground text-background hover:bg-foreground/90"
              >
                EXECUTE DROP
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
