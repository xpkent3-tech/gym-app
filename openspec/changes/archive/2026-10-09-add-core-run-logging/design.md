# Design

## Context

Greenfield Expo SDK 57 app. There's no backend, so "population" comparisons use published distributions (see Decisions). Maestro runs against the web export in Chromium because the CI container has no emulator.

## Goals / Non-Goals

**Goals:** pure, unit-tested domain logic (`src/lib`); a thin UI; stable `testID`s for Maestro; Hevy-like dark UI.

**Non-Goals:** GPS, sync, accounts, server-side leaderboards.

## Decisions

- **State: React context + reducer persisted to AsyncStorage** (one JSON blob, versioned key `stride:v1`). It's simpler than Redux or Zustand at this size; AsyncStorage works on web via localStorage, so Maestro web runs exercise the real persistence path.
- **Routing: Expo Router**, with `(tabs)` for Home/Plan/Log/Rank/Profile; `log` is a modal route that the centre tab button opens; `run/[id]` is the detail page; `onboarding` is gated by a redirect in the root layout.
- **Prediction: Riegel `T2 = T1 * (D2/D1)^1.06`** over every run ≥3 km and the optional race result; take the best (smallest) prediction. Riegel is widely understood and needs no tables.
- **Percentile model: log-normal distribution of marathon finish times**, with a median of 4:30 (men) or 4:56 (women) for ages 20–39, an age adjustment of +3% per decade outside that band, and σ = 0.20 in log space (so roughly the top 10% of men run under 3:30, matching large race-result samples). Top X% = CDF(ln t). Clamp to 1..99. Tiers: Elite ≤2, Sub-Elite ≤10, Advanced ≤25, Strong ≤50, Steady ≤75, Starter > 75.
- **Volume percentile:** log-normal with a median of 32 km/week and σ = 0.55.
- **Plan generator:** the number of weeks is clamped to 12–20; peak volume is max(base × 1.6, 45) km, capped at 100; linear build with ×0.75 cut-back every 4th week; taper at 75% and 50% of peak; race week ends with a 42.2 km "race" session. Weekly template: Tue intervals/tempo alternating, Thu easy, Sat easy, Sun long run (30% of volume, capped at 35 km), Wed/Fri recovery for weeks over 50 km; Mon rest.
- **Icons:** `@expo/vector-icons` Ionicons (bundled with Expo).

## Risks / Trade-offs

- [Simulated population ≠ real users] → copy says "vs. marathon finishers", and the model constants live in one file for tuning.
- [Web-only e2e misses native gestures] → keep UI to Pressable/TextInput primitives that behave identically.

## Iteration review (after first build)

Screenshots of every screen were reviewed before the change was archived:
- Race date from "16 weeks" landed on a Thursday and produced a 17-week plan → race day is now the Sunday of week N.
- The Plan tab as a 16–20 card list was long and slow to scan → replaced with a weekly volume bar chart (tap a bar to jump) plus a single-week view with Prev/Next, "This week" and "Race week".
- The "+" tab overlapped its label, the effort scale wrapped, and "Next up" text was lowercased → fixed.
- Maestro web constraints found: it scrolls `window` only (RN-web scrolls inner views), it resolves `aria-label` before `data-testid`, and it re-finds the focused input by class-based XPath. Mitigations: tall e2e viewport, no accessibilityLabel on elements with a testID, and `nativeID` on every text input.
