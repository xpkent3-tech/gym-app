import { addDays } from './dates';
import { exerciseById, EXERCISES, type Exercise } from './exercises';
import { sessionMuscleLoad, workoutById, type SportSession } from './sports';
import type { Run, RunType } from './types';

export type MuscleId =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'traps'
  | 'neck'
  | 'upperBack'
  | 'lats'
  | 'lowerBack'
  | 'abs'
  | 'obliques'
  | 'hipFlexors'
  | 'glutes'
  | 'adductors'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'tibialis';

export const MUSCLES: { id: MuscleId; label: string; deep?: boolean }[] = [
  { id: 'quads', label: 'Quads' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'calves', label: 'Calves' },
  { id: 'hipFlexors', label: 'Hip Flexors', deep: true },
  { id: 'adductors', label: 'Adductors' },
  { id: 'tibialis', label: 'Shins' },
  { id: 'abs', label: 'Abs' },
  { id: 'obliques', label: 'Obliques' },
  { id: 'lowerBack', label: 'Lower Back' },
  { id: 'upperBack', label: 'Upper Back' },
  { id: 'traps', label: 'Traps' },
  { id: 'neck', label: 'Neck' },
  { id: 'lats', label: 'Lats' },
  { id: 'chest', label: 'Chest' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'forearms', label: 'Forearms' },
];

export const muscleLabel = (id: MuscleId) => MUSCLES.find((m) => m.id === id)?.label ?? id;

export type MuscleLoad = Partial<Record<MuscleId, number>>;

/** Per-km muscle recruitment by run type (0..1). Faster running recruits more posterior chain and hip flexors. */
export const RUN_WEIGHTS: Record<RunType, MuscleLoad> = {
  easy: { calves: 0.6, quads: 0.6, glutes: 0.4, hamstrings: 0.4, hipFlexors: 0.4, tibialis: 0.3, abs: 0.2, obliques: 0.2, adductors: 0.2 },
  recovery: { calves: 0.5, quads: 0.5, glutes: 0.3, hamstrings: 0.3, hipFlexors: 0.3, tibialis: 0.2, abs: 0.1, obliques: 0.1, adductors: 0.1 },
  long: { calves: 0.8, quads: 0.8, glutes: 0.5, hamstrings: 0.5, hipFlexors: 0.5, tibialis: 0.4, abs: 0.3, obliques: 0.3, adductors: 0.3, lowerBack: 0.2 },
  tempo: { calves: 0.8, quads: 0.7, glutes: 0.7, hamstrings: 0.7, hipFlexors: 0.6, tibialis: 0.3, abs: 0.3, obliques: 0.3, adductors: 0.3, shoulders: 0.1 },
  intervals: {
    calves: 0.9,
    quads: 0.7,
    glutes: 0.9,
    hamstrings: 0.9,
    hipFlexors: 0.8,
    tibialis: 0.3,
    abs: 0.4,
    obliques: 0.4,
    adductors: 0.4,
    shoulders: 0.2,
    biceps: 0.1,
  },
  race: { calves: 0.9, quads: 0.9, glutes: 0.7, hamstrings: 0.7, hipFlexors: 0.6, tibialis: 0.4, abs: 0.3, obliques: 0.3, adductors: 0.3, lowerBack: 0.2 },
};

const RUN_SCALE = 0.5;

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export interface StrengthSet {
  reps: number;
  kg: number | null;
  /** Defaults to normal. Warm-up sets never count toward volume, PRs or muscle load. */
  type?: SetType;
}

export interface StrengthEntry {
  exerciseId: string;
  sets: StrengthSet[];
  note?: string;
  /** Rest timer in seconds; 0/undefined = off. */
  restSec?: number;
}

export interface StrengthSession {
  id: string;
  date: string;
  createdAt: number;
  exercises: StrengthEntry[];
  durationSec?: number;
  name?: string;
}

export function runLoad(run: Run): MuscleLoad {
  const w = RUN_WEIGHTS[run.type];
  const out: MuscleLoad = {};
  for (const [m, v] of Object.entries(w) as [MuscleId, number][]) out[m] = v * run.distanceKm * RUN_SCALE;
  return out;
}

export function exerciseLoad(ex: Exercise, sets: number): MuscleLoad {
  const out: MuscleLoad = {};
  for (const m of ex.primary) out[m] = (out[m] ?? 0) + sets;
  for (const m of ex.secondary) out[m] = (out[m] ?? 0) + sets * 0.5;
  return out;
}

export function sessionLoad(s: StrengthSession): MuscleLoad {
  return mergeLoads(
    s.exercises.flatMap((e) => {
      const ex = exerciseById(e.exerciseId);
      return ex ? [exerciseLoad(ex, e.sets.filter((x) => x.reps > 0 && x.type !== 'warmup').length)] : [];
    }),
  );
}

export function mergeLoads(loads: MuscleLoad[]): MuscleLoad {
  const out: MuscleLoad = {};
  for (const l of loads) for (const [m, v] of Object.entries(l) as [MuscleId, number][]) out[m] = (out[m] ?? 0) + v;
  return out;
}

export interface Contributor {
  kind: 'run' | 'strength' | 'sport';
  id: string;
  date: string;
  label: string;
  load: number;
}

export interface WeeklyMuscles {
  load: MuscleLoad;
  strengthLoad: MuscleLoad;
  contributors: Partial<Record<MuscleId, Contributor[]>>;
}

export function weeklyMuscles(runs: Run[], strength: StrengthSession[], today: string, days = 7, sessions: SportSession[] = []): WeeklyMuscles {
  const from = addDays(today, -(days - 1));
  const inWindow = <T extends { date: string }>(x: T) => x.date >= from && x.date <= today;
  const contributors: WeeklyMuscles['contributors'] = {};
  const add = (load: MuscleLoad, c: Omit<Contributor, 'load'>) => {
    for (const [m, v] of Object.entries(load) as [MuscleId, number][]) (contributors[m] ??= []).push({ ...c, load: v });
  };
  const runLoads = runs.filter(inWindow).map((r) => {
    const l = runLoad(r);
    add(l, { kind: 'run', id: r.id, date: r.date, label: `${r.distanceKm} km ${r.type} run` });
    return l;
  });
  const strengthLoads = strength.filter(inWindow).map((s) => {
    const l = sessionLoad(s);
    const names = s.exercises.map((e) => exerciseById(e.exerciseId)?.name).filter(Boolean);
    add(l, { kind: 'strength', id: s.id, date: s.date, label: names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ') });
    return l;
  });
  const sportLoads = sessions.filter(inWindow).map((s) => {
    const l = sessionMuscleLoad(s);
    add(l, { kind: 'sport', id: s.id, date: s.date, label: workoutById(s.workoutId)?.name ?? s.sport });
    return l;
  });
  for (const list of Object.values(contributors)) list?.sort((a, b) => b.load - a.load);
  return { load: mergeLoads([...runLoads, ...strengthLoads, ...sportLoads]), strengthLoad: mergeLoads(strengthLoads), contributors };
}

/** 0..1 relative to the most-loaded muscle. */
export function intensities(load: MuscleLoad): MuscleLoad {
  const max = Math.max(0, ...Object.values(load).map((v) => v ?? 0));
  if (!max) return {};
  const out: MuscleLoad = {};
  for (const [m, v] of Object.entries(load) as [MuscleId, number][]) out[m] = v / max;
  return out;
}

/** Key runner strength areas. Core is abs + obliques. */
export const RUNNER_FOCUS: { id: string; label: string; muscles: MuscleId[] }[] = [
  { id: 'glutes', label: 'Glutes', muscles: ['glutes'] },
  { id: 'hamstrings', label: 'Hamstrings', muscles: ['hamstrings'] },
  { id: 'core', label: 'Core', muscles: ['abs', 'obliques'] },
  { id: 'calves', label: 'Calves', muscles: ['calves'] },
  { id: 'hipFlexors', label: 'Hip Flexors', muscles: ['hipFlexors'] },
];

export interface BalanceInsight {
  missing: { id: string; label: string }[];
  suggestions: Exercise[];
}

/** Runner focus areas with < 1 set of strength work in the window, plus up to 3 exercises that cover the most of them. */
export function balanceInsight(strengthLoad: MuscleLoad): BalanceInsight {
  const missing = RUNNER_FOCUS.filter((f) => f.muscles.reduce((s, m) => s + (strengthLoad[m] ?? 0), 0) < 1);
  const need = new Set(missing.flatMap((f) => f.muscles));
  const suggestions: Exercise[] = [];
  const covered = new Set<MuscleId>();
  for (let i = 0; i < 3 && need.size > covered.size; i++) {
    const best = EXERCISES.filter((e) => !suggestions.includes(e))
      .map((e) => ({ e, score: e.primary.filter((m) => need.has(m) && !covered.has(m)).length }))
      .sort((a, b) => b.score - a.score)[0];
    if (!best || best.score === 0) break;
    suggestions.push(best.e);
    best.e.primary.forEach((m) => covered.add(m));
  }
  return { missing: missing.map(({ id, label }) => ({ id, label })), suggestions };
}
