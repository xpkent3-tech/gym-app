import { personalRecords, prsSetBy } from '../records';
import { run } from './helpers';

describe('records', () => {
  const a = run({ date: '2026-09-01', distanceKm: 10, durationSec: 3000 });
  const b = run({ date: '2026-09-05', distanceKm: 21.1, durationSec: 6600 });
  const c = run({ date: '2026-09-09', distanceKm: 5, durationSec: 1400 });

  it('computes best efforts', () => {
    const prs = personalRecords([a, b, c]);
    expect(prs.find((p) => p.key === '5k')?.runId).toBe(c.id);
    expect(prs.find((p) => p.key === '10k')?.runId).toBe(a.id);
    expect(prs.find((p) => p.key === 'half')?.runId).toBe(b.id);
    expect(prs.find((p) => p.key === 'marathon')).toBeUndefined();
  });

  it('flags PRs relative to earlier runs only', () => {
    expect(prsSetBy(a, [a, b, c])).toEqual(['5K', '10K']);
    expect(prsSetBy(b, [a, b, c])).toEqual(['Half']);
    expect(prsSetBy(c, [a, b, c])).toEqual(['5K']);
  });
});
