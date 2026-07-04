# Training Display Layout Requirements

## Product rule

The workout screen must not stop at being "responsive".

For every relevant viewport and every relevant visible participant count, the UI must choose the arrangement that uses space best for fast recognition at training distance.

The evaluation question is always:

- Which arrangement is best for this exact width, height, and participant count?

The screen is not acceptable if it is merely readable but wastes a large amount of space or makes the participant-to-exercise pairing weaker than necessary.

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

- Phone, `2-4` participants: single-column compact list
- Phone, `5+` participants: single-column dense list
- Tablet portrait, `3-4` participants: multi-column layout only if text remains comfortably horizontal
- Tablet landscape, `2` participants: vertical stack
- Tablet landscape, `3-4` participants: broad cards with strong content scaling
- Tablet landscape, `5-8` participants: balanced grid
- Tablet landscape, `9-12` participants: dense overview grid
