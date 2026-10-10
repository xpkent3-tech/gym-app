import { EXERCISES, exerciseById, searchExercises } from '../exercises';
import { balanceInsight, intensities, MUSCLES, runLoad, sessionLoad, weeklyMuscles, type StrengthSession } from '../muscles';
import { run } from './helpers';

const session = (date: string, exerciseId: string, sets = 3): StrengthSession => ({
  id: `s-${exerciseId}`,
  date,
  createdAt: 1,
  exercises: [{ exerciseId, sets: Array.from({ length: sets }, () => ({ reps: 10, kg: 60 })) }],
});

describe('exercises', () => {
  it('has at least 15 exercises with valid muscles', () => {
    const ids = new Set(MUSCLES.map((m) => m.id));
    expect(EXERCISES.length).toBeGreaterThanOrEqual(15);
    for (const e of EXERCISES) {
      expect(e.primary.length).toBeGreaterThan(0);
      for (const m of [...e.primary, ...e.secondary]) expect(ids.has(m)).toBe(true);
    }
  });

  it('filters by muscle and searches by name', () => {
    const glutes = searchExercises('', 'glutes');
    expect(glutes.length).toBeGreaterThan(3);
    for (const e of glutes) expect([...e.primary, ...e.secondary]).toContain('glutes');
    expect(searchExercises('thrust', null).map((e) => e.id)).toEqual(['hip-thrust']);
    expect(exerciseById('hip-thrust')?.secondary).toContain('hamstrings');
  });
});

describe('muscle load', () => {
  it('intervals load hamstrings more than easy runs of equal distance', () => {
    const a = runLoad(run({ type: 'intervals', distanceKm: 8, durationSec: 2400 }));
    const b = runLoad(run({ type: 'easy', distanceKm: 8, durationSec: 2400 }));
    expect(a.hamstrings!).toBeGreaterThan(b.hamstrings!);
    expect(b.calves!).toBeGreaterThan(0);
    expect(b.quads!).toBeGreaterThan(0);
  });

  it('counts sets for primary (1) and secondary (0.5) muscles, skipping empty sets', () => {
    const s = session('2026-10-09', 'hip-thrust', 3);
    s.exercises[0].sets.push({ reps: 0, kg: null });
    const l = sessionLoad(s);
    expect(l.glutes).toBe(3);
    expect(l.hamstrings).toBe(1.5);
  });

  it('aggregates the last 7 days with contributors', () => {
    const r = run({ date: '2026-10-09', type: 'easy', distanceKm: 10, durationSec: 3000 });
    const old = run({ date: '2026-09-01', distanceKm: 30, durationSec: 9000 });
    const w = weeklyMuscles([r, old], [session('2026-10-08', 'hip-thrust')], '2026-10-09');
    expect(w.load.calves).toBe(3);
    expect(w.contributors.calves?.map((c) => c.id)).toEqual([r.id]);
    expect(w.contributors.glutes?.[0].kind).toBe('strength');
    expect(w.strengthLoad.calves).toBeUndefined();
    const i = intensities(w.load);
    expect(Math.max(...Object.values(i).map((v) => v ?? 0))).toBe(1);
  });

  it('balance insight lists runner muscles without strength work', () => {
    const none = balanceInsight({});
    expect(none.missing.map((m) => m.label)).toEqual(['Glutes', 'Hamstrings', 'Core', 'Calves', 'Hip Flexors']);
    expect(none.suggestions.length).toBeGreaterThan(0);
    expect(none.suggestions.length).toBeLessThanOrEqual(3);
    const some = balanceInsight(sessionLoad(session('2026-10-09', 'hip-thrust')));
    expect(some.missing.map((m) => m.id)).not.toContain('glutes');
    expect(some.missing.map((m) => m.id)).not.toContain('hamstrings'); // 1.5 secondary sets
    const all = balanceInsight({ glutes: 3, hamstrings: 3, abs: 3, calves: 3, hipFlexors: 3 });
    expect(all.missing).toEqual([]);
    expect(all.suggestions).toEqual([]);
  });
});
