import { dayKey, addDays } from './prayerLog';

export const MAX_NIGHTS = 41;

export function clampNights(n: number): number {
  return Math.min(MAX_NIGHTS, Math.max(1, Math.round(n) || 1));
}

const MONTH_ABBR =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function nightForDate(startedDateKey: string, totalNights: number, today: Date): number {
  const start = parseDateKey(startedDateKey);
  const days = Math.round((parseDateKey(dayKey(today)).getTime() - start.getTime()) / 86400000);
  return Math.min(totalNights, Math.max(1, days + 1));
}

export function endDateLabel(startedDateKey: string, totalNights: number): string {
  const end = addDays(parseDateKey(startedDateKey), totalNights - 1);
  return `${end.getDate()} ${MONTH_ABBR[end.getMonth()]}`;
}

export function currentStreakFromDates(dates: string[], today: Date): number {
  const set = new Set(dates);
  let streak = 0;
  let cursor = set.has(dayKey(today)) ? today : addDays(today, -1);
  for (let i = 0; i < 3650; i++) {
    if (!set.has(dayKey(cursor))) break;
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreakFromDates(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && dayKey(addDays(parseDateKey(prev), 1)) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return longest;
}

export function hasLiveWindow(
  practice: { startedDateKey: string; totalNights: number } | null | undefined,
  today: Date = new Date()
): boolean {
  if (!practice?.startedDateKey || !practice.totalNights) return false;
  const last = addDays(parseDateKey(practice.startedDateKey), practice.totalNights - 1);
  return dayKey(today) <= dayKey(last);
}

export function lastKeptLabel(dates: string[], today: Date): string {
  const todayKey = dayKey(today);
  const prev = dates.filter((d) => d < todayKey).sort().pop();
  if (!prev) return 'First time';
  const days = Math.round((parseDateKey(todayKey).getTime() - parseDateKey(prev).getTime()) / 86400000);
  if (days === 1) return 'Last · yesterday';
  if (days < 7) return `Last · ${days} days ago`;
  const d = parseDateKey(prev);
  return `Last · ${d.getDate()} ${MONTH_ABBR[d.getMonth()]}`;
}

export function holdUnbegun<
  P extends { startedDateKey: string; tallyDateKey: string; tally: number; segment?: number; completedDates: string[] },
>(p: P, todayKey: string): P {
  return isBegun(p) || p.startedDateKey >= todayKey ? p : { ...p, startedDateKey: todayKey, tallyDateKey: todayKey };
}

export function isBegun(p: { tally: number; segment?: number; completedDates: string[] }): boolean {
  return p.completedDates.length > 0 || p.tally > 0 || (p.segment ?? 0) > 0;
}
