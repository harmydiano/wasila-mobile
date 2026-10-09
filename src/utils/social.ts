import { hashString } from './seed';
import { CATS } from '../data/content';
import { benefitKey } from '../data/benefits';

export const SOCIAL_LIVE = false;

export const HIDE_BELOW = 25;
export const BUCKET_BELOW = 100;

function rand01(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export type Disclosure =
  | { show: false }
  | { show: true; exact: true; value: number; text: string }
  | { show: true; exact: false; value: number; text: string };

function bucketWord(n: number) {
  return n >= 50 ? 'Dozens' : 'A few dozen';
}

export function disclose(n: number, noun: string): Disclosure {
  if (!SOCIAL_LIVE || n < HIDE_BELOW) return { show: false };
  if (n < BUCKET_BELOW) return { show: true, exact: false, value: n, text: `${bucketWord(n)} ${noun}` };
  return { show: true, exact: true, value: n, text: `${n.toLocaleString()} ${noun}` };
}

export type BenefitSocial = {
  practising: number;
  beneficial: number;
};

function scaleFor(catId: string): number {
  const cat = CATS.find((c) => c.id === catId);
  const total = cat?.total ?? 20;
  if (total <= 14) return 0.02;
  if (total <= 18) return 0.05;
  return 1;
}

export function benefitSocial(catId: string, duaIdx: number): BenefitSocial {
  const h = hashString(benefitKey(catId, duaIdx));
  const scale = scaleFor(catId);
  const practising = Math.round((60 + rand01(h + 11) * 700) * scale);
  const beneficial = Math.round(practising * (1.8 + rand01(h + 13) * 1.4));
  return { practising, beneficial };
}

export function categorySocial(catId: string): { practising: number } {
  const cat = CATS.find((c) => c.id === catId);
  if (!cat) return { practising: 0 };
  const h = hashString(`cat:${catId}`);
  const scale = scaleFor(catId);
  const practising = Math.round((cat.total * (40 + rand01(h + 7) * 30)) * scale);
  return { practising };
}

export function corpusPractising(): number {
  return CATS.reduce((sum, c) => sum + categorySocial(c.id).practising, 0);
}

const STEPS: [number, string][] = [
  [1_000_000, '1M'], [500_000, '500k'], [200_000, '200k'], [100_000, '100k'],
  [50_000, '50k'], [20_000, '20k'], [10_000, '10k'], [5_000, '5k'],
  [2_000, '2k'], [1_000, '1k'], [500, '500'], [200, '200'], [100, '100'],
];

export function approx(n: number): string {
  for (const [step, label] of STEPS) if (n >= step) return `${label}+`;
  return `${HIDE_BELOW}+`;
}

export function approxOf(d: Disclosure): string {
  if (!d.show) return '';
  return d.exact ? approx(d.value) : `${HIDE_BELOW}+`;
}

export function compact(n: number): string {
  if (n < 10000) return n.toLocaleString();
  return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
}

export function shareOfCategory(catId: string, social: BenefitSocial) {
  const total = Math.max(1, categorySocial(catId).practising);
  return {
    total,
    beneficialPct: Math.min(1, social.beneficial / total),
    practisingPct: Math.min(1, social.practising / total),
  };
}

export type BenefitReport = 'beneficial' | null;

export function withMyReport(beneficial: number, report: BenefitReport): number {
  return report === 'beneficial' ? beneficial + 1 : beneficial;
}
