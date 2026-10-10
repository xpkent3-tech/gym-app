# Design

## Decisions

- **One generic `SportSession`** `{ id, date, createdAt, sport, workoutId, durationMin, rpe, resultSec?, rounds?, reps?, splits?, minutesPlayed?, goals?, notes }` rather than a type per sport. The workout's `format` decides which fields the form shows and how the result is rendered. Runs and strength keep their richer existing models.
- **Muscle load** = Σ(workout muscle weight) × durationMin/10 × rpe/10. A 60-minute RPE-8 session gives ~4.8 units on a 1.0-weight muscle, on the same scale as ~3 strength sets or a 10 km run's calves.
- **Rank models** (log-normal, as for running): HYROX Open median 1:30 (men) / 1:40 (women), σ 0.14, with the running age factor. CrossFit benchmark medians (men/women) for an affiliate population: Fran 5:30/6:30 (σ 0.35), Grace 4:30/4:30 (σ 0.4), Helen 11:00/12:30 (σ 0.2), Murph 50:00/55:00 (σ 0.25), and Cindy as a normal distribution of rounds (17/15, sd 4). Football weekly session load median 1,400 AU, σ 0.5 (higher is "more"). The constants live in one table.
- **Streak**: `weeklyStreak` takes all activity dates.
- **Routing**: `/log` is the hub (chips for each sport; Running keeps the existing form inline, Strength opens `/strength`, other sports open `/sport/[sport]`), and the library leads to `/sport/log?workout=id`.
- **Migration**: profiles without `sports` get `['running','strength']`, the app's previous scope.

## Risks / Trade-offs

- [Population constants are approximations] → labelled as estimates; centralised.

## Iteration review (after build)

- Each sport has its own library with muscle diagrams per workout, its own form (HYROX race shows 8 station splits; football shows minutes played and goals; AMRAP shows rounds + reps) and its own rank. The Rank tab leads with the hybrid rank.
- The onboarding headline was still marathon-only → "Train for anything", and running questions are hidden for non-runners. Home shows 7-day load (AU) instead of "0 km" for non-runners, with 💪 instead of 👟 for hybrid athletes.
- **UX bug found by Maestro:** after saving, "Done" popped back to the sport library (stack: hub → library → form → summary) → fresh saves now `dismissTo('/')`.
- Profile outgrew one screen again → Reset moved to a new Settings screen (also the home for upcoming integrations), and the long HYROX form is saved from the header.
