
## Add 600 New Cities (Ranks 601-1200) to the Dataset

The three uploaded Excel files contain 600 new cities that need to be converted into TypeScript using the existing `city()` builder function and merged into the main city array.

### Data Mapping

The spreadsheet columns map to the `city()` builder as follows:

| Spreadsheet Column | Builder Field | Notes |
|---|---|---|
| City | `name` | |
| Country | `country` | |
| Region | `region` | Must map to one of: `Asia`, `Europe`, `LATAM`, `Africa`, `Oceania`, `North America` |
| Monthly Cost (USD) | `cost` | Use midpoint of range (e.g., "1700-2400" becomes 2050) |
| Safety Score | `safety` | Direct |
| Internet Speed | `internet` | Direct |
| Coworking Spaces | `coworking` | Map: 40+ = High, 10-39 = Med, <10 = Low |
| Community Size | `community` | Map: Large=8, Medium=6, Small=4, Very Small=2 |
| English Level | `english` | Map: Native/High=8, Good=7, Moderate=5, Low=3 |
| Healthcare Quality | `quality` (healthInsurance) | Map: Excellent=9, Good=7, Moderate=5, Poor=3 |
| Digital Nomad Visa | `visaType` | Direct text |
| Visa Length | `visaDays` | Parse to days |
| Key Pros | `pros` | Split into array |
| Key Cons | `cons` | Split into array |
| Climate | Used to infer `landscape` | e.g., Mediterranean->seaside, Alpine->mountain, etc. |

Region mapping from spreadsheet values:
- "Western Europe", "Southern Europe", "Central Europe", "Eastern Europe", "Northern Europe", "Europe/Asia" -> `Europe`
- "South Asia", "Southeast Asia", "East Asia", "Central Asia" -> `Asia`
- "Middle East" -> `Asia`
- "North America" -> `North America`
- "South America", "Central America", "Caribbean" -> `LATAM`
- "Africa", "Central Africa" -> `Africa`
- "Oceania", "Arctic" -> `Oceania`

### New Files

Six new city data files will be created, two per spreadsheet (split by region grouping to keep file sizes manageable):

| File | Content |
|---|---|
| `src/data/cities/batch4-europe.ts` | European cities from ranks 601-800 |
| `src/data/cities/batch4-other.ts` | Non-European cities from ranks 601-800 |
| `src/data/cities/batch5-europe.ts` | European cities from ranks 801-1000 |
| `src/data/cities/batch5-other.ts` | Non-European cities from ranks 801-1000 |
| `src/data/cities/batch6-mixed-a.ts` | Cities from ranks 1001-1100 |
| `src/data/cities/batch6-mixed-b.ts` | Cities from ranks 1101-1200 |

Each file exports a named array (e.g., `batch4EuropeCities`) using the `city()` builder, following the exact same pattern as existing files like `new-asia.ts`.

### Modified Files

| File | Change |
|---|---|
| `src/data/cities.ts` | Import the 6 new arrays and spread them into the `cities` export |
| `src/data/cities/builder.ts` | Add missing country codes to `inferLanguage` map (e.g., `BJ`, `TJ`, `KG`, `BN`, `WS`, `TO`, `FJ`, `VU`, `SB`, `PG`, `TL`, `CK`, `TV`, `MH`, `CW`, `BO`, `HN`, `NI`, `GT`, `SV`, `BZ`, `GY`, `SR`, `CV`, etc.) |

### City ID Convention

Each city gets a slug-style ID: `lowercase-name-countrycode` (e.g., `ljubljana-si`, `boise-suburbs-us`, `santarem-pt`). This matches the existing pattern.

### Landscape Inference from Climate

The climate column will be used to set `landscape` where possible:
- Mediterranean, Atlantic, Oceanic, Subtropical, Tropical (coastal context) -> `seaside`
- Alpine, Highland, Cold Highland -> `mountain`
- Desert, Desert Hot -> `desert`
- Continental, Cold, Four Seasons, Hot (urban context) -> `urban`
- Tropical + island context -> `island`

### What Stays the Same

- All existing filtering, scoring, search, and display logic works unchanged -- no modifications needed
- The `city()` builder already handles defaults for all optional fields (taxation, health insurance, eSIM, legal notes, airports)
- All new cities are flagged as `dataSource: 'estimated'` since they come from spreadsheet data rather than hand-curation
- The console log in `useSpinStore.ts` already uses `cities.length` dynamically, so it will automatically show the updated count

### Technical Details

- Each `city()` call is ~5 lines using the compact builder format
- 600 cities across 6 files = ~100 cities per file, ~500 lines each
- No database changes needed -- city data is purely client-side
- No new dependencies required
- Nightlife scores will be inferred from Community Size and English Level context (Large city + nightlife mentions in pros = higher score)
