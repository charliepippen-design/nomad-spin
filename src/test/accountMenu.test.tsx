import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import AccountMenu from '@/components/AccountMenu';
import SavedPicksPanel from '@/components/SavedPicksPanel';
import { useAccountUi } from '@/store/useAccountUi';
import { useSpinStore } from '@/store/useSpinStore';
import { findCityBySlug } from '@/lib/citySlug';

const signOut = vi.fn();
const pushLocalSpins = vi.fn(async () => {});
const authState = { isAuthenticated: false, loading: false, user: null as null | { id: string; email: string } };

vi.mock('@/hooks/useAuth', () => ({
  accountInitial: () => 'S',
  useAuth: () => ({
    ...authState,
    session: null,
    signOut,
    signIn: vi.fn(),
    signUp: vi.fn(),
    resendConfirmation: vi.fn(),
    requestPasswordReset: vi.fn(),
    updatePassword: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCloudSync', () => ({
  useCloudSync: () => ({
    loadSavedSpins: vi.fn(),
    saveSpin: vi.fn(),
    removeSpin: vi.fn(),
    syncPreferences: vi.fn(),
    syncOrigin: vi.fn(),
    pushLocalSpins,
    syncOnSignIn: vi.fn(),
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
  pushLocalSpins.mockClear();
  authState.isAuthenticated = false;
  authState.user = null;
  useAccountUi.setState({ authOpen: false, authView: 'signin', picksOpen: false });
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
    expect(items).toEqual(['My picks (1)', 'Change password', 'Sign out']);

    fireEvent.click(screen.getByRole('menuitem', { name: 'My picks (1)' }));
    expect(useAccountUi.getState().picksOpen).toBe(true);
    expect(signOut).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: /lisbon/i }).getAttribute('href')).toBe('/destinations/lisbon');

    // Closing the panel does not sign out either.
    fireEvent.click(screen.getByRole('button', { name: 'Close my picks' }));
    expect(useAccountUi.getState().picksOpen).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signed in: "Sign out" saves the device picks, signs out and clears the local copy', async () => {
    authState.isAuthenticated = true;
    authState.user = { id: 'u1', email: 'someone@example.com' };
    useSpinStore.getState().saveCity(lisbon);
    renderHeaderAccount();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Account menu' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(pushLocalSpins).toHaveBeenCalledTimes(1);
    expect(pushLocalSpins.mock.invocationCallOrder[0]).toBeLessThan(signOut.mock.invocationCallOrder[0]);
    await waitFor(() => expect(useSpinStore.getState().savedSpins).toHaveLength(0));
    expect(localStorage.getItem('savedSpins')).toBeNull();
  });

  it('signed in: "Change password" opens the new-password screen without signing out', () => {
    authState.isAuthenticated = true;
    authState.user = { id: 'u1', email: 'someone@example.com' };
    renderHeaderAccount();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Account menu' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Change password' }));
    expect(screen.getByRole('heading', { name: 'Choose a new password' })).toBeTruthy();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('the panel says so when nothing is saved', () => {
    useAccountUi.setState({ picksOpen: true });
    renderHeaderAccount();
    expect(screen.getByText(/no saved cities yet/i)).toBeTruthy();
  });
});
