import { InteractionManager } from 'react-native';
import { importDatabaseFromAssetAsync, openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { fold, queryTerms } from '../utils/search';

export type SuraMeta = { suraId: number; arabic: string; transliterate: string; english: string; verseCount: number };
export type AllahName = { id: number; nameEn: string; nameAr: string; meaningEn: string };
export type Ayah = { suraId: number; verseId: number; ar: string; translit: string; en: string };

export function nonBreakingLabel(text: string): string {
  return text.replace(/ (?!\()/g, ' ');
}

export function normalizeTransliteration(name: string): string {
  return name
    .replace(/^([^A-Za-z]*)([a-z])/, (_, lead: string, ch: string) => lead + ch.toUpperCase())
    .replace(/-([a-z])/g, (_, ch: string) => '-' + ch.toUpperCase())
    .replace(/([\s(])([a-z])(?=[a-z]*-)/g, (_, pre: string, ch: string) => pre + ch.toUpperCase());
}

const DB_NAME = 'wasila_quran.db';
const DB_ASSET = require('../../assets/db/wasila_quran.db');

const DB_ASSET_VERSION = 3;

let dbPromise: Promise<SQLiteDatabase> | null = null;

function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      await importDatabaseFromAssetAsync(DB_NAME, { assetId: DB_ASSET });
      let db = await openDatabaseAsync(DB_NAME);

      const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      const installed = row?.user_version ?? 0;
      if (installed !== DB_ASSET_VERSION) {
        await db.closeAsync();
        await importDatabaseFromAssetAsync(DB_NAME, { assetId: DB_ASSET, forceOverwrite: true });
        db = await openDatabaseAsync(DB_NAME);
        await db.execAsync(`PRAGMA user_version = ${DB_ASSET_VERSION}`);
      }
      return db;
    })().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

let suraCache: SuraMeta[] | null = null;
let suraById: Map<number, SuraMeta> = new Map();
let nameCache: AllahName[] | null = null;
let referenceDataPromise: Promise<void> | null = null;

export function preloadReferenceData(): Promise<void> {
  if (!referenceDataPromise) {
    referenceDataPromise = (async () => {
      const db = await getDb();
      const [suraRows, nameRows] = await Promise.all([
        db.getAllAsync<{ sura_id: number; arabic: string; transliterate: string; english: string; verse_count: number }>(
          `SELECT sn.sura_id, sn.arabic, sn.transliterate, sn.english, COUNT(q.id) AS verse_count
           FROM SuraNames sn
           JOIN Quran q ON q.sura_id = sn.sura_id
           GROUP BY sn.sura_id
           ORDER BY sn.sura_id`
        ),
        db.getAllAsync<{ id: number; name_en: string; name_ar: string; meaning_en: string }>(
          'SELECT id, name_en, name_ar, meaning_en FROM AllahNames ORDER BY id'
        ),
      ]);
      suraCache = suraRows.map((r) => ({
        suraId: r.sura_id,
        arabic: nonBreakingLabel(r.arabic),
        transliterate: normalizeTransliteration(r.transliterate),
        english: r.english,
        verseCount: r.verse_count,
      }));
      suraById = new Map(suraCache.map((s) => [s.suraId, s]));
      nameCache = nameRows.map((r) => ({
        id: r.id,
        nameEn: r.name_en,
        nameAr: nonBreakingLabel(r.name_ar),
        meaningEn: r.meaning_en,
      }));
    })().catch((err) => {
      referenceDataPromise = null;
      throw err;
    });
  }
  return referenceDataPromise;
}

export function getAllahNames(): AllahName[] {
  return nameCache ?? [];
}

export function getSuraNames(): SuraMeta[] {
  return suraCache ?? [];
}

export function getSuraMeta(suraId: number): SuraMeta | null {
  return suraById.get(suraId) ?? null;
}

const suraVerseCache = new Map<number, Ayah[]>();

export function getCachedSuraVerses(suraId: number): Ayah[] | null {
  return suraVerseCache.get(suraId) ?? null;
}

const inFlight = new Map<number, Promise<Ayah[]>>();

export async function getSuraVerses(suraId: number): Promise<Ayah[]> {
  const cached = suraVerseCache.get(suraId);
  if (cached) return cached;

  const existing = inFlight.get(suraId);
  if (existing) return existing;

  const p = (async () => {
    const db = await getDb();
    const rows = await db.getAllAsync<{ sura_id: number; verse_id: number; ayah_ar: string; ayah_translit: string; ayah_en: string }>(
      'SELECT sura_id, verse_id, ayah_ar, ayah_translit, ayah_en FROM Quran WHERE sura_id = ? ORDER BY verse_id',
      suraId
    );
    const verses = rows.map((r) => ({ suraId: r.sura_id, verseId: r.verse_id, ar: r.ayah_ar, translit: r.ayah_translit, en: r.ayah_en }));
    suraVerseCache.set(suraId, verses);
    inFlight.delete(suraId);
    return verses;
  })();
  inFlight.set(suraId, p);
  return p;
}

export function prefetchSura(suraId: number): void {
  if (suraVerseCache.has(suraId) || inFlight.has(suraId)) return;
  getSuraVerses(suraId).catch(() => {});
}

const WARM_CHUNK = 10;
let warmPromise: Promise<void> | null = null;
let warmComplete = false;
let warmAborted = false;

export function isVerseCacheWarm(): boolean {
  return warmComplete;
}

export function stopVerseWarm(): void {
  warmAborted = true;
}

export function warmAllVerses(): Promise<void> {
  if (!warmPromise) {
    warmAborted = false;
    warmPromise = (async () => {
      await new Promise<void>((resolve) => {
        let done = false;
        const finish = () => {
          if (!done) {
            done = true;
            resolve();
          }
        };
        InteractionManager.runAfterInteractions(finish);
        setTimeout(finish, 2000);
      });
      if (warmAborted) return;
      const db = await getDb();

      const order = (suraCache ?? [])
        .slice()
        .sort((a, b) => b.verseCount - a.verseCount)
        .map((s) => s.suraId);

      for (let i = 0; i < order.length; i += WARM_CHUNK) {
        if (warmAborted) return;
        const ids = order.slice(i, i + WARM_CHUNK).filter((id) => !suraVerseCache.has(id));
        if (ids.length) {
          const placeholders = ids.map(() => '?').join(',');
          const rows = await db.getAllAsync<{ sura_id: number; verse_id: number; ayah_ar: string; ayah_translit: string; ayah_en: string }>(
            `SELECT sura_id, verse_id, ayah_ar, ayah_translit, ayah_en
             FROM Quran WHERE sura_id IN (${placeholders}) ORDER BY sura_id, verse_id`,
            ids
          );
          const grouped = new Map<number, Ayah[]>();
          for (const r of rows) {
            let list = grouped.get(r.sura_id);
            if (!list) {
              list = [];
              grouped.set(r.sura_id, list);
            }
            list.push({ suraId: r.sura_id, verseId: r.verse_id, ar: r.ayah_ar, translit: r.ayah_translit, en: r.ayah_en });
          }
          for (const [id, verses] of grouped) {
            if (!suraVerseCache.has(id)) suraVerseCache.set(id, verses);
          }
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
      warmComplete = true;
    })().catch(() => {
      warmPromise = null;
    });
  }
  return warmPromise;
}

type FoldedAyah = { ayah: Ayah; text: string };
let foldedIndex: FoldedAyah[] | null = null;
let foldedBuilding: Promise<FoldedAyah[]> | null = null;

async function ayahIndex(): Promise<FoldedAyah[]> {
  if (foldedIndex) return foldedIndex;
  if (!foldedBuilding) {
    foldedBuilding = (async () => {
      await warmAllVerses();
      const ids = (suraCache ?? []).map((s) => s.suraId);
      await Promise.all(ids.filter((id) => !suraVerseCache.has(id)).map((id) => getSuraVerses(id)));
      const out: FoldedAyah[] = [];
      for (const id of [...ids].sort((a, b) => a - b)) {
        for (const ayah of suraVerseCache.get(id) ?? []) {
          out.push({ ayah, text: `${fold(ayah.en)} | ${fold(ayah.translit)} | ${fold(ayah.ar)}` });
        }
      }
      foldedIndex = out;
      return out;
    })().finally(() => {
      foldedBuilding = null;
    });
  }
  return foldedBuilding;
}

export function warmAyahIndex(): void {
  ayahIndex().catch(() => {});
}

export async function searchAyahs(q: string, limit = 60): Promise<{ hits: Ayah[]; total: number }> {
  const terms = queryTerms(q);
  if (!terms.length) return { hits: [], total: 0 };
  const index = await ayahIndex();
  const hits: Ayah[] = [];
  let total = 0;
  for (const { ayah, text } of index) {
    if (terms.every((t) => text.includes(t))) {
      total += 1;
      if (hits.length < limit) hits.push(ayah);
    }
  }
  return { hits, total };
}
