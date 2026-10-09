# Tasks

## 1. Foundation

- [x] 1.1 Configure Expo Router entry, app.json scheme, path alias, Jest; verify `npx tsc --noEmit` and `npm test` run
- [x] 1.2 Add theme tokens and shared UI primitives (Card, Button, Chip, Stat); verify typecheck

## 2. Domain logic

- [x] 2.1 Implement `lib/pace.ts` (parse/format duration, pace) with unit tests passing
- [x] 2.2 Implement `lib/rank.ts` (Riegel prediction, log-normal percentile, tiers, volume percentile) with unit tests for the spec scenarios
- [x] 2.3 Implement `lib/plan.ts` (plan generation, today's session, completion) with unit tests for the 16-week, clamp and cut-back scenarios
- [x] 2.4 Implement `lib/records.ts` (PRs and PR flagging) with unit tests

## 3. State & persistence

- [x] 3.1 Implement store context with AsyncStorage persistence and reset; verify a reload keeps data in the web build

## 4. Screens

- [x] 4.1 Onboarding screen with validation and redirect gate; verified by the Maestro onboarding flow
- [x] 4.2 Home: greeting, today's session, weekly stats, history feed and empty state
- [x] 4.3 Log modal with type chips, distance/duration/effort/notes, live pace and prefill from the plan
- [x] 4.4 Run detail with delete
- [x] 4.5 Plan tab with week list and completion
- [x] 4.6 Rank tab with Top X% hero, tier ladder, next-tier target and volume rank
- [x] 4.7 Profile tab with PRs, totals, edit basics and reset

## 5. End-to-end

- [x] 5.1 Maestro flows: onboarding, log-run, rank, plan-log-today; `npm run e2e` passes against the web export
