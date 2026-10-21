import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { guides } from '@/data/guides';
import { allCitySlugs } from '@/lib/citySlug';
import { buildNotFoundHtml, NOT_FOUND_LINKS, NOT_FOUND_NAV, NOT_FOUND_TITLE } from '../../scripts/not-found-page';

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

const vercelPath = path.resolve(__dirname, '../../vercel.json');
const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8')) as VercelConfig;
const vercelSource = fs.readFileSync(vercelPath, 'utf8');

const HCMC_DESTINATION = '/destinations/ho-chi-minh-city';
const DESTINATION_ALIASES = ['/destinations/saigon', '/destinations/hcmc', '/destinations/ho-chi-minh'] as const;
const GUIDE_ALIASES = ['/guides/living-in-saigon', '/guides/living-in-hcmc', '/guides/living-in-ho-chi-minh'] as const;
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
const HCMC_GUIDE_SLUG = 'living-in-ho-chi-minh-city';
const KUALA_LUMPUR_GUIDE_ALIASES = [
  '/guides/kuala-lumpur',
  '/guides/kuala-lumpur-digital-nomad-guide-2026',
  '/guides/kuala-lumpur-digital-nomad-guide-cost-living-visas',
  '/guides/kuala-lumpur-digital-nomad-guide-costs-visas',
  '/guides/kuala-lumpur-digital-nomad-guide-remote-work',
] as const;
const KUALA_LUMPUR_GUIDE_SLUG = 'living-in-kuala-lumpur';

/** Exact paths that may fall back to the homepage shell. Everything else is a file or a 404. */
const SPA_FALLBACK_PATHS = [
  '/',
  '/about',
  '/about/',
  '/contact',
  '/contact/',
  '/privacy-policy',
  '/privacy-policy/',
  '/terms-of-use',
  '/terms-of-use/',
  '/guides',
  '/guides/',
  '/destinations',
  '/destinations/',
] as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rewriteMatches(pathname: string): boolean {
  return (config.rewrites ?? []).some((rule) => new RegExp(`^${escapeRegex(rule.source)}$`).test(pathname));
}

describe('vercel.json unknown slug 404s', () => {
  it('allowlists SPA fallbacks and leaves unknown paths, files, and slug trees alone', () => {
    expect(config.rewrites).toEqual(
      SPA_FALLBACK_PATHS.map((source) => ({ source, destination: '/index.html' })),
    );

    for (const pathname of SPA_FALLBACK_PATHS) {
      expect(rewriteMatches(pathname), pathname).toBe(true);
    }

    const misses = [
      '/zzz-random-xyz',
      '/spin-only',
      '/about/extra',
      '/guides/living-in-lisbon',
      '/guides/living-in-not-a-real-city-xyz',
      '/guides/living-in-saigon',
      ...SPLIT_GUIDE_ALIASES,
      ...TIRANA_GUIDE_ALIASES,
      ...PENANG_GUIDE_ALIASES,
      ...KOTOR_GUIDE_ALIASES,
      ...PLAYA_GUIDE_ALIASES,
      '/destinations/lisbon',
      '/destinations/tbilisi-suburbs',
      '/destinations/not-a-real-city-xyz',
      '/destinations/saigon',
      '/destinations/medellín',
      '/assets/index.js',
      '/sitemap.xml',
      '/robots.txt',
      '/llms.txt',
      '/favicon.ico',
      '/og-preview.png',
      '/api/health',
    ];
    for (const pathname of misses) {
      expect(rewriteMatches(pathname), pathname).toBe(false);
    }
  });

  it('301s Ho Chi Minh City destination and guide aliases to the canonical slugs', () => {
    const redirects = config.redirects ?? [];
    const bySource = new Map(redirects.map((rule) => [rule.source, rule]));
    const canonicalSlugs = new Set(allCitySlugs().map(({ slug }) => slug));

    expect(canonicalSlugs.has('ho-chi-minh-city')).toBe(true);
    for (const source of DESTINATION_ALIASES) {
      const alias = source.slice('/destinations/'.length);
      expect(canonicalSlugs.has(alias), alias).toBe(false);
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe(HCMC_DESTINATION);
      expect(rule?.statusCode).toBe(301);
      expect(rule?.permanent).toBeUndefined();
    }

    const guideExists = guides.some((guide) => guide.slug === HCMC_GUIDE_SLUG);
    expect(guideExists).toBe(true);
    for (const source of GUIDE_ALIASES) {
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe(`/guides/${HCMC_GUIDE_SLUG}`);
      expect(rule?.statusCode).toBe(301);
      expect(rule?.permanent).toBeUndefined();
    }

    expect(guides.some((guide) => guide.slug === KUALA_LUMPUR_GUIDE_SLUG)).toBe(true);
    for (const source of KUALA_LUMPUR_GUIDE_ALIASES) {
      expect(guides.some((guide) => `/guides/${guide.slug}` === source), source).toBe(false);
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe(`/guides/${KUALA_LUMPUR_GUIDE_SLUG}`);
      expect(rule?.statusCode).toBe(301);
      expect(rule?.permanent).toBeUndefined();
      expect(rewriteMatches(source), source).toBe(false);
    }

    const guidePaths = new Set(guides.map((guide) => `/guides/${guide.slug}`));
    expect(guidePaths.has('/guides/living-in-split')).toBe(true);
    for (const source of SPLIT_GUIDE_ALIASES) {
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe('/guides/living-in-split');
      expect(rule?.statusCode).toBe(301);
      expect(rule?.permanent).toBeUndefined();
      expect(guidePaths.has(source), source).toBe(false);
    }
    expect(guides.some((guide) => guide.slug === 'living-in-tirana')).toBe(true);
    for (const source of TIRANA_GUIDE_ALIASES) {
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe('/guides/living-in-tirana');
      expect(rule?.statusCode).toBe(301);
      expect(rule?.permanent).toBeUndefined();
      expect(guides.some((guide) => `/guides/${guide.slug}` === source), source).toBe(false);
    }
    expect(guides.some((guide) => guide.slug === 'living-in-penang')).toBe(true);
    for (const source of PENANG_GUIDE_ALIASES) {
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe('/guides/living-in-penang');
      expect(rule?.statusCode).toBe(301);
      expect(rule?.permanent).toBeUndefined();
      expect(guides.some((guide) => `/guides/${guide.slug}` === source), source).toBe(false);
      expect(rewriteMatches(source), source).toBe(false);
    }
    expect(guides.some((guide) => guide.slug === 'living-in-kotor')).toBe(true);
    for (const source of KOTOR_GUIDE_ALIASES) {
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe('/guides/living-in-kotor');
      expect(rule?.statusCode).toBe(301);
      expect(rule?.permanent).toBeUndefined();
      expect(guides.some((guide) => `/guides/${guide.slug}` === source), source).toBe(false);
    }
    expect(guides.some((guide) => guide.slug === 'living-in-playa-del-carmen')).toBe(true);
    for (const source of PLAYA_GUIDE_ALIASES) {
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe('/guides/living-in-playa-del-carmen');
      expect(rule?.statusCode).toBe(301);
      expect(rule?.permanent).toBeUndefined();
      expect(guides.some((guide) => `/guides/${guide.slug}` === source), source).toBe(false);
    }

    expect(redirects.every((rule) => rule.statusCode === 301 && rule.permanent === undefined)).toBe(true);
    expect(vercelSource.indexOf('"redirects"')).toBeGreaterThan(-1);
    expect(vercelSource.indexOf('"redirects"')).toBeLessThan(vercelSource.indexOf('"rewrites"'));
  });

  it('builds a noindex 404 page that is not the homepage shell', () => {
    const generator = fs.readFileSync(path.resolve(__dirname, '../../scripts/generate-seo-pages.ts'), 'utf8');
    expect(generator).toContain('buildNotFoundHtml()');
    expect(generator).not.toContain("copyFileSync(indexHtmlPath, path.join(distDir, '404.html'))");

    const html = buildNotFoundHtml();
    expect(html).toContain(`<title>${NOT_FOUND_TITLE}</title>`);
    expect(html).toContain('<meta name="robots" content="noindex, follow" />');
    expect(html).not.toMatch(/rel=["']canonical["']/);
    expect(html).not.toContain('Spin the Globe');
    expect(html).not.toContain('id="root"');
    expect(html).not.toContain('\u2014');
    expect(html).not.toContain('\u2013');

    for (const link of NOT_FOUND_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
    }
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/guides"');
    expect(html).toContain('href="/destinations/lisbon"');
    expect(html).toContain('<header>');
    expect(html).toContain('aria-label="Site"');
    for (const link of NOT_FOUND_NAV) {
      expect(html).toContain(`<a href="${link.href}">${link.label}</a>`);
    }

    const published = fs.readFileSync(path.resolve(__dirname, '../../public/404.html'), 'utf8');
    expect(published).toBe(html);
  });
});
