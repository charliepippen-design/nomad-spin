import { useCallback } from 'react';
import { useSpinStore } from '@/store/useSpinStore';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import type { Origin } from '@/data/origins';

/**
 * The city the visitor leaves from. One value in useSpinStore, shared by the
 * header, the home drawer, the spin preferences and the shared URL.
 * A change made while signed in is also saved to the account.
 */
export function useOriginPreference(): [Origin | null, (origin: Origin | null) => void] {
  const origin = useSpinStore((s) => s.preferences.origin);
  const setPreferences = useSpinStore((s) => s.setPreferences);
  const auth = useAuth();
  const { syncOrigin } = useCloudSync(auth.user?.id);

  const setOrigin = useCallback(
    (next: Origin | null) => {
      setPreferences({ origin: next });
      if (auth.isAuthenticated) syncOrigin();
    },
    [setPreferences, auth.isAuthenticated, syncOrigin],
  );

  return [origin, setOrigin];
}
