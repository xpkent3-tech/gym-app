# Proposal

## Why

Marathon training is lonely and long (16+ weeks), and most plans are abandoned around week 5–6. Social accountability is the strongest retention lever in fitness apps: Hevy's following feed and Strava's kudos keep people logging. A percentile rank also becomes more motivating when it's relative to people you know. Every invite is a free acquisition channel (Zynga's core growth loop), so inviting has to be one tap from anywhere a user feels proud: after a PR, on the rank screen, and on an empty friends list.

## What Changes

- New **Friends** tab, replacing Profile in the tab bar (Profile moves to an avatar button on Home): your friend code, an Invite button, add-by-code, search, suggested runners, and your friends list.
- **Invite links** `stride://invite/<CODE>` / `https://…/invite/<CODE>`, shared via the system share sheet with a clipboard fallback. Opening a link shows who invited you; accepting adds them as a friend. If you haven't onboarded yet, the invite is remembered and applied when onboarding finishes.
- **Friend profile** screen: their rank, weekly volume, recent runs, and remove friend.
- **Home feed** gets a Friends / You segment: friends' runs, newest first, with kudos.
- **Friends leaderboard** on the Rank tab: you vs friends by weekly km or predicted marathon, with "ahead of N of M friends".
- Until a backend exists, the runner community (directory, friends' runs) is simulated deterministically on-device.

Out of scope: real accounts, push notifications, comments, privacy settings, contact-book import.

## Capabilities

### New Capabilities
- `friends`: friend codes, adding friends (code, search, suggestions), removing friends, and friend profiles.
- `invites`: creating and sharing invite links and accepting them, including before onboarding.
- `social-feed`: the friends activity feed and kudos.

### Modified Capabilities
- `runner-rank`: adds a friends leaderboard alongside the population percentile.

## Impact

- Store schema gains `friends`, `kudos`, `pendingInvite` and `invitesSent` (backwards-compatible defaults for existing installs).
- New `src/lib/community.ts` (seeded directory and activity generator) with unit tests.
- New routes `/friends` (tab), `/friend/[id]`, `/invite/[code]`, `/profile`.
- New Maestro flows for friends, invites and the leaderboard.
