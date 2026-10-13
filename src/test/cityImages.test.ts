import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  CITY_PHOTOS,
  NEUTRAL_IMAGE,
  PUBLISHED_DESTINATIONS,
  UNVERIFIED_DESTINATIONS,
  getCityImageAlt,
  getCityImageUrl,
} from '@/data/cityImages';
import { findCityBySlug } from '@/lib/citySlug';
import { guides } from '@/data/guides';

describe('city images', () => {
  it('every published destination is either curated or unverified, never both', () => {
    for (const slug of PUBLISHED_DESTINATIONS) {
      const curated = slug in CITY_PHOTOS;
      const unverified = UNVERIFIED_DESTINATIONS.includes(slug);
      expect(curated !== unverified, slug).toBe(true);
    }
    for (const slug of [...Object.keys(CITY_PHOTOS), ...UNVERIFIED_DESTINATIONS]) {
      expect(PUBLISHED_DESTINATIONS, slug).toContain(slug);
    }
  });

  it('every published destination is a real city with a living guide', () => {
    for (const slug of PUBLISHED_DESTINATIONS) {
      expect(findCityBySlug(slug), slug).toBeTruthy();
      expect(guides.some((g) => g.slug === `living-in-${slug}`), slug).toBe(true);
    }
  });

  it('curated entries are well formed', () => {
    const ids = Object.values(CITY_PHOTOS).map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [slug, photo] of Object.entries(CITY_PHOTOS)) {
      expect(photo.id).toMatch(/^\d{10,13}-[0-9a-f]{12}$/);
      expect(photo.alt).toMatch(/^[^,:]+, [^:]+: .+/);
      const cityName = findCityBySlug(slug)!.city.name;
      expect(photo.alt.startsWith(cityName), slug).toBe(true);
      expect(photo.photographerUrl.startsWith('https://unsplash.com/@')).toBe(true);
      expect(photo.unsplashUrl.startsWith('https://unsplash.com/photos/')).toBe(true);
    }
  });

  it('every published destination has a verified photo and none are unverified', () => {
    expect(UNVERIFIED_DESTINATIONS).toEqual([]);
    expect(Object.keys(CITY_PHOTOS).sort()).toEqual([...PUBLISHED_DESTINATIONS].sort());
  });

  it('alt text and og:image:alt are set wherever og:image is dynamic', () => {
    for (const rel of ['../components/SEO.tsx', '../pages/DestinationGuide.tsx', '../pages/GuideArticle.tsx']) {
      const src = fs.readFileSync(path.resolve(__dirname, rel), 'utf8');
      expect(src, rel).toContain('og:image:alt');
      expect(src, rel).toContain('twitter:image:alt');
    }
    const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
    expect(html).toContain('og:image:alt');
    expect(html).toContain('twitter:image:alt');
  });

  it('returns the neutral image and plain alt for unknown cities', () => {
    expect(getCityImageUrl('atlantis-xx', 'Europe')).toBe(NEUTRAL_IMAGE);
    expect(getCityImageAlt('Atlantis', 'Nowhere', 'atlantis-xx')).toBe('Atlantis, Nowhere');
  });

  it('returns curated CDN URLs with country-suffixed ids', () => {
    expect(getCityImageUrl('lisbon-pt', 'Europe', 1200)).toContain(`photo-${CITY_PHOTOS.lisbon.id}?w=1200`);
  });

  it('useCityImage does not reference supabase', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../hooks/useCityImage.ts'), 'utf8');
    expect(src.toLowerCase()).not.toContain('supabase');
  });
});
