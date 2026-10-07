import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { guides } from '@/data/guides';
import { allCitySlugs } from '@/lib/citySlug';
import { buildNotFoundHtml, NOT_FOUND_LINKS, NOT_FOUND_TITLE } from '../../scripts/not-found-page';

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

function rewritePattern(): RegExp {
  const source = config.rewrites?.[0]?.source;
  expect(source).toBeTruthy();
  return new RegExp(`^${source}$`);
}

describe('vercel.json unknown slug 404s', () => {
  it('keeps one SPA rewrite that skips prerendered guide and destination trees', () => {
    expect(config.rewrites).toEqual([
      {
        source: '/((?!assets/|guides/|destinations/).*)',
        destination: '/index.html',
      },
    ]);

    const rewrite = rewritePattern();
    const misses = [
      '/guides/living-in-lisbon',
      '/guides/living-in-not-a-real-city-xyz',
      '/guides/living-in-saigon',
      '/destinations/lisbon',
      '/destinations/not-a-real-city-xyz',
      '/destinations/saigon',
      '/assets/index.js',
    ];
    for (const pathname of misses) {
      expect(rewrite.test(pathname), pathname).toBe(false);
    }

    const spaFallback = ['/', '/about', '/contact', '/privacy-policy', '/terms-of-use', '/guides', '/spin-only'];
    for (const pathname of spaFallback) {
      expect(rewrite.test(pathname), pathname).toBe(true);
    }
  });

  it('301s Ho Chi Minh City aliases and leaves guide aliases alone until that guide exists', () => {
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
    expect(guideExists).toBe(false);
    for (const source of GUIDE_ALIASES) {
      expect(bySource.has(source), source).toBe(false);
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
  });
});
