import { City } from '@/data/cities';
import { Origin } from '@/data/origins';
import { haversineKm } from '@/lib/distance';

export interface ScoringWeights {
  budget: number;      // 0-100
  internet: number;    // 0-100
  safety: number;      // 0-100
  proximity: number;   // 0-100 (only if origin set)
}

const defaultWeights: ScoringWeights = {
  budget: 30,
  internet: 25,
  safety: 25,
  proximity: 20,
};

/** Non-linear budget penalty: slight overage = small penalty, massive = -100 */
function budgetScore(cityCost: number, budgetMax: number): number {
  if (cityCost <= budgetMax) {
    // Under budget: reward, closer to max = better utilization
    return 80 + (cityCost / budgetMax) * 20;
  }
  const overage = (cityCost - budgetMax) / budgetMax;
  if (overage < 0.1) return 70 - overage * 200;  // slight: 70→50
  if (overage < 0.3) return 50 - (overage - 0.1) * 250; // moderate: 50→0
  return Math.max(-100, -(overage * 200)); // massive: hard penalty
}

/** Internet score: normalized against user's minimum requirement */
function internetScore(cityMbps: number, minMbps: number): number {
  if (cityMbps < minMbps) return Math.max(0, (cityMbps / minMbps) * 40);
  const excess = (cityMbps - minMbps) / Math.max(minMbps, 1);
  return 60 + Math.min(40, excess * 20);
}

/** Safety score: simple 0-10 → 0-100 mapping */
function safetyScore(citySafety: number, minSafety: number): number {
  if (citySafety < minSafety) return Math.max(0, (citySafety / minSafety) * 30);
  return 50 + citySafety * 5;
}

/** Proximity bonus/penalty based on distance and budget */
function proximityScore(distKm: number, budgetMax: number): number {
  // Low budget + far = big penalty
  const budgetFactor = budgetMax / 3000; // normalized
  const distPenalty = distKm / 20000; // normalized
  const score = 100 - (distPenalty * 100) / Math.max(budgetFactor, 0.3);
  return Math.max(0, Math.min(100, score));
}

/** Calculate weighted match score 0-99 */
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

  let pScore = 50; // neutral if no origin
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
    const hours = Math.round(dist / 800); // rough flight time
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
