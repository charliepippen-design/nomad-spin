import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { guides } from '@/data/guides';
import { allCitySlugs, findCityBySlug } from '@/lib/citySlug';
import { destinationBodyHtml } from '@/lib/destinationPrerender';
import { guideBodyHtml } from '@/lib/guideHtml';
import { citiesByRegion } from '@/lib/destinationIndex';
import {
  SUB_AREA_ROBOTS,
  canonicalDestinationPath,
  destinationRobotsContent,
  insertRobotsMeta,
  listSubAreaDestinations,
  subAreaParentNoticeHtml,
} from '@/lib/subAreaDestinations';

const sitemapPath = path.resolve(__dirname, '../../public/sitemap.xml');
const llmsPath = path.resolve(__dirname, '../../public/llms.txt');
const BASE = 'https://www.digitalnomadspin.com';

function loc(pathname: string): string {
  return `<loc>${BASE}${pathname}</loc>`;
}

function pageHtml(slug: string, body: string, robots: string | null): string {
  const shell = `<html><head><link rel="canonical" href="${BASE}/destinations/${slug}" /></head><body><div id="root"></div></body></html>`;
  return insertRobotsMeta(shell, robots).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

describe('sub-area destination pages', () => {
  const subAreas = listSubAreaDestinations();
  const withParent = subAreas.filter((row) => row.parentSlug);
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const llms = fs.readFileSync(llmsPath, 'utf8');

  it('derives parents from the city rows', () => {
    const parentOf = new Map(subAreas.map((row) => [row.slug, row.parentSlug]));
    expect(parentOf.get('da-nang-outskirts')).toBe('da-nang');
    expect(parentOf.get('tbilisi-suburbs')).toBe('tbilisi');
    expect(parentOf.get('tbilisi-mountain-towns')).toBe('tbilisi');
    expect(parentOf.get('porto-alegre-coast-towns')).toBe('porto-alegre');
    expect(parentOf.get('muscat-coastal-suburbs')).toBe('muscat');
    expect(parentOf.get('padova-province-towns')).toBe('padua');
    expect(parentOf.get('queenstown-surrounds')).toBe('queenstown');
    expect(parentOf.get('bari-coastal-towns')).toBe('bari');
    for (const slug of [
      'funchal-suburbs',
      'bansko-outskirts',
      'banja-luka-suburbs',
      'puerto-escondido-outskirts',
      'ushuaia-hills',
    ]) {
      expect(parentOf.get(slug), slug).toBeNull();
    }
    expect(parentOf.has('lisbon')).toBe(false);
    expect(parentOf.has('da-nang')).toBe(false);
    expect(parentOf.has('tbilisi')).toBe(false);
    expect(parentOf.has('gold-coast')).toBe(false);
    expect(parentOf.has('cape-town')).toBe(false);
    expect(parentOf.has('porto')).toBe(false);
    expect(subAreas.length).toBeGreaterThan(0);
  });

  it('keeps sub-area rows in the spin dataset and out of sitemap and llms.txt', () => {
    for (const row of subAreas) {
      expect(findCityBySlug(row.slug)?.city.id, row.slug).toBe(row.city.id);
      expect(sitemap).not.toContain(loc(`/destinations/${row.slug}`));
      expect(llms).not.toContain(`/destinations/${row.slug}`);
    }
  });

  it('noindexes every sub-area page, links its parent hub, and keeps a self canonical', () => {
    for (const row of subAreas) {
      const body = destinationBodyHtml(row.city, row.slug);
      const html = pageHtml(row.slug, body, destinationRobotsContent(row.slug));
      expect(destinationRobotsContent(row.slug)).toBe(SUB_AREA_ROBOTS);
      expect(html).toContain(`<meta name="robots" content="${SUB_AREA_ROBOTS}" />`);
      expect(html).toContain(`<link rel="canonical" href="${BASE}/destinations/${row.slug}" />`);
      expect(html).not.toContain(`<link rel="canonical" href="${BASE}/destinations/${row.parentSlug}" />`);
      if (row.parentSlug && row.parent) {
        expect(html).toContain(`href="/destinations/${row.parentSlug}"`);
        expect(html).toContain(`Part of the ${row.parent.name} area. See the full`);
        expect(html).toContain(`${row.parent.name} guide`);
        expect(subAreaParentNoticeHtml(row)).not.toContain('\u2014');
        expect(subAreaParentNoticeHtml(row)).not.toContain('\u2013');
        expect(canonicalDestinationPath(row.slug)).toBe(`/destinations/${row.parentSlug}`);
      } else {
        expect(html).not.toContain('Part of the');
        expect(canonicalDestinationPath(row.slug)).toBe(`/destinations/${row.slug}`);
      }
    }

    const tbilisiSuburbs = subAreas.find((row) => row.slug === 'tbilisi-suburbs');
    const daNangOutskirts = subAreas.find((row) => row.slug === 'da-nang-outskirts');
    expect(destinationBodyHtml(tbilisiSuburbs!.city, tbilisiSuburbs!.slug)).toContain(
      'href="/guides/living-in-tbilisi"',
    );
    expect(destinationBodyHtml(tbilisiSuburbs!.city, tbilisiSuburbs!.slug)).toContain('living guide');
    expect(destinationBodyHtml(daNangOutskirts!.city, daNangOutskirts!.slug)).toContain(
      'href="/guides/living-in-da-nang"',
    );
  });

  it('keeps city hubs such as tbilisi, da-nang, and lisbon in the sitemap and indexable', () => {
    for (const slug of ['tbilisi', 'da-nang', 'lisbon']) {
      const resolved = findCityBySlug(slug);
      expect(resolved?.canonicalSlug).toBe(slug);
      expect(sitemap).toContain(loc(`/destinations/${slug}`));
      expect(destinationRobotsContent(slug)).toBeNull();
      const html = pageHtml(slug, destinationBodyHtml(resolved!.city, slug), destinationRobotsContent(slug));
      expect(html).not.toContain('noindex');
      expect(html).not.toContain('Part of the');
      expect(html).toContain(`<link rel="canonical" href="${BASE}/destinations/${slug}" />`);
    }
  });

  it('does not link living guides, hub pages, or the destinations index at a sub-area that has a parent', () => {
    const forbidden = withParent.map((row) => `/destinations/${row.slug}`);
    for (const guide of guides) {
      const html = guideBodyHtml(guide);
      for (const href of forbidden) {
        expect(html, guide.slug).not.toContain(`href="${href}"`);
        expect(html, guide.slug).not.toContain(`href="${BASE}${href}"`);
      }
    }

    for (const { city, slug } of allCitySlugs()) {
      if (withParent.some((row) => row.slug === slug)) continue;
      const html = destinationBodyHtml(city, slug);
      for (const href of forbidden) {
        expect(html, slug).not.toContain(`href="${href}"`);
        expect(html, slug).not.toContain(`href="${BASE}${href}"`);
      }
    }

    for (const group of citiesByRegion()) {
      for (const { slug } of group.cities) {
        const href = canonicalDestinationPath(slug);
        expect(forbidden, slug).not.toContain(href);
      }
    }
  });

  it('wires the sitemap, llms, and prerender generators to the same helper', () => {
    const sitemapScript = fs.readFileSync(path.resolve(__dirname, '../../scripts/generate-sitemap.ts'), 'utf8');
    const seoScript = fs.readFileSync(path.resolve(__dirname, '../../scripts/generate-seo-pages.ts'), 'utf8');
    const client = fs.readFileSync(path.resolve(__dirname, '../pages/DestinationGuide.tsx'), 'utf8');
    expect(sitemapScript).toContain('listSubAreaDestinations');
    expect(sitemapScript).toContain('omitSubAreaDestinationLines');
    expect(seoScript).toContain('insertRobotsMeta');
    expect(seoScript).toContain('destinationRobotsContent');
    expect(seoScript).toContain('destinationBodyHtml');
    expect(seoScript).toContain('canonicalDestinationPath');
    expect(client).toContain('SUB_AREA_ROBOTS');
    expect(client).toContain('subAreaParentNotice');
    expect(client).toContain('livingGuideForCity');
  });
});
