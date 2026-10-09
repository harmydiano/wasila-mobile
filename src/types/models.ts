export type PassageLine = { ar?: string; tr?: string };

export type PassageBlock = {
  type: 'passage';
  label?: string;
  lines: PassageLine[];
  translation?: string;
  seconds?: number;
};

export type ProseBlock = {
  type: 'prose';
  tone?: 'plain' | 'card' | 'reported';
  title?: string;
  icon?: string;
  text: string[];
};

export type StepsBlock = { type: 'steps'; title?: string; items: string[] };

export type RecitationBlock = {
  type: 'recitation';
  ar?: string;
  tr?: string;
  label?: string;
  instruction: string;
  target: number;
  segments?: { label: string; note: string }[];
};

export type PrayerBlock = {
  type: 'prayer';
  title?: string;
  rakat: number;
  each?: string;
  units?: string[];
  note?: string;
};

export type WritingBlock = {
  type: 'writing';
  title?: string;
  ar?: string;
  tr?: string;
  text?: string;
  times?: number;
  medium?: string;
  then?: string[];
};

export type NoteBlock = { type: 'note'; text: string };

export type BenefitBlock =
  | PassageBlock
  | ProseBlock
  | StepsBlock
  | RecitationBlock
  | PrayerBlock
  | WritingBlock
  | NoteBlock;

export type BenefitKind =
  | 'name'
  | 'surah'
  | 'passage'
  | 'litany'
  | 'prayer'
  | 'written'
  | 'recitedOver'
  | 'preparation';

export type BenefitMeaning = {
  asked: string;
  words: { ar: string; tr: string; gloss: string }[];
  source: string;
};

export type Dua = {
  t: string;
  n: string;
  tr: string;
  m: string;
  c: string;
  tm: string;
  d: string;
  free: boolean;
  s: string[];
  note: string;
  outcomes?: string[];

  blocks?: BenefitBlock[];
  kind?: BenefitKind;
  line?: string;
  heroStats?: { value: string; label: string }[];
  meaning?: BenefitMeaning;
  recordSlug?: string;
};

export type Category = {
  id: string;
  icon: string;
  title: string;
  total: number;
  sub: string;
  arabicSub: string;
  duas: Dua[];
};

export type Dhikr = { name: string; ar: string; count: string };

export type DivineName = {
  ar: string;
  tr: string;
  meaning: string;
  benefit: string;
  count: string;
};

export type Sura = {
  n: number;
  ar: string;
  name: string;
  meaning: string;
  v: number;
  place: 'Meccan' | 'Medinan';
};

export type Verse = { ar: string; tr: string; en: string };

export type Reflection = {
  name: string;
  place: string;
  d: number;
  days: string;
  stars: number;
  body: string;
};

export type Plan = {
  key: 'monthly' | 'yearly';
  name: string;
  note: string;
  price: string;
  per: string;
};

export type SettingRow = { icon: string; label: string; value: string; go?: string; action?: string };
export type SettingGroup = { title: string; rows: SettingRow[] };

export type Practice = {
  categoryId: string;
  duaIndex: number;
  title: string;
  sub: string;
  day: number;
  totalDays: number;
  progress: number;
  broken: boolean;
};
