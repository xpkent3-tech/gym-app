# Proposal

## Why

User feedback: *"hand and foot still look weird and hair still look weird."* Zoomed in, the cause was structural: the muscle artwork is a set of floating pieces, so hands, feet, neck and knees hovered with gaps, and my hand-drawn replacements could not fix that. The artwork library also ships a continuous full-body outline (with a properly feminine female form, natural hands and feet) that we were discarding.

## What Changes

- Realistic style renders the library's body silhouette as a continuous base under the muscles. The female form is the library's own hourglass figure (the earlier artificial narrowing is removed).
- Hands and feet are the silhouette itself, clipped to those regions and filled as skin, so fingers and toes are natural and connected.
- The female head is drawn on the figure (face, ears, neck) with the hair pulled back into a high ponytail that sweeps out behind the crown from the front and hangs down the back with a hair tie.
- The previously hand-drawn mittens, blobs and cap shapes are removed.

## Capabilities

### Modified Capabilities
- `muscle-map`: connected, natural-looking body requirement.

## Impact

- `components/BodyMap.tsx`; new `lib/bodyOutline.ts` data; `lib/bodyExtremities.ts` now only supplies skin-region boxes.
