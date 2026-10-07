# Site assessment — digitalnomadspin.com

Assessment only. No production behavior was changed.

## Executive summary

**Recommended tier: B — format and layout refresh, keep the information architecture's routes and the spin core.**

The product people remember is the globe. The product that can earn traffic is the editorial guide (Chiang Mai is the proof). Those two are already decoupled enough to restyle without a rewrite. What is failing is the shell around them: three different navs, three different price lists, a guide template dressed as a sci-fi HUD, and destination pages that admit the useful sections are "coming soon."

Tier A (polish only) leaves the fake explore wall, the dead "How it Works" link, and the missing site nav in place. Those are traffic and trust problems, not spacing problems. Tier C (new shell / new design system / Lovable full-page rebuild) spends credits re-deriving a starter kit this repo already has, and it puts the globe, the 781 destination URLs, and the affiliate click path in the blast radius. Do that later, only if B's templates still cannot hold a Chiang Mai-quality guide.

**Do not spend Lovable credits on a full visual rebuild of pages.** Use Claude/Cursor on the shell, the guide template, and the destination template. Lovable is how this codebase accumulated a 49-file shadcn kit, a 15-city mock explore, and "as seen on" logos. More of that will not make the spin more unique.

---

## 1. Information architecture

### What exists

| Route | What it actually is |
|---|---|
| `/` | Full-screen globe plus a landing drawer. The only page with a desktop header. |
| `/guides`, `/guides/:slug` | 7 articles. Two handwritten in `src/data/guides.ts`, five compiled from `content/guides/*.md`. |
| `/destinations/:citySlug` | One template per city. Sitemap lists **781** of these. There is **no** `/destinations` index. |
| `/about`, `/contact`, `/privacy-policy`, `/terms-of-use` | Short static pages. |
| Explore | Not a route. Desktop "Explore" opens the preference modal. Mobile "Explore Cities" opens `CityWallModal`. |

`public/sitemap.xml` has **794** URLs: 6 static, 7 guides, 781 cities. Canonical host is `https://www.digitalnomadspin.com`. `robots.txt` points at the sitemap. `public/llms.txt` exists. Google site verification is in `index.html`. This SEO plumbing is real and should not be thrown away with a visual pass.

### Nav is three products

- **Home desktop header** (`src/pages/Index.tsx`): Explore, How it Works, Guides. Logo on the left.
- **Home mobile** (`src/components/MobileNav.tsx`): Home, About, Contact, Explore Cities. **Guides are absent.**
- **Every other page**: no site header. A "Back to Spin" / "Archive_Database" link, then the footer. `Layout` still floats a second logo and the theme toggle at `fixed top-4 right-4` on all routes, including articles.

Footer (`src/components/Footer.tsx`) is the only consistent nav: Guides, About, Contact, Privacy, Terms. No destinations, no explore.

"How it Works" calls `document.getElementById('how-it-works')`. That id lives in `src/components/HowItWorks.tsx`, which `Index.tsx` imports and never renders. The landing drawer inlines its own three steps and has no such id. The nav item scrolls nowhere.

### Content scaling gaps

The Chiang Mai guide (`content/guides/living-in-chiang-mai.md`, about **5,400 words**) is the quality bar: it cites the city row, argues with it, and links to `/destinations/chiang-mai` and sibling guides. The destination page does not meet it.

`src/pages/DestinationGuide.tsx` is one column for every city:

- Hero photo, four stat chips, badge row, generated intro from `src/lib/destinationSeo.ts`.
- "Best Neighborhoods" is the sentence "Neighborhood deep-dives are coming soon."
- Stay tiers are `airbnbMedian * 0.6 / 1 / 1.8`, presented as Budget / Mid / High.
- Pros, cons, coworking numbers, airport, and a spin CTA.

That is an indexable dataset landing page. It is not a guide. Publishing 781 of them is fine as a long-tail layer. Pretending they are the content strategy is how the site gets flagged as thin. Hubs do not exist: no region index, no country index, no "under $1000" or "best months" collection pages. Internal linking is one-way and sparse (guide `relatedDestinations` → city; city shows related guides only when a guide named it).

`llms.txt` links `/destinations/` as if an index exists. It does not.

### Three price lists

The same city is priced by three sources that do not agree:

| City | Spin dataset (`costUSD`) | Explore wall (`mockCities`) | Featured drawer |
|---|---:|---:|---|
| Chiang Mai | $850, 95 Mbps | $980, 70 Mbps | not in the featured trio |
| Lisbon | $2,200 | $3,938 | $2,200, "Fast / Excellent" |
| Bangkok | $1,100, 120 Mbps | $1,680, 90 Mbps | $1,100, "Excellent / Good" |

`src/components/explore/CityWallModal.tsx` renders `src/data/mockCities.ts` (15 Unsplash cards). It never reads `src/data/cities.ts`. A visitor who compares Chiang Mai on the wall, then opens the destination page or the Chiang Mai guide, gets a different city. That is worse than an ugly card.

`src/data/featuredDestinations.ts` is a third, smaller list with qualitative labels ("Fast", "Moderate") instead of the dataset's numbers.

### Data honesty under the pages

About says "780+ cities." The sitemap agrees on the count. The rows do not all deserve a page treated as fact:

- **411** `city()` rows are explicitly `dataSource: 'estimated'` (the `batch4`–`batch6` files).
- `src/data/cities/builder.ts` defaults every other `city()` row to `verified`, then fills missing long-term cost (`cost * 0.75`), rent index (`cost / 50`), Airbnb median (`cost / 22`), and power-grid score from the region.
- Hand-tuned rows in `src/data/cities.ts` are also stamped `verified` via `withDefaults`, with empty airport `{ code: '', name: '', distKm: 0 }` and `taxation.incomeTax: 'Unknown'`.

The Chiang Mai guide is careful about which fields are real. The destination template is not. A prettier template will publish the formulas more confidently.

### Guide pipeline is split

Editorial source of truth is `content/guides/*.md` + JSON, compiled by `scripts/sync-content-guides.ts` into `src/data/contentGuides.generated.ts`, merged in `src/data/guides.ts`.

Runtime also calls Supabase (`src/hooks/useGuides.ts`). Live rows win on slug. The mapper does not require `status === 'published'`, drops `seoTitle` / `relatedDestinations` / `updated`, and slugs from `city` when `slug` is null. `scripts/generate-seo-pages.ts` does the same merge at build time. A CMS row can silently replace the Chiang Mai markdown in the browser and in the prerender shell.

Prerendered guide HTML (`guideBodyHtml`) is title, excerpt, and "Open the full guide." The article body is client-rendered from the bundle. Google will execute the JS and see the prose. Crawlers that do not will not. Destination prerender is better: stats are in `#root` before React replaces them.

Homepage `<h1>` is `sr-only`. After a spin, `SEO` on `/` rewrites the title, description, image, and JSON-LD into a `TouristDestination` while `path` stays `/`. The real city URL is `/destinations/:slug` (the result card already links there with `cityPath`). The homepage should stay a `WebApplication`.

Slug note: the 2026 "best places" guide still lives at `/guides/best-places-digital-nomads-2025`. Leave the slug. Do not "fix" it in a redesign and orphan the URL.

---

## 2. Design system reality

This is a Lovable shadcn starter with a HUD painted on top. It is not a design system.

**Tokens.** `components.json` is shadcn `style: default`, `baseColor: slate`, CSS variables. `src/index.css` sets primary to iOS blue (`210 100% 50%` light, `210 100% 60%` dark). Radius is `0.5rem`. Fonts are Inter (everything, including headings) and JetBrains Mono. Dark mode is near-black. Sidebar tokens exist for a sidebar the app does not have.

**Global type rules fight the content.** Every `h1`–`h6` is Inter, weight 200, `letter-spacing: 0.12em`, `uppercase`. Guide articles then override with `font-black`, `tracking-tighter`, and a wall of `prose-*` classes inside `GuideArticle.tsx`. Destination pages obey the global rule, so "Why Go" looks like a label, not a section. Body copy is weight 300. There is no display face, no prose face, no numeric face. Mono is used as a personality, including on paragraphs that should be readable.

**Components.** `src/components/ui/` has **49** shadcn files (sidebar alone is 637 lines: chart, calendar, menubar, input-otp, carousel). Product code imports **four** of them directly: `button`, `tooltip`, `slider`, `switch`. `ThemeToggle` also pulls `dropdown-menu`. Everything else is unused starter weight. Real UI is hand-rolled Tailwind: `font-mono text-[10px] tracking-[0.2em] uppercase`, `bg-white/[0.02]`, `border-border/30`, `rounded-lg`.

**Consistency debt, concrete:**

- Four accents: token blue, globe marker `#00ffaa`, hover `#ffdd44`, scrollbar `#ffeb3b`, plus emerald CTAs on destination affiliate buttons (`text-emerald-400`) that are not the primary token.
- Surfaces assume dark: `bg-[#0a0a0a]`, `bg-white/[0.03]`, `border-white/10`. Light mode exists (`next-themes`) and will look broken on the city wall, testimonials, and preference dropdown.
- `src/App.css` is the unused Vite starter (`#root { max-width: 1280px }`, spinning React logo). It is not imported. Leave it or delete it in a cleanup; do not "design" around it.
- `README.md` is still the Lovable boilerplate (`REPLACE_WITH_PROJECT_ID`).

There is no component inventory worth porting except: stat chip, guide section, result card layout, affiliate grid, and the globe. The shadcn folder is not the system. Do not "finish adopting shadcn."

---

## 3. Graphics and visual language

### Strong, keep

- **The globe** (`src/components/Globe.tsx`, ~420 lines, react-three-fiber). Day/night textures, atmosphere shader, instanced city markers, camera focus on the result. This is the differentiator. Marker green `#00ffaa` and hover yellow are the only colors that feel like a product rather than a template.
- **Noise overlay, glass, and the fixed globe-as-background** on `/`. The home page is an instrument, not a marketing scroll. That is the brand. Do not replace it with a hero headline, three feature cards, and a logo cloud.
- **The wordmark asset** (`src/assets/dns-logo.png`) used in the header. The footer drops it for tracked "NOMAD SPIN" text.

### Generic Lovable, or actively harmful

- **"As seen on"** (`PublisherLogoCloud`): New York Times, CNN, TechCrunch, The Guardian, Forbes, set in CSS fonts, linking to generic digital-nomad articles. This is not coverage of Nomad Spin.
- **Testimonials** name Elena R., Marcus T., and Sarah K. and praise a D7-visa/fiber cross-check and "community insights on short-term lease negotiations." The product does not do those things.
- **Avatar cluster**: `i.pravatar.cc` plus "Join **14,500+** remote workers." Invented social proof next to a real affiliate disclosure is how a careful reader stops trusting the $850 figure.
- **Guide chrome**: `Archive_Database`, `SEGMENT_NOT_FOUND`, `Re-initialize lookup`, a 1px gradient hairline, mono headings at `text-6xl` uppercase. Costume on top of the one page type that should feel like a magazine.
- **Destination hero**: full-bleed Unsplash (curated IDs for ~60 cities in `src/data/cityImages.ts`, region fallback or a Supabase `city-image` function otherwise), gradient, mono city name. Competent and interchangeable with every nomad blog. The "coming soon" neighborhood block underneath makes the photography feel like a template.
- **Result card**: health bars labeled BANDWIDTH / NIGHTLIFE / POWER GRID, confetti, `DeploymentGrid`. The HUD voice is on-brand for the spin result. It is the wrong voice for a 5,000-word guide. Today both voices ship as one site.
- **Chunky yellow scrollbar** (`#ffeb3b` in `index.css`). A gimmick that matches neither the blue token nor the green markers.

The landing drawer (`LandingDrawer.tsx`, ~600 lines) is where the generic layer sits on top of the strong one: spin button, fake social proof, featured prices, how-it-works, saved spins, and mobile controls, all in one sheet. The globe is behind it. The drawer is what makes the home page feel like a Lovable demo.

---

## 4. Tech coupling

A visual/format change is **not** uniformly dangerous. The risk is concentrated in one page and in the build-time HTML rewriter.

### Safe to restyle without touching spin logic

| Piece | Why it is safe |
|---|---|
| `Globe.tsx` public props | `spinning`, `spinSpeed`, `resetCamera`, `dayMode`, `autoSpin`, `focusCity`, `onCityHover`. Scoring never imports the canvas. Restyle markers and lighting. Do not rewrite the component to "match a new homepage." |
| `useSpinStore.ts` + `src/lib/scoring.ts` | Phase machine (`landing` / `preferences` / `spinning` / `results`), filters, top results, saved spins, share URL. No JSX. |
| `src/utils/affiliateEngine.ts` | Pure URL builders. UI calls `generateAffiliateLinks(city)`. |
| `src/lib/citySlug.ts`, `destinationSeo.ts` | Slug and meta contracts. Sitemap and prerender import them. |
| `scripts/generate-sitemap.ts` | Data in, XML out. Layout-independent. |
| About, contact, legal, footer | Presentational. |

`Index.tsx` (~560 lines) is the coupling hotspot. It owns phase, sound, auth, cloud sync, the globe, the drawer, the result grid, and homepage SEO. A new home layout means editing this file. It does **not** mean reimplementing `spin()`.

### What a reckless rebuild breaks

**Affiliate links.** Partner IDs are still placeholders: `TODO_FLATIO_ID`, `TODO_BOOKING_ID`, `TODO_SKYSCANNER_ID`, `TODO_AIRALO_ID`, `TODO_SAFETYWING_ID`. Buttons already render and will send users to partner URLs with those strings in them. `DeploymentGrid` and the destination-page stay/flight links are the monetization surface. A redesign that swaps the grid for new cards must keep `generateAffiliateLinks`, `trackAffiliateClick`, and `rel="noopener"`. Making the buttons prettier before the IDs are real increases bad clicks.

**Sitemap / SEO.** Routes that must not move:

- `/`
- `/guides`, `/guides/:slug` (including `best-places-digital-nomads-2025`)
- `/destinations/:citySlug` (NFD slugs; legacy aliases redirect in `DestinationGuide`)
- `/about`, `/contact`, `/privacy-policy`, `/terms-of-use`

`vercel.json` rewrites unknown paths to `/index.html`, and the filesystem wins when `dist/<route>/index.html` exists. `generate-seo-pages.ts` writes those files by **regex-replacing** `<title>`, meta, canonical, and the homepage JSON-LD block, then injecting a `<main>` into `#root`. A Lovable pass that "cleans up" `index.html` head tags will make every prerendered title the homepage title. Two templates must stay in sync: the React page and `destinationBodyHtml` / `guideBodyHtml`.

**Analytics.** Three systems, easy to drop:

- GTM `GTM-NDK7J5HR` hardcoded in `index.html` (the snippet a visual rebuild loves to delete).
- `@vercel/analytics` in `src/main.tsx` (page views).
- `src/utils/analytics.ts` → `window.gtag` for `spin_completed`, `affiliate_click`, `affiliate_click_error`. Fired from `ResultCard` and `DeploymentGrid`. If GTM does not expose `gtag`, these only `console.log`. Do not add a fourth tracker during a redesign. Do not remove the calls.

**Auth / saved spins.** Supabase auth, `useCloudSync`, localStorage keys `savedSpins`, `spinCount`, `streak`. Cosmetic, but a new shell that forgets them deletes the only account feature.

**Images.** Destination heroes go through `useCityImage` (curated map → Supabase `city-image` → region fallback) plus Unsplash download compliance. A new card component that hotlinks random Unsplash URLs repeats the mock wall and can break attribution.

---

## 5. Tiers

### A — Keep structure, polish only

What: token pass (one accent), fix the dead How it Works target, add Guides to mobile nav, remove the duplicate fixed logo on content pages, delete the fake social proof, stop homepage SEO from adopting the spun city.

Effort: small and local (`index.css`, `MobileNav`, `Layout`, `LandingDrawer` social-proof imports, `SEO`/`Index` title logic). No route changes. No globe changes.

Why it is not enough: Explore still shows 15 mock cities at the wrong prices. Guides still have no site chrome and a costume template. Destination pages still say neighborhoods are coming soon. The thing the owner wants to scale (quality guides) stays a backwater behind "Back to Spin."

### B — Format/layout refresh, keep routes and spin core (do this)

Keep:

- Routes and slugs above.
- `Globe.tsx` behavior and props. Visual tweaks to markers/lighting only if a human checks the spin.
- `useSpinStore`, `scoring.ts`, city dataset, `affiliateEngine`, sitemap script, GTM, Vercel Analytics, slug redirects.
- Markdown guides in `content/guides/` as the editorial source. Supabase must not override a published markdown slug.

Rebuild the surfaces, not the engine:

1. **One shell.** Persistent nav on every route: Spin, Guides, About. Explore only if it is real (next item). One logo. Theme toggle in the nav, not a second floating logo. Footer stays.
2. **Kill or replace the mock wall.** Either `CityWallModal` reads `cities` and links to `/destinations/:slug`, or the entry point goes away. Delete `mockCities` and the qualitative `featuredDestinations` prices so the drawer cannot contradict the dataset. Chiang Mai is $850 everywhere or it is not on the wall.
3. **Guide template is for reading.** Drop `Archive_Database` and the global uppercase heading rule for article content. Serif or a normal sans for prose, mono only for stats and labels. Related destinations and the spin CTA stay. Prerender the article body in `guideBodyHtml`, not the excerpt.
4. **Destination template stays a data page and says so.** Keep the stat bar and the affiliate buttons. Remove "coming soon," or replace it with a link to the editorial guide when one exists and a plain "no field guide yet" when it does not. Stop inventing stay prices from `airbnbMedian * 0.6`. Add a `/destinations` index (and, if energy remains, region hubs) as **new** routes. Do not rename existing city URLs.
5. **Home drawer diet.** Spin, preferences, saved picks, real featured cities from the dataset. No pravatar, no press logos, no invented counts. The globe remains the hero.
6. **One accent.** Align primary with the globe green or retire the green and the yellow scrollbar. Stop hardcoding `#0a0a0a` so light mode is either real or explicitly off on the instrument pages.

Effort: concentrated in `Layout`, `Index` header, `LandingDrawer` (split it), `GuideArticle`, `DestinationGuide`, `explore/*`, `index.css`, and the guide branch of `generate-seo-pages.ts`. Do not open `Globe.tsx`, `useSpinStore.ts`, or `affiliateEngine.ts` except to call them.

This is the tier that serves traffic and monetization: guides become something you can send, city URLs stay indexed, affiliate clicks keep their tracker, and the spin still feels like the product.

### C — Massive rethink (new shell / design system)

Justified only after B, and only if the goal is a content site that happens to contain a globe (real hub taxonomy, editorial CMS, city pages that are not one component). That is a platform change, not a theme.

Keep, as libraries: city data and slug rules, scoring, globe component, affiliate engine, analytics event names, GTM container, sitemap generation, the `content/guides` format.

Rebuild: `Layout`, `Index`, page templates, tokens. Retire the unused shadcn kit instead of theming it. If the framework changes (Next/Astro for guides), replace `generate-seo-pages.ts` on purpose. Do not "let the new framework figure out SEO."

Lovable is the wrong tool for C. A full-page regenerate will rewrite `Index.tsx` and `index.html`, which is how you lose the phase machine, the prerender regex, and GTM in one prompt.

---

## 6. Lovable credits vs Claude/Cursor

**Spend Claude/Cursor. Do not spend Lovable credits on a full visual rebuild.**

Priority order, under traffic and monetization constraints:

1. **Trust before paint.** Remove the press bar, the testimonials, and the 14,500+ pravatar block. Point Explore at real cities or remove it. Wrong prices cost more than a dated card.
2. **Guides are the SEO bet.** Restyle `GuideArticle` and prerender the full markdown. Chiang Mai is already the page worth ranking. A new coat of paint on 781 thin city pages will not outrank it.
3. **Do not reskin affiliate buttons until partner IDs are real.** The click path exists. Placeholder IDs mean a prettier grid sends the same unpaid traffic. Wire IDs in `AFFILIATE_CONFIG`, then keep `DeploymentGrid`'s tracking.
4. **Then** the shell and the destination template (tier B items 1, 4, 5, 6).
5. **Leave the globe alone** unless a change is a deliberate lighting/marker pass reviewed against a spin on desktop and mobile.

Where Lovable fits: a throwaway mood board in a branch, or a single presentational experiment (one guide hero, one stat row) that a person ports by hand. It does not fit `Index.tsx`, `Globe.tsx`, `index.html`, the SEO scripts, or "redesign all pages."

Where Claude/Cursor fits: the shell, the two templates, the mock-data deletion, the prerender body, and any token cleanup. Those edits have to preserve imports (`generateAffiliateLinks`, `trackAffiliateClick`, `cityPath`, Helmet canonicals, GTM). An agent that can see the file is less likely to replace them with a generic card grid than a prompt that regenerates the page.

The owner's constraint (no cheap auto-content, keep the spin) maps cleanly onto this: the spin is code, the quality is the markdown, and the Lovable layer is the part that looks finished while showing the wrong city.
