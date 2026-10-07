import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { guides } from '@/data/guides';
import { buildContentGuidesModule } from '../../scripts/sync-content-guides';

describe('static guides', () => {
  it('includes the editorial content guides', () => {
    const slugs = guides.map((g) => g.slug);
    expect(slugs).toContain('living-in-bali');
    expect(slugs).toContain('living-in-cape-town');
    expect(slugs).toContain('living-in-chiang-mai');
    expect(slugs).toContain('living-in-bangkok');
    expect(slugs).toContain('living-in-barcelona');
    expect(slugs).toContain('living-in-budapest');
    expect(slugs).toContain('living-in-da-nang');
    expect(slugs).toContain('living-in-lisbon');
    expect(slugs).toContain('living-in-mexico-city');
    expect(slugs).toContain('living-in-medellin');
    expect(slugs).toContain('living-in-tbilisi');
    expect(slugs).toContain('living-in-porto');
    expect(slugs).toContain('living-in-buenos-aires');
    expect(slugs).toContain('living-in-valencia');
    expect(slugs).toContain('how-to-choose-next-nomad-base');
    expect(slugs).toContain('where-to-go-next-by-season');
    expect(slugs).toContain('paraguay-tax-residency-remote-workers');
    expect(slugs).toContain('best-places-digital-nomads-2025');
  });

  it('keeps the nomad places shortlist on its original URL and current for 2026', () => {
    const guide = guides.find((g) => g.slug === 'best-places-digital-nomads-2025');
    expect(guide).toBeDefined();
    expect(guide!.title).toBe('Best Places for Digital Nomads in 2026');
    expect(guide!.excerpt).toContain('2026');
    expect(guide!.excerpt).not.toContain('2025');
    expect(guide!.date.startsWith('2025-01-06')).toBe(true);
    expect(guide!.updated?.startsWith('2026-10-07')).toBe(true);
    expect(guide!.content).not.toContain('—');
    expect(guide!.content).toContain('780+');
    expect(guide!.content).toContain('href="/"');
    expect(guide!.content).not.toMatch(/\$700[–-]\$1,000|\$900[–-]\$1,200|B211A visa and Second Home|blue-dollar|blue dollar/i);
  });

  it('has unique, URL-safe slugs', () => {
    const slugs = guides.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('has complete metadata and no leftover draft/editor chrome', () => {
    for (const g of guides) {
      expect(g.title.length).toBeGreaterThan(10);
      expect(g.excerpt.length).toBeGreaterThan(50);
      expect(g.excerpt.length).toBeLessThanOrEqual(170);
      expect(Number.isNaN(Date.parse(g.date))).toBe(false);
      expect(g.content.length).toBeGreaterThan(2000);
      expect(g.content).not.toMatch(/^#\s/); // page renders its own <h1>
      expect(g.content).not.toMatch(/\bTODO\b|lorem ipsum|Your Altitude|\[insert|tell me your priorities/i);
    }
  });

  it('publishes the Chiang Mai living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-chiang-mai');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Chiang Mai');
    expect(g!.seoTitle).toBe("Living in Chiang Mai 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Chiang Mai for remote workers in 2026: real monthly costs, Nimman vs Old City, visas and DTV notes, coworking, internet, and burning season trade-offs.'
    );
    expect(g!.relatedDestinations).toEqual(['chiang-mai', 'bangkok']);
    expect(g!.content).toContain('$850');
    expect(g!.content).toContain('$650');
    expect(g!.content).toContain('$35');
    expect(g!.content).toContain('95 Mbps');
    expect(g!.content).toContain('8.2');
    expect(g!.content).not.toMatch(/—/);
    expect(g!.title).not.toMatch(/—/);
    expect(g!.seoTitle).not.toMatch(/—/);
    expect(g!.excerpt).not.toMatch(/—/);
    for (const href of [
      '/destinations/chiang-mai',
      '/destinations/bangkok',
      '/destinations/da-nang',
      '/destinations/bali',
      '/destinations/canggu',
      '/destinations/ubud',
      '/destinations/seminyak',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
    ]) {
      expect(g!.content).toContain(href);
    }
  });

  it('publishes the Bangkok living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-bangkok');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Bangkok');
    expect(g!.seoTitle).toBe("Living in Bangkok 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Bangkok for remote workers in 2026: real monthly costs, BTS neighborhoods, visas and DTV notes, 120 Mbps internet, heat and traffic trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(155);
    expect(g!.relatedDestinations).toEqual(['bangkok']);
    expect(g!.content).toContain('living in Bangkok as a digital nomad');
    expect(g!.content).toContain('$1,100');
    expect(g!.content).toContain('$800');
    expect(g!.content).toContain('$45');
    expect(g!.content).toContain('120 Mbps');
    expect(g!.content).toContain('7.8');
    expect(g!.content).toContain('Visa Exemption');
    expect(g!.content).toContain('60');
    expect(g!.content).toContain('UTC+7');
    expect(g!.content).not.toMatch(/—/);
    expect(g!.title).not.toMatch(/—/);
    expect(g!.seoTitle).not.toMatch(/—/);
    expect(g!.excerpt).not.toMatch(/—/);
    expect(g!.content).not.toMatch(/–/);
    expect(g!.title).not.toMatch(/–/);
    expect(g!.seoTitle).not.toMatch(/–/);
    expect(g!.excerpt).not.toMatch(/–/);
    for (const href of [
      '/destinations/bangkok',
      '/destinations/chiang-mai',
      '/destinations/bali',
      '/destinations/da-nang',
      '/destinations/mexico-city',
      '/destinations/lisbon',
      '/destinations/canggu',
      '/destinations/ubud',
      '/destinations/seminyak',
      '/guides/living-in-chiang-mai',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-lisbon',
      '/guides/living-in-mexico-city',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
    for (const heading of [
      'Is living in Bangkok still worth it for digital nomads in 2026?',
      'Who Bangkok is for (and who should skip it)',
      'Real monthly cost bands (solo, long-term, short Airbnb)',
      'Neighborhoods on the BTS/MRT: Ari, Sukhumvit / Thonglor / Ekkamai, On Nut, Silom (trade-offs)',
      'Internet, power, and coworking for video-call work',
      'Visas and stay length: 30-day tourism exemption vs longer options including DTV (verify official rules)',
      'Best months, rainy season, extreme heat, and air quality',
      'Daily life: street food, transit, nightlife, SE Asia hub logistics',
      'Bangkok vs Chiang Mai, Bali, Da Nang, Mexico City',
      'First-week checklist + compare Bangkok on Nomad Spin',
    ]) {
      expect(g!.content).toContain(`## ${heading}`);
    }
  });

  it('publishes the Lisbon living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-lisbon');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Lisbon');
    expect(g!.seoTitle).toBe("Living in Lisbon 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Lisbon for remote workers in 2026: real monthly costs, neighborhoods, D8 visa notes, coworking, 200 Mbps internet, and rising-rent trade-offs.'
    );
    expect(g!.relatedDestinations).toEqual(['lisbon', 'porto', 'budapest', 'barcelona']);
    expect(g!.content).toContain('$2,200');
    expect(g!.content).toContain('$1,800');
    expect(g!.content).toContain('$120');
    expect(g!.content).toContain('200 Mbps');
    expect(g!.content).toContain('8.8');
    expect(g!.content).toContain('365');
    expect(g!.content).toContain('780+');
    expect(g!.content).not.toMatch(/—|–/);
    expect(g!.title).not.toMatch(/—|–/);
    expect(g!.seoTitle).not.toMatch(/—|–/);
    expect(g!.excerpt).not.toMatch(/—|–/);
    for (const href of [
      '/destinations/lisbon',
      '/destinations/porto',
      '/destinations/budapest',
      '/destinations/barcelona',
      '/destinations/cape-town',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-chiang-mai',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
    for (const heading of [
      'Is Lisbon still worth it for digital nomads in 2026?',
      'Who Lisbon is for (and who should skip it)',
      'Cost of living: budget bands from Nomad Spin data plus what changes the bill',
      'Neighborhoods: Arroios, Santos, Principe Real, and quieter alternatives',
      'Internet, coworking, and cafe work setups that actually hold video calls',
      'Visas and stay length: Schengen visits vs Portugal D8 digital nomad visa (verify current rules)',
      'When to go: best months, rainy season, and peak tourist reality',
      'Daily life: food, transit, safety, and community',
      'Lisbon vs Cape Town, Porto, and Budapest (and when to look at cheaper Europe)',
      'First-week setup checklist and how to compare Lisbon on Nomad Spin',
    ]) {
      expect(g!.content).toContain(`## ${heading}`);
    }
  });

  it('publishes the Da Nang living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-da-nang');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Da Nang');
    expect(g!.seoTitle).toBe("Living in Da Nang 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Da Nang for remote workers in 2026: real monthly costs, An Thuong vs Hai Chau, e-visa notes, coworking, 80 Mbps internet, and typhoon-season trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(170);
    expect(g!.relatedDestinations).toEqual(['da-nang']);
    expect(g!.content).toContain('living in Da Nang as a digital nomad');
    expect(g!.content).toContain('$700');
    expect(g!.content).toContain('$500');
    expect(g!.content).toContain('$25');
    expect(g!.content).toContain('80 Mbps');
    expect(g!.content).toContain('8.5');
    expect(g!.content).toContain('E-Visa');
    expect(g!.content).toContain('90');
    expect(g!.content).toContain('UTC+7');
    expect(g!.content).not.toContain('da-nang-outskirts');
    expect(g!.content).not.toMatch(/—|–/);
    expect(g!.title).not.toMatch(/—|–/);
    expect(g!.seoTitle).not.toMatch(/—|–/);
    expect(g!.excerpt).not.toMatch(/—|–/);
    for (const href of [
      '/destinations/da-nang',
      '/destinations/chiang-mai',
      '/destinations/bali',
      '/destinations/bangkok',
      '/destinations/hoi-an',
      '/destinations/ho-chi-minh-city',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-chiang-mai',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
    for (const heading of [
      'Is living in Da Nang worth it for digital nomads in 2026?',
      'Who Da Nang is for (and who should skip it)',
      'Real monthly cost bands (solo $700, long-term $500, short Airbnb $25/night)',
      'Neighborhoods that work: An Thuong, My Khe, Hai Chau, Son Tra, and Ngu Hanh Son',
      'Internet, power, and coworking for video-call work',
      'Visas and stay length: 90-day e-visa, no dedicated nomad visa (verify official rules)',
      'Best months (Feb-Jul) vs rainy and typhoon season (Sep-Dec)',
      'Daily life: Grab, food, Vietnamese, and the family-friendly side',
      'Da Nang vs Chiang Mai, Bali, Hoi An, and Ho Chi Minh City',
      'First-week checklist and how to compare Da Nang on Nomad Spin',
    ]) {
      expect(g!.content).toContain(`## ${heading}`);
    }
  });

  it('publishes the Mexico City living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-mexico-city');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Mexico City');
    expect(g!.seoTitle).toBe("Living in Mexico City 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Mexico City for remote workers in 2026: real monthly costs, Roma vs Condesa, 180-day stay notes, coworking, internet, altitude and air-quality trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(170);
    expect(g!.relatedDestinations).toEqual(['mexico-city']);
    expect(g!.content).toContain('living in Mexico City as a digital nomad');
    expect(g!.content).toContain('$1,300');
    expect(g!.content).toContain('$1,000');
    expect(g!.content).toContain('$60');
    expect(g!.content).toContain('90 Mbps');
    expect(g!.content).toContain('6.0');
    expect(g!.content).toContain('Visa Exemption');
    expect(g!.content).toContain('180');
    expect(g!.content).toContain('UTC-6');
    expect(g!.content).not.toMatch(/—/);
    expect(g!.title).not.toMatch(/—/);
    expect(g!.seoTitle).not.toMatch(/—/);
    expect(g!.excerpt).not.toMatch(/—/);
    for (const href of [
      '/destinations/mexico-city',
      '/destinations/medellin',
      '/destinations/buenos-aires',
      '/destinations/chiang-mai',
      '/destinations/bangkok',
      '/destinations/lisbon',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-chiang-mai',
      '/guides/living-in-bangkok',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
  });

  it('publishes the Medellin living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-medellin');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Medellin');
    expect(g!.seoTitle).toBe("Living in Medellin 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Medellin for remote workers in 2026: real monthly costs, Laureles vs Poblado, visas, coworking, eternal-spring weather, and honest safety trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(155);
    expect(g!.relatedDestinations).toEqual(['medellin']);
    expect(g!.content).toContain('living in Medellin as a digital nomad');
    expect(g!.content).toContain('$1,100');
    expect(g!.content).toContain('$800');
    expect(g!.content).toContain('$45');
    expect(g!.content).toContain('80 Mbps');
    expect(g!.content).toContain('6.5');
    expect(g!.content).toContain('Visa Exemption');
    expect(g!.content).toContain('90');
    expect(g!.content).toContain('UTC-5');
    expect(g!.content).not.toMatch(/—|–/);
    expect(g!.title).not.toMatch(/—|–/);
    expect(g!.seoTitle).not.toMatch(/—|–/);
    expect(g!.excerpt).not.toMatch(/—|–/);
    for (const href of [
      '/destinations/medellin',
      '/destinations/mexico-city',
      '/destinations/buenos-aires',
      '/destinations/chiang-mai',
      '/destinations/lisbon',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-chiang-mai',
      '/guides/living-in-mexico-city',
      '/guides/living-in-lisbon',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '/guides/paraguay-tax-residency-remote-workers',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
    expect(g!.content).not.toContain('medell-n');
    expect(g!.content).not.toMatch(/TODO_|8092520|SafetyWing|Booking\.com|Skyscanner|\bFlatio\b|\bAiralo\b/i);
  });

  it('publishes the Budapest living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-budapest');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Budapest');
    expect(g!.seoTitle).toBe("Living in Budapest 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Budapest for remote workers in 2026: real monthly costs, District VII vs Buda, White Card visa notes, 200 Mbps internet, baths, and winter trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(155);
    expect(g!.relatedDestinations).toEqual(['budapest']);
    expect(g!.content).toContain('Living in Budapest as a digital nomad');
    expect(g!.content).toContain('$1,500');
    expect(g!.content).toContain('$1,100');
    expect(g!.content).toContain('$70');
    expect(g!.content).toContain('200 Mbps');
    expect(g!.content).toContain('8.3');
    expect(g!.content).toContain('Digital Nomad Visa');
    expect(g!.content).toContain('365');
    expect(g!.content).toContain('UTC+1');
    expect(g!.content).toContain('White Card');
    expect(g!.content).toContain('oif.gov.hu');
    expect(g!.content).not.toMatch(/—|–/);
    expect(g!.title).not.toMatch(/—|–/);
    expect(g!.seoTitle).not.toMatch(/—|–/);
    expect(g!.excerpt).not.toMatch(/—|–/);
    for (const href of [
      '/destinations/budapest',
      '/destinations/lisbon',
      '/destinations/tbilisi',
      '/destinations/prague',
      '/destinations/krakow',
      '/destinations/vienna',
      '/guides/living-in-lisbon',
      '/guides/living-in-tbilisi',
      '/guides/living-in-chiang-mai',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
    for (const heading of [
      'Is living in Budapest worth it for digital nomads in 2026?',
      'Who Budapest is for (and who should skip it)',
      'Real monthly cost bands (solo $1,500, long-term $1,100, Airbnb $70/night)',
      'Districts that work: VII (Erzsébetváros), VI (Terézváros), V, XIII (Újlipótváros), and the Buda side',
      'Internet, power, and coworking: 200 Mbps, reliability 9, power 9, High coworking',
      'Visas and stay length: Schengen 90/180 vs Hungary White Card (verify official rules)',
      'Best months (Apr-Jun, Sep-Oct), rainy Nov-Dec, cold winters, and winter air quality',
      'Daily life: thermal baths, ruin bars, the transit pass, Hungarian, forint, and community',
      'Budapest vs Prague, Krakow, Vienna, and Lisbon',
      'First-week checklist and how to compare Budapest on Nomad Spin',
    ]) {
      expect(g!.content).toContain(`## ${heading}`);
    }
  });

  it('publishes the Tbilisi living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-tbilisi');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Tbilisi');
    expect(g!.seoTitle).toBe("Living in Tbilisi 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Tbilisi for remote workers in 2026: real monthly costs, 365-day visa-free notes, neighborhoods, 60 Mbps internet, wine culture, and winter trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(170);
    expect(g!.relatedDestinations).toEqual(['tbilisi']);
    expect(g!.content).toContain('living in Tbilisi as a digital nomad');
    expect(g!.content).toContain('$800');
    expect(g!.content).toContain('$550');
    expect(g!.content).toContain('$30');
    expect(g!.content).toContain('60 Mbps');
    expect(g!.content).toContain('8.0');
    expect(g!.content).toContain('Visa Free');
    expect(g!.content).toContain('365');
    expect(g!.content).toContain('UTC+4');
    expect(g!.content).not.toMatch(/—/);
    expect(g!.title).not.toMatch(/—/);
    expect(g!.seoTitle).not.toMatch(/—/);
    expect(g!.excerpt).not.toMatch(/—/);
    for (const href of [
      '/destinations/tbilisi',
      '/destinations/lisbon',
      '/destinations/budapest',
      '/destinations/chiang-mai',
      '/destinations/medellin',
      '/destinations/mexico-city',
      '/destinations/bangkok',
      '/guides/living-in-chiang-mai',
      '/guides/living-in-bangkok',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-lisbon',
      '/guides/living-in-mexico-city',
      '/guides/living-in-medellin',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
  });

  it('publishes the Porto living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-porto');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Porto');
    expect(g!.seoTitle).toBe("Living in Porto 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Porto for remote workers in 2026: real monthly costs, Cedofeita vs Bonfim, D8 visa notes, 200 Mbps internet, top safety, and rainy-winter trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(155);
    expect(g!.relatedDestinations).toEqual(['porto', 'lisbon', 'barcelona', 'madrid', 'valencia']);
    expect(g!.content.toLowerCase()).toContain('living in porto as a digital nomad');
    expect(g!.content).toContain('$1,800');
    expect(g!.content).toContain('$1,400');
    expect(g!.content).toContain('$85');
    expect(g!.content).toContain('$400');
    expect(g!.content).toContain('200 Mbps');
    expect(g!.content).toContain('9.0');
    expect(g!.content).toContain('365');
    expect(g!.content).toContain('2 years');
    expect(g!.content).toContain('Lei 23/2007');
    expect(g!.content).toContain('780+');
    expect(g!.content).not.toMatch(/—|–/);
    expect(g!.content).not.toMatch(/little sister/i);
    expect(g!.content).not.toMatch(/porto-alegre|porto-santo/);
    expect(g!.content).not.toMatch(/2,?849|€|\bEUR\b/i);
    expect(g!.title).not.toMatch(/—|–/);
    expect(g!.seoTitle).not.toMatch(/—|–/);
    expect(g!.excerpt).not.toMatch(/—|–/);
    for (const href of [
      '/destinations/porto',
      '/destinations/lisbon',
      '/destinations/barcelona',
      '/destinations/madrid',
      '/destinations/valencia',
      '/destinations/budapest',
      '/guides/living-in-lisbon',
      '/guides/living-in-budapest',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-chiang-mai',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
    for (const heading of [
      'Is living in Porto worth it for digital nomads in 2026?',
      'Who Porto is for (and who should skip it)',
      'Real monthly cost bands: solo $1,800, long-term $1,400, Airbnb $85 a night',
      'Neighborhoods that work: Cedofeita, Bonfim, Baixa, Boavista, Foz and Matosinhos',
      'Internet, power, and coworking',
      'Visas and stay length: Schengen 90/180 vs the Portugal D8 (verify before you apply)',
      'Best months (May-Sep) vs rainy, damp winters (Nov-Feb)',
      'Daily life: food, the river, hills, metro, and a smaller community',
      'Porto vs Lisbon, Barcelona, Madrid, and Valencia',
      'First-week checklist and how to compare Porto on Nomad Spin',
    ]) {
      expect(g!.content).toContain(`## ${heading}`);
    }
  });

  it('publishes the Buenos Aires living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-buenos-aires');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Buenos Aires');
    expect(g!.seoTitle).toBe("Living in Buenos Aires 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Buenos Aires for remote workers in 2026: real monthly costs, Palermo vs Villa Crespo, visa notes, coworking, inflation, and honest safety trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(155);
    expect(g!.relatedDestinations).toEqual(['buenos-aires']);
    expect(g!.content).toContain('living in Buenos Aires as a digital nomad');
    expect(g!.content).toContain('$900');
    expect(g!.content).toContain('$650');
    expect(g!.content).toContain('$40');
    expect(g!.content).toContain('70 Mbps');
    expect(g!.content).toContain('6.2');
    expect(g!.content).toContain('Visa Exemption');
    expect(g!.content).toContain('90');
    expect(g!.content).toContain('UTC-3');
    expect(g!.content).toContain('Disposición 758/2022');
    expect(g!.content).toContain('argentina.gob.ar');
    expect(g!.content).not.toMatch(/—|–/);
    expect(g!.title).not.toMatch(/—|–/);
    expect(g!.seoTitle).not.toMatch(/—|–/);
    expect(g!.excerpt).not.toMatch(/—|–/);
    expect(g!.content).not.toMatch(/blue dollar|2,?849|TODO_|8092520|SafetyWing|Booking\.com|Skyscanner|\bFlatio\b|\bAiralo\b/i);
    for (const href of [
      '/destinations/buenos-aires',
      '/destinations/medellin',
      '/destinations/mexico-city',
      '/destinations/santiago',
      '/destinations/montevideo',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-chiang-mai',
      '/guides/living-in-medellin',
      '/guides/living-in-mexico-city',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '/guides/paraguay-tax-residency-remote-workers',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
    for (const heading of [
      'Is living in Buenos Aires still worth it for digital nomads in 2026?',
      'Who Buenos Aires is for (and who should skip it)',
      'Real monthly cost bands (solo $900, long-term $650, Airbnb $40/night) and why inflation makes these move',
      'Neighborhoods that work: Palermo (Soho / Hollywood), Villa Crespo / Chacarita, Recoleta, San Telmo, Almagro (trade-offs)',
      'Internet, power, and coworking for video-call work',
      'Visas and stay length: 90-day exemption vs Argentina digital nomad residence (verify official rules)',
      'Best months (Mar-May, Sep-Nov), rainy Jun-Jul, and summer heat',
      'Daily life: money and payments, steak and wine, tango, nightlife, Spanish, and safety habits',
      'Buenos Aires vs Medellin, Mexico City, Santiago, and Montevideo',
      'First-week checklist and how to compare Buenos Aires on Nomad Spin',
    ]) {
      expect(g!.content).toContain(`## ${heading}`);
    }
  });

  it('publishes the Barcelona living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-barcelona');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Barcelona');
    expect(g!.seoTitle).toBe("Living in Barcelona 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Barcelona for remote workers in 2026: real costs, Poblenou vs Gracia, Spain nomad visa notes, 300 Mbps internet, and rent and pickpocket trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(155);
    expect(g!.relatedDestinations).toEqual(['barcelona', 'valencia', 'madrid', 'lisbon', 'budapest']);
    expect(g!.content).toContain('living in Barcelona as a digital nomad');
    expect(g!.content).toContain('$2,500');
    expect(g!.content).toContain('$2,000');
    expect(g!.content).toContain('$130');
    expect(g!.content).toContain('300 Mbps');
    expect(g!.content).toContain('7.5');
    expect(g!.content).toContain('Digital Nomad Visa');
    expect(g!.content).toContain('365');
    expect(g!.content).toContain('UTC+1');
    expect(g!.content).toContain('200%');
    expect(g!.content).toContain('Ley 14/2013');
    expect(g!.content).not.toMatch(/2,?849|€|EUR\s*\d/i);
    expect(g!.content).not.toMatch(/—|–/);
    expect(g!.title).not.toMatch(/—|–/);
    expect(g!.seoTitle).not.toMatch(/—|–/);
    expect(g!.excerpt).not.toMatch(/—|–/);
    for (const href of [
      '/destinations/barcelona',
      '/destinations/valencia',
      '/destinations/madrid',
      '/destinations/lisbon',
      '/destinations/budapest',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-chiang-mai',
      '/guides/living-in-lisbon',
      '/guides/living-in-budapest',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
    for (const heading of [
      'Is living in Barcelona worth it for digital nomads in 2026?',
      'Who Barcelona is for (and who should skip it)',
      'Real monthly cost bands (solo $2,500, long-term $2,000, Airbnb $130/night) and the rental market',
      'Neighborhoods that work: Poblenou, Gracia, Eixample, Sant Antoni, Barceloneta, and El Born',
      'Internet, power, and coworking',
      "Visas and stay length: Schengen 90/180 vs Spain's telework visa (verify official rules)",
      'Best months: May, Jun, Sep, Oct, and the rainy and crowd months',
      'Daily life: beach, food, languages, metro, pickpockets, and noise',
      'If $2,500 does not fit: Barcelona vs Valencia, Madrid, Lisbon, and Budapest',
      'First-week checklist and how to compare Barcelona on Nomad Spin',
    ]) {
      expect(g!.content).toContain(`## ${heading}`);
    }
  });

  it('publishes the Valencia living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-valencia');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Valencia');
    expect(g!.seoTitle).toBe("Living in Valencia 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Valencia for remote workers in 2026: real monthly costs, Ruzafa vs Cabanyal, Spain nomad visa notes, 170 Mbps internet, and flooding trade-offs.'
    );
    expect(g!.excerpt.length).toBeLessThanOrEqual(155);
    expect(g!.relatedDestinations).toEqual(['valencia', 'barcelona', 'madrid', 'lisbon', 'porto']);
    expect(g!.content).toContain('living in Valencia as a digital nomad');
    expect(g!.content).toContain('$1,900');
    expect(g!.content).toContain('$1,425');
    expect(g!.content).toContain('$86');
    expect(g!.content).toContain('$2,580');
    expect(g!.content).toContain('170 Mbps');
    expect(g!.content).toContain('8.0');
    expect(g!.content).toContain('Digital Nomad Visa');
    expect(g!.content).toContain('365');
    expect(g!.content).toContain('UTC+1');
    expect(g!.content).toContain('200%');
    expect(g!.content).toContain('Ley 14/2013');
    expect(g!.content).toContain('art. 74 quinquies');
    expect(g!.content).toContain('October problem');
    expect(g!.content).toContain('780+');
    expect(g!.content).not.toMatch(/2,?849|€|\bEUR\b/i);
    expect(g!.content).not.toMatch(/—|–/);
    expect(g!.title).not.toMatch(/—|–/);
    expect(g!.seoTitle).not.toMatch(/—|–/);
    expect(g!.excerpt).not.toMatch(/—|–/);
    for (const href of [
      '/destinations/valencia',
      '/destinations/barcelona',
      '/destinations/madrid',
      '/destinations/lisbon',
      '/destinations/porto',
      '/guides/living-in-barcelona',
      '/guides/living-in-lisbon',
      '/guides/living-in-porto',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/living-in-chiang-mai',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
      '](/)',
    ]) {
      expect(g!.content).toContain(href);
    }
    for (const heading of [
      'Is living in Valencia worth it for digital nomads in 2026?',
      'Who Valencia is for (and who should skip it)',
      'Real monthly cost bands (solo $1,900, long-term $1,425, Airbnb $86/night)',
      'Neighborhoods that work: Ruzafa, El Carmen, Cabanyal, and Benimaclet',
      'Internet, power, and coworking for video-call work',
      "Visas and stay length: Schengen 90/180 vs Spain's telework visa (verify official rules)",
      'Best months and the October problem: rain, DANA and flood-aware housing',
      'Daily life: bikes and metro, paella and markets, Spanish basics, beach and city rhythm',
      'Valencia vs Barcelona, Madrid, Lisbon, and Porto',
      'First-week checklist and how to compare Valencia on Nomad Spin',
    ]) {
      expect(g!.content).toContain(`## ${heading}`);
    }
  });

  it('generated module is in sync with content/guides', () => {
    const generated = fs.readFileSync(
      path.resolve(__dirname, '../data/contentGuides.generated.ts'),
      'utf-8'
    );
    expect(generated).toBe(buildContentGuidesModule().source);
  });
});
