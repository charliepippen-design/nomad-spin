import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSpinStore, SavedSpin } from '@/store/useSpinStore';
import { findOriginById } from '@/lib/originLookup';

export function useCloudSync(userId: string | undefined) {
  // Sync saved spins FROM cloud
  const loadSavedSpins = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('saved_spins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      const spins: SavedSpin[] = data.map((row: any) => ({
        city: row.city_data,
        timestamp: new Date(row.created_at).toLocaleDateString(),
        preferences: row.preferences,
      }));
      useSpinStore.setState({ savedSpins: spins });
      localStorage.setItem('savedSpins', JSON.stringify(spins));
    }
  }, [userId]);

  // Save spin TO cloud
  const saveSpin = useCallback(async (spin: SavedSpin) => {
    if (!userId) return;
    await supabase.from('saved_spins').insert({
      user_id: userId,
      city_id: spin.city.id,
      city_data: spin.city as any,
      preferences: spin.preferences as any,
    });
  }, [userId]);

  // Remove spin FROM cloud
  const removeSpin = useCallback(async (cityId: string) => {
    if (!userId) return;
    await supabase
      .from('saved_spins')
      .delete()
      .eq('user_id', userId)
      .eq('city_id', cityId);
  }, [userId]);

  // Save preferences TO cloud
  const syncPreferences = useCallback(async () => {
    if (!userId) return;
    const { preferences } = useSpinStore.getState();
    await supabase
      .from('user_preferences')
      .update({
        budget_min: preferences.budgetRange[0],
        budget_max: preferences.budgetRange[1],
        internet_min: preferences.internetMin,
        safety_min: preferences.safetyMin,
        vibes: preferences.vibes,
        region: preferences.region,
        origin_id: preferences.origin?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }, [userId]);

  // Save only the origin TO cloud, leaving the other saved settings as they are
  const syncOrigin = useCallback(async () => {
    if (!userId) return;
    const { preferences } = useSpinStore.getState();
    await supabase
      .from('user_preferences')
      .update({
        origin_id: preferences.origin?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }, [userId]);

  // Push picks saved on this device that the account does not have yet
  const pushLocalSpins = useCallback(async () => {
    if (!userId) return;
    const localSpins = useSpinStore.getState().savedSpins;
    if (localSpins.length === 0) return;

    const { data: existing, error } = await supabase
      .from('saved_spins')
      .select('city_id')
      .eq('user_id', userId);
    // Unknown account state: inserting blind could duplicate rows.
    if (error) return;

    const existingIds = new Set((existing || []).map((e: any) => e.city_id));
    const toInsert = localSpins
      .filter((s) => !existingIds.has(s.city.id))
      .map((s) => ({
        user_id: userId,
        city_id: s.city.id,
        city_data: s.city as any,
        preferences: s.preferences as any,
      }));

    if (toInsert.length > 0) {
      await supabase.from('saved_spins').insert(toInsert);
    }
  }, [userId]);

  // Bring the settings of the account and of this device in line
  const reconcilePreferences = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (!data) return;

    // A row still at its defaults was never saved by the visitor (a new account):
    // what they set on this device before signing in goes up. Otherwise the account wins.
    const untouched =
      data.budget_min === 500 &&
      data.budget_max === 3000 &&
      data.internet_min === 20 &&
      data.safety_min === 5 &&
      (data.vibes || []).length === 0 &&
      (data.region || 'All') === 'All' &&
      !data.origin_id;
    if (untouched) {
      await syncPreferences();
      return;
    }

    // No origin saved in the account: keep the one chosen on this device.
    const origin = findOriginById(data.origin_id) ?? useSpinStore.getState().preferences.origin;
    useSpinStore.setState({
      preferences: {
        budgetRange: [data.budget_min, data.budget_max],
        internetMin: data.internet_min,
        safetyMin: data.safety_min,
        vibes: (data.vibes || []) as any,
        landscapes: [],
        region: (data.region || 'All') as any,
        origin,
      },
    });
  }, [userId, syncPreferences]);

  /**
   * Runs once after signing in, one step at a time so no step overwrites another:
   * picks from this device go up, the account's picks come down, settings are reconciled.
   */
  const syncOnSignIn = useCallback(async () => {
    if (!userId) return;
    try {
      await pushLocalSpins();
      await loadSavedSpins();
      await reconcilePreferences();
    } catch {
      // Offline or server down: the visitor stays signed in with what is on this device.
    }
  }, [userId, pushLocalSpins, loadSavedSpins, reconcilePreferences]);

  return {
    loadSavedSpins,
    saveSpin,
    removeSpin,
    syncPreferences,
    syncOrigin,
    pushLocalSpins,
    syncOnSignIn,
  };
}
