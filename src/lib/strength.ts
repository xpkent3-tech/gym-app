import type { SetType, StrengthEntry, StrengthSession, StrengthSet } from './muscles';

/** Reps beyond this make a 1RM estimate unreliable. */
const MAX_1RM_REPS = 12;

export const SET_TYPES: { id: SetType; badge: string; label: string }[] = [
  { id: 'normal', badge: '', label: 'Normal' },
  { id: 'warmup', badge: 'W', label: 'Warm-up' },
  { id: 'drop', badge: 'D', label: 'Drop set' },
  { id: 'failure', badge: 'F', label: 'Failure' },
];

/** Epley estimated one-rep max, or null when the set has no weight or too many reps. */
export function epley1RM(kg: number | null, reps: number): number | null {
  if (!kg || kg <= 0 || reps <= 0 || reps > MAX_1RM_REPS) return null;
  return reps === 1 ? kg : kg * (1 + reps / 30);
}

export const setVolume = (s: StrengthSet) => (s.kg ?? 0) * s.reps;

/** Sets that count: done (reps > 0) and not warm-up. */
export const workingSets = (sets: StrengthSet[]) => sets.filter((s) => s.reps > 0 && s.type !== 'warmup');

export function sessionStats(s: Pick<StrengthSession, 'exercises'>) {
  const sets = s.exercises.flatMap((e) => workingSets(e.sets));
  return { sets: sets.length, volume: sets.reduce((v, x) => v + setVolume(x), 0) };
}

export function formatKg(kg: number): string {
  return `${Math.round(kg * 10) / 10}kg`;
}

export function formatSet(s: StrengthSet): string {
  return s.kg ? `${formatKg(s.kg)} × ${s.reps}` : `${s.reps} reps`;
}

export interface ExerciseSession {
  sessionId: string;
  date: string;
  createdAt: number;
  entry: StrengthEntry;
}

/** Every logged appearance of an exercise, oldest first. */
export function exerciseHistory(strength: StrengthSession[], exerciseId: string): ExerciseSession[] {
  return strength
    .flatMap((s) => s.exercises.filter((e) => e.exerciseId === exerciseId).map((entry) => ({ sessionId: s.id, date: s.date, createdAt: s.createdAt, entry })))
    .filter((h) => workingSets(h.entry.sets).length > 0)
    .sort((a, b) => (a.date === b.date ? a.createdAt - b.createdAt : a.date < b.date ? -1 : 1));
}

/** Sets from the most recent earlier session of this exercise (for the PREVIOUS column). */
export function previousSets(strength: StrengthSession[], exerciseId: string): StrengthSet[] {
  const h = exerciseHistory(strength, exerciseId);
  return h.length ? h[h.length - 1].entry.sets.filter((s) => s.reps > 0) : [];
}

export interface Records {
  heaviest: number;
  oneRepMax: number;
  bestSetVolume: number;
  bestSessionVolume: number;
}

const ZERO: Records = { heaviest: 0, oneRepMax: 0, bestSetVolume: 0, bestSessionVolume: 0 };

export function entryRecords(entry: StrengthEntry): Records {
  const sets = workingSets(entry.sets);
  return {
    heaviest: Math.max(0, ...sets.map((s) => s.kg ?? 0)),
    oneRepMax: Math.max(0, ...sets.map((s) => epley1RM(s.kg, s.reps) ?? 0)),
    bestSetVolume: Math.max(0, ...sets.map(setVolume)),
    bestSessionVolume: sets.reduce((v, s) => v + setVolume(s), 0),
  };
}

export function exerciseRecords(history: ExerciseSession[]): Records {
  return history.reduce<Records>((best, h) => {
    const r = entryRecords(h.entry);
    return {
      heaviest: Math.max(best.heaviest, r.heaviest),
      oneRepMax: Math.max(best.oneRepMax, r.oneRepMax),
      bestSetVolume: Math.max(best.bestSetVolume, r.bestSetVolume),
      bestSessionVolume: Math.max(best.bestSessionVolume, r.bestSessionVolume),
    };
  }, ZERO);
}

export type ChartMetric = 'heaviest' | 'oneRepMax' | 'bestSetVolume' | 'bestSessionVolume';

export const CHART_METRICS: { id: ChartMetric; label: string; unit: string }[] = [
  { id: 'heaviest', label: 'Heaviest Weight', unit: 'kg' },
  { id: 'oneRepMax', label: 'One Rep Max', unit: 'kg' },
  { id: 'bestSetVolume', label: 'Best Set Volume', unit: 'kg' },
  { id: 'bestSessionVolume', label: 'Session Volume', unit: 'kg' },
];

export interface ChartPoint {
  date: string;
  value: number;
}

export function chartSeries(history: ExerciseSession[], metric: ChartMetric): ChartPoint[] {
  return history.map((h) => ({ date: h.date, value: entryRecords(h.entry)[metric] })).filter((p) => p.value > 0);
}

export type PrKind = 'heaviest' | 'oneRepMax' | 'bestSetVolume';

export interface SessionPr {
  exerciseId: string;
  kinds: PrKind[];
}

/** Records beaten by `entry` versus `before`. First-ever sessions of an exercise set no PR. */
export function entryPrs(entry: StrengthEntry, before: ExerciseSession[]): PrKind[] {
  if (before.length === 0) return [];
  const prev = exerciseRecords(before);
  const now = entryRecords(entry);
  const kinds: PrKind[] = [];
  if (now.heaviest > prev.heaviest) kinds.push('heaviest');
  if (now.oneRepMax > prev.oneRepMax + 1e-9) kinds.push('oneRepMax');
  if (now.bestSetVolume > prev.bestSetVolume) kinds.push('bestSetVolume');
  return kinds;
}

/** PRs set by a saved session, compared with sessions strictly before it. */
export function prsInSession(strength: StrengthSession[], sessionId: string): SessionPr[] {
  const session = strength.find((s) => s.id === sessionId);
  if (!session) return [];
  const earlier = strength.filter((s) => s.id !== sessionId && (s.date < session.date || (s.date === session.date && s.createdAt < session.createdAt)));
  return session.exercises
    .map((e) => ({ exerciseId: e.exerciseId, kinds: entryPrs(e, exerciseHistory(earlier, e.exerciseId)) }))
    .filter((p) => p.kinds.length > 0);
}

/** Number of exercises in each session that set a PR, summed (used for XP). */
export function totalPrExercises(strength: StrengthSession[]): number {
  return strength.reduce((n, s) => n + prsInSession(strength, s.id).length, 0);
}

export const PR_LABEL: Record<PrKind, string> = { heaviest: 'Heaviest weight', oneRepMax: 'Est. 1RM', bestSetVolume: 'Best set volume' };
