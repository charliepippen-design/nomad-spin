

# Add "Save City" Button to Destination Guide Pages

## Overview

Currently, cities can only be saved after a spin result. There's no way to save a city when browsing its dedicated guide page (`/destinations/:citySlug`). We'll add a prominent save/unsave button to the destination guide hero area, plus ensure saved cities appear in the SavedSpins list on the home page.

## Changes

### 1. Add a `saveCity` action to the Zustand store (`src/store/useSpinStore.ts`)

The existing `saveResult()` only saves the current spin result. We need a new `saveCity(city)` method that accepts any `City` object directly, so it can be called from the guide page.

- Add `saveCity: (city: City) => void` to the store interface
- Implementation: check for duplicates, create a `SavedSpin` entry with current preferences, persist to localStorage

### 2. Add a `isCitySaved` helper to the store

A simple helper `isCitySaved(cityId: string) => boolean` so the UI can toggle between "Save" and "Saved" states.

### 3. Add Save button to `src/pages/DestinationGuide.tsx`

- Import `useSpinStore`, `useAuth`, `useCloudSync`, and the `Bookmark` icon
- Add a save/unsave toggle button in the hero section (top-right of the hero, or next to the city name)
- When clicked:
  - If not saved: call `saveCity(city)` on the store, and if authenticated, call `cloudSync.saveSpin()`
  - If already saved: call `removeSavedSpin()` on the store, and if authenticated, call `cloudSync.removeSpin()`
- Visual: filled bookmark icon when saved, outline when not

### 4. Files to modify

| File | Change |
|---|---|
| `src/store/useSpinStore.ts` | Add `saveCity(city)` and `isCitySaved(cityId)` methods |
| `src/pages/DestinationGuide.tsx` | Add save/unsave button in hero section using the new store methods, with cloud sync for authenticated users |

## Technical Details

### Store additions (`useSpinStore.ts`)

```typescript
// New method on interface
saveCity: (city: City) => void;

// Implementation
saveCity: (city) => {
  const { savedSpins, preferences } = get();
  if (savedSpins.find((s) => s.city.id === city.id)) return;
  const newSpin: SavedSpin = {
    city,
    timestamp: new Date().toLocaleDateString(),
    preferences: { ...preferences },
  };
  const updated = [...savedSpins, newSpin];
  localStorage.setItem('savedSpins', JSON.stringify(updated));
  set({ savedSpins: updated });
},
```

### DestinationGuide save button

```typescript
const { savedSpins, saveCity, removeSavedSpin } = useSpinStore();
const auth = useAuth();
const cloudSync = useCloudSync(auth.user?.id);
const savedIndex = savedSpins.findIndex(s => s.city.id === city.id);
const isSaved = savedIndex !== -1;

// In the hero area:
<button onClick={() => {
  if (isSaved) {
    if (auth.isAuthenticated) cloudSync.removeSpin(city.id);
    removeSavedSpin(savedIndex);
  } else {
    saveCity(city);
    if (auth.isAuthenticated) cloudSync.saveSpin({ city, timestamp: '...', preferences });
  }
}}>
  <Bookmark filled={isSaved} /> {isSaved ? 'SAVED' : 'SAVE CITY'}
</button>
```

The button will appear as a glass-style chip in the hero overlay, matching the existing design language (mono font, tracking, uppercase).
