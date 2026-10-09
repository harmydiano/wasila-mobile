import type { SuraMeta } from './db';
import { getLocalAyahUri, getLocalBismillahUri } from './audioDownloads';
import { getReciterBitrate } from './reciters';

const CDN = 'https://cdn.islamic.network/quran/audio';

export const NO_HEADER_BISMILLAH = new Set([1, 9]);

export function getAyahAudioUrl(globalAyahNumber: number, reciter: string): string {
  return `${CDN}/${getReciterBitrate(reciter)}/${reciter}/${globalAyahNumber}.mp3`;
}

export function getBismillahAudioUrl(reciter: string): string {
  return getAyahAudioUrl(1, reciter);
}

export function getGlobalAyahNumber(suraId: number, verseId: number, suras: SuraMeta[]): number {
  let offset = 0;
  for (const s of suras) {
    if (s.suraId >= suraId) break;
    offset += s.verseCount;
  }
  return offset + verseId;
}

export function resolveAyahAudioUri(suraId: number, verseId: number, globalAyahNumber: number, reciter: string): string {
  return getLocalAyahUri(reciter, suraId, verseId) ?? getAyahAudioUrl(globalAyahNumber, reciter);
}

export function resolveBismillahAudioUri(suraId: number, reciter: string): string {
  return getLocalBismillahUri(reciter, suraId) ?? getBismillahAudioUrl(reciter);
}
