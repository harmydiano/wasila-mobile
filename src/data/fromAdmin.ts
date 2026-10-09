import type { BenefitBlock, BenefitKind, Dua } from '../types/models';

export type AdminBenefit = {
  slug: string;
  categorySlug: string;
  kind: BenefitKind | 'practice';
  tier: 'free' | 'plus' | 'grant' | string;
  title: string;
  arabicName?: string;
  transliteration?: string;
  meaning?: string;
  countText?: string;
  timing?: string;
  duration?: string;
  blocks: BenefitBlock[];
  line?: string | null;
  heroStats?: { value: string; label: string }[] | null;
  meaningDetail?: Dua['meaning'] | null;
};

export function duaFromRecord(r: AdminBenefit): Dua {
  return {
    t: r.title,
    n: r.arabicName ?? '',
    tr: r.transliteration ?? '',
    m: r.meaning ?? '',
    c: r.countText || 'Once',
    tm: r.timing ?? '',
    d: r.duration ?? '',
    free: r.tier === 'free',
    s: [],
    note: '',
    kind: r.kind === 'practice' ? 'name' : r.kind,
    blocks: r.blocks,
    ...(r.line ? { line: r.line } : {}),
    ...(r.heroStats?.length ? { heroStats: r.heroStats } : {}),
    ...(r.meaningDetail ? { meaning: r.meaningDetail } : {}),
    recordSlug: r.slug,
  };
}
