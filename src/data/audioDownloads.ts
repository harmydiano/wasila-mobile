import { Directory, File, Paths } from 'expo-file-system';
import { getSuraNames, getSuraMeta } from './db';
import { getAyahAudioUrl, getBismillahAudioUrl, getGlobalAyahNumber, NO_HEADER_BISMILLAH } from './audio';
import { deleteSurahDownload, deleteSurahTimings, localSurahUri } from './surahAudio';

function suraDir(reciter: string, suraId: number): Directory {
  return new Directory(Paths.document, 'quran-audio', reciter, String(suraId));
}
function ayahFile(reciter: string, suraId: number, verseId: number): File {
  return new File(suraDir(reciter, suraId), `${verseId}.mp3`);
}
function bismillahFile(reciter: string, suraId: number): File {
  return new File(suraDir(reciter, suraId), 'bismillah.mp3');
}

export function getLocalAyahUri(reciter: string, suraId: number, verseId: number): string | null {
  const f = ayahFile(reciter, suraId, verseId);
  return f.exists ? f.uri : null;
}

export function getLocalBismillahUri(reciter: string, suraId: number): string | null {
  const f = bismillahFile(reciter, suraId);
  return f.exists ? f.uri : null;
}

export function isSuraDownloaded(reciter: string, suraId: number): boolean {
  const meta = getSuraMeta(suraId);
  if (!meta) return false;
  for (let v = 1; v <= meta.verseCount; v++) {
    if (!ayahFile(reciter, suraId, v).exists) return false;
  }
  if (!NO_HEADER_BISMILLAH.has(suraId) && !bismillahFile(reciter, suraId).exists) return false;
  return true;
}

let holds = 0;
let waiters: Array<() => void> = [];

export function holdDownloads(): () => void {
  holds += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds = Math.max(0, holds - 1);
    if (holds === 0) {
      const pending = waiters;
      waiters = [];
      for (const w of pending) w();
    }
  };
}

function waitForPlaybackPrefetch(): Promise<void> {
  if (holds === 0) return Promise.resolve();
  return new Promise((resolve) => waiters.push(resolve));
}

export type DownloadProgress = { completed: number; total: number };

export async function downloadSura(
  reciter: string,
  suraId: number,
  onProgress?: (p: DownloadProgress) => void,
  fromVerse = 1
): Promise<void> {
  const meta = getSuraMeta(suraId);
  if (!meta) throw new Error(`Unknown sura ${suraId}`);
  const suras = getSuraNames();
  const dir = suraDir(reciter, suraId);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });

  const needsBismillah = !NO_HEADER_BISMILLAH.has(suraId);
  const jobs: Array<() => Promise<void>> = [];

  const start = Math.min(Math.max(1, Math.floor(fromVerse)), meta.verseCount);
  const order: number[] = [];
  for (let v = start; v <= meta.verseCount; v++) order.push(v);
  for (let v = 1; v < start; v++) order.push(v);

  const pushBismillah = () => {
    if (!needsBismillah) return;
    const dest = bismillahFile(reciter, suraId);
    if (!dest.exists) {
      jobs.push(() => File.downloadFileAsync(getBismillahAudioUrl(reciter), dest, { idempotent: true }).then(() => {}));
    }
  };

  if (start <= 1) pushBismillah();
  for (const v of order) {
    const dest = ayahFile(reciter, suraId, v);
    if (!dest.exists) {
      const url = getAyahAudioUrl(getGlobalAyahNumber(suraId, v, suras), reciter);
      jobs.push(() => File.downloadFileAsync(url, dest, { idempotent: true }).then(() => {}));
    }
  }
  if (start > 1) pushBismillah();

  const total = meta.verseCount + (needsBismillah ? 1 : 0);
  let completed = total - jobs.length;
  onProgress?.({ completed, total });

  const CONCURRENCY = 2;
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      await waitForPlaybackPrefetch();
      const job = jobs[next++];
      await job();
      completed++;
      onProgress?.({ completed, total });
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));
}

export function deleteSuraDownload(reciter: string, suraId: number): void {
  const dir = suraDir(reciter, suraId);
  if (dir.exists) dir.delete();
  deleteSurahDownload(reciter, suraId);
  deleteSurahTimings(reciter, suraId);
  complete.delete(`${reciter}:${suraId}`);
}

export type DownloadedEntry = { reciter: string; suraId: number; bytes: number };

export function listDownloads(): DownloadedEntry[] {
  const out: DownloadedEntry[] = [];
  const seen = new Set<string>();

  const surahRoot = new Directory(Paths.document, 'quran-surah-audio');
  if (surahRoot.exists) {
    for (const reciterEntry of surahRoot.list()) {
      if (!(reciterEntry instanceof Directory)) continue;
      for (const fileEntry of reciterEntry.list()) {
        if (fileEntry instanceof Directory) continue;
        if (!fileEntry.name.endsWith('.mp3')) continue;
        const suraId = Number(fileEntry.name.replace(/\.mp3$/, ''));
        if (!Number.isFinite(suraId)) continue;
        seen.add(`${reciterEntry.name}:${suraId}`);
        out.push({ reciter: reciterEntry.name, suraId, bytes: fileEntry.size ?? 0 });
      }
    }
  }

  const root = new Directory(Paths.document, 'quran-audio');
  if (root.exists) {
    for (const reciterEntry of root.list()) {
      if (!(reciterEntry instanceof Directory)) continue;
      for (const suraEntry of reciterEntry.list()) {
        if (!(suraEntry instanceof Directory)) continue;
        const suraId = Number(suraEntry.name);
        if (!Number.isFinite(suraId)) continue;
        if (seen.has(`${reciterEntry.name}:${suraId}`)) continue;
        out.push({ reciter: reciterEntry.name, suraId, bytes: suraEntry.size ?? 0 });
      }
    }
  }
  return out;
}

type Job = { promise: Promise<void> };

const jobs = new Map<string, Job>();
const complete = new Set<string>();

function key(reciter: string, suraId: number): string {
  return `${reciter}:${suraId}`;
}

export function isSuraCached(reciter: string, suraId: number): boolean {
  const k = key(reciter, suraId);
  if (complete.has(k)) return true;
  if (localSurahUri(reciter, suraId)) {
    complete.add(k);
    return true;
  }
  if (isSuraDownloaded(reciter, suraId)) {
    complete.add(k);
    return true;
  }
  return false;
}

export function ensureSuraDownloaded(reciter: string, suraId: number, fromVerse = 1): Promise<void> {
  const k = key(reciter, suraId);
  const existing = jobs.get(k);
  if (existing) return existing.promise;
  if (isSuraCached(reciter, suraId)) return Promise.resolve();

  const job: Job = { promise: Promise.resolve() };
  job.promise = downloadSura(reciter, suraId, undefined, fromVerse)
    .then(() => {
      complete.add(k);
    })
    .catch(() => {})
    .finally(() => {
      jobs.delete(k);
    });
  jobs.set(k, job);
  return job.promise;
}
