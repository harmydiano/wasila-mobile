import { Directory, File, Paths } from 'expo-file-system';
import { getReciterBitrate } from './reciters';

export type VerseTiming = { verseId: number; fromMs: number; toMs: number };

export type SurahAudio = {
  url: string;
  durationMs: number;
  timings: VerseTiming[];
};

const QDC = 'https://api.qurancdn.com/api/qdc/audio/reciters';

export const TIMED_RECITATIONS: Record<string, number> = {
  'ar.alafasy': 7,
  'ar.abdulsamad': 2,
  'ar.abdurrahmaansudais': 3,
  'ar.husary': 6,
  'ar.saoodshuraym': 10,
  'ar.shaatree': 4,
};

export function hasContinuousAudio(reciter: string): boolean {
  return reciter in TIMED_RECITATIONS;
}

const memo = new Map<string, SurahAudio>();
const inFlight = new Map<string, Promise<SurahAudio | null>>();

function key(reciter: string, suraId: number): string {
  return `${reciter}:${suraId}`;
}

function timingsDir(reciter: string): Directory {
  return new Directory(Paths.document, 'quran-timings', reciter);
}

function timingsFile(reciter: string, suraId: number): File {
  return new File(timingsDir(reciter), `${suraId}.json`);
}

function withLocalAudio(reciter: string, suraId: number, audio: SurahAudio): SurahAudio {
  const local = localSurahUri(reciter, suraId);
  return local ? { ...audio, url: local } : audio;
}

function parse(raw: unknown): SurahAudio | null {
  const file = (raw as { audio_files?: unknown[] })?.audio_files?.[0] as
    | {
        audio_url?: string;
        duration?: number;
        verse_timings?: { verse_key?: string; timestamp_from?: number; timestamp_to?: number }[];
      }
    | undefined;
  if (!file?.audio_url || !Array.isArray(file.verse_timings) || file.verse_timings.length === 0) {
    return null;
  }
  const timings: VerseTiming[] = [];
  for (const t of file.verse_timings) {
    const verseId = Number(String(t.verse_key ?? '').split(':')[1]);
    if (!Number.isFinite(verseId) || typeof t.timestamp_from !== 'number' || typeof t.timestamp_to !== 'number') {
      continue;
    }
    timings.push({ verseId, fromMs: t.timestamp_from, toMs: t.timestamp_to });
  }
  if (timings.length === 0) return null;
  timings.sort((a, b) => a.fromMs - b.fromMs);
  return {
    url: file.audio_url,
    durationMs: file.duration ?? timings[timings.length - 1].toMs,
    timings,
  };
}

export function getSurahAudio(reciter: string, suraId: number): Promise<SurahAudio | null> {
  if (!hasContinuousAudio(reciter)) return Promise.resolve(null);

  const k = key(reciter, suraId);
  const cached = memo.get(k);
  if (cached) return Promise.resolve(withLocalAudio(reciter, suraId, cached));
  const pending = inFlight.get(k);
  if (pending) return pending;

  const load = (async (): Promise<SurahAudio | null> => {
    try {
      const f = timingsFile(reciter, suraId);
      if (f.exists) {
        const parsed = parse(JSON.parse(await f.text()));
        if (parsed) {
          memo.set(k, parsed);
          return withLocalAudio(reciter, suraId, parsed);
        }
      }
    } catch {}

    try {
      const res = await fetch(`${QDC}/${TIMED_RECITATIONS[reciter]}/audio_files?chapter=${suraId}&segments=true`);
      if (!res.ok) return null;
      const body = await res.json();
      const parsed = parse(body);
      if (!parsed) return null;
      memo.set(k, parsed);
      try {
        const dir = timingsDir(reciter);
        if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
        timingsFile(reciter, suraId).write(JSON.stringify(body));
      } catch {}
      return withLocalAudio(reciter, suraId, parsed);
    } catch {
      return null;
    }
  })().finally(() => {
    inFlight.delete(k);
  });

  inFlight.set(k, load);
  return load;
}

export function peekSurahAudio(reciter: string, suraId: number): SurahAudio | null {
  return memo.get(key(reciter, suraId)) ?? null;
}

export function verseAt(timings: VerseTiming[], ms: number): number {
  if (timings.length === 0) return 1;
  if (ms <= timings[0].fromMs) return timings[0].verseId;
  let lo = 0;
  let hi = timings.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const t = timings[mid];
    if (ms < t.fromMs) hi = mid - 1;
    else if (ms >= t.toMs) lo = mid + 1;
    else return t.verseId;
  }
  return timings[Math.min(lo, timings.length - 1)].verseId;
}

export function timingFor(timings: VerseTiming[], verseId: number): VerseTiming | null {
  const guess = timings[verseId - 1];
  if (guess?.verseId === verseId) return guess;
  return timings.find((t) => t.verseId === verseId) ?? null;
}

function audioDir(reciter: string): Directory {
  return new Directory(Paths.document, 'quran-surah-audio', reciter);
}

function audioFile(reciter: string, suraId: number): File {
  return new File(audioDir(reciter), `${suraId}.mp3`);
}

export function localSurahUri(reciter: string, suraId: number): string | null {
  try {
    const f = audioFile(reciter, suraId);
    return f.exists ? f.uri : null;
  } catch {
    return null;
  }
}

const downloading = new Map<string, Promise<void>>();

export function ensureSurahDownloaded(reciter: string, suraId: number): Promise<void> {
  const k = key(reciter, suraId);
  const existing = downloading.get(k);
  if (existing) return existing;
  if (localSurahUri(reciter, suraId)) return Promise.resolve();

  const job = (async () => {
    const audio = await getSurahAudio(reciter, suraId);
    if (!audio || audio.url.startsWith('file://')) return;
    const dir = audioDir(reciter);
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const part = new File(dir, `${suraId}.part`);
    if (part.exists) part.delete();
    await File.downloadFileAsync(audio.url, part, { idempotent: true });
    await part.move(audioFile(reciter, suraId));
  })()
    .catch(() => {})
    .finally(() => {
      downloading.delete(k);
    });

  downloading.set(k, job);
  return job;
}

export function isSurahDownloaded(reciter: string, suraId: number): boolean {
  return localSurahUri(reciter, suraId) != null;
}

export function deleteSurahDownload(reciter: string, suraId: number): void {
  try {
    const f = audioFile(reciter, suraId);
    if (f.exists) f.delete();
  } catch {}
  memo.delete(key(reciter, suraId));
}

function bismillahFile(reciter: string): File {
  return new File(audioDir(reciter), 'bismillah.mp3');
}

const BISMILLAH_CDN = 'https://cdn.islamic.network/quran/audio';

export function bismillahUri(reciter: string): string {
  try {
    const f = bismillahFile(reciter);
    if (f.exists) return f.uri;
  } catch {}
  return `${BISMILLAH_CDN}/${getReciterBitrate(reciter)}/${reciter}/1.mp3`;
}

export function ensureBismillahDownloaded(reciter: string): Promise<void> {
  const k = `${reciter}:bismillah`;
  const existing = downloading.get(k);
  if (existing) return existing;

  const job = (async () => {
    const dest = bismillahFile(reciter);
    if (dest.exists) return;
    const dir = audioDir(reciter);
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const part = new File(dir, 'bismillah.part');
    if (part.exists) part.delete();
    await File.downloadFileAsync(
      `${BISMILLAH_CDN}/${getReciterBitrate(reciter)}/${reciter}/1.mp3`,
      part,
      { idempotent: true }
    );
    await part.move(dest);
  })()
    .catch(() => {})
    .finally(() => {
      downloading.delete(k);
    });

  downloading.set(k, job);
  return job;
}

export function deleteSurahTimings(reciter: string, suraId: number): void {
  memo.delete(key(reciter, suraId));
  try {
    const f = timingsFile(reciter, suraId);
    if (f.exists) f.delete();
  } catch {}
}
