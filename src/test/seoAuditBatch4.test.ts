import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { guides } from '@/data/guides';
import { GUIDES_INDEX_DESCRIPTION, guidesIndexBodyHtml } from '@/lib/guideHtml';
import {
  guideArticleJsonLd,
  guideBreadcrumbJsonLd,
  guidesIndexBreadcrumbJsonLd,
} from '@/lib/guideJsonLd';
import { HOME_DESCRIPTION, HOME_H1, HOME_INTRO, HOME_TITLE, homeBodyHtml } from '@/lib/homeSeo';

const indexHtml = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
const guide = guides[0];
const url = `https://www.digitalnomadspin.com/guides/${guide.slug}`;

describe('home prerender body', () => {
  const html = homeBodyHtml(guides);

  it('has the H1, exact intro and guide links', () => {
    expect(html).toContain(`<h1>${HOME_H1}</h1>`);
    expect(HOME_H1).toBe('Find your next digital nomad base');
    expect(html).toContain(HOME_INTRO);
    expect(html).toContain('<a href="/guides">Digital nomad guides</a>');
    for (const g of guides) expect(html).toContain(`href="/guides/${g.slug}"`);
  });

  it('has a 72 word intro', () => {
    expect(HOME_INTRO.split(/\s+/).filter(Boolean)).toHaveLength(72);
  });
});

describe('home head', () => {
  it('uses the new title and description in index.html', () => {
    expect(HOME_TITLE.endsWith(' | Nomad Spin')).toBe(true);
    expect(indexHtml).toContain(`<title>${HOME_TITLE}</title>`);
    expect(indexHtml).toContain(`<meta property="og:title" content="${HOME_TITLE}"`);
    expect(indexHtml).toContain(`<meta name="twitter:title" content="${HOME_TITLE}"`);
    const flat = indexHtml.replace(/\s+/g, ' ');
    expect(flat).toContain(`property="og:description" content="${HOME_DESCRIPTION}"`);
    expect(flat).toContain(`name="twitter:description" content="${HOME_DESCRIPTION}"`);
  });
});

describe('/guides index', () => {
  it('has the new H1 and description', () => {
    expect(guidesIndexBodyHtml(guides)).toContain('<h1>Digital nomad guides</h1>');
    expect(GUIDES_INDEX_DESCRIPTION).toBe(
      'Living guides for Lisbon, Chiang Mai, Bali, Mexico City and Cape Town, plus how to choose your next base, when to go and a Paraguay tax residency guide.',
    );
  });

  it('has a two item breadcrumb', () => {
    expect(guidesIndexBreadcrumbJsonLd().itemListElement).toHaveLength(2);
  });
});

describe('guide JSON-LD', () => {
  it('BreadcrumbList has 3 absolute items ending in the canonical', () => {
    const bc = guideBreadcrumbJsonLd(guide, url);
    expect(bc['@type']).toBe('BreadcrumbList');
    expect(bc.itemListElement).toHaveLength(3);
    for (const item of bc.itemListElement) {
      expect(item['@type']).toBe('ListItem');
      expect(item.item.startsWith('https://www.')).toBe(true);
    }
    expect(bc.itemListElement[2].item).toBe(url);
    expect(bc.itemListElement[2].name).toBe(guide.title);
  });

  it('Article has image and mainEntityOfPage', () => {
    const article = guideArticleJsonLd(guide, url);
    expect(article.image).toBe('https://www.digitalnomadspin.com/og-preview.png');
    expect(article.mainEntityOfPage).toBe(url);
    expect(article.url).toBe(url);
  });

  it('serializes to parseable JSON', () => {
    const parsed = JSON.parse(JSON.stringify([guideArticleJsonLd(guide, url), guideBreadcrumbJsonLd(guide, url)]));
    expect(parsed).toHaveLength(2);
  });
});

describe('new copy has no en or em dashes', () => {
  it('is clean', () => {
    const copy = [HOME_TITLE, HOME_DESCRIPTION, HOME_H1, HOME_INTRO, GUIDES_INDEX_DESCRIPTION, homeBodyHtml(guides)];
    for (const text of copy) expect(text).not.toMatch(/[\u2013\u2014]/);
  });
});
