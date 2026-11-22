import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSpinStore, SavedSpin } from '@/store/useSpinStore';
import { findOriginById } from '@/lib/originLookup';

export function useCloudSync(userId: string | undefined) {
  const store = useSpinStore();

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

  // Load preferences FROM cloud
  const loadPreferences = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
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
    }
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

  // Migrate localStorage data to cloud on first login
  const migrateLocalData = useCallback(async () => {
    if (!userId) return;

    // Migrate saved spins
    const localSpins = store.savedSpins;
    if (localSpins.length > 0) {
      const { data: existing } = await supabase
        .from('saved_spins')
        .select('city_id')
        .eq('user_id', userId);

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
    }

    // Sync preferences
    await syncPreferences();
  }, [userId, store.savedSpins, syncPreferences]);

  return {
    loadSavedSpins,
    saveSpin,
    removeSpin,
    loadPreferences,
    syncPreferences,
    syncOrigin,
    migrateLocalData,
  };
}
