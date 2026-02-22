
# Fix the PAGE-LEVEL Scrollbar (Next to Social Buttons)

## Problem
All previous changes only affected the LandingDrawer's internal scrollbar. The scrollbar the user has been pointing at -- the one beside the social share buttons on the right edge of the entire page -- uses the default thin `4px` styles defined in `@layer base` in `src/index.css`.

## Solution

### `src/index.css`
Replace the default page-level scrollbar styles (inside `@layer base`, the `::-webkit-scrollbar` rules) with the same chunky, high-contrast yellow scrollbar:

```css
::-webkit-scrollbar {
  width: 20px;
}
::-webkit-scrollbar-track {
  background: #000000;
}
::-webkit-scrollbar-thumb {
  background-color: #ffeb3b;
  border-radius: 999px;
  border: 4px solid #000000;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #fff176;
}
```

And for Firefox:
```css
html {
  scrollbar-width: auto;
  scrollbar-color: #ffeb3b #000000;
}
```

This replaces the current thin `4px` / low-opacity scrollbar with the same bold yellow treatment, applied globally to every scrollbar on the page (including the one right next to the social buttons).

### Files modified
| File | Change |
|---|---|
| `src/index.css` | Replace the thin default scrollbar styles in `@layer base` with chunky 20px yellow scrollbar |

### Technical Details
- Lines ~73-83 in `src/index.css`: replace the existing `::-webkit-scrollbar`, `::-webkit-scrollbar-track`, `::-webkit-scrollbar-thumb`, and `::-webkit-scrollbar-thumb:hover` rules with the bold yellow versions
- Add `scrollbar-width: auto; scrollbar-color: #ffeb3b #000000;` to the `html` selector for Firefox support
