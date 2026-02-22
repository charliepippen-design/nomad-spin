

## Remove the Dead "Scroll to Explore" Button

The "Scroll to Explore" button in the left panel (`LandingDrawer.tsx`) scrolls to a `#how-it-works` section that no longer exists in the current page layout. It serves no purpose and takes up valuable space in the drawer.

### Changes

**`src/components/LandingDrawer.tsx`**
- Remove the "Scroll to explore" button block (the `<button>` with `handleScroll` / `onScrollToExplore` around lines 373-386)
- Remove the `onScrollToExplore` prop from the component's props interface since it's no longer used
- Clean up any related handler references inside the component

**`src/pages/Index.tsx`**
- Remove the `handleScrollToHowItWorks` callback (lines 153-155) since nothing references it after the prop is removed
- Remove the `onScrollToExplore={handleScrollToHowItWorks}` prop from the `<LandingDrawer>` usage

This is a straightforward cleanup -- no visual or functional impact beyond removing the orphaned button.

