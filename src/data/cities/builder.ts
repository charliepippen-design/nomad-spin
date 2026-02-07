import type { City } from './types';

interface CityInput {
  id: string; name: string; country: string; cc: string;
  lat: number; lng: number; region: City['region'];
  vibe: string[]; safety: number;
  cost: number; internet: number; coworking: 'High' | 'Med' | 'Low';
  nightlife: number; community: number; lgbt: number; femaleSafety: number; english: number;
  bestMonths: string[]; rainyMonths: string[]; tempC: number;
  visaType: string; visaDays: number; tz: string;
  pros: string[]; cons: string[];
  costLong?: number; rentIndex?: number; airbnb?: number;
  netReliability?: number; power?: number;
}

export function city(d: CityInput): City {
  const developed = d.region === 'Europe' || d.region === 'North America' || d.region === 'Oceania';
  return {
    id: d.id, name: d.name, country: d.country, countryCode: d.cc,
    lat: d.lat, lng: d.lng, region: d.region,
    vibe: d.vibe, safety: d.safety,
    financials: {
      costNomadSingle: d.cost,
      costLongTerm: d.costLong ?? Math.round(d.cost * 0.75),
      rentIndex: d.rentIndex ?? Math.min(Math.round(d.cost / 50), 100),
      airbnbMedian: d.airbnb ?? Math.round(d.cost / 22),
    },
    infra: {
      internetSpeedAvg: d.internet,
      internetReliability: d.netReliability ?? (d.internet >= 150 ? 9 : d.internet >= 100 ? 8 : d.internet >= 60 ? 7 : d.internet >= 30 ? 5 : 4),
      coworkingDensity: d.coworking,
      powerGridStability: d.power ?? (developed ? 9 : d.region === 'Asia' ? 7 : 6),
    },
    vibeMetrics: {
      nightlife: d.nightlife, communitySize: d.community,
      lgbtFriendly: d.lgbt, femaleSafety: d.femaleSafety, englishProficiency: d.english,
    },
    weather: { bestMonths: d.bestMonths, rainyMonths: d.rainyMonths, tempAvgC: d.tempC },
    meta: { visaType: d.visaType, visaDays: d.visaDays, timeZoneUtc: d.tz },
    pros: d.pros, cons: d.cons,
    costUSD: d.cost, internetMbps: d.internet,
    visa: { type: d.visaType, days: d.visaDays },
  };
}
