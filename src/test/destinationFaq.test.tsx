import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { cities } from '@/data/cities';
import type { City } from '@/data/cities/types';
import DestinationGuide from '@/pages/DestinationGuide';
import {
  destinationFaq,
  destinationFaqBodyHtml,
  destinationFaqJsonLd,
  faqHasAffiliate,
  rangeMonths,
} from '@/lib/destinationFaq';
import { destinationBodyHtml, destinationPageJsonLd } from '@/lib/destinationPrerender';
import { findCityBySlug } from '@/lib/citySlug';

const DASH = /\u2013|\u2014/;
const NON_ASCII = /[^\x00-\x7F]/;

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function cityById(id: string): City {
  const city = cities.find((item) => item.id === id);
  if (!city) throw new Error(`missing ${id}`);
  return city;
}

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

describe('destination month ranges', () => {
  it('collapses consecutive months and wraps December into January', () => {
    expect(rangeMonths(['Apr', 'May', 'Jun', 'Sep', 'Oct'])).toBe('April to June and September to October');
    expect(rangeMonths(['Nov', 'Dec', 'Jan', 'Feb'])).toBe('November to February');
    expect(rangeMonths(['Jun', 'Jul'])).toBe('June and July');
    expect(rangeMonths(['Nov', 'Mar'])).toBe('March and November');
    expect(rangeMonths(['Mar', 'Apr', 'May', 'Nov'])).toBe('March to May and November');
    expect(rangeMonths(['Jan', 'Feb', 'Mar', 'Jul', 'Aug', 'Dec'])).toBe('December to March and July to August');
  });
});

describe('destination data contradictions', () => {
  it('never lists a month as both best and rainy', () => {
    for (const city of cities) {
      const rainy = new Set(city.weather.rainyMonths);
      const overlap = city.weather.bestMonths.filter((month) => rainy.has(month));
      expect(overlap, city.id).toEqual([]);
    }
  });

  it('does not call the internet fast when reliability or power is weak', () => {
    for (const city of cities) {
      const weak = city.infra.internetReliability <= 5 || city.infra.powerGridStability <= 4;
      if (!weak) continue;
      for (const pro of city.pros) {
        expect(pro.toLowerCase(), city.id).not.toMatch(/fast internet/);
      }
    }
    expect(cityById('cape-town-za').pros).not.toContain('Fast internet');
  });

  it('does not claim year-round weather when rainy months are listed', () => {
    for (const city of cities) {
      if (city.weather.rainyMonths.length === 0) continue;
      for (const pro of city.pros) {
        expect(pro.toLowerCase(), city.id).not.toMatch(/weather year-round/);
      }
    }
  });
});

describe('destination FAQ copy', () => {
  it('keeps every indexable answer between 35 and 50 words, ASCII, and free of dashes or affiliate copy', () => {
    const offenders: string[] = [];
    for (const city of cities) {
      const items = destinationFaq(city);
      expect(items).toHaveLength(6);
      for (const item of items) {
        const count = words(item.a);
        if (count < 35 || count > 50) offenders.push(`${city.id} ${count} ${item.q}`);
        expect(item.q, city.id).not.toMatch(DASH);
        expect(item.a, city.id).not.toMatch(DASH);
        expect(item.q, city.id).not.toMatch(NON_ASCII);
        expect(item.a, city.id).not.toMatch(NON_ASCII);
        expect(faqHasAffiliate(item.q), city.id).toBe(false);
        expect(faqHasAffiliate(item.a), city.id).toBe(false);
        for (const link of item.officialLinks) {
          expect(link.href, city.id).toMatch(/https:\/\/([a-z0-9-]+\.)+(gob\.es|gov\.pt|go\.th)\//);
          expect(faqHasAffiliate(link.href), city.id).toBe(false);
        }
        expect(item.a).toMatch(/[A-Za-z]/);
      }
      const visa = items[2].a;
      expect(visa).toMatch(/verify/i);
    }
    expect(offenders).toEqual([]);
  });

  it('uses the Spain and Portugal initial-visa wording', () => {
    for (const city of cities) {
      if (city.countryCode !== 'ES' && city.countryCode !== 'PT') continue;
      if (!/digital nomad/i.test(city.meta.visaType)) continue;
      const visa = destinationFaq(city)[2].a;
      if (/d7/i.test(city.meta.visaType)) {
        expect(visa, city.id).toMatch(/initial D7/);
        expect(visa).toMatch(/passive-income/);
        continue;
      }
      expect(visa, city.id).toMatch(/initial visa/);
      if (city.countryCode === 'ES') {
        expect(visa).toMatch(/3 years/);
        expect(visa).toMatch(/Ley 14\/2013/);
      } else {
        expect(visa).toMatch(/2-year residence permit/);
        expect(visa).toMatch(/Lei 23\/2007/);
      }
    }
  });

  it('labels builder-default cost and internet figures as estimates', () => {
    for (const id of ['valencia-es', 'madrid-es', 'hoi-an-vn']) {
      const items = destinationFaq(cityById(id));
      expect(items[0].a).toMatch(/estimate/i);
      expect(items[0].a).toMatch(/Airbnb estimate/i);
      expect(items[1].a).toMatch(/estimated reliability|estimated power/i);
    }
  });

  it('names an overlap month when a row still lists one', () => {
    const valencia = cityById('valencia-es');
    const overlapped: City = {
      ...valencia,
      weather: {
        ...valencia.weather,
        bestMonths: ['Apr', 'May', 'Jun', 'Sep', 'Oct'],
        rainyMonths: ['Oct', 'Nov'],
      },
    };
    expect(destinationFaq(overlapped)[3].a).toMatch(/October as both a best and a rainy month/);
  });

  it('matches JSON-LD answer text to the visible strings and omits affiliate domains', () => {
    const lisbon = cityById('lisbon-pt');
    const items = destinationFaq(lisbon);
    const jsonLd = destinationFaqJsonLd(lisbon, 'https://www.digitalnomadspin.com/destinations/lisbon');
    const mainEntity = jsonLd.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;
    expect(mainEntity).toHaveLength(6);
    mainEntity.forEach((entity, index) => {
      expect(entity.name).toBe(items[index].q);
      expect(entity.acceptedAnswer.text).toBe(items[index].a);
    });
    const encoded = JSON.stringify(jsonLd);
    expect(faqHasAffiliate(encoded)).toBe(false);
    expect(encoded).not.toMatch(DASH);
    expect(encoded).not.toMatch(/booking\.com|skyscanner|ivisa|safetywing|airalo|cj\.com|impact\.com/i);
  });
});

describe('destination FAQ placement', () => {
  it('prints six quick answers on an indexable page and none on a sub-area page', () => {
    const lisbon = findCityBySlug('lisbon');
    expect(lisbon).toBeTruthy();
    const lisbonHtml = destinationBodyHtml(lisbon!.city, 'lisbon');
    expect(lisbonHtml).toContain('<h2>Quick answers</h2>');
    expect(lisbonHtml.match(/<h3>/g)).toHaveLength(6);
    expect(faqHasAffiliate(lisbonHtml)).toBe(false);
    expect(lisbonHtml).not.toMatch(DASH);

    const blocks = destinationPageJsonLd(
      lisbon!.city,
      'https://www.digitalnomadspin.com/destinations/lisbon',
      'lisbon',
    );
    expect(Array.isArray(blocks)).toBe(true);
    const faqBlock = (blocks as object[])[1] as { '@type': string };
    expect(faqBlock['@type']).toBe('FAQPage');

    const outskirts = findCityBySlug('da-nang-outskirts');
    expect(outskirts).toBeTruthy();
    const outskirtsHtml = destinationBodyHtml(outskirts!.city, 'da-nang-outskirts');
    expect(outskirtsHtml).not.toContain('Quick answers');
    expect(outskirtsHtml).not.toContain('FAQPage');
    const outskirtsLd = destinationPageJsonLd(
      outskirts!.city,
      'https://www.digitalnomadspin.com/destinations/da-nang-outskirts',
      'da-nang-outskirts',
    );
    expect(Array.isArray(outskirtsLd)).toBe(false);
    expect(JSON.stringify(outskirtsLd)).not.toContain('FAQPage');
  });

  it('renders six quick answers on Lisbon and none on a sub-area page', async () => {
    renderDestination('lisbon');
    expect(await screen.findByRole('heading', { name: 'Quick answers' })).toBeTruthy();
    expect(document.querySelectorAll('#faq details')).toHaveLength(6);
    expect(document.body.textContent).not.toMatch(DASH);

    await waitFor(() => {
      const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.textContent ?? '');
      expect(scripts.some((script) => script.includes('FAQPage'))).toBe(true);
      expect(scripts.some((script) => script.includes('TouristDestination'))).toBe(true);
      for (const script of scripts) {
        expect(faqHasAffiliate(script)).toBe(false);
        expect(script).not.toMatch(/booking\.com|skyscanner|ivisa|safetywing|airalo/i);
      }
    });
  });

  it('does not render quick answers on a noindex sub-area page', async () => {
    renderDestination('da-nang-outskirts');
    expect(await screen.findByRole('heading', { level: 1, name: /Da Nang Outskirts/ })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Quick answers' })).toBeNull();
    await waitFor(() => {
      const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.textContent ?? '');
      expect(scripts.some((script) => script.includes('FAQPage'))).toBe(false);
    });
  });
});
