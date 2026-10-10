# Proposal

## Why

User feedback on iteration 4: *"this is still bad — what Hevy is good at is the muscle body: you see which muscles you train with which exercise."* That's the visual hook Stride lacks. Running is treated as a single number (km), and the app ignores the strength work that every credible marathon plan prescribes: strength training is the best-evidenced way to cut running injuries, and Stride gives runners nowhere to log it. Showing *which muscles* each run and each exercise works makes training tangible, and it surfaces the classic runner weak spots (glutes, hamstrings, core, calves) before they become injuries.

## What Changes

- **Muscle map**: an anatomical front/back body with ~16 muscle groups, a rotate (front↔back) transition and tap-to-inspect. Every muscle can be shaded by training load.
- **Body screen** (`/body`): the heatmap of muscles trained in the last 7 days from runs and strength sessions, a ranked muscle list, and a **runner balance insight** naming key runner muscles with no strength work this week, with suggested exercises.
- **What a run works**: each run type maps to muscle loads (intervals → hamstrings, glutes, calves; long run → calves, quads…). The run summary shows a mini muscle map.
- **Strength workouts, Hevy-style** (`/strength`): pick exercises from a runner-focused library (search plus a muscle filter), log sets × reps × kg, and finish. Each exercise has a detail screen with its primary and secondary muscles on the body map.
- **Home** gets a "Muscles this week" card. Strength sessions appear in the You feed and earn XP.

Out of scope: a true 3D rotatable model (needs a licensed 3D asset), custom exercises, rest timers, 1RM charts.

## Capabilities

### New Capabilities
- `muscle-map`: muscle taxonomy, load attribution from runs and exercises, the body visualisation and the balance insight.
- `strength-training`: the exercise library, strength session logging and exercise detail.

### Modified Capabilities
- None at spec level. XP gains a strength source, described in strength-training.

## Impact

- New dependency `react-native-svg` (Expo SDK module, included in Expo Go, works on web).
- Store: `strength: StrengthSession[]` with a migration default.
- New pure modules `lib/muscles.ts` and `lib/exercises.ts` with unit tests; new routes `/body`, `/strength`, `/exercise/[id]`; a new Maestro flow.
