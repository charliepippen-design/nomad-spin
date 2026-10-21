import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '@/components/ErrorBoundary';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { isLandscapeOption, isRegionOption, isVibeOption } from '@/store/useSpinStore';
import { isRecord, toJson } from '@/lib/json';

afterEach(() => {
  vi.restoreAllMocks();
});

function Boom(): JSX.Element {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(<ErrorBoundary><p>ok</p></ErrorBoundary>);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('shows a fallback with reload and home actions when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><Boom /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back home/i })).toHaveAttribute('href', '/');
  });

  it('clears the error when resetKey changes', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(<ErrorBoundary resetKey="/a"><Boom /></ErrorBoundary>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    rerender(<ErrorBoundary resetKey="/b"><p>recovered</p></ErrorBoundary>);
    expect(screen.getByText('recovered')).toBeInTheDocument();
  });
});

describe('usePrefersReducedMotion', () => {
  it('reflects matchMedia and reacts to changes', () => {
    let listener: ((e: MediaQueryListEvent) => void) | undefined;
    const mql = {
      matches: false,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => { listener = cb; },
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', vi.fn(() => mql));
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => listener?.({ matches: true } as MediaQueryListEvent));
    expect(result.current).toBe(true);
    vi.unstubAllGlobals();
  });
});

describe('type guards', () => {
  it('accepts only known preference options', () => {
    expect(isVibeOption('beach')).toBe(true);
    expect(isVibeOption('nope')).toBe(false);
    expect(isRegionOption('Europe')).toBe(true);
    expect(isRegionOption(null)).toBe(false);
    expect(isLandscapeOption('desert')).toBe(true);
    expect(isLandscapeOption('lava')).toBe(false);
  });

  it('serialises values to Json and detects records', () => {
    expect(toJson({ a: 1, b: undefined })).toEqual({ a: 1 });
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
  });
});
