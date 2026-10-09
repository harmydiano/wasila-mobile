import { useEffect, useSyncExternalStore } from 'react';
import { KEYS, getJSON, setJSON } from './prefs';
import { globalAyahIndex } from './juz';

export type ReadMark = {
  suraId: number;
  verseId: number;
  at: number;
};

export type QuranProgress = {
  recent: ReadMark[];
  furthest: number;
  days: string[];
  seconds: Record<string, number>;
  marks: string[];
};

const EMPTY: QuranProgress = { recent: [], furthest: 0, days: [], seconds: {}, marks: [] };

const RECENT_MAX = 5;
const DAYS_MAX = 400;

let state: QuranProgress = EMPTY;
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function loadQuranProgress(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = getJSON<QuranProgress>(KEYS.quranProgress, EMPTY)
      .then((v) => {
        state = {
          recent: v?.recent ?? [],
          furthest: v?.furthest ?? 0,
          days: v?.days ?? [],
          seconds: v?.seconds ?? {},
          marks: v?.marks ?? [],
        };
        loaded = true;
        emit();
      })
      .catch(() => {
        loaded = true;
      });
  }
  return loading;
}

export function getQuranProgress(): QuranProgress {
  return state;
}

export function subscribeQuranProgress(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;

function persistSoon() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    setJSON(KEYS.quranProgress, state).catch(() => {});
  }, 800);
}

function todayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function recordRead(suraId: number, verseId: number): void {
  if (!Number.isFinite(suraId) || suraId < 1) return;
  const verse = Math.max(1, Math.round(verseId) || 1);
  const now = Date.now();

  const prevTop = state.recent[0];
  const rest = state.recent.filter((r) => r.suraId !== suraId);
  const recent = [{ suraId, verseId: verse, at: now }, ...rest].slice(0, RECENT_MAX);

  const idx = globalAyahIndex(suraId, verse);
  const furthest = Math.max(state.furthest, idx);

  const today = todayKey();
  const days = state.days[state.days.length - 1] === today ? state.days : [...state.days, today].slice(-DAYS_MAX);

  const changed =
    !prevTop ||
    prevTop.suraId !== suraId ||
    prevTop.verseId !== verse ||
    furthest !== state.furthest ||
    days !== state.days;

  state = { ...state, recent, furthest, days };
  persistSoon();
  if (changed) emit();
}

export function creditReadingSeconds(n: number): void {
  if (!(n > 0)) return;
  const today = todayKey();
  const before = Math.floor((state.seconds[today] ?? 0) / 60);
  const seconds = { ...state.seconds, [today]: (state.seconds[today] ?? 0) + n };
  state = { ...state, seconds };
  persistSoon();
  if (Math.floor(seconds[today] / 60) !== before) emit();
}

export function markKey(suraId: number, verseId: number): string {
  return `${suraId}:${verseId}`;
}

export function isBookmarked(suraId: number, verseId: number): boolean {
  return state.marks.includes(markKey(suraId, verseId));
}

export function toggleBookmark(suraId: number, verseId: number): void {
  const k = markKey(suraId, verseId);
  const marks = state.marks.includes(k) ? state.marks.filter((m) => m !== k) : [k, ...state.marks];
  state = { ...state, marks };
  persistSoon();
  emit();
}

export function minutesToday(from = new Date()): number {
  return Math.floor((state.seconds[todayKey(from)] ?? 0) / 60);
}

export function clearContinue(): void {
  if (state.recent.length === 0) return;
  state = { ...state, recent: [] };
  persistSoon();
  emit();
}

export function readingStreak(days: string[] = state.days, from = new Date()): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const cursor = new Date(from);
  if (!set.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(todayKey(cursor))) return 0;
  }
  let n = 0;
  while (set.has(todayKey(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return n;
}

export function daysReadWithin(window: number, days: string[] = state.days, from = new Date()): number {
  const cutoff = new Date(from);
  cutoff.setDate(cutoff.getDate() - (window - 1));
  const key = todayKey(cutoff);
  return days.filter((d) => d >= key).length;
}

export function useQuranProgress(): QuranProgress {
  useEffect(() => {
    loadQuranProgress();
  }, []);
  return useSyncExternalStore(subscribeQuranProgress, getQuranProgress, getQuranProgress);
}
