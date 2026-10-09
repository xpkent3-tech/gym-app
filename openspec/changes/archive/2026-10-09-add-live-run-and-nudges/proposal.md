# Proposal

## Why

Two gaps remain against the products we're modelling:
1. **Hevy is used *during* the workout.** Its live logger is why people open it every session. Stride only supports logging after the fact, so users still need another app to time their run, and then they forget to come back.
2. **The progression loop has no timely prompt.** Streaks and challenges only motivate if users know they're about to lose or finish one. Zynga's most effective (and honest, when used sparingly) lever is a single contextual "next best action" at the moment it matters.
3. Runners love seeing their training build. A weekly distance history makes the plan's progress visible (as Hevy's charts do for volume).

## What Changes

- **Live run timer**: "Start run" on Today and in the Log screen opens a full-screen stopwatch with Pause/Resume, Lap and Finish. Finish opens the Log form with the time and planned distance prefilled, and lap splits written into the notes. Discarding asks for confirmation.
- **Next best action card** on Home: one nudge at most, in priority order: streak at risk → challenge nearly done → level nearly reached.
- **Weekly distance chart** on Profile for the last 8 weeks.

Out of scope: GPS distance, background timers and notifications, audio cues.

## Capabilities

### New Capabilities
- `live-run`: timing a run live and handing the result to run logging.

### Modified Capabilities
- `progression`: adds the next-best-action nudge.
- `run-logging`: adds the weekly distance history.

## Impact

- New route `/live`, `lib/nudges.ts`, `lib/history.ts` (pure, unit-tested); Home, Log, Profile and Today card changes; a new Maestro flow.
