import { addDays, diffDays, startOfWeek } from './dates';
import type { Experience, Profile, Run, RunType } from './types';

export const MIN_WEEKS = 12;
export const MAX_WEEKS = 20;

export type Phase = 'Base' | 'Build' | 'Peak' | 'Taper' | 'Race';

export interface PlanSession {
  date: string;
  type: RunType;
  distanceKm: number;
  title: string;
  description: string;
}

export interface PlanWeek {
  index: number;
  start: string;
  phase: Phase;
  targetKm: number;
  sessions: PlanSession[];
}

export function planWeeksFor(today: string, raceDate: string): number {
  const weeks = Math.floor(diffDays(startOfWeek(today), startOfWeek(raceDate)) / 7) + 1;
  return Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, weeks));
}

/** Monday the plan starts on, for a runner onboarding today. */
export function planStartFor(today: string, raceDate: string): string {
  return addDays(startOfWeek(raceDate), -7 * (planWeeksFor(today, raceDate) - 1));
}

const PEAK_MULT: Record<Experience, number> = { beginner: 1.0, intermediate: 1.1, advanced: 1.25 };
const half = (n: number) => Math.max(0, Math.round(n * 2) / 2);

export function peakKm(weeklyKm: number, experience: Experience): number {
  const base = Math.max(15, weeklyKm);
  return Math.min(100, Math.round(Math.max(base * 1.6, 45) * PEAK_MULT[experience]));
}

function session(date: string, type: RunType, km: number, weekIdx: number): PlanSession {
  const k = half(km);
  switch (type) {
    case 'long':
      return { date, type, distanceKm: k, title: 'Long Run', description: `${k} km conversational. Practise race fuelling every 40 min.` };
    case 'tempo': {
      const core = half(Math.max(3, k - 4));
      return { date, type, distanceKm: k, title: 'Tempo Run', description: `2 km warm-up, ${core} km at half-marathon effort, 2 km cool-down.` };
    }
    case 'intervals': {
      const reps = Math.min(10, Math.max(4, Math.round(k / 1.6)));
      const rep = weekIdx % 4 === 1 ? '1 km' : '800 m';
      return { date, type, distanceKm: k, title: 'Intervals', description: `Warm up, then ${reps} × ${rep} at 5K–10K pace with 400 m jog recoveries.` };
    }
    case 'recovery':
      return { date, type, distanceKm: k, title: 'Recovery Run', description: `${k} km very easy. Slower than you think.` };
    case 'race':
      return { date, type, distanceKm: k, title: 'Race Day 🏁', description: 'Marathon! Start conservatively, fuel early, finish strong.' };
    default:
      return { date, type, distanceKm: k, title: 'Easy Run', description: `${k} km easy, finish with 4–6 × 20 s strides.` };
  }
}

function raceWeek(start: string, raceDate: string, index: number, targetKm: number): PlanWeek {
  const sessions = [
    session(addDays(raceDate, -5), 'easy', 8, index),
    session(addDays(raceDate, -3), 'easy', 6, index),
    session(addDays(raceDate, -1), 'recovery', 3, index),
  ].filter((s) => s.date >= start);
  sessions.push(session(raceDate, 'race', 42.195, index));
  return { index, start, phase: 'Race', targetKm, sessions };
}

export function generatePlan(profile: Pick<Profile, 'planStart' | 'raceDate' | 'weeklyKm' | 'experience'>): PlanWeek[] {
  const raceMonday = startOfWeek(profile.raceDate);
  const n = Math.floor(diffDays(profile.planStart, raceMonday) / 7) + 1;
  const base = Math.max(15, profile.weeklyKm);
  const peak = peakKm(profile.weeklyKm, profile.experience);
  const buildWeeks = n - 2;
  const weeks: PlanWeek[] = [];

  for (let i = 0; i < n; i++) {
    const start = addDays(profile.planStart, i * 7);
    if (i === n - 1) {
      weeks.push(raceWeek(start, profile.raceDate, i, Math.round(peak * 0.5)));
      continue;
    }
    let target: number;
    let phase: Phase;
    if (i === n - 2) {
      target = peak * 0.75;
      phase = 'Taper';
    } else {
      target = base + (peak - base) * (buildWeeks > 1 ? i / (buildWeeks - 1) : 1);
      const isCutback = (i + 1) % 4 === 0 && i < buildWeeks - 1;
      if (isCutback) target *= 0.75;
      phase = i < buildWeeks * 0.4 ? 'Base' : i < buildWeeks * 0.8 ? 'Build' : 'Peak';
    }
    target = Math.round(target);

    const long = Math.min(35, target * 0.32);
    const quality = target * 0.18;
    const rest = target - long - quality;
    const qualityType: RunType = phase === 'Base' ? (i % 2 === 0 ? 'easy' : 'tempo') : i % 2 === 0 ? 'intervals' : 'tempo';
    const sessions: PlanSession[] = [session(addDays(start, 1), qualityType, quality, i)];
    if (target >= 45) {
      sessions.push(session(addDays(start, 2), 'recovery', rest * 0.25, i));
      sessions.push(session(addDays(start, 3), 'easy', rest * 0.4, i));
      sessions.push(session(addDays(start, 5), 'easy', rest * 0.35, i));
    } else {
      sessions.push(session(addDays(start, 3), 'easy', rest * 0.55, i));
      sessions.push(session(addDays(start, 5), 'easy', rest * 0.45, i));
    }
    sessions.push(session(addDays(start, 6), 'long', long, i));
    weeks.push({ index: i, start, phase, targetKm: target, sessions });
  }
  return weeks;
}

export function weekVolume(week: PlanWeek): number {
  return week.sessions.reduce((s, x) => s + x.distanceKm, 0);
}

export function isSessionDone(s: PlanSession, runs: Run[]): boolean {
  return runs.some((r) => r.date === s.date);
}

export function weekProgress(week: PlanWeek, runs: Run[]): { done: number; total: number } {
  return { done: week.sessions.filter((s) => isSessionDone(s, runs)).length, total: week.sessions.length };
}

export type TodayStatus =
  | { kind: 'before-plan'; daysUntilStart: number }
  | { kind: 'session'; session: PlanSession; week: PlanWeek }
  | { kind: 'rest'; week: PlanWeek; next: PlanSession | null }
  | { kind: 'after-race' };

export function todayStatus(plan: PlanWeek[], today: string): TodayStatus {
  if (!plan.length) return { kind: 'after-race' };
  if (today < plan[0].start) return { kind: 'before-plan', daysUntilStart: diffDays(today, plan[0].start) };
  const week = plan.find((w) => today >= w.start && today < addDays(w.start, 7));
  if (!week) return { kind: 'after-race' };
  const s = week.sessions.find((x) => x.date === today);
  if (s) return { kind: 'session', session: s, week };
  const next = plan.flatMap((w) => w.sessions).find((x) => x.date > today) ?? null;
  return { kind: 'rest', week, next };
}

export function currentWeekIndex(plan: PlanWeek[], today: string): number {
  const i = plan.findIndex((w) => today >= w.start && today < addDays(w.start, 7));
  if (i >= 0) return i;
  return plan.length && today < plan[0].start ? 0 : plan.length - 1;
}
