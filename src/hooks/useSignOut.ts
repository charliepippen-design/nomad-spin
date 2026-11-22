import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useSpinStore } from '@/store/useSpinStore';

/**
 * Signs out. Picks made on this device are saved to the account first, then the
 * local copy is cleared, so the next person signing in here does not inherit them.
 */
export function useSignOut(): () => Promise<void> {
  const auth = useAuth();
  const { pushLocalSpins } = useCloudSync(auth.user?.id);

  return useCallback(async () => {
    try {
      await pushLocalSpins();
    } catch {
      // Offline: sign out anyway.
    }
    await auth.signOut();
    useSpinStore.setState({ savedSpins: [] });
    try {
      localStorage.removeItem('savedSpins');
    } catch {
      // Storage unavailable: nothing to clear.
    }
  }, [auth.signOut, pushLocalSpins]);
}
