import { RUNNERS } from '../community';
import { EMPTY, migrate, reducer } from '../store';
import type { Profile } from '../types';

const profile: Profile = {
  name: 'Kent',
  sex: 'male',
  age: 32,
  experience: 'intermediate',
  weeklyKm: 30,
  raceDate: '2027-01-24',
  planStart: '2026-10-05',
  createdAt: 1,
};
const fresh = { ...EMPTY, hydrated: true };

describe('store', () => {
  it('migrates old data with defaults and a friend code', () => {
    const m = migrate({ profile, runs: [] } as never);
    expect(m.friends).toEqual([]);
    expect(m.invitesSent).toBe(0);
    expect(m.profile?.friendCode).toMatch(/^STR-/);
  });

  it('applies a pending invite when onboarding completes', () => {
    const withInvite = reducer(fresh, { type: 'setPendingInvite', id: RUNNERS[0].id });
    const s = reducer(withInvite, { type: 'setProfile', profile });
    expect(s.friends).toEqual([RUNNERS[0].id]);
    expect(s.pendingInvite).toBeNull();
  });

  it('adds friends once, removes, toggles kudos', () => {
    let s = reducer(fresh, { type: 'addFriend', id: 'a' });
    s = reducer(s, { type: 'addFriend', id: 'a' });
    expect(s.friends).toEqual(['a']);
    s = reducer(s, { type: 'removeFriend', id: 'a' });
    expect(s.friends).toEqual([]);
    s = reducer(s, { type: 'toggleKudos', id: 'x' });
    expect(s.kudos).toEqual(['x']);
    s = reducer(s, { type: 'toggleKudos', id: 'x' });
    expect(s.kudos).toEqual([]);
  });
});
