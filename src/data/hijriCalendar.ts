import { getJSON, setJSON, KEYS } from './prefs';
import { gregorianToHijri, hijriToGregorian } from '../utils/hijri';
import {
  HIJRI_DAYS_SEED,
  HIJRI_MONTHS_SEED,
  type ApiName,
  type HijriDayRecord,
  type HijriMonthName,
} from './hijriCalendarSeed';

export type { ApiName, HijriDayRecord, HijriMonthName };

const BASE = 'https://pray.api.islamic.network/v1';
const TIMEOUT_MS = 8000;

const STATIC_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type Cached<T> = { at: number; value: T };

export type HijriToday = {
  gregorian: string;
  year: number;
  month: number;
  day: number;
  next: { month: number; number: number; name: ApiName } | null;
};

async function get<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, { signal: controller.signal });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.code === 200 ? (body.data as T) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

let daysMemo: HijriDayRecord[] | null = null;
let monthsMemo: HijriMonthName[] | null = null;

export async function loadDayRecords(): Promise<HijriDayRecord[]> {
  if (daysMemo) return daysMemo;
  const cached = await getJSON<Cached<HijriDayRecord[]> | null>(KEYS.hijriDays, null);
  if (cached?.value?.length) {
    daysMemo = cached.value;
    if (Date.now() - cached.at > STATIC_TTL_MS) refreshDayRecords();
    return daysMemo;
  }
  daysMemo = HIJRI_DAYS_SEED;
  refreshDayRecords();
  return daysMemo;
}

async function refreshDayRecords(): Promise<void> {
  const data = await get<any[]>('/days?limit=200');
  if (!data?.length) return;
  const rows: HijriDayRecord[] = data
    .filter((d) => d?.month?.number && d?.number)
    .map((d) => ({ month: d.month.number, number: d.number, slug: d.slug, name: d.name ?? {} }));
  if (!rows.length) return;
  daysMemo = rows;
  setJSON(KEYS.hijriDays, { at: Date.now(), value: rows });
}

export async function loadMonthNames(): Promise<HijriMonthName[]> {
  if (monthsMemo) return monthsMemo;
  const cached = await getJSON<Cached<HijriMonthName[]> | null>(KEYS.hijriMonths, null);
  if (cached?.value?.length) {
    monthsMemo = cached.value;
    if (Date.now() - cached.at > STATIC_TTL_MS) refreshMonthNames();
    return monthsMemo;
  }
  monthsMemo = HIJRI_MONTHS_SEED;
  refreshMonthNames();
  return monthsMemo;
}

async function refreshMonthNames(): Promise<void> {
  const data = await get<any[]>('/months');
  if (!data?.length) return;
  const rows = data
    .filter((m) => m?.number)
    .map((m) => ({ number: m.number, name: m.name ?? {} }));
  if (rows.length !== 12) return;
  monthsMemo = rows;
  setJSON(KEYS.hijriMonths, { at: Date.now(), value: rows });
}

function dateParam(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function dayKeyOf(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parseToday(data: any): HijriToday | null {
  const h = data?.date?.hijri;
  if (!h?.year || !h?.month || !h?.day) return null;
  const n = data?.next;
  return {
    gregorian: data?.date?.gregorian ?? '',
    year: h.year,
    month: h.month,
    day: h.day,
    next: n?.month?.number && n?.number ? { month: n.month.number, number: n.number, name: n.name ?? {} } : null,
  };
}

export async function loadToday(now: Date = new Date()): Promise<HijriToday | null> {
  const key = dayKeyOf(now);
  const cached = await getJSON<{ key: string; value: HijriToday } | null>(KEYS.hijriToday, null);
  if (cached?.key === key) {
    rememberOffset(now, cached.value);
    return cached.value;
  }

  const data = await get<any>(`/calendar/today?date=${dateParam(now)}`);
  const today = parseToday(data);
  if (!today) return null;
  setJSON(KEYS.hijriToday, { key, value: today });
  rememberOffset(now, today);
  return today;
}

function rememberOffset(now: Date, today: HijriToday): void {
  for (let i = 0; i <= 6; i++) {
    const offset = i === 0 ? 0 : (i % 2 === 1 ? -Math.ceil(i / 2) : Math.ceil(i / 2));
    const h = hijriOf(now, offset);
    if (h.year === today.year && h.month === today.month && h.day === today.day) {
      setJSON(KEYS.hijriOffset, offset);
      return;
    }
  }
}

export async function loadOffset(): Promise<number | null> {
  const v = await getJSON<number | null>(KEYS.hijriOffset, null);
  return typeof v === 'number' ? v : null;
}

export async function loadMonthAnchor(year: number, month: number): Promise<number | null> {
  const key = `${year}-${month}`;
  const cached = await getJSON<Record<string, number> | null>(KEYS.hijriAnchors, null);
  if (cached && key in cached) return cached[key];

  let guess = hijriToGregorian(year, month, 15);
  for (let attempt = 0; attempt < 2; attempt++) {
    const data = await get<any>(`/calendar/today?date=${dateParam(guess)}`);
    const got = parseToday(data);
    if (!got) return null;
    const delta =
      (year - got.year) * 354 + (month - got.month) * 29.5 + (15 - got.day);
    const step = Math.round(delta);
    if (step === 0) {
      const offset = Math.round((guess.getTime() - hijriToGregorian(year, month, 15).getTime()) / 86400000);
      setJSON(KEYS.hijriAnchors, { ...(cached ?? {}), [key]: offset });
      return offset;
    }
    guess = new Date(guess.getFullYear(), guess.getMonth(), guess.getDate() + step, 12);
  }
  return null;
}

export function gregorianOf(year: number, month: number, day: number, offset: number | null): Date {
  const base = hijriToGregorian(year, month, day);
  if (!offset) return base;
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset, 12);
}

export function hijriOf(date: Date, offset: number | null) {
  if (!offset) return gregorianToHijri(date);
  const shifted = new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset, 12);
  return gregorianToHijri(shifted);
}

export function nameOf(n: ApiName | undefined, prefer: 'en' | 'ar-Latn' | 'ar' = 'en'): string {
  if (!n) return '';
  const order: (keyof ApiName)[] =
    prefer === 'ar' ? ['ar', 'ar-Latn', 'en'] : prefer === 'ar-Latn' ? ['ar-Latn', 'en', 'ar'] : ['en', 'ar-Latn', 'ar'];
  for (const k of order) if (n[k]) return n[k] as string;
  return '';
}
