# Proposal

## Why

Marathon runners juggle a training plan, a watch app and a spreadsheet, and none of them answer the two questions that keep people training: *"What do I run today?"* and *"How good am I, really?"*. Hevy proved that a fast logging loop plus visible progress builds a habit for lifters; Stride brings that loop to marathon training and adds an honest answer to "how good am I" as a percentile rank against other runners.

## What Changes

- Onboarding that captures name, sex, age bracket, experience level, current weekly mileage, a recent race result (optional) and goal race date.
- Hevy-style run logging: pick a run type (easy, long, tempo, intervals, recovery, race), enter distance and duration, effort (RPE) and notes; pace is derived live. Saved runs appear in a reverse-chronological history feed with a detail screen.
- A generated marathon training plan (12–20 weeks, depending on the race date) with weekly mileage that builds, cuts back and tapers; "Today" highlights the planned session and logging it checks it off.
- A percentile rank: "You're in the top X% of marathoners" for your sex and age group, based on your VDOT-predicted marathon time, plus a weekly-volume percentile.
- Personal records for the 5K, 10K, half and full marathon derived from logged runs.
- A bottom tab navigation with five tabs: Home, Plan, Log (a central +), Rank and Profile.

## Capabilities

### New Capabilities
- `run-logging`: recording runs, deriving pace, history feed, run detail, deleting runs, personal records.
- `training-plan`: generating a periodised marathon plan from the profile and tracking session completion.
- `runner-rank`: percentile ranking of predicted marathon performance and weekly volume against a reference population.
- `runner-profile`: onboarding and the editable runner profile that the other capabilities depend on.

### Modified Capabilities
- None (greenfield).

## Impact

- New Expo Router app under `src/app`, domain logic under `src/lib` (pure, unit-tested with Jest).
- Dependencies: expo-router, AsyncStorage, react-native-web (for the Maestro web target).
- Out of scope: GPS tracking, watch/Strava sync, accounts/backend, friends (a later change), paid features.
