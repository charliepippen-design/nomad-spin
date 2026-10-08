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
const HCMC_GUIDE_SLUG = 'living-in-ho-chi-minh-city';

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
