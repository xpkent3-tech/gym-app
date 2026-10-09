import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';

import { generatePlan, type PlanWeek } from './plan';
import type { Profile, Run } from './types';

const STORAGE_KEY = 'stride:v1';

export interface AppData {
  profile: Profile | null;
  runs: Run[];
}

type Action =
  | { type: 'hydrate'; data: AppData }
  | { type: 'setProfile'; profile: Profile }
  | { type: 'addRun'; run: Run }
  | { type: 'deleteRun'; id: string }
  | { type: 'reset' };

interface State extends AppData {
  hydrated: boolean;
}

const EMPTY: AppData = { profile: null, runs: [] };

function sortRuns(runs: Run[]): Run[] {
  return [...runs].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...action.data, runs: sortRuns(action.data.runs), hydrated: true };
    case 'setProfile':
      return { ...state, profile: action.profile };
    case 'addRun':
      return { ...state, runs: sortRuns([action.run, ...state.runs]) };
    case 'deleteRun':
      return { ...state, runs: state.runs.filter((r) => r.id !== action.id) };
    case 'reset':
      return { ...EMPTY, hydrated: true };
  }
}

interface Store extends State {
  plan: PlanWeek[];
  setProfile: (p: Profile) => void;
  addRun: (r: Run) => void;
  deleteRun: (id: string) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ...EMPTY, hydrated: false });
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const data = raw ? (JSON.parse(raw) as Partial<AppData>) : {};
        dispatch({ type: 'hydrate', data: { ...EMPTY, ...data } });
      })
      .catch(() => dispatch({ type: 'hydrate', data: EMPTY }))
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  useEffect(() => {
    if (!state.hydrated || !loaded.current) return;
    const { profile, runs } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, runs })).catch(() => {});
  }, [state]);

  const plan = useMemo(() => (state.profile ? generatePlan(state.profile) : []), [state.profile]);

  const setProfile = useCallback((profile: Profile) => dispatch({ type: 'setProfile', profile }), []);
  const addRun = useCallback((run: Run) => dispatch({ type: 'addRun', run }), []);
  const deleteRun = useCallback((id: string) => dispatch({ type: 'deleteRun', id }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const value = useMemo(() => ({ ...state, plan, setProfile, addRun, deleteRun, reset }), [state, plan, setProfile, addRun, deleteRun, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used within StoreProvider');
  return s;
}
