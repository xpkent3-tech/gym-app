import { addDays, weekdayShort } from './dates';
import { codeFrom, hash, seeded } from './random';
import { topPercentForTime } from './rank';
import type { Run, RunType, Sex } from './types';

export interface Runner {
  id: string;
  name: string;
  handle: string;
  code: string;
  sex: Sex;
  age: number;
  city: string;
  color: string;
  /** Current marathon ability in seconds. */
  marathonSec: number;
  weeklyKm: number;
}

export interface FriendRun extends Run {
  runnerId: string;
}

const h = (hh: number, mm: number) => hh * 3600 + mm * 60;

const SEED: Omit<Runner, 'id' | 'code'>[] = [
  { name: 'Maya Chen', handle: 'mayaruns', sex: 'female', age: 29, city: 'Singapore', color: '#FF5C7A', marathonSec: h(3, 32), weeklyKm: 58 },
  { name: 'Leo Martins', handle: 'leo.m', sex: 'male', age: 34, city: 'Lisbon', color: '#4C9EFF', marathonSec: h(3, 5), weeklyKm: 72 },
  { name: 'Aisha Bello', handle: 'aishab', sex: 'female', age: 41, city: 'Lagos', color: '#3DDC97', marathonSec: h(4, 10), weeklyKm: 40 },
  { name: 'Tom Becker', handle: 'tombecker', sex: 'male', age: 27, city: 'Berlin', color: '#FFB020', marathonSec: h(3, 48), weeklyKm: 45 },
  { name: 'Hana Sato', handle: 'hana.s', sex: 'female', age: 36, city: 'Tokyo', color: '#B37BFF', marathonSec: h(3, 15), weeklyKm: 66 },
  { name: 'Diego Ruiz', handle: 'diegoruiz', sex: 'male', age: 45, city: 'Madrid', color: '#3DDCD0', marathonSec: h(3, 39), weeklyKm: 52 },
  { name: 'Priya Nair', handle: 'priyaruns', sex: 'female', age: 31, city: 'Bengaluru', color: '#FF8A3D', marathonSec: h(4, 28), weeklyKm: 34 },
  { name: 'Sam Okafor', handle: 'samok', sex: 'male', age: 38, city: 'London', color: '#7BD3FF', marathonSec: h(2, 58), weeklyKm: 85 },
  { name: 'Emma Larsen', handle: 'emmal', sex: 'female', age: 25, city: 'Oslo', color: '#FFD54A', marathonSec: h(3, 55), weeklyKm: 48 },
  { name: 'Marcus Lee', handle: 'marcuslee', sex: 'male', age: 52, city: 'Seattle', color: '#9AA4B2', marathonSec: h(4, 2), weeklyKm: 44 },
  { name: 'Sofia Rossi', handle: 'sofiar', sex: 'female', age: 33, city: 'Milan', color: '#FF6FB5', marathonSec: h(4, 45), weeklyKm: 30 },
  { name: 'Kenji Ito', handle: 'kenji', sex: 'male', age: 30, city: 'Osaka', color: '#5BE37D', marathonSec: h(3, 22), weeklyKm: 64 },
  { name: 'Grace Kim', handle: 'gracek', sex: 'female', age: 47, city: 'Seoul', color: '#C59BFF', marathonSec: h(3, 58), weeklyKm: 50 },
  { name: 'Noah Brown', handle: 'noahb', sex: 'male', age: 23, city: 'Austin', color: '#FF7A59', marathonSec: h(4, 35), weeklyKm: 28 },
  { name: 'Zoe Dubois', handle: 'zoed', sex: 'female', age: 28, city: 'Paris', color: '#59C3FF', marathonSec: h(3, 41), weeklyKm: 55 },
  { name: 'Omar Haddad', handle: 'omarh', sex: 'male', age: 40, city: 'Dubai', color: '#E3C35B', marathonSec: h(3, 29), weeklyKm: 60 },
  { name: 'Lucy Walsh', handle: 'lucyw', sex: 'female', age: 55, city: 'Dublin', color: '#8BE38B', marathonSec: h(4, 20), weeklyKm: 42 },
  { name: 'Arjun Mehta', handle: 'arjunm', sex: 'male', age: 35, city: 'Mumbai', color: '#FF9F9F', marathonSec: h(4, 50), weeklyKm: 26 },
  { name: 'Nina Petrova', handle: 'ninap', sex: 'female', age: 39, city: 'Prague', color: '#9F9FFF', marathonSec: h(3, 26), weeklyKm: 63 },
  { name: 'Ben Carter', handle: 'bencarter', sex: 'male', age: 29, city: 'Sydney', color: '#FFC14D', marathonSec: h(3, 12), weeklyKm: 70 },
  { name: 'Chloe Martin', handle: 'chloem', sex: 'female', age: 22, city: 'Montreal', color: '#4DFFC1', marathonSec: h(5, 5), weeklyKm: 24 },
  { name: 'Ivan Novak', handle: 'ivann', sex: 'male', age: 60, city: 'Zagreb', color: '#B0B0B0', marathonSec: h(4, 15), weeklyKm: 46 },
  { name: 'Ruth Asante', handle: 'rutha', sex: 'female', age: 44, city: 'Accra', color: '#FF8FD8', marathonSec: h(3, 49), weeklyKm: 51 },
  { name: 'Felix Wagner', handle: 'felixw', sex: 'male', age: 32, city: 'Vienna', color: '#8FD8FF', marathonSec: h(4, 0), weeklyKm: 38 },
];

export const RUNNERS: Runner[] = SEED.map((r) => ({ ...r, id: r.handle, code: codeFrom(`runner:${r.handle}`) }));

export function normalizeCode(input: string): string {
  const s = input.trim().toUpperCase().replace(/\s+/g, '');
  return s.startsWith('STR-') ? s : s.startsWith('STR') ? `STR-${s.slice(3)}` : `STR-${s}`;
}

export function runnerById(id: string): Runner | undefined {
  return RUNNERS.find((r) => r.id === id);
}

export function runnerByCode(code: string): Runner | undefined {
  const c = normalizeCode(code);
  return RUNNERS.find((r) => r.code === c);
}

export function searchRunners(query: string): Runner[] {
  const q = query.trim().toLowerCase().replace(/^@/, '');
  if (!q) return [];
  return RUNNERS.filter((r) => r.name.toLowerCase().includes(q) || r.handle.toLowerCase().includes(q));
}

export function runnerTopPct(r: Runner): number {
  return topPercentForTime(r.marathonSec, r.sex, r.age);
}

/** Non-friends with the closest percentile to the user (or a varied mix when unranked). */
export function suggestedRunners(friendIds: string[], userTopPct: number | null, n = 5): Runner[] {
  const pool = RUNNERS.filter((r) => !friendIds.includes(r.id));
  const target = userTopPct ?? 35;
  return [...pool].sort((a, b) => Math.abs(runnerTopPct(a) - target) - Math.abs(runnerTopPct(b) - target)).slice(0, n);
}

export function userFriendCode(name: string, createdAt: number): string {
  return codeFrom(`user:${name.toLowerCase()}:${createdAt}`);
}

const PACE_FACTOR: Record<RunType, number> = { easy: 1.2, long: 1.15, tempo: 0.97, intervals: 0.93, recovery: 1.3, race: 0.98 };

/** Deterministic simulated runs for a runner over the `days` days ending `today`. */
export function runnerActivity(r: Runner, today: string, days = 14): FriendRun[] {
  const marathonPace = r.marathonSec / 42.195;
  const runsPerWeek = Math.min(6, Math.max(3, Math.round(r.weeklyKm / 11)));
  const out: FriendRun[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(today, -i);
    const rnd = seeded(hash(`${r.id}:${date}`));
    const dow = weekdayShort(date);
    const isLongDay = dow === (r.age % 2 ? 'Sun' : 'Sat');
    // One long run (~30% of volume) plus (runsPerWeek - 1) shorter runs spread over the other 6 days.
    if (!isLongDay && rnd() > (runsPerWeek - 1) / 6) continue;
    let type: RunType;
    let km: number;
    if (isLongDay) {
      type = 'long';
      km = r.weeklyKm * (0.26 + rnd() * 0.08);
    } else {
      const roll = rnd();
      type = roll < 0.18 ? 'tempo' : roll < 0.32 ? 'intervals' : roll < 0.42 ? 'recovery' : 'easy';
      km = ((r.weeklyKm * 0.7) / (runsPerWeek - 1)) * (type === 'recovery' ? 0.7 : 0.85 + rnd() * 0.3);
    }
    km = Math.max(3, Math.round(km * 10) / 10);
    const pace = marathonPace * PACE_FACTOR[type] * (0.96 + rnd() * 0.08);
    out.push({
      id: `${r.id}:${date}`,
      runnerId: r.id,
      date,
      createdAt: 0,
      type,
      distanceKm: km,
      durationSec: Math.round(km * pace),
      effort: type === 'intervals' || type === 'tempo' ? 8 : 4,
      notes: '',
    });
  }
  return out;
}

export function baselineKudos(activityId: string): number {
  return hash(`kudos:${activityId}`) % 7;
}

export function friendsFeed(friendIds: string[], today: string, days = 14): FriendRun[] {
  return friendIds
    .map(runnerById)
    .filter((r): r is Runner => !!r)
    .flatMap((r) => runnerActivity(r, today, days))
    .sort((a, b) => (a.date === b.date ? a.runnerId.localeCompare(b.runnerId) : a.date < b.date ? 1 : -1));
}
