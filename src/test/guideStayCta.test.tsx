import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { guideStayCta } from '@/lib/guideStayCta';
import GuideArticle from '@/pages/GuideArticle';

const SLUGS = [
  'living-in-chiang-mai',
  'how-to-choose-next-nomad-base',
  'living-in-da-nang',
  'living-in-medellin',
  'living-in-budapest',
];

function renderGuide(slug: string) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/guides/${slug}`]}>
          <Routes>
            <Route path="/guides/:slug" element={<GuideArticle />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    </QueryClientProvider>,
  );
}

function aidLinks(container: HTMLElement): HTMLAnchorElement[] {
  return [...container.querySelectorAll<HTMLAnchorElement>('a[href]')].filter((a) =>
    a.getAttribute('href')?.includes('aid=8092520'),
  );
}

describe('guideStayCta', () => {
  for (const slug of SLUGS) {
    it(`${slug} builds a Booking.com URL`, () => {
      const cta = guideStayCta(slug);
      expect(cta).not.toBeNull();
      const url = new URL(cta!.url);
      expect(url.hostname).toBe('www.booking.com');
      expect(url.searchParams.get('aid')).toBe('8092520');
      expect(url.searchParams.get('utm_campaign')).toBe(`guide-${slug}`);
      expect(url.searchParams.get('utm_content')).toBe('accommodation');
      expect(cta!.partner).toBe('Booking.com');
    });
  }

  it('resolves city names and destination slugs from the city data', () => {
    expect(guideStayCta('living-in-medellin')).toMatchObject({ city: 'Medellín', destinationSlug: 'medellin' });
    expect(guideStayCta('living-in-chiang-mai')?.destinationSlug).toBe('chiang-mai');
    expect(guideStayCta('how-to-choose-next-nomad-base')?.destinationSlug).toBeUndefined();
    expect(guideStayCta('how-to-choose-next-nomad-base')?.url).toContain('/index.html?aid=8092520');
  });

  it('covers the October launch guides with city data', () => {
    expect(guideStayCta('living-in-madrid')).toMatchObject({ city: 'Madrid', destinationSlug: 'madrid' });
    expect(guideStayCta('living-in-hoi-an')?.url).toContain('aid=8092520');
    expect(guideStayCta('living-in-tallinn')?.url).toContain('aid=8092520');
  });

  it('returns null for other guides', () => {
    expect(guideStayCta('living-in-bali')).toBeNull();
  });
});

describe('GuideArticle stay CTA', () => {
  it('renders one sponsored Booking link after the article, outside JSON-LD', async () => {
    const { container } = renderGuide('living-in-chiang-mai');
    const links = aidLinks(container);
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('rel')).toContain('sponsored');
    expect(links[0]).toHaveTextContent('Search stays in Chiang Mai on Booking.com');

    const article = container.querySelector('article')!;
    expect(article.contains(links[0])).toBe(false);
    expect(article.compareDocumentPosition(links[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('link', { name: 'See the Chiang Mai destination page' })).toHaveAttribute(
      'href',
      '/destinations/chiang-mai',
    );
    expect(screen.getByText(/Nomad Spin may earn a commission/)).toBeInTheDocument();

    await waitFor(() => expect(document.querySelectorAll('script[type="application/ld+json"]').length).toBeGreaterThan(0));
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      expect(script.textContent ?? '').not.toContain('booking.com');
    }
  });

  it('renders no Booking link on a guide without a stay CTA', () => {
    const { container } = renderGuide('living-in-bali');
    expect(aidLinks(container)).toHaveLength(0);
  });
});
