

## Fix: Unsplash Images Blocked by Browser (ORB)

### Root Cause

The Unsplash API key and edge function are working perfectly -- the API returns valid image URLs and attribution data. The issue is that **some browsers block certain cross-origin image loads** due to a security feature called **ORB (Opaque Resource Blocking)**.

The error in the network tab is: `net::ERR_BLOCKED_BY_ORB`

This happens because the `<img>` tags are missing the `crossOrigin="anonymous"` attribute, which tells the browser to make a proper CORS request. Without it, some image responses get silently blocked.

### Fix

Add `crossOrigin="anonymous"` to all `<img>` tags that load Unsplash images.

### Files to Change

| File | Change |
|------|--------|
| `src/components/ResultCard.tsx` | Add `crossOrigin="anonymous"` to the hero `<img>` tag (~line 111) |
| `src/components/TopResultsGrid.tsx` | Add `crossOrigin="anonymous"` to the runner-up thumbnail `<img>` tag |

### Technical Details

- The Unsplash CDN already returns the correct CORS headers (`access-control-allow-origin: *`, `cross-origin-resource-policy: cross-origin`)
- Adding `crossOrigin="anonymous"` makes the browser perform a CORS-enabled fetch instead of a no-cors opaque fetch, which prevents ORB from blocking the response
- This is a one-line fix per `<img>` tag -- no backend or API changes needed
- The `UNSPLASH_ACCESS_KEY` secret is confirmed present and working correctly

