import { getSuraNames } from './db';

export const JUZ_STARTS: readonly [number, number][] = [
  [1, 1], [2, 142], [2, 253], [3, 92], [4, 24], [4, 148], [5, 82], [6, 111],
  [7, 88], [8, 41], [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75],
  [21, 1], [23, 1], [25, 21], [27, 56], [29, 46], [33, 31], [36, 28], [39, 32],
  [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1],
];

export const TOTAL_AYAT = 6236;

let offsets: number[] | null = null;

function suraOffsets(): number[] {
  if (offsets) return offsets;
  const suras = getSuraNames();
  if (suras.length === 0) return [];
  const out: number[] = [0, 0];
  let running = 0;
  for (const s of suras) {
    out[s.suraId] = running;
    running += s.verseCount;
  }
  offsets = out;
  return out;
}

export function globalAyahIndex(suraId: number, verseId: number): number {
  const off = suraOffsets();
  const base = off[suraId];
  if (base == null) return 0;
  return base + Math.max(1, verseId);
}

export function juzOfIndex(index: number): number {
  if (index <= 0) return 1;
  for (let j = JUZ_STARTS.length - 1; j >= 0; j--) {
    const [s, v] = JUZ_STARTS[j];
    if (index >= globalAyahIndex(s, v)) return j + 1;
  }
  return 1;
}

export type JuzRow = {
  juz: number;
  suraId: number;
  verseId: number;
  range: string;
  ayahCount: number;
};

export function juzRows(): JuzRow[] {
  const suras = getSuraNames();
  if (suras.length === 0) return [];
  const nameOf = (id: number) => suras.find((s) => s.suraId === id)?.transliterate ?? `Sura ${id}`;

  return JUZ_STARTS.map(([suraId, verseId], i) => {
    const startIdx = globalAyahIndex(suraId, verseId);
    const next = JUZ_STARTS[i + 1];
    const endIdx = next ? globalAyahIndex(next[0], next[1]) - 1 : TOTAL_AYAT;
    let endSura = suraId;
    for (const s of suras) {
      if (globalAyahIndex(s.suraId, 1) <= endIdx) endSura = s.suraId;
      else break;
    }
    const endVerse = endIdx - globalAyahIndex(endSura, 1) + 1;
    const from = `${nameOf(suraId)} ${verseId}`;
    const to = `${nameOf(endSura)} ${endVerse}`;
    return {
      juz: i + 1,
      suraId,
      verseId,
      range: from === to ? from : `${from} – ${to}`,
      ayahCount: endIdx - startIdx + 1,
    };
  });
}
