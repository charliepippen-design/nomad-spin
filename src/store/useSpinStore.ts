import { create } from 'zustand';
import { City, cities } from '@/data/cities';
import { Origin } from '@/data/origins';
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
  origin: null,
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
    const origin = preferences.origin;
    const isAnywhere = !origin || origin.id === 'anywhere';
    const budgetMax = preferences.budgetRange[1];

    const filtered = cities.filter((city) => {
      if (city.costUSD < preferences.budgetRange[0] || city.costUSD > preferences.budgetRange[1]) return false;
      if (city.internetMbps < preferences.internetMin) return false;
      if (city.safety < preferences.safetyMin) return false;
      if (preferences.region !== 'All' && city.region !== preferences.region) return false;
      if (preferences.vibes.length > 0 && !preferences.vibes.some((v) => city.vibe.includes(v))) return false;

      // "Jack Ass" logic: if origin set and low budget, penalize far destinations
      if (!isAnywhere && origin) {
        const dist = haversineKm(origin.lat, origin.lng, city.lat, city.lng);
        const flightCost = estimateFlightCost(dist);
        // If flight alone exceeds 60% of monthly budget, exclude
        if (flightCost > budgetMax * 0.6) return false;
      }

      return true;
    });
    set({ filteredCities: filtered });
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

      // Proximity bonus when origin is set
      if (!isAnywhere && origin) {
        const dist = haversineKm(origin.lat, origin.lng, city.lat, city.lng);
        // Closer = higher bonus (max ~20 pts)
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
    get().filterCities();
  },

  autoFixFilters: () => {
    set({
      preferences: { ...defaultPreferences, origin: get().preferences.origin },
    });
    get().filterCities();
  },
}));
