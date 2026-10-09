import { useSyncExternalStore } from 'react';
import {
  hijriOf,
  loadMonthNames,
  loadOffset,
  loadToday,
  nameOf,
  type HijriMonthName,
  type HijriToday,
} from '../data/hijriCalendar';
import { gregorianToHijri, hijriMonthName } from '../utils/hijri';

type State = {
  today: HijriToday | null;
  day: number;
  month: number;
  year: number;
  monthName: string;
  dayMonth: string;
  monthYear: string;
  full: string;
  fromApi: boolean;
  corrected: boolean;
};

const listeners = new Set<() => void>();
let names: HijriMonthName[] = [];
let state: State = local(new Date());
let pending = false;
let namesPending = false;
let fetchedFor = '';

function derive(
  day: number,
  month: number,
  year: number,
  today: HijriToday | null,
  corrected = false
): State {
  const monthName = nameOf(names.find((m) => m.number === month)?.name, 'ar-Latn') || hijriMonthName(month);
  return {
    today,
    day,
    month,
    year,
    monthName,
    dayMonth: `${day} ${monthName}`,
    monthYear: `${monthName} ${year}`,
    full: `${day} ${monthName} ${year}`,
    fromApi: today !== null,
    corrected,
  };
}

function local(now: Date): State {
  const h = gregorianToHijri(now);
  return derive(h.day, h.month, h.year, null);
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function emit(): void {
  for (const fn of listeners) fn();
}

function ensure(): void {
  if (!names.length && !namesPending) {
    namesPending = true;
    loadMonthNames()
      .then((rows) => {
        names = rows;
        state = derive(state.day, state.month, state.year, state.today);
        emit();
      })
      .catch(() => {})
      .finally(() => {
        namesPending = false;
      });
  }

  const now = new Date();
  const key = dayKey(now);
  if (pending || fetchedFor === key) return;
  pending = true;
  loadToday(now)
    .then(async (today) => {
      fetchedFor = key;
      if (today) {
        state = derive(today.day, today.month, today.year, today);
        emit();
        return;
      }
      const offset = await loadOffset();
      if (offset === null) return;
      const h = hijriOf(now, offset);
      state = derive(h.day, h.month, h.year, null, true);
      emit();
    })
    .catch(() => {})
    .finally(() => {
      pending = false;
    });
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  ensure();
  return () => listeners.delete(fn);
}

function snapshot(): State {
  return state;
}

export function useHijriDate(): State {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
