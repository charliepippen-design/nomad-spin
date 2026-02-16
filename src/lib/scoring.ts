import { City } from '@/data/cities';
import type { LandscapeOption } from '@/data/cities/types';
import { Origin } from '@/data/origins';
import { haversineKm, estimateFlightTimeHours, estimateFlightCost, getEffectiveDistance } from '@/lib/distance';
import type { VibeOption } from '@/store/useSpinStore';

// ── Legacy scoring (kept for backward compat) ──

export interface ScoringWeights {
  budget: number;
  internet: number;
  safety: number;
  proximity: number;
}

const defaultWeights: ScoringWeights = {
  budget: 30,
  internet: 25,
  safety: 25,
  proximity: 20,
};

function budgetScore(cityCost: number, budgetMax: number): number {
  if (cityCost <= budgetMax) {
    return 80 + (cityCost / budgetMax) * 20;
  }
  const overage = (cityCost - budgetMax) / budgetMax;
  if (overage < 0.1) return 70 - overage * 200;
  if (overage < 0.3) return 50 - (overage - 0.1) * 250;
  return Math.max(-100, -(overage * 200));
}

function internetScore(cityMbps: number, minMbps: number): number {
  if (cityMbps < minMbps) return Math.max(0, (cityMbps / minMbps) * 40);
  const excess = (cityMbps - minMbps) / Math.max(minMbps, 1);
  return 60 + Math.min(40, excess * 20);
}

function safetyScore(citySafety: number, minSafety: number): number {
  if (citySafety < minSafety) return Math.max(0, (citySafety / minSafety) * 30);
  return 50 + citySafety * 5;
}

function proximityScore(distKm: number, budgetMax: number): number {
  const budgetFactor = budgetMax / 3000;
  const distPenalty = distKm / 20000;
  const score = 100 - (distPenalty * 100) / Math.max(budgetFactor, 0.3);
  return Math.max(0, Math.min(100, score));
}

/** Legacy: Calculate weighted match score 0-99 */
export function calculateMatchScore(
  city: City,
  budgetMax: number,
  internetMin: number,
  safetyMin: number,
  origin: Origin | null,
): number {
  const w = defaultWeights;
  const bScore = budgetScore(city.costUSD, budgetMax);
  const iScore = internetScore(city.internetMbps, internetMin);
  const sScore = safetyScore(city.safety, safetyMin);

  let pScore = 50;
  let totalWeight = w.budget + w.internet + w.safety;

  if (origin && origin.id !== 'anywhere') {
    const dist = haversineKm(origin.lat, origin.lng, city.lat, city.lng);
    pScore = proximityScore(dist, budgetMax);
    totalWeight += w.proximity;
  }

  const weighted = (
    bScore * w.budget +
    iScore * w.internet +
    sScore * w.safety +
    (origin && origin.id !== 'anywhere' ? pScore * w.proximity : 0)
  ) / totalWeight;

  return Math.max(0, Math.min(99, Math.round(weighted)));
}

// ── New: Preference-Weighted Scoring (0-100) ──

export interface ScoredCity {
  city: City;
  score: number;
  reason: string;
  breakdown: {
    budget: number;
    internet: number;
    safety: number;
    vibe: number;
    landscape: number;
    proximity: number;
  };
  flightInfo?: {
    distKm: number;
    hours: number;
    costEstimate: number;
  };
}

/** Score a city against full user preferences. Returns 0-100. */
export function scoreCityForPreferences(
  city: City,
  budgetMax: number,
  internetMin: number,
  safetyMin: number,
  vibes: VibeOption[],
  origin: Origin | null,
  landscapes: LandscapeOption[] = [],
): ScoredCity {
  // Budget (0-28)
  let bRaw: number;
  if (city.costUSD <= budgetMax) {
    bRaw = 80 + (city.costUSD / budgetMax) * 20;
  } else {
    const overage = (city.costUSD - budgetMax) / budgetMax;
    bRaw = Math.max(0, 80 - overage * 300);
  }
  const bPts = (bRaw / 100) * 28;

  // Internet (0-12)
  let iRaw: number;
  if (city.internetMbps < internetMin) {
    iRaw = Math.max(0, (city.internetMbps / internetMin) * 40);
  } else {
    const excess = (city.internetMbps - internetMin) / Math.max(internetMin, 1);
    iRaw = 60 + Math.min(40, excess * 20);
  }
  const iPts = (iRaw / 100) * 12;

  // Safety (0-12)
  let sRaw: number;
  if (city.safety < safetyMin) {
    sRaw = Math.max(0, (city.safety / safetyMin) * 40);
  } else {
    sRaw = 60 + Math.min(40, (city.safety - safetyMin) * 10);
  }
  const sPts = (sRaw / 100) * 12;

  // Vibe (0-20)
  let vPts = 0;
  if (vibes.length > 0) {
    const matches = vibes.filter(v => city.vibe.includes(v)).length;
    vPts = (matches / vibes.length) * 20;
  } else {
    vPts = 10;
  }

  // Landscape (0-13)
  let lPts = 6.5; // neutral if no landscape selected
  if (landscapes.length > 0) {
    const cityLandscapes = city.landscape || [];
    const matches = landscapes.filter(l => cityLandscapes.includes(l)).length;
    lPts = (matches / landscapes.length) * 13;
  }

  // Proximity (0-15)
  let pPts = 7.5;
  let flightInfo: ScoredCity['flightInfo'] = undefined;
  if (origin && origin.id !== 'anywhere') {
    const dist = getEffectiveDistance(origin.lat, origin.lng, city.lat, city.lng, city.nearestAirport);
    const pRaw = Math.max(0, 100 - (dist / 200));
    pPts = (Math.min(100, pRaw) / 100) * 15;
    flightInfo = {
      distKm: Math.round(dist),
      hours: estimateFlightTimeHours(dist),
      costEstimate: estimateFlightCost(dist),
    };
  }

  const total = Math.max(0, Math.min(100, Math.round(bPts + iPts + sPts + vPts + lPts + pPts)));

  const scores = [
    { key: 'budget', val: bPts / 28 },
    { key: 'vibe', val: vPts / 20 },
    { key: 'landscape', val: lPts / 13 },
    { key: 'safety', val: sPts / 12 },
    { key: 'internet', val: iPts / 12 },
    { key: 'proximity', val: pPts / 15 },
  ];
  scores.sort((a, b) => b.val - a.val);

  const reasonMap: Record<string, string> = {
    budget: 'BEST FOR BUDGET',
    vibe: 'IDEAL VIBE',
    landscape: 'PERFECT LANDSCAPE',
    safety: 'SAFEST OPTION',
    internet: 'FASTEST CONNECTIVITY',
    proximity: 'CLOSEST TO BASE',
  };

  return {
    city,
    score: total,
    reason: reasonMap[scores[0].key] || 'TOP MATCH',
    breakdown: {
      budget: Math.round(bPts),
      internet: Math.round(iPts),
      safety: Math.round(sPts),
      vibe: Math.round(vPts),
      landscape: Math.round(lPts),
      proximity: Math.round(pPts),
    },
    flightInfo,
  };
}

/** Generate dynamic "Why This Target?" intel based on user prefs */
export function generateIntel(
  city: City,
  budgetMax: number,
  internetMin: number,
  origin: Origin | null,
): string[] {
  const intel: string[] = [];

  if (city.costUSD <= budgetMax * 0.7) {
    intel.push(`${Math.round((1 - city.costUSD / budgetMax) * 100)}% under budget ceiling`);
  }
  if (city.internetMbps >= internetMin * 1.5) {
    intel.push(`${Math.round(city.internetMbps / internetMin * 100 - 100)}% above bandwidth threshold`);
  }
  if (city.safety >= 8.5) {
    intel.push('Threat level: MINIMAL');
  }
  if (origin && origin.id !== 'anywhere') {
    const dist = haversineKm(origin.lat, origin.lng, city.lat, city.lng);
    const hours = Math.round(dist / 800);
    intel.push(`~${hours}h flight from ${origin.name}`);
  }
  if (city.meta.visaDays >= 180) {
    intel.push(`Extended stay: ${city.meta.visaDays}d visa`);
  }
  if (city.infra.coworkingDensity === 'High') {
    intel.push('High coworking density');
  }
  if (city.vibeMetrics.communitySize >= 7) {
    intel.push('Large nomad community');
  }

  return intel.slice(0, 4);
}

/** Generate operational risks */
export function generateRisks(city: City): string[] {
  const risks: string[] = [];
  const currentMonth = new Date().toLocaleString('en', { month: 'short' });

  if (city.weather.rainyMonths.includes(currentMonth)) {
    risks.push('Rainy season active');
  }
  if (city.safety < 7) {
    risks.push('Elevated street-level threat');
  }
  if (city.infra.internetReliability < 6) {
    risks.push('Unreliable connectivity');
  }
  if (city.infra.powerGridStability < 6) {
    risks.push('Power grid instability');
  }
  if (city.vibeMetrics.englishProficiency < 4) {
    risks.push('Low English proficiency');
  }
  if (city.financials.rentIndex > 50) {
    risks.push('High rent index');
  }

  return risks.slice(0, 3);
}
