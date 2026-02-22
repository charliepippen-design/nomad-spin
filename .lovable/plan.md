
# Dual-Thumb (Range) Sliders for All Preferences

## Problem
The Budget slider already has two thumbs (min/max range), but the Internet Speed and Safety Rating sliders only have a single thumb. The user wants all sliders to show a ball on both ends -- a proper min/max range slider.

## Changes

### `src/components/PreferencesModal.tsx`

**Internet Speed slider** (line 397):
- Change from single value `value={[localInternet]}` to a range `value={localInternetRange}` (e.g. `[10, localInternet]` or a new `[min, max]` state)
- Add a new state variable `localInternetRange` as `[number, number]` defaulting to `[10, currentValue]`
- Update the display text from `"50 MBPS"` to `"10 — 50 MBPS"` format (matching the budget style)

**Safety Rating slider** (line 408):
- Change from single value `value={[localSafety]}` to a range `value={localSafetyRange}` (e.g. `[1, localSafety]` or a new `[min, max]` state)
- Add a new state variable `localSafetyRange` as `[number, number]` defaulting to `[1, currentValue]`
- Update the display text from `"5/10"` to `"1 — 5 / 10"` or `"1/10 — 5/10"` format

### State and scoring integration
- Update the preferences store or local state to track min/max for internet and safety
- Propagate both values through to the scoring logic where relevant (the min value sets the floor filter, the max value sets the ceiling)

### `src/components/ui/slider.tsx`
- No changes needed -- Radix Slider already renders one thumb per array element automatically

### Files modified:
- `src/components/PreferencesModal.tsx` -- convert internet and safety sliders to dual-thumb range sliders
