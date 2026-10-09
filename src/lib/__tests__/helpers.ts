import type { Run } from '../types';

let n = 0;
export function run(p: Partial<Run> & Pick<Run, 'distanceKm' | 'durationSec'>): Run {
  n += 1;
  return { id: `r${n}`, date: '2026-10-01', createdAt: n, type: 'easy', effort: 5, notes: '', ...p };
}
