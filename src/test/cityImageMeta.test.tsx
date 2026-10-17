import fs from 'fs';
import path from 'path';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cities } from '@/data/cities';
import { CITY_PHOTOS, NEUTRAL_IMAGE, getCityPhoto } from '@/data/cityImages';
import { citySlug, findCityBySlug } from '@/lib/citySlug';
import { livingGuideForCity } from '@/lib/destinationSeo';
import { headMetaValues, headProblems, injectSeo } from '@/lib/prerenderHead';
import {
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_ALT,
  citySocialImage,
  guideSocialImage,
} from '@/lib/socialImage';
import { SiteDefaultMeta } from '@/components/SEO';
import GuideArticle from '@/pages/GuideArticle';
import About from '@/pages/About';

vi.mock('@/integrations/supabase/client', () => ({
  isSupabaseConfigured: false,
  supabase: {},
}));

const INDEX_HTML = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
const SOCIAL_KEYS = ['og:image', 'og:image:alt', 'twitter:image', 'twitter:image:alt'];

describe('city photo lookup', () => {
  it('Ho Chi Minh City (ho-chi-minh-vn) resolves to its verified photo', () => {
    expect(getCityPhoto('ho-chi-minh-vn')).toBe(CITY_PHOTOS['ho-chi-minh-city']);
    expect(citySocialImage('ho-chi-minh-vn').url).toContain(`photo-${CITY_PHOTOS['ho-chi-minh-city'].id}?w=1200`);
  });

  it('every city with a living guide resolves to its verified photo by city id', () => {
    const withGuide = cities.filter((city) => livingGuideForCity(city));
    expect(withGuide.length).toBeGreaterThanOrEqual(Object.keys(CITY_PHOTOS).length);
    for (const city of withGuide) {
      const slug = citySlug(city);
      const photo = CITY_PHOTOS[slug];
      if (photo) {
        expect(getCityPhoto(city.id), city.id).toBe(photo);
      } else {
        // Living guide without a verified photo yet (e.g. Kotor): neutral image, no photo.
        expect(getCityPhoto(city.id), city.id).toBeNull();
      }
    }
    // Every verified photo belongs to a city with a living guide.
    const covered = new Set(withGuide.map((city) => citySlug(city)));
    for (const slug of Object.keys(CITY_PHOTOS)) expect(covered.has(slug), slug).toBe(true);
  });

  it('guide and destination social images agree for every verified city', () => {
    for (const slug of Object.keys(CITY_PHOTOS)) {
      const city = findCityBySlug(slug)!.city;
      expect(guideSocialImage(`living-in-${slug}`), slug).toEqual(citySocialImage(city.id));
      expect(citySocialImage(city.id).alt).toBe(CITY_PHOTOS[slug].alt);
    }
  });
});

describe('prerendered head', () => {
  it('index.html has exactly one of each social tag, all managed by Helmet', () => {
    expect(headProblems(INDEX_HTML)).toEqual([]);
    for (const key of SOCIAL_KEYS) {
      const tag = new RegExp(`<meta data-rh="true" (property|name)="${key}"`);
      expect(INDEX_HTML, key).toMatch(tag);
    }
  });

  it.each([
    ['guide living-in-lisbon', guideSocialImage('living-in-lisbon'), CITY_PHOTOS.lisbon.id],
    ['destination ho-chi-minh-city', citySocialImage('ho-chi-minh-vn'), CITY_PHOTOS['ho-chi-minh-city'].id],
  ])('%s gets one set of city image tags', (_label, image, photoId) => {
    const html = injectSeo(INDEX_HTML, {
      title: 'T',
      description: 'D',
      url: 'https://www.digitalnomadspin.com/x',
      image,
    });
    expect(headProblems(html, image)).toEqual([]);
    const values = headMetaValues(html);
    expect(values['og:image'][0]).toContain(`photo-${photoId}?w=1200`);
    expect(values['og:image:alt'][0]).toMatch(/^[^,:]+, [^:]+: .+/);
    expect(html).not.toContain('og-preview.png');
  });

  it('pages without a city keep the single default image and alt', () => {
    const html = injectSeo(INDEX_HTML, { title: 'T', description: 'D', url: 'https://www.digitalnomadspin.com/about' });
    expect(headProblems(html, { url: DEFAULT_SOCIAL_IMAGE, alt: DEFAULT_SOCIAL_IMAGE_ALT })).toEqual([]);
  });

  it('headProblems reports duplicates', () => {
    const dup = INDEX_HTML.replace('</head>', `<meta property="og:image" content="${DEFAULT_SOCIAL_IMAGE}" /></head>`);
    expect(headProblems(dup)).toContain('og:image appears 2 times');
  });
});

function renderAt(route: string) {
  return render(
    <HelmetProvider>
      <SiteDefaultMeta />
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/guides/:slug" element={<GuideArticle />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

function headValues(key: string): string[] {
  return [...document.head.querySelectorAll(`meta[property="${key}"], meta[name="${key}"]`)].map(
    (el) => el.getAttribute('content') ?? '',
  );
}

describe('client head after hydration', () => {
  beforeEach(() => {
    // Start from the real index.html head, as the browser does.
    document.head.innerHTML = INDEX_HTML.slice(INDEX_HTML.indexOf('<head>') + 6, INDEX_HTML.indexOf('</head>'));
  });
  afterEach(() => {
    cleanup();
    document.head.innerHTML = '';
  });

  it('a guide page replaces the defaults: one og:image and alt, the city photo', async () => {
    renderAt('/guides/living-in-lisbon');
    await waitFor(() => expect(headValues('og:image')[0]).toContain(CITY_PHOTOS.lisbon.id));
    for (const key of SOCIAL_KEYS) expect(headValues(key), key).toHaveLength(1);
    expect(headValues('twitter:image')[0]).toContain(`photo-${CITY_PHOTOS.lisbon.id}?w=1200`);
    expect(headValues('og:image:alt')).toEqual([CITY_PHOTOS.lisbon.alt]);
    expect(headValues('twitter:image:alt')).toEqual([CITY_PHOTOS.lisbon.alt]);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it('a page that sets no alt keeps one default alt', async () => {
    renderAt('/about');
    await waitFor(() => expect(document.title).toContain('About'));
    for (const key of SOCIAL_KEYS) expect(headValues(key), key).toHaveLength(1);
    expect(headValues('og:image:alt')).toEqual([DEFAULT_SOCIAL_IMAGE_ALT]);
  });
});

describe('guide hero', () => {
  afterEach(cleanup);

  it('living guide with a verified photo shows the photo, alt and Unsplash credit', () => {
    renderAt('/guides/living-in-lisbon');
    const img = screen.getByAltText(CITY_PHOTOS.lisbon.alt) as HTMLImageElement;
    expect(img.src).toContain(`photo-${CITY_PHOTOS.lisbon.id}?w=1600`);
    expect(img.getAttribute('width')).toBe('1600');
    expect(img.getAttribute('height')).toBe('896');
    const credit = screen.getByText(/Photo by/);
    expect(credit.textContent).toBe(`Photo by ${CITY_PHOTOS.lisbon.photographer} on Unsplash`);
    const links = [...credit.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links[0]).toContain(CITY_PHOTOS.lisbon.photographerUrl);
    expect(links[1]).toContain('https://unsplash.com/');
  });

  it('Ho Chi Minh City guide shows its photo', () => {
    renderAt('/guides/living-in-ho-chi-minh-city');
    const photo = CITY_PHOTOS['ho-chi-minh-city'];
    expect((screen.getByAltText(photo.alt) as HTMLImageElement).src).toContain(`photo-${photo.id}`);
  });

  it('living guide without a verified photo shows the neutral image and no credit', () => {
    renderAt('/guides/living-in-kotor');
    const img = screen.getByAltText('Kotor, Montenegro') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(NEUTRAL_IMAGE);
    expect(screen.queryByText(/Photo by/)).toBeNull();
  });
});
