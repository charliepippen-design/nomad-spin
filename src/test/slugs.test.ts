import { describe, it, expect } from 'vitest';
import { cities } from '@/data/cities';
import { slugify } from '@/lib/slugify';
import { allCitySlugs, citySlug, findCityBySlug } from '@/lib/citySlug';

describe('slugify', () => {
  it('folds accents to ASCII', () => {
    expect(slugify('Medellín')).toBe('medellin');
    expect(slugify('São Paulo')).toBe('sao-paulo');
    expect(slugify('Asunción')).toBe('asuncion');
    expect(slugify('İzmir')).toBe('izmir');
    expect(slugify('Tórshavn (Faroe Islands)')).toBe('torshavn-faroe-islands');
    expect(slugify('Tromsø')).toBe('tromso');
  });
});

describe('city slugs', () => {
  it('gives every city a unique, URL-safe slug', () => {
    const all = allCitySlugs();
    expect(all.length).toBe(new Set(cities.map((c) => c.id)).size);
    const slugs = all.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('has no duplicate city ids', () => {
    const ids = cities.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('disambiguates same-name cities by country', () => {
    const granadaEs = cities.find((c) => c.id === 'granada-es')!;
    expect(citySlug(granadaEs)).toBe('granada-spain');
    expect(findCityBySlug('granada-spain')?.city.id).toBe('granada-es');
  });

  it('redirects legacy slugs to the canonical one', () => {
    expect(findCityBySlug('medell-n')).toMatchObject({ canonicalSlug: 'medellin' });
    expect(findCityBySlug('granada')?.canonicalSlug).toMatch(/^granada-/);
    expect(findCityBySlug('lisbon')).toMatchObject({ canonicalSlug: 'lisbon' });
    expect(findCityBySlug('not-a-real-city')).toBeNull();
  });
});
