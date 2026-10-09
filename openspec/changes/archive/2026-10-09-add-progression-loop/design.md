# Design

## Context

All progression is *derived*: there's no stored XP, so it can't drift from the underlying data, deleting a run reverses its rewards, and the module stays pure and testable.

## Decisions

- **`progressionOf(data, today)`** returns `{ xp, level, streak, challenge, badges }`. A run's celebration is `progressionOf(with run) − progressionOf(without run)`, and the same diff gives the tier-up via `rankRunner`.
- **Weekly not daily streaks**: daily streaks reward junk miles and injury. Three runs a week is the minimum effective dose for a marathon plan.
- **Challenge reward accounting**: the 150 XP is credited for every past week (Monday–Sunday) whose distance reached that week's challenge, plus the current week once complete. Past challenges are evaluated with that week's plan target.
- **Level curve** `50·L·(L−1)`: early levels come fast (L2 = 100 XP, roughly one 10 km run), then slow down. A 16-week plan of about 600 km reaches level 10–12.
- **Badge definitions** live in a table (`id`, emoji, title, hint, test function) so new badges are one line.

## Risks / Trade-offs

- [Gamification might feel childish to serious runners] → it's visually restrained (a small chip on Home; the badge grid lives on Profile).
- [Recomputing over all runs per render] → O(runs), trivial at personal scale; memoised per screen.

## Iteration review (after build)

- The first-run summary now stacks PR → XP/level → badges → rank → "Challenge a friend". That's one coherent payoff moment rather than separate notifications, which is the Hevy "workout complete" pattern plus a Zynga-style reward reveal.
- "🔥 0-week streak" on Profile read as a failure → it now says what starts one ("3 runs this week starts a streak").
- Badge hints show live progress ("90 km to go", "(0/3)"), so a locked badge is a goal rather than a dead end.
- Every reward is derived from training data, so deleting a run reverses its rewards (no XP inflation exploits).
