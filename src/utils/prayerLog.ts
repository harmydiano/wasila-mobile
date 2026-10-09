export const DAILY_PRAYERS = ['Fajr', 'Zuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type PrayerName = (typeof DAILY_PRAYERS)[number];

export type PrayerLog = Record<string, string[]>;

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function loggedOn(log: PrayerLog, d: Date): string[] {
  return log[dayKey(d)] ?? [];
}

export function isLogged(log: PrayerLog, d: Date, prayer: string): boolean {
  return loggedOn(log, d).includes(prayer);
}

export function togglePrayer(log: PrayerLog, d: Date, prayer: string): PrayerLog {
  const key = dayKey(d);
  const current = log[key] ?? [];
  const next = current.includes(prayer) ? current.filter((p) => p !== prayer) : [...current, prayer];
  const out = { ...log };
  if (next.length) out[key] = next;
  else delete out[key];
  return out;
}

export function currentStreak(log: PrayerLog, today = new Date()): number {
  const complete = (d: Date) => loggedOn(log, d).length >= DAILY_PRAYERS.length;

  let streak = 0;
  let cursor = complete(today) ? today : addDays(today, -1);

  for (let i = 0; i < 3650; i++) {
    if (!complete(cursor)) break;
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function weekStrip(log: PrayerLog, today = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    const count = loggedOn(log, d).length;
    return {
      date: d,
      dayLetter: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
      dateNum: d.getDate(),
      count,
      total: DAILY_PRAYERS.length,
      isToday: dayKey(d) === dayKey(today),
    };
  });
}

export function monthGrid(log: PrayerLog, today = new Date()) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(year, month, i + 1);
    const count = loggedOn(log, d).length;
    return {
      day: i + 1,
      count,
      full: count >= DAILY_PRAYERS.length,
      partial: count > 0 && count < DAILY_PRAYERS.length,
      future: d > today,
    };
  });
}

export function monthPercent(log: PrayerLog, today = new Date()): number {
  const grid = monthGrid(log, today).filter((g) => !g.future);
  if (!grid.length) return 0;
  const logged = grid.reduce((sum, g) => sum + g.count, 0);
  return Math.round((logged / (grid.length * DAILY_PRAYERS.length)) * 100);
}
