import { useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { AUTH_UNAVAILABLE, type AuthErrorLike } from '@/lib/authErrors';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface AuthResult {
  error: AuthErrorLike | null;
}

export interface SignUpResult extends AuthResult {
  /** The account exists but the visitor must open the emailed link before signing in. */
  needsConfirmation?: boolean;
  /** The email already has an account: nothing was created and no email was sent. */
  alreadyRegistered?: boolean;
}

/** Runs an auth call and turns a thrown error (network down, bad config) into a result. */
async function guarded<T extends AuthResult>(run: () => Promise<T>): Promise<T | AuthResult> {
  if (!isSupabaseConfigured) return { error: AUTH_UNAVAILABLE };
  try {
    return await run();
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Failed to fetch' } };
  }
}

/** First letter shown in the avatar. Old accounts carry a placeholder name, which is skipped. */
export function accountInitial(user: User | null): string {
  const name = user?.user_metadata?.display_name;
  const label = name && name !== 'OPERATIVE' ? name : user?.email;
  return (label || 'U')[0].toUpperCase();
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    }).catch(() => {
      setState({ user: null, session: null, loading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(
    (email: string, password: string, displayName?: string): Promise<SignUpResult> =>
      guarded<SignUpResult>(async () => {
        const name = displayName?.trim();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: name ? { display_name: name } : {},
          },
        });
        if (error) return { error };
        // With email confirmation on, a sign-up for an existing address answers
        // like a new one but carries no identity and sends no email.
        const alreadyRegistered = !!data.user && (data.user.identities?.length ?? 0) === 0;
        return { error: null, alreadyRegistered, needsConfirmation: !alreadyRegistered && !data.session };
      }),
    [],
  );

  const signIn = useCallback(
    (email: string, password: string): Promise<AuthResult> =>
      guarded(async () => {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        return { error };
      }),
    [],
  );

  /** Sends the confirmation email again. */
  const resendConfirmation = useCallback(
    (email: string): Promise<AuthResult> =>
      guarded(async () => {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: { emailRedirectTo: window.location.origin },
        });
        return { error };
      }),
    [],
  );

  /** Emails a link that opens the site with a session allowed to set a new password. */
  const requestPasswordReset = useCallback(
    (email: string): Promise<AuthResult> =>
      guarded(async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
        return { error };
      }),
    [],
  );

  /** Sets a new password for the signed-in visitor (also after a recovery link). */
  const updatePassword = useCallback(
    (password: string): Promise<AuthResult> =>
      guarded(async () => {
        const { error } = await supabase.auth.updateUser({ password });
        return { error };
      }),
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Offline: the local session is dropped anyway.
    }
  }, []);

  return {
    ...state,
    isAuthenticated: !!state.user,
    signUp,
    signIn,
    resendConfirmation,
    requestPasswordReset,
    updatePassword,
    signOut,
  };
}
