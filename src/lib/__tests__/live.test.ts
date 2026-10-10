import { weeklyTotals } from '../history';
import { nextBestAction } from '../nudges';
import { generatePlan } from '../plan';
import type { ProgressInput } from '../progression';
import { elapsed, IDLE, lap, pause, resume, splits, start } from '../stopwatch';
import type { Profile } from '../types';
import { run } from './helpers';

describe('stopwatch', () => {
  it('excludes paused time and records laps', () => {
    let sw = start(IDLE, 1000);
    sw = lap(sw, 61_000);
    sw = pause(sw, 91_000);
    expect(elapsed(sw, 500_000)).toBe(90_000);
    sw = lap(sw, 95_000); // ignored while paused
    sw = resume(sw, 191_000);
    expect(elapsed(sw, 201_000)).toBe(100_000);
    sw = lap(sw, 221_000);
    expect(sw.laps).toEqual([60_000, 120_000]);
    expect(splits(sw)).toEqual([60_000, 60_000]);
  });
  it('is zero before starting', () => {
    expect(elapsed(IDLE, 5)).toBe(0);
  });
});

describe('history', () => {
  it('totals the last weeks oldest first', () => {
    const t = weeklyTotals(
      [run({ date: '2026-10-01', distanceKm: 20, durationSec: 6000 }), run({ date: '2026-10-08', distanceKm: 5, durationSec: 1500 })],
      '2026-10-09',
    );
    expect(t).toHaveLength(8);
    expect(t.slice(-2).map((w) => w.km)).toEqual([20, 5]);
    expect(t[7].isCurrent).toBe(true);
    expect(t[0].isCurrent).toBe(false);
  });
});

describe('next best action', () => {
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
  const base: ProgressInput = { profile, runs: [], plan: generatePlan(profile), friends: [], invitesSent: 0 };
  const five = (date: string) => run({ date, distanceKm: 5, durationSec: 1800 });

  it('warns when the streak is at risk', () => {
    const runs = ['2026-09-21', '2026-09-23', '2026-09-25', '2026-09-28', '2026-09-30', '2026-10-02', '2026-10-06'].map(five);
    expect(nextBestAction({ ...base, runs }, '2026-10-09')?.text).toBe('Train 2 more times by Sunday to keep your 2-week streak');
  });

  it("doesn't nag when the streak can no longer be saved", () => {
    const runs = ['2026-09-28', '2026-09-30', '2026-10-02'].map(five);
    expect(nextBestAction({ ...base, runs }, '2026-10-11')?.kind).not.toBe('streak');
  });

  it('nudges a nearly complete challenge', () => {
    const target = base.plan[0].targetKm;
    const runs = [run({ date: '2026-10-09', distanceKm: target - 3, durationSec: 9000 })];
    expect(nextBestAction({ ...base, runs }, '2026-10-09')?.kind).toBe('challenge');
  });

  it('is silent with nothing urgent', () => {
    expect(nextBestAction(base, '2026-10-09')).toBeNull();
  });
});
