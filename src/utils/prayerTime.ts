export function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 1) return '<1 min';
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs <= 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}

export function formatCountdown(fromMs: number, toMs: number): string {
  const diff = toMs - fromMs;
  if (diff <= 0) return 'Now';
  return `in ${formatDuration(diff)}`;
}

export function formatTimeUntil(fromMs: number, toMs: number): string {
  const diff = toMs - fromMs;
  if (diff <= 0) return 'now';
  const totalMinutes = Math.max(1, Math.round(diff / 60000));
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs <= 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

const COMPASS_POINTS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function compassLabel(degrees: number): string {
  const idx = Math.round(((degrees % 360) + 360) % 360 / 45) % 8;
  return COMPASS_POINTS[idx];
}

export function formatQibla(degrees: number): string {
  return `${Math.round(degrees)}° ${compassLabel(degrees)}`;
}

export function timezoneMismatchHours(longitude: number, date = new Date()): number {
  const deviceOffsetHrs = -date.getTimezoneOffset() / 60;
  const solarOffsetHrs = longitude / 15;
  let diff = deviceOffsetHrs - solarOffsetHrs;
  while (diff > 12) diff -= 24;
  while (diff < -12) diff += 24;
  return Math.abs(diff) > 3.5 ? Math.round(diff) : 0;
}
