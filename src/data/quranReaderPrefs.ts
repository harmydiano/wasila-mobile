import { useEffect, useSyncExternalStore } from 'react';
import { KEYS, getJSON, setJSON } from './prefs';

export type ReaderTheme = 'night' | 'paper' | 'deep';
export type ReaderMode = 'list' | 'mushaf';
export type LineSpacing = 'tight' | 'comfortable' | 'loose';

export type ReaderPrefs = {
  theme: ReaderTheme;
  mode: ReaderMode;
  autoScroll: boolean;
  verseNumbers: boolean;
  goalMinutes: number;
  lineSpacing: LineSpacing;
  showTranslit: boolean;
  showTranslation: boolean;
};

export const READER_DEFAULTS: ReaderPrefs = {
  theme: 'night',
  mode: 'list',
  autoScroll: true,
  verseNumbers: true,
  goalMinutes: 5,
  lineSpacing: 'comfortable',
  showTranslit: true,
  showTranslation: true,
};

export const SPACING_SCALE: Record<LineSpacing, number> = {
  tight: 1,
  comfortable: 1.12,
  loose: 1.28,
};

export const SPACING_LABEL: Record<LineSpacing, string> = {
  tight: 'Tight',
  comfortable: 'Comfortable',
  loose: 'Loose',
};

let state: ReaderPrefs = READER_DEFAULTS;
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function loadReaderPrefs(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (!loading) {
    loading = getJSON<Partial<ReaderPrefs>>(KEYS.quranReader, {})
      .then((v) => {
        state = { ...READER_DEFAULTS, ...v };
        loaded = true;
        emit();
      })
      .catch(() => {
        loaded = true;
      });
  }
  return loading;
}

export function getReaderPrefs(): ReaderPrefs {
  return state;
}

export function setReaderPrefs(patch: Partial<ReaderPrefs>): void {
  state = { ...state, ...patch };
  setJSON(KEYS.quranReader, state).catch(() => {});
  emit();
}

export function resetDisplayPrefs(): void {
  const { theme, mode, autoScroll, verseNumbers, goalMinutes } = READER_DEFAULTS;
  setReaderPrefs({ theme, mode, autoScroll, verseNumbers, goalMinutes });
}

export function resetTextPrefs(): void {
  const { lineSpacing, showTranslit, showTranslation } = READER_DEFAULTS;
  setReaderPrefs({ lineSpacing, showTranslit, showTranslation });
}

export function useReaderPrefs(): ReaderPrefs {
  useEffect(() => {
    loadReaderPrefs();
  }, []);
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getReaderPrefs,
    getReaderPrefs
  );
}

export const PAPER = {
  bg: '#F6EFE0',
  bgAlt: '#EFE4CE',
  border: '#E4D9C2',
  borderStrong: '#E0D2B4',
  ink: '#241D11',
  inkStrong: '#251E12',
  inkTitle: '#3A2E1C',
  meta: '#7A6B4E',
  gold: '#8C6E3A',
  accent: '#0E7A57',
  onAccent: '#F6EFE0',
} as const;

export const DEEP = {
  bg: '#050C0A',
  card: '#0A1512',
  border: '#1A2A25',
} as const;
