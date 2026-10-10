import { addDays } from './dates';
import type { MuscleId, MuscleLoad } from './muscles';
import { formatDuration } from './pace';

export type SportId = 'running' | 'strength' | 'hyrox' | 'crossfit' | 'football';

export const SPORTS: { id: SportId; label: string; emoji: string; color: string; tagline: string }[] = [
  { id: 'running', label: 'Running', emoji: '🏃', color: '#3DDC97', tagline: 'Road races to marathons' },
  { id: 'strength', label: 'Strength', emoji: '🏋️', color: '#4C9EFF', tagline: 'Gym sessions, Hevy-style' },
  { id: 'hyrox', label: 'HYROX', emoji: '🔥', color: '#FFB020', tagline: '8 × 1 km + 8 stations' },
  { id: 'crossfit', label: 'CrossFit', emoji: '⚡', color: '#FF5C7A', tagline: 'WODs and benchmarks' },
  { id: 'football', label: 'Football', emoji: '⚽', color: '#B37BFF', tagline: 'Matches and training' },
];

export const sportMeta = (id: SportId) => SPORTS.find((s) => s.id === id)!;

/** Sports logged through the generic sport-session form. */
export type SessionSport = Extract<SportId, 'hyrox' | 'crossfit' | 'football'>;
export const SESSION_SPORTS: SessionSport[] = ['hyrox', 'crossfit', 'football'];

export type WorkoutFormat = 'time' | 'amrap' | 'duration';

export interface SportWorkout {
  id: string;
  sport: SessionSport;
  name: string;
  format: WorkoutFormat;
  defaultMin: number;
  description: string;
  /** Relative recruitment per muscle, 0..1. */
  muscles: MuscleLoad;
  /** Benchmark key for ranking (CrossFit) or 'hyrox-race'. */
  benchmark?: string;
  /** Show the 8-station split inputs (HYROX race). */
  splits?: boolean;
  /** Show football match fields. */
  match?: boolean;
}

export const HYROX_STATIONS: { id: string; name: string; muscles: MuscleId[] }[] = [
  { id: 'ski', name: '1000 m SkiErg', muscles: ['lats', 'triceps', 'abs', 'shoulders'] },
  { id: 'push', name: '50 m Sled Push', muscles: ['quads', 'glutes', 'calves', 'triceps'] },
  { id: 'pull', name: '50 m Sled Pull', muscles: ['upperBack', 'lats', 'biceps', 'hamstrings', 'forearms'] },
  { id: 'bbj', name: '80 m Burpee Broad Jumps', muscles: ['quads', 'glutes', 'chest', 'shoulders', 'calves'] },
  { id: 'row', name: '1000 m Row', muscles: ['lats', 'upperBack', 'quads', 'glutes', 'hamstrings'] },
  { id: 'carry', name: '200 m Farmers Carry', muscles: ['forearms', 'traps', 'abs', 'obliques'] },
  { id: 'lunge', name: '100 m Sandbag Lunges', muscles: ['quads', 'glutes', 'adductors'] },
  { id: 'wallball', name: '100 Wall Balls', muscles: ['quads', 'glutes', 'shoulders', 'triceps'] },
];

const RUN_MUSCLES: MuscleLoad = { calves: 0.8, quads: 0.7, hamstrings: 0.6, glutes: 0.6, hipFlexors: 0.6, tibialis: 0.3 };

function blend(...parts: [MuscleLoad, number][]): MuscleLoad {
  const out: MuscleLoad = {};
  for (const [load, w] of parts) for (const [m, v] of Object.entries(load) as [MuscleId, number][]) out[m] = Math.min(1, (out[m] ?? 0) + v * w);
  return out;
}
const stations = (ids?: string[]): MuscleLoad => {
  const out: MuscleLoad = {};
  for (const s of HYROX_STATIONS.filter((x) => !ids || ids.includes(x.id))) for (const m of s.muscles) out[m] = (out[m] ?? 0) + 0.25;
  return out;
};

export const WORKOUTS: SportWorkout[] = [
  // HYROX
  {
    id: 'hyrox-race',
    sport: 'hyrox',
    name: 'HYROX Race / Simulation',
    format: 'time',
    defaultMin: 90,
    description: '8 × 1 km run, each followed by a station: SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps, Row, Farmers Carry, Sandbag Lunges, Wall Balls.',
    muscles: blend([RUN_MUSCLES, 1], [stations(), 1]),
    benchmark: 'hyrox-race',
    splits: true,
  },
  {
    id: 'hyrox-compromised',
    sport: 'hyrox',
    name: 'Compromised Running',
    format: 'time',
    defaultMin: 45,
    description: '4 rounds: 1 km run at race pace + 1 station (Sled Push, Wall Balls, Lunges, Burpee Broad Jumps). Teaches you to run on tired legs.',
    muscles: blend([RUN_MUSCLES, 1], [stations(['push', 'wallball', 'lunge', 'bbj']), 1]),
  },
  {
    id: 'hyrox-stations',
    sport: 'hyrox',
    name: 'Station Practice',
    format: 'duration',
    defaultMin: 50,
    description: 'Technique and strength-endurance on the heavy stations: sled push, sled pull, farmers carry, sandbag lunges.',
    muscles: stations(['push', 'pull', 'carry', 'lunge']),
  },
  {
    id: 'hyrox-engine',
    sport: 'hyrox',
    name: 'Engine: Ski + Row Intervals',
    format: 'duration',
    defaultMin: 40,
    description: '6 × (500 m SkiErg + 500 m Row), 90 s rest. Builds the aerobic engine for the erg stations.',
    muscles: stations(['ski', 'row']),
  },
  {
    id: 'hyrox-wallballs',
    sport: 'hyrox',
    name: 'Wall Ball Volume',
    format: 'time',
    defaultMin: 20,
    description: '100 wall balls for time (6/4 kg). Break into sets you can sustain; no-reps cost seconds on race day.',
    muscles: stations(['wallball']),
  },
  // CrossFit
  {
    id: 'cf-fran',
    sport: 'crossfit',
    name: 'Fran',
    format: 'time',
    defaultMin: 10,
    description: '21-15-9 Thrusters (43/30 kg) and Pull-ups, for time.',
    muscles: { quads: 0.9, glutes: 0.7, shoulders: 0.9, triceps: 0.7, lats: 0.9, biceps: 0.7, abs: 0.5, forearms: 0.5 },
    benchmark: 'fran',
  },
  {
    id: 'cf-grace',
    sport: 'crossfit',
    name: 'Grace',
    format: 'time',
    defaultMin: 10,
    description: '30 Clean & Jerks (61/43 kg) for time.',
    muscles: { quads: 0.8, glutes: 0.8, hamstrings: 0.6, shoulders: 0.9, traps: 0.8, triceps: 0.6, lowerBack: 0.5, abs: 0.4 },
    benchmark: 'grace',
  },
  {
    id: 'cf-helen',
    sport: 'crossfit',
    name: 'Helen',
    format: 'time',
    defaultMin: 15,
    description: '3 rounds for time: 400 m Run, 21 Kettlebell Swings (24/16 kg), 12 Pull-ups.',
    muscles: blend([RUN_MUSCLES, 0.6], [{ glutes: 0.8, hamstrings: 0.8, lowerBack: 0.5, lats: 0.8, biceps: 0.6, forearms: 0.6, shoulders: 0.4 }, 1]),
    benchmark: 'helen',
  },
  {
    id: 'cf-cindy',
    sport: 'crossfit',
    name: 'Cindy',
    format: 'amrap',
    defaultMin: 20,
    description: 'AMRAP 20 min: 5 Pull-ups, 10 Push-ups, 15 Air Squats.',
    muscles: { lats: 0.8, biceps: 0.6, chest: 0.8, triceps: 0.7, shoulders: 0.5, quads: 0.8, glutes: 0.6, abs: 0.5 },
    benchmark: 'cindy',
  },
  {
    id: 'cf-murph',
    sport: 'crossfit',
    name: 'Murph',
    format: 'time',
    defaultMin: 55,
    description: '1 mile Run, 100 Pull-ups, 200 Push-ups, 300 Squats, 1 mile Run (partition as needed).',
    muscles: blend([RUN_MUSCLES, 0.8], [{ lats: 0.9, biceps: 0.7, chest: 0.9, triceps: 0.8, shoulders: 0.6, quads: 0.8, glutes: 0.6, abs: 0.5 }, 1]),
    benchmark: 'murph',
  },
  {
    id: 'cf-fortime',
    sport: 'crossfit',
    name: 'Custom WOD · For Time',
    format: 'time',
    defaultMin: 20,
    description: 'Any couplet/triplet for time. Describe it in the notes.',
    muscles: { quads: 0.6, glutes: 0.6, shoulders: 0.6, lats: 0.5, chest: 0.4, abs: 0.5, hamstrings: 0.4 },
  },
  {
    id: 'cf-amrap',
    sport: 'crossfit',
    name: 'Custom WOD · AMRAP',
    format: 'amrap',
    defaultMin: 15,
    description: 'As many rounds as possible. Describe the movements in the notes.',
    muscles: { quads: 0.6, glutes: 0.6, shoulders: 0.6, lats: 0.5, chest: 0.4, abs: 0.5, hamstrings: 0.4 },
  },
  {
    id: 'cf-emom',
    sport: 'crossfit',
    name: 'Custom WOD · EMOM',
    format: 'duration',
    defaultMin: 16,
    description: 'Every minute on the minute. Describe the movements in the notes.',
    muscles: { quads: 0.5, glutes: 0.5, shoulders: 0.5, lats: 0.4, chest: 0.4, abs: 0.5 },
  },
  // Football
  {
    id: 'fb-match',
    sport: 'football',
    name: 'Match',
    format: 'duration',
    defaultMin: 90,
    description: 'Competitive game. Log minutes played, goals and how hard it felt.',
    muscles: { quads: 0.9, hamstrings: 0.9, adductors: 0.9, calves: 0.8, glutes: 0.7, hipFlexors: 0.8, abs: 0.4, obliques: 0.4, tibialis: 0.4 },
    match: true,
  },
  {
    id: 'fb-training',
    sport: 'football',
    name: 'Team Training',
    format: 'duration',
    defaultMin: 75,
    description: 'Rondos, small-sided games, tactical work.',
    muscles: { quads: 0.7, hamstrings: 0.6, adductors: 0.8, calves: 0.6, glutes: 0.5, hipFlexors: 0.6, abs: 0.3, obliques: 0.3 },
  },
  {
    id: 'fb-speed',
    sport: 'football',
    name: 'Speed & Agility',
    format: 'duration',
    defaultMin: 45,
    description: 'Acceleration, max-velocity sprints, change of direction, ladders. Full recovery between reps.',
    muscles: { hamstrings: 0.9, glutes: 0.8, calves: 0.9, quads: 0.7, hipFlexors: 0.9, adductors: 0.6 },
  },
  {
    id: 'fb-conditioning',
    sport: 'football',
    name: 'Repeated-Sprint Conditioning',
    format: 'duration',
    defaultMin: 40,
    description: '3 sets × 6 × 30 m shuttle sprints, 20 s between reps. Builds the ability to sprint again and again.',
    muscles: { quads: 0.8, hamstrings: 0.8, calves: 0.8, glutes: 0.7, hipFlexors: 0.7, adductors: 0.7 },
  },
];

export const workoutById = (id: string) => WORKOUTS.find((w) => w.id === id);
export const workoutsFor = (sport: SessionSport) => WORKOUTS.filter((w) => w.sport === sport);

export interface SportSession {
  id: string;
  date: string;
  createdAt: number;
  sport: SessionSport;
  workoutId: string;
  durationMin: number;
  rpe: number;
  resultSec?: number;
  rounds?: number;
  reps?: number;
  /** HYROX station id → seconds. */
  splits?: Record<string, number>;
  minutesPlayed?: number;
  goals?: number;
  notes: string;
}

export function sessionMuscleLoad(s: SportSession): MuscleLoad {
  const w = workoutById(s.workoutId);
  if (!w) return {};
  const k = (s.durationMin / 10) * (s.rpe / 10);
  const out: MuscleLoad = {};
  for (const [m, v] of Object.entries(w.muscles) as [MuscleId, number][]) out[m] = v * k;
  return out;
}

export function resultLabel(s: SportSession): string {
  const w = workoutById(s.workoutId);
  if (!w) return '';
  if (w.format === 'time' && s.resultSec) return formatDuration(s.resultSec);
  if (w.format === 'amrap' && s.rounds !== undefined) return `${s.rounds} rds${s.reps ? ` + ${s.reps}` : ''}`;
  return `${s.durationMin} min`;
}

/** Session-RPE training load (Foster): minutes × RPE. */
export const sessionLoadAU = (s: SportSession) => s.durationMin * s.rpe;

export function weeklyLoad(sessions: SportSession[], sport: SessionSport, today: string, days = 7): number {
  const from = addDays(today, -(days - 1));
  return sessions.filter((s) => s.sport === sport && s.date >= from && s.date <= today).reduce((sum, s) => sum + sessionLoadAU(s), 0);
}

/** Two library workouts to suggest this week for a sport, rotating weekly. */
export function weeklySuggestions(sport: SessionSport, weekIndex: number): SportWorkout[] {
  const list = workoutsFor(sport).filter((w) => !w.id.includes('custom') && !w.name.startsWith('Custom'));
  const a = list[(weekIndex * 2) % list.length];
  const b = list[(weekIndex * 2 + 1) % list.length];
  return a.id === b.id ? [a] : [a, b];
}
