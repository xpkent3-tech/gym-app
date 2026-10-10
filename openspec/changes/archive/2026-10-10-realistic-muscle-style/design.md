# Design

## Decisions

- **Palette per style.** Realistic: rest `#5A1C22`, then `#8F2830` → `#C2353B` → `#EB5536` → `#FF8A3D` (max), with a pale `#FFD9B0` glow stroke at ≥ 0.8. Tendons and inscriptions `#E8D3BF`, skin `#D2AE96`, fascia `#2A0B0E`. Highlight mode: primary = max, secondary = moderate.
- **Striations**: six SVG `<Pattern>` definitions of thin lines (`patternUnits="userSpaceOnUse"`, 7-unit spacing in the 724-wide asset space) rotated 0/±25/±55/90°. Each muscle path is drawn twice: the shaded fill, then the fibre overlay (`pointerEvents="none"`). Angles are mirrored for left and right paths, so obliques, pecs and lats fan symmetrically.
- **Female realistic**: the chest uses the skin tone at rest (mixed towards the heat colour when trained), and the abs keep their segments with tendon-coloured strokes instead of being flattened. Classic keeps the earlier smooth female core.
- **Style plumbing**: `prefs.bodyStyle` in the store, exposed through `BodyStyleContext` from the root layout, so the ~10 BodyMap call sites don't change.

## Iteration review (after build)

- Matches the reference's anatomical language: crimson striated muscle (fibre angles per muscle, mirrored per side), pale tendinous inscriptions across the abs, pale knee/ankle tendons, a skin-covered female chest, and an athletic lean female frame. The character's face, hair and markings are deliberately not reproduced.
- Training intensity reads at a glance: resting muscle is muted maroon, and worked muscles brighten to hot orange with a pale glow outline at max. Hip Thrust shows glutes glowing and hamstrings/quads warm.
- Resting maroon was nearly lost on the dark background → lifted slightly (#62212A) while staying clearly distinct from "Light".
- Fibre overlays are skipped below 70 px width (feed thumbnails), where they'd only add noise and render cost.
