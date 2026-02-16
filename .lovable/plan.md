

## Nomad Spin Audit Refactor

This is a significant refactor touching the data model, scoring engine, filtering UI, result cards, and adding AI-powered data enrichment. Here's the phased plan:

---

### Phase 1: Data Model Expansion

**Extend the City type** (`src/data/cities/types.ts`) with new fields:

| New Field | Type | Description |
|-----------|------|-------------|
| `landscape` | `('seaside' \| 'mountain' \| 'urban' \| 'rural' \| 'island' \| 'desert')[]` | New dedicated landscape tags |
| `language` | `string` | Primary local language |
| `nearestAirport` | `{ code: string; name: string; distKm: number }` | Nearest major airport |
| `taxation` | `{ incomeTax: string; notes: string }` | Tax summary for nomads |
| `healthInsurance` | `{ costMonthly: number; quality: number }` | Est. monthly insurance + quality 1-10 |
| `esim` | `{ available: boolean; costMonthly: number }` | eSIM availability and cost |
| `legalNotes` | `string[]` | Specific disclaimers about local laws |
| `dataSource` | `'verified' \| 'estimated'` | Data quality indicator |

**Update the builder** (`src/data/cities/builder.ts`) with sensible defaults for all new fields so existing 600+ cities don't break. Existing cities get `dataSource: 'verified'`.

---

### Phase 2: Origin System Enhancement

- Add **Treviso, Venice**, and ~20 more European/global cities to the `origins` list in `src/data/origins.ts`
- Update the **flight cost estimator** (`src/lib/distance.ts`) to use `nearestAirport` distance when available, and add a rough **flight time** calculator
- Show flight time and cost in the result card's intel section

---

### Phase 3: Mobile Bug Fix (2nd/3rd City Buttons)

The runner-up cards in `TopResultsGrid.tsx` use a "VIEW DETAILS" button that calls `onSelectResult`, which updates `resultCity` in the store but doesn't scroll or re-render the primary card visibly on mobile.

**Fix:**
- When selecting a runner-up on mobile, scroll the primary `ResultCard` into view
- Ensure the `selectResult` action in `useSpinStore` triggers a visible state change (animate the card swap)

---

### Phase 4: Mission Profile Filter System

Replace the simple preset buttons in `PreferencesModal.tsx` with a composable **Mission Profile** system:

```text
[Budget: Low / Mid / Comfort] + [Region: Asia / Europe / LATAM / ...] + [Landscape: Seaside / Mountain / Urban / ...]
```

- Add a **Landscape** multi-select row (similar to Vibes) in the preferences modal
- Update `useSpinStore` preferences to include `landscape: LandscapeOption[]`
- Update `filterCities` to hard-filter by landscape when selected
- Update `scoreCityForPreferences` to score landscape match (similar to vibe scoring)

---

### Phase 5: AI Data Enrichment

Create a new edge function `supabase/functions/enrich-city/index.ts` that:
1. Takes a city name + country
2. Calls Lovable AI (Gemini Flash) to retrieve missing data fields (language, taxation, health insurance, eSIM, legal notes, landscape)
3. Returns structured data via tool calling
4. Marks the result as `dataSource: 'estimated'`

On the frontend:
- When a city result loads, check if it has AI-enrichable empty fields
- Call the edge function to fill them in
- Cache results in a new `city_enrichment_cache` database table

---

### Phase 6: Data Quality Indicator UI

Add a visual badge system to distinguish data quality:
- **Verified** (green checkmark): Hand-curated data
- **Estimated** (orange AI icon): AI-retrieved data with disclaimer tooltip

This badge appears:
- Next to each stat in the ResultCard grid
- As a small indicator on runner-up cards

---

### Phase 7: Legal Notes Section

Add a dedicated "Local Laws" section to `ResultCard.tsx`:
- Appears below the "Things to Know" section
- Uses a warning-styled card with specific bullet points from `city.legalNotes`
- Includes a generic disclaimer: "Laws vary by region. Always verify current regulations before traveling."

---

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/enrich-city/index.ts` | AI enrichment edge function |
| (migration) | `city_enrichment_cache` table |

### Files to Modify

| File | Changes |
|------|---------|
| `src/data/cities/types.ts` | Add ~8 new fields to City interface |
| `src/data/cities/builder.ts` | Add defaults for new fields |
| `src/data/origins.ts` | Add ~20 more origin cities |
| `src/lib/distance.ts` | Add flight time calculator, airport-aware cost |
| `src/lib/scoring.ts` | Add landscape scoring dimension |
| `src/store/useSpinStore.ts` | Add `landscape` to preferences, update filtering |
| `src/components/PreferencesModal.tsx` | Add Landscape filter row, restructure presets |
| `src/components/ResultCard.tsx` | Add legal notes section, data quality badges, new stat items |
| `src/components/TopResultsGrid.tsx` | Add data quality indicator, fix mobile selection |
| `src/pages/Index.tsx` | Wire up enrichment calls, handle mobile scroll fix |
| `src/data/cities.ts` | Add landscape tags to existing hand-tuned cities |

### Database Changes

New table: `city_enrichment_cache`
- `slug` (text, PK)
- `enrichment_data` (jsonb)
- `fetched_at` (timestamptz)
- Public read, service_role write (same pattern as `city_image_cache`)

### Technical Considerations

- All new City fields have defaults in the builder, so the 600+ existing cities compile without changes to every regional file
- The AI enrichment is lazy-loaded (on result view) to avoid burning API calls on cities users never see
- The scoring engine adds landscape as a 6th dimension (0-10 pts), redistributing from vibe (25 -> 20) and adding landscape (0-10)
- Mobile fix uses `scrollIntoView` + a brief animated transition on card swap
