import { describe, expect, it } from 'vitest';
import vercelJson from '../../vercel.json?raw';
import { OLD_DRAFT_GUIDE_REDIRECTS } from './fixtures/oldDraftGuideRedirects';

type RedirectRule = { source: string; destination: string; statusCode?: number; permanent?: boolean };

const redirects = (JSON.parse(vercelJson) as { redirects?: RedirectRule[] }).redirects ?? [];
const bySource = new Map(redirects.map((rule) => [rule.source, rule]));
const entries = Object.entries(OLD_DRAFT_GUIDE_REDIRECTS).flatMap(([destination, sources]) =>
  sources.map((source) => ({ source, destination })),
);

describe('vercel.json old draft guide redirects', () => {
  it('covers 48 old draft slugs across the 7 live guide cities', () => {
    expect(Object.keys(OLD_DRAFT_GUIDE_REDIRECTS)).toHaveLength(7);
    expect(entries).toHaveLength(48);
    expect(new Set(entries.map((e) => e.source)).size).toBe(48);
  });

  it('301s every old draft slug to its live guide', () => {
    for (const { source, destination } of entries) {
      const rule = bySource.get(source);
      expect(rule, `missing redirect for ${source}`).toBeDefined();
      expect(rule?.destination).toBe(destination);
      expect(rule?.statusCode).toBe(301);
      expect(rule?.permanent).toBeUndefined();
    }
  });

  it('never redirects a live guide slug or chains to another redirect', () => {
    const destinations = new Set(entries.map((e) => e.destination));
    for (const { source } of entries) expect(destinations.has(source)).toBe(false);
    for (const destination of destinations) expect(bySource.has(destination)).toBe(false);
  });

  it('has no duplicate redirect sources in vercel.json', () => {
    expect(bySource.size).toBe(redirects.length);
  });
});
