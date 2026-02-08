import type { City } from '@/data/cities/types';

export interface CityBadge {
  emoji: string;
  label: string;
  color: string; // Tailwind bg class
}

/**
 * Generate smart contextual badges from city data. Max 4 returned.
 */
export function generateBadges(city: City): CityBadge[] {
  const badges: CityBadge[] = [];

  if (city.internetMbps >= 50 || city.infra.internetSpeedAvg >= 50) {
    badges.push({ emoji: '🚀', label: 'Digital God Mode', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' });
  }

  if (city.costUSD < 1200) {
    badges.push({ emoji: '💰', label: 'Wallet Heaven', color: 'bg-green-500/20 text-green-300 border-green-500/30' });
  }

  if (city.safety >= 8) {
    badges.push({ emoji: '🛡️', label: 'Ultra Safe', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' });
  }

  if (city.vibeMetrics.englishProficiency >= 7) {
    badges.push({ emoji: '🗣️', label: 'No Duolingo Needed', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' });
  }

  if (city.vibeMetrics.nightlife >= 7) {
    badges.push({ emoji: '🎉', label: 'Party Central', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' });
  }

  if (city.vibe.some(v => v.toLowerCase().includes('beach'))) {
    badges.push({ emoji: '🏖️', label: 'Beach Life', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' });
  }

  if (city.weather.tempAvgC >= 28) {
    badges.push({ emoji: '🔥', label: 'Tropical Heat', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' });
  }

  if (city.safety < 5) {
    badges.push({ emoji: '⚠️', label: 'Stay Alert', color: 'bg-red-500/20 text-red-300 border-red-500/30' });
  }

  return badges.slice(0, 4);
}
