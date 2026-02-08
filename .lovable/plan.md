

## Total Refactor: Rename UX Terminology and Simplify Flow

This refactor removes all military/tactical language across the app and replaces it with friendly, travel-oriented terminology. The data loading and search are already complete (all 600 cities load correctly), so the focus is on renaming labels and simplifying the preferences UI.

---

### What Changes

Every file containing military jargon gets updated. No logic changes to the scoring engine or data loading -- those work correctly. This is purely a terminology and UX simplification pass.

---

### File-by-File Changes

**1. `src/components/PreferencesModal.tsx`** (heaviest changes)

Label renames:
- "MISSION CONFIGURATION" becomes "TRIP PREFERENCES"
- "QUICK DEPLOY PRESETS" becomes "QUICK PRESETS"
- "EXTRACTION POINT" becomes "CURRENT LOCATION"
- "RESOURCE ALLOCATION" becomes "MONTHLY BUDGET"
- "BANDWIDTH THRESHOLD" becomes "MIN. INTERNET SPEED"
- "THREAT TOLERANCE" becomes "MIN. SAFETY RATING"
- "MISSION PROFILE" becomes "YOUR VIBE"
- "OPERATIONAL SECTOR" becomes "PREFERRED REGION"
- "ALL SECTORS" becomes "ALL REGIONS"
- "TARGETS LOCKED" becomes "DESTINATIONS FOUND"
- "NEAR MISSES" becomes "CLOSE MATCHES"
- "AUTO-CALIBRATE" becomes "RESET FILTERS"
- "PARAMETERS IMPOSSIBLE" becomes "NO DESTINATIONS MATCH"
- "INITIATE DROP SEQUENCE" becomes "FIND MY NEXT DESTINATION"
- "COORDINATES ACQUIRED: ..." becomes "Located: ..."
- Config summary: remove "extraction points" phrasing, use "destinations in [region] from [origin]"

Preset labels stay as-is (BUDGET SAVER, HIGH COMFORT, QUIET / PRODUCTIVE, REGION) since those are already user-friendly.

The "SHORT RANGE" / geolocation preset section is kept but the button label "SHORT RANGE" is already replaced with "REGION" which is fine.

**2. `src/pages/Index.tsx`**

- "NOMAD // DROP" becomes "NOMAD SPIN"
- "WHERE WILL YOU DEPLOY NEXT?" becomes "WHERE TO NEXT?"
- "CALCULATING DROP ZONE..." becomes "FINDING YOUR MATCH..."
- "TARGET ACQUIRED" becomes "YOUR TOP PICKS"
- "RETURN TO BASE" becomes "START OVER"
- "DROPS" (spin count) becomes "SPINS"
- Share text: "DROP ZONE" becomes "Destination", "Deployment target" becomes "Next stop"
- SEO title: "Tactical Decision Engine" becomes "Find Your Next Destination"
- SEO description: "Find your next mission" becomes "Find your next destination"

**3. `src/components/SpinButton.tsx`**

- Default label: "CONFIGURE MISSION" becomes "SET PREFERENCES"

**4. `src/components/ResultCard.tsx`**

- "EST. MONTHLY BURN" becomes "MONTHLY COST"
- "AVG BANDWIDTH" becomes "AVG. INTERNET"
- "THREAT INDEX" becomes "SAFETY SCORE"
- "VISA WINDOW" becomes "VISA LENGTH"
- "WHY THIS TARGET" becomes "WHY THIS CITY"
- "OPERATIONAL RISKS" becomes "THINGS TO KNOW"
- "No active threats" becomes "No concerns noted"
- "ENCRYPT TO PROFILE" becomes "SAVE"
- "RE-DROP" becomes "SPIN AGAIN"

**5. `src/components/TopResultsGrid.tsx`**

- "ALTERNATIVE TARGETS" becomes "OTHER GREAT MATCHES"
- "VIEW FULL DOSSIER" becomes "VIEW DETAILS"

**6. `src/components/SavedSpins.tsx`**

- "MISSION ARCHIVE" becomes "SAVED DESTINATIONS"
- "MISSION #001: TOKYO" becomes "TRIP #001: TOKYO"
- "PENDING" becomes "SAVED"
- "Re-deploy with same filters" title becomes "Search again with same filters"

**7. `src/components/DeploymentGrid.tsx`**

- "LINK UNAVAILABLE" toast title becomes "Link Unavailable"
- Affiliate disclaimer: convert from ALL-CAPS to sentence case: "Some outbound links are affiliate links -- we may earn a commission at no extra cost to you."

**8. `src/components/OriginSelector.tsx`**

- "LOCKED: ..." becomes "Located: ..."
- "BASE: ANYWHERE" becomes "LOCATION: ANYWHERE"
- "Locate nearest base city" title becomes "Detect my location"

**9. `src/components/SEO.tsx`**

- Default title: "Digital Nomad Spin | Find Your Next Destination"
- Default description: "Stop overthinking. Spin the globe. Find your next destination. Discover nomad-friendly cities with curated stays, flights, eSIMs, and insurance."

**10. `src/hooks/useGeolocation.ts`**

- Toast messages: "SIGNAL LOST. MANUAL INPUT REQUIRED." becomes "Location access denied. Please select your city manually."
- "NO NEARBY ASSETS DETECTED" becomes "No nearby city found in our database."
- "COORDINATES LOCKED" becomes "Location detected"

---

### What Does NOT Change

- Scoring engine (`src/lib/scoring.ts`) -- already uses weighted scoring, works correctly
- Data loading (`src/data/cities.ts`) -- all 600 cities are already loaded and merged
- Store logic (`src/store/useSpinStore.ts`) -- filtering, spin, top 3 results all work
- Affiliate engine (`src/utils/affiliateEngine.ts`) -- no military terms there
- Analytics (`src/utils/analytics.ts`) -- event names are already clean
- Globe component -- no text labels to rename
- The dark aesthetic and visual design stay the same -- only text labels change

---

### Summary

This is a text-only refactor across 10 files. No logic, data loading, or scoring changes. Every instance of military jargon (mission, target, deployment, extraction, threat, dossier, drop, etc.) is replaced with travel-friendly equivalents (trip, destination, preferences, location, safety, details, spin, etc.).

