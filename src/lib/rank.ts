import { addDays } from './dates';
import { normalCdf, normalQuantile } from './stats';
import type { Profile, RaceResult, Run, Sex } from './types';

export const MARATHON_KM = 42.195;
const RIEGEL = 1.06;

/**
 * Reference population of marathon finishers. Constants are tuned so that the
 * men's 30–39 median is 4:30 and ~10% run under 3:30, in line with large race-result samples.
 */
export const POPULATION = {
  medianSec: { male: 4.5 * 3600, female: (4 + 56 / 60) * 3600 } as Record<Sex, number>,
  sigma: 0.2,
  ageStepPerDecade: 0.03,
  volumeMedianKm: 32,
  volumeSigma: 0.55,
};

export function riegel(distanceKm: number, durationSec: number, targetKm = MARATHON_KM): number {
  return durationSec * Math.pow(targetKm / distanceKm, RIEGEL);
}

export interface Prediction {
  timeSec: number;
  source: { kind: 'run'; runId: string } | { kind: 'race-result' };
  basis: RaceResult;
}

/** Best (fastest) marathon prediction from runs ≥3 km and the optional onboarding race result. */
export function predictMarathon(runs: Run[], raceResult?: RaceResult): Prediction | null {
  let best: Prediction | null = null;
  for (const r of runs) {
    if (r.distanceKm < 3) continue;
    const t = riegel(r.distanceKm, r.durationSec);
    if (!best || t < best.timeSec) best = { timeSec: t, source: { kind: 'run', runId: r.id }, basis: { distanceKm: r.distanceKm, durationSec: r.durationSec } };
  }
  if (raceResult && raceResult.distanceKm >= 3) {
    const t = riegel(raceResult.distanceKm, raceResult.durationSec);
    if (!best || t < best.timeSec) best = { timeSec: t, source: { kind: 'race-result' }, basis: raceResult };
  }
  return best;
}

/** Age adjustment: the 20–39 band is the reference; each decade outside it slows the median by 3%. */
export function ageFactor(age: number): number {
  let decades = 0;
  if (age >= 40) decades = Math.floor((age - 30) / 10);
  else if (age < 20) decades = 1;
  return 1 + POPULATION.ageStepPerDecade * decades;
}

export function medianFor(sex: Sex, age: number): number {
  return POPULATION.medianSec[sex] * ageFactor(age);
}

export function ageGroupLabel(age: number): string {
  if (age < 20) return 'U20';
  if (age < 40) return '20–39';
  const lo = Math.floor(age / 10) * 10;
  return `${lo}–${lo + 9}`;
}

const clampPct = (p: number) => Math.min(99, Math.max(1, Math.round(p)));

/** "Top X%" (1..99) — the share of the reference group at least as fast as this time. */
export function topPercentForTime(timeSec: number, sex: Sex, age: number): number {
  const z = (Math.log(timeSec) - Math.log(medianFor(sex, age))) / POPULATION.sigma;
  return clampPct(normalCdf(z) * 100);
}

/** Marathon time needed to be in the top `pct`%. */
export function timeForTopPercent(pct: number, sex: Sex, age: number): number {
  return medianFor(sex, age) * Math.exp(POPULATION.sigma * normalQuantile(pct / 100));
}

export interface Tier {
  name: string;
  maxTop: number;
  color: string;
}

/** Ordered best → worst. A runner belongs to the first tier whose maxTop ≥ their top%. */
export const TIERS: Tier[] = [
  { name: 'Elite', maxTop: 2, color: '#FFD54A' },
  { name: 'Sub-Elite', maxTop: 10, color: '#B37BFF' },
  { name: 'Advanced', maxTop: 25, color: '#4C9EFF' },
  { name: 'Strong', maxTop: 50, color: '#3DDC97' },
  { name: 'Steady', maxTop: 75, color: '#FFB020' },
  { name: 'Starter', maxTop: 100, color: '#9AA4B2' },
];

export function tierFor(topPct: number): Tier {
  return TIERS.find((t) => topPct <= t.maxTop) ?? TIERS[TIERS.length - 1];
}

export interface RankResult {
  prediction: Prediction;
  topPct: number;
  tier: Tier;
  nextTier: { tier: Tier; targetSec: number; gapSec: number } | null;
  ageGroup: string;
}

export function rankRunner(profile: Pick<Profile, 'sex' | 'age' | 'raceResult'>, runs: Run[]): RankResult | null {
  const prediction = predictMarathon(runs, profile.raceResult);
  if (!prediction) return null;
  const topPct = topPercentForTime(prediction.timeSec, profile.sex, profile.age);
  const tier = tierFor(topPct);
  const idx = TIERS.indexOf(tier);
  let nextTier: RankResult['nextTier'] = null;
  if (idx > 0) {
    const target = TIERS[idx - 1];
    const targetSec = timeForTopPercent(target.maxTop, profile.sex, profile.age);
    nextTier = { tier: target, targetSec, gapSec: Math.max(0, prediction.timeSec - targetSec) };
  }
  return { prediction, topPct, tier, nextTier, ageGroup: ageGroupLabel(profile.age) };
}

export function distanceInLastDays(runs: Run[], today: string, days = 7): number {
  const from = addDays(today, -(days - 1));
  return runs.filter((r) => r.date >= from && r.date <= today).reduce((s, r) => s + r.distanceKm, 0);
}

/** "Top X%" for weekly volume among marathon trainees; null when nothing was run. */
export function volumeTopPercent(weekKm: number): number | null {
  if (weekKm <= 0) return null;
  const z = (Math.log(weekKm) - Math.log(POPULATION.volumeMedianKm)) / POPULATION.volumeSigma;
  return clampPct((1 - normalCdf(z)) * 100);
}
