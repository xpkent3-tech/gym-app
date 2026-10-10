# Design

## Decisions

- **Use the asset path data, not the component.** `react-native-body-highlighter`'s `Body` component can't do selection outlines, gradients or our heat ramp. Its `dist/assets/body{,Female}{Front,Back}` arrays (slug → common/left/right paths, viewBox `0 0 724 1448`, back offset by 724) are rendered by our `BodyMap`.
- **Mapping**: our MuscleId → slug (shoulders→deltoids, forearms→forearm, traps→trapezius, upperBack/lats→upper-back, lowerBack→lower-back, glutes→gluteal, quads→quadriceps, hamstrings→hamstring). When several muscles share a slug, the slug shows the maximum intensity. Head, hair, hands, feet, knees and ankles render as skin.
- **Shading**: one radial gradient per fill colour (objectBoundingBox units, focal point at 35%/25%), so every muscle path gets its own highlight and shadow without per-path definitions. Separation strokes use the background colour.
- **Sex**: `BodyMap` takes `sex`. Call sites read it from the profile through a `useBodySex()` hook.

## Risks / Trade-offs

- [Third-party artwork] → MIT licence. Attribution is recorded in README; pinned at 3.2.0.

## Iteration review (after build)

- The asset artwork plus per-muscle radial shading reads as real anatomy (individual quad heads, hamstring bellies, a segmented core). That's a big step up from the hand-drawn mannequin.
- **Bug:** after Rotate, the back view rendered as outlines. On web, `url(#id)` resolves document-wide and the (hidden) Home screen's BodyPair owned the same gradient ids → ids are now unique per instance (`useId`).
- **User feedback, "make the female body more lean and more female like":** the female artwork has a bodybuilder frame. It's now narrowed about the centre line per region (shoulders/arms ×0.82, core ×0.86, legs ×0.88–0.92), with thinner outlines and a smooth (flat-filled, no carved eight-pack) chest and core.
