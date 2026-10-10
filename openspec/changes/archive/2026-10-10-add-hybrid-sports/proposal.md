# Proposal

## Why

User feedback: *"this is for hybrid athletes (HYROX, CrossFit, running, football, etc.) and have separate workouts for each athlete."* The fastest-growing training population isn't pure marathoners. It's hybrid athletes who run, lift, race HYROX, do CrossFit and play football in the same week. Today Stride only understands runs and gym sets, so a HYROX sim or a football match can't be logged, doesn't count towards streaks, and never shows on the muscle map. Each discipline also has its own workouts, results and ranking language (finish time, rounds, session load).

## What Changes

- **Sports profile**: onboarding and Profile let athletes choose one or more of Running, Strength, HYROX, CrossFit and Football. Running-specific setup (race date, recent race) only appears when Running is chosen.
- **A workout library per sport**, each workout with its format, description and muscle profile:
  - HYROX: race / full simulation (total time plus optional splits for the 8 stations), compromised running, station practice, engine intervals.
  - CrossFit: benchmark WODs (Fran, Grace, Helen, Cindy, Murph) and custom For Time / AMRAP / EMOM.
  - Football: match, team training, speed and agility, conditioning.
- **A separate log form per format**: time result, AMRAP rounds + reps, or duration only. All forms take duration and RPE; HYROX race adds station splits and Football adds minutes played and goals.
- **Log hub**: the + tab first asks *what did you train?* with the athlete's sports first.
- **Every session counts**: sport sessions appear in the feed, earn XP, add muscle load to the body map, and count towards the weekly streak (now 3 *sessions* a week, any sport).
- **Ranks per sport**: HYROX (best race time vs the Open division by sex and age), CrossFit (per benchmark), Football (weekly session load vs amateur players), alongside Running. A **Hybrid rank** averages the athlete's sport percentiles.
- **Plan tab**: the marathon plan for runners, plus suggested workouts this week for each other sport.

Out of scope: team or club features, wearable import, custom movement builders.

## Capabilities

### New Capabilities
- `hybrid-sports`: the sports profile, per-sport workout libraries, per-format logging, sport sessions in the feed and muscle map, and the Plan-tab suggestions.

### Modified Capabilities
- `runner-profile`: onboarding asks which sports the athlete does.
- `runner-rank`: adds sport ranks and the hybrid rank.
- `progression`: the weekly streak counts sessions of any sport.

## Impact

- Store: `profile.sports`, `sessions: SportSession[]` (migration: existing users get Running + Strength).
- New `lib/sports.ts` and `lib/sportRank.ts` with unit tests; routes `/sport/[id]` (library) and `/sport/log`; a new Maestro flow.
