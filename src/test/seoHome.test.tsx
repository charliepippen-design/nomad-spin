import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it } from 'vitest';
import SEO from '@/components/SEO';
import { cities } from '@/data/cities';

const HOME_TITLE = 'Digital Nomad Spin | Find Your Next Destination';

describe('homepage SEO', () => {
  it('stays a WebApplication on / even when a spun city is passed', async () => {
    const city = cities.find((item) => item.name === 'Chiang Mai');
    expect(city).toBeTruthy();

    render(
      <HelmetProvider>
        <SEO path="/" city={city} title={HOME_TITLE} description="Stop overthinking. Spin the globe. Find your next destination." />
      </HelmetProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe(HOME_TITLE);
    });

    const jsonLd = document.querySelector('script[type="application/ld+json"]')?.textContent ?? '';
    expect(jsonLd).toContain('WebApplication');
    expect(jsonLd).not.toContain('TouristDestination');
    expect(document.title).not.toContain('Chiang Mai');
    expect(document.title).not.toContain('\u2014');
  });
});
