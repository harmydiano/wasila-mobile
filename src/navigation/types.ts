export type RootStackParamList = {
  Intro: undefined;
  Onboarding: undefined;
  Home: undefined;
  Library: undefined;
  Category: { catId: string };
  DuaDetail: { catId: string; duaIdx: number };
  Prayer: { tab?: 'times' | 'qibla' | 'tracker'; at?: number } | undefined;
  Profile: undefined;
  Search: undefined;
  Bookmarks: undefined;
  Quran: undefined;
  Sura: { n: number; v?: number };
  QuranSearch: undefined;
  QuranBookmarks: undefined;
  More: undefined;
  Settings: undefined;
  PrayerMethod: undefined;
  Names: undefined;
  Needs: undefined;
  Tasbih:
    | {
        dhikrIdx?: number;
        target?: number;
        creditsPractice?: boolean;
        ar?: string;
        name?: string;
        period?: 'today' | 'tonight';
      }
    | undefined;
  Zikr: undefined;
  Auth: undefined;
  ManageDownloads: undefined;

  Welcome: undefined;
  Restore: undefined;
  NeedsPicker: undefined;
  SignIn: undefined;
  EmailEntry: { firstName?: string } | undefined;
  CodeEntry: { email: string; firstName?: string };
  LinkExpired: { email: string; firstName?: string };
  SignUpSheet: undefined;
  Plus: { benefitTitle?: string; categoryLabel?: string } | undefined;

  Benefit: { catId: string; duaIdx: number };
  BenefitCounter: { catId: string; duaIdx: number };
  BenefitListen: { catId: string; duaIdx: number };
  BenefitSearch: undefined;
  Saved: undefined;
  ActivePractices: undefined;

  Salawat: undefined;
  SalawatDetail: { id: string };
  Saints: undefined;
  SaintDetail: { id: string };
  Names99: undefined;
  NameDetail: { n: number };
  Salaats: undefined;
  SalaatDetail: { slug: string };
  HijriCalendar: undefined;
  Zakat: undefined;
  MoreCounter: undefined;

  Reciters: undefined;
  NowPlaying: undefined;
};
