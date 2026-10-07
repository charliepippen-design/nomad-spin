import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { GUIDE_FETCH_TIMEOUT_MS, useGuides } from '@/hooks/useGuides';
import GuideArticle from '@/pages/GuideArticle';
import GuidesList from '@/pages/GuidesList';

type QueryMode = 'hang' | 'error' | 'live';

const queryState = vi.hoisted(() => ({
  configured: true,
  mode: 'hang' as QueryMode,
}));

function livePayload() {
  if (queryState.mode === 'error') {
    return { data: null, error: { message: 'network down' } };
  }
  return {
    data: [
      {
        id: 99,
        city: 'Chiang Mai',
        keyword: 'chiang mai',
        title: 'Live Chiang Mai Guide',
        content: 'LIVE_GUIDE_BODY from the database.',
        status: 'published',
        created_at: '2026-10-07T00:00:00.000Z',
        slug: 'living-in-chiang-mai',
      },
    ],
    error: null,
  };
}

vi.mock('@/integrations/supabase/client', () => ({
  get isSupabaseConfigured() {
    return queryState.configured;
  },
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          abortSignal: () => ({
            then: (
              onFulfilled?: (value: unknown) => unknown,
              onRejected?: (reason: unknown) => unknown,
            ) => {
              if (queryState.mode === 'hang') return new Promise(() => {});
              return Promise.resolve(livePayload()).then(onFulfilled, onRejected);
            },
          }),
        }),
      }),
    }),
  },
}));

function queryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderArticle(slug = 'living-in-chiang-mai') {
  return render(
    <QueryClientProvider client={queryClient()}>
      <HelmetProvider>
        <MemoryRouter initialEntries={[`/guides/${slug}`]}>
          <Routes>
            <Route path="/guides/:slug" element={<GuideArticle />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>
    </QueryClientProvider>,
  );
}

function renderList() {
  return render(
    <QueryClientProvider client={queryClient()}>
      <HelmetProvider>
        <MemoryRouter>
          <GuidesList />
        </MemoryRouter>
      </HelmetProvider>
    </QueryClientProvider>,
  );
}

function renderGuidesHook() {
  const client = queryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useGuides(), { wrapper });
}

const CHIANG_MAI_TITLE = /the ultimate guide to living in chiang mai/i;

beforeEach(() => {
  queryState.configured = true;
  queryState.mode = 'hang';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('guide pages when the live database does not answer', () => {
  it('shows the Chiang Mai article immediately while the query hangs', async () => {
    vi.useFakeTimers();
    renderArticle();

    expect(screen.getByRole('heading', { level: 1, name: CHIANG_MAI_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /is chiang mai still worth it/i })).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeNull();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(GUIDE_FETCH_TIMEOUT_MS + 1);
    });

    expect(screen.getByRole('heading', { level: 1, name: CHIANG_MAI_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /is chiang mai still worth it/i })).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeNull();
  });

  it('shows the Chiang Mai article when the query fails', async () => {
    queryState.mode = 'error';
    renderArticle();

    expect(screen.getByRole('heading', { level: 1, name: CHIANG_MAI_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /is chiang mai still worth it/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).toBeNull();
    });
    expect(screen.getByRole('heading', { level: 1, name: CHIANG_MAI_TITLE })).toBeInTheDocument();
  });

  it('shows the Chiang Mai article when Supabase env is missing', async () => {
    queryState.configured = false;
    queryState.mode = 'hang';
    vi.useFakeTimers();
    renderArticle();

    expect(screen.getByRole('heading', { level: 1, name: CHIANG_MAI_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /is chiang mai still worth it/i })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByRole('heading', { level: 1, name: CHIANG_MAI_TITLE })).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeNull();
  });

  it('upgrades a static article when the live row arrives', async () => {
    queryState.mode = 'live';
    renderArticle();

    expect(await screen.findByRole('heading', { level: 1, name: /live chiang mai guide/i })).toBeInTheDocument();
    expect(screen.getByText(/LIVE_GUIDE_BODY from the database/)).toBeInTheDocument();
  });

  it('keeps the guides grid visible while the live query hangs, then shows the cached-content warning', async () => {
    vi.useFakeTimers();
    renderList();

    expect(screen.getByRole('link', { name: CHIANG_MAI_TITLE })).toBeInTheDocument();
    expect(screen.queryByText(/loading guides/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/could not reach the live guide database/i)).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(GUIDE_FETCH_TIMEOUT_MS + 1);
    });

    expect(screen.getByText(/could not reach the live guide database/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: CHIANG_MAI_TITLE })).toBeInTheDocument();
    expect(screen.queryByText(/loading guides/i)).not.toBeInTheDocument();
  });

  it('settles a hanging query as an error once the timeout fires', async () => {
    vi.useFakeTimers();
    const { result } = renderGuidesHook();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(GUIDE_FETCH_TIMEOUT_MS + 1);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('settles immediately when Supabase is not configured', async () => {
    queryState.configured = false;
    vi.useFakeTimers();
    const { result } = renderGuidesHook();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });
});
