import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import AccountMenu from '@/components/AccountMenu';
import SavedPicksPanel from '@/components/SavedPicksPanel';
import { useAccountUi } from '@/store/useAccountUi';
import { useSpinStore } from '@/store/useSpinStore';
import { findCityBySlug } from '@/lib/citySlug';

const signOut = vi.fn();
const authState = { isAuthenticated: false, loading: false, user: null as null | { id: string; email: string } };

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ ...authState, session: null, signOut, signIn: vi.fn(), signUp: vi.fn() }),
}));

vi.mock('@/hooks/useCloudSync', () => ({
  useCloudSync: () => ({
    loadSavedSpins: vi.fn(),
    saveSpin: vi.fn(),
    removeSpin: vi.fn(),
    loadPreferences: vi.fn(),
    syncPreferences: vi.fn(),
    syncOrigin: vi.fn(),
    migrateLocalData: vi.fn(),
  }),
}));

const lisbon = findCityBySlug('lisbon')!.city;

function renderHeaderAccount() {
  return render(
    <MemoryRouter>
      <TooltipProvider>
        <AccountMenu />
        <SavedPicksPanel />
      </TooltipProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  signOut.mockClear();
  authState.isAuthenticated = false;
  authState.user = null;
  useAccountUi.setState({ authOpen: false, picksOpen: false });
  useSpinStore.setState({ savedSpins: [] });
});

afterEach(cleanup);

describe('account entry in the site header', () => {
  it('signed out: a single "Sign in" button that opens the sign-in modal', () => {
    renderHeaderAccount();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toBe('Sign in');
    fireEvent.click(buttons[0]);
    expect(useAccountUi.getState().authOpen).toBe(true);
    expect(screen.getByText('Welcome back')).toBeTruthy();
  });

  it('signed in: "My picks" shows the count, opens the panel and never signs out', () => {
    authState.isAuthenticated = true;
    authState.user = { id: 'u1', email: 'someone@example.com' };
    useSpinStore.getState().saveCity(lisbon);
    renderHeaderAccount();

    fireEvent.keyDown(screen.getByRole('button', { name: 'Account menu' }), { key: 'Enter' });
    const items = screen.getAllByRole('menuitem').map((i) => i.textContent);
    expect(items).toEqual(['My picks (1)', 'Sign out']);

    fireEvent.click(screen.getByRole('menuitem', { name: 'My picks (1)' }));
    expect(useAccountUi.getState().picksOpen).toBe(true);
    expect(signOut).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: /lisbon/i }).getAttribute('href')).toBe('/destinations/lisbon');

    // Closing the panel does not sign out either.
    fireEvent.click(screen.getByRole('button', { name: 'Close my picks' }));
    expect(useAccountUi.getState().picksOpen).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signed in: only "Sign out" signs out', () => {
    authState.isAuthenticated = true;
    authState.user = { id: 'u1', email: 'someone@example.com' };
    renderHeaderAccount();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Account menu' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('the panel says so when nothing is saved', () => {
    useAccountUi.setState({ picksOpen: true });
    renderHeaderAccount();
    expect(screen.getByText(/no saved cities yet/i)).toBeTruthy();
  });
});
