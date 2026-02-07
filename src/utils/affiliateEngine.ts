/**
 * Affiliate Engine — Nomad Spin
 *
 * Generates dynamic, tracking-ready affiliate URLs for each monetization vertical.
 * All partner IDs are centralised as constants at the top for easy swapping.
 */

// ── TODO: Replace these with your real Affiliate / Partner IDs ─────────────
/** TODO: Paste your Flatio partner ID here */
const FLATIO_PARTNER_ID = 'YOUR_FLATIO_ID_HERE';

/** TODO: Paste your Booking.com affiliate ID here */
const BOOKING_AFFILIATE_ID = 'YOUR_BOOKING_ID_HERE';

/** TODO: Paste your Skyscanner associate ID here */
const SKYSCANNER_ASSOCIATE_ID = 'YOUR_SKYSCANNER_ID_HERE';

/** TODO: Paste your Airalo referral code here */
const AIRALO_REFERRAL_CODE = 'YOUR_AIRALO_CODE_HERE';

/** TODO: Paste your SafetyWing referral ID here */
const SAFETYWING_REFERRAL_ID = 'YOUR_SAFETYWING_ID_HERE';
// ──────────────────────────────────────────────────────────────────────────────

const UTM_BASE = 'utm_source=nomad_spin&utm_medium=referral';

/** Standard ISO-style country-code → Airalo slug mapping (lowercase) */
function countrySlug(countryCode: string): string {
  // Airalo uses lowercase country names with "-esim" suffix
  // Map common codes; fallback to generic slug
  const map: Record<string, string> = {
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
  return map[countryCode.toUpperCase()] || '';
}

export interface AffiliateLinks {
  accommodation: { url: string; partner: string; label: string };
  flights: { url: string; partner: string; label: string };
  connectivity: { url: string; partner: string; label: string };
  insurance: { url: string; partner: string; label: string };
}

interface CityInput {
  name: string;
  country: string;
  countryCode: string;
}

/**
 * Generate affiliate links for a given city.
 * @param city - City data with name, country, countryCode
 * @param originCity - Optional origin city name for directional flight search
 */
export function generateAffiliateLinks(city: CityInput, originCity?: string): AffiliateLinks {
  const cityEncoded = encodeURIComponent(city.name);
  const cityCountryEncoded = encodeURIComponent(`${city.name} ${city.country}`);

  // ── Accommodation: Flatio (primary), Booking.com (fallback) ──
  const flatioUrl =
    `https://www.flatio.com/searches/${cityEncoded}?partner=${FLATIO_PARTNER_ID}&${UTM_BASE}&utm_content=${cityEncoded}`;
  
  // ── Flights: Skyscanner ──
  let flightsUrl: string;
  if (originCity) {
    const originEncoded = encodeURIComponent(originCity);
    flightsUrl =
      `https://www.skyscanner.com/transport/flights/${originEncoded}/${cityEncoded}/?associateid=${SKYSCANNER_ASSOCIATE_ID}&${UTM_BASE}&utm_content=${cityEncoded}`;
  } else {
    flightsUrl =
      `https://www.skyscanner.com/transport/flights/anywhere/${cityEncoded}/?associateid=${SKYSCANNER_ASSOCIATE_ID}&${UTM_BASE}&utm_content=${cityEncoded}`;
  }

  // ── Connectivity: Airalo eSIM ──
  const slug = countrySlug(city.countryCode);
  const airaloUrl = slug
    ? `https://www.airalo.com/${slug}-esim?ref=${AIRALO_REFERRAL_CODE}&${UTM_BASE}&utm_content=${cityEncoded}`
    : `https://www.airalo.com/?ref=${AIRALO_REFERRAL_CODE}&${UTM_BASE}&utm_content=${cityEncoded}`;

  // ── Insurance: SafetyWing ──
  const safetyWingUrl =
    `https://safetywing.com/nomad-insurance/?referenceID=${SAFETYWING_REFERRAL_ID}&${UTM_BASE}&utm_content=${cityEncoded}`;

  return {
    accommodation: {
      url: flatioUrl,
      partner: 'Flatio',
      label: 'SECURE SAFE HOUSE',
    },
    flights: {
      url: flightsUrl,
      partner: 'Skyscanner',
      label: 'INITIATE AIRLIFT',
    },
    connectivity: {
      url: airaloUrl,
      partner: 'Airalo',
      label: 'ESTABLISH COMMS',
    },
    insurance: {
      url: safetyWingUrl,
      partner: 'SafetyWing',
      label: 'ACTIVATE PROTOCOLS',
    },
  };
}
