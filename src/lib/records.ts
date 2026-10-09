import type { Run } from './types';

export const RECORD_DISTANCES = [
  { key: '5k', label: '5K', km: 5 },
  { key: '10k', label: '10K', km: 10 },
  { key: 'half', label: 'Half', km: 21.0975 },
  { key: 'marathon', label: 'Marathon', km: 42.195 },
] as const;

export type RecordKey = (typeof RECORD_DISTANCES)[number]['key'];

/** GPS-free tolerance so a logged "21.1" counts as a half and "42.2" as a marathon. */
const TOLERANCE_KM = 0.05;

export function qualifies(run: Run, km: number): boolean {
  return run.distanceKm >= km - TOLERANCE_KM;
}

/** Equivalent time for a record distance at the run's average pace. */
export function effortTime(run: Run, km: number): number {
  return (run.durationSec / run.distanceKm) * km;
}

function chronological(a: Run, b: Run): number {
  return a.date === b.date ? a.createdAt - b.createdAt : a.date < b.date ? -1 : 1;
}

export interface PersonalRecord {
  key: RecordKey;
  label: string;
  km: number;
  timeSec: number;
  runId: string;
  date: string;
}

export function personalRecords(runs: Run[]): PersonalRecord[] {
  return RECORD_DISTANCES.flatMap((d) => {
    let best: PersonalRecord | null = null;
    for (const r of runs) {
      if (!qualifies(r, d.km)) continue;
      const t = effortTime(r, d.km);
      if (!best || t < best.timeSec) best = { key: d.key, label: d.label, km: d.km, timeSec: t, runId: r.id, date: r.date };
    }
    return best ? [best] : [];
  });
}

/** Labels of the records this run set at the time it was run (strictly faster than every earlier run). */
export function prsSetBy(run: Run, runs: Run[]): string[] {
  const earlier = runs.filter((r) => r.id !== run.id && chronological(r, run) < 0);
  return RECORD_DISTANCES.filter((d) => {
    if (!qualifies(run, d.km)) return false;
    const t = effortTime(run, d.km);
    return earlier.every((r) => !qualifies(r, d.km) || effortTime(r, d.km) > t);
  }).map((d) => d.label);
}
