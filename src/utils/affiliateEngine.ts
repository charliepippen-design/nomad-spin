/**
 * Affiliate Engine, Nomad Spin
 *
 * Builds tracking-ready outbound URLs for each monetization vertical.
 * A partner is "live" only when a real ID / tracking base is configured.
 * Until then links are clean (no placeholder or empty affiliate params).
 *
 * How to set partner IDs
 * Set the env var in Vercel (Project Settings > Environment Variables,
 * Production + Preview), then redeploy. Or edit the one-line constant in
 * AFFILIATE_CONFIG. The env var wins when both are set.
 *
 * | Partner    | Env var                                         | Constant                       |
 * |------------|-------------------------------------------------|--------------------------------|
 * | Booking    | VITE_BOOKING_AID (optional, default is set)     | partners.booking.partnerId     |
 * | Flatio     | VITE_FLATIO_ID                                  | partners.flatio.partnerId      |
 * | Airalo     | VITE_AIRALO_TRACKING_URL (Impact tracking link) | partners.airalo.trackingUrl    |
 * | iVisa      | VITE_IVISA_PARTNER_BASE_URL (or VITE_VISA_PARTNER_BASE_URL) | partners.ivisa.baseUrl |
 * | Skyscanner | VITE_SKYSCANNER_ID                              | partners.skyscanner.partnerId  |
 * | SafetyWing | VITE_SAFETYWING_ID                              | partners.safetywing.partnerId  |
 * | NordVPN    | VITE_NORDVPN_TRACKING_URL (Impact tracking link) | partners.nordvpn.trackingUrl  |
 *
 * Regional behavior lives in FLATIO_SUPPORTED_COUNTRIES. UTM schema is
 * applied by buildUtmParams().
 */

import type { Vertical } from '@/utils/analytics';

export type PartnerKey = 'flatio' | 'booking' | 'airalo' | 'ivisa' | 'skyscanner' | 'safetywing' | 'nordvpn';

export const AFFILIATE_CONFIG = {
  partners: {
    flatio:     { partnerId: '' },
    /** CJ Affiliate publisher CID, passed as Booking.com `aid`. */
    booking:    { partnerId: '8092520' },
    skyscanner: { partnerId: '' },
    /** Impact tracking link base, e.g. https://airalo.pxf.io/c/<publisherId>/<adId>/<campaignId> */
    airalo:     { trackingUrl: '' },
    ivisa:      { baseUrl: '' },
    safetywing: { partnerId: '' },
    /** Impact tracking link base, e.g. https://nordvpn.sjv.io/c/<publisherId>/<adId>/<campaignId> */
    nordvpn:    { trackingUrl: '' },
  },
  utm: {
    utm_source: 'nomadspin',
    utm_medium: 'spin',
    /** Template: city-${citySlug} */
    campaignTemplate: (citySlug: string) => `city-${citySlug}`,
    /** Template: vertical name */
    contentTemplate: (vertical: string) => vertical,
  },
};

function envValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Resolved at call time so tests can stub env. Env var wins over the constant. */
function partnerValue(partner: PartnerKey): string {
  const env = import.meta.env;
  const p = AFFILIATE_CONFIG.partners;
  switch (partner) {
    case 'flatio':     return envValue(env.VITE_FLATIO_ID) || p.flatio.partnerId;
    case 'booking':    return envValue(env.VITE_BOOKING_AID) || p.booking.partnerId;
    case 'skyscanner': return envValue(env.VITE_SKYSCANNER_ID) || p.skyscanner.partnerId;
    case 'safetywing': return envValue(env.VITE_SAFETYWING_ID) || p.safetywing.partnerId;
    case 'airalo':     return envValue(env.VITE_AIRALO_TRACKING_URL) || p.airalo.trackingUrl;
    case 'nordvpn':    return envValue(env.VITE_NORDVPN_TRACKING_URL) || p.nordvpn.trackingUrl;
    case 'ivisa':
      return envValue(env.VITE_IVISA_PARTNER_BASE_URL) || envValue(env.VITE_VISA_PARTNER_BASE_URL) || p.ivisa.baseUrl;
  }
}

/** True when a real partner ID / tracking base is in effect. */
export function isPartnerLive(partner: PartnerKey): boolean {
  return partnerValue(partner) !== '';
}

// Flatio supported countries (whitelist). Used only when a Flatio ID is set;
// otherwise, and for every other country, Booking.com is used.
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

// UTM builder

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

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

// Country to Airalo slug mapping

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

// Per-vertical URL builders

interface BuiltLink {
  url: string;
  partner: string;
  affiliate: boolean;
}

/** The single Booking.com URL builder. Always carries the Booking aid. */
export function buildBookingStayUrl(opts: { city?: string; country?: string; campaign: string }): string {
  const aid = encodeURIComponent(partnerValue('booking'));
  const utms = new URLSearchParams({
    utm_source: AFFILIATE_CONFIG.utm.utm_source,
    utm_medium: AFFILIATE_CONFIG.utm.utm_medium,
    utm_campaign: opts.campaign,
    utm_content: AFFILIATE_CONFIG.utm.contentTemplate('accommodation'),
  }).toString();
  if (opts.city) {
    const q = encodeURIComponent([opts.city, opts.country].filter(Boolean).join(' '));
    return `https://www.booking.com/searchresults.html?ss=${q}&aid=${aid}&${utms}`;
  }
  return `https://www.booking.com/index.html?aid=${aid}&${utms}`;
}

function buildAccommodationUrl(city: string, country: string, countryCode: string): BuiltLink {
  const citySlug = slugify(city);
  const useFlatio =
    FLATIO_SUPPORTED_COUNTRIES.includes(countryCode.toUpperCase()) && isPartnerLive('flatio');

  if (!useFlatio) {
    return {
      url: buildBookingStayUrl({ city, country, campaign: AFFILIATE_CONFIG.utm.campaignTemplate(citySlug) }),
      partner: 'Booking.com',
      affiliate: isPartnerLive('booking'),
    };
  }

  const utms = buildUtmParams(citySlug, 'accommodation');
  return {
    url: `https://www.flatio.com/searches/${encodeURIComponent(city)}?partner=${encodeURIComponent(partnerValue('flatio'))}&${utms}`,
    partner: 'Flatio',
    affiliate: true,
  };
}

function buildFlightsUrl(destinationCity: string, originCity?: string): BuiltLink {
  const destSlug = slugify(destinationCity);
  const utms = buildUtmParams(destSlug, 'flights');
  const dest = encodeURIComponent(destinationCity);
  const orig = originCity ? encodeURIComponent(originCity) : 'anywhere';
  const aid = partnerValue('skyscanner');
  const assoc = aid ? `associateid=${encodeURIComponent(aid)}&` : '';
  return {
    url: `https://www.skyscanner.com/transport/flights/${orig}/${dest}/?${assoc}${utms}`,
    partner: 'Skyscanner',
    affiliate: aid !== '',
  };
}

function buildEsimUrl(city: string, countryCode: string): BuiltLink {
  const citySlug = slugify(city);
  const utms = buildUtmParams(citySlug, 'esim');
  const slug = AIRALO_SLUGS[countryCode.toUpperCase()];
  const deepLink = slug
    ? `https://www.airalo.com/${slug}-esim?${utms}`
    : `https://www.airalo.com/?${utms}`;

  // Airalo runs through Impact. The Impact UTT tag in index.html runs
  // transformLinks, so plain airalo.com links can be converted automatically
  // once the program approves Nomad Spin. Until a tracking base is set we
  // return the clean deep link with no ref param.
  const base = partnerValue('airalo');
  if (base) {
    const sep = base.includes('?') ? '&' : '?';
    return { url: `${base}${sep}u=${encodeURIComponent(deepLink)}`, partner: 'Airalo', affiliate: true };
  }
  return { url: deepLink, partner: 'Airalo', affiliate: false };
}

function buildInsuranceUrl(city: string): BuiltLink {
  const citySlug = slugify(city);
  const utms = buildUtmParams(citySlug, 'insurance');
  const id = partnerValue('safetywing');
  const ref = id ? `referenceID=${encodeURIComponent(id)}&` : '';
  return {
    url: `https://safetywing.com/nomad-insurance/?${ref}${utms}`,
    partner: 'SafetyWing',
    affiliate: id !== '',
  };
}

/**
 * Visa link builder. Base URL comes from VITE_IVISA_PARTNER_BASE_URL, then
 * VITE_VISA_PARTNER_BASE_URL. Without either, a clean ivisa.com link is
 * returned and affiliate is false.
 *
 * Final URL pattern: {base}?country={countryCode}&city={citySlug}&{UTMs}
 */
export function buildVisaUrl(city: string, countryCode: string): BuiltLink {
  const configured = partnerValue('ivisa');
  const base = configured || 'https://www.ivisa.com';
  const citySlug = slugify(city);
  const utms = buildUtmParams(citySlug, 'visa');
  const sep = base.includes('?') ? '&' : '?';
  const url = `${base}${sep}country=${countryCode.toUpperCase()}&city=${citySlug}&${utms}`;
  return { url, partner: 'iVisa', affiliate: configured !== '' };
}

/** NordVPN link. Impact tracking link wraps the deep link when configured. */
export function buildVpnUrl(city: string): BuiltLink & { partner: 'NordVPN' } {
  const utms = buildUtmParams(slugify(city), 'vpn');
  const deepLink = `https://nordvpn.com/?${utms}`;
  const base = partnerValue('nordvpn');
  if (base) {
    const sep = base.includes('?') ? '&' : '?';
    return { url: `${base}${sep}u=${encodeURIComponent(deepLink)}`, partner: 'NordVPN', affiliate: true };
  }
  return { url: deepLink, partner: 'NordVPN', affiliate: false };
}

// Public interface

export interface AffiliateLinkData {
  url: string;
  partner: string;
  /** True only when a real partner ID / tracking base is in effect. */
  affiliate: boolean;
  label: string;
  vertical: Vertical;
}

export interface AffiliateLinks {
  accommodation: AffiliateLinkData;
  flights: AffiliateLinkData;
  connectivity: AffiliateLinkData;
  insurance: AffiliateLinkData;
  visa: AffiliateLinkData;
  vpn: AffiliateLinkData;
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
  const vpn = buildVpnUrl(city.name);

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
    vpn: { ...vpn, label: 'Secure your Wi-Fi with NordVPN', vertical: 'vpn' },
  };
}
