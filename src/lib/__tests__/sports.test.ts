import { MUSCLES } from '../muscles';
import { benchmarkTopPct, footballLoadTopPct, hybridTopPct, hyroxTopPct, sportRanks } from '../sportRank';
import { HYROX_STATIONS, resultLabel, sessionMuscleLoad, SESSION_SPORTS, weeklySuggestions, WORKOUTS, workoutsFor, type SportSession } from '../sports';

const sess = (p: Partial<SportSession> & Pick<SportSession, 'workoutId' | 'sport'>): SportSession => ({
  id: Math.random().toString(36),
  date: '2026-10-09',
  createdAt: 1,
  durationMin: 60,
  rpe: 8,
  notes: '',
  ...p,
});

describe('sports library', () => {
  it('every sport has workouts and valid muscles', () => {
    const ids = new Set(MUSCLES.map((m) => m.id));
    for (const sp of SESSION_SPORTS) expect(workoutsFor(sp).length).toBeGreaterThanOrEqual(4);
    for (const w of WORKOUTS) for (const m of Object.keys(w.muscles)) expect(ids.has(m as never)).toBe(true);
    expect(HYROX_STATIONS).toHaveLength(8);
    expect(workoutsFor('hyrox').map((w) => w.name)).toEqual(expect.arrayContaining(['HYROX Race / Simulation', 'Compromised Running', 'Station Practice']));
  });

  it('formats results by workout format', () => {
    expect(resultLabel(sess({ sport: 'crossfit', workoutId: 'cf-fran', resultSec: 270 }))).toBe('4:30');
    expect(resultLabel(sess({ sport: 'crossfit', workoutId: 'cf-cindy', rounds: 18, reps: 7 }))).toBe('18 rds + 7');
    expect(resultLabel(sess({ sport: 'football', workoutId: 'fb-match', durationMin: 90 }))).toBe('90 min');
  });

  it('football match loads legs, scaled by duration and RPE', () => {
    const l = sessionMuscleLoad(sess({ sport: 'football', workoutId: 'fb-match', durationMin: 90, rpe: 8 }));
    expect(l.quads!).toBeCloseTo(0.9 * 9 * 0.8);
    expect(l.adductors!).toBeGreaterThan(0);
    expect(l.chest).toBeUndefined();
  });

  it('suggests rotating workouts per week', () => {
    const w0 = weeklySuggestions('crossfit', 0).map((w) => w.id);
    const w1 = weeklySuggestions('crossfit', 1).map((w) => w.id);
    expect(w0).toHaveLength(2);
    expect(w0).not.toEqual(w1);
  });
});

describe('sport ranks', () => {
  it('HYROX 1:20 for a 30-year-old man is better than top 50%', () => {
    expect(hyroxTopPct(80 * 60, 'male', 30)).toBeLessThan(50);
    expect(hyroxTopPct(90 * 60, 'male', 30)).toBe(50);
  });

  it('benchmarks: faster time and more rounds rank better', () => {
    expect(benchmarkTopPct('fran', { resultSec: 240 }, 'male')!).toBeLessThan(benchmarkTopPct('fran', { resultSec: 420 }, 'male')!);
    expect(benchmarkTopPct('cindy', { rounds: 25 }, 'male')!).toBeLessThan(benchmarkTopPct('cindy', { rounds: 12 }, 'male')!);
    expect(benchmarkTopPct('fran', {}, 'male')).toBeNull();
  });

  it('football load', () => {
    expect(footballLoadTopPct(0)).toBeNull();
    expect(footballLoadTopPct(1400)).toBe(50);
    expect(footballLoadTopPct(3000)!).toBeLessThan(15);
  });

  it('collects ranks and the hybrid mean', () => {
    const r = sportRanks(
      [
        sess({ sport: 'hyrox', workoutId: 'hyrox-race', resultSec: 85 * 60 }),
        sess({ sport: 'crossfit', workoutId: 'cf-fran', resultSec: 300 }),
        sess({ sport: 'crossfit', workoutId: 'cf-fran', resultSec: 400 }),
        sess({ sport: 'football', workoutId: 'fb-match', durationMin: 90, rpe: 8 }),
      ],
      'male',
      30,
      '2026-10-09',
    );
    expect(r.hyrox?.bestSec).toBe(85 * 60);
    expect(r.crossfit).toHaveLength(1);
    expect(r.crossfit[0].result.resultSec).toBe(300);
    expect(r.football?.weeklyAU).toBe(720);
    expect(hybridTopPct([20, 30])).toBe(25);
    expect(hybridTopPct([20, null])).toBeNull();
  });
});
