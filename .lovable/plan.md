

# Fix Google Sign-In and Cloud Sync

## What's Actually Happening

Google sign-in technically works at the authentication level (the backend confirms successful logins). However, the app has several gaps that make it feel broken:

1. **No local-to-cloud data migration after Google sign-in** -- When users sign in via Google, their locally saved cities, preferences, and streaks are never uploaded to the cloud. The `migrateLocalData()` function only runs after email signup, not after Google OAuth.

2. **Preferences never sync TO the cloud** -- When users change their trip preferences (budget, region, vibes, etc.), those changes are never saved to the cloud. The `syncPreferences()` function exists but is never called.

3. **No success feedback after Google redirect** -- After Google sign-in redirects the user back to the app, there's no toast or visual confirmation. The user doesn't know if it worked.

## Plan

### 1. Trigger data migration after Google OAuth redirect (`src/pages/Index.tsx`)

Add logic so that when a user becomes authenticated (detected via `useAuth`), we check if this is a "new session" and trigger `migrateLocalData()`. This covers both email signup AND Google OAuth redirect.

- Track a `hasRunMigration` ref to avoid running it multiple times
- In the existing `useEffect` that watches `auth.isAuthenticated`, also call `migrateLocalData()`
- Show a welcome toast when the user returns from Google OAuth already authenticated

### 2. Sync preferences to cloud after spin (`src/pages/Index.tsx`)

After each spin completes (when `syncStreaks` is called), also call `syncPreferences()` so the user's filter settings are persisted to the cloud.

### 3. Sync preferences when PreferencesModal closes (`src/pages/Index.tsx`)

When the preferences modal is closed and the user is authenticated, sync preferences to the cloud.

### 4. Show success toast after Google OAuth return (`src/pages/Index.tsx`)

Detect when a user returns from OAuth (session exists but modal isn't open) and show a brief "Welcome back" or "You're in" toast.

---

## Files to Modify

| File | Change |
|---|---|
| `src/pages/Index.tsx` | Add migration + sync on auth state change; sync preferences after spin and modal close; show toast after OAuth return |

## Technical Details

### `src/pages/Index.tsx` changes:

**useEffect for auth sync (lines 61-67):**
```typescript
const hasMigrated = useRef(false);

useEffect(() => {
  if (auth.isAuthenticated && auth.user && !hasMigrated.current) {
    hasMigrated.current = true;
    cloudSync.loadSavedSpins();
    cloudSync.loadStreaks();
    cloudSync.loadPreferences();
    cloudSync.migrateLocalData();
    // Show welcome toast if returning from OAuth
    toast({
      title: "You're in",
      description: "Your picks and settings will now be saved.",
    });
  }
}, [auth.isAuthenticated, auth.user?.id]);
```

**After spin completes (line 115-116):**
```typescript
if (auth.isAuthenticated) {
  cloudSync.syncStreaks();
  cloudSync.syncPreferences();
}
```

**Preferences modal close handler:**
```typescript
onClose={() => {
  setShowPrefs(false);
  if (auth.isAuthenticated) {
    cloudSync.syncPreferences();
  }
}}
```

This ensures that:
- Saved cities sync across devices (migration runs on any sign-in method)
- Spins and streaks sync after each spin
- Preferences sync when changed and after each spin
- Users get clear feedback that sign-in worked

