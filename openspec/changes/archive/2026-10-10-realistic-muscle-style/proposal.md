# Proposal

## Why

User feedback with a reference image (an exposed-muscle "titan" illustration): *"the female should look like the Attack on Titan female titan but more realistic, and it should reflect in the muscle worked."* The current map is a shaded diagram in UI colours (grey → blue → amber), so it reads as an infographic, not a body. Athletes respond to seeing *muscle*. An écorché (exposed-muscle) rendering with crimson fibres, pale tendons and trained muscles that visibly "light up" is far more motivating, and it suits a hybrid-athlete brand.

We take the anatomical style only: red striated muscle, pale tendinous inscriptions and a skin-covered chest. We don't reproduce the copyrighted character (face, hair, markings).

## What Changes

- **Realistic body style (new default):** muscles render as crimson muscle with fibre striations oriented per muscle (vertical quads and hamstrings, fanned pecs, diagonal obliques and lats), dark fascia separations, pale tendinous lines across the abs, and skin-toned head, hands, knees and feet.
- **Worked muscles light up in flesh tones:** rest is dull maroon, then light, moderate and high training brighten through red to hot orange, with a pale glow outline at max. Exercise highlight mode uses the same language (primary = hot, secondary = warm red).
- **Female build:** athletic and lean, with a skin-covered chest that warms when chest is trained, and a visible core with pale tendon chevrons (no longer flattened).
- **Settings → Body style:** Realistic or Classic (the previous diagram style). The legend follows the chosen style.

## Capabilities

### Modified Capabilities
- `muscle-map`: the body map requirement gains a realistic style option and the rule that intensity is shown in that style.

## Impact

- `components/BodyMap.tsx` (style-aware palettes, fibre patterns), a small body-style context, Settings and store prefs, and a Maestro step for the setting.
