import { useMemo } from 'react';

import { todayISO } from './dates';
import { weeklyMuscles } from './muscles';
import { useStore } from './store';

export function useWeeklyMuscles() {
  const { runs, strength, sessions } = useStore();
  const today = todayISO();
  return useMemo(() => weeklyMuscles(runs, strength, today, 7, sessions), [runs, strength, sessions, today]);
}
