import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';

import { runnerById, userFriendCode } from './community';
import type { StrengthSession } from './muscles';
import { latestEntry, type BodyEntry } from './bodycomp';
import type { HealthSnapshot } from './health';
import type { FoodEntry } from './nutrition';
import type { SportSession } from './sports';
import { generatePlan, type PlanWeek } from './plan';
import type { Profile, Run } from './types';

const STORAGE_KEY = 'stride:v1';

export interface AppData {
  profile: Profile | null;
  runs: Run[];
  /** Runner ids from the community directory. */
  friends: string[];
  /** Friend activity ids the user gave kudos to. */
  kudos: string[];
  /** Runner id from an invite opened before onboarding. */
  pendingInvite: string | null;
  invitesSent: number;
  strength: StrengthSession[];
  sessions: SportSession[];
  food: FoodEntry[];
  bodyLog: BodyEntry[];
  health: { connected: boolean; snapshot?: HealthSnapshot; syncedAt?: number };
}

type Action =
  | { type: 'hydrate'; data: AppData }
  | { type: 'setProfile'; profile: Profile }
  | { type: 'addRun'; run: Run }
  | { type: 'deleteRun'; id: string }
  | { type: 'addFriend'; id: string }
  | { type: 'removeFriend'; id: string }
  | { type: 'toggleKudos'; id: string }
  | { type: 'setPendingInvite'; id: string | null }
  | { type: 'inviteSent' }
  | { type: 'addStrength'; session: StrengthSession }
  | { type: 'deleteStrength'; id: string }
  | { type: 'addSession'; session: SportSession }
  | { type: 'deleteSession'; id: string }
  | { type: 'addFood'; entry: FoodEntry }
  | { type: 'deleteFood'; id: string }
  | { type: 'addBodyEntry'; entry: BodyEntry }
  | { type: 'deleteBodyEntry'; id: string }
  | { type: 'setHealth'; health: AppData['health'] }
  | { type: 'reset' };

interface State extends AppData {
  hydrated: boolean;
}

export const EMPTY: AppData = {
  profile: null,
  runs: [],
  friends: [],
  kudos: [],
  pendingInvite: null,
  invitesSent: 0,
  strength: [],
  sessions: [],
  food: [],
  bodyLog: [],
  health: { connected: false },
};

function sortRuns(runs: Run[]): Run[] {
  return [...runs].sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1));
}

function withFriendCode(p: Profile): Profile {
  const withCode = p.friendCode ? p : { ...p, friendCode: userFriendCode(p.name, p.createdAt) };
  // Profiles from before hybrid sports trained running and strength.
  return withCode.sports?.length ? withCode : { ...withCode, sports: ['running', 'strength'] };
}

const addUnique = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

/** Upgrades persisted data from older app versions. */
export function migrate(raw: Partial<AppData>): AppData {
  const data = { ...EMPTY, ...raw };
  return {
    ...data,
    profile: data.profile ? withFriendCode(data.profile) : null,
    runs: sortRuns(data.runs ?? []),
    friends: (data.friends ?? []).filter((id) => !!runnerById(id)),
    strength: data.strength ?? [],
    sessions: data.sessions ?? [],
    food: data.food ?? [],
    bodyLog: data.bodyLog ?? [],
    health: data.health ?? { connected: false },
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...action.data, hydrated: true };
    case 'setProfile': {
      const invite = state.pendingInvite && !state.profile ? state.pendingInvite : null;
      return {
        ...state,
        profile: withFriendCode(action.profile),
        friends: invite ? addUnique(state.friends, invite) : state.friends,
        pendingInvite: invite ? null : state.pendingInvite,
      };
    }
    case 'addRun':
      return { ...state, runs: sortRuns([action.run, ...state.runs]) };
    case 'deleteRun':
      return { ...state, runs: state.runs.filter((r) => r.id !== action.id) };
    case 'addFriend':
      return { ...state, friends: addUnique(state.friends, action.id) };
    case 'removeFriend':
      return { ...state, friends: state.friends.filter((f) => f !== action.id) };
    case 'toggleKudos':
      return { ...state, kudos: state.kudos.includes(action.id) ? state.kudos.filter((k) => k !== action.id) : [...state.kudos, action.id] };
    case 'setPendingInvite':
      return { ...state, pendingInvite: action.id };
    case 'addStrength':
      return { ...state, strength: [action.session, ...state.strength] };
    case 'deleteStrength':
      return { ...state, strength: state.strength.filter((s) => s.id !== action.id) };
    case 'addSession':
      return { ...state, sessions: [action.session, ...state.sessions] };
    case 'deleteSession':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id) };
    case 'addFood':
      return { ...state, food: [...state.food, action.entry] };
    case 'deleteFood':
      return { ...state, food: state.food.filter((f) => f.id !== action.id) };
    case 'addBodyEntry': {
      const bodyLog = [...state.bodyLog, action.entry];
      const newest = latestEntry(bodyLog);
      const profile =
        state.profile && newest?.id === action.entry.id
          ? {
              ...state.profile,
              body: {
                heightCm: state.profile.body?.heightCm ?? 0,
                ...state.profile.body,
                weightKg: action.entry.weightKg,
                ...(action.entry.bodyFatPct !== undefined ? { bodyFatPct: action.entry.bodyFatPct } : {}),
              },
            }
          : state.profile;
      return { ...state, bodyLog, profile };
    }
    case 'deleteBodyEntry':
      return { ...state, bodyLog: state.bodyLog.filter((b) => b.id !== action.id) };
    case 'setHealth':
      return { ...state, health: action.health };
    case 'inviteSent':
      return { ...state, invitesSent: state.invitesSent + 1 };
    case 'reset':
      return { ...EMPTY, hydrated: true };
  }
}

interface Store extends State {
  plan: PlanWeek[];
  setProfile: (p: Profile) => void;
  addRun: (r: Run) => void;
  deleteRun: (id: string) => void;
  addFriend: (id: string) => void;
  removeFriend: (id: string) => void;
  toggleKudos: (id: string) => void;
  setPendingInvite: (id: string | null) => void;
  inviteSent: () => void;
  addStrength: (s: StrengthSession) => void;
  deleteStrength: (id: string) => void;
  addSession: (s: SportSession) => void;
  deleteSession: (id: string) => void;
  addFood: (e: FoodEntry) => void;
  deleteFood: (id: string) => void;
  addBodyEntry: (e: BodyEntry) => void;
  deleteBodyEntry: (id: string) => void;
  setHealth: (h: AppData['health']) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ...EMPTY, hydrated: false });
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => dispatch({ type: 'hydrate', data: migrate(raw ? (JSON.parse(raw) as Partial<AppData>) : {}) }))
      .catch(() => dispatch({ type: 'hydrate', data: EMPTY }))
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  useEffect(() => {
    if (!state.hydrated || !loaded.current) return;
    const { hydrated: _h, ...data } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [state]);

  const plan = useMemo(() => (state.profile ? generatePlan(state.profile) : []), [state.profile]);

  const actions = useMemo(
    () => ({
      setProfile: (profile: Profile) => dispatch({ type: 'setProfile', profile }),
      addRun: (run: Run) => dispatch({ type: 'addRun', run }),
      deleteRun: (id: string) => dispatch({ type: 'deleteRun', id }),
      addFriend: (id: string) => dispatch({ type: 'addFriend', id }),
      removeFriend: (id: string) => dispatch({ type: 'removeFriend', id }),
      toggleKudos: (id: string) => dispatch({ type: 'toggleKudos', id }),
      setPendingInvite: (id: string | null) => dispatch({ type: 'setPendingInvite', id }),
      inviteSent: () => dispatch({ type: 'inviteSent' }),
      addStrength: (session: StrengthSession) => dispatch({ type: 'addStrength', session }),
      deleteStrength: (id: string) => dispatch({ type: 'deleteStrength', id }),
      addSession: (session: SportSession) => dispatch({ type: 'addSession', session }),
      deleteSession: (id: string) => dispatch({ type: 'deleteSession', id }),
      addFood: (entry: FoodEntry) => dispatch({ type: 'addFood', entry }),
      deleteFood: (id: string) => dispatch({ type: 'deleteFood', id }),
      addBodyEntry: (entry: BodyEntry) => dispatch({ type: 'addBodyEntry', entry }),
      deleteBodyEntry: (id: string) => dispatch({ type: 'deleteBodyEntry', id }),
      setHealth: (health: AppData['health']) => dispatch({ type: 'setHealth', health }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  );

  const value = useMemo(() => ({ ...state, plan, ...actions }), [state, plan, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used within StoreProvider');
  return s;
}
