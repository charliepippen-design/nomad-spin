import { render, screen, waitFor, within } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Layout from '@/components/Layout';
import NotFound from '@/pages/NotFound';

function renderMissing() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/not-a-real-page']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('NotFound', () => {
  it('keeps the site header and a noindex title', async () => {
    renderMissing();

    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Spin' })).toHaveAttribute('href', '/');
    expect(within(header).getByRole('link', { name: 'Guides' })).toHaveAttribute('href', '/guides');
    expect(within(header).getByRole('link', { name: 'Destinations' })).toHaveAttribute('href', '/destinations');
    expect(within(header).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();

    await waitFor(() => {
      expect(document.title).toBe('Page Not Found (404) | Nomad Spin');
    });
    const robots = document.head.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toBe('noindex, follow');
    expect(document.title).not.toContain('\u2014');
  });
});
