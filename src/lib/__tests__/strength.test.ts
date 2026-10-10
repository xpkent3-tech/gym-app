import { exerciseById, searchExercises, setCustomExercises, type Exercise } from '../exercises';
import { sessionLoad, type StrengthSession } from '../muscles';
import {
  chartSeries,
  entryPrs,
  epley1RM,
  exerciseHistory,
  exerciseRecords,
  previousSets,
  prsInSession,
  sessionStats,
  totalPrExercises,
} from '../strength';
import { EMPTY, migrate } from '../store';

const sess = (id: string, date: string, sets: { kg: number | null; reps: number; type?: 'warmup' | 'drop' | 'failure' }[], exerciseId = 'hip-thrust'): StrengthSession => ({
  id,
  date,
  createdAt: Date.parse(date),
  exercises: [{ exerciseId, sets }],
});

describe('epley1RM', () => {
  it('estimates from weight and reps', () => {
    expect(epley1RM(100, 5)).toBeCloseTo(116.67, 1);
    expect(epley1RM(80, 1)).toBe(80);
  });
  it('is null for bodyweight or high reps', () => {
    expect(epley1RM(null, 10)).toBeNull();
    expect(epley1RM(50, 20)).toBeNull();
    expect(epley1RM(50, 0)).toBeNull();
  });
});

describe('stats and warm-ups', () => {
  it('excludes warm-up sets from volume and muscle load', () => {
    const s = sess('a', '2026-10-01', [{ kg: 20, reps: 10, type: 'warmup' }, { kg: 60, reps: 10 }, { kg: 50, reps: 8, type: 'drop' }]);
    expect(sessionStats(s)).toEqual({ sets: 2, volume: 600 + 400 });
    expect(sessionLoad(s).glutes).toBe(2);
  });
});

describe('history, previous and records', () => {
  const a = sess('a', '2026-10-01', [{ kg: 60, reps: 10 }]);
  const b = sess('b', '2026-10-05', [{ kg: 70, reps: 5 }, { kg: 40, reps: 20 }]);
  it('orders history oldest first and previous is the latest', () => {
    const h = exerciseHistory([b, a], 'hip-thrust');
    expect(h.map((x) => x.sessionId)).toEqual(['a', 'b']);
    expect(previousSets([b, a], 'hip-thrust')[0].kg).toBe(70);
  });
  it('computes records', () => {
    const r = exerciseRecords(exerciseHistory([a, b], 'hip-thrust'));
    expect(r.heaviest).toBe(70);
    expect(r.bestSetVolume).toBe(800);
    expect(r.oneRepMax).toBeCloseTo(81.67, 1);
  });
  it('builds a chart series per metric', () => {
    const h = exerciseHistory([a, b], 'hip-thrust');
    expect(chartSeries(h, 'heaviest').map((p) => p.value)).toEqual([60, 70]);
    expect(chartSeries(h, 'oneRepMax')).toHaveLength(2);
  });
});

describe('personal records', () => {
  const a = sess('a', '2026-10-01', [{ kg: 60, reps: 10 }]);
  const b = sess('b', '2026-10-05', [{ kg: 70, reps: 5 }]);
  const c = sess('c', '2026-10-08', [{ kg: 50, reps: 5 }]);
  it('has no PR on the first session', () => {
    expect(prsInSession([a], 'a')).toEqual([]);
  });
  it('flags a heavier later session only against earlier ones', () => {
    expect(prsInSession([a, b], 'b')[0].kinds).toContain('heaviest');
    expect(prsInSession([a, b], 'a')).toEqual([]);
    expect(prsInSession([a, b, c], 'c')).toEqual([]);
  });
  it('ignores a warm-up as a record', () => {
    expect(entryPrs(sess('x', '2026-10-09', [{ kg: 200, reps: 1, type: 'warmup' }]).exercises[0], exerciseHistory([a], 'hip-thrust'))).toEqual([]);
  });
  it('counts PR exercises', () => {
    expect(totalPrExercises([a, b, c])).toBe(1);
  });
});

describe('custom exercises', () => {
  const sled: Exercise = { id: 'c-sled', name: 'Sled Push', equipment: 'Other', primary: ['quads'], secondary: [], cues: [], why: '', custom: true };
  afterEach(() => setCustomExercises([]));
  it('are found by id and search', () => {
    setCustomExercises([sled]);
    expect(exerciseById('c-sled')?.name).toBe('Sled Push');
    expect(searchExercises('sled', null)).toHaveLength(1);
  });
  it('light up muscles when logged', () => {
    setCustomExercises([sled]);
    expect(sessionLoad(sess('s', '2026-10-01', [{ kg: null, reps: 10 }], 'c-sled')).quads).toBe(1);
  });
  it('migrate defaults routines and custom exercises', () => {
    expect(migrate({ ...EMPTY, routines: undefined, customExercises: undefined } as never).routines).toEqual([]);
  });
});
