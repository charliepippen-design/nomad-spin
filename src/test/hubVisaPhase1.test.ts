import { describe, expect, it } from 'vitest';
import { cities } from '@/data/cities';
import type { City } from '@/data/cities/types';
import { COUNTRY_VISA_RULES } from '@/data/cities/visaFacts';
import { destinationFaq } from '@/lib/destinationFaq';
import batch2 from './fixtures/hubQuickAnswersBatch2.json';

const DASH = /\u2013|\u2014|\u2192|->/;

function byCountry(cc: string): City[] {
  return cities.filter((city) => city.countryCode === cc);
}

function cityById(id: string): City {
  const city = cities.find((item) => item.id === id);
  if (!city) throw new Error(`missing ${id}`);
  return city;
}

describe('phase 1 hub visa data', () => {
  it('has no 365-day Brazil, Turkey or Indonesia row', () => {
    for (const cc of ['BR', 'TR', 'ID']) {
      const rows = byCountry(cc);
      expect(rows.length, cc).toBeGreaterThan(0);
      for (const city of rows) {
        expect(city.meta.visaDays, city.id).not.toBe(365);
        expect(city.visa.days, city.id).toBe(city.meta.visaDays);
      }
    }
  });

  it('sets Brazil to 90 days with the e-visa and VITEM XIV note on all 15 rows', () => {
    const rows = byCountry('BR');
    expect(rows).toHaveLength(15);
    for (const city of rows) {
      expect(city.meta.visaType, city.id).toBe('Visa Exemption');
      expect(city.meta.visaDays, city.id).toBe(90);
      expect(city.meta.visaNote, city.id).toMatch(/e-visa/);
      expect(city.meta.visaNote, city.id).toMatch(/VITEM XIV/);
    }
  });

  it('sets all 14 Turkey rows to 90 days in any 180', () => {
    const rows = byCountry('TR');
    expect(rows).toHaveLength(14);
    for (const city of rows) {
      expect(city.meta.visaDays, city.id).toBe(90);
      expect(city.meta.visaNote, city.id).toMatch(/90 days in any 180/);
    }
  });

  it('sets every Indonesia row to a 30-day visa on arrival', () => {
    for (const city of byCountry('ID')) {
      expect(city.meta.visaType, city.id).toBe('Visa on Arrival');
      expect(city.meta.visaDays, city.id).toBe(30);
    }
  });

  it('makes no Chile nomad visa claim', () => {
    const rows = byCountry('CL');
    expect(rows).toHaveLength(9);
    for (const city of rows) {
      expect(city.meta.visaType, city.id).toBe('Visa Exemption');
      expect(city.meta.visaDays, city.id).toBe(90);
      expect(city.meta.visaType, city.id).not.toMatch(/nomad/i);
      expect(city.meta.visaNote, city.id).toMatch(/no dedicated digital nomad visa/);
      expect(destinationFaq(city)[2].a, city.id).toMatch(/Chile has no dedicated digital nomad visa/);
    }
  });

  it('fixes Berlin, Krakow and Oaxaca', () => {
    expect(cityById('berlin-de').meta).toMatchObject({ visaType: 'Visa Exemption', visaDays: 90 });
    expect(cityById('berlin-de').meta.visaNote).toMatch(/s\.21 AufenthG/);
    expect(cityById('krakow-pl').meta).toMatchObject({ visaType: 'Visa Exemption', visaDays: 90 });
    expect(cityById('oaxaca-mx').meta).toMatchObject({ visaType: 'Visa Exemption', visaDays: 180 });
  });

  it('keeps Croatia on the default entry with the 18-month nomad stay in the note', () => {
    const rows = byCountry('HR');
    expect(rows).toHaveLength(7);
    for (const city of rows) {
      expect(city.meta).toMatchObject({ visaType: 'Visa Exemption', visaDays: 90 });
      expect(city.meta.visaNote, city.id).toMatch(/up to 18 months \(MUP\)/);
      expect(destinationFaq(city)[2].a, city.id).toMatch(/temporary stay of up to 18 months/);
    }
  });

  it('puts Greece, Spain and Malaysia on the default entry with the nomad route in the note', () => {
    expect(byCountry('GR')).toHaveLength(15);
    for (const cc of ['GR', 'ES', 'MY']) {
      for (const city of byCountry(cc)) {
        expect(city.meta, city.id).toMatchObject({ visaType: 'Visa Exemption', visaDays: 90 });
        expect(city.meta.visaNote, city.id).toMatch(/nomad/i);
      }
    }
  });

  it('puts every Albania row on the 90-in-180 default with the unique permit in the note', () => {
    const rule = COUNTRY_VISA_RULES.AL;
    expect(rule.sources).toContain('https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/');
    const rows = byCountry('AL');
    expect(rows.map((city) => city.id).sort()).toEqual(['saranda-al', 'tirana-al']);
    for (const city of rows) {
      expect(city.meta, city.id).toMatchObject({ visaType: 'Visa Exemption', visaDays: 90 });
      expect(city.visa, city.id).toEqual({ type: 'Visa Exemption', days: 90 });
      expect(city.meta.visaNote, city.id).toBe(
        'Longer visa-free stay for some passports; unique permit for digital mobile workers'
      );
      const q3 = destinationFaq(city)[2];
      expect(q3.a, city.id).toMatch(/^Up to 90 days in any 180 for most visa-free passports under Law 79\/2021/);
      expect(q3.a, city.id).toMatch(/one-year unique permit for digital mobile workers/);
      expect(q3.a, city.id).not.toMatch(/365/);
    }
  });

  it('fixes the Colombia 730-day row', () => {
    expect(cityById('armenia-quimbaya-co').meta.visaDays).toBe(90);
    for (const city of byCountry('CO')) expect(city.meta.visaNote, city.id).toMatch(/180 days per calendar year/);
  });

  it('uses one visa type and day count per country, so rows never contradict', () => {
    for (const cc of ['DE', 'PL', 'MX', 'BR', 'CL', 'ID', 'CO', 'JP', 'KR', 'TW', 'PE', 'BG', 'GR', 'HR', 'TR', 'ES', 'MY', 'AL']) {
      const rule = COUNTRY_VISA_RULES[cc];
      expect(rule, cc).toBeDefined();
      expect(rule.sources.length, cc).toBeGreaterThan(0);
      for (const city of byCountry(cc)) {
        expect(city.meta.visaType, city.id).toBe(rule.visaType);
        expect(city.meta.visaDays, city.id).toBe(rule.visaDays);
      }
    }
  });

  it('drops the D-8, Gold Card, Startup and Freelance labels as the default route', () => {
    for (const city of cities) {
      if (!['KR', 'TW', 'JP', 'DE'].includes(city.countryCode)) continue;
      expect(city.meta.visaType, city.id).not.toMatch(/D-8|Gold Card|Startup|Freelance/);
    }
    for (const city of byCountry('KR')) expect(city.meta.visaNote, city.id).toMatch(/F-1-D/);
    for (const city of byCountry('TW')) expect(city.meta.visaNote, city.id).toMatch(/Digital nomad visitor visa/);
  });

  it('shows only the default entry in the visa field (no Nomad type) for every ruled country', () => {
    const ruled = new Set(Object.keys(COUNTRY_VISA_RULES));
    for (const city of cities) {
      if (!ruled.has(city.countryCode)) continue;
      expect(city.meta.visaType, city.id).not.toMatch(/nomad/i);
      expect(city.visa.type, city.id).not.toMatch(/nomad/i);
    }
  });

  it('keeps visa notes free of dashes and arrows', () => {
    for (const city of cities) {
      if (city.meta.visaNote) expect(city.meta.visaNote, city.id).not.toMatch(DASH);
    }
  });
});

describe('batch 2 quick answers', () => {
  it('generates the reviewed copy for all 20 hubs word for word', () => {
    const pack = batch2 as Record<string, string[]>;
    expect(Object.keys(pack)).toHaveLength(20);
    for (const [id, answers] of Object.entries(pack)) {
      expect(destinationFaq(cityById(id)).map((item) => item.a), id).toEqual(answers);
    }
  });

  it('never prints the cost line twice', () => {
    for (const city of cities) {
      const skip = destinationFaq(city)[5].a;
      expect(skip.split('a month in our data.').length, city.id).toBeLessThanOrEqual(2);
    }
  });

  it('does not treat nightlife or crowd cons as weather', () => {
    expect(destinationFaq(cityById('split-hr'))[3].a).not.toMatch(/nightlife|crowded/);
  });

  it('names an official source instead of the generic line for the new countries', () => {
    for (const id of ['berlin-de', 'krakow-pl', 'taipei-tw', 'seoul-kr', 'tokyo-jp', 'lima-pe', 'istanbul-tr']) {
      expect(destinationFaq(cityById(id))[2].a, id).not.toMatch(/official \w+ government pages/);
    }
  });
});
