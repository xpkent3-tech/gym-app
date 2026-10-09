export interface Stopwatch {
  startedAt: number | null;
  pausedAt: number | null;
  pausedTotal: number;
  /** Elapsed ms at each lap press. */
  laps: number[];
}

export const IDLE: Stopwatch = { startedAt: null, pausedAt: null, pausedTotal: 0, laps: [] };

export function elapsed(sw: Stopwatch, now: number): number {
  if (sw.startedAt === null) return 0;
  return (sw.pausedAt ?? now) - sw.startedAt - sw.pausedTotal;
}

export const isRunning = (sw: Stopwatch) => sw.startedAt !== null && sw.pausedAt === null;

export function start(sw: Stopwatch, now: number): Stopwatch {
  return sw.startedAt === null ? { ...sw, startedAt: now } : sw;
}

export function pause(sw: Stopwatch, now: number): Stopwatch {
  return isRunning(sw) ? { ...sw, pausedAt: now } : sw;
}

export function resume(sw: Stopwatch, now: number): Stopwatch {
  return sw.pausedAt === null ? sw : { ...sw, pausedTotal: sw.pausedTotal + (now - sw.pausedAt), pausedAt: null };
}

export function lap(sw: Stopwatch, now: number): Stopwatch {
  return isRunning(sw) ? { ...sw, laps: [...sw.laps, elapsed(sw, now)] } : sw;
}

/** Durations of each lap (difference between consecutive lap marks), in ms. */
export function splits(sw: Stopwatch): number[] {
  return sw.laps.map((t, i) => t - (i ? sw.laps[i - 1] : 0));
}
