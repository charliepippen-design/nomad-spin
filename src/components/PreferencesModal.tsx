import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, AlertTriangle } from 'lucide-react';
import { useSpinStore, type VibeOption, type RegionOption } from '@/store/useSpinStore';
import { origins, type Origin } from '@/data/origins';
import { Slider } from '@/components/ui/slider';
import { useSoundManager } from '@/hooks/useSoundManager';

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
  { label: 'ALL SECTORS', value: 'All' },
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
  const sound = useSoundManager();
  const [localBudget, setLocalBudget] = useState(preferences.budgetRange);
  const [localInternet, setLocalInternet] = useState(preferences.internetMin);
  const [localSafety, setLocalSafety] = useState(preferences.safetyMin);
  const [originOpen, setOriginOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [budgetAnimating, setBudgetAnimating] = useState(false);
  const lastBudgetTick = useRef(localBudget[1]);

  useEffect(() => {
    setPreferences({
      budgetRange: localBudget,
      internetMin: localInternet,
      safetyMin: localSafety,
    });
    filterCities();
  }, [localBudget, localInternet, localSafety, preferences.vibes, preferences.region, preferences.origin]);

  const handleBudgetChange = useCallback((v: number[]) => {
    const newVal = v as [number, number];
    // Tick sound every $100
    if (Math.abs(newVal[1] - lastBudgetTick.current) >= 100) {
      sound.playTick();
      lastBudgetTick.current = newVal[1];
    }
    setBudgetAnimating(true);
    setLocalBudget(newVal);
  }, [sound]);

  const handleBudgetCommit = useCallback(() => {
    setTimeout(() => setBudgetAnimating(false), 200);
  }, []);

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
  const impossible = filteredCities.length === 0;

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
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[85vh] z-10 rounded-t-lg sm:rounded-lg overflow-hidden"
          >
            {/* Gradient border wrapper */}
            <div className="gradient-border-wrap rounded-t-lg sm:rounded-lg">
              <div className="bg-black/80 backdrop-blur-[60px] rounded-t-lg sm:rounded-lg overflow-y-auto max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-2">
                  <div>
                    <h2 className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
                      MISSION CONFIGURATION
                    </h2>
                    <div className="h-px w-12 bg-gradient-to-r from-foreground/20 to-transparent mt-2" />
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-sm hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Form grid */}
                <div className="grid gap-0 px-8 pt-6 pb-32">

                  {/* Extraction Point (Origin) */}
                  <div className="py-6 border-b border-white/[0.06]">
                    <label className="text-[10px] font-mono tracking-[0.2em] text-[#6B7280] mb-3 block uppercase">
                      EXTRACTION POINT
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setOriginOpen(!originOpen)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-sm bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors text-sm"
                      >
                        <span className={hasOrigin ? 'text-white font-mono tracking-wider' : 'text-[#6B7280] font-mono tracking-wider'}>
                          {preferences.origin
                            ? `${preferences.origin.name}${preferences.origin.country ? ` — ${preferences.origin.country}` : ''}`
                            : 'Select origin...'}
                        </span>
                        <motion.div animate={{ rotate: originOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <Search className="w-3.5 h-3.5 text-[#6B7280]" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {originOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 z-[60] rounded-sm max-h-60 overflow-y-auto bg-[#0a0a0a] border border-white/[0.1] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
                          >
                            <div className="sticky top-0 bg-[#0a0a0a] border-b border-white/[0.06] p-3">
                              <div className="flex items-center gap-2 px-2">
                                <Search className="w-3.5 h-3.5 text-[#6B7280]" />
                                <input
                                  type="text"
                                  value={originSearch}
                                  onChange={(e) => setOriginSearch(e.target.value)}
                                  placeholder="Search cities..."
                                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#555] outline-none font-mono tracking-wider"
                                  autoFocus
                                />
                              </div>
                            </div>
                            {filteredOrigins.map(o => (
                              <button
                                key={o.id}
                                onClick={() => selectOrigin(o)}
                                className="w-full text-left px-5 py-2.5 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors font-mono tracking-wider flex items-center justify-between"
                              >
                                <span>{o.name}{o.country ? ` — ${o.country}` : ''}</span>
                                {preferences.origin?.id === o.id && <Check className="w-3 h-3 text-white/50" />}
                              </button>
                            ))}
                            {filteredOrigins.length === 0 && (
                              <div className="px-5 py-4 text-xs text-[#555] font-mono">NO MATCHES</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Resource Allocation (Budget) */}
                  <div className="py-6 border-b border-white/[0.06]" style={{ minHeight: 100 }}>
                    <label className="text-[10px] font-mono tracking-[0.2em] text-[#6B7280] mb-1 block uppercase">
                      RESOURCE ALLOCATION
                    </label>
                    <motion.div
                      animate={budgetAnimating ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="mb-4"
                    >
                      <span className={`text-2xl font-mono font-light tracking-wider transition-all duration-150 ${budgetAnimating ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-white'}`}>
                        ${localBudget[0].toLocaleString()} — ${localBudget[1].toLocaleString()}
                      </span>
                    </motion.div>
                    <div className="relative z-10 py-2">
                      <Slider
                        min={500}
                        max={5000}
                        step={100}
                        value={localBudget}
                        onValueChange={handleBudgetChange}
                        onValueCommit={handleBudgetCommit}
                      />
                    </div>
                  </div>

                  {/* Min Internet */}
                  <div className="py-6 border-b border-white/[0.06]" style={{ minHeight: 100 }}>
                    <label className="text-[10px] font-mono tracking-[0.2em] text-[#6B7280] mb-1 block uppercase">
                      BANDWIDTH THRESHOLD
                    </label>
                    <span className="text-2xl font-mono font-light tracking-wider text-white mb-4 block">
                      {localInternet} MBPS
                    </span>
                    <div className="relative z-10 py-2">
                      <Slider
                        min={10}
                        max={500}
                        step={10}
                        value={[localInternet]}
                        onValueChange={(v) => setLocalInternet(v[0])}
                      />
                    </div>
                  </div>

                  {/* Min Safety */}
                  <div className="py-6 border-b border-white/[0.06]" style={{ minHeight: 100 }}>
                    <label className="text-[10px] font-mono tracking-[0.2em] text-[#6B7280] mb-1 block uppercase">
                      THREAT TOLERANCE
                    </label>
                    <span className="text-2xl font-mono font-light tracking-wider text-white mb-4 block">
                      {localSafety}/10
                    </span>
                    <div className="relative z-10 py-2">
                      <Slider
                        min={1}
                        max={10}
                        step={0.5}
                        value={[localSafety]}
                        onValueChange={(v) => setLocalSafety(v[0])}
                      />
                    </div>
                  </div>

                  {/* Mission Profile (Vibes) */}
                  <div className="py-6 border-b border-white/[0.06]">
                    <label className="text-[10px] font-mono tracking-[0.2em] text-[#6B7280] mb-4 block uppercase">
                      MISSION PROFILE
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {vibeOptions.map((v) => (
                        <button
                          key={v.value}
                          onClick={() => toggleVibe(v.value)}
                          className={`px-3.5 py-2 rounded-sm text-[11px] font-mono tracking-[0.15em] transition-all duration-200 border ${
                            preferences.vibes.includes(v.value)
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-white/[0.06] bg-transparent text-[#6B7280] hover:border-white/15 hover:text-white/60'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sector (Region) */}
                  <div className="py-6">
                    <label className="text-[10px] font-mono tracking-[0.2em] text-[#6B7280] mb-4 block uppercase">
                      OPERATIONAL SECTOR
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {regionOptions.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => { setPreferences({ region: r.value }); filterCities(); }}
                          className={`px-3.5 py-2 rounded-sm text-[11px] font-mono tracking-[0.15em] transition-all duration-200 border ${
                            preferences.region === r.value
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-white/[0.06] bg-transparent text-[#6B7280] hover:border-white/15 hover:text-white/60'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fixed bottom bar */}
                <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-0 z-20 bg-black/90 backdrop-blur-xl border-t border-white/[0.06] px-8 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-[#6B7280] uppercase">
                      <span className={`${impossible ? 'text-red-500' : 'text-white'} font-medium`}>{filteredCities.length}</span> TARGETS LOCKED
                    </span>
                    {impossible && (
                      <button
                        onClick={() => { useSpinStore.getState().autoFixFilters(); setLocalBudget([500, 5000]); setLocalInternet(10); setLocalSafety(1); }}
                        className="text-[10px] font-mono text-red-400/80 hover:text-red-300 transition-colors tracking-wider underline underline-offset-2"
                      >
                        AUTO-CALIBRATE
                      </button>
                    )}
                  </div>
                  <button
                    onClick={onSpin}
                    disabled={impossible}
                    className={`group w-full h-14 font-mono font-medium text-sm tracking-[0.25em] uppercase rounded-sm transition-all duration-300 relative overflow-hidden ${
                      impossible
                        ? 'bg-red-900/30 border border-red-500/30 text-red-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {impossible ? (
                      <span className="flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        PARAMETERS IMPOSSIBLE. ADJUST.
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10">INITIATE DROP SEQUENCE</span>
                        {/* Diagonal stripe hover effect */}
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(0,0,0,0.05)_8px,rgba(0,0,0,0.05)_16px)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
