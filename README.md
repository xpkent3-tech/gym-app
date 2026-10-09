# Stride — marathon training, Hevy-style

Stride is a React Native (Expo) app for marathon training. It aims for Hevy's fast logging loop, plus an honest answer to *"how good am I?"*: **"You're in the top X% of marathoners."**

## Features

- **Fast run logging**: type, distance, time, effort and notes, with a live pace preview. Post-run summary with PR celebration.
- **Generated marathon plan**: 12–20 weeks with base/build/peak/taper phases, cut-back weeks and race week. "Today" tells you what to run, and logging it ticks it off.
- **Percentile rank**: your Riegel-predicted marathon compared against a log-normal model of finish times for your sex and age group, with tiers (Starter → Elite) and the time you need for the next tier. A weekly-volume percentile too.
- **Personal records** for 5K / 10K / half / marathon.
- **Friends & invites**: friend codes, invite links (`/invite/CODE`) that survive onboarding, a friends feed with kudos, and a friends leaderboard with a "km to pass" nudge.
- **Progression**: XP and levels, a weekly (rest-day-friendly) streak, a weekly challenge sized to your plan, a badge collection, and a post-run reward reveal (XP, level-up, badges, rank tier-up).

## Development

```bash
npm install
npm run web          # dev server
npm test             # Jest unit tests for the domain logic (src/lib)
npm run typecheck
```

## Specs (OpenSpec)

Product behaviour is spec-driven with [OpenSpec](https://github.com/Fission-AI/OpenSpec):

- `openspec/specs/` holds the current source of truth, one folder per capability.
- `openspec/changes/archive/` holds each product iteration's proposal, design (including the post-build review) and tasks.

```bash
npx openspec list --specs
npx openspec show runner-rank --type spec
```

## End-to-end tests (Maestro)

Flows in `.maestro/` run against the web export in headless Chromium:

```bash
bash scripts/setup-maestro.sh   # once: Maestro CLI + matching chromedriver
npm run e2e                     # export web build, serve it, run all flows
npm run e2e -- .maestro/03_rank.yaml
```

The same flows target a native build by swapping `url:` for `appId: app.stride.marathon`.

Notes for writing web flows: Maestro web scrolls the window only, prefers `aria-label` over `testID` when resolving ids, and re-finds focused inputs by XPath. So keep screens short, don't put `accessibilityLabel` on elements that have a `testID`, and give text inputs a `nativeID` (the `Field` component does this).
