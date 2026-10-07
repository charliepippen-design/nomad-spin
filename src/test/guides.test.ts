import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { guides } from '@/data/guides';
import { buildContentGuidesModule } from '../../scripts/sync-content-guides';

describe('static guides', () => {
  it('includes the editorial content guides', () => {
    const slugs = guides.map((g) => g.slug);
    expect(slugs).toContain('living-in-bali');
    expect(slugs).toContain('living-in-cape-town');
    expect(slugs).toContain('living-in-chiang-mai');
    expect(slugs).toContain('how-to-choose-next-nomad-base');
    expect(slugs).toContain('where-to-go-next-by-season');
    expect(slugs).toContain('paraguay-tax-residency-remote-workers');
    expect(slugs).toContain('best-places-digital-nomads-2025');
  });

  it('keeps the nomad places shortlist on its original URL and current for 2026', () => {
    const guide = guides.find((g) => g.slug === 'best-places-digital-nomads-2025');
    expect(guide).toBeDefined();
    expect(guide!.title).toBe('Best Places for Digital Nomads in 2026');
    expect(guide!.excerpt).toContain('2026');
    expect(guide!.excerpt).not.toContain('2025');
    expect(guide!.date.startsWith('2025-01-06')).toBe(true);
    expect(guide!.updated?.startsWith('2026-10-07')).toBe(true);
    expect(guide!.content).not.toContain('—');
    expect(guide!.content).toContain('780+');
    expect(guide!.content).toContain('href="/"');
    expect(guide!.content).not.toMatch(/\$700[–-]\$1,000|\$900[–-]\$1,200|B211A visa and Second Home|blue-dollar|blue dollar/i);
  });

  it('has unique, URL-safe slugs', () => {
    const slugs = guides.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('has complete metadata and no leftover draft/editor chrome', () => {
    for (const g of guides) {
      expect(g.title.length).toBeGreaterThan(10);
      expect(g.excerpt.length).toBeGreaterThan(50);
      expect(g.excerpt.length).toBeLessThanOrEqual(170);
      expect(Number.isNaN(Date.parse(g.date))).toBe(false);
      expect(g.content.length).toBeGreaterThan(2000);
      expect(g.content).not.toMatch(/^#\s/); // page renders its own <h1>
      expect(g.content).not.toMatch(/\bTODO\b|lorem ipsum|Your Altitude|\[insert|tell me your priorities/i);
    }
  });

  it('publishes the Chiang Mai living guide from dataset figures', () => {
    const g = guides.find((x) => x.slug === 'living-in-chiang-mai');
    expect(g).toBeTruthy();
    expect(g!.title).toBe('The Ultimate Guide to Living in Chiang Mai');
    expect(g!.seoTitle).toBe("Living in Chiang Mai 2026: The Digital Nomad's Definitive Guide");
    expect(g!.excerpt).toBe(
      'Chiang Mai for remote workers in 2026: real monthly costs, Nimman vs Old City, visas and DTV notes, coworking, internet, and burning season trade-offs.'
    );
    expect(g!.relatedDestinations).toEqual(['chiang-mai']);
    expect(g!.content).toContain('$850');
    expect(g!.content).toContain('$650');
    expect(g!.content).toContain('$35');
    expect(g!.content).toContain('95 Mbps');
    expect(g!.content).toContain('8.2');
    expect(g!.content).not.toMatch(/—/);
    expect(g!.title).not.toMatch(/—/);
    expect(g!.seoTitle).not.toMatch(/—/);
    expect(g!.excerpt).not.toMatch(/—/);
    for (const href of [
      '/destinations/chiang-mai',
      '/destinations/bangkok',
      '/destinations/da-nang',
      '/destinations/bali',
      '/destinations/canggu',
      '/destinations/ubud',
      '/destinations/seminyak',
      '/guides/living-in-bali',
      '/guides/living-in-cape-town',
      '/guides/how-to-choose-next-nomad-base',
      '/guides/where-to-go-next-by-season',
      '/guides/best-places-digital-nomads-2025',
    ]) {
      expect(g!.content).toContain(href);
    }
  });

  it('generated module is in sync with content/guides', () => {
    const generated = fs.readFileSync(
      path.resolve(__dirname, '../data/contentGuides.generated.ts'),
      'utf-8'
    );
    expect(generated).toBe(buildContentGuidesModule().source);
  });
});
