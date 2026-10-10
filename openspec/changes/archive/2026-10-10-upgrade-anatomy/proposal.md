# Proposal

## Why

User feedback: *"make the muscle better."* The hand-drawn body reads as a mannequin. The muscles are flat blocks with no anatomical contours, there's no traps or neck, and it's the same body for everyone. Hevy's map works because it looks like real anatomy.

## What Changes

- Replace the hand-drawn artwork with detailed anatomical vector artwork from the MIT-licensed `react-native-body-highlighter` assets, rendered by our own `BodyMap`. We use only its path data, so our heat ramp, highlight mode, selection and rotate behaviour stay.
- **Male and female bodies**, chosen from the profile's sex.
- **Volumetric shading**: each muscle gets a radial gradient (highlight top-left, shadow at the edges), so muscles read as rounded and three-dimensional, plus separation strokes between muscles.
- Taxonomy gains **traps** and **neck**. Lats render within the upper-back region, and hip flexors (a deep muscle) stay list-only, marked as deep.

## Capabilities

### Modified Capabilities
- `muscle-map`: the body map requirement now includes sex-specific bodies, traps/neck and shaded muscles.

## Impact

- New dependency `react-native-body-highlighter` (MIT, JS-only, depends on react-native-svg). `components/BodyMap.tsx` is rewritten; the call sites keep the same API.
