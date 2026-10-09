# Design

## Decisions

- **Timer from timestamps, not ticks**: the state is `{ startedAt, pausedAt, pausedTotal, laps[] }`, and elapsed time is `now − startedAt − pausedTotal`. Interval ticks only trigger re-renders, so throttled background tabs and JS stalls can't drift the clock. The logic sits in `lib/stopwatch.ts` (pure reducer, unit-tested).
- **Handoff via route params** (`/log?duration=…&notes=…&type=…&distance=…`), reusing the Log form's existing prefill so validation and the post-run reward screen stay in one place.
- **Nudges** live in `lib/nudges.ts`, a pure function over the `ProgressInput` already used for progression. One nudge at most, so it never becomes noise.
- **History** is `weeklyTotals(runs, today, 8)` in `lib/history.ts`, rendered with plain Views like the Plan chart (no chart dependency).

## Risks / Trade-offs

- [The app being killed mid-run loses the timer] → acceptable for v1; persisting the stopwatch state is a follow-up.

## Iteration review (after build)

- Home now leads with one urgent, honest nudge ("Run 2 more times by Sunday to keep your 2-week streak"), followed by Today and the challenge. Users see the next action before anything else.
- The live timer is deliberately minimal: a huge tabular clock, two equal buttons and a single primary Finish. Discard is visually separated and needs confirmation, like Hevy's finish/discard pattern.
- Profile grew past one screen (badges plus chart). Badges now show unlocked ones first and collapse to 6 behind "Show all 12 badges", and the weekly chart moved up next to the level card, ahead of the friend code.
