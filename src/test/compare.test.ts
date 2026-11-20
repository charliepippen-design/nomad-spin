import { describe, expect, it } from 'vitest';
import { cities } from '@/data/cities';
import type { City } from '@/data/cities';
import {
  COMPARE_METRICS,
  MAX_COMPARE,
  buildComparison,
  buildRow,
  comparePath,
  costDelta,
  metricProvenance,
  parseCompareParam,
} from '@/lib/compare';
import { findCityBySlug } from '@/lib/citySlug';

const city = (slug: string): City => {
  const found = findCityBySlug(slug);
  if (!found) throw new Error(`fixture city missing: ${slug}`);
  return found.city;
};
const metric = (key: string) => {
  const m = COMPARE_METRICS.find((entry) => entry.key === key);
  if (!m) throw new Error(`metric missing: ${key}`);
  return m;
};
const withCost = (base: City, id: string, costUSD: number): City => ({ ...base, id, costUSD });

describe('compare URL state', () => {
  it('resolves, de-duplicates and caps slugs', () => {
    const parsed = parseCompareParam('lisbon, porto,lisbon,not-a-city,bangkok,penang,tbilisi');
    expect(parsed.map((c) => c.name)).toEqual(['Lisbon', 'Porto', 'Bangkok', 'Penang']);
    expect(parsed).toHaveLength(MAX_COMPARE);
  });

  it('returns nothing for an empty or missing param', () => {
    expect(parseCompareParam(null)).toEqual([]);
    expect(parseCompareParam('')).toEqual([]);
  });

  it('round-trips through comparePath', () => {
    const pair = [city('lisbon'), city('porto')];
    expect(comparePath(pair)).toBe('/compare?cities=lisbon,porto');
    expect(parseCompareParam('lisbon,porto').map((c) => c.id)).toEqual(pair.map((c) => c.id));
    expect(comparePath([])).toBe('/compare');
  });
});

describe('row leaders', () => {
  const base = city('lisbon');

  it('names the cheaper city on a lower-is-better row', () => {
    const row = buildRow(metric('cost'), [withCost(base, 'a', 2000), withCost(base, 'b', 1200)]);
    expect(row.leaderIndex).toBe(1);
    expect(row.tie).toBe(false);
    expect(row.cells[1].isLeader).toBe(true);
  });

  it('names no leader on a tie', () => {
    const row = buildRow(metric('cost'), [withCost(base, 'a', 1500), withCost(base, 'b', 1500)]);
    expect(row.leaderIndex).toBeNull();
    expect(row.tie).toBe(true);
  });

  it('never names a leader on visa or climate rows', () => {
    const pair = [city('lisbon'), city('bangkok')];
    for (const key of ['visaType', 'visaDays', 'temp', 'bestMonths', 'nightlife']) {
      expect(buildRow(metric(key), pair).leaderIndex, key).toBeNull();
    }
  });

  it('shows missing data as null and does not pick a leader from a single value', () => {
    const known: City = { ...base, id: 'a', healthInsurance: { costMonthly: 80, quality: 7 } };
    const unknown: City = { ...base, id: 'b', healthInsurance: { costMonthly: 0, quality: 0 } };
    const row = buildRow(metric('insurance'), [known, unknown]);
    expect(row.cells[1].text).toBeNull();
    expect(row.cells[1].value).toBeNull();
    expect(row.missing).toBe(1);
    expect(row.leaderIndex).toBeNull();
  });
});

describe('provenance', () => {
  it('tags every figure on an estimated record', () => {
    const estimated = cities.find((c) => c.dataSource === 'estimated');
    expect(estimated).toBeDefined();
    expect(metricProvenance(estimated!, metric('cost'))).toBe('estimate');
  });

  it('tags formula-derived fields only where the builder flagged them', () => {
    const flagged = cities.find((c) => c.dataSource !== 'estimated' && c.formulaEstimates?.airbnbMedian);
    expect(flagged).toBeDefined();
    expect(metricProvenance(flagged!, metric('nightly'))).toBe('formula');
    expect(metricProvenance(flagged!, metric('cost'))).toBe('dataset');
  });
});

describe('group summary', () => {
  it('counts leads per city and never produces an overall winner', () => {
    const groups = buildComparison([city('lisbon'), city('chiang-mai')]);
    expect(groups.map((g) => g.group)).toEqual(['Cost', 'Connectivity', 'Safety', 'Visa', 'Climate', 'Lifestyle']);
    for (const group of groups) {
      expect(group.leads).toHaveLength(2);
      expect(group.leads.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(group.decided);
      expect(group).not.toHaveProperty('winner');
    }
    expect(groups.find((g) => g.group === 'Visa')!.decided).toBe(0);
  });
});

describe('costDelta', () => {
  const base = city('lisbon');
  it('reports the gap and which city is cheaper', () => {
    const delta = costDelta(withCost(base, 'a', 2000), withCost(base, 'b', 1500));
    expect(delta?.cheaper.id).toBe('b');
    expect(delta?.amount).toBe(500);
    expect(delta?.percent).toBe(25);
  });
  it('is null when costs match', () => {
    expect(costDelta(withCost(base, 'a', 1500), withCost(base, 'b', 1500))).toBeNull();
  });
});
