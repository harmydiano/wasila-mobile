import { formatCountdown } from './prayerTime';

export function afterPhraseOf(tm: string): string {
  return tm.charAt(0).toLowerCase() + tm.slice(1);
}

export function windowOpensPhrase(
  tm: string,
  time: Date | null | undefined,
  isCurrent: boolean,
  now: number = Date.now()
): string {
  if (!time) return afterPhraseOf(tm);
  if (isCurrent) return 'now';
  return time.getTime() <= now ? `tomorrow ${afterPhraseOf(tm)}` : formatCountdown(now, time.getTime());
}
