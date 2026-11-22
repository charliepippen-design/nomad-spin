import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import OriginSelector, { originLabel } from '@/components/OriginSelector';
import { useSpinStore } from '@/store/useSpinStore';
import { origins } from '@/data/origins';
import { cities } from '@/data/cities';
import { findOriginById } from '@/lib/originLookup';
import { calculateMatchScore, generateIntel, scoreCityForPreferences } from '@/lib/scoring';
import { generateAffiliateLinks } from '@/utils/affiliateEngine';
import { findCityBySlug } from '@/lib/citySlug';

const athens = origins.find((o) => o.name === 'Athens')!;
const newYork = origins.find((o) => o.id === 'new-york-us')!;
const lisbon = findCityBySlug('lisbon')!.city;

/** Selector wired to the store, the way the header and the drawer use it. */
function StoreSelector() {
  const origin = useSpinStore((s) => s.preferences.origin);
  const setPreferences = useSpinStore((s) => s.setPreferences);
  return <OriginSelector value={origin} onChange={(next) => setPreferences({ origin: next })} />;
}

beforeEach(() => {
  localStorage.clear();
  useSpinStore.getState().setPreferences({ origin: null });
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  window.history.replaceState({}, '', '/');
});

describe('"Leaving from" label', () => {
  it('reads "choose" until a city is set', () => {
    expect(originLabel(null)).toBe('choose');
    expect(athens).toBeDefined();
    expect(originLabel(athens)).toBe('Athens');
  });

  it('shows "Leaving from: choose" on a first visit and does not ask for the position', () => {
    const getCurrentPosition = vi.fn();
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition } });
    render(<StoreSelector />);
    expect(screen.getByRole('button', { name: /leaving from: choose/i })).toBeTruthy();
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('asks for the position only when "Use my location" is picked, and lists it first', () => {
    const getCurrentPosition = vi.fn();
    vi.stubGlobal('navigator', { ...navigator, geolocation: { getCurrentPosition } });
    render(<StoreSelector />);
    fireEvent.click(screen.getByRole('button', { name: /leaving from/i }));
    expect(getCurrentPosition).not.toHaveBeenCalled();
    const menuButtons = screen.getAllByRole('button').map((b) => b.textContent);
    expect(menuButtons[1]).toBe('Use my location');
    fireEvent.click(screen.getByRole('button', { name: 'Use my location' }));
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('two selectors (header and drawer) stay in step through the store', () => {
    render(<><StoreSelector /><StoreSelector /></>);
    const [first] = screen.getAllByRole('button', { name: /leaving from/i });
    fireEvent.click(first);
    fireEvent.click(screen.getByRole('option', { name: /athens/i }));
    expect(useSpinStore.getState().preferences.origin?.id).toBe(athens.id);
    expect(screen.getAllByRole('button', { name: /leaving from: athens/i })).toHaveLength(2);
    expect(localStorage.getItem('nomadspin_origin_city_slug')).toBe(athens.id);
  });

  it('restores the last choice from storage', () => {
    localStorage.setItem('nomadspin_origin_city_slug', athens.id);
    render(<StoreSelector />);
    expect(screen.getByRole('button', { name: /leaving from: athens/i })).toBeTruthy();
  });
});

describe('shared URL carries the origin (o=)', () => {
  it('round-trips a hub city', () => {
    useSpinStore.getState().setPreferences({ origin: athens });
    const url = new URL(useSpinStore.getState().getShareableUrl());
    expect(url.searchParams.get('o')).toBe(athens.id);
    useSpinStore.getState().setPreferences({ origin: null });
    window.history.replaceState({}, '', `/${url.search}`);
    expect(useSpinStore.getState().loadFromUrl()).toBe(true);
    expect(useSpinStore.getState().preferences.origin?.id).toBe(athens.id);
  });

  it('round-trips a city that is not in the hub list', () => {
    const hubIds = new Set(origins.map((o) => o.id));
    const nonHub = cities.find((c) => !hubIds.has(c.id))!;
    expect(findOriginById(nonHub.id)?.name).toBe(nonHub.name);
    window.history.replaceState({}, '', `/?b=500-3000&i=20&s=5&o=${nonHub.id}`);
    expect(useSpinStore.getState().loadFromUrl()).toBe(true);
    expect(useSpinStore.getState().preferences.origin?.id).toBe(nonHub.id);
  });
});

describe('changing the origin changes the results', () => {
  it('match score and flight hours differ between Athens and New York', () => {
    const fromAthens = scoreCityForPreferences(lisbon, 3000, 20, 5, [], athens, []);
    const fromNewYork = scoreCityForPreferences(lisbon, 3000, 20, 5, [], newYork, []);
    const noOrigin = scoreCityForPreferences(lisbon, 3000, 20, 5, [], null, []);
    expect(noOrigin.flightInfo).toBeUndefined();
    expect(fromAthens.flightInfo!.hours).not.toBe(fromNewYork.flightInfo!.hours);
    expect(fromAthens.flightInfo!.distKm).toBeLessThan(fromNewYork.flightInfo!.distKm);
    expect(fromAthens.score).toBeGreaterThan(fromNewYork.score);
    expect(calculateMatchScore(lisbon, 3000, 20, 5, athens)).not.toBe(
      calculateMatchScore(lisbon, 3000, 20, 5, newYork),
    );
  });

  it('results already on screen are rescored when the origin changes', () => {
    const store = useSpinStore.getState();
    store.setPreferences({ origin: athens });
    store.filterCities();
    store.spin();
    const before = useSpinStore.getState().topResults;
    expect(before.length).toBeGreaterThan(0);
    useSpinStore.getState().setPreferences({ origin: newYork });
    const after = useSpinStore.getState().topResults;
    expect(after.map((r) => r.city.id)).toEqual(before.map((r) => r.city.id));
    expect(after[0].flightInfo!.distKm).not.toBe(before[0].flightInfo!.distKm);
    useSpinStore.getState().setPreferences({ origin: null });
    expect(useSpinStore.getState().topResults[0].flightInfo).toBeUndefined();
    useSpinStore.setState({ topResults: [], resultCity: null });
  });

  it('the "flight from" line names the origin', () => {
    expect(generateIntel(lisbon, 3000, 20, athens).join(' ')).toContain('flight from Athens');
    expect(generateIntel(lisbon, 3000, 20, newYork).join(' ')).toContain('flight from New York');
  });

  it('the flight link starts from the origin when the flights partner is live', () => {
    vi.stubEnv('VITE_SKYSCANNER_ID', 'test-id');
    const fromAthens = generateAffiliateLinks(lisbon, 'Athens').flights;
    const fromNewYork = generateAffiliateLinks(lisbon, 'New York').flights;
    expect(JSON.stringify(fromAthens)).toContain('/flights/Athens/Lisbon/');
    expect(JSON.stringify(fromNewYork)).toContain('/flights/New%20York/Lisbon/');
  });
});
