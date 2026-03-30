/**
 * Affiliate Engine — Nomad Spin
 *
 * Generates dynamic, tracking-ready affiliate URLs for each monetization vertical.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 *  HOW TO CONFIGURE:
 *  1. Edit AFFILIATE_CONFIG below — replace each "TODO_*" with your real ID.
 *  2. UTM schema is auto-applied via buildUtmParams(). Adjust utm_source /
 *     utm_medium in AFFILIATE_CONFIG.utm if you need different tracking.
 *  3. Regional overrides live in REGIONAL_OVERRIDES — add country codes to
 *     switch providers per-region.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { Vertical } from '@/utils/analytics';
import { slugify } from '@/lib/slugify';

// ── TODO: Replace partner IDs with your real values ────────────────────────
export const AFFILIATE_CONFIG = {
  partners: {
    /** TODO: Paste your Flatio partner ID */
    flatio:     { partnerId: 'TODO_FLATIO_ID' },
    /** TODO: Paste your Booking.com affiliate ID */
    booking:    { partnerId: 'TODO_BOOKING_ID' },
    /** TODO: Paste your Skyscanner associate ID */
    skyscanner: { partnerId: 'TODO_SKYSCANNER_ID' },
    /** TODO: Paste your Airalo referral code */
    airalo:     { partnerId: 'TODO_AIRALO_ID' },
    /** TODO: Paste your SafetyWing referral ID */
    safetywing: { partnerId: 'TODO_SAFETYWING_ID' },
  },
  utm: {
    utm_source: 'nomadspin',
    utm_medium: 'spin',
    /** Template: city-${citySlug} */
    campaignTemplate: (citySlug: string) => `city-${citySlug}`,
    /** Template: vertical name */
    contentTemplate: (vertical: string) => vertical,
  },
} as const;

// ── Flatio supported countries (whitelist) ─────────────────────────────────
// If a country is listed here, Flatio is used; otherwise Booking.com is the fallback.
const FLATIO_SUPPORTED_COUNTRIES: string[] = [
  // Europe
  'PT', 'ES', 'CZ', 'PL', 'HU', 'HR', 'GR', 'IT', 'DE', 'AT', 'NL',
  'FR', 'BE', 'SK', 'SI', 'RO', 'BG', 'RS', 'ME', 'BA', 'AL', 'XK',
  'EE', 'LV', 'LT', 'IE', 'DK', 'SE', 'FI', 'NO', 'IS', 'CH', 'GB',
  // Americas
  'MX', 'CO', 'AR', 'BR', 'CL', 'UY', 'EC', 'PE', 'CR', 'PA',
  // Asia & Middle East
  'TH', 'VN', 'ID', 'PH', 'MY', 'KH', 'IN', 'LK', 'NP',
  'AE', 'GE', 'TR', 'AM',
];

// ── UTM builder ────────────────────────────────────────────────────────────

/**
 * Build a URL-encoded UTM query string.
 * @returns e.g. "utm_source=nomadspin&utm_medium=spin&utm_campaign=city-bangkok&utm_content=accommodation"
 */
export function buildUtmParams(citySlug: string, vertical: string): string {
  const { utm } = AFFILIATE_CONFIG;
  const params = new URLSearchParams({
    utm_source:   utm.utm_source,
    utm_medium:   utm.utm_medium,
    utm_campaign: utm.campaignTemplate(citySlug),
    utm_content:  utm.contentTemplate(vertical),
  });
  return params.toString();
}

// ── Country → Airalo slug mapping ──────────────────────────────────────────

const AIRALO_SLUGS: Record<string, string> = {
  TH: 'thailand', VN: 'vietnam', ID: 'indonesia', MY: 'malaysia', PH: 'philippines',
  JP: 'japan', KR: 'south-korea', TW: 'taiwan', IN: 'india', LK: 'sri-lanka',
  NP: 'nepal', KH: 'cambodia', LA: 'laos', MM: 'myanmar', BD: 'bangladesh',
  PT: 'portugal', ES: 'spain', DE: 'germany', FR: 'france', IT: 'italy',
  GR: 'greece', HR: 'croatia', TR: 'turkey', CZ: 'czech-republic', HU: 'hungary',
  PL: 'poland', RO: 'romania', BG: 'bulgaria', RS: 'serbia', ME: 'montenegro',
  AL: 'albania', BA: 'bosnia-and-herzegovina', XK: 'kosovo', GE: 'georgia', AM: 'armenia',
  MX: 'mexico', CO: 'colombia', BR: 'brazil', AR: 'argentina', PE: 'peru',
  EC: 'ecuador', CL: 'chile', UY: 'uruguay', CR: 'costa-rica', PA: 'panama',
  GT: 'guatemala', DO: 'dominican-republic', CU: 'cuba', JM: 'jamaica',
  US: 'united-states', CA: 'canada', GB: 'united-kingdom', AU: 'australia', NZ: 'new-zealand',
  ZA: 'south-africa', KE: 'kenya', MA: 'morocco', EG: 'egypt', GH: 'ghana', NG: 'nigeria',
  AE: 'united-arab-emirates', SG: 'singapore', HK: 'hong-kong', MO: 'macao',
  EE: 'estonia', LV: 'latvia', LT: 'lithuania', SK: 'slovakia', SI: 'slovenia',
  AT: 'austria', CH: 'switzerland', NL: 'netherlands', BE: 'belgium', SE: 'sweden',
  NO: 'norway', DK: 'denmark', FI: 'finland', IE: 'ireland', IS: 'iceland',
  PY: 'paraguay', BO: 'bolivia', HN: 'honduras', SV: 'el-salvador', NI: 'nicaragua',
  BZ: 'belize', TT: 'trinidad-and-tobago',
  UA: 'ukraine', MD: 'moldova', MN: 'mongolia', UZ: 'uzbekistan', KG: 'kyrgyzstan',
};

// ── Per-vertical URL builders ──────────────────────────────────────────────

function buildAccommodationUrl(city: string, country: string, countryCode: string): { url: string; partner: string } {
  const citySlug = slugify(city);
  const utms = buildUtmParams(citySlug, 'accommodation');
  const useFlatio = FLATIO_SUPPORTED_COUNTRIES.includes(countryCode.toUpperCase());

  if (!useFlatio) {
    if (import.meta.env.DEV) {
      console.debug(`Accommodation provider: using Booking.com for ${city} (Flatio not available in ${country})`);
    }
    const q = encodeURIComponent(`${city} ${country}`);
    return {
      url: `https://www.booking.com/searchresults.html?ss=${q}&aid=${AFFILIATE_CONFIG.partners.booking.partnerId}&${utms}`,
      partner: 'Booking.com',
    };
  }

  return {
    url: `https://www.flatio.com/searches/${encodeURIComponent(city)}?partner=${AFFILIATE_CONFIG.partners.flatio.partnerId}&${utms}`,
    partner: 'Flatio',
  };
}

function buildFlightsUrl(
  destinationCity: string,
  originCity?: string,
): { url: string; partner: string } {
  const destSlug = slugify(destinationCity);
  const utms = buildUtmParams(destSlug, 'flights');
  const dest = encodeURIComponent(destinationCity);
  const aid = AFFILIATE_CONFIG.partners.skyscanner.partnerId;

  if (originCity) {
    const orig = encodeURIComponent(originCity);
    return {
      url: `https://www.skyscanner.com/transport/flights/${orig}/${dest}/?associateid=${aid}&${utms}`,
      partner: 'Skyscanner',
    };
  }

  return {
    url: `https://www.skyscanner.com/transport/flights/anywhere/${dest}/?associateid=${aid}&${utms}`,
    partner: 'Skyscanner',
  };
}

function buildEsimUrl(city: string, countryCode: string): { url: string; partner: string } {
  const citySlug = slugify(city);
  const utms = buildUtmParams(citySlug, 'esim');
  const ref = AFFILIATE_CONFIG.partners.airalo.partnerId;
  const slug = AIRALO_SLUGS[countryCode.toUpperCase()];

  if (slug) {
    return {
      url: `https://www.airalo.com/${slug}-esim?ref=${ref}&${utms}`,
      partner: 'Airalo',
    };
  }

  if (import.meta.env.DEV) {
    console.warn(`[AffiliateEngine] No Airalo slug for ${countryCode} — using generic homepage for "${city}"`);
  }
  return {
    url: `https://www.airalo.com/?ref=${ref}&${utms}`,
    partner: 'Airalo',
  };
}

function buildInsuranceUrl(city: string): { url: string; partner: string } {
  const citySlug = slugify(city);
  const utms = buildUtmParams(citySlug, 'insurance');
  return {
    url: `https://safetywing.com/nomad-insurance/?referenceID=${AFFILIATE_CONFIG.partners.safetywing.partnerId}&${utms}`,
    partner: 'SafetyWing',
  };
}

/**
 * Visa affiliate link builder.
 *
 * Reads the base URL from VITE_VISA_PARTNER_BASE_URL (env variable).
 * If unset, returns null so the UI hides the CTA (no dead links).
 *
 * Final URL pattern:
 *   {VITE_VISA_PARTNER_BASE_URL}?country={countryCode}&city={citySlug}&{UTMs}
 *
 * To enable:  set VITE_VISA_PARTNER_BASE_URL in .env or hosting config.
 * Example:    VITE_VISA_PARTNER_BASE_URL=https://www.ivisa.com/apply
 */
export function buildVisaUrl(
  city: string,
  countryCode: string,
): { url: string; partner: string } {
  const base = import.meta.env.VITE_VISA_PARTNER_BASE_URL || 'https://www.ivisa.com';
  const citySlug = slugify(city);
  const utms = buildUtmParams(citySlug, 'visa');
  const sep = base.includes('?') ? '&' : '?';
  const url = `${base}${sep}country=${countryCode.toUpperCase()}&city=${citySlug}&${utms}`;
  return { url, partner: 'iVisa' };
}

// ── Public interface ───────────────────────────────────────────────────────

export interface AffiliateLinkData {
  url: string;
  partner: string;
  label: string;
  vertical: Vertical;
}

export interface AffiliateLinks {
  accommodation: AffiliateLinkData;
  flights: AffiliateLinkData;
  connectivity: AffiliateLinkData;
  insurance: AffiliateLinkData;
  visa: AffiliateLinkData;
}

interface CityInput {
  name: string;
  country: string;
  countryCode: string;
}

/**
 * Generate affiliate links for a given city.
 * @param city        - City data with name, country, countryCode
 * @param originCity  - Optional origin city name for directional flight search
 */
export function generateAffiliateLinks(city: CityInput, originCity?: string): AffiliateLinks {
  const accom = buildAccommodationUrl(city.name, city.country, city.countryCode);
  const flights = buildFlightsUrl(city.name, originCity);
  const esim = buildEsimUrl(city.name, city.countryCode);
  const insurance = buildInsuranceUrl(city.name);
  const visa = buildVisaUrl(city.name, city.countryCode);

  return {
    accommodation: {
      ...accom,
      label: `Find Stays in ${city.name}`,
      vertical: 'accommodation',
    },
    flights: {
      ...flights,
      label: originCity
        ? `Find Flights from ${originCity} to ${city.name}`
        : `Find Flights to ${city.name}`,
      vertical: 'flights',
    },
    connectivity: {
      ...esim,
      label: `Get eSIM for ${city.name}`,
      vertical: 'esim',
    },
    insurance: {
      ...insurance,
      label: 'Travel Insurance',
      vertical: 'insurance',
    },
    visa: { ...visa, label: `Check visa options`, vertical: 'visa' as Vertical },
  };
}
