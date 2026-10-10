## Decisions
- One-rep max uses Epley: kg × (1 + reps/30); reps=1 returns kg. Reps over 12 are ignored for 1RM (unreliable).
- Warm-up sets count for neither volume, PRs nor muscle load; drop and failure sets count.
- A PR is set when a session beats every earlier session's value; the first ever session for an exercise has no PRs.
- Custom exercises live in the store and are mirrored to a module registry so `exerciseById` works everywhere.
- Rest timer is a countdown bar started when a set is ticked done; vibrates at zero.
- Extra XP: 50 per exercise with a PR per session.
