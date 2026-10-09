export type Sex = 'male' | 'female';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type RunType = 'easy' | 'long' | 'tempo' | 'intervals' | 'recovery' | 'race';

export interface Run {
  id: string;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  createdAt: number;
  type: RunType;
  distanceKm: number;
  durationSec: number;
  /** Perceived effort, 1–10. */
  effort: number;
  notes: string;
}

export interface RaceResult {
  distanceKm: number;
  durationSec: number;
}

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  experience: Experience;
  weeklyKm: number;
  raceDate: string;
  /** Monday the plan starts on, fixed at onboarding so the plan is stable. */
  planStart: string;
  raceResult?: RaceResult;
  createdAt: number;
  /** Shareable code others use to add you, e.g. STR-4F2A9Q. */
  friendCode?: string;
}

export const RUN_TYPES: { type: RunType; label: string; color: string }[] = [
  { type: 'easy', label: 'Easy', color: '#3DDC97' },
  { type: 'long', label: 'Long', color: '#4C9EFF' },
  { type: 'tempo', label: 'Tempo', color: '#FFB020' },
  { type: 'intervals', label: 'Intervals', color: '#FF5C7A' },
  { type: 'recovery', label: 'Recovery', color: '#9AA4B2' },
  { type: 'race', label: 'Race', color: '#B37BFF' },
];

export function runTypeMeta(type: RunType) {
  return RUN_TYPES.find((t) => t.type === type) ?? RUN_TYPES[0];
}
