/**
 * Parses "mm:ss", "h:mm:ss" or a bare number of minutes into seconds.
 * Returns null for anything unparseable or non-positive.
 */
export function parseDuration(input: string): number | null {
  const s = input.trim();
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)) {
    const sec = Math.round(parseFloat(s) * 60);
    return sec > 0 ? sec : null;
  }
  const parts = s.split(':');
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  const [h, m, sec] = nums.length === 3 ? nums : [0, nums[0], nums[1]];
  if (sec >= 60 || (nums.length === 3 && m >= 60)) return null;
  const total = h * 3600 + m * 60 + sec;
  return total > 0 ? total : null;
}

export function parseDistance(input: string): number | null {
  const n = parseFloat(input.replace(',', '.'));
  return Number.isFinite(n) && n > 0 && n < 400 ? n : null;
}

export function formatDuration(totalSec: number): string {
  const sec = Math.round(totalSec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Seconds per km. */
export function paceSecPerKm(distanceKm: number, durationSec: number): number {
  return durationSec / distanceKm;
}

export function formatPace(secPerKm: number): string {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return '–:––';
  return formatDuration(secPerKm);
}

export function formatKm(km: number): string {
  return km >= 100 ? km.toFixed(0) : km.toFixed(1).replace(/\.0$/, '');
}
