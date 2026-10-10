import { generatePlan } from '../plan';
import { celebrationFor, levelFor, progressOf, totalXp, weeklyChallenge, weeklyStreak, xpForLevel, type ProgressInput } from '../progression';
import type { Profile } from '../types';
import { run } from './helpers';

const profile: Profile = {
  name: 'K',
  sex: 'male',
  age: 32,
  experience: 'intermediate',
  weeklyKm: 30,
  raceDate: '2027-01-24',
  planStart: '2026-10-05',
  createdAt: 1,
};
const plan = generatePlan(profile);
const base: ProgressInput = { profile, runs: [], plan, friends: [], invitesSent: 0 };
const today = '2026-10-09'; // Friday of plan week 1 (sessions Tue, Thu, Sat, Sun)

describe('progression', () => {
  it('level curve', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(4)).toBe(600);
    expect(levelFor(300)).toEqual({ level: 3, into: 0, needed: 300 });
    expect(levelFor(99).level).toBe(1);
  });

  it('first 10 km run on a non-plan day earns 300 XP', () => {
    const r = run({ date: today, distanceKm: 10, durationSec: 3000 });
    expect(totalXp({ ...base, runs: [r] }, today)).toBe(300);
  });

  it('plan sessions, friends and invites add XP', () => {
    const r = run({ date: '2026-10-06', distanceKm: 5, durationSec: 1800 }); // Tuesday session
    expect(totalXp({ ...base, runs: [r], friends: ['a', 'b'], invitesSent: 1 }, today)).toBe(50 + 50 + 100 + 50 + 50);
  });

  it('weekly streak ignores an in-progress current week', () => {
    const runs = [
      ...['2026-09-21', '2026-09-23', '2026-09-25'].map((d) => run({ date: d, distanceKm: 5, durationSec: 1800 })),
      ...['2026-09-28', '2026-09-30', '2026-10-02'].map((d) => run({ date: d, distanceKm: 5, durationSec: 1800 })),
      run({ date: '2026-10-06', distanceKm: 5, durationSec: 1800 }),
    ];
    expect(weeklyStreak(runs, today)).toBe(2);
    expect(
      weeklyStreak(
        [...runs, run({ date: '2026-10-07', distanceKm: 5, durationSec: 1800 }), run({ date: '2026-10-08', distanceKm: 5, durationSec: 1800 })],
        today,
      ),
    ).toBe(3);
    expect(weeklyStreak([], today)).toBe(0);
  });

  it('weekly challenge follows the plan target', () => {
    const c = weeklyChallenge({ ...base, runs: [run({ date: today, distanceKm: 12, durationSec: 3600 })] }, today);
    expect(c.targetKm).toBe(plan[0].targetKm);
    expect(c.doneKm).toBe(12);
    expect(c.remainingKm).toBe(plan[0].targetKm - 12);
    expect(c.complete).toBe(false);
  });

  it('completing the challenge awards 150 XP', () => {
    const big = run({ date: today, distanceKm: plan[0].targetKm, durationSec: plan[0].targetKm * 330 });
    const xp = totalXp({ ...base, runs: [big] }, today);
    // 5K, 10K and half PRs (3 × 100) + the challenge
    expect(xp).toBe(Math.round(plan[0].targetKm * 10) + 300 + 150);
  });

  it('badges unlock with hints', () => {
    const p = progressOf({ ...base, runs: [run({ date: today, distanceKm: 10, durationSec: 3000 })] }, today);
    const byId = Object.fromEntries(p.badges.map((b) => [b.id, b]));
    expect(byId['first-run'].unlocked).toBe(true);
    expect(byId['ten-k'].unlocked).toBe(true);
    expect(byId['century'].unlocked).toBe(false);
    expect(byId['century'].hint).toBe('90 km to go');
    expect(byId['advanced'].unlocked).toBe(true); // 50:00 10K → top 21%
  });

  it('celebrates what a single run changed', () => {
    const r = run({ date: today, distanceKm: 10, durationSec: 3000 });
    const c = celebrationFor({ ...base, runs: [r] }, r.id, today);
    expect(c.xpGained).toBe(300);
    expect(c.levelUp).toBe(3);
    expect(c.newBadges.map((b) => b.id)).toEqual(expect.arrayContaining(['first-run', 'ten-k', 'advanced']));
    expect(c.tierUp).toBeNull(); // first ranking isn't a tier-up

    const faster = run({ date: today, distanceKm: 10, durationSec: 2600 });
    const c2 = celebrationFor({ ...base, runs: [r, faster] }, faster.id, today);
    expect(c2.tierUp).toBe('Sub-Elite');
  });
});

describe('strength XP', () => {
  it('awards 75 XP per session', () => {
    const s = { id: 's', date: today, createdAt: 1, exercises: [{ exerciseId: 'plank', sets: [{ reps: 1, kg: null }] }] };
    expect(totalXp({ ...base, strength: [s] }, today) - totalXp(base, today)).toBe(75);
  });
});

describe('strength PR XP', () => {
  it('adds 50 XP per exercise with a PR', () => {
    const mk = (id: string, date: string, kg: number) => ({ id, date, createdAt: Date.parse(date), exercises: [{ exerciseId: 'hip-thrust', sets: [{ reps: 5, kg }] }] });
    const two = [mk('a', '2026-10-01', 60), mk('b', '2026-10-05', 70)];
    expect(totalXp({ ...base, strength: two }, today) - totalXp(base, today)).toBe(75 * 2 + 50);
  });
});

describe('hybrid streak', () => {
  it('counts runs, strength and sport sessions towards the weekly streak', () => {
    const mixed: ProgressInput = {
      ...base,
      runs: [run({ date: '2026-09-29', distanceKm: 5, durationSec: 1500 })],
      strength: [{ id: 's', date: '2026-09-30', createdAt: 1, exercises: [] }],
      sessions: [{ id: 'f', date: '2026-10-02', createdAt: 1, sport: 'football', workoutId: 'fb-match', durationMin: 90, rpe: 8, notes: '' }],
    };
    expect(weeklyStreak([...mixed.runs, ...mixed.strength!, ...mixed.sessions!], today)).toBe(1);
    expect(progressOf(mixed, today).streak).toBe(1);
    expect(totalXp(mixed, today) - totalXp({ ...mixed, sessions: [] }, today)).toBe(75);
  });
});
