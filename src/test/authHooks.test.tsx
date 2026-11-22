import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const { auth, calls, tables, from } = vi.hoisted(() => {
  const auth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    resend: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(async () => ({ data: { session: null } })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  };

  /** Minimal stand-in for the query builder: records calls, answers from `tables`. */
  const calls: string[] = [];
  const tables: Record<string, { rows: any[]; row: any }> = {};
  function from(table: string) {
    const state = tables[table] ?? { rows: [], row: null };
    const builder: any = {
      select: () => { calls.push(`${table}.select`); return builder; },
      insert: (rows: any) => { calls.push(`${table}.insert:${Array.isArray(rows) ? rows.map((r) => r.city_id).join(',') : rows.city_id}`); return Promise.resolve({ error: null }); },
      update: (values: any) => { calls.push(`${table}.update:${Object.keys(values).sort().join(',')}`); return builder; },
      eq: () => builder,
      order: () => Promise.resolve({ data: state.rows, error: null }),
      maybeSingle: () => Promise.resolve({ data: state.row, error: null }),
      then: (resolve: any) => resolve({ data: state.rows, error: null }),
    };
    return builder;
  }
  return { auth, calls, tables, from };
});

vi.mock('@/integrations/supabase/client', () => ({
  isSupabaseConfigured: true,
  supabase: { auth, from: (table: string) => from(table) },
}));

import { accountInitial, useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useSpinStore } from '@/store/useSpinStore';
import { findCityBySlug } from '@/lib/citySlug';
import { origins } from '@/data/origins';

const lisbon = findCityBySlug('lisbon')!.city;
const bangkok = findCityBySlug('bangkok')!.city;
const athens = origins.find((o) => o.id === 'athens-gr')!;

beforeEach(() => {
  calls.length = 0;
  for (const key of Object.keys(tables)) delete tables[key];
  Object.values(auth).forEach((fn) => fn.mockClear());
  localStorage.clear();
  useSpinStore.setState({ savedSpins: [] });
  useSpinStore.getState().setPreferences({ budgetRange: [500, 3000], internetMin: 20, safetyMin: 5, vibes: [], region: 'All', origin: null });
});

describe('useAuth.signUp', () => {
  it('reports that the email must be confirmed when no session comes back', async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null });
    const { result } = renderHook(() => useAuth());
    const out = await result.current.signUp(' new@example.com ', 'secret1', '  Ada ');
    expect(out).toEqual({ error: null, alreadyRegistered: false, needsConfirmation: true });
    const sent = auth.signUp.mock.calls[0][0];
    expect(sent.email).toBe('new@example.com');
    expect(sent.options.data).toEqual({ display_name: 'Ada' });
    expect(sent.options.emailRedirectTo).toBe(window.location.origin);
  });

  it('sends no placeholder name when the name is left empty', async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [{}] }, session: null }, error: null });
    const { result } = renderHook(() => useAuth());
    await result.current.signUp('new@example.com', 'secret1', '');
    expect(auth.signUp.mock.calls[0][0].options.data).toEqual({});
  });

  it('spots an email that already has an account', async () => {
    auth.signUp.mockResolvedValue({ data: { user: { identities: [] }, session: null }, error: null });
    const { result } = renderHook(() => useAuth());
    const out = await result.current.signUp('old@example.com', 'secret1');
    expect(out).toEqual({ error: null, alreadyRegistered: true, needsConfirmation: false });
  });

  it('turns a thrown network error into a result instead of crashing', async () => {
    auth.signInWithPassword.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useAuth());
    const out = await result.current.signIn('me@example.com', 'secret1');
    expect(out.error?.message).toBe('Failed to fetch');
  });

  it('password reset and confirmation emails point back to this site', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    auth.resend.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useAuth());
    await result.current.requestPasswordReset('me@example.com');
    await result.current.resendConfirmation('me@example.com');
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('me@example.com', { redirectTo: window.location.origin });
    expect(auth.resend.mock.calls[0][0]).toMatchObject({ type: 'signup', email: 'me@example.com' });
  });

  it('avatar letter skips the old placeholder name', () => {
    expect(accountInitial({ email: 'zoe@example.com', user_metadata: { display_name: 'OPERATIVE' } } as any)).toBe('Z');
    expect(accountInitial({ email: 'zoe@example.com', user_metadata: { display_name: 'ada' } } as any)).toBe('A');
    expect(accountInitial(null)).toBe('U');
  });
});

describe('useCloudSync.syncOnSignIn', () => {
  const cloudRow = (city: typeof lisbon) => ({ city_id: city.id, city_data: city, preferences: {}, created_at: '2026-01-01T00:00:00Z' });

  it('pushes device picks first, then loads the account picks, then settings', async () => {
    useSpinStore.getState().saveCity(lisbon);
    tables.saved_spins = { rows: [cloudRow(bangkok)], row: null };
    tables.user_preferences = { rows: [], row: { budget_min: 800, budget_max: 2000, internet_min: 50, safety_min: 7, vibes: ['beach'], region: 'Asia', origin_id: 'athens-gr' } };
    const { result } = renderHook(() => useCloudSync('u1'));
    await result.current.syncOnSignIn();

    expect(calls).toEqual([
      'saved_spins.select',
      `saved_spins.insert:${lisbon.id}`,
      'saved_spins.select',
      'user_preferences.select',
    ]);
    // The account had saved settings: they win, and nothing is written back.
    const prefs = useSpinStore.getState().preferences;
    expect(prefs.budgetRange).toEqual([800, 2000]);
    expect(prefs.region).toBe('Asia');
    expect(prefs.origin?.id).toBe('athens-gr');
  });

  it('a brand-new account takes the settings chosen on the device', async () => {
    useSpinStore.getState().setPreferences({ budgetRange: [700, 1500], origin: athens });
    tables.user_preferences = { rows: [], row: { budget_min: 500, budget_max: 3000, internet_min: 20, safety_min: 5, vibes: [], region: 'All', origin_id: null } };
    const { result } = renderHook(() => useCloudSync('u1'));
    await result.current.syncOnSignIn();

    expect(calls.some((c) => c.startsWith('user_preferences.update:budget_max'))).toBe(true);
    await waitFor(() => expect(useSpinStore.getState().preferences.budgetRange).toEqual([700, 1500]));
    expect(useSpinStore.getState().preferences.origin?.id).toBe('athens-gr');
  });

  it('does not insert a pick the account already has', async () => {
    useSpinStore.getState().saveCity(lisbon);
    tables.saved_spins = { rows: [cloudRow(lisbon)], row: null };
    const { result } = renderHook(() => useCloudSync('u1'));
    await result.current.pushLocalSpins();
    expect(calls.filter((c) => c.includes('insert'))).toEqual([]);
  });
});
