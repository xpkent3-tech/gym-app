import { bmi, ffmi, latestEntry, leanMassKg, normalizeBodyFat } from '../bodycomp';
import { EMPTY, reducer } from '../store';
import type { Profile } from '../types';

describe('body composition', () => {
  it('80 kg, 15 %, 180 cm → lean 68, BMI 24.7, FFMI 21.0', () => {
    expect(leanMassKg(80, 15)).toBe(68);
    expect(bmi(80, 180)).toBe(24.7);
    expect(ffmi(80, 15, 180)).toBe(21);
    expect(ffmi(80, undefined, 180)).toBeNull();
  });

  it('normalises HealthKit fractions', () => {
    expect(normalizeBodyFat(0.153)).toBe(15.3);
    expect(normalizeBodyFat(15.3)).toBe(15.3);
  });

  it('latest entry and profile sync', () => {
    const profile: Profile = {
      name: 'K',
      sex: 'male',
      age: 30,
      experience: 'beginner',
      weeklyKm: 20,
      raceDate: '2027-01-01',
      planStart: '2026-10-05',
      createdAt: 1,
      body: { weightKg: 80, heightCm: 180 },
    };
    let s = reducer(
      { ...EMPTY, profile, hydrated: true },
      { type: 'addBodyEntry', entry: { id: 'a', date: '2026-10-01', createdAt: 1, weightKg: 79, source: 'manual' } },
    );
    s = reducer(s, { type: 'addBodyEntry', entry: { id: 'b', date: '2026-10-10', createdAt: 2, weightKg: 76.4, bodyFatPct: 15, source: 'manual' } });
    expect(latestEntry(s.bodyLog)?.id).toBe('b');
    expect(s.profile?.body).toEqual({ weightKg: 76.4, heightCm: 180, bodyFatPct: 15 });
    // An older back-dated entry does not overwrite the current body
    s = reducer(s, { type: 'addBodyEntry', entry: { id: 'c', date: '2026-09-01', createdAt: 3, weightKg: 90, source: 'manual' } });
    expect(s.profile?.body?.weightKg).toBe(76.4);
  });
});
