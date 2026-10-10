# Design

## Decisions

- **2D anatomical map, not a 3D mesh.** Hevy itself uses a front/back 2D map, and a convincing 3D model needs a licensed rigged asset plus expo-gl/three (a large native-dependency and bundle cost). The map is hand-drawn SVG (200×420 viewBox per side): each muscle is a path drawn once for the left side and mirrored with `x → 200 − x`. Depth comes from a radial-gradient silhouette, and the rotation is an Animated scaleX flip (1 → 0 → 1, swapping the view at the midpoint) on the native driver where available.
- **Tappable list alongside the map.** SVG elements are tappable, but a list is accessible, readable for small muscles, and testable (Maestro's web driver skips `svg`/`path` nodes).
- **Load model** (`lib/muscles.ts`): run load = `km × 0.5 × weight[type][muscle]`; strength load = completed sets × (1 primary, 0.5 secondary). With these constants a 10 km easy run ≈ 3 calf units ≈ 3 sets of calf raises, so the two sources share a scale. Weights encode common running-biomechanics consensus (intervals and hills recruit hamstrings and glutes more; long runs are calf- and quad-dominant).
- **Shading**: intensity = load / max load over the window, mapped through 4 steps (none → light blue → blue → orange-hot), so small loads are still visible.
- **Strength sessions** are stored in `strength: StrengthSession[]` (`{ id, date, createdAt, exercises: [{ exerciseId, sets: [{ reps, kg }] }] }`). The in-progress session lives in screen state; finishing persists it.
- **Balance insight** counts strength-only load per key runner muscle (core = abs + obliques); fewer than 1 set's worth counts as "no strength work".

## Risks / Trade-offs

- [Hand-drawn anatomy can look crude] → the screenshot review iterates on the shapes. Shading uses Hevy-like restraint (muted base, one accent ramp).
- [Load weights are approximations] → they're centralised in one table, and the copy says "estimated".

## Iteration review (after build)

- The first render read well as an anatomy map, but the "3D" sheen was too dark on the right (half the head went black) → toned it down to a gentle top-left light. Front traps were added so the neckline no longer looks mannequin-like.
- **Bug:** the strength set table overflowed horizontally on web, because flex `TextInput`s keep the browser's intrinsic input width → cells get `width: 0, minWidth: 0`. It now matches Hevy's SET | KG | REPS | ✓ grid.
- Finishing a strength workout lands on the Body screen, so the payoff is instant: the glutes light up and the balance insight shrinks ("No strength work this week: Core, Calves, Hip Flexors").
- `npx expo lint` was set up and is clean. It caught impure `Date.now()` in render and a ref read during render in the rotate animation.
- The Maestro XP assertion depended on whether "today" has a plan session → it now accepts either value.
