import { addDays, raceDateInWeeks, startOfWeek } from '../dates';
import { generatePlan, planStartFor, planWeeksFor, todayStatus, weekProgress, weekVolume } from '../plan';
import { run } from './helpers';

const today = '2026-10-05'; // Monday
const race16 = addDays(today, 15 * 7 + 6); // Sunday of week 16

describe('plan', () => {
  it('builds a 16 week plan ending on race day', () => {
    expect(planWeeksFor(today, race16)).toBe(16);
    const plan = generatePlan({ planStart: planStartFor(today, race16), raceDate: race16, weeklyKm: 30, experience: 'intermediate' });
    expect(plan).toHaveLength(16);
    expect(plan[0].start).toBe(today);
    const last = plan[15].sessions.at(-1)!;
    expect(last.type).toBe('race');
    expect(last.date).toBe(race16);
    const peak = Math.max(...plan.map((w) => w.targetKm));
    expect(peak).toBeGreaterThan(plan[0].targetKm);
    expect(plan[3].targetKm).toBeLessThan(plan[2].targetKm); // cut-back week 4
    expect(plan[14].targetKm).toBeLessThan(peak); // taper
    expect(plan[14].phase).toBe('Taper');
  });

  it('session volumes add up to the target', () => {
    const plan = generatePlan({ planStart: planStartFor(today, race16), raceDate: race16, weeklyKm: 50, experience: 'advanced' });
    for (const w of plan.slice(0, -1)) expect(Math.abs(weekVolume(w) - w.targetKm)).toBeLessThanOrEqual(1.5);
  });

  it('clamps to 12 and 20 weeks', () => {
    expect(planWeeksFor(today, addDays(today, 30))).toBe(12);
    expect(planWeeksFor(today, addDays(today, 400))).toBe(20);
    const far = addDays(today, 400);
    expect(generatePlan({ planStart: planStartFor(today, far), raceDate: far, weeklyKm: 20, experience: 'beginner' })).toHaveLength(20);
    expect(planStartFor(today, far) > today).toBe(true);
  });

  it('reports today status and completion', () => {
    const plan = generatePlan({ planStart: planStartFor(today, race16), raceDate: race16, weeklyKm: 30, experience: 'beginner' });
    expect(todayStatus(plan, today).kind).toBe('rest'); // Monday = rest
    const tue = addDays(today, 1);
    const st = todayStatus(plan, tue);
    expect(st.kind).toBe('session');
    expect(weekProgress(plan[0], []).done).toBe(0);
    expect(weekProgress(plan[0], [run({ date: tue, distanceKm: 5, durationSec: 1800 })]).done).toBe(1);
    expect(todayStatus(plan, addDays(race16, 3)).kind).toBe('after-race');
    expect(startOfWeek('2026-10-11')).toBe('2026-10-05');
  });
});

describe('raceDateInWeeks', () => {
  it('lands on the Sunday of week N and yields an N-week plan', () => {
    const fri = '2026-10-09';
    const race = raceDateInWeeks(fri, 16);
    expect(race).toBe('2027-01-24');
    expect(planWeeksFor(fri, race)).toBe(16);
  });
});
