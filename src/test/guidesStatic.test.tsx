import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { guides } from '@/data/guides';
import GuideArticle from '@/pages/GuideArticle';
import GuidesList from '@/pages/GuidesList';

const supabaseCalls = vi.hoisted(() => ({ from: 0 }));

vi.mock('@/integrations/supabase/client', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => {
      supabaseCalls.from += 1;
      throw new Error('guides must not read Supabase');
    },
  },
}));

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/guides" element={<GuidesList />} />
          <Route path="/guides/:slug" element={<GuideArticle />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('guides use static content only', () => {
  it('renders every static guide on /guides with no Supabase call and no warning', () => {
    supabaseCalls.from = 0;
    renderAt('/guides');

    const hrefs = Array.from(document.querySelectorAll('a[href^="/guides/"]')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(guides.map((guide) => `/guides/${guide.slug}`));
    for (const guide of guides) {
      expect(screen.getByRole('heading', { level: 2, name: guide.title })).toBeInTheDocument();
    }
    expect(screen.queryByText(/could not reach the live guide database/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/loading guides/i)).not.toBeInTheDocument();
    expect(supabaseCalls.from).toBe(0);
  });

  it('renders a guide article on first paint with no Supabase call or spinner', () => {
    supabaseCalls.from = 0;
    renderAt('/guides/living-in-chiang-mai');

    expect(
      screen.getByRole('heading', { level: 1, name: /the ultimate guide to living in chiang mai/i }),
    ).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeNull();
    expect(supabaseCalls.from).toBe(0);
  });
});
