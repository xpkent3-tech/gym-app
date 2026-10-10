import type { MuscleId } from './muscles';

export interface Exercise {
  id: string;
  name: string;
  equipment: 'Bodyweight' | 'Barbell' | 'Dumbbell' | 'Machine' | 'Box' | 'Band';
  primary: MuscleId[];
  secondary: MuscleId[];
  cues: string[];
  why: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: 'back-squat',
    name: 'Back Squat',
    equipment: 'Barbell',
    primary: ['quads', 'glutes'],
    secondary: ['adductors', 'hamstrings', 'lowerBack', 'abs'],
    cues: ['Brace before you descend', 'Knees track over toes', 'Drive the floor away'],
    why: 'Builds the quad and glute strength that holds your form together late in a marathon.',
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    equipment: 'Dumbbell',
    primary: ['quads', 'glutes'],
    secondary: ['adductors', 'hamstrings', 'hipFlexors'],
    cues: ['Rear foot on a bench', 'Front shin near vertical', 'Control the descent'],
    why: 'Running is a single-leg sport; this fixes left/right imbalances.',
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    equipment: 'Barbell',
    primary: ['hamstrings', 'glutes'],
    secondary: ['lowerBack', 'forearms', 'upperBack'],
    cues: ['Soft knees, push hips back', 'Bar stays close to legs', 'Neutral spine'],
    why: 'Strong hamstrings resist the strains common in speed work.',
  },
  {
    id: 'single-leg-rdl',
    name: 'Single-Leg RDL',
    equipment: 'Dumbbell',
    primary: ['hamstrings', 'glutes'],
    secondary: ['lowerBack', 'abs', 'obliques'],
    cues: ['Hinge, back leg long', 'Hips square to the floor', 'Slow on the way down'],
    why: 'Trains hip stability and balance exactly like the stance phase of running.',
  },
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    equipment: 'Barbell',
    primary: ['glutes'],
    secondary: ['hamstrings', 'quads', 'adductors'],
    cues: ['Upper back on a bench', 'Chin tucked, ribs down', 'Squeeze at the top for 1 s'],
    why: 'Glutes drive hip extension; weak glutes are behind many knee and IT-band issues.',
  },
  {
    id: 'glute-bridge',
    name: 'Single-Leg Glute Bridge',
    equipment: 'Bodyweight',
    primary: ['glutes'],
    secondary: ['hamstrings', 'abs'],
    cues: ['Drive through the heel', 'Keep the pelvis level', 'Pause at the top'],
    why: 'Equipment-free glute activation, ideal before runs.',
  },
  {
    id: 'step-up',
    name: 'Step-Up',
    equipment: 'Box',
    primary: ['quads', 'glutes'],
    secondary: ['calves', 'hamstrings', 'hipFlexors'],
    cues: ['Whole foot on the box', 'Drive up without pushing off the back leg', 'Stand tall'],
    why: 'Builds hill-climbing power one leg at a time.',
  },
  {
    id: 'walking-lunge',
    name: 'Walking Lunge',
    equipment: 'Dumbbell',
    primary: ['quads', 'glutes'],
    secondary: ['hamstrings', 'adductors', 'hipFlexors', 'calves'],
    cues: ['Long stride', 'Back knee just above the floor', 'Torso upright'],
    why: 'Dynamic single-leg strength through a running-like range of motion.',
  },
  {
    id: 'nordic-curl',
    name: 'Nordic Hamstring Curl',
    equipment: 'Bodyweight',
    primary: ['hamstrings'],
    secondary: ['glutes', 'calves'],
    cues: ['Anchor your ankles', 'Lower as slowly as you can', 'Hips stay extended'],
    why: 'The best-evidenced exercise for preventing hamstring strains.',
  },
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    equipment: 'Machine',
    primary: ['calves'],
    secondary: ['tibialis'],
    cues: ['Full range: heels below the step', 'Pause at the top', '3 s down'],
    why: 'Calves absorb several times your body weight on every stride.',
  },
  {
    id: 'single-leg-calf-raise',
    name: 'Single-Leg Calf Raise',
    equipment: 'Bodyweight',
    primary: ['calves'],
    secondary: ['tibialis', 'abs'],
    cues: ['Hold a wall for balance', 'Straight knee', 'Slow and controlled'],
    why: 'Protects the Achilles, a classic marathon overuse injury.',
  },
  {
    id: 'tibialis-raise',
    name: 'Tibialis Raise',
    equipment: 'Bodyweight',
    primary: ['tibialis'],
    secondary: ['calves'],
    cues: ['Back against a wall, heels forward', 'Lift toes high', 'Lower slowly'],
    why: 'Strong shins help prevent shin splints as mileage builds.',
  },
  {
    id: 'plank',
    name: 'Plank',
    equipment: 'Bodyweight',
    primary: ['abs'],
    secondary: ['obliques', 'shoulders', 'lowerBack'],
    cues: ['Elbows under shoulders', 'Squeeze glutes', 'Straight line head to heel'],
    why: 'A stable trunk keeps your stride efficient when you are tired.',
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    equipment: 'Bodyweight',
    primary: ['obliques'],
    secondary: ['abs', 'glutes', 'shoulders'],
    cues: ['Stack feet and hips', 'Lift hips high', 'Don’t sag'],
    why: 'Lateral core strength limits hip drop on every footstrike.',
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    equipment: 'Bodyweight',
    primary: ['abs'],
    secondary: ['hipFlexors', 'obliques'],
    cues: ['Lower back pressed down', 'Opposite arm and leg', 'Exhale as you extend'],
    why: 'Teaches the core to stay stiff while the limbs move, like in running.',
  },
  {
    id: 'copenhagen-plank',
    name: 'Copenhagen Plank',
    equipment: 'Bodyweight',
    primary: ['adductors'],
    secondary: ['obliques', 'abs'],
    cues: ['Top leg on a bench', 'Body in a straight line', 'Start with the knee supported'],
    why: 'Strengthens the inner thigh and groin, often neglected by runners.',
  },
  {
    id: 'hanging-knee-raise',
    name: 'Hanging Knee Raise',
    equipment: 'Bodyweight',
    primary: ['hipFlexors', 'abs'],
    secondary: ['forearms', 'obliques'],
    cues: ['No swinging', 'Knees to chest', 'Lower under control'],
    why: 'Strong hip flexors keep your knee drive up in the final 10 km.',
  },
  {
    id: 'box-jump',
    name: 'Box Jump',
    equipment: 'Box',
    primary: ['quads', 'calves'],
    secondary: ['glutes', 'hamstrings'],
    cues: ['Swing arms', 'Land softly', 'Step down, don’t jump down'],
    why: 'Plyometrics improve running economy by making tendons springier.',
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    equipment: 'Bodyweight',
    primary: ['chest'],
    secondary: ['triceps', 'shoulders', 'abs'],
    cues: ['Hands under shoulders', 'Body rigid', 'Chest to the floor'],
    why: 'Upper-body endurance for a strong arm swing and posture.',
  },
  {
    id: 'dumbbell-row',
    name: 'Dumbbell Row',
    equipment: 'Dumbbell',
    primary: ['lats', 'upperBack'],
    secondary: ['biceps', 'shoulders', 'forearms'],
    cues: ['Flat back', 'Pull elbow to hip', 'Pause at the top'],
    why: 'Counters the hunched posture that creeps in on long runs.',
  },
];

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function searchExercises(query: string, muscle: MuscleId | null): Exercise[] {
  const q = query.trim().toLowerCase();
  return EXERCISES.filter((e) => (!q || e.name.toLowerCase().includes(q)) && (!muscle || e.primary.includes(muscle) || e.secondary.includes(muscle)));
}
