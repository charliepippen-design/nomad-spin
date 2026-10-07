import { describe, it, expect } from 'vitest';
import { cities } from '@/data/cities';
import { citySlug } from '@/lib/citySlug';
import {
  destinationIntro,
  destinationMetaDescription,
  destinationJsonLd,
  relatedGuidesForCity,
  formatMonths,
} from '@/lib/destinationSeo';

function cityByName(name: string) {
  const c = cities.find((x) => x.name === name);
  if (!c) throw new Error(`missing ${name}`);
  return c;
}

describe('destinationSeo', () => {
  it('builds a deterministic intro from city fields', () => {
    const lisbon = cityByName('Lisbon');
    const a = destinationIntro(lisbon);
    const b = destinationIntro(lisbon);
    expect(a).toBe(b);
    expect(a).toContain('Lisbon');
    expect(a).toContain(`$${lisbon.costUSD}`);
    expect(a).toContain(`${lisbon.internetMbps} Mbps`);
    expect(a).toMatch(/safety score of/);
    for (const m of lisbon.weather.bestMonths) expect(a).toContain(m);
  });

  it('keeps meta descriptions short and field-based', () => {
    const medellin = cityByName('Medellín');
    const d = destinationMetaDescription(medellin);
    expect(d.length).toBeGreaterThan(40);
    expect(d.length).toBeLessThanOrEqual(160);
    expect(d).toContain('Medellín');
    expect(d).toContain(`$${medellin.costUSD}`);
  });

  it('emits TouristDestination + Place JSON-LD with cost/internet/safety', () => {
    const canggu = cityByName('Canggu');
    const url = `https://www.digitalnomadspin.com/destinations/${citySlug(canggu)}`;
    const ld = destinationJsonLd(canggu, url);
    expect(ld['@type']).toEqual(['TouristDestination', 'Place']);
    expect(ld.url).toBe(url);
    const props = ld.additionalProperty as { name: string; value: string | number }[];
    expect(props.some((p) => p.name === 'Monthly cost (USD)' && p.value === canggu.costUSD)).toBe(true);
    expect(props.some((p) => p.name === 'Internet Mbps' && p.value === canggu.internetMbps)).toBe(true);
    expect(props.some((p) => p.name === 'Best months')).toBe(true);
  });

  it('links Bali/Canggu to living-in-bali and Medellín to season guide', () => {
    const baliGuides = relatedGuidesForCity(cityByName('Bali')).map((g) => g.slug);
    expect(baliGuides).toContain('living-in-bali');
    expect(baliGuides).toContain('where-to-go-next-by-season');

    const cangguGuides = relatedGuidesForCity(cityByName('Canggu')).map((g) => g.slug);
    expect(cangguGuides).toContain('living-in-bali');

    const medGuides = relatedGuidesForCity(cityByName('Medellín')).map((g) => g.slug);
    expect(medGuides).toContain('where-to-go-next-by-season');

    const lisbonGuides = relatedGuidesForCity(cityByName('Lisbon')).map((g) => g.slug);
    expect(lisbonGuides).toContain('living-in-lisbon');
    expect(lisbonGuides).toContain('how-to-choose-next-nomad-base');
    expect(lisbonGuides).toContain('where-to-go-next-by-season');

    const chiangMaiGuides = relatedGuidesForCity(cityByName('Chiang Mai')).map((g) => g.slug);
    expect(chiangMaiGuides).toContain('living-in-chiang-mai');
    expect(chiangMaiGuides).toContain('where-to-go-next-by-season');
    expect(chiangMaiGuides).toContain('how-to-choose-next-nomad-base');
  });

  it('formats months stably', () => {
    expect(formatMonths(['Nov', 'Dec'])).toBe('Nov, Dec');
    expect(formatMonths([])).toBe('');
  });
});
