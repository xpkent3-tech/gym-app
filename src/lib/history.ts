import { addDays, startOfWeek } from './dates';
import type { Run } from './types';

export interface WeekTotal {
  start: string;
  km: number;
  isCurrent: boolean;
}

/** Distance per Monday-based week for the last `weeks` weeks, oldest first. */
export function weeklyTotals(runs: Run[], today: string, weeks = 8): WeekTotal[] {
  const current = startOfWeek(today);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(current, -7 * (weeks - 1 - i));
    const end = addDays(start, 7);
    const km = runs.filter((r) => r.date >= start && r.date < end).reduce((s, r) => s + r.distanceKm, 0);
    return { start, km, isCurrent: start === current };
  });
}
