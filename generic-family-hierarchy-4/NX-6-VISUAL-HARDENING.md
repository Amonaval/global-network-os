# NX-6 Visual Hardening

## Why
Runtime screenshots exposed two layout-system defects after NX-6:
- NetworkSwitcher inherited the old Family menu column direction, making every network entry excessively tall and visually fragmented.
- ProfileDrawer reserved too much fixed vertical space for guide/header/hero/footer, leaving the actual profile content in a very small scroll viewport.

## Fix
- Network switcher is now a compact bounded popover with horizontal rows, fixed-size vertical icons, concise metadata, a small Current badge, and a scrollable network list.
- Profile modal now prioritizes content: compact header/hero/tabs, guide moved to a small header action, relationship text clamped, and the body receives the flexible majority of modal height.
- Desktop actions remain compact; mobile keeps the bottom-sheet model with usable content height and horizontal action overflow rather than crushing the content area.

## Guardrail
Do not reintroduce large fixed-height help/hero/action regions around a small nested scroll viewport. Primary content should own the available height; secondary help and controls should remain compact or progressive-disclosure.
