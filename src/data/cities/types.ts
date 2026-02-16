export type LandscapeOption = 'seaside' | 'mountain' | 'urban' | 'rural' | 'island' | 'desert';

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

export interface CityAirport {
  code: string;
  name: string;
  distKm: number;
}

export interface CityTaxation {
  incomeTax: string;
  notes: string;
}

export interface CityHealthInsurance {
  costMonthly: number;
  quality: number;
}

export interface CityEsim {
  available: boolean;
  costMonthly: number;
}

export type DataSource = 'verified' | 'estimated';

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  region: 'Asia' | 'Europe' | 'LATAM' | 'Africa' | 'Oceania' | 'North America';
  vibe: string[];
  landscape: LandscapeOption[];
  safety: number;
  financials: CityFinancials;
  infra: CityInfra;
  vibeMetrics: CityVibeMetrics;
  weather: CityWeather;
  meta: CityMeta;
  language: string;
  nearestAirport: CityAirport;
  taxation: CityTaxation;
  healthInsurance: CityHealthInsurance;
  esim: CityEsim;
  legalNotes: string[];
  dataSource: DataSource;
  pros: string[];
  cons: string[];
  costUSD: number;
  internetMbps: number;
  visa: { type: string; days: number };
}
