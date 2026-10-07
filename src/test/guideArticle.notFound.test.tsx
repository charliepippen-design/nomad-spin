import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import GuideArticle from '@/pages/GuideArticle';

vi.mock('@/hooks/useGuides', () => ({
  useGuides: () => ({
    data: undefined,
    isLoading: false,
    isError: true,
    error: new Error('offline'),
  }),
}));

const NOT_FOUND_TITLE = 'Page Not Found (404) | Nomad Spin';

function renderGuide(slug: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/guides/${slug}`]}>
        <Routes>
          <Route path="/guides/:slug" element={<GuideArticle />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('GuideArticle unknown slug', () => {
  it('sets a Page Not Found title and noindex, without an em dash', async () => {
    renderGuide('living-in-not-a-real-city-xyz');

    expect(screen.getByRole('heading', { level: 1, name: '404: MISSING' })).toBeInTheDocument();

    await waitFor(() => {
      expect(document.title).toBe(NOT_FOUND_TITLE);
    });
    expect(document.title).not.toContain('\u2014');
    expect(document.title).not.toContain('\u2013');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
  });

  it('does not noindex a known guide', async () => {
    renderGuide('living-in-lisbon');

    expect(
      screen.getByRole('heading', { level: 1, name: /the ultimate guide to living in lisbon/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(document.title).toContain('Lisbon');
    });
    expect(document.title).not.toBe(NOT_FOUND_TITLE);
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
  });
});
