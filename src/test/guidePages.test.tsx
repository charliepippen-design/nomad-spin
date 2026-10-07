import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GuideArticle from '@/pages/GuideArticle';
import GuidesList from '@/pages/GuidesList';

const guideQuery = vi.hoisted(() => vi.fn());

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          abortSignal: () => guideQuery(),
        }),
      }),
    }),
  },
}));

function renderAt(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <HelmetProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/guides" element={<GuidesList />} />
            <Route path="/guides/:slug" element={<GuideArticle />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    </QueryClientProvider>,
  );
}

describe('guide pages when the live database does not answer', () => {
  beforeEach(() => {
    guideQuery.mockReset();
  });

  it('renders the Chiang Mai guide body while the live query never settles', () => {
    guideQuery.mockImplementation(() => new Promise(() => {}));
    renderAt('/guides/living-in-chiang-mai');

    expect(screen.getByRole('heading', { level: 1, name: /ultimate guide to living in chiang mai/i })).toBeInTheDocument();
    expect(screen.getByText(/Nimman differs from the Old City/)).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeNull();
  });

  it('shows the guides index from the static catalog without a live-database warning', async () => {
    guideQuery.mockResolvedValue({ data: null, error: { message: 'connection refused' } });
    renderAt('/guides');

    expect(screen.getByRole('heading', { level: 2, name: /ultimate guide to living in chiang mai/i })).toBeInTheDocument();
    expect(screen.queryByText(/could not reach the live guide database/i)).toBeNull();

    await waitFor(() => {
      expect(guideQuery).toHaveBeenCalled();
    });
    expect(screen.queryByText(/could not reach the live guide database/i)).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: /ultimate guide to living in chiang mai/i })).toBeInTheDocument();
  });

  it('stops the spinner and shows not-found when an unknown slug times out of the live query', async () => {
    guideQuery.mockResolvedValue({ data: null, error: { message: 'timed out' } });
    renderAt('/guides/not-a-published-guide');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /404: MISSING/ })).toBeInTheDocument();
    });
    expect(document.querySelector('.animate-spin')).toBeNull();
  });

  it('replaces the static article when the live row arrives', async () => {
    guideQuery.mockResolvedValue({
      data: [
        {
          id: 42,
          city: 'Chiang Mai',
          keyword: 'chiang mai',
          title: 'Live Chiang Mai title from the database',
          content: '<p>Live body paragraph from the database.</p>',
          status: 'published',
          created_at: '2026-10-08T00:00:00.000Z',
          slug: 'living-in-chiang-mai',
        },
      ],
      error: null,
    });
    renderAt('/guides/living-in-chiang-mai');

    expect(await screen.findByRole('heading', { level: 1, name: /live chiang mai title from the database/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Live body paragraph from the database/)).toHaveLength(2);
    expect(screen.queryByRole('heading', { level: 1, name: /ultimate guide to living in chiang mai/i })).toBeNull();
  });
});
