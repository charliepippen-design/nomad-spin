

# Build Premium Hero and Social Proof Section

## Overview

Create a new `HeroSection` component with a premium, glassmorphic design featuring a two-column hero layout, logo cloud, and testimonial cards. This will be a standalone component that can be placed on the landing page.

## New File

### `src/components/HeroSection.tsx`

A single, well-structured component containing three visual sections:

### Section 1: Hero (Two-Column)
- **Background**: Full-width dark gradient overlay with a subtle tropical/nomad image feel using CSS gradients
- **Left Column**:
  - Top badge row with `Award` icon, 5 filled gold `Star` icons, and "#1 Crypto Nomad Community 2026" text
  - Massive gradient headline: "Spin the World."
  - Subheadline paragraph
  - Avatar cluster: 8 overlapping circular avatars from Unsplash `randomuser.me` placeholders with "Join 14,500+ remote players" text
  - 4 value bullets using `Globe`, `Zap`, `MapPin`, `MessageCircle` icons
- **Right Column**:
  - Floating glassmorphic card (`bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl`)
  - Aspect-video placeholder image with centered `PlayCircle` icon (pulse animation via Framer Motion)
  - Email input field (dark glass style)
  - Red CTA button: "Claim Your Nomad Bonus ->"

### Section 2: Logo Cloud
- Cream/off-white background (`bg-[#f5f5f0]`) with wavy top transition
- 6 publisher names: Bloomberg, TechCrunch, Forbes, AskGamblers, CoinDesk, Wired
- Grayscale + opacity styling with hover-to-full-color transition

### Section 3: Testimonial Cards
- Dark background (`bg-[#1a1814]`)
- 3-column responsive grid
- Each card: dark glass style with a punchy quote about Digital Nomad Spin and publisher attribution at bottom
- Fade-in-up animation on mount via Framer Motion

## Integration

### `src/pages/Index.tsx`
- Import and render `<HeroSection />` inside the landing phase content area, before or within the `LandingDrawer` section

## Technical Details

### Framer Motion animations
- Each major section uses `motion.div` with `initial={{ opacity: 0, y: 30 }}` and `animate={{ opacity: 1, y: 0 }}` with staggered delays
- PlayCircle icon uses `animate={{ scale: [1, 1.1, 1] }}` with `repeat: Infinity` for pulse effect

### Responsive approach
- Mobile: single column stack, smaller text sizes
- Desktop (`md:` breakpoint): two-column grid for hero, 3-column grid for testimonials

### Icons used (all from lucide-react)
`Award`, `Star`, `Globe`, `Zap`, `MapPin`, `MessageCircle`, `PlayCircle`

### Avatar URLs
Use `https://i.pravatar.cc/100?img=N` (N=1-8) for the 8 avatar placeholders -- these are reliable placeholder avatar images

### Files to create/modify

| File | Action |
|---|---|
| `src/components/HeroSection.tsx` | Create new component with all three sections |
| `src/pages/Index.tsx` | Import and render `<HeroSection />` in the landing phase |

