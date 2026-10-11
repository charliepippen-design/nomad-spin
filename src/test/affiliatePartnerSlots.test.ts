import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateAffiliateLinks, isPartnerLive, type AffiliateLinks } from '@/utils/affiliateEngine';

const ENV_VARS = [
  'VITE_FLATIO_ID',
  'VITE_BOOKING_AID',
  'VITE_AIRALO_TRACKING_URL',
  'VITE_IVISA_PARTNER_BASE_URL',
  'VITE_VISA_PARTNER_BASE_URL',
  'VITE_SKYSCANNER_ID',
  'VITE_SAFETYWING_ID',
];

const TH = { name: 'Chiang Mai', country: 'Thailand', countryCode: 'TH' };
const CO = { name: 'Medellín', country: 'Colombia', countryCode: 'CO' };
const HU = { name: 'Budapest', country: 'Hungary', countryCode: 'HU' };
const US = { name: 'Austin', country: 'United States', countryCode: 'US' };
const PT = { name: 'Lisbon', country: 'Portugal', countryCode: 'PT' };

const BAD_FRAGMENTS = ['TODO_', 'undefined', 'partner=&', 'ref=&', 'associateid=', 'referenceID='];

function urls(links: AffiliateLinks): string[] {
  return Object.values(links).map((link) => link.url);
}

beforeEach(() => {
  for (const name of ENV_VARS) vi.stubEnv(name, '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('partner slots with no env set', () => {
  for (const city of [TH, CO, HU, US]) {
    it(`${city.countryCode}: clean links, Booking for stays`, () => {
      const links = generateAffiliateLinks(city);
      for (const url of urls(links)) {
        for (const fragment of BAD_FRAGMENTS) expect(url, fragment).not.toContain(fragment);
      }
      const stay = new URL(links.accommodation.url);
      expect(stay.hostname).toBe('www.booking.com');
      expect(stay.searchParams.get('aid')).toBe('8092520');
      expect(links.accommodation.partner).toBe('Booking.com');
      expect(links.accommodation.affiliate).toBe(true);

      const esim = new URL(links.connectivity.url);
      expect(esim.hostname).toBe('www.airalo.com');
      expect(esim.searchParams.has('ref')).toBe(false);

      expect(links.connectivity.affiliate).toBe(false);
      expect(links.flights.affiliate).toBe(false);
      expect(links.insurance.affiliate).toBe(false);
      expect(links.visa.affiliate).toBe(false);
    });
  }

  it('reports only Booking as live', () => {
    expect(isPartnerLive('booking')).toBe(true);
    for (const partner of ['flatio', 'airalo', 'ivisa', 'skyscanner', 'safetywing'] as const) {
      expect(isPartnerLive(partner), partner).toBe(false);
    }
  });
});

describe('partner slots with IDs set', () => {
  it('uses Flatio for a Flatio country when VITE_FLATIO_ID is set', () => {
    vi.stubEnv('VITE_FLATIO_ID', 'FLATIO_TEST');
    const links = generateAffiliateLinks(PT);
    const stay = new URL(links.accommodation.url);
    expect(stay.hostname).toBe('www.flatio.com');
    expect(stay.searchParams.get('partner')).toBe('FLATIO_TEST');
    expect(links.accommodation.affiliate).toBe(true);
    expect(isPartnerLive('flatio')).toBe(true);
    expect(new URL(generateAffiliateLinks(US).accommodation.url).hostname).toBe('www.booking.com');
  });

  it('wraps the Airalo deep link in the Impact tracking base', () => {
    const base = 'https://airalo.pxf.io/c/1/2/3';
    vi.stubEnv('VITE_AIRALO_TRACKING_URL', base);
    const link = generateAffiliateLinks(TH).connectivity;
    expect(link.url.startsWith(`${base}?u=`)).toBe(true);
    const deep = new URL(link.url).searchParams.get('u') ?? '';
    expect(deep.startsWith('https://www.airalo.com/thailand-esim?')).toBe(true);
    expect(link.url).toContain(encodeURIComponent('https://www.airalo.com/thailand-esim'));
    expect(link.affiliate).toBe(true);
  });

  it('uses the iVisa partner base URL, preferring the iVisa var', () => {
    vi.stubEnv('VITE_VISA_PARTNER_BASE_URL', 'https://visa.example.com/old');
    expect(generateAffiliateLinks(TH).visa.url.startsWith('https://visa.example.com/old?')).toBe(true);
    vi.stubEnv('VITE_IVISA_PARTNER_BASE_URL', 'https://www.ivisa.com/apply');
    const visa = generateAffiliateLinks(TH).visa;
    expect(visa.url.startsWith('https://www.ivisa.com/apply?country=TH')).toBe(true);
    expect(visa.affiliate).toBe(true);
  });

  it('adds Skyscanner and SafetyWing IDs only when set', () => {
    vi.stubEnv('VITE_SKYSCANNER_ID', 'SKY_TEST');
    vi.stubEnv('VITE_SAFETYWING_ID', 'SW_TEST');
    const links = generateAffiliateLinks(TH);
    expect(links.flights.url).toContain('associateid=SKY_TEST');
    expect(links.insurance.url).toContain('referenceID=SW_TEST');
    expect(links.flights.affiliate).toBe(true);
    expect(links.insurance.affiliate).toBe(true);
  });
});

describe('affiliateEngine source', () => {
  const source = readFileSync('src/utils/affiliateEngine.ts', 'utf8');

  it('has no placeholder IDs', () => {
    expect(source).not.toContain('TODO_');
  });

  it('has no en or em dashes', () => {
    const dashes = [8211, 8212].map((code) => String.fromCharCode(code));
    for (const dash of dashes) expect(source.includes(dash)).toBe(false);
  });
});
