/** Shape shared by Supabase auth errors and plain Errors. */
export interface AuthErrorLike {
  message?: string;
  code?: string;
  status?: number;
}

export const AUTH_UNAVAILABLE: AuthErrorLike = {
  code: 'auth_unavailable',
  message: 'Sign-in is not available right now. Please try again later.',
};

/** Plain-language text for an auth error. Never shows a raw server message for the known cases. */
export function authErrorMessage(error: AuthErrorLike | null | undefined): string {
  if (!error) return '';
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();

  if (code === 'auth_unavailable') return AUTH_UNAVAILABLE.message!;
  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return 'Wrong email or password. Check them and try again.';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Your email is not confirmed yet. Open the link we sent you, or ask for a new one below.';
  }
  if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered')) {
    return 'This email already has an account. Sign in, or reset your password if you forgot it.';
  }
  if (code === 'weak_password' || (msg.includes('password') && msg.includes('characters'))) {
    return 'That password is too short or too easy to guess. Use at least 6 characters.';
  }
  if (code === 'same_password' || msg.includes('different from the old password')) {
    return 'The new password must be different from the old one.';
  }
  if (code === 'over_email_send_rate_limit' || msg.includes('email rate limit')) {
    return 'Too many emails were requested. Wait a few minutes and try again.';
  }
  if (code === 'over_request_rate_limit' || msg.includes('for security purposes') || error.status === 429) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (code === 'email_address_invalid' || msg.includes('email address') && msg.includes('invalid')) {
    return 'That email address does not look right. Check it and try again.';
  }
  if (code === 'signup_disabled' || msg.includes('signups not allowed')) {
    return 'New accounts cannot be created right now.';
  }
  if (code === 'otp_expired' || msg.includes('expired') || msg.includes('invalid or has expired')) {
    return 'That link has expired or was already used. Ask for a new one.';
  }
  if (code === 'reauthentication_needed' || msg.includes('reauthentication')) {
    return 'For your security this needs a fresh sign-in. Sign out, choose "Forgot password?" and set the new password from the emailed link.';
  }
  if (code === 'session_not_found' || msg.includes('auth session missing')) {
    return 'Your session ended. Ask for a new password link and try again.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return "We can't reach the server. Check your connection and try again.";
  }
  return error.message || 'Something went wrong. Please try again.';
}

/**
 * What an auth link left in the URL when the page opened: a password-recovery
 * session, or an error such as an expired link. Read once, before the Supabase
 * client clears the hash.
 */
export interface AuthLinkOutcome {
  /** The link was a password-recovery one: the visitor must choose a new password. */
  recovery: boolean;
  /** The link confirmed a new account and signed the visitor in. */
  confirmed: boolean;
  error: AuthErrorLike | null;
}

export function readAuthLinkOutcome(hash: string, search = ''): AuthLinkOutcome {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const query = new URLSearchParams(search);
  const get = (key: string) => params.get(key) ?? query.get(key);
  const errorCode = get('error_code') ?? get('error');
  const error = errorCode
    ? { code: errorCode, message: (get('error_description') ?? errorCode).replace(/\+/g, ' ') }
    : null;
  const type = params.get('type');
  const hasSession = params.has('access_token');
  return {
    recovery: hasSession && type === 'recovery',
    confirmed: hasSession && type === 'signup',
    error,
  };
}
