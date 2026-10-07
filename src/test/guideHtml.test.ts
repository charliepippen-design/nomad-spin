import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { editorialGuideForDestination, guides } from '@/data/guides';
import { guideBodyHtml } from '@/lib/guideHtml';
import { allCitySlugs } from '@/lib/citySlug';

describe('guide prerender body', () => {
  it('includes the Chiang Mai article body, not only the excerpt', () => {
    const guide = guides.find((item) => item.slug === 'living-in-chiang-mai');
    expect(guide).toBeTruthy();
    const html = guideBodyHtml(guide!);
    expect(html).toContain('<h1>The Ultimate Guide to Living in Chiang Mai</h1>');
    expect(html).toContain('<h2>Is Chiang Mai still worth it for digital nomads in 2026?</h2>');
    expect(html).toContain('Santitham');
    expect(html).toContain('href="/destinations/chiang-mai"');
    expect(html).not.toContain('Open the full guide');
    expect(html).not.toContain('—');
  });
});

describe('editorial guide lookup', () => {
  it('prefers the living guide when a destination has one', () => {
    expect(editorialGuideForDestination('chiang-mai')?.slug).toBe('living-in-chiang-mai');
    expect(editorialGuideForDestination('lisbon')?.slug).toBe('living-in-lisbon');
    expect(editorialGuideForDestination('barcelona')?.slug).toBe('living-in-barcelona');
    expect(editorialGuideForDestination('budapest')?.slug).toBe('living-in-budapest');
    expect(editorialGuideForDestination('porto')?.slug).toBe('living-in-porto');
    expect(editorialGuideForDestination('valencia')?.slug).toBe('living-in-valencia');
    expect(editorialGuideForDestination('madrid')?.slug).toBe('living-in-madrid');
  });

  it('returns null when no guide names the city', () => {
    const linked = new Set(guides.flatMap((guide) => guide.relatedDestinations ?? []));
    const unlinked = allCitySlugs().find(({ slug }) => !linked.has(slug));
    expect(unlinked).toBeTruthy();
    expect(editorialGuideForDestination(unlinked!.slug)).toBeNull();
  });
});

describe('sitemap destinations index', () => {
  it('lists /destinations without replacing city URLs', () => {
    const xml = fs.readFileSync(path.resolve(__dirname, '../../public/sitemap.xml'), 'utf8');
    expect(xml).toContain('<loc>https://www.digitalnomadspin.com/destinations</loc>');
    expect(xml).toContain('<loc>https://www.digitalnomadspin.com/destinations/chiang-mai</loc>');
  });
});
