import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, AlertTriangle, Zap, Briefcase, Mountain, Crosshair, Globe } from 'lucide-react';
import { useSpinStore, type VibeOption, type RegionOption } from '@/store/useSpinStore';
import { origins, type Origin } from '@/data/origins';
import { Slider } from '@/components/ui/slider';
import { useSoundManager } from '@/hooks/useSoundManager';
import { useGeolocation } from '@/hooks/useGeolocation';

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

// PresetConfig is defined below with presets array

interface PresetConfig {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  budget: [number, number];
  internet: number;
  safety: number;
  vibes: VibeOption[];
  region: RegionOption;
  action?: 'scrollToRegion';
}

const presets: PresetConfig[] = [
  {
    label: 'BUDGET SAVER',
    subtitle: 'Cost < $1,500',
    icon: <Zap className="w-3.5 h-3.5" />,
    budget: [500, 1500],
    internet: 20,
    safety: 5,
    vibes: [],
    region: 'All',
  },
  {
    label: 'HIGH COMFORT',
    subtitle: 'Fast + Safe',
    icon: <Briefcase className="w-3.5 h-3.5" />,
    budget: [1500, 5000],
    internet: 150,
    safety: 8,
    vibes: [],
    region: 'All',
  },
  {
    label: 'QUIET / PRODUCTIVE',
    subtitle: 'Low nightlife',
    icon: <Mountain className="w-3.5 h-3.5" />,
    budget: [500, 3000],
    internet: 50,
    safety: 6,
    vibes: ['workhub', 'mountain'],
    region: 'All',
  },
];

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
  onSpin: () => void;
}

export default function PreferencesModal({ open, onClose, onSpin }: PreferencesModalProps) {
  const { preferences, setPreferences, filterCities, filteredCities, getNearMisses } = useSpinStore();
  const sound = useSoundManager();
  const [localBudget, setLocalBudget] = useState(preferences.budgetRange);
  const [localInternet, setLocalInternet] = useState(preferences.internetMin);
  const [localSafety, setLocalSafety] = useState(preferences.safetyMin);
  const [originOpen, setOriginOpen] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [budgetAnimating, setBudgetAnimating] = useState(false);
  const [showNearMisses, setShowNearMisses] = useState(false);
  const [isShortRange, setIsShortRange] = useState(false);
  const lastBudgetTick = useRef(localBudget[1]);

  const handleGeoOrigin = useCallback((origin: Origin) => {
    setPreferences({ origin });
    sound.playTick();
  }, [setPreferences, sound]);

  const geo = useGeolocation(handleGeoOrigin);

  useEffect(() => {
    setPreferences({
      budgetRange: localBudget,
      internetMin: localInternet,
      safetyMin: localSafety,
    });
    filterCities();
  }, [localBudget, localInternet, localSafety, preferences.vibes, preferences.region, preferences.origin]);

  const applyPreset = (preset: PresetConfig) => {
    setLocalBudget(preset.budget);
    setLocalInternet(preset.internet);
    setLocalSafety(preset.safety);
    setPreferences({
      budgetRange: preset.budget,
      internetMin: preset.internet,
      safetyMin: preset.safety,
      vibes: preset.vibes,
      region: preset.region,
    });
    setIsShortRange(false);
    sound.playTick();
  };

  const applyShortRange = () => {
    const hasOrigin = preferences.origin && preferences.origin.id !== 'anywhere';
    if (!hasOrigin) {
      // Trigger geolocation first, then apply preset after origin is set
      geo.locate();
    }
    setLocalBudget([500, 5000]);
    setLocalInternet(30);
    setLocalSafety(1);
    setPreferences({
      budgetRange: [500, 5000],
      internetMin: 30,
      safetyMin: 1,
      vibes: [],
      region: 'All',
    });
    setIsShortRange(true);
    sound.playTick();
  };

  const handleBudgetChange = useCallback((v: number[]) => {
    const newVal = v as [number, number];
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
  const nearMisses = impossible ? getNearMisses() : [];

  // Build mission summary
  const buildSummary = () => {
    const parts: string[] = [];
    const budgetLabel = localBudget[1] <= 1200 ? 'resource-efficient' : localBudget[1] <= 2500 ? 'mid-range' : 'premium';
    parts.push(budgetLabel);
    if (localInternet >= 100) parts.push('high-speed');
    if (localSafety >= 8) parts.push('high-security');
    if (preferences.vibes.length > 0) parts.push(preferences.vibes.join('/'));

    const origin = hasOrigin ? preferences.origin!.name : 'GLOBAL';
    const region = preferences.region !== 'All' ? preferences.region : 'all sectors';

    return `CONFIG: Searching for ${parts.join(', ')} extraction points in ${region} from ${origin}...`;
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
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg max-h-[85vh] z-10 rounded-t-lg sm:rounded-lg overflow-hidden"
          >
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
                  <button onClick={onClose} className="p-2 rounded-sm hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Presets */}
                <div className="px-8 pt-4 pb-2">
                  <label className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground/60 mb-3 block uppercase">
                    QUICK DEPLOY PRESETS
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => applyPreset(preset)}
                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-sm border border-border/50 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                      >
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{preset.icon}</span>
                        <span className="text-[8px] font-mono tracking-[0.1em] text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{preset.label}</span>
                        <span className="text-[7px] font-mono text-muted-foreground/50 leading-tight">{preset.subtitle}</span>
                      </button>
                    ))}
                    {/* PREFERRED REGION preset */}
                    <button
                      onClick={() => {
                        const regionSection = document.getElementById('region-section');
                        if (regionSection) regionSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-sm border border-border/50 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                    >
                      <Globe className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-[8px] font-mono tracking-[0.1em] text-muted-foreground group-hover:text-foreground transition-colors leading-tight">REGION</span>
                      <span className="text-[7px] font-mono text-muted-foreground/50 leading-tight">Pick sector</span>
                    </button>
                  </div>
                </div>

                {/* Form grid */}
                <div className="grid gap-0 px-8 pt-4 pb-32">
                  {/* Extraction Point */}
                  <div className="py-6 border-b border-white/[0.06]">
                    <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-3 block uppercase">
                      EXTRACTION POINT
                    </label>
                    <div className="relative flex gap-2">
                      {/* Locate Me button */}
                      <button
                        onClick={geo.locate}
                        disabled={geo.locating}
                        className="flex-shrink-0 px-3 py-3.5 rounded-sm bg-white/[0.03] border border-white/[0.08] hover:border-destructive/50 hover:text-destructive hover:shadow-[0_0_12px_rgba(255,0,0,0.3)] transition-all text-muted-foreground"
                        title="Locate nearest base city"
                      >
                        <Crosshair className={`w-4 h-4 ${geo.locating ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => setOriginOpen(!originOpen)}
                        className="flex-1 flex items-center justify-between px-4 py-3.5 rounded-sm bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors text-sm"
                      >
                        <span className={`font-mono tracking-wider ${geo.acquiredCity ? 'text-destructive typing-effect' : hasOrigin ? 'text-white' : 'text-muted-foreground'}`}>
                          {geo.acquiredCity
                            ? `COORDINATES ACQUIRED: ${geo.acquiredCity.toUpperCase()}`
                            : preferences.origin
                              ? `${preferences.origin.name}${preferences.origin.country ? ` — ${preferences.origin.country}` : ''}`
                              : 'Select origin...'}
                        </span>
                        <motion.div animate={{ rotate: originOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <Search className="w-3.5 h-3.5 text-muted-foreground" />
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
                                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                  type="text"
                                  value={originSearch}
                                  onChange={(e) => setOriginSearch(e.target.value)}
                                  placeholder="Search cities..."
                                  className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none font-mono tracking-wider"
                                  autoFocus
                                />
                              </div>
                            </div>
                            {filteredOrigins.map(o => (
                              <button
                                key={o.id}
                                onClick={() => selectOrigin(o)}
                                className="w-full text-left px-5 py-2.5 text-sm text-foreground/70 hover:bg-white/[0.05] hover:text-foreground transition-colors font-mono tracking-wider flex items-center justify-between"
                              >
                                <span>{o.name}{o.country ? ` — ${o.country}` : ''}</span>
                                {preferences.origin?.id === o.id && <Check className="w-3 h-3 text-foreground/50" />}
                              </button>
                            ))}
                            {filteredOrigins.length === 0 && (
                              <div className="px-5 py-4 text-xs text-muted-foreground font-mono">NO MATCHES</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="py-6 border-b border-white/[0.06]" style={{ minHeight: 100 }}>
                    <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-1 block uppercase">
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
                      <Slider min={500} max={5000} step={100} value={localBudget} onValueChange={handleBudgetChange} onValueCommit={handleBudgetCommit} />
                    </div>
                  </div>

                  {/* Internet */}
                  <div className="py-6 border-b border-white/[0.06]" style={{ minHeight: 100 }}>
                    <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-1 block uppercase">
                      BANDWIDTH THRESHOLD
                    </label>
                    <span className="text-2xl font-mono font-light tracking-wider text-white mb-4 block">{localInternet} MBPS</span>
                    <div className="relative z-10 py-2">
                      <Slider min={10} max={500} step={10} value={[localInternet]} onValueChange={(v) => setLocalInternet(v[0])} />
                    </div>
                  </div>

                  {/* Safety */}
                  <div className="py-6 border-b border-white/[0.06]" style={{ minHeight: 100 }}>
                    <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-1 block uppercase">
                      THREAT TOLERANCE
                    </label>
                    <span className="text-2xl font-mono font-light tracking-wider text-white mb-4 block">{localSafety}/10</span>
                    <div className="relative z-10 py-2">
                      <Slider min={1} max={10} step={0.5} value={[localSafety]} onValueChange={(v) => setLocalSafety(v[0])} />
                    </div>
                  </div>

                  {/* Vibes */}
                  <div className="py-6 border-b border-white/[0.06]">
                    <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-4 block uppercase">
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
                              : 'border-white/[0.06] bg-transparent text-muted-foreground hover:border-white/15 hover:text-foreground/60'
                          }`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Region */}
                  <div id="region-section" className="py-6">
                    <label className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-4 block uppercase">
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
                              : 'border-white/[0.06] bg-transparent text-muted-foreground hover:border-white/15 hover:text-foreground/60'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fixed bottom bar */}
                <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-0 z-20 bg-black/90 backdrop-blur-xl border-t border-white/[0.06] px-8 py-4">
                  {/* Mission summary */}
                  <p className="text-[9px] font-mono tracking-[0.1em] text-muted-foreground/60 mb-3 leading-relaxed">
                    {buildSummary()}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
                      <span className={`${impossible ? 'text-destructive' : 'text-white'} font-medium`}>{filteredCities.length}</span> TARGETS LOCKED
                    </span>
                    <div className="flex gap-2">
                      {impossible && nearMisses.length > 0 && (
                        <button
                          onClick={() => setShowNearMisses(!showNearMisses)}
                          className="text-[10px] font-mono text-foreground/50 hover:text-foreground/80 transition-colors tracking-wider"
                        >
                          {showNearMisses ? 'HIDE' : `${nearMisses.length} NEAR MISSES`}
                        </button>
                      )}
                      {impossible && (
                        <button
                          onClick={() => { useSpinStore.getState().autoFixFilters(); setLocalBudget([500, 5000]); setLocalInternet(10); setLocalSafety(1); }}
                          className="text-[10px] font-mono text-destructive/80 hover:text-destructive transition-colors tracking-wider underline underline-offset-2"
                        >
                          AUTO-CALIBRATE
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Near misses */}
                  <AnimatePresence>
                    {showNearMisses && nearMisses.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-3"
                      >
                        <div className="space-y-1.5 max-h-24 overflow-y-auto">
                          {nearMisses.slice(0, 5).map((city) => (
                            <div key={city.id} className="flex items-center justify-between px-3 py-1.5 rounded-sm bg-white/[0.03] text-[10px] font-mono text-foreground/50">
                              <span>{city.name} — {city.country}</span>
                              <span>${city.costUSD}/mo</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={onSpin}
                    disabled={impossible}
                    className={`group w-full h-14 font-mono font-medium text-sm tracking-[0.25em] uppercase rounded-sm transition-all duration-300 relative overflow-hidden ${
                      impossible
                        ? 'bg-destructive/20 border border-destructive/30 text-destructive cursor-not-allowed'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {impossible ? (
                      <span className="flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        PARAMETERS IMPOSSIBLE
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10">INITIATE DROP SEQUENCE</span>
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
