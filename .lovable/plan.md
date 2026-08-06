# SEO & Search Visibility Improvement Plan

## Goal
Fix the 8 open SEO findings so the site is fully crawlable, correctly indexed, and ranks for high-intent digital-nomad keywords.

## Current issues (confirmed)
- Homepage has no `<h1>` heading.
- `index.html` meta description is 212 characters (limit ~160).
- Canonical URL in `index.html` points to `https://nomadspin.com`; several routes have no self-referencing canonical; `GuideArticle` points to `https://digitalnomadspin.com`.
- `og:image` and `twitter:image` use relative paths (`/og-preview.png`) in `index.html` and `SEO.tsx`.
- About, Contact, Guides list, and individual guide articles lack unique Open Graph tags and JSON-LD.
- No `/sitemap.xml`; no `/llms.txt`; `robots.txt` has no `Sitemap:` directive.
- Google Search Console is not connected or verified for the published domain.
- No dedicated guide targeting "Best Places for Digital Nomads in 2025" (Semrush: 1,600/mo, low difficulty).

## Work to do

### 1. Fix homepage heading structure
- Add a single visible `<h1>` to `src/pages/Index.tsx` (or `LandingDrawer.tsx`) that describes the tool, e.g. "Find your next digital nomad destination".
- Keep the existing `<h2>` tagline as a sub-heading.

### 2. Correct sitewide metadata in `index.html`
- Shorten the meta description to ≤160 characters.
- Update `og:url` and `<link rel="canonical">` to the actual published domain `https://spin-nomad-quest.lovable.app/`.
- Convert `og:image` and `twitter:image` to absolute URLs (`https://spin-nomad-quest.lovable.app/og-preview.png`).
- Add sitewide `WebSite` and `Organization` JSON-LD.

### 3. Add per-route metadata and structured data
- Update `src/components/SEO.tsx` to always emit absolute image URLs and a self-referencing canonical/og:url when a path prop is provided.
- Add canonical, og:url, og:image, and JSON-LD to:
  - `src/pages/About.tsx` (Organization / AboutPage)
  - `src/pages/Contact.tsx` (ContactPage)
  - `src/pages/GuidesList.tsx` (CollectionPage)
  - `src/pages/GuideArticle.tsx` (Article, fix domain)
  - `src/pages/DestinationGuide.tsx` (TouristDestination)
  - `src/pages/PrivacyPolicy.tsx` and `src/pages/TermsOfUse.tsx` (WebPage)
- Change `GuideArticle` `og:type` to `article`.

### 4. Create sitemap and robots.txt
- Create `scripts/generate-sitemap.ts` that lists every static route plus every dynamic city and guide slug.
- Wire it into `package.json` as `predev` and `prebuild` scripts.
- Update `public/robots.txt` to add `Sitemap: https://spin-nomad-quest.lovable.app/sitemap.xml`.

### 5. Add `/llms.txt`
- Create `public/llms.txt` with a site summary and links to public routes (home, about, contact, guides, destination guides, legal pages).

### 6. Publish the 2025 guide
- Create a new guide entry in `src/data/guides.ts` (or a dedicated route `/guides/best-places-2025`) titled "Best Places for Digital Nomads in 2025".
- Content uses the existing 1,200-city dataset to surface top cities by cost, internet, safety, and vibe.
- Add the route to `src/App.tsx`, the guides list, and the sitemap.

### 7. Connect and verify Google Search Console
- Call `standard_connectors--connect` for `google_search_console` so you can authorize the connection.
- After the connection lands, verify ownership of `https://spin-nomad-quest.lovable.app/` via the META tag flow and submit the new sitemap.

## Outcome
All 8 SEO findings should be addressed: proper H1, concise description, correct canonicals/OG tags, structured data, sitemap, llms.txt, the 2025 guide, and a verified Search Console property with submitted sitemap.
