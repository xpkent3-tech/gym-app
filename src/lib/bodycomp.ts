export interface BodyEntry {
  id: string;
  date: string;
  createdAt: number;
  weightKg: number;
  bodyFatPct?: number;
  source: 'manual' | 'health';
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function leanMassKg(weightKg: number, bodyFatPct?: number): number | null {
  return bodyFatPct === undefined ? null : r1(weightKg * (1 - bodyFatPct / 100));
}

export function bmi(weightKg: number, heightCm?: number): number | null {
  if (!heightCm) return null;
  const h = heightCm / 100;
  return r1(weightKg / (h * h));
}

/** Fat-free mass index, normalised to 1.8 m (Kouri et al.). ~19 average man, ~22+ well trained, ~25 natural ceiling. */
export function ffmi(weightKg: number, bodyFatPct?: number, heightCm?: number): number | null {
  const lean = leanMassKg(weightKg, bodyFatPct);
  if (lean === null || !heightCm) return null;
  const h = heightCm / 100;
  return r1(lean / (h * h) + 6.1 * (1.8 - h));
}

export function latestEntry(log: BodyEntry[]): BodyEntry | undefined {
  return [...log].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1))[0];
}

/** HealthKit reports body fat as a fraction (0.15); accept either form. */
export const normalizeBodyFat = (v: number) => (v <= 1 ? r1(v * 100) : r1(v));
