import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { cities } from '@/data/cities';
import { visaPathSentence } from '@/lib/visaCopy';
import { destinationIntro, destinationMetaDescription } from '@/lib/destinationSeo';

const MISLEADING = /up to 365 days for most nationalities/i;

function byCountry(code: string) {
  return cities.filter((c) => c.countryCode === code);
}

describe('Spain and Portugal digital nomad visa wording', () => {
  const rows = cities.filter(
    (c) => (c.countryCode === 'ES' || c.countryCode === 'PT') && /digital nomad/i.test(c.meta.visaType),
  );

  it('covers the named cities and does not render a stay allowance', () => {
    const names = new Set(rows.map((c) => c.name));
    for (const name of ['Lisbon', 'Porto', 'Barcelona', 'Madrid', 'Valencia', 'Las Palmas', 'Porto Santo']) {
      expect(names.has(name)).toBe(true);
    }
    expect(rows.length).toBeGreaterThan(10);

    for (const city of rows) {
      expect(city.meta.visaDays).toBe(365);
      expect(city.visa.days).toBe(365);
      const line = visaPathSentence(city.meta);
      expect(line).not.toMatch(MISLEADING);
      expect(line).not.toMatch(/most nationalities/i);
      expect(line).toMatch(/^Initial /);
      expect(line).toMatch(/Application required; eligibility and renewals vary, verify official sources\./);
      expect(destinationIntro(city)).not.toMatch(MISLEADING);
      expect(destinationMetaDescription(city)).not.toMatch(/\(365 days\)/);
      expect(city.meta.visaNote).toBeTruthy();
      expect(city.legalNotes.length).toBeGreaterThan(0);
    }
  });

  it('keeps Spain on the consular visa plus the 3-year residence authorization', () => {
    const madrid = rows.find((c) => c.id === 'madrid-es');
    expect(madrid?.meta.visaNote).toMatch(/3 years/);
    expect(madrid?.meta.visaNote).toMatch(/Ley 14\/2013/);
    expect(madrid?.legalNotes.join(' ')).toMatch(/boe\.es/);
  });

  it('keeps Portugal on the D8 path and flags the D7 label as unverified', () => {
    const lisbon = rows.find((c) => c.id === 'lisbon-pt');
    expect(lisbon?.meta.visaType).toBe('Digital Nomad Visa');
    expect(lisbon?.meta.visaNote).toMatch(/Lei 23\/2007/);
    expect(lisbon?.meta.visaNote).toMatch(/2-year/);
    expect(lisbon?.legalNotes.join(' ')).toMatch(/vistos\.mne\.gov\.pt/);

    const portoSanto = rows.find((c) => c.id === 'porto-santo-pt');
    expect(portoSanto?.meta.visaType).toBe('D7/Digital Nomad Visa');
    expect(portoSanto?.meta.visaNote).toMatch(/Check official MNE and AIMA sources/);
  });
});

describe('Thailand tourism exemption wording', () => {
  const rows = byCountry('TH');

  it('updates every Thai row off the 60-day exemption and the DTV day count', () => {
    const names = new Set(rows.map((c) => c.name));
    for (const name of ['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Phangan', 'Pai', 'Krabi']) {
      expect(names.has(name)).toBe(true);
    }
    expect(rows.length).toBeGreaterThan(10);

    for (const city of rows) {
      expect(city.meta.visaType).toBe('Tourism Visa Exemption');
      expect(city.meta.visaDays).toBe(30);
      expect(city.visa).toEqual({ type: 'Tourism Visa Exemption', days: 30 });
      const line = visaPathSentence(city.meta);
      expect(line).not.toMatch(/most nationalities/i);
      expect(line).not.toMatch(/up to 60 days/i);
      expect(line).toMatch(/Tourism only/i);
      expect(line).toMatch(/passport/i);
      expect(line).toMatch(/DTV/);
      expect(destinationIntro(city)).not.toMatch(/up to 60 days/i);
      expect(destinationMetaDescription(city)).not.toMatch(/60 days/);
      expect(city.legalNotes.join(' ')).toMatch(/thailand\.prd\.go\.th/);
    }
  });
});

describe('living guide visa sections', () => {
  it('cites Spain statute in the Barcelona guide and does not print an unofficial euro income figure', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-barcelona.md'),
      'utf-8',
    );
    expect(md).toMatch(/Ley 14\/2013/);
    expect(md).toMatch(/art\. 74 quinquies/);
    expect(md).toMatch(/boe\.es/);
    expect(md).toMatch(/exteriores\.gob\.es/);
    expect(md).toMatch(/200%/);
    expect(md).toMatch(/up to 3 years/);
    expect(md).not.toMatch(/2,?849/);
    expect(md).not.toMatch(/€/);
    expect(md).not.toMatch(/\u2014|\u2013/);
  });

  it('cites Spain statute in the Madrid guide and does not print an unofficial euro income figure', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-madrid.md'),
      'utf-8',
    );
    expect(md).toMatch(/Ley 14\/2013/);
    expect(md).toMatch(/art\. 74 quinquies/);
    expect(md).toMatch(/boe\.es/);
    expect(md).toMatch(/exteriores\.gob\.es/);
    expect(md).toMatch(/200%/);
    expect(md).toMatch(/up to 3 years/);
    expect(md).not.toMatch(/2,?849/);
    expect(md).not.toMatch(/€/);
    expect(md).not.toMatch(/\bEUR\b/);
    expect(md).not.toMatch(/\u2014|\u2013/);
  });

  it('cites Spain statute in the Valencia guide and does not print an unofficial euro income figure', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-valencia.md'),
      'utf-8',
    );
    expect(md).toMatch(/Ley 14\/2013, art\. 74 quinquies/);
    expect(md).toMatch(/1-yr consular telework visa/);
    expect(md).toMatch(/up to 3 years/);
    expect(md).toMatch(/boe\.es/);
    expect(md).toMatch(/exteriores\.gob\.es/);
    expect(md).toMatch(/one\.gob\.es/);
    expect(md).toMatch(/200%/);
    expect(md).toMatch(/aemet\.es/);
    expect(md).not.toMatch(/2,?849/);
    expect(md).not.toMatch(/€/);
    expect(md).not.toMatch(/\bEUR\b/);
    expect(md).not.toMatch(/\u2014|\u2013/);
  });

  it('cites Portugal statute in the Lisbon guide and does not print an unofficial euro income figure', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-lisbon.md'),
      'utf-8',
    );
    expect(md).toMatch(/Lei 23\/2007/);
    expect(md).toMatch(/vistos\.mne\.gov\.pt/);
    expect(md).toMatch(/diariodarepublica\.pt/);
    expect(md).not.toMatch(/2,?849/);
    expect(md).not.toMatch(/four times/i);
    expect(md).not.toMatch(/\u2014/);
  });

  it('cites Portugal statute in the Porto guide and does not print an unofficial euro income figure', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-porto.md'),
      'utf-8',
    );
    expect(md).toMatch(/Lei 23\/2007, art\. 75/);
    expect(md).toMatch(/2 years from issue/);
    expect(md).toMatch(/3-year/);
    expect(md).toMatch(/vistos\.mne\.gov\.pt/);
    expect(md).toMatch(/aima\.gov\.pt/);
    expect(md).toMatch(/diariodarepublica\.pt/);
    expect(md).toMatch(/Same national rules as Lisbon/);
    expect(md).not.toMatch(/2,?849/);
    expect(md).not.toMatch(/four times/i);
    expect(md).not.toMatch(/€/);
    expect(md).not.toMatch(/\bEUR\b/);
    expect(md).not.toMatch(/\u2014|\u2013/);
  });

  it('cites the Thailand PRD notice and describes the 30-day tourism exemption', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-chiang-mai.md'),
      'utf-8',
    );
    expect(md).toMatch(/thailand\.prd\.go\.th\/en\/content\/category\/detail\/id\/48\/iid\/538547/);
    expect(md).toMatch(/Tourism Visa Exemption/);
    expect(md).toMatch(/\*\*30 days\*\*/);
    expect(md).not.toMatch(/row says \*\*Visa Exemption\*\*, \*\*60 days\*\*/);
    expect(md).not.toMatch(/will not show you the September 2026/);
    expect(md).not.toMatch(/still shows/i);
    expect(md).not.toMatch(/\u2014/);

    const bangkok = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-bangkok.md'),
      'utf-8',
    );
    expect(bangkok).toMatch(/thailand\.prd\.go\.th\/en\/content\/category\/detail\/id\/48\/iid\/538547/);
    expect(bangkok).toMatch(/Tourism Visa Exemption/);
    expect(bangkok).toMatch(/\*\*30 days\*\*/);
    expect(bangkok).not.toMatch(/still shows/i);
    expect(bangkok).not.toMatch(/\u2014/);

    const tbilisi = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-tbilisi.md'),
      'utf-8',
    );
    expect(tbilisi).not.toMatch(/still shows/i);
    expect(tbilisi).not.toMatch(/Visa Exemption, 60 days/);
    expect(tbilisi).toMatch(/Tourism exemption, 30 days/);
  });

  it('cites Czech MFA, Interior, and Industry pages for the Prague trade-licence and digital nomad paths', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-prague.md'),
      'utf-8',
    );
    expect(md).toMatch(/mzv\.gov\.cz\/jnp\/en\/information_for_aliens\/long_stay_visa\/entrepreneurship\.html/);
    expect(md).toMatch(/mvcr\.cz\/mvcren\/article\/document-on-the-purpose-of-stay\.aspx/);
    expect(md).toMatch(/mpo\.gov\.cz\/en\/foreign-trade\/economic-migration\/programs-and-projects\/digital-nomad-program--275799/);
    expect(md).toMatch(/1\.5 times/);
    expect(md).toMatch(/Freelance Visa/);
    expect(md).not.toMatch(/\bEUR\b/);
    expect(md).not.toMatch(/2,?849/);
    expect(md).not.toMatch(/still shows/i);
    expect(md).not.toMatch(/\u2014|\u2013/);
  });

  it('cites the Hungarian White Card factsheet and both official income figures', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-budapest.md'),
      'utf-8',
    );
    expect(md).toMatch(/oif\.gov\.hu\/factsheets\/white-card-residency-for-digital-nomads/);
    expect(md).toMatch(/enterhungary\.gov\.hu\/eh\/tajekoztato\/en\/okmanyfeherkartya/);
    expect(md).toMatch(/EUR 3,000/);
    expect(md).toMatch(/EUR 2,000/);
    expect(md).not.toMatch(/2,?849/);
    expect(md).not.toMatch(/still shows/i);
    expect(md).not.toMatch(/\u2014|\u2013/);
  });
});
