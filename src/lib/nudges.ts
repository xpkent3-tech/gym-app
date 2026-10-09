import { diffDays, startOfWeek, addDays } from './dates';
import { formatKm } from './pace';
import { STREAK_MIN_RUNS, XP, progressOf, type ProgressInput } from './progression';

export type NudgeKind = 'streak' | 'challenge' | 'level';

export interface Nudge {
  kind: NudgeKind;
  emoji: string;
  text: string;
}

/** The single most useful prompt for today, or null when nothing is urgent. */
export function nextBestAction(input: ProgressInput, today: string): Nudge | null {
  const p = progressOf(input, today);
  const weekStart = startOfWeek(today);
  const runsThisWeek = input.runs.filter((r) => r.date >= weekStart && r.date <= today).length;
  const daysLeft = diffDays(today, addDays(weekStart, 6)) + 1;
  const needed = STREAK_MIN_RUNS - runsThisWeek;

  if (p.streak > 0 && needed > 0 && needed <= daysLeft) {
    return {
      kind: 'streak',
      emoji: '🔥',
      text: `Run ${needed} more time${needed === 1 ? '' : 's'} by Sunday to keep your ${p.streak}-week streak`,
    };
  }
  const c = p.challenge;
  if (!c.complete && c.doneKm > 0 && c.remainingKm <= c.targetKm * 0.25) {
    return { kind: 'challenge', emoji: '🎯', text: `Only ${formatKm(c.remainingKm)} km left to finish this week's challenge (+${XP.challenge} XP)` };
  }
  const toGo = p.level.needed - p.level.into;
  if (input.runs.length && toGo <= 60) {
    return { kind: 'level', emoji: '⭐', text: `${toGo} XP to Level ${p.level.level + 1} — about ${Math.ceil(toGo / XP.perKm)} km` };
  }
  return null;
}
