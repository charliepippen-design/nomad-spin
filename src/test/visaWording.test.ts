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

describe('Spain visa wording (default entry, nomad visa in the note)', () => {
  it('shows the Schengen exemption and keeps the telework visa and 3-year permit in the note', () => {
    const rows = byCountry('ES');
    expect(rows.length).toBeGreaterThan(10);
    for (const city of rows) {
      expect(city.meta).toMatchObject({ visaType: 'Visa Exemption', visaDays: 90 });
      expect(city.visa.days).toBe(90);
      expect(city.meta.visaNote).toMatch(/3 years/);
      expect(city.meta.visaNote).toMatch(/Ley 14\/2013/);
      expect(city.legalNotes.join(' ')).toMatch(/boe\.es/);
      expect(visaPathSentence(city.meta)).not.toMatch(MISLEADING);
    }
  });
});

describe('Portugal digital nomad visa wording', () => {
  const rows = cities.filter((c) => c.countryCode === 'PT' && /digital nomad/i.test(c.meta.visaType));

  it('covers the named cities and does not render a stay allowance', () => {
    const names = new Set(rows.map((c) => c.name));
    for (const name of ['Lisbon', 'Porto', 'Porto Santo']) {
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

describe('Vietnam e-visa label', () => {
  it('uses E-Visa 90 on every Vietnam row, including Hanoi, Hoi An, and Da Nang Outskirts', () => {
    const rows = byCountry('VN');
    const names = new Set(rows.map((city) => city.name));
    for (const name of ['Da Nang', 'Ho Chi Minh City', 'Hanoi', 'Hoi An', 'Da Nang Outskirts', 'Phan Thiet']) {
      expect(names.has(name)).toBe(true);
    }
    expect(rows.length).toBeGreaterThanOrEqual(8);

    for (const city of rows) {
      expect(city.meta.visaType).toBe('E-Visa');
      expect(city.meta.visaDays).toBe(90);
      expect(city.visa).toEqual({ type: 'E-Visa', days: 90 });
    }
  });
});

describe('living guide visa sections', () => {
  it('cites the MDEC DE Rantau pages and the Immigration Department in the Penang guide', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-penang.md'),
      'utf-8',
    );
    expect(md).toMatch(/mdec\.my\/derantau/);
    expect(md).toMatch(/mdec\.my\/api\/media\/file\/DE-Rantau_Pass_FAQ_v10\.pdf/);
    expect(md).toMatch(/imi\.gov\.my\/index\.php\/en\/main-services\/visa\/visa-requirement-by-country/);
    expect(md).toMatch(/imigresen-online\.imi\.gov\.my\/mdac/);
    expect(md).toMatch(/rai\.malaysia\.gov\.my\/enter/);
    expect(md).toMatch(/Version 10\.0/);
    expect(md).toMatch(/\*\*USD 24,000\*\*/);
    expect(md).toMatch(/\*\*USD 60,000\*\*/);
    expect(md).toMatch(/\*\*RM1,080\*\*/);
    expect(md).toMatch(/tourist pass cannot be converted/i);
    expect(md).not.toMatch(/Digital Nomad Visa/);
    expect(md).not.toMatch(/territorial/i);
    expect(md).not.toMatch(/\u2014|\u2013|\u2192/);
  });

  it('cites the MDEC DE Rantau pages and the Immigration Department in the Kuala Lumpur guide', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-kuala-lumpur.md'),
      'utf-8',
    );
    expect(md).toMatch(/mdec\.my\/derantau/);
    expect(md).toMatch(/mdec\.my\/api\/media\/file\/DE-Rantau_Pass_FAQ_v10\.pdf/);
    expect(md).toMatch(/imi\.gov\.my\/index\.php\/en\/main-services\/visa\/visa-requirement-by-country/);
    expect(md).toMatch(/imigresen-online\.imi\.gov\.my\/mdac/);
    expect(md).toMatch(/Version 10\.0/);
    expect(md).toMatch(/\*\*USD 24,000\*\*/);
    expect(md).toMatch(/\*\*USD 60,000\*\*/);
    expect(md).toMatch(/\*\*RM1,080\*\*/);
    expect(md).not.toMatch(/Digital Nomad Visa/);
    expect(md).toMatch(/rai\.malaysia\.gov\.my\/enter/);
    expect(md).toMatch(/tourist pass cannot be converted/i);
    expect(md).not.toMatch(/territorial/i);
    expect(md).not.toMatch(/\u2014|\u2013|\u2192/);
  });

  it('cites the Vietnam e-visa portal and the Finance circular in the Hoi An guide', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-hoi-an.md'),
      'utf-8',
    );
    expect(md).toMatch(/evisa\.gov\.vn/);
    expect(md).toMatch(/immigration\.gov\.vn\/trang-chu-ttdt/);
    expect(md).toMatch(/28\/2026\/TT-BTC/);
    expect(md).toMatch(/\*\*E-Visa\*\*/);
    expect(md).not.toMatch(/Tourist Visa/);
    expect(md).toMatch(/no dedicated digital nomad visa/i);
    expect(md).toMatch(/\*\*25 USD\*\*/);
    expect(md).toMatch(/\*\*50 USD\*\*/);
    expect(md).not.toMatch(/da-nang-outskirts/);
    expect(md).not.toMatch(/\u2014|\u2013/);
  });

  it('cites the Croatian Ministry of the Interior in the Split guide and prints only its figures', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-split.md'),
      'utf-8',
    );
    expect(md).toMatch(/mup\.gov\.hr\/aliens-281621\/temporary-stay-of-digital-nomads-286853/);
    expect(md).toMatch(/mvep\.gov\.hr/);
    expect(md).toMatch(/porezna-uprava\.gov\.hr/);
    expect(md).toMatch(/economy-finance\.ec\.europa\.eu/);
    expect(md).toMatch(/europarl\.europa\.eu/);
    expect(md).toMatch(/home-affairs\.ec\.europa\.eu/);
    expect(md).toMatch(/eighteen months/);
    expect(md).toMatch(/\*\*2\.5\*\* average monthly net salaries/);
    expect(md).toMatch(/EUR 3,622\.50/);
    expect(md).toMatch(/EUR 43,470\.00/);
    expect(md).toMatch(/not registered in Croatia/);
    expect(md).not.toMatch(/€/);
    expect(md).not.toMatch(/\bkuna\b.*\d/i);
    expect(md).not.toMatch(/\u2014|\u2013|\u2192/);
  });

  it('cites the Government of Montenegro pages in the Kotor guide and prints no unofficial figures', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-kotor.md'),
      'utf-8',
    );
    expect(md).toMatch(/gov\.me\/en\/article\/stay-of-up-to-90-days/);
    expect(md).toMatch(/gov\.me\/en\/article\/visas-and-visa-regime/);
    expect(md).toMatch(/gov\.me\/en\/diplomatic-missions/);
    expect(md).toMatch(/digitalnomads\.gov\.me\/article\/legal-status-for-nomads/);
    expect(md).toMatch(/registration-and-cancellation-of-residence-for-foreign-nationals/);
    expect(md).toMatch(/gov\.uk\/foreign-travel-advice\/montenegro\/entry-requirements/);
    expect(md).toMatch(/12\/18, 3\/19 and 86\/22/);
    expect(md).toMatch(/up to \*\*two years\*\*/);
    expect(md).toMatch(/within 24 hours/);
    expect(md).toMatch(/not registered in Montenegro/);
    expect(md).toMatch(/not a member of the Schengen area/);
    // Montenegro is outside Schengen: no Croatian MUP rule, no unofficial nomad visa label, no 365-day claim.
    expect(md).not.toMatch(/mup\.gov\.hr|18 months|Digital Nomad Visa/);
    expect(md).not.toMatch(/visa-free for (?:a year|365)|365 days visa-free/i);
    expect(md).not.toMatch(/€|\bEUR\b|\b9%/);
    expect(md).not.toMatch(/\u2014|\u2013|\u2192/);
  });

  it('cites the Mexican law, visa guidelines, and INM pages in the Playa del Carmen guide and prints no unofficial figures', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-playa-del-carmen.md'),
      'utf-8',
    );
    expect(md).toMatch(/gob\.mx\/cms\/uploads\/attachment\/file\/474147\/LMigraci_n\.pdf/);
    expect(md).toMatch(/lineamientos-visas-25-jul-2025\.pdf/);
    expect(md).toMatch(/2023_GUIA_DEL_VIAJERO_No_Visa\.pdf/);
    expect(md).toMatch(/inm\.gob\.mx\/gobmx\/word\/index\.php\/paises-no-requieren-visa-para-mexico/);
    expect(md).toMatch(/gob\.mx\/inm\/articulos\/forma-migratoria-multiple-digital-fmmd/);
    expect(md).toMatch(/homoclave=SRE-01-031/);
    expect(md).toMatch(/determined by the immigration authority at the point of entry/);
    expect(md).toMatch(/\*\*no longer than 180 days\*\*/);
    expect(md).toMatch(/\*\*30 calendar days\*\*/);
    expect(md).toMatch(/Mexico does not have a separate digital nomad visa/);
    // No unofficial income or savings thresholds, no nomad visa label, no promise of 180 days.
    expect(md).not.toMatch(/Digital Nomad Visa|\bMXN\b|\bUSD\b|\$\d[\d,]* (?:a|per) month in (?:income|savings)/);
    expect(md).not.toMatch(/you (?:will )?get 180 days|180 days (?:by default|automatically)/i);
    expect(md).not.toMatch(/\u2014|\u2013|\u2192/);
  });

  it('cites the Albanian law and ministry pages in the Tirana guide and prints no unofficial figures', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-tirana.md'),
      'utf-8',
    );
    expect(md).toMatch(/mb\.gov\.al/);
    expect(md).toMatch(/punetejashtme\.gov\.al/);
    expect(md).toMatch(/e-visa\.al/);
    expect(md).toMatch(/79\/2021/);
    expect(md).toMatch(/Article 68/);
    expect(md).not.toMatch(/\*\*Visa-Free\*\*, \*\*365\*\* days/);
    expect(md).toMatch(/punetejashtme\.gov\.al\/en\/regjimi-i-vizave-per-te-huajt/);
    expect(md).toMatch(/passport/i);
    expect(md).not.toMatch(/€|\bEUR\b/);
    expect(md).not.toMatch(/\u2014|\u2013/);
  });

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
    expect(md).toMatch(/Lei 23\/2007/);
    expect(md).not.toMatch(/art\. 75/);
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

  it('cites the Vietnam Immigration Department e-visa rules in the Ho Chi Minh City guide', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-ho-chi-minh-city.md'),
      'utf-8',
    );
    expect(md).toMatch(/evisa\.gov\.vn/);
    expect(md).toMatch(/immigration\.gov\.vn\/trang-chu-ttdt/);
    expect(md).toMatch(/\$25/);
    expect(md).toMatch(/\$50/);
    expect(md).toMatch(/3 working days/);
    expect(md).toMatch(/maximum of 90 days/);
    expect(md).toMatch(/no dedicated digital nomad visa/i);
    expect(md).not.toMatch(/\u2014|\u2013/);
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

  it('cites Estonian D-visa, e-Residency, and Schengen pages for the Tallinn guide', () => {
    const md = fs.readFileSync(
      path.resolve(__dirname, '../../content/guides/living-in-tallinn.md'),
      'utf-8',
    );
    expect(md).toMatch(/vm\.ee\/en\/consular-visa-and-travel-information\/visa-information\/application-long-stay-d-visa/);
    expect(md).toMatch(/politsei\.ee\/en\/instructions\/visa-and-extending-period-of-stay\/long-term-visa/);
    expect(md).toMatch(/learn\.e-resident\.gov\.ee\/hc\/en-gb\/articles\/360000711978-What-is-e-Residency/);
    expect(md).toMatch(/home-affairs\.ec\.europa\.eu\/policies\/schengen-borders-and-visa\/visa-policy_en/);
    expect(md).toMatch(/emta\.ee\/en\/private-client\/foreigner-non-resident\/tax-residency\/determining-residency/);
    expect(md).toMatch(/132 euros per day \(3,960 euros per month\)/);
    expect(md).toMatch(/Digital Nomad Visa/);
    expect(md).not.toMatch(/3,?504/);
    expect(md).not.toMatch(/2,?849/);
    expect(md).not.toMatch(/\bEUR\b/);
    expect(md).not.toMatch(/€/);
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
