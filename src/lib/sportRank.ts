import { normalCdf } from './stats';
import { ageFactor } from './rank';
import { weeklyLoad, workoutById, type SportSession } from './sports';
import type { Sex } from './types';

const clampPct = (p: number) => Math.min(99, Math.max(1, Math.round(p)));

/** Lower-is-better log-normal rank. */
const lnTop = (value: number, median: number, sigma: number) => clampPct(normalCdf((Math.log(value) - Math.log(median)) / sigma) * 100);

export const SPORT_POPULATION = {
  hyrox: { median: { male: 90 * 60, female: 100 * 60 } as Record<Sex, number>, sigma: 0.14 },
  crossfit: {
    fran: { median: { male: 330, female: 390 }, sigma: 0.35 },
    grace: { median: { male: 270, female: 270 }, sigma: 0.4 },
    helen: { median: { male: 660, female: 750 }, sigma: 0.2 },
    murph: { median: { male: 3000, female: 3300 }, sigma: 0.25 },
  } as Record<string, { median: Record<Sex, number>; sigma: number }>,
  cindy: { mean: { male: 17, female: 15 } as Record<Sex, number>, sd: 4 },
  football: { median: 1400, sigma: 0.5 },
};

export const BENCHMARK_LABEL: Record<string, string> = { fran: 'Fran', grace: 'Grace', helen: 'Helen', murph: 'Murph', cindy: 'Cindy' };

export function hyroxTopPct(timeSec: number, sex: Sex, age: number): number {
  return lnTop(timeSec, SPORT_POPULATION.hyrox.median[sex] * ageFactor(age), SPORT_POPULATION.hyrox.sigma);
}

export function benchmarkTopPct(benchmark: string, s: Pick<SportSession, 'resultSec' | 'rounds' | 'reps'>, sex: Sex): number | null {
  if (benchmark === 'cindy') {
    if (s.rounds === undefined) return null;
    const value = s.rounds + (s.reps ?? 0) / 30;
    const { mean, sd } = SPORT_POPULATION.cindy;
    return clampPct((1 - normalCdf((value - mean[sex]) / sd)) * 100);
  }
  const p = SPORT_POPULATION.crossfit[benchmark];
  if (!p || !s.resultSec) return null;
  return lnTop(s.resultSec, p.median[sex], p.sigma);
}

export function footballLoadTopPct(weeklyAU: number): number | null {
  if (weeklyAU <= 0) return null;
  const { median, sigma } = SPORT_POPULATION.football;
  return clampPct((1 - normalCdf((Math.log(weeklyAU) - Math.log(median)) / sigma)) * 100);
}

export interface SportRanks {
  hyrox: { topPct: number; bestSec: number } | null;
  crossfit: { benchmark: string; label: string; topPct: number; result: SportSession }[];
  football: { topPct: number; weeklyAU: number } | null;
}

export function sportRanks(sessions: SportSession[], sex: Sex, age: number, today: string): SportRanks {
  const hyroxRaces = sessions.filter((s) => s.workoutId === 'hyrox-race' && s.resultSec);
  const bestHyrox = hyroxRaces.reduce<number | null>((m, s) => (m === null || s.resultSec! < m ? s.resultSec! : m), null);
  const best = new Map<string, { topPct: number; result: SportSession }>();
  for (const s of sessions) {
    const b = workoutById(s.workoutId)?.benchmark;
    if (!b || b === 'hyrox-race') continue;
    const pct = benchmarkTopPct(b, s, sex);
    if (pct === null) continue;
    const cur = best.get(b);
    if (!cur || pct < cur.topPct) best.set(b, { topPct: pct, result: s });
  }
  const au = weeklyLoad(sessions, 'football', today);
  const fbPct = footballLoadTopPct(au);
  return {
    hyrox: bestHyrox ? { topPct: hyroxTopPct(bestHyrox, sex, age), bestSec: bestHyrox } : null,
    crossfit: [...best.entries()]
      .map(([benchmark, v]) => ({ benchmark, label: BENCHMARK_LABEL[benchmark] ?? benchmark, ...v }))
      .sort((a, b) => a.topPct - b.topPct),
    football: fbPct === null ? null : { topPct: fbPct, weeklyAU: au },
  };
}

/** Mean of the sport percentiles (CrossFit counts once, using its best benchmark). Null with fewer than two sports ranked. */
export function hybridTopPct(parts: (number | null | undefined)[]): number | null {
  const vals = parts.filter((p): p is number => typeof p === 'number');
  if (vals.length < 2) return null;
  return clampPct(vals.reduce((s, v) => s + v, 0) / vals.length);
}
