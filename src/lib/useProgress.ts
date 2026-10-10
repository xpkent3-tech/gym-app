import { useMemo } from 'react';

import { todayISO } from './dates';
import { progressOf, type Progress } from './progression';
import { useStore } from './store';

export function useProgress(): Progress | null {
  const { profile, runs, plan, friends, invitesSent, strength, sessions } = useStore();
  const today = todayISO();
  return useMemo(
    () => (profile ? progressOf({ profile, runs, plan, friends, invitesSent, strength, sessions }, today) : null),
    [profile, runs, plan, friends, invitesSent, strength, sessions, today],
  );
}
