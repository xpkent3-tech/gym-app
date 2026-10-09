export type BoardMetric = 'week' | 'marathon';

export interface BoardEntry {
  id: string;
  name: string;
  isYou: boolean;
  weekKm: number;
  /** Predicted/current marathon seconds, null when unknown. */
  marathonSec: number | null;
}

export interface Board {
  rows: (BoardEntry & { place: number })[];
  youPlace: number;
  aheadOf: number;
  friendCount: number;
  /** The entry directly above you and how far you are behind them (km, or seconds for marathon). */
  next: { name: string; gap: number } | null;
}

/** Ranks you and your friends. Higher week km is better; lower marathon time is better (unknown sorts last). */
export function buildBoard(entries: BoardEntry[], metric: BoardMetric): Board {
  const sorted = [...entries].sort((a, b) => {
    if (metric === 'week') return b.weekKm - a.weekKm || Number(b.isYou) - Number(a.isYou);
    const av = a.marathonSec ?? Infinity;
    const bv = b.marathonSec ?? Infinity;
    return av - bv || Number(b.isYou) - Number(a.isYou);
  });
  const rows = sorted.map((e, i) => ({ ...e, place: i + 1 }));
  const you = rows.find((r) => r.isYou);
  const friendCount = entries.length - (you ? 1 : 0);
  const youPlace = you?.place ?? 0;
  const above = you && youPlace > 1 ? rows[youPlace - 2] : null;
  const next =
    above && you
      ? {
          name: above.name,
          gap: metric === 'week' ? above.weekKm - you.weekKm : you.marathonSec === null ? Infinity : you.marathonSec - (above.marathonSec ?? 0),
        }
      : null;
  return { rows, youPlace, aheadOf: you ? friendCount - (youPlace - 1) : 0, friendCount, next };
}
