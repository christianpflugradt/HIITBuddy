# Training Display Layout Requirements

## Product rule

The workout screen must not stop at being "responsive".

For every relevant viewport and every relevant visible participant count, the UI must choose the arrangement that uses space best for fast recognition at training distance.

The evaluation question is always:

- Which arrangement is best for this exact width, height, and participant count?

The screen is not acceptable if it is merely readable but wastes a large amount of space or makes the participant-to-exercise pairing weaker than necessary.

## PWA product requirement

HIITBuddy should be installable as a PWA on supported devices.

The installable shell must not trade away update visibility for offline caching:

- The app should use a manifest and service worker so users can add it to the home screen.
- The service worker should be intentionally cache-light.
- App updates should become visible immediately after deployment.
- `index.html`, the manifest, and the service worker should revalidate on every load.
- Built JS and CSS assets may be cached aggressively only when they carry unique content hashes in their filenames.
- Do not keep stale non-hashed UI bundles in long-lived application caches unless there is an explicit product decision to do so.

## Required evaluation questions

For every viewport/person-count combination, validate all of these:

1. Is the timer dominant and immediately recognizable?
2. Is the participant -> exercise mapping the main content?
3. Is horizontal reading supported instead of compressed?
4. Is there large empty area without information gain?
5. Is this the best arrangement for this specific width, height, and count?

If any answer is `no`, the layout is not finished.

## Explicit layout requirements

### Two participants on wide tablet/desktop

- Do not default to two side-by-side oversized cards.
- Because names and exercise labels are horizontal content, a vertical stack is preferred on wide displays.
- The two cards should use the available width and grow their content, instead of surrounding a small text block with large empty space.

### Three participants on smartphone

- Must remain clearly readable from near distance.
- Use compact stacked cards.
- Avoid inflated card heights and avoid broken word wrapping.

### Four or more participants on smartphone

- Must remain usable from near distance.
- Compact list layout is acceptable.
- This is no longer the primary display target; tablet remains preferred.

## Current decision matrix

Phone:

- `2`: `1 x 2`
- `3`: `1 x 3`
- `4`: `1 x 4`
- `5`: `1 x 5`
- `6`: `1 x 6`
- `7`: `1 x 7`
- `8`: `1 x 8`
- `9`: `1 x 9`
- `10`: `1 x 10`
- `11`: `1 x 11`
- `12`: `1 x 12`

Tablet/Desktop portrait:

- `2`: `1 x 2`
- `3`: `2 + 1`
- `4`: `2 x 2`
- `5`: `2 + 2 + 1`
- `6`: `2 x 3`
- `7`: `2 + 2 + 2 + 1`
- `8`: `2 x 4`
- `9`: `3 x 3`
- `10`: `3 + 3 + 2 + 2`
- `11`: `3 + 3 + 3 + 2`
- `12`: `3 x 4`

Tablet/Desktop landscape:

- `2`: `1 x 2` stacked
- `3`: `3 x 1`
- `4`: `2 x 2`
- `5`: `3 + 2`
- `6`: `3 x 2`
- `7`: `4 + 3`
- `8`: `4 x 2`
- `9`: `3 x 3`
- `10`: `4 + 3 + 3`
- `11`: `4 + 4 + 3`
- `12`: `4 x 3`

## Automated validation

The repository should keep a reproducible layout audit, not just manual spot checks.

Current audit approach:

- Playwright screenshots for fixed phone and tablet viewport cases
- Heuristic checks for column count per case
- Heuristic checks for compact mobile card height
- Heuristic checks for grid width usage on wide `2`-participant layouts
- Heuristic checks for card-area-to-stage-area ratio as a coarse whitespace signal
- Heuristic checks for row balance so layouts such as `4 + 1` fail automatically

The audit command is:

```bash
npm run audit:layout
```

Artifacts should be written to `tmp/layout-audit/` so regressions can be inspected visually after the latest run while staying out of Git.
