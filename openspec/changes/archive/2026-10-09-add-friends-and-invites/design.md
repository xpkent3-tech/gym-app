# Design

## Context

There's no backend (see proposal Impact), so the "community" has to be simulated in a way that is deterministic (stable across reloads and in tests) and believable.

## Goals / Non-Goals

**Goals:** a deterministic community module; invite deep links that work on web and native; a store migration that keeps existing data.

**Non-Goals:** a networked social graph; anti-abuse.

## Decisions

- **Community directory**: a static list of ~24 runners (name, handle, sex, age, city, marathon ability, weekly km). Codes are derived as `STR-` + base36 hash of the handle. The user's own code comes from a hash of name + createdAt, generated at onboarding and stored on the profile (`friendCode`). Older profiles get one lazily on hydrate.
- **Simulated activity**: `runnerActivity(runner, today, days)` uses a seeded PRNG (mulberry32 on `hash(runnerId + date)`) to decide whether the runner ran that day (probability from weekly km / typical run length), the run type (long on weekends), the distance, and the pace (derived from their marathon pace with per-type factors and ±4% noise). It is pure and unit-tested for determinism.
- **Invite URL**: `Linking.createURL('/invite/CODE')`, which yields `stride://invite/CODE` on native and the current origin on web. Share text: "I'm training for a marathon on Stride — top X% so far. Add me: <link>". Share uses RN `Share.share` on native and `navigator.share` when available on web, otherwise `expo-clipboard`.
- **Routing**: `/invite/[code]` sits outside both `Stack.Protected` guards so it's reachable in either state. "Join" stores `pendingInvite` and routes to onboarding; `setProfile` consumes it. Profile moves to `/profile` (a stack screen opened from the Home avatar); the Friends tab takes its slot.
- **Kudos counts**: a baseline count is seeded per activity (0–6) plus 1 when the user has given kudos.
- **Toasts**: a tiny in-app toast host (no dependency) for "Invite link copied" and "Added Maya".

## Risks / Trade-offs

- [Simulated friends might feel fake] → the copy says "suggested runners", and the directory is clearly local until accounts ship. The module boundary (`community.ts`) is where an API client would plug in.
- [Clipboard permission on web] → in a non-secure context, fall back to showing the link in the toast.

## Iteration review (after build)

- Simulated friends ran ~40% more than their stated weekly volume (the long run was counted on top of the regular runs) → the generator now splits volume into ~30% long run plus shorter runs. A unit test keeps every runner's 8-week average within ±25% of their profile.
- "You're ahead of 0 of 3 friends" read as a failure → it now says "Chasing N friends" with a near-win nudge ("🎯 12.3 km to pass Emma this week"), the strongest motivational lever on a leaderboard.
- Avatar initials picked up "(you)" punctuation → initials ignore non-letters, and "(you)" is shown only in the row label.
- Maestro: after tapping a button, focus leaves the input, so flows re-tap the field before `eraseText`.
