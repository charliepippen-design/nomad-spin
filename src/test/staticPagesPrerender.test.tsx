import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import type { ComponentType } from 'react';
import { staticPageBodyHtml, staticPagesPrerender } from '@/lib/staticPagesPrerender';
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
