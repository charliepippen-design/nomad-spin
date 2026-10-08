import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { guides } from '@/data/guides';
import { guideBodyHtml } from '@/lib/guideHtml';
import {
  relatedDestinationEntries,
  relatedGuideEntries,
  UnpublishedRelatedGuideError,
} from '@/lib/relatedGuides';
import { subAreaBySlug } from '@/lib/subAreaDestinations';
import GuideArticle from '@/pages/GuideArticle';

const published = new Set(guides.map((guide) => guide.slug));

function relatedGuidesBlock(html: string): string {
  const start = html.indexOf('<h2>Related guides</h2>');
  const end = html.indexOf('<h2>Related destinations</h2>');
  return html.slice(start, end);
}

describe('related guides', () => {
  it('lists 5 published guides, never the current page', () => {
    for (const guide of guides) {
      const items = relatedGuideEntries(guide.slug);
      expect(items, guide.slug).toHaveLength(5);
      const slugs = items.map((item) => item.slug);
      expect(slugs, guide.slug).not.toContain(guide.slug);
      expect(new Set(slugs).size, guide.slug).toBe(5);
      for (const slug of slugs) expect(published.has(slug), `${guide.slug} -> ${slug}`).toBe(true);
    }
  });

  it('uses the peer map, then the two general guides, on a living guide', () => {
    expect(relatedGuideEntries('living-in-lisbon').map((item) => item.slug)).toEqual([
      'living-in-porto',
      'living-in-valencia',
      'living-in-prague',
      'how-to-choose-next-nomad-base',
      'where-to-go-next-by-season',
    ]);
    expect(relatedGuideEntries('how-to-choose-next-nomad-base').map((item) => item.slug)).toEqual([
      'living-in-lisbon',
      'living-in-chiang-mai',
      'living-in-mexico-city',
      'where-to-go-next-by-season',
      'best-places-digital-nomads-2025',
    ]);
  });

  it('marks Valencia internet as an estimate and keeps Porto on the city row', () => {
    const lisbon = relatedGuideEntries('living-in-lisbon');
    const valencia = lisbon.find((item) => item.slug === 'living-in-valencia');
    const porto = lisbon.find((item) => item.slug === 'living-in-porto');
    expect(valencia?.detail).toBe('$1,900 solo, 170 Mbps est., best Apr-Jun, Sep');
    expect(valencia?.detail).toContain(' est.');
    expect(porto?.detail).toBe('$1,800 solo, 200 Mbps, best May-Sep');
    expect(porto?.name).toBe('Living in Porto');
  });

  it('uses a short description for general guides and Paraguay', () => {
    const mexico = relatedGuideEntries('living-in-mexico-city');
    const paraguay = mexico.find((item) => item.slug === 'paraguay-tax-residency-remote-workers');
    expect(paraguay?.name).toBe('Paraguay Tax Residency for Remote Workers');
    expect(paraguay?.detail.startsWith('$')).toBe(false);
    expect(relatedGuideEntries('where-to-go-next-by-season').find((item) => item.slug === 'how-to-choose-next-nomad-base')?.detail).toBe(
      'Pick a base from budget, internet, safety, and visa fit.',
    );
  });

  it('skips unpublished peer-map keys and applies them once that guide is published', () => {
    expect(relatedGuideEntries('living-in-madrid')).toEqual([]);
    expect(relatedGuideEntries('living-in-hoi-an')).toEqual([]);
    expect(relatedGuideEntries('living-in-tallinn')).toEqual([]);

    for (const guide of guides) {
      const slugs = relatedGuideEntries(guide.slug).map((item) => item.slug);
      expect(slugs).not.toContain('living-in-madrid');
      expect(slugs).not.toContain('living-in-hoi-an');
      expect(slugs).not.toContain('living-in-tallinn');
    }

    const withMadrid = [...guides, { slug: 'living-in-madrid' }];
    expect(relatedGuideEntries('living-in-madrid', withMadrid).map((item) => item.slug)).toEqual([
      'living-in-barcelona',
      'living-in-valencia',
      'living-in-lisbon',
      'how-to-choose-next-nomad-base',
      'where-to-go-next-by-season',
    ]);
    expect(relatedGuideEntries('living-in-madrid', withMadrid).find((item) => item.slug === 'living-in-valencia')?.detail).toContain(
      ' est.',
    );
  });

  it('fails when a published guide points at an unpublished peer', () => {
    const withoutValencia = guides.filter((guide) => guide.slug !== 'living-in-valencia');
    expect(() => relatedGuideEntries('living-in-lisbon', withoutValencia)).toThrow(UnpublishedRelatedGuideError);
  });

  it('falls back to three published guides from the same region', () => {
    const catalog = [
      { slug: 'living-in-seville' },
      { slug: 'living-in-lisbon' },
      { slug: 'living-in-porto' },
      { slug: 'living-in-prague' },
      { slug: 'living-in-valencia' },
      { slug: 'living-in-bangkok' },
      { slug: 'how-to-choose-next-nomad-base' },
      { slug: 'where-to-go-next-by-season' },
    ];
    expect(relatedGuideEntries('living-in-seville', catalog).map((item) => item.slug)).toEqual([
      'living-in-lisbon',
      'living-in-porto',
      'living-in-prague',
      'how-to-choose-next-nomad-base',
      'where-to-go-next-by-season',
    ]);
  });

  it('prerenders the block after the article and above related destinations', () => {
    const guide = guides.find((item) => item.slug === 'living-in-lisbon');
    expect(guide).toBeTruthy();
    const html = guideBodyHtml(guide!);
    const articleEnd = html.indexOf('</article>');
    const guidesAt = html.indexOf('<h2>Related guides</h2>');
    const destinationsAt = html.indexOf('<h2>Related destinations</h2>');
    expect(articleEnd).toBeGreaterThan(-1);
    expect(guidesAt).toBeGreaterThan(articleEnd);
    expect(destinationsAt).toBeGreaterThan(guidesAt);

    const block = relatedGuidesBlock(html);
    const hrefs = [...block.matchAll(/href="\/guides\/([^"]+)"/g)].map((match) => match[1]);
    expect(hrefs).toEqual([
      'living-in-porto',
      'living-in-valencia',
      'living-in-prague',
      'how-to-choose-next-nomad-base',
      'where-to-go-next-by-season',
    ]);
    expect(block).toContain('>Living in Porto</a>');
    expect(block).toContain('$1,800 solo, 200 Mbps, best May-Sep');
    expect(block).toContain('$1,900 solo, 170 Mbps est., best Apr-Jun, Sep');
    expect(block).not.toContain('nofollow');
    expect(block.includes('\u2013')).toBe(false);
    expect(block.includes('\u2014')).toBe(false);
  });
});

describe('related destinations', () => {
  it('uses comparison-table cities with hub display names', () => {
    const mexico = guides.find((guide) => guide.slug === 'living-in-mexico-city');
    const lisbon = guides.find((guide) => guide.slug === 'living-in-lisbon');
    expect(mexico).toBeTruthy();
    expect(lisbon).toBeTruthy();

    expect(relatedDestinationEntries(mexico!).map((item) => item.name)).toEqual([
      'Mexico City',
      'Medellín',
      'Buenos Aires',
      'Chiang Mai',
    ]);
    expect(relatedDestinationEntries(lisbon!).map((item) => item.name)).toEqual([
      'Lisbon',
      'Porto',
      'Budapest',
      'Barcelona',
      'Cape Town',
    ]);

    const html = guideBodyHtml(mexico!);
    const destinations = html.slice(html.indexOf('<h2>Related destinations</h2>'));
    expect(destinations).toContain('<a href="/destinations/mexico-city">Mexico City</a>');
    expect(destinations).toContain('<a href="/destinations/medellin">Medellín</a>');
    expect(destinations).not.toContain('>mexico city<');
    expect(destinations).not.toContain('>Mexico city<');
    expect(destinations).not.toContain('>mexico-city<');
  });

  it('does not link sub-area pages', () => {
    for (const guide of guides) {
      for (const destination of relatedDestinationEntries(guide)) {
        expect(subAreaBySlug(destination.slug), `${guide.slug} -> ${destination.slug}`).toBeNull();
        expect(destination.slug).not.toMatch(/-(suburbs|outskirts|surrounds|mountains|hills|coast-towns)$/);
      }
    }
  });
});

describe('GuideArticle related guides', () => {
  it('renders the same Lisbon links in the client view', () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/guides/living-in-lisbon']}>
            <Routes>
              <Route path="/guides/:slug" element={<GuideArticle />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Related guides' })).toBeInTheDocument();
    const porto = screen.getByRole('link', { name: 'Living in Porto' });
    expect(porto).toHaveAttribute('href', '/guides/living-in-porto');
    expect(porto).not.toHaveAttribute('rel', expect.stringContaining('nofollow'));
    expect(screen.getByText('$1,800 solo, 200 Mbps, best May-Sep')).toBeInTheDocument();
    expect(screen.getByText('$1,900 solo, 170 Mbps est., best Apr-Jun, Sep')).toBeInTheDocument();
    const capeTown = screen.getAllByRole('link', { name: 'Cape Town' });
    expect(capeTown.some((link) => link.getAttribute('href') === '/destinations/cape-town' && link.closest('article') === null)).toBe(
      true,
    );
  });
});
