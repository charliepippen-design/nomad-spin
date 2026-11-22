import { useEffect, useRef } from 'react';
import { Bookmark, LogOut } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useToast } from '@/hooks/use-toast';
import { useSpinStore } from '@/store/useSpinStore';
import { useAccountUi } from '@/store/useAccountUi';

/**
 * Account entry of the site header, present on every page.
 * Signed out: one "Sign in" button. Signed in: an avatar with "My picks" and "Sign out".
 * It also owns the sign-in modal and the account sync that runs after signing in.
 */
export default function AccountMenu() {
  const auth = useAuth();
  const cloudSync = useCloudSync(auth.user?.id);
  const { toast } = useToast();
  const authOpen = useAccountUi((s) => s.authOpen);
  const setAuthOpen = useAccountUi((s) => s.setAuthOpen);
  const setPicksOpen = useAccountUi((s) => s.setPicksOpen);
  const picksCount = useSpinStore((s) => s.savedSpins.length);
  const hasSynced = useRef(false);

  // Pull the account's picks and settings once the visitor is signed in.
  useEffect(() => {
    if (auth.isAuthenticated && auth.user && !hasSynced.current) {
      hasSynced.current = true;
      cloudSync.loadSavedSpins();
      cloudSync.loadPreferences();
      cloudSync.migrateLocalData();
      toast({
        title: "You're in",
        description: 'Your picks and settings will now be saved.',
      });
    }
    if (!auth.isAuthenticated) hasSynced.current = false;
  }, [auth.isAuthenticated, auth.user?.id]);

  const modal = (
    <AuthModal
      open={authOpen}
      onClose={() => setAuthOpen(false)}
      onSignUp={async (email, password, name) => {
        const result = await auth.signUp(email, password, name);
        if (!result.error) {
          setTimeout(() => cloudSync.migrateLocalData(), 1000);
        }
        return result;
      }}
      onSignIn={(email, password) => auth.signIn(email, password)}
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

  const initial = (auth.user?.user_metadata?.display_name || auth.user?.email || 'U')[0].toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Account menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-sm font-semibold text-primary transition-colors hover:border-primary/60"
          >
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[11rem] border-border bg-popover">
          <DropdownMenuItem onSelect={() => setPicksOpen(true)} className="cursor-pointer gap-2">
            <Bookmark className="h-4 w-4" />
            My picks ({picksCount})
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => auth.signOut()} className="cursor-pointer gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {modal}
    </>
  );
}
