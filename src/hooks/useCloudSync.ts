import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSpinStore, SavedSpin } from '@/store/useSpinStore';
import { origins as originsData } from '@/data/origins';
import type { Database } from '@/integrations/supabase/types';
import type { VibeOption, RegionOption } from '@/store/useSpinStore';

type SavedSpinRow = Database['public']['Tables']['saved_spins']['Row'];
type UserStreakRow = Database['public']['Tables']['user_streaks']['Row'];
type UserPreferencesRow = Database['public']['Tables']['user_preferences']['Row'];

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
      const spins: SavedSpin[] = (data as SavedSpinRow[]).map((row) => ({
        city: row.city_data as SavedSpin['city'],
        timestamp: new Date(row.created_at).toLocaleDateString(),
        preferences: row.preferences as SavedSpin['preferences'],
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
      city_data: spin.city as Database['public']['Tables']['saved_spins']['Insert']['city_data'],
      preferences: spin.preferences as Database['public']['Tables']['saved_spins']['Insert']['preferences'],
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
      const row = data as UserStreakRow;
      useSpinStore.setState({
        spinCount: row.spin_count,
        streak: row.streak,
        lastSpinDate: row.last_spin_date,
      });
      localStorage.setItem('spinCount', String(row.spin_count));
      localStorage.setItem('streak', String(row.streak));
      if (row.last_spin_date) localStorage.setItem('lastSpinDate', row.last_spin_date);
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
      const row = data as UserPreferencesRow;
      const origin = row.origin_id
        ? originsData.find((o) => o.id === row.origin_id) || null
        : null;

      useSpinStore.setState({
        preferences: {
          budgetRange: [row.budget_min, row.budget_max],
          internetMin: row.internet_min,
          safetyMin: row.safety_min,
          vibes: (row.vibes || []) as VibeOption[],
          landscapes: [],
          region: (row.region || 'All') as RegionOption,
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

      const existingIds = new Set((existing || []).map((e) => e.city_id));
      const toInsert = localSpins
        .filter((s) => !existingIds.has(s.city.id))
        .map((s) => ({
          user_id: userId,
          city_id: s.city.id,
          city_data: s.city as Database['public']['Tables']['saved_spins']['Insert']['city_data'],
          preferences: s.preferences as Database['public']['Tables']['saved_spins']['Insert']['preferences'],
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
        const row = cloudStreak as UserStreakRow;
        const mergedCount = Math.max(localCount, row.spin_count);
        const mergedStreak = Math.max(localStreak, row.streak);
        await supabase
          .from('user_streaks')
          .update({
            spin_count: mergedCount,
            streak: mergedStreak,
            last_spin_date: store.lastSpinDate || row.last_spin_date,
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

