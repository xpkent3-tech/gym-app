# Proposal

## Why

The rank says *where* you are, but marathon fitness moves slowly, so a percentile can sit still for weeks. Runners need small, frequent wins between the big ones. Zynga-style progression loops (XP, levels, collections, timed goals) provide them, and Hevy shows how lightly they can be applied in fitness. Every mechanic here has to reward the training the plan asks for. Nothing should push overtraining or punish rest days.

## What Changes

- **XP and levels** earned from training: distance, completed plan sessions, PRs, weekly challenges, and social actions (adding friends, inviting).
- **Weekly streak**: consecutive weeks with at least 3 runs. It's deliberately weekly, so rest days never break it.
- **Weekly challenge**: "Run N km this week", sized from your plan's target for the week and capped at it, with a progress bar and an XP reward.
- **Badges**: a collectible set (first run, distance clubs, volume milestones, streaks, rank tiers, social), shown as a grid on Profile with locked hints.
- **Post-run celebration**: the summary shows XP earned, level-ups, badges unlocked, and rank tier-ups caused by that run.
- **Home**: a level and streak header chip, plus the weekly challenge card.

Out of scope: currencies, purchases, loot boxes, push reminders, leaderboard seasons.

## Capabilities

### New Capabilities
- `progression`: XP, levels, weekly streak, weekly challenge, badges and run-triggered celebrations.

### Modified Capabilities
- None. The run summary gains content, but the run-logging requirements are unchanged.

## Impact

- New pure module `src/lib/progression.ts`, derived entirely from stored runs, friends and invites (no new persisted state), with unit tests.
- Home, Profile and run summary UI; a new Maestro flow.
