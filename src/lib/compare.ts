import type { City } from '@/data/cities';
import { citySlug, findCityBySlug } from '@/lib/citySlug';
import { visaChipValue } from '@/lib/visaCopy';

/**
 * City comparison engine.
 *
 * Pure data in, rows out: no JSX, no invented values. A field the dataset does
 * not hold is `null` and renders as "No data". A row only names a leader when
 * the metric has a direction, at least two cities have a value, and one city is
 * strictly best. There is deliberately no overall winner.
 */

export const MIN_COMPARE = 2;
export const MAX_COMPARE = 4;

/**
 * Where a figure comes from.
 * - dataset: stored on the city row.
 * - formula: derived by the city builder from another field (see FormulaEstimates).
 * - estimate: the whole row is flagged `dataSource: 'estimated'`.
 */
export type Provenance = 'dataset' | 'formula' | 'estimate';

export type MetricGroup = 'Cost' | 'Connectivity' | 'Safety' | 'Visa' | 'Climate' | 'Lifestyle';

export const METRIC_GROUPS: MetricGroup[] = ['Cost', 'Connectivity', 'Safety', 'Visa', 'Climate', 'Lifestyle'];

type FormulaKey = keyof NonNullable<City['formulaEstimates']>;

export interface CompareMetric {
  key: string;
  group: MetricGroup;
  label: string;
  /** One line shown under the label: what the number means. */
  definition: string;
  /** Direction used to pick a row leader. `none` = preference or passport dependent. */
  better: 'higher' | 'lower' | 'none';
  /** Numeric value for bars and leaders. `null` = no data for this city. */
  value: (city: City) => number | null;
  /** Display text. Receives the raw city so text-only rows can format themselves. */
  format: (city: City) => string | null;
  /** Upper bound for a fixed scale (scores out of 10). Omit to scale to the row maximum. */
  scaleMax?: number;
  formulaKey?: FormulaKey;
}

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const outOfTen = (n: number) => `${n}/10`;
const positive = (n: number | undefined | null): number | null =>
  typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : null;
const months = (list: string[] | undefined): string | null =>
  list && list.length > 0 ? list.join(', ') : null;

const COWORKING_RANK: Record<City['infra']['coworkingDensity'], number> = { Low: 1, Med: 2, High: 3 };
const COWORKING_LABEL: Record<City['infra']['coworkingDensity'], string> = {
  Low: 'Low',
  Med: 'Medium',
  High: 'High',
};

export const COMPARE_METRICS: CompareMetric[] = [
  // ── Cost ──
  {
    key: 'cost',
    group: 'Cost',
    label: 'Monthly cost',
    definition: 'Solo nomad, short stay, USD per month.',
    better: 'lower',
    value: (c) => positive(c.costUSD),
    format: (c) => (positive(c.costUSD) ? `${usd(c.costUSD)}/mo` : null),
  },
  {
    key: 'costLongTerm',
    group: 'Cost',
    label: 'Long-stay monthly cost',
    definition: 'Stays of three months or more, USD per month.',
    better: 'lower',
    value: (c) => positive(c.financials.costLongTerm),
    format: (c) => (positive(c.financials.costLongTerm) ? `${usd(c.financials.costLongTerm)}/mo` : null),
    formulaKey: 'costLongTerm',
  },
  {
    key: 'nightly',
    group: 'Cost',
    label: 'Median nightly stay',
    definition: 'Short-let median, USD per night.',
    better: 'lower',
    value: (c) => positive(c.financials.airbnbMedian),
    format: (c) => (positive(c.financials.airbnbMedian) ? `${usd(c.financials.airbnbMedian)}/night` : null),
    formulaKey: 'airbnbMedian',
  },
  {
    key: 'insurance',
    group: 'Cost',
    label: 'Health insurance',
    definition: 'Typical monthly premium, USD.',
    better: 'lower',
    value: (c) => positive(c.healthInsurance?.costMonthly),
    format: (c) => (positive(c.healthInsurance?.costMonthly) ? `${usd(c.healthInsurance.costMonthly)}/mo` : null),
  },
  // ── Connectivity ──
  {
    key: 'internet',
    group: 'Connectivity',
    label: 'Internet speed',
    definition: 'Average download speed, Mbps.',
    better: 'higher',
    value: (c) => positive(c.internetMbps),
    format: (c) => (positive(c.internetMbps) ? `${c.internetMbps} Mbps` : null),
  },
  {
    key: 'reliability',
    group: 'Connectivity',
    label: 'Connection reliability',
    definition: 'Score out of 10.',
    better: 'higher',
    scaleMax: 10,
    value: (c) => positive(c.infra.internetReliability),
    format: (c) => (positive(c.infra.internetReliability) ? outOfTen(c.infra.internetReliability) : null),
    formulaKey: 'internetReliability',
  },
  {
    key: 'coworking',
    group: 'Connectivity',
    label: 'Coworking density',
    definition: 'How easy it is to find a desk.',
    better: 'higher',
    scaleMax: 3,
    value: (c) => COWORKING_RANK[c.infra.coworkingDensity] ?? null,
    format: (c) => COWORKING_LABEL[c.infra.coworkingDensity] ?? null,
  },
  {
    key: 'power',
    group: 'Connectivity',
    label: 'Power grid stability',
    definition: 'Score out of 10.',
    better: 'higher',
    scaleMax: 10,
    value: (c) => positive(c.infra.powerGridStability),
    format: (c) => (positive(c.infra.powerGridStability) ? outOfTen(c.infra.powerGridStability) : null),
    formulaKey: 'powerGridStability',
  },
  // ── Safety ──
  {
    key: 'safety',
    group: 'Safety',
    label: 'Overall safety',
    definition: 'Score out of 10.',
    better: 'higher',
    scaleMax: 10,
    value: (c) => positive(c.safety),
    format: (c) => (positive(c.safety) ? outOfTen(c.safety) : null),
  },
  {
    key: 'femaleSafety',
    group: 'Safety',
    label: 'Safety for women',
    definition: 'Score out of 10.',
    better: 'higher',
    scaleMax: 10,
    value: (c) => positive(c.vibeMetrics.femaleSafety),
    format: (c) => (positive(c.vibeMetrics.femaleSafety) ? outOfTen(c.vibeMetrics.femaleSafety) : null),
  },
  {
    key: 'lgbt',
    group: 'Safety',
    label: 'LGBTQ+ friendliness',
    definition: 'Score out of 10.',
    better: 'higher',
    scaleMax: 10,
    value: (c) => positive(c.vibeMetrics.lgbtFriendly),
    format: (c) => (positive(c.vibeMetrics.lgbtFriendly) ? outOfTen(c.vibeMetrics.lgbtFriendly) : null),
  },
  // ── Visa ── (no leader: the answer depends on your passport)
  {
    key: 'visaType',
    group: 'Visa',
    label: 'Common entry route',
    definition: 'The route most nomads use. Depends on your passport.',
    better: 'none',
    value: () => null,
    format: (c) => c.meta.visaType || null,
  },
  {
    key: 'visaDays',
    group: 'Visa',
    label: 'Stay length',
    definition: 'Days allowed on that route. Check an official source before you book.',
    better: 'none',
    value: (c) => positive(c.meta.visaDays),
    format: (c) =>
      positive(c.meta.visaDays) ? visaChipValue(c.countryCode, c.meta.visaType, c.meta.visaDays) : null,
  },
  // ── Climate ── (no leader: warmer is not better for everyone)
  {
    key: 'temp',
    group: 'Climate',
    label: 'Average temperature',
    definition: 'Annual average, degrees Celsius.',
    better: 'none',
    value: (c) => (Number.isFinite(c.weather.tempAvgC) ? c.weather.tempAvgC : null),
    format: (c) => (Number.isFinite(c.weather.tempAvgC) ? `${c.weather.tempAvgC}°C` : null),
  },
  {
    key: 'bestMonths',
    group: 'Climate',
    label: 'Best months',
    definition: 'Most comfortable months to be there.',
    better: 'none',
    value: () => null,
    format: (c) => months(c.weather.bestMonths),
  },
  {
    key: 'rainyMonths',
    group: 'Climate',
    label: 'Rainy months',
    definition: 'Wettest part of the year.',
    better: 'none',
    value: () => null,
    format: (c) => months(c.weather.rainyMonths),
  },
  // ── Lifestyle ──
  {
    key: 'community',
    group: 'Lifestyle',
    label: 'Nomad community',
    definition: 'Size of the remote-worker scene, out of 10.',
    better: 'higher',
    scaleMax: 10,
    value: (c) => positive(c.vibeMetrics.communitySize),
    format: (c) => (positive(c.vibeMetrics.communitySize) ? outOfTen(c.vibeMetrics.communitySize) : null),
  },
  {
    key: 'english',
    group: 'Lifestyle',
    label: 'English proficiency',
    definition: 'How far English gets you day to day, out of 10.',
    better: 'higher',
    scaleMax: 10,
    value: (c) => positive(c.vibeMetrics.englishProficiency),
    format: (c) => (positive(c.vibeMetrics.englishProficiency) ? outOfTen(c.vibeMetrics.englishProficiency) : null),
  },
  {
    key: 'nightlife',
    group: 'Lifestyle',
    label: 'Nightlife',
    definition: 'Score out of 10. More is not better for everyone.',
    better: 'none',
    scaleMax: 10,
    value: (c) => positive(c.vibeMetrics.nightlife),
    format: (c) => (positive(c.vibeMetrics.nightlife) ? outOfTen(c.vibeMetrics.nightlife) : null),
  },
  {
    key: 'timezone',
    group: 'Lifestyle',
    label: 'Time zone',
    definition: 'Offset from UTC.',
    better: 'none',
    value: () => null,
    format: (c) => c.meta.timeZoneUtc || null,
  },
];

export function metricProvenance(city: City, metric: Pick<CompareMetric, 'formulaKey'>): Provenance {
  if (city.dataSource === 'estimated') return 'estimate';
  if (metric.formulaKey && city.formulaEstimates?.[metric.formulaKey]) return 'formula';
  return 'dataset';
}

export interface CompareCell {
  city: City;
  /** Display text, or null when the dataset has nothing for this city. */
  text: string | null;
  value: number | null;
  /** 0..1 bar length, or null when the row has no numeric scale. */
  bar: number | null;
  provenance: Provenance;
  isLeader: boolean;
}

export interface CompareRow {
  metric: CompareMetric;
  cells: CompareCell[];
  /** Index of the single best city, or null (no direction, a tie, or under two values). */
  leaderIndex: number | null;
  /** True when two or more cities share the best value. */
  tie: boolean;
  /** Cities with no value for this metric. */
  missing: number;
}

export function buildRow(metric: CompareMetric, cities: City[]): CompareRow {
  const values = cities.map((c) => metric.value(c));
  const present = values.filter((v): v is number => v !== null);
  const max = metric.scaleMax ?? (present.length > 0 ? Math.max(...present) : 0);

  let leaderIndex: number | null = null;
  let tie = false;
  if (metric.better !== 'none' && present.length >= 2) {
    const best = metric.better === 'higher' ? Math.max(...present) : Math.min(...present);
    const holders = values.reduce<number[]>((acc, v, i) => (v === best ? [...acc, i] : acc), []);
    if (holders.length === 1) leaderIndex = holders[0];
    else tie = true;
  }

  const cells = cities.map<CompareCell>((city, i) => {
    const value = values[i];
    return {
      city,
      text: metric.format(city),
      value,
      bar: value !== null && max > 0 ? Math.max(0, Math.min(1, value / max)) : null,
      provenance: metricProvenance(city, metric),
      isLeader: leaderIndex === i,
    };
  });

  return {
    metric,
    cells,
    leaderIndex,
    tie,
    missing: cells.filter((cell) => cell.text === null).length,
  };
}

export interface CompareGroup {
  group: MetricGroup;
  rows: CompareRow[];
  /** Rows led by each city (same order as the input cities). */
  leads: number[];
  /** Rows in this group that have a direction and enough data to name a leader or a tie. */
  decided: number;
}

export function buildComparison(cities: City[]): CompareGroup[] {
  return METRIC_GROUPS.map((group) => {
    const rows = COMPARE_METRICS.filter((m) => m.group === group).map((m) => buildRow(m, cities));
    const leads = cities.map((_, i) => rows.filter((row) => row.leaderIndex === i).length);
    const decided = rows.filter((row) => row.leaderIndex !== null || row.tie).length;
    return { group, rows, leads, decided };
  });
}

/** "Lisbon is $900/mo cheaper than Berlin" style delta for the two-city headline. */
export function costDelta(a: City, b: City): { cheaper: City; pricier: City; amount: number; percent: number } | null {
  if (!positive(a.costUSD) || !positive(b.costUSD) || a.costUSD === b.costUSD) return null;
  const [cheaper, pricier] = a.costUSD < b.costUSD ? [a, b] : [b, a];
  const amount = pricier.costUSD - cheaper.costUSD;
  return { cheaper, pricier, amount, percent: Math.round((amount / pricier.costUSD) * 100) };
}

// ── URL state ──────────────────────────────────────────────────────────────

export const COMPARE_PARAM = 'cities';

/** Canonical slugs from `?cities=a,b,c`: resolved, de-duplicated, capped at MAX_COMPARE. */
export function parseCompareParam(raw: string | null | undefined): City[] {
  if (!raw) return [];
  const out: City[] = [];
  for (const part of raw.split(',')) {
    const resolved = findCityBySlug(part.trim());
    if (!resolved) continue;
    if (out.some((c) => c.id === resolved.city.id)) continue;
    out.push(resolved.city);
    if (out.length === MAX_COMPARE) break;
  }
  return out;
}

export function compareParamValue(cities: Pick<City, 'id' | 'name' | 'country'>[]): string {
  return cities.map((c) => citySlug(c)).join(',');
}

export function comparePath(cities: Pick<City, 'id' | 'name' | 'country'>[]): string {
  if (cities.length === 0) return '/compare';
  return `/compare?${COMPARE_PARAM}=${compareParamValue(cities)}`;
}
