import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AuthModal from '@/components/AuthModal';
import { authErrorMessage, readAuthLinkOutcome } from '@/lib/authErrors';
import type { AuthView } from '@/store/useAccountUi';

const ok = { error: null };

function setup(overrides: Partial<React.ComponentProps<typeof AuthModal>> = {}, startView: AuthView = 'signin') {
  const handlers = {
    onClose: vi.fn(),
    onSignIn: vi.fn(async () => ok),
    onSignUp: vi.fn(async () => ({ error: null, needsConfirmation: true })),
    onResendConfirmation: vi.fn(async () => ok),
    onRequestPasswordReset: vi.fn(async () => ok),
    onUpdatePassword: vi.fn(async () => ok),
    ...overrides,
  };
  function Harness() {
    const [view, setView] = useState<AuthView>(startView);
    return <AuthModal open view={view} onViewChange={setView} {...handlers} />;
  }
  render(<Harness />);
  return handlers;
}

const type = (label: RegExp | string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const heading = () => screen.getByRole('heading').textContent;

afterEach(cleanup);

describe('placement', () => {
  it('renders on <body>, not inside the header that opens it', () => {
    const handlers = {
      onClose: vi.fn(), onViewChange: vi.fn(), onSignIn: vi.fn(), onSignUp: vi.fn(),
      onResendConfirmation: vi.fn(), onRequestPasswordReset: vi.fn(), onUpdatePassword: vi.fn(),
    };
    render(<header data-testid="site-header"><AuthModal open view="signin" {...handlers} /></header>);
    const dialog = screen.getByRole('dialog');
    expect(screen.getByTestId('site-header').contains(dialog)).toBe(false);
    expect(document.body.contains(dialog)).toBe(true);
  });
});

describe('creating an account', () => {
  it('with email confirmation on, says to check the inbox and does not claim the visitor is signed in', async () => {
    const h = setup();
    fireEvent.click(screen.getByRole('tab', { name: 'Create account' }));
    type('Email', 'new@example.com');
    type('Password', 'secret1');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(heading()).toBe('Check your inbox'));
    expect(h.onSignUp).toHaveBeenCalledWith('new@example.com', 'secret1', '');
    expect(screen.getByText('new@example.com')).toBeTruthy();
    expect(screen.getByText(/not signed in until you do/i)).toBeTruthy();
    expect(h.onClose).not.toHaveBeenCalled();
    expect(screen.queryByText(/you're in/i)).toBeNull();
  });

  it('the "send again" button waits before it can be used, then resends', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const h = setup();
      fireEvent.click(screen.getByRole('tab', { name: 'Create account' }));
      type('Email', 'new@example.com');
      type('Password', 'secret1');
      fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
      const waiting = await screen.findByRole('button', { name: /send the email again in \d+s/i });
      expect((waiting as HTMLButtonElement).disabled).toBe(true);

      for (let i = 0; i < 61; i++) await vi.advanceTimersByTimeAsync(1000);
      const ready = screen.getByRole('button', { name: 'Send the email again' });
      fireEvent.click(ready);
      await waitFor(() => expect(h.onResendConfirmation).toHaveBeenCalledWith('new@example.com'));
      expect(await screen.findByText(/we sent a new link to new@example.com/i)).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('an email that already has an account goes back to sign-in with a clear message', async () => {
    setup({ onSignUp: vi.fn(async () => ({ error: null, alreadyRegistered: true })) });
    fireEvent.click(screen.getByRole('tab', { name: 'Create account' }));
    type('Email', 'old@example.com');
    type('Password', 'secret1');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(heading()).toBe('Welcome back'));
    expect(screen.getByRole('alert').textContent).toMatch(/already has an account/i);
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('old@example.com');
  });

  it('closes when the project signs the visitor in straight away', async () => {
    const h = setup({ onSignUp: vi.fn(async () => ({ error: null, needsConfirmation: false })) });
    fireEvent.click(screen.getByRole('tab', { name: 'Create account' }));
    type('Email', 'new@example.com');
    type('Password', 'secret1');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(h.onClose).toHaveBeenCalledTimes(1));
  });
});

describe('signing in', () => {
  it('closes on success', async () => {
    const h = setup();
    type('Email', 'me@example.com');
    type('Password', 'secret1');
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(h.onClose).toHaveBeenCalledTimes(1));
    expect(h.onSignIn).toHaveBeenCalledWith('me@example.com', 'secret1');
  });

  it('wrong password: plain message, modal stays open', async () => {
    const h = setup({
      onSignIn: vi.fn(async () => ({ error: { code: 'invalid_credentials', message: 'Invalid login credentials' } })),
    });
    type('Email', 'me@example.com');
    type('Password', 'nope');
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/wrong email or password/i);
    expect(h.onClose).not.toHaveBeenCalled();
  });

  it('unconfirmed email: offers to send the confirmation again', async () => {
    const h = setup({
      onSignIn: vi.fn(async () => ({ error: { code: 'email_not_confirmed', message: 'Email not confirmed' } })),
    });
    type('Email', 'me@example.com');
    type('Password', 'secret1');
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Send the email again' }));
    await waitFor(() => expect(h.onResendConfirmation).toHaveBeenCalledWith('me@example.com'));
  });
});

describe('forgotten password', () => {
  it('asks for the email and confirms without saying whether the account exists', async () => {
    const h = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(heading()).toBe('Forgot your password?');
    type('Email', 'me@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Send the link' }));
    await waitFor(() => expect(h.onRequestPasswordReset).toHaveBeenCalledWith('me@example.com'));
    expect(await screen.findByText(/has an account, a link to choose a new password/i)).toBeTruthy();
  });

  it('new password: the two fields must match before anything is sent', async () => {
    const h = setup({}, 'new-password');
    type('New password', 'secret1');
    type('Repeat the new password', 'secret2');
    fireEvent.click(screen.getByRole('button', { name: 'Save the new password' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/do not match/i);
    expect(h.onUpdatePassword).not.toHaveBeenCalled();

    type('Repeat the new password', 'secret1');
    fireEvent.click(screen.getByRole('button', { name: 'Save the new password' }));
    await waitFor(() => expect(h.onUpdatePassword).toHaveBeenCalledWith('secret1'));
    await waitFor(() => expect(h.onClose).toHaveBeenCalledTimes(1));
  });
});

describe('auth messages and emailed links', () => {
  it('known errors get plain wording', () => {
    expect(authErrorMessage({ code: 'over_email_send_rate_limit' })).toMatch(/too many emails/i);
    expect(authErrorMessage({ message: 'For security purposes, you can only request this after 40 seconds.' })).toMatch(/too many attempts/i);
    expect(authErrorMessage({ message: 'Failed to fetch' })).toMatch(/can't reach the server/i);
    expect(authErrorMessage({ code: 'auth_unavailable' })).toMatch(/not available right now/i);
    expect(authErrorMessage({ code: 'weak_password' })).toMatch(/at least 6 characters/i);
  });

  it('reads a recovery link, a confirmation link and an expired link', () => {
    expect(readAuthLinkOutcome('#access_token=abc&refresh_token=def&type=recovery')).toEqual({
      recovery: true, confirmed: false, error: null,
    });
    expect(readAuthLinkOutcome('#access_token=abc&type=signup').confirmed).toBe(true);
    const expired = readAuthLinkOutcome('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired');
    expect(expired.recovery).toBe(false);
    expect(authErrorMessage(expired.error)).toMatch(/expired or was already used/i);
    expect(readAuthLinkOutcome('')).toEqual({ recovery: false, confirmed: false, error: null });
  });
});
