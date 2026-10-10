import { useMemo } from 'react';

import { todayISO } from './dates';
import { weeklyMuscles } from './muscles';
import { useStore } from './store';

export function useWeeklyMuscles() {
  const { runs, strength } = useStore();
  const today = todayISO();
  return useMemo(() => weeklyMuscles(runs, strength, today), [runs, strength, today]);
}
