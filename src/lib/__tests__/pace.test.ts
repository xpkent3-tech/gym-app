import { formatDuration, formatPace, parseDistance, parseDuration, paceSecPerKm } from '../pace';

describe('pace', () => {
  it('parses durations', () => {
    expect(parseDuration('50:00')).toBe(3000);
    expect(parseDuration('1:05:30')).toBe(3930);
    expect(parseDuration('45')).toBe(2700);
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('5:75')).toBeNull();
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('0:00')).toBeNull();
  });
  it('parses distance with comma decimals', () => {
    expect(parseDistance('10,5')).toBe(10.5);
    expect(parseDistance('0')).toBeNull();
  });
  it('formats', () => {
    expect(formatDuration(3930)).toBe('1:05:30');
    expect(formatDuration(3000)).toBe('50:00');
    expect(formatPace(paceSecPerKm(10, 3000))).toBe('5:00');
    expect(formatPace(NaN)).toBe('–:––');
  });
});
