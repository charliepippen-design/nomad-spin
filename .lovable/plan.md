
## Premium Travel Discovery Platform Overhaul

This plan transforms Nomad Spin from a single-page spin tool into a multi-page premium travel discovery platform optimized for affiliate monetization and SEO.

---

### Phase 1: Routing Infrastructure and Layout Shell

**Switch from HashRouter to BrowserRouter** for clean SEO-friendly URLs (`/about` instead of `/#/about`).

Create a shared `Layout` component that wraps all pages with the existing header (extracted from Index.tsx) and a new global `Footer`.

**New routes:**

| Route | Page Component | Purpose |
|-------|---------------|---------|
| `/` | Index (existing) | Homepage with spin tool |
| `/about` | About | Brand story, team, mission |
| `/contact` | Contact | UI form (name, email, message) |
| `/privacy-policy` | PrivacyPolicy | Legal text |
| `/terms-of-use` | TermsOfUse | Legal text |
| `/destinations/:citySlug` | DestinationGuide | Dynamic city guide template |
| `/guides/:slug` | GuideArticle | Dynamic blog/guide articles |

**Files to create:**
- `src/components/Layout.tsx` -- shared header + footer wrapper
- `src/components/Footer.tsx` -- global footer
- `src/pages/About.tsx`
- `src/pages/Contact.tsx`
- `src/pages/PrivacyPolicy.tsx`
- `src/pages/TermsOfUse.tsx`
- `src/pages/DestinationGuide.tsx`
- `src/pages/GuideArticle.tsx`

**Files to modify:**
- `src/App.tsx` -- switch to BrowserRouter, add all new routes, wrap in Layout
- `src/pages/Index.tsx` -- extract header into Layout component

---

### Phase 2: Global Footer Component

The footer includes:

- **Navigation links**: About, Contact, Privacy Policy, Terms of Use
- **Social media links**: Twitter/X, Instagram, GitHub (icon links)
- **Affiliate Disclosure**: "I may earn a commission from qualifying bookings at no extra cost to you."
- **Copyright line**
- Styled to match the obsidian glass aesthetic (dark bg, mono fonts, subtle borders)

---

### Phase 3: Homepage Hero and "Plan Your Stay" Block

**Hero updates:**
- Headline: keep "Spin the globe. Find your next digital nomad base." but add a supporting tagline: "Travel discovery tool for digital nomads"
- Add a subtle descriptor badge above the headline

**"Where to Stay" block** (below the spin tool, above How It Works):
- A grid of 3-6 featured destination cards linking to `/destinations/:citySlug`
- Each card shows city name, country, a thumbnail, and cost snippet
- Featured cities: Asuncion, Buenos Aires, Medellin, Bangkok, Lisbon, Tbilisi
- Only shown on the landing phase (not during results)

**Files to modify:**
- `src/pages/Index.tsx` -- add tagline, add featured destinations block

**Files to create:**
- `src/components/FeaturedDestinations.tsx` -- the "Where to Stay" grid

---

### Phase 4: Mobile Bug Fix for 2nd/3rd City Buttons

The runner-up "VIEW DETAILS" buttons call `onSelectResult` which updates `resultCity` in the store. On mobile, the issue is that the primary `ResultCard` re-renders with new data but the user can't see it because they're scrolled down to the runner-up cards.

**Fix approach:**
- Add a `key={resultCity.id}` to the primary ResultCard wrapper so React fully re-mounts it on city change (triggering entry animations)
- The existing `scrollIntoView` in `TopResultsGrid` should then work -- but add a longer delay (300ms) to allow the re-mount animation to start
- Ensure the runner-up button has proper touch target size (min 44px height) for mobile

**Files to modify:**
- `src/components/TopResultsGrid.tsx` -- increase scroll delay, ensure touch targets
- `src/pages/Index.tsx` -- add `key` prop to ResultCard wrapper

---

### Phase 5: Spin Result Card Redesign

Enhance the existing ResultCard with:

1. **Short intro description** -- a one-line AI-generated or template-based city summary below the city name
2. **Simplified key stats** -- prominently show: Avg Monthly Budget, Wi-Fi Speed, Safety Score
3. **Primary CTA redesign**: Change from "Check Stays in [City]" to a larger, higher-contrast button: **"Find a place to stay in [City]"** with improved visual weight
4. **Internal link**: Add a "Read full guide" link pointing to `/destinations/${citySlug}` below the CTA

**Files to modify:**
- `src/components/ResultCard.tsx` -- add intro text, redesign CTA, add guide link

---

### Phase 6: Destination Guide Template

A rich, mobile-first page template at `/destinations/:citySlug` that:

1. Looks up the city from the dataset by slug
2. Triggers AI enrichment if needed (reuses existing `useCityEnrichment` hook)
3. Renders structured sections with H2 headings:

| Section | Content |
|---------|---------|
| Hero banner | City image, name, country, key stats overlay |
| Why Go | Pros list, vibe tags, landscape description |
| Best Neighborhoods | Placeholder text (expandable via AI enrichment later) |
| Where to Stay | Budget / Mid-range / High-end tiers with affiliate CTAs |
| Coworking and Wi-Fi | Internet speed, reliability, coworking density |
| Getting There | Nearest airport, flight estimates, visa info |
| Safety | Safety score, legal notes, female safety, LGBTQ+ friendliness |
| Bottom CTA | "Not sure where to go next? Spin for a new city" linking back to `/` |

- Uses proper semantic HTML (h1, h2, section tags) for SEO
- Mobile-first with generous spacing (px-6, py-8+, gap-6+)
- Includes JSON-LD structured data for the destination

**Files to create:**
- `src/pages/DestinationGuide.tsx` -- the full template
- `src/components/GuideSection.tsx` -- reusable section wrapper with H2

---

### Phase 7: Guide Article Stub

Create a simple `/guides/:slug` page that serves as a placeholder for future blog content. For now it shows a "Coming Soon" state with a link back to the spin tool.

**Files to create:**
- `src/pages/GuideArticle.tsx`

---

### Technical Details

**Router change**: HashRouter to BrowserRouter requires no backend config since this is a client-side SPA -- the existing Vite dev server and Lovable preview handle client-side routing. A `public/_redirects` or similar may be needed for production but Lovable handles this automatically.

**Header extraction**: The current header lives inside `Index.tsx` (lines 215-382). It will be extracted into the `Layout` component so it appears on all pages. The globe background and pointer-events logic remain Index-only.

**City slug lookup**: Use `slugify(city.name)` to generate URL-friendly slugs, and match against the cities array. Example: "Buenos Aires" becomes `buenos-aires`, URL: `/destinations/buenos-aires`.

**SEO**: Each destination guide page will use react-helmet-async to set unique title, description, and OG tags. The existing SEO component will be reused.

**No database changes needed** -- all content is derived from the existing city dataset and AI enrichment cache.

### Summary of All Files

**New files (10):**
- `src/components/Layout.tsx`
- `src/components/Footer.tsx`
- `src/components/FeaturedDestinations.tsx`
- `src/components/GuideSection.tsx`
- `src/pages/About.tsx`
- `src/pages/Contact.tsx`
- `src/pages/PrivacyPolicy.tsx`
- `src/pages/TermsOfUse.tsx`
- `src/pages/DestinationGuide.tsx`
- `src/pages/GuideArticle.tsx`

**Modified files (4):**
- `src/App.tsx`
- `src/pages/Index.tsx`
- `src/components/ResultCard.tsx`
- `src/components/TopResultsGrid.tsx`
