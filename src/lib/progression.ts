import { addDays, startOfWeek } from './dates';
import type { PlanWeek } from './plan';
import { rankRunner, TIERS } from './rank';
import { prsSetBy } from './records';
import type { StrengthSession } from './muscles';
import type { Profile, Run } from './types';

export const XP = { perKm: 10, session: 50, pr: 100, challenge: 150, friend: 25, invite: 50, strength: 75 };
export const STREAK_MIN_RUNS = 3;

export interface ProgressInput {
  profile: Profile;
  runs: Run[];
  plan: PlanWeek[];
  friends: string[];
  invitesSent: number;
  strength?: StrengthSession[];
}

/** XP needed to reach `level` (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export function levelFor(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return { level, into: xp - xpForLevel(level), needed: xpForLevel(level + 1) - xpForLevel(level) };
}

function kmBetween(runs: Run[], from: string, toExclusive: string): number {
  return runs.filter((r) => r.date >= from && r.date < toExclusive).reduce((s, r) => s + r.distanceKm, 0);
}

export function challengeTarget(weekStart: string, plan: PlanWeek[], profile: Profile): number {
  const week = plan.find((w) => w.start === weekStart);
  return Math.max(10, Math.round(week ? week.targetKm : profile.weeklyKm));
}

export interface Challenge {
  targetKm: number;
  doneKm: number;
  remainingKm: number;
  complete: boolean;
}

export function weeklyChallenge(input: ProgressInput, today: string): Challenge {
  const start = startOfWeek(today);
  const targetKm = challengeTarget(start, input.plan, input.profile);
  const doneKm = kmBetween(input.runs, start, addDays(start, 7));
  return { targetKm, doneKm, remainingKm: Math.max(0, targetKm - doneKm), complete: doneKm >= targetKm };
}

/** Number of completed weekly challenges from the first run's week through the current week. */
export function challengesCompleted(input: ProgressInput, today: string): number {
  if (!input.runs.length) return 0;
  const first = input.runs.reduce((m, r) => (r.date < m ? r.date : m), input.runs[0].date);
  let count = 0;
  for (let w = startOfWeek(first); w <= startOfWeek(today); w = addDays(w, 7)) {
    if (kmBetween(input.runs, w, addDays(w, 7)) >= challengeTarget(w, input.plan, input.profile)) count++;
  }
  return count;
}

export function weeklyStreak(runs: Run[], today: string): number {
  const runsIn = (w: string) => runs.filter((r) => r.date >= w && r.date < addDays(w, 7)).length;
  let w = startOfWeek(today);
  if (runsIn(w) < STREAK_MIN_RUNS) w = addDays(w, -7);
  let streak = 0;
  while (runsIn(w) >= STREAK_MIN_RUNS) {
    streak++;
    w = addDays(w, -7);
  }
  return streak;
}

export function sessionsCompleted(plan: PlanWeek[], runs: Run[]): number {
  const dates = new Set(runs.map((r) => r.date));
  return plan.reduce((s, w) => s + w.sessions.filter((x) => dates.has(x.date)).length, 0);
}

export function totalXp(input: ProgressInput, today: string): number {
  const km = input.runs.reduce((s, r) => s + r.distanceKm, 0);
  const prs = input.runs.reduce((s, r) => s + prsSetBy(r, input.runs).length, 0);
  return Math.round(
    km * XP.perKm +
      sessionsCompleted(input.plan, input.runs) * XP.session +
      prs * XP.pr +
      challengesCompleted(input, today) * XP.challenge +
      input.friends.length * XP.friend +
      input.invitesSent * XP.invite +
      (input.strength?.length ?? 0) * XP.strength,
  );
}

export interface Badge {
  id: string;
  emoji: string;
  title: string;
  hint: string;
  unlocked: boolean;
}

interface BadgeContext {
  maxRunKm: number;
  totalKm: number;
  streak: number;
  topPct: number | null;
  friends: number;
  invites: number;
  runs: number;
}

const tierMax = (name: string) => TIERS.find((t) => t.name === name)!.maxTop;
const kmLeft = (target: number, have: number) => `${Math.ceil(target - have)} km to go`;

const BADGES: { id: string; emoji: string; title: string; hint: (c: BadgeContext) => string; test: (c: BadgeContext) => boolean }[] = [
  { id: 'first-run', emoji: '👟', title: 'First Steps', hint: () => 'Log your first run', test: (c) => c.runs > 0 },
  { id: 'ten-k', emoji: '🔟', title: 'Double Digits', hint: () => 'Run 10 km in one go', test: (c) => c.maxRunKm >= 9.95 },
  { id: 'half', emoji: '🥈', title: 'Halfway There', hint: () => 'Run a half marathon distance', test: (c) => c.maxRunKm >= 21.05 },
  { id: 'marathon', emoji: '🏅', title: 'Marathoner', hint: () => 'Run the full 42.2 km', test: (c) => c.maxRunKm >= 42.15 },
  { id: 'century', emoji: '💯', title: 'Century', hint: (c) => kmLeft(100, c.totalKm), test: (c) => c.totalKm >= 100 },
  { id: 'five-hundred', emoji: '🚀', title: '500 Club', hint: (c) => kmLeft(500, c.totalKm), test: (c) => c.totalKm >= 500 },
  { id: 'streak-4', emoji: '🔥', title: 'On Fire', hint: (c) => `4-week streak (${c.streak}/4)`, test: (c) => c.streak >= 4 },
  { id: 'streak-12', emoji: '☄️', title: 'Unstoppable', hint: (c) => `12-week streak (${c.streak}/12)`, test: (c) => c.streak >= 12 },
  { id: 'advanced', emoji: '📈', title: 'Advanced', hint: () => 'Reach the top 25%', test: (c) => c.topPct !== null && c.topPct <= tierMax('Advanced') },
  { id: 'sub-elite', emoji: '💎', title: 'Sub-Elite', hint: () => 'Reach the top 10%', test: (c) => c.topPct !== null && c.topPct <= tierMax('Sub-Elite') },
  { id: 'squad', emoji: '👯', title: 'Squad', hint: (c) => `Add 3 friends (${c.friends}/3)`, test: (c) => c.friends >= 3 },
  { id: 'recruiter', emoji: '📣', title: 'Recruiter', hint: () => 'Invite a friend', test: (c) => c.invites > 0 },
];

export function badgesFor(input: ProgressInput, today: string): Badge[] {
  const c: BadgeContext = {
    maxRunKm: Math.max(0, ...input.runs.map((r) => r.distanceKm)),
    totalKm: input.runs.reduce((s, r) => s + r.distanceKm, 0),
    streak: weeklyStreak(input.runs, today),
    topPct: rankRunner(input.profile, input.runs)?.topPct ?? null,
    friends: input.friends.length,
    invites: input.invitesSent,
    runs: input.runs.length,
  };
  return BADGES.map((b) => ({ id: b.id, emoji: b.emoji, title: b.title, hint: b.hint(c), unlocked: b.test(c) }));
}

export interface Progress {
  xp: number;
  level: ReturnType<typeof levelFor>;
  streak: number;
  challenge: Challenge;
  badges: Badge[];
}

export function progressOf(input: ProgressInput, today: string): Progress {
  const xp = totalXp(input, today);
  return { xp, level: levelFor(xp), streak: weeklyStreak(input.runs, today), challenge: weeklyChallenge(input, today), badges: badgesFor(input, today) };
}

export interface Celebration {
  xpGained: number;
  levelUp: number | null;
  newBadges: Badge[];
  tierUp: string | null;
}

/** What a single run changed: compares progress with and without it. */
export function celebrationFor(input: ProgressInput, runId: string, today: string): Celebration {
  const without = { ...input, runs: input.runs.filter((r) => r.id !== runId) };
  const before = progressOf(without, today);
  const after = progressOf(input, today);
  const tierBefore = rankRunner(input.profile, without.runs)?.tier.name ?? null;
  const tierAfter = rankRunner(input.profile, input.runs)?.tier.name ?? null;
  const tierIdx = (n: string | null) => (n ? TIERS.findIndex((t) => t.name === n) : TIERS.length);
  return {
    xpGained: after.xp - before.xp,
    levelUp: after.level.level > before.level.level ? after.level.level : null,
    newBadges: after.badges.filter((b) => b.unlocked && !before.badges.find((x) => x.id === b.id)?.unlocked),
    tierUp: tierAfter && tierIdx(tierAfter) < tierIdx(tierBefore) && tierBefore !== null ? tierAfter : null,
  };
}
