

## Subtle Hover Indicator for City Markers

Enhance city marker discoverability by adding visual feedback when hovering over markers on the globe.

### Changes

**File: `src/components/Globe.tsx` — CityMarkers component**

1. **Color change on hover**: Use `setColorAt` on the instanced mesh to change the hovered marker's color from the default green (`#00ffaa`) to a bright white/gold (`#ffdd44`), making it visually pop.

2. **Size boost on hover**: The existing code already scales hovered markers larger (`0.05` vs `0.028`). This will be kept and slightly increased to `0.06` for more noticeable feedback.

3. **Glow ring effect**: Add a second transparent, larger sphere rendered at the hovered marker's position to create a soft "pulse ring" around it. This will use a separate mesh (not instanced) that only appears when a marker is hovered, positioned at the hovered city's 3D coordinates.

### Technical Details

- In the `useFrame` loop, when `hoveredRef.current === i`, set the instance color to bright gold using `meshRef.current.setColorAt(i, hoverColor)` and reset others to the default green. This requires initializing `instanceColor` on the mesh.
- Add a single non-instanced `<mesh>` sibling that renders a larger, transparent, pulsing sphere at the hovered marker's world position. It will be conditionally visible based on `hoveredRef.current !== null`.
- The glow ring will use additive blending and low opacity for a subtle, non-distracting effect.
- Cursor already changes to pointer on hover (existing code) — no change needed there.

