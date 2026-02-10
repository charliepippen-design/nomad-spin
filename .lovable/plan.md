

## Persistent Social Bar, Clear CTA, Trust Section, and Navigation Refinements

### Overview

This plan adds five major upgrades: (1) a responsive social share bar always visible, (2) a compelling headline + primary CTA on the landing screen, (3) a "How it Works" trust section below the fold, (4) refined navigation links, and (5) performance and accessibility enhancements throughout.

---

### 1. Persistent Social Share Bar (Desktop + Mobile)

**Current state**: `SocialShareBar.tsx` only renders when `phase === 'results'` and is always a vertical left-pinned bar.

**Changes**:
- Move `<SocialShareBar>` rendering outside the phase conditional in `Index.tsx` so it is always visible.
- Remove city-specific share text when no result is selected -- fall back to generic app share text ("Discover your next digital nomad destination with Nomad Spin!").
- Add Telegram button alongside the existing X, WhatsApp, Facebook, LinkedIn, and Copy Link.
- Use `useIsMobile()` hook to switch layout:
  - **Desktop**: Vertical bar, `fixed left-4 top-1/2 -translate-y-1/2 z-20`, centered vertically.
  - **Mobile**: Horizontal bar, `fixed bottom-16 left-0 right-0 z-20 flex-row justify-center`, above system UI.
- Add `aria-label` attributes and keyboard focus styles (`focus-visible:ring-2`) for accessibility.
- Share URLs include UTM parameters: `?utm_source=nomadspin&utm_medium=social&utm_campaign=share`.
- Add small hover scale animation (`hover:scale-110 transition-transform duration-200`).
- Ensure the bar does not overlap with the globe canvas by using `pointer-events-auto` only on the bar itself, not the container.

**Files**:
- EDIT: `src/components/SocialShareBar.tsx` -- Add Telegram icon, responsive layout, UTM params, always-visible mode, accessibility.
- EDIT: `src/pages/Index.tsx` -- Render SocialShareBar unconditionally, pass dynamic props.

---

### 2. Clear Primary CTA and Headline (Landing Phase)

**Current state**: Landing shows a small "WHERE TO NEXT?" text and a "SET PREFERENCES" button.

**Changes**:
- Replace "WHERE TO NEXT?" with a two-line hero block:
  - **Headline**: "Spin the globe. Find your next digital nomad base." (larger text, `text-lg md:text-2xl font-mono`)
  - **Subheadline**: "Compare cost of living, internet, safety, and book stays, flights, and eSIMs in one place." (smaller, `text-xs text-muted-foreground`)
- Change SpinButton label from "SET PREFERENCES" to "Spin and Compare Destinations".
- Style the button with a subtle glow/gradient border to make it unmissable.
- Keep everything above the fold by positioning in the existing `justify-end pb-8` flex container (which overlays the globe).

**Files**:
- EDIT: `src/pages/Index.tsx` -- Replace landing phase content with headline, subheadline, and renamed CTA.

---

### 3. Trust and Clarity Section (Below the Fold)

**Current state**: No content below the fold at all.

**Changes**:
- Add a new `HowItWorks` component rendered below the main content area (after the globe + overlay).
- Only visible on the landing phase (hidden during spinning/results to keep focus on results).
- Content:
  - **3-step process**: "1. Spin and select a city. 2. Compare key metrics. 3. Book what you need."
  - **3 benefit bullets**: "Avoid slow internet traps", "Optimize cost vs. quality of life", "Plan trips in minutes instead of days".
  - Small paragraph about data: "Our dataset covers 600+ cities worldwide with curated cost, internet, safety, and visa data."
- Styled with glass cards, `max-w-3xl mx-auto`, consistent with the premium aesthetic.
- Uses `pointer-events-auto` so it is scrollable and interactive.

**Files**:
- NEW: `src/components/HowItWorks.tsx` -- The trust/clarity section component.
- EDIT: `src/pages/Index.tsx` -- Render HowItWorks below the main content when phase is landing.

---

### 4. Navigation Refinements

**Current state**: Header only has "NOMAD SPIN" logo and utility buttons (auto-spin, day/night, mute, auth).

**Changes**:
- Add three nav links in the header (desktop only, hidden on mobile to avoid clutter):
  - "Explore" -- scrolls to or triggers the preferences modal.
  - "How it Works" -- smooth scrolls to the HowItWorks section.
  - "About" -- could link to a future page or scroll to a small footer.
- On mobile, these links collapse into a simple menu or are accessible via the trust section itself.
- Style: `text-[10px] font-mono tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors`.
- Keep the header light -- no heavy navbar, just subtle text links.

**Files**:
- EDIT: `src/pages/Index.tsx` -- Add nav links in header section.

---

### 5. Performance and UX Details

**Changes across multiple files**:
- Social bar buttons get `tabIndex={0}`, `role="button"` (for copy), and `aria-label` for screen readers.
- Share URLs use `getShareableUrl()` with appended UTM parameters for tracking.
- The social bar container uses `will-change: transform` to hint GPU compositing and avoid layout shift.
- The HowItWorks section uses `loading="lazy"` pattern (only renders when in viewport via intersection observer or simply by being below fold).

---

### Summary of File Changes

| File | Action | What |
|------|--------|------|
| `src/components/SocialShareBar.tsx` | EDIT | Add Telegram, responsive desktop/mobile layout, UTM params, always-visible, a11y |
| `src/components/HowItWorks.tsx` | NEW | Trust section with 3-step process, benefits, data paragraph |
| `src/pages/Index.tsx` | EDIT | Render SocialShareBar always, add headline/subheadline, render HowItWorks, add nav links |

### Technical Notes

- The `useIsMobile()` hook already exists at `src/hooks/use-mobile.tsx` with a 768px breakpoint.
- No new dependencies required -- all built with existing framer-motion, lucide-react, and Tailwind.
- The trust section only renders on landing phase to avoid cluttering the results view.
- UTM parameters use the existing `buildUtmParams` utility pattern from the affiliate engine.
- The social bar z-index (20) stays below the noise overlay (9999) and above the globe (0).

