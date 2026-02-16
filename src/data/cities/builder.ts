import type { City, LandscapeOption } from './types';

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
  // New optional fields
  landscape?: LandscapeOption[];
  language?: string;
  nearestAirport?: { code: string; name: string; distKm: number };
  taxation?: { incomeTax: string; notes: string };
  healthInsurance?: { costMonthly: number; quality: number };
  esim?: { available: boolean; costMonthly: number };
  legalNotes?: string[];
  dataSource?: 'verified' | 'estimated';
}

/** Infer landscape from vibe tags + region when not explicitly provided */
function inferLandscape(d: CityInput): LandscapeOption[] {
  const ls: LandscapeOption[] = [];
  if (d.vibe.includes('beach')) ls.push('seaside');
  if (d.vibe.includes('mountain')) ls.push('mountain');
  // Default to urban if nothing else matches
  if (ls.length === 0) ls.push('urban');
  return ls;
}

/** Infer primary language from country code */
function inferLanguage(cc: string): string {
  const langMap: Record<string, string> = {
    TH: 'Thai', ID: 'Indonesian', PT: 'Portuguese', CO: 'Spanish', GE: 'Georgian',
    ZA: 'English', MX: 'Spanish', AR: 'Spanish', VN: 'Vietnamese', PY: 'Spanish',
    ES: 'Spanish', HU: 'Hungarian', MY: 'Malay', DE: 'German', HR: 'Croatian',
    JP: 'Japanese', KR: 'Korean', TW: 'Mandarin', IN: 'Hindi', TR: 'Turkish',
    GR: 'Greek', CZ: 'Czech', PL: 'Polish', RO: 'Romanian', BG: 'Bulgarian',
    RS: 'Serbian', ME: 'Montenegrin', AL: 'Albanian', MK: 'Macedonian',
    BA: 'Bosnian', SI: 'Slovenian', SK: 'Slovak', EE: 'Estonian', LV: 'Latvian',
    LT: 'Lithuanian', UA: 'Ukrainian', KH: 'Khmer', LA: 'Lao', MM: 'Burmese',
    PH: 'Filipino', NP: 'Nepali', LK: 'Sinhala', BD: 'Bengali', PK: 'Urdu',
    MA: 'Arabic', TN: 'Arabic', EG: 'Arabic', KE: 'Swahili', NG: 'English',
    GH: 'English', TZ: 'Swahili', UG: 'English', RW: 'Kinyarwanda',
    ET: 'Amharic', SN: 'French', CI: 'French', MU: 'English', MG: 'Malagasy',
    BR: 'Portuguese', CL: 'Spanish', PE: 'Spanish', EC: 'Spanish', UY: 'Spanish',
    CR: 'Spanish', PA: 'Spanish', GT: 'Spanish', DO: 'Spanish', CU: 'Spanish',
    US: 'English', CA: 'English', GB: 'English', IE: 'English', AU: 'Australia',
    NZ: 'English', FR: 'French', IT: 'Italian', NL: 'Dutch', BE: 'Dutch',
    AT: 'German', CH: 'German', SE: 'Swedish', NO: 'Norwegian', DK: 'Danish',
    FI: 'Finnish', IS: 'Icelandic', MT: 'Maltese', CY: 'Greek', LU: 'French',
    AE: 'Arabic', SA: 'Arabic', QA: 'Arabic', BH: 'Arabic', OM: 'Arabic',
    KW: 'Arabic', JO: 'Arabic', LB: 'Arabic', IL: 'Hebrew',
    AM: 'Armenian', AZ: 'Azerbaijani', UZ: 'Uzbek', KZ: 'Kazakh', KG: 'Kyrgyz',
    CN: 'Mandarin', HK: 'Cantonese', SG: 'English', BN: 'Malay', FJ: 'English',
  };
  return langMap[cc] || 'English';
}

export function city(d: CityInput): City {
  const developed = d.region === 'Europe' || d.region === 'North America' || d.region === 'Oceania';
  return {
    id: d.id, name: d.name, country: d.country, countryCode: d.cc,
    lat: d.lat, lng: d.lng, region: d.region,
    vibe: d.vibe, safety: d.safety,
    landscape: d.landscape ?? inferLandscape(d),
    language: d.language ?? inferLanguage(d.cc),
    nearestAirport: d.nearestAirport ?? { code: '', name: '', distKm: 0 },
    taxation: d.taxation ?? { incomeTax: 'Unknown', notes: '' },
    healthInsurance: d.healthInsurance ?? { costMonthly: 0, quality: 0 },
    esim: d.esim ?? { available: true, costMonthly: 0 },
    legalNotes: d.legalNotes ?? [],
    dataSource: d.dataSource ?? 'verified',
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
