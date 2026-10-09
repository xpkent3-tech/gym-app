import { predictMarathon, rankRunner, riegel, tierFor, timeForTopPercent, topPercentForTime, volumeTopPercent } from '../rank';
import { normalCdf, normalQuantile } from '../stats';
import { run } from './helpers';

describe('stats', () => {
  it('cdf and quantile are inverse', () => {
    for (const p of [0.01, 0.1, 0.25, 0.5, 0.9, 0.99]) expect(normalCdf(normalQuantile(p))).toBeCloseTo(p, 5);
  });
});

describe('rank', () => {
  it('predicts ~3:50 from a 50:00 10K', () => {
    const t = riegel(10, 3000);
    expect(t / 60).toBeGreaterThan(229);
    expect(t / 60).toBeLessThan(231);
  });

  it('ignores runs under 3 km and returns null without data', () => {
    expect(predictMarathon([run({ distanceKm: 2, durationSec: 400 })])).toBeNull();
  });

  it('uses the race result when faster than runs', () => {
    const p = predictMarathon([run({ distanceKm: 10, durationSec: 3600 })], { distanceKm: 21.0975, durationSec: 5400 });
    expect(p?.source.kind).toBe('race-result');
  });

  it('faster is a smaller top %', () => {
    expect(topPercentForTime(3 * 3600, 'male', 35)).toBeLessThan(topPercentForTime(4 * 3600, 'male', 35));
  });

  it('median runner is top ~50%, sub-3:30 male is ~top 10%', () => {
    expect(topPercentForTime(4.5 * 3600, 'male', 35)).toBe(50);
    expect(topPercentForTime(3.5 * 3600, 'male', 35)).toBeGreaterThanOrEqual(9);
    expect(topPercentForTime(3.5 * 3600, 'male', 35)).toBeLessThanOrEqual(11);
  });

  it('same time ranks better for older and female runners', () => {
    const t = 4 * 3600;
    expect(topPercentForTime(t, 'male', 55)).toBeLessThan(topPercentForTime(t, 'male', 35));
    expect(topPercentForTime(t, 'female', 35)).toBeLessThan(topPercentForTime(t, 'male', 35));
  });

  it('clamps to 1..99', () => {
    expect(topPercentForTime(2 * 3600, 'male', 30)).toBe(1);
    expect(topPercentForTime(9 * 3600, 'male', 30)).toBe(99);
  });

  it('round-trips time ↔ percentile', () => {
    expect(topPercentForTime(timeForTopPercent(25, 'female', 45), 'female', 45)).toBe(25);
  });

  it('gives tier and next-tier target', () => {
    const r = rankRunner({ sex: 'male', age: 35 }, [run({ distanceKm: 10, durationSec: 3000 })])!;
    expect(r.tier.name).toBe('Advanced');
    expect(r.nextTier?.tier.name).toBe('Sub-Elite');
    expect(r.nextTier!.targetSec).toBeLessThan(r.prediction.timeSec);
    expect(tierFor(1).name).toBe('Elite');
  });

  it('volume percentile', () => {
    expect(volumeTopPercent(0)).toBeNull();
    expect(volumeTopPercent(32)).toBe(50);
    expect(volumeTopPercent(80)!).toBeLessThan(10);
  });
});
