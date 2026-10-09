import type {
  BenefitBlock,
  BenefitKind,
  Dua,
  PassageBlock,
  RecitationBlock,
} from '../types/models';
import { CATS } from './content';
import { BENEFIT_KINDS, isBenefitKind, type BenefitKindSpec } from './benefitKinds';
import { clampNights } from '../utils/practice';
import { searchBy } from '../utils/search';

export function benefitKey(catId: string, duaIdx: number) {
  const slug = CATS.find((c) => c.id === catId)?.duas[duaIdx]?.recordSlug;
  return slug ?? `${catId}:${duaIdx}`;
}

export function benefitOfKey(key: string): BenefitRef | null {
  return ALL_BENEFITS.find((b) => benefitKey(b.catId, b.duaIdx) === key) ?? null;
}

export function indexOfSlug(catId: string, slug: string): number {
  return CATS.find((c) => c.id === catId)?.duas.findIndex((d) => d.recordSlug === slug) ?? -1;
}

export function benefitAt(catId: string, duaIdx: number) {
  const cat = CATS.find((c) => c.id === catId) ?? CATS[0];
  const dua = cat.duas[duaIdx] ?? cat.duas[0];
  return { cat, dua, idx: cat.duas[duaIdx] ? duaIdx : 0 };
}

export function parseTarget(c: string): number {
  const n = parseInt(String(c).replace(/[^0-9]/g, ''), 10);
  return n || 1;
}

const SURAH_RE = /(sūrah|surah|al-muʿawwidhatayn|chapter)/i;

export function kindOf(dua: Dua): BenefitKind {
  const authored = (dua.kind as string | undefined) === 'practice' ? 'name' : dua.kind;
  if (isBenefitKind(authored)) return authored;
  if (SURAH_RE.test(dua.tr) || SURAH_RE.test(dua.m)) return 'surah';
  if (/^y[āa]\s/i.test(dua.tr)) return 'name';
  return 'passage';
}

export function kindSpec(dua: Dua): BenefitKindSpec {
  return BENEFIT_KINDS[kindOf(dua)];
}

export function kindLabel(dua: Dua): string {
  const kind = kindOf(dua);
  if (kind === 'name' && parseTarget(dua.c) > 1) return 'Practice · Name';
  return BENEFIT_KINDS[kind].label;
}

export function lineFor(dua: Dua): string {
  if (dua.line) return dua.line;
  const count = parseTarget(dua.c) > 1 ? `${parseTarget(dua.c)}×` : dua.c;
  return [dua.tr, count, dua.tm?.toLowerCase(), dua.d && dua.d !== 'Ongoing' ? dua.d : null]
    .filter(Boolean)
    .join(' · ');
}

export function heroShowsArabic(dua: Dua): boolean {
  return kindSpec(dua).hero === 'arabic' && !!dua.n?.trim();
}

export function heroStatsFor(dua: Dua): { value: string; label: string }[] {
  if (dua.heroStats?.length) return dua.heroStats;
  const runs = runsFor(dua);
  const target = parseTarget(dua.c);
  const first =
    runs.length > 1
      ? { value: `${runs.length} parts`, label: 'counted in turn' }
      : runs.length === 1 && runs[0].target > 1
        ? { value: `${runs[0].target}×`, label: 'each sitting' }
        : kindOf(dua) === 'written' && target > 1
          ? { value: `${target}×`, label: 'written' }
          : target > 1
            ? { value: `${target}×`, label: 'each sitting' }
            : { value: 'Once', label: 'no count' };
  return [first, { value: dua.tm || '—', label: 'when' }, { value: dua.d || '—', label: 'duration' }];
}

export function blocksFor(dua: Dua): BenefitBlock[] {
  if (dua.blocks?.length) return dua.blocks;

  const out: BenefitBlock[] = [];
  const target = parseTarget(dua.c);

  if (dua.note) {
    out.push({ type: 'prose', tone: 'card', title: 'Before you begin', icon: 'water_drop', text: [dua.note] });
  }
  if (dua.s.length) {
    out.push({ type: 'steps', title: 'The method', items: dua.s });
  }
  if (target > 1) {
    out.push({
      type: 'recitation',
      ar: dua.n,
      tr: dua.tr,
      instruction: `${target} times, ${dua.tm.toLowerCase()}.`,
      target,
    });
  }
  if (dua.outcomes?.length) {
    out.push({ type: 'prose', tone: 'reported', title: 'What is reported', icon: 'schedule', text: dua.outcomes });
  }
  if (!out.length) {
    out.push({
      type: 'prose',
      text: [`${dua.tr} — ${dua.m}. ${dua.c}, ${dua.tm.toLowerCase()}, for ${dua.d.toLowerCase()}.`],
    });
  }
  out.push({ type: 'note', text: 'Wasīla records what the source reports. Outcomes rest with Allah alone.' });
  return out;
}

export function recitationOf(blocks: BenefitBlock[]): RecitationBlock | null {
  return (blocks.find((b) => b.type === 'recitation') as RecitationBlock | undefined) ?? null;
}

export type Run = {
  blockIndex: number;
  ar?: string;
  tr?: string;
  target: number;
  label: string;
  note?: string;
};

function shortLabel(tr: string | undefined, fallback: string): string {
  const clean = String(tr ?? '').replace(/[“”"«»]/g, '').trim();
  if (!clean) return fallback;
  const words = clean.split(/\s+/);
  return words.length > 3 ? `${words.slice(0, 3).join(' ')}…` : clean;
}

export function runsOf(blocks: BenefitBlock[]): Run[] {
  const runs: Run[] = [];
  blocks.forEach((b, blockIndex) => {
    if (b.type !== 'recitation') return;
    if (b.segments?.length) {
      for (const seg of b.segments) {
        runs.push({ blockIndex, ar: b.ar, tr: b.tr, target: b.target, label: seg.label, note: seg.note });
      }
      return;
    }
    runs.push({
      blockIndex, ar: b.ar, tr: b.tr, target: b.target,
      label: b.label?.trim() || shortLabel(b.tr, `Part ${runs.length + 1}`),
    });
  });
  return runs;
}

export function runHint(runs: Run[], i: number): string {
  const run = runs[i];
  if (!run) return '';
  if (run.note) return run.note;
  return i < runs.length - 1 ? `Then ${runs[i + 1].label}` : 'The last count';
}

export function runsFor(dua: Dua, blocks: BenefitBlock[] = blocksFor(dua)): Run[] {
  return kindSpec(dua).counts ? runsOf(blocks) : [];
}

export function runLabel(runs: Run[], i: number): string {
  const run = runs[i];
  if (!run) return '';
  if (/^\d+$/.test(run.label)) {
    return `Corner ${run.label} of ${runs.filter((x) => /^\d+$/.test(x.label)).length}`;
  }
  if (run.label === 'Door') return 'The doorway';
  return `${run.label} · ${i + 1} of ${runs.length}`;
}

export function passageOf(blocks: BenefitBlock[]): PassageBlock | null {
  return (blocks.find((b) => b.type === 'passage') as PassageBlock | undefined) ?? null;
}

export function nightsFor(dua: Dua): number {
  const m = String(dua.d).match(/(\d+)(?:\s*to\s*\d+)?\s*(day|night|week|month)?/i);
  if (!m) return 1;
  const unit = (m[2] ?? 'day').toLowerCase();
  const perUnit = unit === 'week' ? 7 : unit === 'month' ? 30 : 1;
  return clampNights(parseInt(m[1], 10) * perUnit);
}

export function segmentName(label: string): string {
  return /^\d+$/.test(label) ? `Corner ${label}` : label === 'Door' ? 'The doorway' : label;
}

export function durationLabel(dua: Dua): string {
  return dua.d;
}

export function corpusTotal() {
  return CATS.reduce((sum, c) => sum + c.total, 0);
}

export function freeCount(cat: (typeof CATS)[number]) {
  return cat.duas.filter((d) => d.free).length;
}

export type BenefitRef = { catId: string; duaIdx: number; cat: (typeof CATS)[number]; dua: Dua };

export const ALL_BENEFITS: BenefitRef[] = [];

export function rebuildBenefitIndex() {
  ALL_BENEFITS.splice(
    0,
    ALL_BENEFITS.length,
    ...CATS.flatMap((cat) => cat.duas.map((dua, duaIdx) => ({ catId: cat.id, duaIdx, cat, dua }))),
  );
}
rebuildBenefitIndex();

export function searchBenefits(q: string): BenefitRef[] {
  return searchBy(ALL_BENEFITS, q, ({ dua, cat }) => [dua.t, dua.tr, dua.n, dua.m, cat.title]);
}
