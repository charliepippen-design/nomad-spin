import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSpinStore, SavedSpin } from '@/store/useSpinStore';
import { origins as originsData } from '@/data/origins';

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

  // Load streaks FROM cloud
  const loadStreaks = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      useSpinStore.setState({
        spinCount: data.spin_count,
        streak: data.streak,
        lastSpinDate: data.last_spin_date,
      });
      localStorage.setItem('spinCount', String(data.spin_count));
      localStorage.setItem('streak', String(data.streak));
      if (data.last_spin_date) localStorage.setItem('lastSpinDate', data.last_spin_date);
    }
  }, [userId]);

  // Update streaks TO cloud
  const syncStreaks = useCallback(async () => {
    if (!userId) return;
    const { spinCount, streak, lastSpinDate } = useSpinStore.getState();
    await supabase
      .from('user_streaks')
      .update({
        spin_count: spinCount,
        streak: streak,
        last_spin_date: lastSpinDate,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
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
      const origin = data.origin_id
        ? originsData.find((o) => o.id === data.origin_id) || null
        : null;

      useSpinStore.setState({
        preferences: {
          budgetRange: [data.budget_min, data.budget_max],
          internetMin: data.internet_min,
          safetyMin: data.safety_min,
          vibes: (data.vibes || []) as any,
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

    // Migrate streaks (take the higher values)
    const localCount = store.spinCount;
    const localStreak = store.streak;
    if (localCount > 0 || localStreak > 0) {
      const { data: cloudStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (cloudStreak) {
        const mergedCount = Math.max(localCount, cloudStreak.spin_count);
        const mergedStreak = Math.max(localStreak, cloudStreak.streak);
        await supabase
          .from('user_streaks')
          .update({
            spin_count: mergedCount,
            streak: mergedStreak,
            last_spin_date: store.lastSpinDate || cloudStreak.last_spin_date,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      }
    }

    // Sync preferences
    await syncPreferences();
  }, [userId, store.savedSpins, store.spinCount, store.streak, store.lastSpinDate, syncPreferences]);

  return {
    loadSavedSpins,
    saveSpin,
    removeSpin,
    loadStreaks,
    syncStreaks,
    loadPreferences,
    syncPreferences,
    migrateLocalData,
  };
}
