

# Unified Drawer Landing Surface

## Goal
Turn the `LandingDrawer` into the **single landing surface** that contains all content currently scattered across the page. The globe becomes the only thing visible behind it.

## What Changes

### 1. Remove from `Index.tsx` main layout:
- The `FeaturedDestinations` section (lines 470-478) -- move its content into the drawer
- The `HowItWorks` section -- move its content into the drawer
- All header controls (auto-spin, day/night, sound, origin selector, auth, streak/spin count) -- move into the drawer
- Strip the header down to just the brand name "NOMAD SPIN", kept `fixed top-0` with frosted glass background

### 2. Expand `LandingDrawer` props
Pass into `LandingDrawer`:
- Globe control state: `autoSpin`, `setAutoSpin`, `dayMode`, `setDayMode`, `sound` (toggle + muted state)
- Origin: `preferences.origin`, `setPreferences`
- Auth: `auth` object, `setShowAuth`
- Stats: `streak`, `spinCount`

### 3. Rebuild `LandingDrawer` interior as a scrollable landing page inside the panel

The drawer panel (320px on desktop, bottom sheet on mobile) becomes scrollable and contains these sections top-to-bottom:

```text
+-------------------------------+
| NOMAD SPIN             [X]   |
+-------------------------------+
| "Travel Discovery Tool..."   |
|                               |
| Spin the globe.              |
| Find your next base.         |
|                               |
| [SPIN & COMPARE]             |
|                               |
| -- Globe Controls ---------- |
| Auto-spin [toggle]           |
| Day/Night [toggle]           |
| Sound     [toggle]           |
|                               |
| -- Your Base --------------- |
| [Origin Selector]            |
|                               |
| -- Account ----------------- |
| Sign in / My picks           |
| 5D Streak  |  12 spins       |
|                               |
| -- Saved Spins ------------- |
| (list)                       |
|                               |
| -- Where to Stay ----------- |
| [Buenos Aires card]          |
| [Bangkok card]               |
| [Lisbon card]                |
| [Tbilisi card]               |
| [Mexico City card]           |
| [Medellin card]              |
|                               |
| -- How It Works ------------ |
| 01 Spin & Select             |
| 02 Compare Metrics           |
| 03 Book What You Need        |
| Benefits list                |
|                               |
| [Scroll to explore]          |
+-------------------------------+
```

### 4. Header becomes minimal
- Brand name only: "NOMAD SPIN"
- `fixed top-0 left-0 right-0 z-20`
- Frosted glass background stays
- All nav links, toggles, selectors, auth buttons removed from header

## Technical Details

### `src/pages/Index.tsx`
- Remove lines 223-383 (all header controls except brand name)
- Remove lines 470-478 (`FeaturedDestinations` and `HowItWorks` sections)
- Update `LandingDrawer` rendering to pass new props: `autoSpin`, `setAutoSpin`, `dayMode`, `setDayMode`, `soundMuted`, `toggleSound`, `origin`, `setOrigin`, `auth`, `setShowAuth`, `streak`, `spinCount`
- Header becomes: just `<h1>NOMAD SPIN</h1>` in a fixed bar

### `src/components/LandingDrawer.tsx`
- Expand props interface to accept all new control/data props
- Add "Globe Controls" section with toggle buttons for auto-spin, day/night, sound
- Add "Your Base" section with `OriginSelector`
- Add "Account" section with auth button and streak/spin count display
- Add "Where to Stay" section that renders destination cards inline (import `FeaturedDestinations` city data and card markup directly, styled for the narrower drawer width -- single column grid)
- Add "How It Works" section reusing the steps/benefits data from `HowItWorks.tsx`
- Ensure the panel has `overflow-y-auto` for scrolling
- On mobile bottom sheet, same content stacks vertically with `max-h-[85vh]` and scroll
- Widen desktop drawer slightly to `w-[360px]` to accommodate cards

### Files modified:
- `src/pages/Index.tsx` -- strip header, remove below-fold sections, pass props to drawer
- `src/components/LandingDrawer.tsx` -- rebuild as full landing surface with all sections

