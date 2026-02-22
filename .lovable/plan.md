

## City Wall Grid and Comparison Foundation

### Overview
Build a full-screen, togglable overlay modal ("City Wall") displaying a dense grid of city cards with image backgrounds and key data. Includes a comparison selection system with a floating action bar.

### New Files

**1. `src/data/mockCities.ts`**
- Export a `MockCity` interface (separate from the existing `City` type to avoid conflicts) with: id, rank, name, country, monthlyCost, internetMbps, tempC, weatherIcon, imageUrl
- Export a `mockCities` array with 15 cities including Asuncion, Da Nang, Lisbon, Medellin, Bangkok, Buenos Aires, Tbilisi, Mexico City, Chiang Mai, Porto, Cali, Ho Chi Minh City, Cape Town, Budapest, Kuala Lumpur
- Uses Unsplash image URLs with `q=80&w=600&auto=format&fit=crop` params

**2. `src/components/explore/CityCard.tsx`**
- Props: `city: MockCity`, `isSelected: boolean`, `onToggleSelect: (id: string) => void`
- Aspect ratio 4:5 card with full-bleed background image, gradient overlay
- Top-left: rank badge (blurred pill)
- Top-right: wifi icon + Mbps
- Bottom-left: city name (bold) + country
- Bottom-right: cost/mo pill
- On hover: reveal a checkbox/select indicator for comparison mode
- Uses `Wifi` icon from lucide-react

**3. `src/components/explore/CityWallModal.tsx`**
- Props: `isOpen: boolean`, `onClose: () => void`
- Returns `null` when closed
- Fixed full-screen overlay at `z-[100]` with dark background and blur
- Sticky header with "Explore Destinations" title and X close button
- Responsive grid: 2 cols mobile, 4 cols md, 6 cols lg, 8 cols xl
- Maps `mockCities` into `CityCard` components
- Local state for `selectedCities: string[]` array
- Floating action bar (fixed bottom, `z-[110]`) appears when 1+ cities selected, showing count and "Compare Now" button (button is non-functional placeholder for now)

### Modified Files

**4. `src/pages/Index.tsx`**
- Add state: `const [isCityWallOpen, setIsCityWallOpen] = useState(false)`
- Import and render `<CityWallModal>` at root level (outside the z-10 content wrapper)
- Pass open/close state as props

**5. `src/components/LandingDrawer.tsx`**
- Add `onOpenCityWall: () => void` to props interface
- Add an "Explore Cities" button in the drawer (near the SpinButton area) that calls `onOpenCityWall`
- Uses `Globe2` or `Compass` icon from existing imports

### Technical Notes
- The `MockCity` interface is intentionally separate from the existing `City` type in `src/data/cities/types.ts` -- this keeps the dummy data self-contained and avoids requiring all the complex nested fields
- The modal uses `z-[100]` to sit above the globe (`z-0`) and all existing UI (`z-10` to `z-40`)
- All interaction within the modal uses `pointer-events-auto` per the existing HUD architecture pattern
- The "Compare Now" button is a placeholder -- the comparison view itself will be a future phase
