import { create } from 'zustand';
import { City, cities } from '@/data/cities';

export type AppPhase = 'landing' | 'preferences' | 'spinning' | 'results';
export type VibeOption = 'beach' | 'party' | 'workhub' | 'mountain' | 'adventure' | 'family' | 'foodie';
export type RegionOption = 'Asia' | 'Europe' | 'LATAM' | 'Africa' | 'Oceania' | 'North America' | 'All';

interface Preferences {
  budgetRange: [number, number];
  internetMin: number;
  safetyMin: number;
  vibes: VibeOption[];
  region: RegionOption;
}

interface SpinStore {
  phase: AppPhase;
  preferences: Preferences;
  filteredCities: City[];
  resultCity: City | null;
  savedSpins: City[];
  spinCount: number;

  setPhase: (phase: AppPhase) => void;
  setPreferences: (prefs: Partial<Preferences>) => void;
  filterCities: () => void;
  spin: () => void;
  saveResult: () => void;
  reset: () => void;
  resetForRespin: () => void;
  autoFixFilters: () => void;
}

const defaultPreferences: Preferences = {
  budgetRange: [500, 3000],
  internetMin: 20,
  safetyMin: 5,
  vibes: [],
  region: 'All',
};

export const useSpinStore = create<SpinStore>((set, get) => ({
  phase: 'landing',
  preferences: defaultPreferences,
  filteredCities: cities,
  resultCity: null,
  savedSpins: JSON.parse(localStorage.getItem('savedSpins') || '[]'),
  spinCount: parseInt(localStorage.getItem('spinCount') || '0'),

  setPhase: (phase) => set({ phase }),

  setPreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),

  filterCities: () => {
    const { preferences } = get();
    const filtered = cities.filter((city) => {
      if (city.costUSD < preferences.budgetRange[0] || city.costUSD > preferences.budgetRange[1]) return false;
      if (city.internetMbps < preferences.internetMin) return false;
      if (city.safety < preferences.safetyMin) return false;
      if (preferences.region !== 'All' && city.region !== preferences.region) return false;
      if (preferences.vibes.length > 0 && !preferences.vibes.some((v) => city.vibe.includes(v))) return false;
      return true;
    });
    set({ filteredCities: filtered });
  },

  spin: () => {
    const { filteredCities } = get();
    if (filteredCities.length === 0) return;

    const weights = filteredCities.map((city) => {
      const { preferences } = get();
      let score = 50;
      const budgetCenter = (preferences.budgetRange[0] + preferences.budgetRange[1]) / 2;
      score += Math.max(0, 20 - Math.abs(city.costUSD - budgetCenter) / 50);
      score += city.safety * 2;
      score += Math.min(city.internetMbps / 10, 15);
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
    localStorage.setItem('spinCount', String(newCount));
    set({ resultCity: filteredCities[selectedIndex], spinCount: newCount });
  },

  saveResult: () => {
    const { resultCity, savedSpins } = get();
    if (!resultCity) return;
    if (savedSpins.find((c) => c.id === resultCity.id)) return;
    const updated = [...savedSpins, resultCity];
    localStorage.setItem('savedSpins', JSON.stringify(updated));
    set({ savedSpins: updated });
  },

  reset: () => set({ phase: 'landing', resultCity: null }),

  resetForRespin: () => {
    console.log('Spin Reset Initiated');
    set({ resultCity: null, phase: 'landing' });
    // Re-filter against current preferences
    get().filterCities();
  },

  autoFixFilters: () => {
    // Find the loosest set of filters that yields results
    const { preferences } = get();
    let newPrefs = { ...preferences };
    
    // Widen budget
    newPrefs.budgetRange = [500, 5000];
    // Lower internet minimum
    newPrefs.internetMin = 10;
    // Lower safety minimum
    newPrefs.safetyMin = 1;
    // Clear vibes
    newPrefs.vibes = [];
    // Reset region
    newPrefs.region = 'All' as RegionOption;

    set({ preferences: newPrefs });
    get().filterCities();
  },
}));
