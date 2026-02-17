
## Add Zoom Controls for the Globe

Since mouse wheel is now reserved for page scrolling, we need an alternative way to let users zoom the globe. The cleanest approach: **floating +/- zoom buttons** overlaid on the globe area.

---

### What Changes

**Add a `ZoomControls` component inside `Globe.tsx`** -- two small circular buttons (+ and -) positioned in the bottom-right corner of the globe container. Clicking them smoothly adjusts the camera distance within the existing min/max range (3.5 to 8).

### How It Works

- Store a `zoomLevel` ref inside the Globe component (initial value: 5.5, matching the default camera Z position)
- The + button decreases the value (zoom in, min 3.5), the - button increases it (zoom out, max 8)
- A new `ZoomRig` inner component (inside the Canvas) reads this ref each frame and lerps the camera Z position toward the target -- smooth animated zoom
- Buttons are styled as small glass-morphism circles (`bg-black/40 backdrop-blur-sm border border-white/10`) matching the existing UI aesthetic
- Buttons use `pointer-events-auto` so they're clickable above the globe

### Layout

```text
+---------------------------+
|                           |
|         [Globe]           |
|                           |
|                     [+]   |
|                     [-]   |
+---------------------------+
```

### Technical Details

**File: `src/components/Globe.tsx`**

1. Add a `zoomTargetRef = useRef(5.5)` in the main `Globe` component
2. Create two handler functions: `handleZoomIn` (subtracts 0.5, clamps to 3.5) and `handleZoomOut` (adds 0.5, clamps to 8)
3. Add a new `ZoomRig` component inside the Canvas that reads `zoomTargetRef` and lerps `camera.position.z` toward it each frame (coexists with existing `CameraRig`)
4. Render the +/- buttons as an HTML overlay inside the globe's wrapper div (outside the Canvas), positioned with `absolute bottom-6 right-6 z-10 pointer-events-auto`
5. Pass `zoomTargetRef` into the Canvas via a shared ref (since it's a mutable ref, no re-renders needed)

**No other files need to change.**
