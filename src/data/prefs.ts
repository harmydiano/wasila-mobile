import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const PREFS_DB = 'wasila_prefs.db';

export const KEYS = {
  onboarded: 'onboarding_completed',
  saved: 'saved_benefits',
  needs: 'needs',
  reminders: 'reminders',
  arabicSize: 'arabic_size',
  lang: 'lang',
  premium: 'premium',
  auth: 'auth',
  prayerLog: 'prayer_log_v2',
  adhanEnabled: 'adhan_enabled',
  adhanPrayers: 'adhan_prayers_v1',
  uiVersion: 'ui_version',
  reciter: 'reciter',
  prayerMethod: 'prayer_method_v1',
  selectedNeedCat: 'selected_need_cat_v1',
  practice: 'practice_v1',
  benefitsSort: 'benefits_sort_v1',
  benefitText: 'benefit_text_v1',
  benefitReports: 'benefit_reports_v1',
  benefitHelpful: 'benefit_helpful_v1',
  benefitRecited: 'benefit_recited_v1',
  quranProgress: 'quran_progress_v1',
  quranAudio: 'quran_audio_v1',
  quranReader: 'quran_reader_v1',

  moreSaved: 'more_saved_v1',
  morePractice: 'more_practice_v1',
  zakat: 'zakat_v1',
  hijriDays: 'hijri_days_v1',
  hijriMonths: 'hijri_months_v1',
  hijriToday: 'hijri_today_v1',
  hijriAnchors: 'hijri_anchors_v1',
  hijriOffset: 'hijri_offset_v1',
  salaats: 'salaats_v1',

  benefitCatalogue: 'content_benefit_catalogue_v1',
  benefitBodyFree: 'content_benefit_body_free_v1:',
  benefitBodyPlus: 'content_benefit_body_plus_v1:',
} as const;

const CONTENT_PREFIX = 'content_';

let prefsPromise: Promise<SQLiteDatabase> | null = null;

function getPrefsDb(): Promise<SQLiteDatabase> {
  if (!prefsPromise) {
    prefsPromise = (async () => {
      const db = await openDatabaseAsync(PREFS_DB);
      await db.execAsync('CREATE TABLE IF NOT EXISTS Prefs (key TEXT PRIMARY KEY NOT NULL, value TEXT)');
      return db;
    })().catch((err) => {
      prefsPromise = null;
      throw err;
    });
  }
  return prefsPromise;
}

export async function getRaw(key: string): Promise<string | null> {
  const db = await getPrefsDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM Prefs WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setRaw(key: string, value: string): Promise<void> {
  const db = await getPrefsDb();
  await db.runAsync('INSERT OR REPLACE INTO Prefs (key, value) VALUES (?, ?)', key, value);
}

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await getRaw(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  try {
    await setRaw(key, JSON.stringify(value));
  } catch {
  }
}

export async function removeByPrefix(prefix: string): Promise<void> {
  try {
    const db = await getPrefsDb();
    await db.runAsync('DELETE FROM Prefs WHERE substr(key, 1, ?) = ?', prefix.length, prefix);
  } catch {
  }
}

export async function getAllJSON(): Promise<Record<string, unknown>> {
  try {
    const db = await getPrefsDb();
    const rows = await db.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM Prefs WHERE substr(key, 1, ?) <> ?',
      CONTENT_PREFIX.length,
      CONTENT_PREFIX
    );
    const out: Record<string, unknown> = {};
    for (const r of rows) {
      try {
        out[r.key] = JSON.parse(r.value);
      } catch {
        out[r.key] = r.value;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    return (await getRaw(KEYS.onboarded)) === '1';
  } catch {
    return false;
  }
}

export async function markOnboardingCompleted(): Promise<void> {
  try {
    await setRaw(KEYS.onboarded, '1');
  } catch {
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await setRaw(KEYS.onboarded, '0');
  } catch {
  }
}

export type UiVersion = 'v1' | 'v2' | 'v3';

export async function getUiVersion(): Promise<UiVersion> {
  try {
    const raw = await getRaw(KEYS.uiVersion);
    if (raw === 'v1' || raw === 'v2' || raw === 'v3') return raw;
    return 'v3';
  } catch {
    return 'v3';
  }
}

export async function setUiVersionPref(v: UiVersion): Promise<void> {
  try {
    await setRaw(KEYS.uiVersion, v);
  } catch {
  }
}

export async function getSelectedNeedCat(): Promise<string | null> {
  try {
    return await getRaw(KEYS.selectedNeedCat);
  } catch {
    return null;
  }
}

export async function setSelectedNeedCat(catId: string): Promise<void> {
  try {
    await setRaw(KEYS.selectedNeedCat, catId);
  } catch {
  }
}

export type BenefitsSort = { sort: string; hidePremium: boolean };

const BENEFITS_SORT_DEFAULT: BenefitsSort = { sort: 'az', hidePremium: false };

export async function getBenefitsSort(): Promise<BenefitsSort> {
  const v = await getJSON<Partial<BenefitsSort>>(KEYS.benefitsSort, BENEFITS_SORT_DEFAULT);
  return {
    sort: typeof v.sort === 'string' ? v.sort : BENEFITS_SORT_DEFAULT.sort,
    hidePremium: v.hidePremium === true,
  };
}

export async function setBenefitsSort(v: BenefitsSort): Promise<void> {
  await setJSON(KEYS.benefitsSort, v);
}

export type BenefitTextPrefs = {
  showTranslit: boolean;
  showTranslation: boolean;
  splitPassage: boolean;
  keepAwake: boolean;
  countMode: 'tap' | 'sound' | 'haptic';
};

export const BENEFIT_TEXT_DEFAULT: BenefitTextPrefs = {
  showTranslit: true,
  showTranslation: true,
  splitPassage: true,
  keepAwake: false,
  countMode: 'tap',
};

export async function getBenefitText(): Promise<BenefitTextPrefs> {
  const v = await getJSON<Partial<BenefitTextPrefs>>(KEYS.benefitText, BENEFIT_TEXT_DEFAULT);
  const mode = v.countMode;
  return {
    showTranslit: v.showTranslit !== false,
    showTranslation: v.showTranslation !== false,
    splitPassage: v.splitPassage !== false,
    keepAwake: v.keepAwake === true,
    countMode: mode === 'sound' || mode === 'haptic' ? mode : 'tap',
  };
}

export async function setBenefitText(v: BenefitTextPrefs): Promise<void> {
  await setJSON(KEYS.benefitText, v);
}
