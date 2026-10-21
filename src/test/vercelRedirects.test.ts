import { describe, expect, it } from 'vitest';
import vercelJson from '../../vercel.json?raw';
import { guides } from '@/data/guides';
import { accentSlugRedirects, legacySlugRedirects, serverSlugRedirects } from '@/lib/citySlug';
import { OLD_DRAFT_GUIDE_REDIRECTS } from './fixtures/oldDraftGuideRedirects';

type RedirectRule = {
  source: string;
  destination: string;
  statusCode?: number;
  permanent?: boolean;
};

type VercelConfig = {
  redirects?: RedirectRule[];
  rewrites?: { source: string; destination: string }[];
};

const config = JSON.parse(vercelJson) as VercelConfig;

const KUALA_LUMPUR_GUIDE_ALIASES = [
  '/guides/kuala-lumpur',
  '/guides/kuala-lumpur-digital-nomad-guide-2026',
  '/guides/kuala-lumpur-digital-nomad-guide-cost-living-visas',
  '/guides/kuala-lumpur-digital-nomad-guide-costs-visas',
  '/guides/kuala-lumpur-digital-nomad-guide-remote-work',
] as const;

const SPLIT_GUIDE_ALIASES = [
  '/guides/split',
  '/guides/split-croatia-digital-nomad-guide',
  '/guides/split-croatia-digital-nomad-guide-2026',
  '/guides/split-croatia-digital-nomad-guide-2026-v2',
  '/guides/split-croatia-digital-nomad-guide-remote-work',
] as const;

const TIRANA_GUIDE_ALIASES = [
  '/guides/digital-nomad-guide-tirana-albania-remote-work',
  '/guides/tirana',
  '/guides/tirana-digital-nomad-guide-costs-visas',
  '/guides/tirana-digital-nomad-guide-costs-visas-coworking',
  '/guides/tirana-digital-nomad-guide-costs-visas-living',
] as const;

const PENANG_GUIDE_ALIASES = [
  '/guides/penang',
  '/guides/penang-digital-nomad-guide-costs-visas-coworking',
  '/guides/penang-digital-nomad-guide-george-town',
  '/guides/penang-digital-nomad-guide-george-town-2026',
  '/guides/the-ultimate-guide-to-living-in-penang',
] as const;
const KOTOR_GUIDE_ALIASES = [
  '/guides/kotor',
  '/guides/kotor-digital-nomad-guide-costs-visas-coworking',
  '/guides/kotor-digital-nomad-guide-costs-visas-where-to-live',
  '/guides/kotor-digital-nomad-guide-living-working-montenegro',
] as const;

const PLAYA_GUIDE_ALIASES = [
  '/guides/playa-del-carmen',
  '/guides/playa-del-carmen-digital-nomad-guide',
  '/guides/playa-del-carmen-digital-nomad-guide-2026',
  '/guides/playa-del-carmen-nomad-guide-cost-visa-coworking',
] as const;

function destinationPath(slug: string): string {
  return `/destinations/${slug}`;
}

function expect301(bySource: Map<string, RedirectRule>, source: string, destination: string) {
  const rule = bySource.get(source);
  expect(rule, `missing redirect for ${source}`).toBeDefined();
  expect(rule?.destination).toBe(destination);
  expect(rule?.statusCode).toBe(301);
  expect(rule?.permanent).toBeUndefined();
}

describe('vercel.json legacy accent redirects', () => {
  const redirects = config.redirects ?? [];
  const bySource = new Map(redirects.map((rule) => [rule.source, rule]));

  it('301s every legacy map entry to its canonical destination path', () => {
    const entries = legacySlugRedirects();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries).toEqual(
      expect.arrayContaining([
        { legacySlug: 'medell-n', canonicalSlug: 'medellin' },
        { legacySlug: 's-o-paulo', canonicalSlug: 'sao-paulo' },
        { legacySlug: 'bogot', canonicalSlug: 'bogota' },
        { legacySlug: 'granada', canonicalSlug: 'granada-nicaragua' },
      ]),
    );

    for (const { legacySlug, canonicalSlug } of entries) {
      const source = destinationPath(legacySlug);
      const destination = destinationPath(canonicalSlug);
      const encodedSource = `/destinations/${encodeURIComponent(legacySlug)}`;

      expect301(bySource, source, destination);
      if (encodedSource !== source) expect301(bySource, encodedSource, destination);
    }
  });

  it('301s raw accented slugs and their percent-encoded forms', () => {
    const entries = accentSlugRedirects();

    expect(entries).toEqual(
      expect.arrayContaining([
        { slug: 'medellín', canonicalSlug: 'medellin' },
        { slug: 'bogotá', canonicalSlug: 'bogota' },
        { slug: 'são-paulo', canonicalSlug: 'sao-paulo' },
      ]),
    );

    for (const { slug, canonicalSlug } of entries) {
      const destination = destinationPath(canonicalSlug);
      expect301(bySource, destinationPath(slug), destination);
      const encoded = `/destinations/${encodeURIComponent(slug)}`;
      expect(encoded).not.toBe(destinationPath(slug));
      expect301(bySource, encoded, destination);
    }
  });

  it('lists the generated server redirects, Ho Chi Minh City aliases and old draft guide slugs', () => {
    const expected = serverSlugRedirects();
    const aliases = [
      { source: '/destinations/saigon', destination: '/destinations/ho-chi-minh-city' },
      { source: '/destinations/hcmc', destination: '/destinations/ho-chi-minh-city' },
      { source: '/destinations/ho-chi-minh', destination: '/destinations/ho-chi-minh-city' },
      { source: '/guides/living-in-saigon', destination: '/guides/living-in-ho-chi-minh-city' },
      { source: '/guides/living-in-hcmc', destination: '/guides/living-in-ho-chi-minh-city' },
      { source: '/guides/living-in-ho-chi-minh', destination: '/guides/living-in-ho-chi-minh-city' },
      ...KUALA_LUMPUR_GUIDE_ALIASES.map((source) => ({ source, destination: '/guides/living-in-kuala-lumpur' })),
      ...SPLIT_GUIDE_ALIASES.map((source) => ({ source, destination: '/guides/living-in-split' })),
      ...TIRANA_GUIDE_ALIASES.map((source) => ({ source, destination: '/guides/living-in-tirana' })),
      ...PENANG_GUIDE_ALIASES.map((source) => ({ source, destination: '/guides/living-in-penang' })),
      ...KOTOR_GUIDE_ALIASES.map((source) => ({ source, destination: '/guides/living-in-kotor' })),
      ...PLAYA_GUIDE_ALIASES.map((source) => ({ source, destination: '/guides/living-in-playa-del-carmen' })),
    ];
    const oldDraftCount = Object.values(OLD_DRAFT_GUIDE_REDIRECTS).flat().length;
    expect(oldDraftCount).toBe(48);
    expect(redirects).toHaveLength(expected.length + aliases.length + oldDraftCount);
    for (const rule of expected) expect301(bySource, rule.source, rule.destination);
    for (const rule of aliases) expect301(bySource, rule.source, rule.destination);
  });

  it('301s old Split guide URLs to the living-in-split guide', () => {
    const guidePaths = new Set(guides.map((guide) => `/guides/${guide.slug}`));
    expect(guidePaths.has('/guides/living-in-split')).toBe(true);
    for (const source of SPLIT_GUIDE_ALIASES) {
      expect301(bySource, source, '/guides/living-in-split');
      expect(guidePaths.has(source), source).toBe(false);
    }
  });

  it('301s old Kotor guide URLs to the living-in-kotor guide', () => {
    const guidePaths = new Set(guides.map((guide) => `/guides/${guide.slug}`));
    expect(guidePaths.has('/guides/living-in-kotor')).toBe(true);
    for (const source of KOTOR_GUIDE_ALIASES) {
      expect301(bySource, source, '/guides/living-in-kotor');
      expect(guidePaths.has(source), source).toBe(false);
    }
  });

  it('301s old Playa del Carmen guide URLs to the living-in-playa-del-carmen guide', () => {
    const guidePaths = new Set(guides.map((guide) => `/guides/${guide.slug}`));
    expect(guidePaths.has('/guides/living-in-playa-del-carmen')).toBe(true);
    for (const source of PLAYA_GUIDE_ALIASES) {
      expect301(bySource, source, '/guides/living-in-playa-del-carmen');
      expect(guidePaths.has(source), source).toBe(false);
    }
  });

  it('declares redirects before the allowlisted SPA rewrites', () => {
    const redirectsAt = vercelJson.indexOf('"redirects"');
    const rewritesAt = vercelJson.indexOf('"rewrites"');
    expect(redirectsAt).toBeGreaterThan(-1);
    expect(rewritesAt).toBeGreaterThan(redirectsAt);
    // Guide and destination slugs are filesystem-only. Misses fall through to 404.html.
    const sources = (config.rewrites ?? []).map((rule) => rule.source);
    expect(sources).toContain('/');
    expect(sources).toContain('/guides');
    expect(sources).toContain('/destinations');
    expect(sources).not.toContain('/((?!assets/|guides/|destinations/).*)');
    expect(config.rewrites?.every((rule) => rule.destination === '/index.html')).toBe(true);
  });
});
