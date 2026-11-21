import { beforeAll, describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { ComponentType } from 'react';
import { staticPageBodyHtml, staticPagesPrerender } from '@/lib/staticPagesPrerender';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { loadLocale } from '@/i18n/dictionary';
import { localizePath } from '@/i18n/paths';
import About from '@/pages/About';
import Compare from '@/pages/Compare';
import Contact from '@/pages/Contact';
import FindYourBase from '@/pages/FindYourBase';
import Methodology from '@/pages/Methodology';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfUse from '@/pages/TermsOfUse';

const PAGES: Record<string, ComponentType> = {
  compare: Compare,
  'find-your-base': FindYourBase,
  methodology: Methodology,
  about: About,
  contact: Contact,
  'privacy-policy': PrivacyPolicy,
  'terms-of-use': TermsOfUse,
};

const text = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim();

describe('prerendered static pages', () => {
  const pages = staticPagesPrerender();

  it('covers every static route once', () => {
    expect(pages.map((p) => p.route).sort()).toEqual(Object.keys(PAGES).sort());
  });

  it('gives each page its own title, description and H1', () => {
    for (const key of ['title', 'description', 'h1'] as const) {
      expect(new Set(pages.map((p) => p[key])).size).toBe(pages.length);
    }
    for (const page of pages) {
      const html = staticPageBodyHtml(page);
      expect(html.match(/<h1>/g)).toHaveLength(1);
      expect(page.description.length).toBeGreaterThan(40);
      expect(html.replace(/<[^>]+>/g, ' ').trim().length).toBeGreaterThan(200);
    }
  });

  it('keeps English as the default language', () => {
    expect(staticPagesPrerender('en')).toEqual(pages);
    const about = pages.find((p) => p.route === 'about')!;
    expect(about.title).toBe('About | Nomad Spin');
    expect(about.h1).toBe('About Nomad Spin');
    expect(staticPageBodyHtml(about)).toBe(staticPageBodyHtml(about, 'en'));
    expect(staticPageBodyHtml(about)).toContain('<a href="/contact" style="color:#55E6B0">Get in touch</a>');
    const privacy = pages.find((p) => p.route === 'privacy-policy')!;
    expect(privacy.body).toContain('<p><strong>Last updated:</strong> November 2026</p>');
  });

  for (const page of pages) {
    it(`/${page.route} matches the React page title, description and H1`, async () => {
      const Page = PAGES[page.route];
      const { container, unmount } = render(
        <HelmetProvider>
          <MemoryRouter initialEntries={[`/${page.route}`]}>
            <Page />
          </MemoryRouter>
        </HelmetProvider>,
      );
      expect(text(container.querySelector('h1')?.textContent)).toBe(page.h1);
      await waitFor(() => expect(document.title).toBe(page.title));
      expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description);
      unmount();
    });
  }
});

describe('prerendered static pages in Italian', () => {
  const english = staticPagesPrerender();

  beforeAll(async () => {
    await loadLocale('it');
  });

  it('keeps the English routes and translates title, description, H1 and body', () => {
    const pages = staticPagesPrerender('it');
    expect(pages.map((p) => p.route)).toEqual(english.map((p) => p.route));
    for (const key of ['title', 'description', 'h1'] as const) {
      expect(new Set(pages.map((p) => p[key])).size).toBe(pages.length);
    }
    pages.forEach((page, index) => {
      const source = english[index];
      for (const key of ['title', 'description', 'h1', 'body'] as const) {
        expect(page[key], `${page.route} ${key}`).not.toBe(source[key]);
      }
      const html = staticPageBodyHtml(page, 'it');
      expect(html.match(/<h1>/g)).toHaveLength(1);
      expect(page.description.length).toBeGreaterThan(40);
      expect(html.replace(/<[^>]+>/g, ' ').trim().length).toBeGreaterThan(200);
      // Same structure as the English page: only the words change.
      const tags = (value: string) => (value.match(/<\/?[a-z0-9]+/g) ?? []).join(' ');
      expect(tags(html), page.route).toBe(tags(staticPageBodyHtml(source)));
      // No dictionary mark or unfilled placeholder left in the markup.
      expect(html).not.toMatch(/<\/?(b|link\d*)>|\{\w+\}/);
    });
  });

  it('sends every link to the Italian page', () => {
    for (const page of staticPagesPrerender('it')) {
      const hrefs = [...staticPageBodyHtml(page, 'it').matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs.length).toBeGreaterThan(2);
      for (const href of hrefs) expect(href, page.route).toMatch(/^\/it(\/|$)/);
    }
    const about = staticPagesPrerender('it').find((p) => p.route === 'about')!;
    expect(staticPageBodyHtml(about, 'it')).toContain('href="/it/contatti"');
    expect(staticPageBodyHtml(about, 'it')).toContain('href="/it/metodologia"');
  });

  it('formats dates and numbers the Italian way and keeps tool names', () => {
    const pages = staticPagesPrerender('it');
    const privacy = pages.find((p) => p.route === 'privacy-policy')!;
    expect(privacy.body).toContain('novembre 2026');
    for (const name of ['Vercel Web Analytics', 'Google Tag Manager', 'Google Analytics 4', 'Impact', 'Supabase']) {
      expect(privacy.body).toContain(name);
    }
    expect(privacy.body).toContain('_ga_VPE2BV06K7');
    const methodology = pages.find((p) => p.route === 'methodology')!;
    expect(methodology.body).toMatch(/\d{1,2} novembre 2026/);
    expect(methodology.body).not.toMatch(/November/);
  });

  for (const source of english) {
    it(`/${source.route} matches the React page in Italian`, async () => {
      const page = staticPagesPrerender('it').find((p) => p.route === source.route)!;
      const Page = PAGES[page.route];
      const url = localizePath(`/${page.route}`, 'it');
      expect(url).not.toBeNull();
      const { container, unmount } = render(
        <HelmetProvider>
          <MemoryRouter initialEntries={[url!]}>
            <LocaleProvider>
              <Page />
            </LocaleProvider>
          </MemoryRouter>
        </HelmetProvider>,
      );
      expect(text(container.querySelector('h1')?.textContent)).toBe(page.h1);
      await waitFor(() => expect(document.title).toBe(page.title));
      expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(page.description);
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        `https://www.digitalnomadspin.com${url}`,
      );
      unmount();
    });
  }
});
