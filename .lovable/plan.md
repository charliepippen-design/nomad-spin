
# Make Scrollbar More Visible

## Problem
The current scrollbar uses `width: 6px` and low-opacity colors (`white/20` thumb, `white/5` track), making it nearly invisible on the dark background.

## Changes

### `src/index.css`
Make the `.scrollbar-visible` scrollbar significantly more prominent:
- Increase width from `6px` to `10px`
- Increase thumb opacity from `0.2` to `0.45` (idle) and `0.4` to `0.7` (hover)
- Increase track opacity from `0.05` to `0.12`
- Change Firefox `scrollbar-width` from `thin` to `auto` for a wider scrollbar
- Add a subtle border/outline to the thumb for extra contrast

### Files modified
- `src/index.css` -- increase scrollbar width and opacity values
