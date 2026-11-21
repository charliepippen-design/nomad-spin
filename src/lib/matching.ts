import type { City } from '@/data/cities';
import type { Locale } from '../i18n/config';
import { getT } from '../i18n/dictionary';
import { formatNumber } from '../i18n/format';

/**
 * Find Your Base: transparent weighted matching.
 *
 * Every criterion turns into a fit between 0 and 1 with a rule a person can
 * read. The total is the weighted average of those fits, times 100. Nothing is
 * hidden and nothing is learned: change a weight and the ranking changes for
 * exactly that reason.
 */

export type CriterionKey = 'budget' | 'climate' | 'internet' | 'safety' | 'community' | 'visa';

export const CRITERIA: CriterionKey[] = ['budget', 'climate', 'internet', 'safety', 'community', 'visa'];

export const CRITERION_LABEL: Record<CriterionKey, string> = {
  budget: 'Budget',
  climate: 'Climate',
  internet: 'Internet',
  safety: 'Safety',
  community: 'Community',
  visa: 'Visa length',
};

/** Criterion name in the reader's language. English equals CRITERION_LABEL. */
export function criterionLabel(key: CriterionKey, locale: Locale = 'en'): string {
  return getT(locale).dyn(`tools.criterion.${key}`, CRITERION_LABEL[key]);
}

/** Starting weights. Illustrative, not validated: the sliders are the point. */
export const DEFAULT_WEIGHTS: Record<CriterionKey, number> = {
  budget: 30,
  climate: 20,
  internet: 20,
  safety: 15,
  community: 10,
  visa: 5,
};

export interface MatchPreferences {
  /** Monthly budget ceiling, USD. */
  budgetMax: number;
  /** Preferred average temperature, °C. */
  tempIdeal: number;
  /** Minimum acceptable download speed, Mbps. */
  internetMin: number;
  /** Minimum acceptable safety score, 0 to 10. */
  safetyMin: number;
  /** Minimum stay you want without a new application, days. */
  visaMinDays: number;
  /** Regions to include. Empty means everywhere. */
  regions: City['region'][];
  /** Drop rows whose whole record is flagged as estimated. */
  datasetOnly: boolean;
  /** Hard filter: drop cities that are over budget or below any minimum. */
  strictMinimums: boolean;
}

export const DEFAULT_PREFERENCES: MatchPreferences = {
  budgetMax: 2000,
  tempIdeal: 22,
  internetMin: 50,
  safetyMin: 7,
  visaMinDays: 90,
  regions: [],
  datasetOnly: false,
  strictMinimums: false,
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
/** A bare figure: unchanged in English, decimal comma and the like elsewhere. */
const plain = (n: number, locale: Locale): string => (locale === 'en' ? String(n) : formatNumber(n, locale));

/** Degrees away from the ideal at which climate fit reaches zero. */
export const CLIMATE_TOLERANCE_C = 15;
/** Share over budget at which budget fit reaches zero (0.5 = 50% over). */
export const BUDGET_OVERRUN_LIMIT = 0.5;
/**
 * A city below one of your minimums (internet, safety, visa length) earns at
 * most this share of that criterion, so a miss always shows in the score.
 */
export const BELOW_MINIMUM_CAP = 0.5;

export interface CriterionResult {
  key: CriterionKey;
  /** 0..1 */
  fit: number;
  /** Share of the total weight, 0..1. */
  weightShare: number;
  /** Points this criterion adds to the 0..100 score. */
  points: number;
  /** Plain-language reason, built from the city's own numbers. */
  note: string;
  /** True when the city is over your budget or below a minimum you set. */
  missed: boolean;
}

export function criterionFit(
  key: CriterionKey,
  city: City,
  prefs: MatchPreferences,
  locale: Locale = 'en',
): { fit: number; note: string; missed?: boolean } {
  const t = getT(locale);
  switch (key) {
    case 'budget': {
      const cost = city.costUSD;
      if (cost <= prefs.budgetMax) {
        return { fit: 1, note: t('tools.note.budget.within', { cost: formatNumber(cost, locale), budget: formatNumber(prefs.budgetMax, locale) }) };
      }
      const over = (cost - prefs.budgetMax) / prefs.budgetMax;
      return {
        fit: clamp01(1 - over / BUDGET_OVERRUN_LIMIT),
        note: t('tools.note.budget.over', { cost: formatNumber(cost, locale), percent: Math.round(over * 100) }),
        missed: true,
      };
    }
    case 'climate': {
      const gap = Math.abs(city.weather.tempAvgC - prefs.tempIdeal);
      const temp = plain(city.weather.tempAvgC, locale);
      return {
        fit: clamp01(1 - gap / CLIMATE_TOLERANCE_C),
        note:
          gap < 1
            ? t('tools.note.climate.match', { temp, ideal: plain(prefs.tempIdeal, locale) })
            : t(city.weather.tempAvgC > prefs.tempIdeal ? 'tools.note.climate.warmer' : 'tools.note.climate.cooler', {
                temp,
                gap: Math.round(gap),
              }),
      };
    }
    case 'internet': {
      const mbps = city.internetMbps;
      const vars = { mbps: plain(mbps, locale), min: plain(prefs.internetMin, locale) };
      if (prefs.internetMin <= 0 || mbps >= prefs.internetMin) {
        return { fit: 1, note: t('tools.note.internet.meets', vars) };
      }
      return {
        fit: BELOW_MINIMUM_CAP * clamp01(mbps / prefs.internetMin),
        note: t('tools.note.internet.below', vars),
        missed: true,
      };
    }
    case 'safety': {
      const s = city.safety;
      const vars = { score: plain(s, locale), min: plain(prefs.safetyMin, locale) };
      if (prefs.safetyMin <= 0 || s >= prefs.safetyMin) {
        return { fit: 1, note: t('tools.note.safety.meets', vars) };
      }
      return {
        fit: BELOW_MINIMUM_CAP * clamp01(s / prefs.safetyMin),
        note: t('tools.note.safety.below', vars),
        missed: true,
      };
    }
    case 'community': {
      const size = city.vibeMetrics.communitySize;
      return { fit: clamp01(size / 10), note: t('tools.note.community', { size: plain(size, locale) }) };
    }
    case 'visa': {
      if (prefs.visaMinDays <= 0) return { fit: 1, note: t('tools.note.visa.none') };
      const days = city.meta.visaDays;
      const vars = {
        visaType: t.dyn(`data.visaType.${city.meta.visaType}`, city.meta.visaType),
        days: plain(days, locale),
        min: plain(prefs.visaMinDays, locale),
      };
      if (days >= prefs.visaMinDays) {
        return { fit: 1, note: t('tools.note.visa.covers', vars) };
      }
      return {
        fit: BELOW_MINIMUM_CAP * clamp01(days / prefs.visaMinDays),
        note: t('tools.note.visa.short', vars),
        missed: true,
      };
    }
  }
}

export interface MatchResult {
  city: City;
  /** 0..100, rounded. */
  score: number;
  criteria: CriterionResult[];
  /** Criteria with the highest and lowest fit among those that carry weight. */
  strongest: CriterionResult | null;
  weakest: CriterionResult | null;
  /** Budget or minimums this city does not meet, whatever their weight. */
  misses: CriterionResult[];
  /** True when the row is flagged `dataSource: 'estimated'`. */
  estimated: boolean;
}

export function normalizeWeights(weights: Record<CriterionKey, number>): Record<CriterionKey, number> {
  const safe = CRITERIA.map((k) => Math.max(0, Number.isFinite(weights[k]) ? weights[k] : 0));
  const total = safe.reduce((sum, w) => sum + w, 0);
  const out = {} as Record<CriterionKey, number>;
  CRITERIA.forEach((k, i) => {
    out[k] = total > 0 ? safe[i] / total : 0;
  });
  return out;
}

export function scoreCity(
  city: City,
  prefs: MatchPreferences,
  weights: Record<CriterionKey, number>,
  locale: Locale = 'en',
): MatchResult {
  const shares = normalizeWeights(weights);
  const criteria = CRITERIA.map<CriterionResult>((key) => {
    const { fit, note, missed = false } = criterionFit(key, city, prefs, locale);
    return { key, fit, weightShare: shares[key], points: fit * shares[key] * 100, note, missed };
  });
  const weighted = criteria.filter((c) => c.weightShare > 0);
  const byFit = [...weighted].sort((a, b) => b.fit - a.fit || b.weightShare - a.weightShare);
  // The trade-off worth naming is the criterion that cost the most points, not the lowest raw fit.
  const lost = (c: CriterionResult) => c.weightShare * (1 - c.fit);
  const costliest = [...weighted].sort((a, b) => lost(b) - lost(a))[0];
  const total = criteria.reduce((sum, c) => sum + c.points, 0);
  return {
    city,
    score: Math.round(total),
    criteria,
    strongest: byFit[0] ?? null,
    weakest: costliest && lost(costliest) > 0 && costliest !== byFit[0] ? costliest : null,
    misses: criteria.filter((c) => c.missed),
    estimated: city.dataSource === 'estimated',
  };
}

export interface MatchOutcome {
  results: MatchResult[];
  /** Cities scored after the region and data filters. */
  considered: number;
  /** Cities dropped by the strict-minimums filter. */
  excludedByMinimums: number;
  /** True when every weight is zero, so no ranking is possible. */
  noWeights: boolean;
}

export function rankCities(
  cities: City[],
  prefs: MatchPreferences,
  weights: Record<CriterionKey, number>,
  limit = 12,
  locale: Locale = 'en',
): MatchOutcome {
  const noWeights = CRITERIA.every((k) => !(weights[k] > 0));
  const pool = cities.filter((c) => {
    if (prefs.regions.length > 0 && !prefs.regions.includes(c.region)) return false;
    if (prefs.datasetOnly && c.dataSource === 'estimated') return false;
    return true;
  });
  if (noWeights) return { results: [], considered: pool.length, excludedByMinimums: 0, noWeights };

  const scored = pool.map((c) => scoreCity(c, prefs, weights, locale));
  const kept = prefs.strictMinimums ? scored.filter((r) => r.misses.length === 0) : scored;
  const results = kept
    // Exact score first; cheaper city breaks a tie so the order is stable and explainable.
    .sort(
      (a, b) =>
        b.criteria.reduce((s, c) => s + c.points, 0) - a.criteria.reduce((s, c) => s + c.points, 0) ||
        a.city.costUSD - b.city.costUSD ||
        a.city.name.localeCompare(b.city.name),
    )
    .slice(0, limit);
  return { results, considered: pool.length, excludedByMinimums: scored.length - kept.length, noWeights };
}
