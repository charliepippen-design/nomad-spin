import { describe, expect, it } from 'vitest';
import vercelJson from '../../vercel.json?raw';
import { accentSlugRedirects, legacySlugRedirects, serverSlugRedirects } from '@/lib/citySlug';

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

  it('lists the generated server redirects plus Ho Chi Minh City aliases', () => {
    const expected = serverSlugRedirects();
    const aliases = [
      { source: '/destinations/saigon', destination: '/destinations/ho-chi-minh-city' },
      { source: '/destinations/hcmc', destination: '/destinations/ho-chi-minh-city' },
      { source: '/destinations/ho-chi-minh', destination: '/destinations/ho-chi-minh-city' },
    ];
    expect(redirects).toHaveLength(expected.length + aliases.length);
    for (const rule of expected) expect301(bySource, rule.source, rule.destination);
    for (const rule of aliases) expect301(bySource, rule.source, rule.destination);
  });

  it('declares redirects before the SPA catch-all rewrite', () => {
    const redirectsAt = vercelJson.indexOf('"redirects"');
    const rewritesAt = vercelJson.indexOf('"rewrites"');
    expect(redirectsAt).toBeGreaterThan(-1);
    expect(rewritesAt).toBeGreaterThan(redirectsAt);
    // Guide and destination slugs are filesystem-only. Misses fall through to 404.html.
    expect(config.rewrites).toEqual([
      { source: '/((?!assets/|guides/|destinations/).*)', destination: '/index.html' },
    ]);
  });
});
