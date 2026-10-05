# SEO build scripts

- `sync-content-guides.ts` — compiles `content/guides/*.md` + `.json` into `src/data/contentGuides.generated.ts`.
- `generate-sitemap.ts` — writes `public/sitemap.xml` (static pages + guides + every city destination).
- `generate-seo-pages.ts` — post-`vite build` step that emits HTML shells under `dist/` for guides and destinations (title, meta, canonical, JSON-LD, visible key stats inside `#root`).

## Destination slugs

Canonical slugs use `src/lib/slugify.ts` (Unicode NFD accent fold) and `src/lib/citySlug.ts`.

### Same-name cities (disambiguated with country)

| Base name | Canonical slugs |
|-----------|-----------------|
| Kochi | `/destinations/kochi-india`, `/destinations/kochi-japan` |
| Mérida | `/destinations/merida-mexico`, `/destinations/merida-venezuela`, `/destinations/merida-spain` |
| Granada | `/destinations/granada-nicaragua`, `/destinations/granada-spain` |

Bare `/destinations/kochi` (etc.) redirects in-app to the first match's canonical URL.

### Accent / legacy redirects

Pre-NFD URLs like `/destinations/medell-n` and `/destinations/s-o-paulo` resolve via `findCityBySlug` and `<Navigate>` to `/destinations/medellin` and `/destinations/sao-paulo`.

### Data cleanups applied

- Removed duplicate `lviv-ua` entry in `batch4-europe.ts` (kept the `extra-europe.ts` copy).
- Removed duplicate `port-vila-b-vu` entry in `batch6-mixed-b.ts` (kept `port-vila-vu`).
