import { friendsFeed, normalizeCode, runnerActivity, runnerByCode, RUNNERS, searchRunners, suggestedRunners, userFriendCode } from '../community';
import { buildBoard } from '../leaderboard';

describe('community', () => {
  it('has unique well-formed codes', () => {
    const codes = new Set(RUNNERS.map((r) => r.code));
    expect(codes.size).toBe(RUNNERS.length);
    for (const c of codes) expect(c).toMatch(/^STR-[0-9A-Z]{6}$/);
  });

  it('finds runners by code case-insensitively and with or without the prefix', () => {
    const maya = RUNNERS[0];
    expect(runnerByCode(maya.code.toLowerCase())?.id).toBe(maya.id);
    expect(runnerByCode(maya.code.slice(4))?.id).toBe(maya.id);
    expect(runnerByCode('STR-ZZZZZZ')).toBeUndefined();
    expect(normalizeCode(' str-ab12cd ')).toBe('STR-AB12CD');
  });

  it('searches name and handle', () => {
    expect(searchRunners('maya').map((r) => r.id)).toEqual(['mayaruns']);
    expect(searchRunners('@leo').map((r) => r.id)).toEqual(['leo.m']);
    expect(searchRunners('')).toEqual([]);
  });

  it('user codes are stable', () => {
    expect(userFriendCode('Kent', 123)).toBe(userFriendCode('kent', 123));
    expect(userFriendCode('Kent', 123)).not.toBe(userFriendCode('Kent', 124));
  });

  it('activity is deterministic and plausible', () => {
    const r = RUNNERS[1];
    const a = runnerActivity(r, '2026-10-09');
    expect(a).toEqual(runnerActivity(r, '2026-10-09'));
    expect(a.length).toBeGreaterThan(4);
    const twoWeekKm = a.reduce((s, x) => s + x.distanceKm, 0);
    expect(twoWeekKm).toBeGreaterThan(r.weeklyKm);
    expect(twoWeekKm).toBeLessThan(r.weeklyKm * 3);
    for (const x of a) expect(x.durationSec / x.distanceKm).toBeGreaterThan(180);
  });

  it("simulated weekly volume tracks each runner's profile", () => {
    for (const r of RUNNERS) {
      const km = runnerActivity(r, '2026-10-09', 56).reduce((s, x) => s + x.distanceKm, 0) / 8;
      expect(km).toBeGreaterThan(r.weeklyKm * 0.75);
      expect(km).toBeLessThan(r.weeklyKm * 1.25);
    }
  });

  it('feed is newest first and only for friends', () => {
    const feed = friendsFeed(['mayaruns', 'samok'], '2026-10-09');
    expect(new Set(feed.map((f) => f.runnerId))).toEqual(new Set(['mayaruns', 'samok']));
    for (let i = 1; i < feed.length; i++) expect(feed[i - 1].date >= feed[i].date).toBe(true);
    expect(friendsFeed([], '2026-10-09')).toEqual([]);
  });

  it('suggests non-friends near your percentile', () => {
    const s = suggestedRunners(['mayaruns'], 20, 3);
    expect(s).toHaveLength(3);
    expect(s.map((r) => r.id)).not.toContain('mayaruns');
  });
});

describe('leaderboard', () => {
  const you = { id: 'you', name: 'You', isYou: true, weekKm: 30, marathonSec: 4 * 3600 };
  const a = { id: 'a', name: 'A', isYou: false, weekKm: 20, marathonSec: 3.5 * 3600 };
  const b = { id: 'b', name: 'B', isYou: false, weekKm: 50, marathonSec: null };

  it('ranks by week km', () => {
    const board = buildBoard([you, a, b], 'week');
    expect(board.rows.map((r) => r.id)).toEqual(['b', 'you', 'a']);
    expect(board.youPlace).toBe(2);
    expect(board.aheadOf).toBe(1);
    expect(board.friendCount).toBe(2);
    expect(board.next).toEqual({ name: 'B', gap: 20 });
  });

  it('ranks by marathon with unknown last', () => {
    const board = buildBoard([you, a, b], 'marathon');
    expect(board.rows.map((r) => r.id)).toEqual(['a', 'you', 'b']);
  });
});
