import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Check, AlertTriangle, Zap, Briefcase, Mountain, Crosshair, Globe, Waves, Building, TreePine, Palmtree } from 'lucide-react';
import { useSpinStore, type VibeOption, type RegionOption, type LandscapeOption } from '@/store/useSpinStore';
import { origins, cityToOrigin, type Origin } from '@/data/origins';
import { cities } from '@/data/cities';
import { Slider } from '@/components/ui/slider';
import { useSoundManager } from '@/hooks/useSoundManager';
import { useGeolocation } from '@/hooks/useGeolocation';
import { originCountry, originMatches, originName } from '@/components/OriginSelector';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { cityDisplayName } from '@/i18n/content';
import { countryName, formatNumber } from '@/i18n/format';
import { rich } from '@/i18n/rich';

// Labels below are the English fallback; the text shown comes from globe.prefs.* in the dictionary.
const vibeOptions: { label: string; value: VibeOption }[] = [
  { label: 'BEACH', value: 'beach' },
  { label: 'PARTY', value: 'party' },
  { label: 'WORKHUB', value: 'workhub' },
  { label: 'MOUNTAIN', value: 'mountain' },
  { label: 'ADVENTURE', value: 'adventure' },
  { label: 'FAMILY', value: 'family' },
  { label: 'FOODIE', value: 'foodie' },
];

const landscapeOptions: { label: string; value: LandscapeOption; icon: React.ReactNode }[] = [
  { label: 'SEASIDE', value: 'seaside', icon: <Waves className="w-3 h-3" /> },
  { label: 'MOUNTAIN', value: 'mountain', icon: <Mountain className="w-3 h-3" /> },
  { label: 'URBAN', value: 'urban', icon: <Building className="w-3 h-3" /> },
  { label: 'RURAL', value: 'rural', icon: <TreePine className="w-3 h-3" /> },
  { label: 'ISLAND', value: 'island', icon: <Palmtree className="w-3 h-3" /> },
  { label: 'DESERT', value: 'desert', icon: <Globe className="w-3 h-3" /> },
];

const regionOptions: { label: string; value: RegionOption }[] = [
  { label: 'ALL REGIONS', value: 'All' },
  { label: 'ASIA', value: 'Asia' },
  { label: 'EUROPE', value: 'Europe' },
  { label: 'LATAM', value: 'LATAM' },
  { label: 'AFRICA', value: 'Africa' },
  { label: 'OCEANIA', value: 'Oceania' },
  { label: 'N. AMERICA', value: 'North America' },
];

interface PresetConfig {
  /** Dictionary id: globe.prefs.preset.<id>.label / .subtitle */
  id: 'budget' | 'comfort' | 'quiet';
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  budget: [number, number];
  internet: number;
  safety: number;
  vibes: VibeOption[];
  landscapes: LandscapeOption[];
  region: RegionOption;
  action?: 'scrollToRegion';
}

const presets: PresetConfig[] = [
  {
    id: 'budget',
    label: 'BUDGET SAVER',
    subtitle: 'Cost < $1,500',
    icon: <Zap className="w-3.5 h-3.5" />,
    budget: [500, 1500],
    internet: 20,
    safety: 5,
    vibes: [],
    landscapes: [],
    region: 'All',
  },
  {
    id: 'comfort',
    label: 'HIGH COMFORT',
    subtitle: 'Fast + Safe',
    icon: <Briefcase className="w-3.5 h-3.5" />,
    budget: [1500, 5000],
    internet: 150,
    safety: 8,
    vibes: [],
    landscapes: [],
    region: 'All',
  },
  {
    id: 'quiet',
    label: 'QUIET / PRODUCTIVE',
    subtitle: 'Low nightlife',
    icon: <Mountain className="w-3.5 h-3.5" />,
    budget: [500, 3000],
    internet: 50,
    safety: 6,
    vibes: ['workhub', 'mountain'],
    landscapes: [],
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
  const t = useT();
  const locale = useLocale();
  const [localBudget, setLocalBudget] = useState(preferences.budgetRange);
  const [localInternetRange, setLocalInternetRange] = useState<[number, number]>([10, preferences.internetMin]);
  const [localSafetyRange, setLocalSafetyRange] = useState<[number, number]>([1, preferences.safetyMin]);
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
      internetMin: localInternetRange[0],
      safetyMin: localSafetyRange[0],
    });
    filterCities();
  }, [localBudget, localInternetRange, localSafetyRange, preferences.vibes, preferences.landscapes, preferences.region, preferences.origin]);

  const applyPreset = (preset: PresetConfig) => {
    setLocalBudget(preset.budget);
    setLocalInternetRange([10, preset.internet]);
    setLocalSafetyRange([1, preset.safety]);
    setPreferences({
      budgetRange: preset.budget,
      internetMin: preset.internet,
      safetyMin: preset.safety,
      vibes: preset.vibes,
      landscapes: preset.landscapes,
      region: preset.region,
    });
    setIsShortRange(false);
    sound.playTick();
  };

  const applyShortRange = () => {
    const hasOrigin = preferences.origin && preferences.origin.id !== 'anywhere';
    if (!hasOrigin) {
      geo.locate();
    }
    setLocalBudget([500, 5000]);
    setLocalInternetRange([10, 30]);
    setLocalSafetyRange([1, 1]);
    setPreferences({
      budgetRange: [500, 5000],
      internetMin: 30,
      safetyMin: 1,
      vibes: [],
      landscapes: [],
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

  const toggleLandscape = (landscape: LandscapeOption) => {
    const current = preferences.landscapes;
    const updated = current.includes(landscape)
      ? current.filter((l) => l !== landscape)
      : [...current, landscape];
    setPreferences({ landscapes: updated });
  };

  const selectOrigin = (o: Origin) => {
    setPreferences({ origin: o });
    setOriginOpen(false);
    setOriginSearch('');
  };

  // Build combined searchable list: curated origins + all 780+ cities (deduped)
  const allSearchableOrigins = useMemo(() => {
    const originIds = new Set(origins.map(o => o.id));
    const citiesAsOrigins = cities
      .filter(c => !originIds.has(c.id))
      .map(c => cityToOrigin(c));
    const combined = [...origins, ...citiesAsOrigins];
    return combined;
  }, []);

  const filteredOrigins = originSearch.trim()
    ? allSearchableOrigins.filter(o => originMatches(o, originSearch, locale, t))
    : allSearchableOrigins;

  const hasOrigin = preferences.origin && preferences.origin.id !== 'anywhere';
  const impossible = filteredCities.length === 0;
  const nearMisses = impossible ? getNearMisses() : [];

  // Build mission summary
  const buildSummary = () => {
    const parts: string[] = [];
    const budgetLabel = localBudget[1] <= 1200 ? t('globe.prefs.summary.budgetLow') : localBudget[1] <= 2500 ? t('globe.prefs.summary.budgetMid') : t('globe.prefs.summary.budgetHigh');
    parts.push(budgetLabel);
    if (localInternetRange[1] >= 100) parts.push(t('globe.prefs.summary.fast'));
    if (localSafetyRange[1] >= 8) parts.push(t('globe.prefs.summary.safe'));
    // English keeps the raw tags (beach/party); other languages use the shared vocabulary.
    const tag = (group: 'vibe' | 'landscape', value: string) =>
      locale === 'en' ? value : t.dyn(`data.${group}.${value}`, value).toLowerCase();
    if (preferences.vibes.length > 0) parts.push(preferences.vibes.map((v) => tag('vibe', v)).join('/'));
    if (preferences.landscapes.length > 0) parts.push(preferences.landscapes.map((l) => tag('landscape', l)).join('/'));

    const origin = hasOrigin ? originName(preferences.origin!, locale, t) : t('globe.prefs.summary.global');
    const region = preferences.region !== 'All' ? t.dyn(`globe.region.${preferences.region}`, preferences.region) : t('globe.prefs.summary.allRegions');

    return t('globe.prefs.summary', { traits: parts.join(', '), region, origin });
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
              <div className="bg-popover/95 backdrop-blur-[60px] rounded-t-lg sm:rounded-lg overflow-y-auto max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-8 pt-8 pb-2">
                  <div>
                    <h2 className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
                      {t('globe.prefs.title')}
                    </h2>
                    <div className="h-px w-12 bg-gradient-to-r from-foreground/20 to-transparent mt-2" />
                  </div>
                  <button onClick={onClose} aria-label={t('globe.prefs.close')} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Presets */}
                <div className="px-8 pt-4 pb-2">
                  <label className="text-[9px] font-mono tracking-[0.1em] text-muted-foreground/60 mb-3 block uppercase">
                    {t('globe.prefs.quickPresets')}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => applyPreset(preset)}
                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-border/50 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                      >
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{preset.icon}</span>
                        <span className="text-[8px] font-mono tracking-[0.1em] text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{t.dyn(`globe.prefs.preset.${preset.id}.label`, preset.label)}</span>
                        <span className="text-[7px] font-mono text-muted-foreground/50 leading-tight">{t.dyn(`globe.prefs.preset.${preset.id}.subtitle`, preset.subtitle)}</span>
                      </button>
                    ))}
                    {/* PREFERRED REGION preset */}
                    <button
                      onClick={() => {
                        const regionSection = document.getElementById('region-section');
                        if (regionSection) regionSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-border/50 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
                    >
                      <Globe className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-[8px] font-mono tracking-[0.1em] text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{t('globe.prefs.preset.region.label')}</span>
                      <span className="text-[7px] font-mono text-muted-foreground/50 leading-tight">{t('globe.prefs.preset.region.subtitle')}</span>
                    </button>
                  </div>
                </div>

                {/* Form grid */}
                <div className="grid gap-0 px-8 pt-4 pb-32">
                  {/* Extraction Point */}
                  <div className="py-6 border-b border-border">
                    <label className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground mb-3 block uppercase">
                      {t('globe.prefs.currentLocation')}
                    </label>
                    <div className="relative flex gap-2">
                      {/* Locate Me button */}
                      <button
                        onClick={geo.locate}
                        disabled={geo.locating}
                        className="flex-shrink-0 px-3 py-3.5 rounded-lg bg-white/[0.03] border border-border hover:border-destructive/50 hover:text-destructive hover:shadow-[0_0_12px_rgba(255,0,0,0.3)] transition-all text-muted-foreground"
                        title={t('globe.origin.detect')}
                      >
                        <Crosshair className={`w-4 h-4 ${geo.locating ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => setOriginOpen(!originOpen)}
                        className="flex-1 flex items-center justify-between px-4 py-3.5 rounded-lg bg-white/[0.03] border border-border hover:border-border transition-colors text-sm"
                      >
                        <span className={`font-mono tracking-wider ${geo.acquiredCity ? 'text-destructive typing-effect' : hasOrigin ? 'text-white' : 'text-muted-foreground'}`}>
                          {geo.acquiredCity
                            ? t('globe.origin.located', { city: geo.acquiredCity })
                            : preferences.origin
                              ? `${originName(preferences.origin, locale, t)}${preferences.origin.country ? `, ${originCountry(preferences.origin, locale)}` : ''}`
                              : t('globe.prefs.selectOrigin')}
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
                            className="absolute top-full left-0 right-0 mt-2 z-[60] rounded-lg max-h-60 overflow-y-auto bg-popover border border-border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]"
                          >
                            <div className="sticky top-0 bg-popover border-b border-border p-3">
                              <div className="flex items-center gap-2 px-2">
                                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                  type="text"
                                  value={originSearch}
                                  onChange={(e) => setOriginSearch(e.target.value)}
                                  placeholder={t('globe.origin.search')}
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
                                <span>{originName(o, locale, t)}{o.country ? `, ${originCountry(o, locale)}` : ''}</span>
                                {preferences.origin?.id === o.id && <Check className="w-3 h-3 text-foreground/50" />}
                              </button>
                            ))}
                            {filteredOrigins.length === 0 && (
                              <div className="px-5 py-4 text-xs text-muted-foreground font-mono">{t('globe.prefs.noMatches')}</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="py-6 border-b border-border" style={{ minHeight: 100 }}>
                    <label className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground mb-1 block uppercase">
                      {t('globe.prefs.monthlyBudget')}
                    </label>
                    <motion.div
                      animate={budgetAnimating ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="mb-4"
                    >
                      <span className={`text-2xl font-mono font-light tracking-wider transition-all duration-150 ${budgetAnimating ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-white'}`}>
                        {t('globe.prefs.budgetRange', { min: formatNumber(localBudget[0], locale), max: formatNumber(localBudget[1], locale) })}
                      </span>
                    </motion.div>
                    <div className="relative z-10 py-2">
                      <Slider min={500} max={5000} step={100} value={localBudget} onValueChange={handleBudgetChange} onValueCommit={handleBudgetCommit} />
                    </div>
                  </div>

                  {/* Internet */}
                  <div className="py-6 border-b border-border" style={{ minHeight: 100 }}>
                    <label className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground mb-1 block uppercase">
                      {t('globe.prefs.internetSpeed')}
                    </label>
                    <span className="text-2xl font-mono font-light tracking-wider text-white mb-4 block">
                      {t('globe.prefs.internetRange', { min: localInternetRange[0], max: localInternetRange[1] })}
                    </span>
                    <div className="relative z-10 py-2">
                      <Slider min={10} max={500} step={10} value={localInternetRange} onValueChange={(v) => setLocalInternetRange(v as [number, number])} />
                    </div>
                  </div>

                  {/* Safety */}
                  <div className="py-6 border-b border-border" style={{ minHeight: 100 }}>
                    <label className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground mb-1 block uppercase">
                      {t('globe.prefs.safetyRating')}
                    </label>
                    <span className="text-2xl font-mono font-light tracking-wider text-white mb-4 block">
                      {t('globe.prefs.safetyRange', { min: formatNumber(localSafetyRange[0], locale), max: formatNumber(localSafetyRange[1], locale) })}
                    </span>
                    <div className="relative z-10 py-2">
                      <Slider min={1} max={10} step={0.5} value={localSafetyRange} onValueChange={(v) => setLocalSafetyRange(v as [number, number])} />
                    </div>
                  </div>

                  {/* Vibes */}
                  <div className="py-6 border-b border-border">
                    <label className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground mb-4 block uppercase">
                      {t('globe.prefs.yourVibe')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {vibeOptions.map((v) => (
                        <button
                          key={v.value}
                          onClick={() => toggleVibe(v.value)}
                          className={`px-3.5 py-2 rounded-lg text-[11px] font-mono tracking-[0.1em] transition-all duration-200 border ${
                            preferences.vibes.includes(v.value)
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-border bg-transparent text-muted-foreground hover:border-border hover:text-foreground/60'
                          }`}
                        >
                          {t.dyn(`globe.prefs.vibe.${v.value}`, v.label)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Landscape */}
                  <div className="py-6 border-b border-border">
                    <label className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground mb-4 block uppercase">
                      {t('globe.prefs.landscapeTitle')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {landscapeOptions.map((l) => (
                        <button
                          key={l.value}
                          onClick={() => toggleLandscape(l.value)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-mono tracking-[0.1em] transition-all duration-200 border ${
                            preferences.landscapes.includes(l.value)
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-border bg-transparent text-muted-foreground hover:border-border hover:text-foreground/60'
                          }`}
                        >
                          {l.icon} {t.dyn(`globe.prefs.landscape.${l.value}`, l.label)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Region */}
                  <div id="region-section" className="py-6">
                    <label className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground mb-4 block uppercase">
                      {t('globe.prefs.preferredRegion')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {regionOptions.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => { setPreferences({ region: r.value }); filterCities(); }}
                          className={`px-3.5 py-2 rounded-lg text-[11px] font-mono tracking-[0.1em] transition-all duration-200 border ${
                            preferences.region === r.value
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-border bg-transparent text-muted-foreground hover:border-border hover:text-foreground/60'
                          }`}
                        >
                          {t.dyn(`globe.prefs.region.${r.value}`, r.label)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fixed bottom bar */}
                <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-0 z-20 bg-popover/95 backdrop-blur-xl border-t border-border px-8 py-4">
                  {/* Mission summary */}
                  <p className="text-[9px] font-mono tracking-[0.1em] text-muted-foreground/60 mb-3 leading-relaxed">
                    {buildSummary()}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono tracking-[0.1em] text-muted-foreground uppercase">
                      {rich(t.n('globe.prefs.found', filteredCities.length), {
                        count: (count) => <span className={`${impossible ? 'text-destructive' : 'text-foreground'} font-medium`}>{count}</span>,
                      })}
                    </span>
                    <div className="flex gap-2">
                      {impossible && nearMisses.length > 0 && (
                        <button
                          onClick={() => setShowNearMisses(!showNearMisses)}
                          className="text-[10px] font-mono text-foreground/50 hover:text-foreground/80 transition-colors tracking-wider"
                        >
                          {showNearMisses ? t('globe.prefs.hide') : t.n('globe.prefs.closeMatches', nearMisses.length)}
                        </button>
                      )}
                      {impossible && (
                        <button
                          onClick={() => { useSpinStore.getState().autoFixFilters(); setLocalBudget([500, 5000]); setLocalInternetRange([10, 500]); setLocalSafetyRange([1, 10]); }}
                          className="text-[10px] font-mono text-destructive/80 hover:text-destructive transition-colors tracking-wider underline underline-offset-2"
                        >
                          {t('globe.prefs.reset')}
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
                            <div key={city.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.03] text-[10px] font-mono text-foreground/50">
                              <span>{cityDisplayName(city, locale)}, {countryName(city.countryCode, city.country, locale)}</span>
                              <span>${city.costUSD}{t('data.metric.perMonth')}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={onSpin}
                    disabled={impossible}
                    className={`group w-full h-14 font-display font-bold text-base rounded-lg transition-all duration-300 relative overflow-hidden ${
                      impossible
                        ? 'bg-destructive/20 border border-destructive/30 text-destructive cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {impossible ? (
                      <span className="flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {t('globe.prefs.noMatch')}
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10">{t('globe.prefs.findNext')}</span>
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
