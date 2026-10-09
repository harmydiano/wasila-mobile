import type { BenefitKind } from '../types/models';

export type BenefitKindSpec = {
  label: string;
  plural: string;
  counts: boolean;
  hero: 'arabic' | 'line';
  record: string;
  recorded: string;
};

export const BENEFIT_KINDS: Record<BenefitKind, BenefitKindSpec> = {
  name: { label: 'Name', plural: 'Names', counts: true, hero: 'arabic', record: 'Mark as recited', recorded: 'Recorded for today' },
  surah: { label: 'Surah', plural: 'Surahs', counts: true, hero: 'arabic', record: 'Mark as recited', recorded: 'Recorded for today' },
  passage: { label: 'Passage', plural: 'Duʿāʾs', counts: true, hero: 'line', record: 'Mark as recited', recorded: 'Recorded for today' },
  litany: { label: 'Litany', plural: 'Litanies', counts: true, hero: 'line', record: 'Mark as recited', recorded: 'Recorded for today' },
  prayer: { label: 'Prayer', plural: 'Prayers', counts: true, hero: 'line', record: 'Mark as prayed', recorded: 'Prayed today' },
  written: { label: 'Written', plural: 'Written', counts: false, hero: 'line', record: 'Mark as done', recorded: 'Done today' },
  recitedOver: { label: 'Recited over', plural: 'Recited over', counts: true, hero: 'line', record: 'Mark as done', recorded: 'Done today' },
  preparation: { label: 'Preparation', plural: 'Preparations', counts: false, hero: 'line', record: 'Mark as done', recorded: 'Done today' },
};

export const KIND_ORDER: BenefitKind[] = [
  'name', 'surah', 'passage', 'litany', 'prayer', 'recitedOver', 'written', 'preparation',
];

export const isBenefitKind = (k: unknown): k is BenefitKind =>
  typeof k === 'string' && k in BENEFIT_KINDS;

export const BLOCK_TYPES = ['passage', 'prose', 'steps', 'recitation', 'prayer', 'writing', 'note'] as const;
