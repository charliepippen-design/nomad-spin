import { fireEvent, render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DestinationGuide from '@/pages/DestinationGuide';
import { resetCtaVariantForTests } from '@/utils/analytics';

function renderDestination(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/destinations/${slug}`]}>
        <Routes>
          <Route path="/destinations/:citySlug" element={<DestinationGuide />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

type W = Omit<Window, 'dataLayer'> & { dataLayer?: Record<string, unknown>[] };

beforeEach(() => {
  (window as W).dataLayer = [];
  sessionStorage.clear();
  resetCtaVariantForTests();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubEnv('VITE_SKYSCANNER_ID', '');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('destination page affiliate tracking', () => {
  it('tracks the stay button without blocking the link', () => {
    const { container } = renderDestination('bogota');
    const stay = container.querySelector<HTMLAnchorElement>('a[href*="booking.com"]')!;
    expect(stay).toHaveTextContent('Find a place to stay in');
    fireEvent.click(stay);
    const click = (window as W).dataLayer!.find((e) => e.event === 'affiliate_click');
    expect(click).toMatchObject({
      partner: 'Booking.com',
      placement: 'destination_stay',
      city_slug: 'bogota',
      cta_variant: expect.stringMatching(/^(control|monthly_stays)$/),
    });
    expect(String(click!.link_url)).toContain('aid=8092520');
    expect(stay.getAttribute('target')).toBe('_blank');
    expect(stay.getAttribute('href')).toContain('utm_campaign=city-bogota');
  });

  it('tracks the NordVPN link', () => {
    const { container } = renderDestination('bogota');
    fireEvent.click(container.querySelector('a[href*="nordvpn"]')!);
    expect((window as W).dataLayer!.some((e) => e.event === 'affiliate_click' && e.partner === 'NordVPN')).toBe(true);
  });

  it('renders no Skyscanner link while VITE_SKYSCANNER_ID is unset', () => {
    const { container } = renderDestination('bogota');
    expect(container.querySelector('a[href*="skyscanner"]')).toBeNull();
    expect(container.textContent).not.toContain('Search flights');
  });
});
