import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { PixelRatio, AppState as RNAppState } from 'react-native';
import { KEYS, getAllJSON, setJSON, BENEFIT_TEXT_DEFAULT, type BenefitTextPrefs } from '../data/prefs';
import { dayKey, isLogged, togglePrayer, DAILY_PRAYERS, type PrayerLog, type PrayerName } from '../utils/prayerLog';
import { DEFAULT_RECITER } from '../data/reciters';
import { DEFAULT_PRAYER_METHOD, type PrayerMethod } from '../data/prayerMethods';
import { loadSession, useAccount } from '../data/session';
import { deleteAccount as authDeleteAccount, signOut as authSignOut } from '../data/authFlow';
import { clampNights, holdUnbegun } from '../utils/practice';
import { CATS } from '../data/content';
import { indexOfSlug } from '../data/benefits';
import {
  dropPaidBodies, fetchMe, freeSlugs, loadCachedCatalogue, prefetchBodies, refreshCatalogue, useContentRev,
} from '../data/remoteBenefits';

export type PracticeState = {
  catId: string;
  duaIdx: number;
  slug?: string;
  target: number;
  totalNights: number;
  segments: number;
  segment: number;
  targets?: number[];
  startedDateKey: string;
  tallyDateKey: string;
  tally: number;
  completedDates: string[];
} | null;

export type MorePractice = {
  kind: 'salawat' | 'name';
  id: string;
  title: string;
  target: number | null;
  done: number;
  doneDateKey: string;
  day: number;
  of: number;
} | null;

export type ZakatState = {
  cash: number;
  metals: number;
  owedToYou: number;
  debts: number;
  threshold: 'silver' | 'gold';
};

type AppStateValue = {
  hydrated: boolean;
  contentRev: number;

  premium: boolean;
  setPremium: (v: boolean) => void;
  subscribe: (plan: 'monthly' | 'yearly') => void;

  signedIn: boolean;
  authName: string;
  authEmail: string;
  signIn: (name: string, email: string) => void;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;

  saved: Record<string, boolean>;
  toggleSaved: (key: string) => void;
  isSaved: (key: string) => boolean;

  prayerLog: PrayerLog;
  toggleLog: (name: string, date?: Date) => void;
  isPrayerLogged: (name: string, date?: Date) => boolean;

  needs: Record<string, boolean>;
  toggleNeed: (name: string) => void;

  reminders: Record<string, boolean>;
  toggleReminder: (name: string) => void;

  adhanEnabled: boolean;
  setAdhanEnabled: (v: boolean) => void;

  adhanPrayers: Record<PrayerName, boolean>;
  toggleAdhanPrayer: (name: PrayerName) => void;

  arabicSize: number;
  setArabicSize: (n: number) => void;
  lang: string;
  setLang: (l: string) => void;

  reciter: string;
  setReciter: (id: string) => void;

  prayerMethod: PrayerMethod;
  setPrayerMethod: (pm: PrayerMethod) => void;

  paywallVisible: boolean;
  openPaywall: () => void;
  closePaywall: () => void;

  giftVisible: boolean;
  showGift: () => void;
  closeGift: () => void;

  benefitText: BenefitTextPrefs;
  setBenefitText: (v: Partial<BenefitTextPrefs>) => void;
  resetBenefitText: () => void;

  benefitReports: Record<string, 'beneficial'>;
  reportBeneficial: (key: string) => void;
  withdrawReport: (key: string) => void;

  benefitHelpful: Record<string, boolean>;
  toggleHelpful: (key: string) => void;

  benefitRecited: Record<string, string[]>;
  markRecited: (key: string, date?: Date) => void;
  unmarkRecited: (key: string, date?: Date) => void;

  practice: PracticeState;
  startPractice: (catId: string, duaIdx: number, target: number | number[], totalNights: number, segments?: number) => void;
  finishPracticeToday: () => void;
  creditPractice: (amount: number) => void;
  setPracticeTally: (n: number) => void;
  endPractice: () => void;

  moreSaved: Record<string, boolean>;
  toggleMoreSaved: (key: string) => void;
  morePractice: MorePractice;
  startMorePractice: (p: NonNullable<MorePractice>) => void;
  creditMorePractice: (amount: number) => void;
  endMorePractice: () => void;
  zakat: ZakatState;
  setZakat: (v: Partial<ZakatState>) => void;
};

const Ctx = createContext<AppStateValue | null>(null);

const DEFAULTS = {
  saved: {} as Record<string, boolean>,
  prayerLog: {} as PrayerLog,
  needs: {} as Record<string, boolean>,
  reminders: { 'After Fajr': true, 'After Maghrib': true, 'Unfinished counts': false } as Record<string, boolean>,
  arabicSize: Math.round(Math.min(44, Math.max(24, 30 * PixelRatio.getFontScale()))),
  lang: 'English',
  adhanEnabled: false,
  adhanPrayers: Object.fromEntries(DAILY_PRAYERS.map((p) => [p, true])) as Record<PrayerName, boolean>,
  premium: false,
  auth: { signedIn: false, name: '', email: '' },
  reciter: DEFAULT_RECITER,
  prayerMethod: DEFAULT_PRAYER_METHOD,
  benefitText: BENEFIT_TEXT_DEFAULT,
  benefitReports: {} as Record<string, 'beneficial'>,
  benefitHelpful: {} as Record<string, boolean>,
  benefitRecited: {} as Record<string, string[]>,
  moreSaved: {} as Record<string, boolean>,
  zakat: { cash: 12400, metals: 2150, owedToYou: 600, debts: 3100, threshold: 'silver' } as ZakatState,
};

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  const [premium, setPremiumState] = useState(DEFAULTS.premium);
  const account = useAccount();
  const [saved, setSaved] = useState(DEFAULTS.saved);
  const [prayerLog, setPrayerLog] = useState<PrayerLog>(DEFAULTS.prayerLog);
  const [needs, setNeeds] = useState(DEFAULTS.needs);
  const [reminders, setReminders] = useState(DEFAULTS.reminders);
  const [adhanEnabled, setAdhanEnabledState] = useState(DEFAULTS.adhanEnabled);
  const [adhanPrayers, setAdhanPrayersState] = useState(DEFAULTS.adhanPrayers);
  const [arabicSize, setArabicSizeState] = useState(DEFAULTS.arabicSize);
  const [lang, setLangState] = useState(DEFAULTS.lang);
  const [reciter, setReciterState] = useState(DEFAULTS.reciter);
  const [prayerMethod, setPrayerMethodState] = useState<PrayerMethod>(DEFAULTS.prayerMethod);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [giftVisible, setGiftVisible] = useState(false);
  const [practice, setPractice] = useState<PracticeState>(null);
  const [benefitText, setBenefitTextState] = useState<BenefitTextPrefs>(DEFAULTS.benefitText);
  const [benefitReports, setBenefitReports] = useState(DEFAULTS.benefitReports);
  const [benefitHelpful, setBenefitHelpful] = useState(DEFAULTS.benefitHelpful);
  const [benefitRecited, setBenefitRecited] = useState(DEFAULTS.benefitRecited);
  const [moreSaved, setMoreSaved] = useState(DEFAULTS.moreSaved);
  const [morePractice, setMorePractice] = useState<MorePractice>(null);
  const [zakat, setZakatState] = useState<ZakatState>(DEFAULTS.zakat);

  useEffect(() => {
    let alive = true;
    Promise.all([getAllJSON(), loadCachedCatalogue(), loadSession()])
      .then(([stored]) => {
        if (!alive) return;
        if (stored[KEYS.premium] != null) setPremiumState(stored[KEYS.premium] as boolean);
        if (stored[KEYS.saved] != null) setSaved(stored[KEYS.saved] as Record<string, boolean>);
        if (stored[KEYS.prayerLog] != null) setPrayerLog(stored[KEYS.prayerLog] as PrayerLog);
        if (stored[KEYS.needs] != null) setNeeds(stored[KEYS.needs] as Record<string, boolean>);
        if (stored[KEYS.reminders] != null) setReminders(stored[KEYS.reminders] as Record<string, boolean>);
        if (stored[KEYS.adhanEnabled] != null) setAdhanEnabledState(stored[KEYS.adhanEnabled] as boolean);
        if (stored[KEYS.adhanPrayers] != null) {
          setAdhanPrayersState({
            ...DEFAULTS.adhanPrayers,
            ...(stored[KEYS.adhanPrayers] as Partial<Record<PrayerName, boolean>>),
          });
        }
        if (stored[KEYS.arabicSize] != null) setArabicSizeState(stored[KEYS.arabicSize] as number);
        if (stored[KEYS.lang] != null) setLangState(stored[KEYS.lang] as string);
        if (stored[KEYS.reciter] != null) setReciterState(stored[KEYS.reciter] as string);
        if (stored[KEYS.prayerMethod] != null) setPrayerMethodState({ ...DEFAULTS.prayerMethod, ...(stored[KEYS.prayerMethod] as Partial<PrayerMethod>) });
        if (stored[KEYS.practice] != null) {
          const p = stored[KEYS.practice] as PracticeState;
          setPractice(
            p
              ? holdUnbegun(
                  { ...p, totalNights: clampNights(p.totalNights), segments: Math.max(1, p.segments ?? 1), segment: p.segment ?? 0 },
                  dayKey(new Date())
                )
              : p
          );
        }
        if (stored[KEYS.benefitText] != null)
          setBenefitTextState({ ...BENEFIT_TEXT_DEFAULT, ...(stored[KEYS.benefitText] as object) });
        if (stored[KEYS.benefitReports] != null)
          setBenefitReports(stored[KEYS.benefitReports] as Record<string, 'beneficial'>);
        if (stored[KEYS.benefitHelpful] != null)
          setBenefitHelpful(stored[KEYS.benefitHelpful] as Record<string, boolean>);
        if (stored[KEYS.benefitRecited] != null)
          setBenefitRecited(stored[KEYS.benefitRecited] as Record<string, string[]>);
        if (stored[KEYS.moreSaved] != null)
          setMoreSaved(stored[KEYS.moreSaved] as Record<string, boolean>);
        if (stored[KEYS.morePractice] != null)
          setMorePractice(stored[KEYS.morePractice] as MorePractice);
        if (stored[KEYS.zakat] != null)
          setZakatState({ ...DEFAULTS.zakat, ...(stored[KEYS.zakat] as Partial<ZakatState>) });
      })
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const ready = useRef(false);
  useEffect(() => {
    ready.current = hydrated;
  }, [hydrated]);
  const persist = useCallback((key: string, value: unknown) => {
    if (ready.current) setJSON(key, value);
  }, []);

  const toggleSaved = useCallback(
    (key: string) => {
      setSaved((s) => {
        const next = { ...s };
        if (next[key]) delete next[key];
        else next[key] = true;
        persist(KEYS.saved, next);
        return next;
      });
    },
    [persist]
  );
  const isSaved = useCallback((key: string) => !!saved[key], [saved]);

  const toggleLog = useCallback(
    (name: string, date?: Date) => {
      setPrayerLog((log) => {
        const next = togglePrayer(log, date ?? new Date(), name);
        persist(KEYS.prayerLog, next);
        return next;
      });
    },
    [persist]
  );
  const isPrayerLogged = useCallback(
    (name: string, date?: Date) => isLogged(prayerLog, date ?? new Date(), name),
    [prayerLog]
  );

  const toggleNeed = useCallback(
    (name: string) => {
      setNeeds((s) => {
        const next = { ...s, [name]: !s[name] };
        persist(KEYS.needs, next);
        return next;
      });
    },
    [persist]
  );

  const toggleReminder = useCallback(
    (name: string) => {
      setReminders((s) => {
        const next = { ...s, [name]: !s[name] };
        persist(KEYS.reminders, next);
        return next;
      });
    },
    [persist]
  );

  const setAdhanEnabled = useCallback(
    (v: boolean) => {
      setAdhanEnabledState(v);
      persist(KEYS.adhanEnabled, v);
    },
    [persist]
  );

  const toggleAdhanPrayer = useCallback(
    (name: PrayerName) => {
      setAdhanPrayersState((s) => {
        const next = { ...s, [name]: !s[name] };
        persist(KEYS.adhanPrayers, next);
        return next;
      });
    },
    [persist]
  );

  const setArabicSize = useCallback(
    (n: number) => {
      setArabicSizeState(n);
      persist(KEYS.arabicSize, n);
    },
    [persist]
  );

  const setLang = useCallback(
    (l: string) => {
      setLangState(l);
      persist(KEYS.lang, l);
    },
    [persist]
  );

  const setReciter = useCallback(
    (id: string) => {
      setReciterState(id);
      persist(KEYS.reciter, id);
    },
    [persist]
  );

  const setPrayerMethod = useCallback(
    (pm: PrayerMethod) => {
      setPrayerMethodState(pm);
      persist(KEYS.prayerMethod, pm);
    },
    [persist]
  );

  const setBenefitText = useCallback(
    (patch: Partial<BenefitTextPrefs>) => {
      setBenefitTextState((v) => {
        const next = { ...v, ...patch };
        persist(KEYS.benefitText, next);
        return next;
      });
    },
    [persist]
  );

  const resetBenefitText = useCallback(() => {
    setBenefitTextState(BENEFIT_TEXT_DEFAULT);
    persist(KEYS.benefitText, BENEFIT_TEXT_DEFAULT);
  }, [persist]);

  const reportBeneficial = useCallback(
    (key: string) => {
      setBenefitReports((r) => {
        const next = { ...r, [key]: 'beneficial' as const };
        persist(KEYS.benefitReports, next);
        return next;
      });
    },
    [persist]
  );

  const withdrawReport = useCallback(
    (key: string) => {
      setBenefitReports((r) => {
        if (!r[key]) return r;
        const next = { ...r };
        delete next[key];
        persist(KEYS.benefitReports, next);
        return next;
      });
    },
    [persist]
  );

  const toggleHelpful = useCallback(
    (key: string) => {
      setBenefitHelpful((h) => {
        const next = { ...h };
        if (next[key]) delete next[key];
        else next[key] = true;
        persist(KEYS.benefitHelpful, next);
        return next;
      });
    },
    [persist]
  );

  const markRecited = useCallback(
    (key: string, date?: Date) => {
      const day = dayKey(date ?? new Date());
      setBenefitRecited((r) => {
        const dates = r[key] ?? [];
        if (dates.includes(day)) return r;
        const next = { ...r, [key]: [...dates, day].sort() };
        persist(KEYS.benefitRecited, next);
        return next;
      });
    },
    [persist]
  );

  const unmarkRecited = useCallback(
    (key: string, date?: Date) => {
      const day = dayKey(date ?? new Date());
      setBenefitRecited((r) => {
        const dates = r[key] ?? [];
        if (!dates.includes(day)) return r;
        const next = { ...r, [key]: dates.filter((d) => d !== day) };
        persist(KEYS.benefitRecited, next);
        return next;
      });
    },
    [persist]
  );

  const startPractice = useCallback(
    (catId: string, duaIdx: number, target: number | number[], totalNights: number, segments = 1) => {
      const todayKey = dayKey(new Date());
      const list = Array.isArray(target) ? target.map((t) => Math.max(1, t)) : null;
      const mixed = !!list && list.length > 1 && list.some((t) => t !== list[0]);
      const slug = CATS.find((c) => c.id === catId)?.duas[duaIdx]?.recordSlug;
      const next: PracticeState = {
        catId, duaIdx,
        ...(slug ? { slug } : {}),
        target: Array.isArray(target) ? list?.[0] ?? 1 : target,
        ...(mixed ? { targets: list! } : {}),
        totalNights: clampNights(totalNights),
        segments: Math.max(1, list ? list.length : segments),
        segment: 0,
        startedDateKey: todayKey, tallyDateKey: todayKey, tally: 0, completedDates: [],
      };
      setPractice(next);
      persist(KEYS.practice, next);
    },
    [persist]
  );

  const writeTally = useCallback(
    (held: NonNullable<PracticeState>, nextTally: number): PracticeState => {
      const todayKey = dayKey(new Date());
      const p = holdUnbegun(held, todayKey);
      const clamped = Math.max(0, Math.min(p.target, nextTally));
      const segments = Math.max(1, p.segments ?? 1);
      const segment = Math.min(segments - 1, Math.max(0, p.segment ?? 0));

      if (clamped >= p.target && segment < segments - 1) {
        return {
          ...p, segments, tallyDateKey: todayKey, tally: 0, segment: segment + 1,
          target: p.targets?.[segment + 1] ?? p.target,
        };
      }

      const completedDates =
        clamped >= p.target && !p.completedDates.includes(todayKey)
          ? [...p.completedDates, todayKey]
          : p.completedDates;
      const wrapped = clamped >= p.target && segments > 1;
      return {
        ...p,
        segments,
        segment: wrapped ? 0 : segment,
        target: wrapped ? p.targets?.[0] ?? p.target : p.target,
        tallyDateKey: todayKey,
        tally: wrapped ? 0 : clamped,
        completedDates,
      };
    },
    []
  );

  const creditPractice = useCallback(
    (amount: number) => {
      setPractice((p) => {
        if (!p) return p;
        const todayKey = dayKey(new Date());
        const base = p.tallyDateKey === todayKey ? p.tally : 0;
        const next = writeTally(p, base + amount);
        persist(KEYS.practice, next);
        return next;
      });
    },
    [writeTally, persist]
  );

  const setPracticeTally = useCallback(
    (n: number) => {
      setPractice((p) => {
        if (!p) return p;
        let next = writeTally(p, n);
        const todayKey = dayKey(new Date());
        if (next && n < p.target && Math.max(1, p.segments ?? 1) === 1 && next.completedDates.includes(todayKey)) {
          next = { ...next, completedDates: next.completedDates.filter((d) => d !== todayKey) };
        }
        persist(KEYS.practice, next);
        return next;
      });
    },
    [writeTally, persist]
  );

  const finishPracticeToday = useCallback(() => {
    setPractice((held) => {
      if (!held) return held;
      const todayKey = dayKey(new Date());
      const p = holdUnbegun(held, todayKey);
      const next: PracticeState = {
        ...p,
        segment: 0,
        target: p.targets?.[0] ?? p.target,
        tallyDateKey: todayKey,
        tally: Math.max(1, p.segments ?? 1) > 1 ? 0 : p.target,
        completedDates: p.completedDates.includes(todayKey) ? p.completedDates : [...p.completedDates, todayKey],
      };
      persist(KEYS.practice, next);
      return next;
    });
  }, [persist]);

  const endPractice = useCallback(() => {
    setPractice(null);
    persist(KEYS.practice, null);
  }, [persist]);

  const toggleMoreSaved = useCallback(
    (key: string) => {
      setMoreSaved((s) => {
        const next = { ...s };
        if (next[key]) delete next[key];
        else next[key] = true;
        persist(KEYS.moreSaved, next);
        return next;
      });
    },
    [persist]
  );

  const startMorePractice = useCallback(
    (p: NonNullable<MorePractice>) => {
      setMorePractice(p);
      persist(KEYS.morePractice, p);
    },
    [persist]
  );

  const creditMorePractice = useCallback(
    (amount: number) => {
      setMorePractice((p) => {
        if (!p) return p;
        const today = dayKey(new Date());
        const base = p.doneDateKey === today ? p.done : 0;
        const next = { ...p, done: base + amount, doneDateKey: today };
        persist(KEYS.morePractice, next);
        return next;
      });
    },
    [persist]
  );

  const endMorePractice = useCallback(() => {
    setMorePractice(null);
    persist(KEYS.morePractice, null);
  }, [persist]);

  const setZakat = useCallback(
    (v: Partial<ZakatState>) => {
      setZakatState((z) => {
        const next = { ...z, ...v };
        persist(KEYS.zakat, next);
        return next;
      });
    },
    [persist]
  );

  const setPremium = useCallback(
    (v: boolean) => {
      setPremiumState(v);
      persist(KEYS.premium, v);
    },
    [persist]
  );

  const savedRef = useRef(saved);
  savedRef.current = saved;
  const practiceRef = useRef(practice);
  practiceRef.current = practice;

  useEffect(() => {
    if (!hydrated) return;
    let alive = true;
    const sync = async () => {
      const [me] = await Promise.all([fetchMe(), refreshCatalogue()]);
      if (!alive || !me) return;
      if (!me.plus) await dropPaidBodies();
      setPremium(me.plus);
      const mine = me.plus
        ? [...Object.keys(savedRef.current).filter((k) => savedRef.current[k]), practiceRef.current?.slug ?? '']
        : [];
      prefetchBodies([...freeSlugs(), ...mine]);
    };
    sync();
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s === 'active') sync();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, [hydrated, setPremium, account?.id]);

  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (s) => {
      if (s !== 'active') return;
      setPractice((p) => {
        if (!p) return p;
        const next = holdUnbegun(p, dayKey(new Date()));
        if (next !== p) persist(KEYS.practice, next);
        return next;
      });
    });
    return () => sub.remove();
  }, [persist]);

  const contentRev = useContentRev();
  useEffect(() => {
    setPractice((p) => {
      if (!p?.slug) return p;
      const idx = indexOfSlug(p.catId, p.slug);
      if (idx < 0 || idx === p.duaIdx) return p;
      const next = { ...p, duaIdx: idx };
      persist(KEYS.practice, next);
      return next;
    });
  }, [contentRev, persist]);

  const signIn = useCallback((_name: string, _email: string) => {}, []);

  const signOut = useCallback(() => authSignOut(), []);

  const deleteAccount = useCallback(async () => (await authDeleteAccount()).ok, []);

  const subscribe = useCallback(
    (_plan: 'monthly' | 'yearly') => {
      setPremium(true);
      setPaywallVisible(false);
    },
    [setPremium]
  );

  const value = useMemo<AppStateValue>(
    () => ({
      hydrated,
      contentRev,
      premium,
      setPremium,
      subscribe,
      signedIn: !!account,
      authName: account?.name ?? '',
      authEmail: account?.email ?? '',
      signIn,
      signOut,
      deleteAccount,
      saved,
      toggleSaved,
      isSaved,
      prayerLog,
      toggleLog,
      isPrayerLogged,
      needs,
      toggleNeed,
      reminders,
      toggleReminder,
      adhanEnabled,
      setAdhanEnabled,
      adhanPrayers,
      toggleAdhanPrayer,
      arabicSize,
      setArabicSize,
      lang,
      setLang,
      reciter,
      prayerMethod,
      setPrayerMethod,
      setReciter,
      paywallVisible,
      openPaywall: () => setPaywallVisible(true),
      closePaywall: () => setPaywallVisible(false),
      giftVisible,
      showGift: () => setGiftVisible(true),
      closeGift: () => setGiftVisible(false),
      benefitText,
      setBenefitText,
      resetBenefitText,
      benefitReports,
      reportBeneficial,
      withdrawReport,
      benefitHelpful,
      toggleHelpful,
      benefitRecited,
      markRecited,
      unmarkRecited,
      practice,
      startPractice,
      finishPracticeToday,
      creditPractice,
      setPracticeTally,
      endPractice,
      moreSaved,
      toggleMoreSaved,
      morePractice,
      startMorePractice,
      creditMorePractice,
      endMorePractice,
      zakat,
      setZakat,
    }),
    [
      hydrated, contentRev, premium, setPremium, subscribe, account, signIn, signOut, deleteAccount, saved, toggleSaved, isSaved,
      prayerLog, toggleLog, isPrayerLogged, needs, toggleNeed, reminders, toggleReminder,
      adhanEnabled, setAdhanEnabled, adhanPrayers, toggleAdhanPrayer, arabicSize, setArabicSize, lang, setLang, reciter, setReciter, prayerMethod, setPrayerMethod,
      paywallVisible, giftVisible, practice, startPractice, finishPracticeToday, creditPractice, setPracticeTally, endPractice,
      benefitText, setBenefitText, resetBenefitText, benefitReports, reportBeneficial, withdrawReport,
      benefitHelpful, toggleHelpful, benefitRecited, markRecited, unmarkRecited,
      moreSaved, toggleMoreSaved, morePractice, startMorePractice, creditMorePractice,
      endMorePractice, zakat, setZakat,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState must be used within AppStateProvider');
  return v;
}

export { dayKey };
