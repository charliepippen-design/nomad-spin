import { create } from 'zustand';
import { City, cities } from '@/data/cities';
import { Origin, origins as originsData } from '@/data/origins';
import { haversineKm, estimateFlightCost } from '@/lib/distance';

export type AppPhase = 'landing' | 'preferences' | 'spinning' | 'results';
export type VibeOption = 'beach' | 'party' | 'workhub' | 'mountain' | 'adventure' | 'family' | 'foodie';
export type RegionOption = 'Asia' | 'Europe' | 'LATAM' | 'Africa' | 'Oceania' | 'North America' | 'All';

interface Preferences {
  budgetRange: [number, number];
  internetMin: number;
  safetyMin: number;
  vibes: VibeOption[];
  region: RegionOption;
  origin: Origin | null;
}

export interface SavedSpin {
  city: City;
  timestamp: string;
  preferences: Preferences;
}

interface SpinStore {
  phase: AppPhase;
  preferences: Preferences;
  filteredCities: City[];
  resultCity: City | null;
  savedSpins: SavedSpin[];
  spinCount: number;
  streak: number;
  lastSpinDate: string | null;

  setPhase: (phase: AppPhase) => void;
  setPreferences: (prefs: Partial<Preferences>) => void;
  filterCities: () => void;
  spin: () => void;
  saveResult: () => void;
  removeSavedSpin: (index: number) => void;
  redeploySpin: (index: number) => void;
  reset: () => void;
  resetForRespin: () => void;
  autoFixFilters: () => void;
  getNearMisses: () => City[];
  getShareableUrl: () => string;
  loadFromUrl: () => boolean;
}

const defaultPreferences: Preferences = {
  budgetRange: [500, 3000],
  internetMin: 20,
  safetyMin: 5,
  vibes: [],
  region: 'All',
  origin: null,
};

function calculateStreak(lastDate: string | null): number {
  if (!lastDate) return 1;
  const last = new Date(lastDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return parseInt(localStorage.getItem('streak') || '1') + (diffDays === 1 ? 1 : 0);
  return 1;
}

function loadSavedSpins(): SavedSpin[] {
  try {
    const raw = localStorage.getItem('savedSpins');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migrate old format (City[]) to new format (SavedSpin[])
    if (parsed.length > 0 && !parsed[0].city) {
      return parsed.map((city: City) => ({
        city,
        timestamp: new Date().toLocaleDateString(),
        preferences: defaultPreferences,
      }));
    }
    return parsed;
  } catch {
    return [];
  }
}

export const useSpinStore = create<SpinStore>((set, get) => ({
  phase: 'landing',
  preferences: defaultPreferences,
  filteredCities: cities,
  resultCity: null,
  savedSpins: loadSavedSpins(),
  spinCount: parseInt(localStorage.getItem('spinCount') || '0'),
  streak: parseInt(localStorage.getItem('streak') || '0'),
  lastSpinDate: localStorage.getItem('lastSpinDate'),

  setPhase: (phase) => set({ phase }),

  setPreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),

  filterCities: () => {
    const { preferences } = get();
    const origin = preferences.origin;
    const isAnywhere = !origin || origin.id === 'anywhere';
    const budgetMax = preferences.budgetRange[1];

    const filtered = cities.filter((city) => {
      if (city.costUSD < preferences.budgetRange[0] || city.costUSD > preferences.budgetRange[1]) return false;
      if (city.internetMbps < preferences.internetMin) return false;
      if (city.safety < preferences.safetyMin) return false;
      if (preferences.region !== 'All' && city.region !== preferences.region) return false;
      if (preferences.vibes.length > 0 && !preferences.vibes.some((v) => city.vibe.includes(v))) return false;

      if (!isAnywhere && origin) {
        const dist = haversineKm(origin.lat, origin.lng, city.lat, city.lng);
        const flightCost = estimateFlightCost(dist);
        if (flightCost > budgetMax * 0.6) return false;
      }

      return true;
    });
    set({ filteredCities: filtered });
  },

  getNearMisses: () => {
    const { preferences } = get();
    // Relax filters by 15%
    return cities.filter((city) => {
      const budgetFloor = preferences.budgetRange[0] * 0.85;
      const budgetCeil = preferences.budgetRange[1] * 1.15;
      if (city.costUSD < budgetFloor || city.costUSD > budgetCeil) return false;
      if (city.internetMbps < preferences.internetMin * 0.85) return false;
      if (city.safety < preferences.safetyMin * 0.85) return false;
      if (preferences.region !== 'All' && city.region !== preferences.region) return false;
      return true;
    }).slice(0, 5);
  },

  spin: () => {
    const { filteredCities, preferences } = get();
    if (filteredCities.length === 0) return;

    const origin = preferences.origin;
    const isAnywhere = !origin || origin.id === 'anywhere';

    const weights = filteredCities.map((city) => {
      let score = 50;
      const budgetCenter = (preferences.budgetRange[0] + preferences.budgetRange[1]) / 2;
      score += Math.max(0, 20 - Math.abs(city.costUSD - budgetCenter) / 50);
      score += city.safety * 2;
      score += Math.min(city.internetMbps / 10, 15);

      if (!isAnywhere && origin) {
        const dist = haversineKm(origin.lat, origin.lng, city.lat, city.lng);
        score += Math.max(0, 20 - dist / 500);
      }

      return score;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) { selectedIndex = i; break; }
    }

    const newCount = get().spinCount + 1;
    const today = new Date().toISOString().split('T')[0];
    const newStreak = calculateStreak(get().lastSpinDate);

    localStorage.setItem('spinCount', String(newCount));
    localStorage.setItem('streak', String(newStreak));
    localStorage.setItem('lastSpinDate', today);

    set({
      resultCity: filteredCities[selectedIndex],
      spinCount: newCount,
      streak: newStreak,
      lastSpinDate: today,
    });
  },

  saveResult: () => {
    const { resultCity, savedSpins, preferences } = get();
    if (!resultCity) return;
    if (savedSpins.find((s) => s.city.id === resultCity.id)) return;
    const newSpin: SavedSpin = {
      city: resultCity,
      timestamp: new Date().toLocaleDateString(),
      preferences: { ...preferences },
    };
    const updated = [...savedSpins, newSpin];
    localStorage.setItem('savedSpins', JSON.stringify(updated));
    set({ savedSpins: updated });
  },

  removeSavedSpin: (index: number) => {
    const updated = get().savedSpins.filter((_, i) => i !== index);
    localStorage.setItem('savedSpins', JSON.stringify(updated));
    set({ savedSpins: updated });
  },

  redeploySpin: (index: number) => {
    const spin = get().savedSpins[index];
    if (!spin) return;
    set({
      preferences: { ...spin.preferences },
      phase: 'preferences',
    });
    get().filterCities();
  },

  reset: () => set({ phase: 'landing', resultCity: null }),

  resetForRespin: () => {
    set({ resultCity: null, phase: 'landing' });
    get().filterCities();
  },

  autoFixFilters: () => {
    set({
      preferences: { ...defaultPreferences, origin: get().preferences.origin },
    });
    get().filterCities();
  },

  getShareableUrl: () => {
    const { preferences } = get();
    const params = new URLSearchParams();
    params.set('b', `${preferences.budgetRange[0]}-${preferences.budgetRange[1]}`);
    params.set('i', String(preferences.internetMin));
    params.set('s', String(preferences.safetyMin));
    if (preferences.vibes.length) params.set('v', preferences.vibes.join(','));
    if (preferences.region !== 'All') params.set('r', preferences.region);
    if (preferences.origin && preferences.origin.id !== 'anywhere') params.set('o', preferences.origin.id);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  },

  loadFromUrl: () => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('b')) return false;

    const budget = params.get('b')?.split('-').map(Number) as [number, number] | undefined;
    const internet = Number(params.get('i')) || 20;
    const safety = Number(params.get('s')) || 5;
    const vibes = (params.get('v')?.split(',') || []) as VibeOption[];
    const region = (params.get('r') || 'All') as RegionOption;
    const originId = params.get('o');

    const origin = originId ? originsData.find((o) => o.id === originId) || null : null;

    set({
      preferences: {
        budgetRange: budget || [500, 3000],
        internetMin: internet,
        safetyMin: safety,
        vibes,
        region,
        origin,
      },
    });
    get().filterCities();
    return true;
  },
}));
