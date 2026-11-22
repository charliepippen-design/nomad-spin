import { useEffect, useRef } from 'react';
import { Bookmark, KeyRound, LogOut } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { accountInitial, useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useSignOut } from '@/hooks/useSignOut';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { authErrorMessage, readAuthLinkOutcome } from '@/lib/authErrors';
import { useSpinStore } from '@/store/useSpinStore';
import { useAccountUi } from '@/store/useAccountUi';

// What an emailed link left in the URL, read before the Supabase client clears it.
const linkOutcome =
  typeof window !== 'undefined'
    ? readAuthLinkOutcome(window.location.hash, window.location.search)
    : { recovery: false, confirmed: false, error: null };

/**
 * Account entry of the site header, present on every page.
 * Signed out: one "Sign in" button. Signed in: an avatar with "My picks",
 * "Change password" and "Sign out". It also owns the sign-in modal, the handling
 * of emailed links and the account sync that runs after signing in.
 */
export default function AccountMenu() {
  const auth = useAuth();
  const cloudSync = useCloudSync(auth.user?.id);
  const signOut = useSignOut();
  const { toast } = useToast();
  const authOpen = useAccountUi((s) => s.authOpen);
  const authView = useAccountUi((s) => s.authView);
  const setAuthOpen = useAccountUi((s) => s.setAuthOpen);
  const setPicksOpen = useAccountUi((s) => s.setPicksOpen);
  const picksCount = useSpinStore((s) => s.savedSpins.length);
  const syncedFor = useRef<string | null>(null);
  // True once this page has seen the visitor signed out: a later sign-in is then a fresh one.
  const sawSignedOut = useRef(false);
  const linkHandled = useRef(false);

  // An emailed link opened the site: say what happened.
  useEffect(() => {
    if (linkHandled.current) return;
    linkHandled.current = true;
    if (linkOutcome.error) {
      toast({ title: 'That link did not work', description: authErrorMessage(linkOutcome.error) });
    } else if (linkOutcome.recovery) {
      setAuthOpen(true, 'new-password');
    } else if (linkOutcome.confirmed) {
      toast({ title: 'Email confirmed', description: 'You are signed in. Your picks and settings will now be saved.' });
    }
  }, []);

  // A recovery link can also be reported by the client after the page has loaded.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setAuthOpen(true, 'new-password');
    });
    return () => subscription.unsubscribe();
  }, [setAuthOpen]);

  // Bring account and device in line once per sign-in.
  useEffect(() => {
    if (auth.loading) return;
    const userId = auth.user?.id ?? null;
    if (!userId) {
      sawSignedOut.current = true;
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current === userId) return;
    syncedFor.current = userId;
    cloudSync.syncOnSignIn();
    // No toast when the page simply reopened with a session already there.
    if (sawSignedOut.current) {
      toast({ title: "You're in", description: 'Your picks and settings will now be saved.' });
    }
  }, [auth.loading, auth.user?.id]);

  const modal = (
    <AuthModal
      open={authOpen}
      view={authView}
      onViewChange={(view) => setAuthOpen(true, view)}
      onClose={() => setAuthOpen(false)}
      onSignIn={auth.signIn}
      onSignUp={auth.signUp}
      onResendConfirmation={auth.resendConfirmation}
      onRequestPasswordReset={auth.requestPasswordReset}
      onUpdatePassword={auth.updatePassword}
    />
  );

  // Session still being read: show nothing instead of flashing "Sign in" at a signed-in visitor.
  if (auth.loading) return modal;

  if (!auth.isAuthenticated) {
    return (
      <>
        {/* Own provider: the header is also rendered outside the app shell (404 page tests). */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="h-9 whitespace-nowrap rounded-full border border-primary/40 bg-primary/10 px-3.5 text-sm font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/15"
              >
                Sign in
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px]">
              <p className="text-xs">Sign in to save your picks and sync them across devices.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {modal}
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-sm font-semibold text-primary transition-colors hover:border-primary/60"
          >
            {accountInitial(auth.user)}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[12rem] border-border bg-popover">
          {auth.user?.email && (
            <>
              <p className="max-w-[14rem] truncate px-2 py-1.5 text-xs text-muted-foreground">{auth.user.email}</p>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onSelect={() => setPicksOpen(true)} className="cursor-pointer gap-2">
            <Bookmark className="h-4 w-4" />
            My picks ({picksCount})
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAuthOpen(true, 'new-password')} className="cursor-pointer gap-2">
            <KeyRound className="h-4 w-4" />
            Change password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => signOut()} className="cursor-pointer gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {modal}
    </>
  );
}
