# Proposal

## Why

User feedback on the realistic body: *"make it a more athletic build, change the hair of the female, the foot and hand look weird as well, and where is the food calorie counter?"*

- The female artwork was rendered in the male artwork's viewBox (the library uses different boxes), so the female was cropped and off-centre. That is the root of the weird hair and feet.
- Hands and feet are drawn as separate finger shapes with outlines, which reads as strange at phone size.
- The female frame is slimmed uniformly, which reads slight, not athletic.
- The calorie counter exists (Food tab), but nothing on Home mentions it, so it's easy to miss.

## What Changes

- Female (and male) bodies use each artwork's correct viewBox and centre line. Front and back share one scale so the rotate animation doesn't jump.
- New female hair: an athletic high ponytail (tuft and fringe from the front, ponytail down the back), drawn on top of the body.
- Hands, feet, ankles and knees render as smooth, skin-toned shapes (fingers merged into a mitten-like hand, no bone-white blobs).
- Athletic female build: broader shoulders, lats and glutes with a narrower waist (V-taper) instead of uniform slimming.
- **Home calories card**: today's eaten / target ring, macro mini-bars and a "+ Log food" button (or "Set up targets" before body size is known).

## Capabilities

### Modified Capabilities
- `muscle-map`: body rendering requirements (centred, consistent scale, smooth extremities).
- `food-journal`: Home surfaces today's calories and a log shortcut.

## Impact

- `components/BodyMap.tsx`, a new `components/CaloriesCard.tsx`, Home screen.
