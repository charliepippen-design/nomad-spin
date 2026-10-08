import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { cities } from '@/data/cities';
import { guides } from '@/data/guides';
import { citySlug } from '@/lib/citySlug';
import {
  destinationFieldGuideHtml,
  hubRelatedGuides,
  livingGuideForCity,
} from '@/lib/destinationSeo';

const LIVING_SLUGS = [
  'living-in-bali',
  'living-in-cape-town',
  'living-in-chiang-mai',
  'living-in-mexico-city',
  'living-in-lisbon',
  'living-in-medellin',
  'living-in-bangkok',
  'living-in-tbilisi',
  'living-in-da-nang',
  'living-in-buenos-aires',
  'living-in-budapest',
  'living-in-porto',
  'living-in-barcelona',
  'living-in-valencia',
  'living-in-prague',
  'living-in-ho-chi-minh-city',
  'living-in-madrid',
] as const;

const guideSlugSet = new Set(guides.map((guide) => guide.slug));
const destinationSlugSet = new Set(cities.map((city) => citySlug(city)));

function cityForLivingSlug(slug: string) {
  const destinationSlug = slug.replace(/^living-in-/, '');
  const city = cities.find((item) => citySlug(item) === destinationSlug);
  if (!city) throw new Error(`missing city for ${slug}`);
  return city;
}

/** Copy before the second heading. That is the opening of the guide. */
function openingSection(content: string): string {
  const marks = [...content.matchAll(/^## /gm)];
  if (marks.length < 2 || marks[1].index == null) return content;
  return content.slice(0, marks[1].index);
}

function linkedSlugs(content: string, section: 'guides' | 'destinations'): string[] {
  const pattern = new RegExp(`(?:href="|\\]\\()\\/${section}\\/([a-z0-9-]+)`, 'g');
  return [...content.matchAll(pattern)].map((match) => match[1]);
}

describe('living guide and destination hub links', () => {
  it('covers the published living guides', () => {
    const published = guides.filter((guide) => guide.slug.startsWith('living-in-')).map((guide) => guide.slug);
    expect(published.sort()).toEqual([...LIVING_SLUGS].sort());
  });

  it('links each living guide to its own hub in the opening, and to at least two other living guides', () => {
    for (const slug of LIVING_SLUGS) {
      const guide = guides.find((item) => item.slug === slug);
      expect(guide, slug).toBeTruthy();
      const destinationSlug = slug.replace(/^living-in-/, '');
      expect(openingSection(guide!.content)).toContain(`/destinations/${destinationSlug}`);

      const peers = [...new Set(linkedSlugs(guide!.content, 'guides'))].filter(
        (linked) => linked.startsWith('living-in-') && linked !== slug,
      );
      expect(peers.length, slug).toBeGreaterThanOrEqual(2);
      for (const peer of peers) expect(guideSlugSet.has(peer), `${slug} -> ${peer}`).toBe(true);
    }
  });

  it('links each living-guide hub to that guide and to 2 to 4 peer living guides', () => {
    for (const slug of LIVING_SLUGS) {
      const city = cityForLivingSlug(slug);
      expect(livingGuideForCity(city)?.slug).toBe(slug);

      const fieldGuide = destinationFieldGuideHtml(city);
      expect(fieldGuide).toContain(`href="/guides/${slug}"`);
      expect(fieldGuide).toContain('<h2>Field guide</h2>');
      expect(fieldGuide).not.toMatch(/\u2014|\u2013/);

      const related = hubRelatedGuides(city);
      const peers = related.filter((guide) => guide.slug.startsWith('living-in-') && guide.slug !== slug);
      expect(peers.length, city.name).toBeGreaterThanOrEqual(2);
      expect(peers.length, city.name).toBeLessThanOrEqual(4);
      for (const peer of peers) expect(guideSlugSet.has(peer.slug)).toBe(true);

      const htmlPeers = peers.map((guide) => `/guides/${guide.slug}`);
      expect(new Set(htmlPeers).size).toBe(peers.length);
    }
  });

  it('does not invent a field guide link for a city without a living guide', () => {
    const tokyo = cities.find((city) => city.name === 'Tokyo');
    expect(tokyo).toBeTruthy();
    expect(livingGuideForCity(tokyo!)).toBeNull();
    expect(destinationFieldGuideHtml(tokyo!)).toBe('');
  });

  it('does not point an internal guide or destination link at a missing page', () => {
    for (const guide of guides) {
      for (const linked of linkedSlugs(guide.content, 'guides')) {
        expect(guideSlugSet.has(linked), `${guide.slug} -> /guides/${linked}`).toBe(true);
      }
      for (const linked of linkedSlugs(guide.content, 'destinations')) {
        expect(destinationSlugSet.has(linked), `${guide.slug} -> /destinations/${linked}`).toBe(true);
      }
    }
  });

  it('uses the same helpers in the client page and the prerender script', () => {
    const page = fs.readFileSync(path.resolve(__dirname, '../pages/DestinationGuide.tsx'), 'utf8');
    const prerender = fs.readFileSync(path.resolve(__dirname, '../lib/destinationPrerender.ts'), 'utf8');
    const generator = fs.readFileSync(path.resolve(__dirname, '../../scripts/generate-seo-pages.ts'), 'utf8');
    expect(page).toContain('livingGuideForCity');
    expect(page).toContain('hubRelatedGuides');
    expect(prerender).toContain('destinationFieldGuideHtml');
    expect(prerender).toContain('hubRelatedGuides');
    expect(prerender).toContain('${fieldGuideHtml}');
    expect(generator).toContain('destinationBodyHtml');
  });
});
