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
    expect(slugs).toContain('how-to-choose-next-nomad-base');
    expect(slugs).toContain('paraguay-tax-residency-remote-workers');
    expect(slugs).toContain('best-places-digital-nomads-2025');
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

  it('generated module is in sync with content/guides', () => {
    const generated = fs.readFileSync(
      path.resolve(__dirname, '../data/contentGuides.generated.ts'),
      'utf-8'
    );
    expect(generated).toBe(buildContentGuidesModule().source);
  });
});
