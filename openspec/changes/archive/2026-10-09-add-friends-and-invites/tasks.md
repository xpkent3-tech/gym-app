# Tasks

## 1. Community & store

- [x] 1.1 `lib/community.ts`: directory, codes, seeded activity, lookup by code/search, suggestions; unit tests for determinism, code lookup and suggestions
- [x] 1.2 `lib/leaderboard.ts`: friends board by week km / predicted time with "ahead of" count; unit tests for the spec scenarios
- [x] 1.3 Store: friends, kudos, pendingInvite, invitesSent, profile friendCode; migration defaults; pending invite applied on onboarding

## 2. Invites

- [x] 2.1 `lib/invite.ts`: build invite URL/message; share with clipboard fallback; toast host
- [x] 2.2 `/invite/[code]` route for both onboarded and new users; Maestro flows for both paths

## 3. Friends UI

- [x] 3.1 Friends tab: code card, invite, add by code with errors, search, suggestions, list; Maestro flow
- [x] 3.2 Friend profile with remove; Profile moved to `/profile` via Home avatar; update existing flows

## 4. Feed & leaderboard

- [x] 4.1 Home Friends/You segment with kudos; Maestro assertions
- [x] 4.2 Rank tab friends leaderboard with metric toggle and invite CTA; "Challenge a friend" on the PR summary

## 5. Verification

- [x] 5.1 Full unit + Maestro suite green; screenshot review recorded in design.md
