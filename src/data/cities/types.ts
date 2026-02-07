export interface CityFinancials {
  costNomadSingle: number;
  costLongTerm: number;
  rentIndex: number;
  airbnbMedian: number;
}

export interface CityInfra {
  internetSpeedAvg: number;
  internetReliability: number;
  coworkingDensity: 'High' | 'Med' | 'Low';
  powerGridStability: number;
}

export interface CityVibeMetrics {
  nightlife: number;
  communitySize: number;
  lgbtFriendly: number;
  femaleSafety: number;
  englishProficiency: number;
}

export interface CityWeather {
  bestMonths: string[];
  rainyMonths: string[];
  tempAvgC: number;
}

export interface CityMeta {
  visaType: string;
  visaDays: number;
  timeZoneUtc: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  region: 'Asia' | 'Europe' | 'LATAM' | 'Africa' | 'Oceania' | 'North America';
  vibe: string[];
  safety: number;
  financials: CityFinancials;
  infra: CityInfra;
  vibeMetrics: CityVibeMetrics;
  weather: CityWeather;
  meta: CityMeta;
  pros: string[];
  cons: string[];
  costUSD: number;
  internetMbps: number;
  visa: { type: string; days: number };
}
