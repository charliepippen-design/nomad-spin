import { describe, expect, it } from 'vitest';
import { cities } from '@/data/cities';
import type { City } from '@/data/cities';
import {
  CRITERIA,
  DEFAULT_PREFERENCES,
  DEFAULT_WEIGHTS,
  criterionFit,
  normalizeWeights,
  rankCities,
  scoreCity,
  type CriterionKey,
} from '@/lib/matching';
import { findCityBySlug } from '@/lib/citySlug';

const base = findCityBySlug('lisbon')!.city;
const make = (patch: Partial<City>): City => ({ ...base, ...patch });
const only = (key: CriterionKey): Record<CriterionKey, number> =>
  Object.fromEntries(CRITERIA.map((k) => [k, k === key ? 10 : 0])) as Record<CriterionKey, number>;

describe('criterion fit rules', () => {
  it('budget: full fit at or under, zero at 50% over, linear between', () => {
    const prefs = { ...DEFAULT_PREFERENCES, budgetMax: 2000 };
    expect(criterionFit('budget', make({ costUSD: 2000 }), prefs).fit).toBe(1);
    expect(criterionFit('budget', make({ costUSD: 900 }), prefs).fit).toBe(1);
    expect(criterionFit('budget', make({ costUSD: 2500 }), prefs).fit).toBeCloseTo(0.5);
    expect(criterionFit('budget', make({ costUSD: 3000 }), prefs).fit).toBe(0);
    expect(criterionFit('budget', make({ costUSD: 9000 }), prefs).fit).toBe(0);
  });

  it('climate: falls to zero 15 degrees from the ideal', () => {
    const prefs = { ...DEFAULT_PREFERENCES, tempIdeal: 20 };
    const at = (tempAvgC: number) =>
      criterionFit('climate', make({ weather: { ...base.weather, tempAvgC } }), prefs).fit;
    expect(at(20)).toBe(1);
    expect(at(27.5)).toBeCloseTo(0.5);
    expect(at(35)).toBe(0);
    expect(at(5)).toBe(0);
  });

  it('internet and safety: share of the minimum when below it', () => {
    const prefs = { ...DEFAULT_PREFERENCES, internetMin: 100, safetyMin: 8 };
    expect(criterionFit('internet', make({ internetMbps: 50 }), prefs).fit).toBeCloseTo(0.5);
    expect(criterionFit('internet', make({ internetMbps: 300 }), prefs).fit).toBe(1);
    expect(criterionFit('safety', make({ safety: 6 }), prefs).fit).toBeCloseTo(0.75);
  });

  it('a zero minimum never penalises', () => {
    const prefs = { ...DEFAULT_PREFERENCES, internetMin: 0, safetyMin: 0, visaMinDays: 0 };
    expect(criterionFit('internet', make({ internetMbps: 5 }), prefs).fit).toBe(1);
    expect(criterionFit('safety', make({ safety: 2 }), prefs).fit).toBe(1);
    expect(criterionFit('visa', make({ meta: { ...base.meta, visaDays: 14 } }), prefs).fit).toBe(1);
  });
});

describe('weights', () => {
  it('normalise to shares that sum to 1', () => {
    const shares = normalizeWeights(DEFAULT_WEIGHTS);
    expect(CRITERIA.reduce((sum, k) => sum + shares[k], 0)).toBeCloseTo(1);
    expect(shares.budget).toBeCloseTo(0.3);
  });

  it('points add up to the score and each stays within its share', () => {
    const result = scoreCity(base, DEFAULT_PREFERENCES, DEFAULT_WEIGHTS);
    const total = result.criteria.reduce((sum, c) => sum + c.points, 0);
    expect(result.score).toBe(Math.round(total));
    for (const c of result.criteria) {
      expect(c.points).toBeLessThanOrEqual(c.weightShare * 100 + 1e-9);
      expect(c.note.length).toBeGreaterThan(0);
    }
  });

  it('a single weighted criterion decides the order', () => {
    const cheap = make({ id: 'cheap', costUSD: 800, safety: 5 });
    const safe = make({ id: 'safe', costUSD: 5000, safety: 9.5 });
    const prefs = { ...DEFAULT_PREFERENCES, budgetMax: 1000, safetyMin: 9 };
    expect(rankCities([cheap, safe], prefs, only('budget')).results[0].city.id).toBe('cheap');
    expect(rankCities([cheap, safe], prefs, only('safety')).results[0].city.id).toBe('safe');
  });

  it('returns no ranking when every weight is zero', () => {
    const zero = Object.fromEntries(CRITERIA.map((k) => [k, 0])) as Record<CriterionKey, number>;
    const outcome = rankCities(cities, DEFAULT_PREFERENCES, zero);
    expect(outcome.noWeights).toBe(true);
    expect(outcome.results).toEqual([]);
  });
});

describe('ranking over the real dataset', () => {
  it('respects limit, region and estimated-record filters', () => {
    const all = rankCities(cities, DEFAULT_PREFERENCES, DEFAULT_WEIGHTS, 12);
    expect(all.results).toHaveLength(12);
    expect(all.considered).toBe(cities.length);

    const asia = rankCities(cities, { ...DEFAULT_PREFERENCES, regions: ['Asia'] }, DEFAULT_WEIGHTS, 50);
    expect(asia.results.every((r) => r.city.region === 'Asia')).toBe(true);

    const curated = rankCities(cities, { ...DEFAULT_PREFERENCES, datasetOnly: true }, DEFAULT_WEIGHTS, 50);
    expect(curated.results.some((r) => r.estimated)).toBe(false);
    expect(curated.considered).toBeLessThan(all.considered);
  });

  it('is sorted by score, highest first, between 0 and 100', () => {
    const { results } = rankCities(cities, DEFAULT_PREFERENCES, DEFAULT_WEIGHTS, 40);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
    expect(results.every((r) => r.score >= 0 && r.score <= 100)).toBe(true);
  });
});
