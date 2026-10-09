import { useEffect, useState, useSyncExternalStore } from 'react';
import type { BenefitBlock, Dua } from '../types/models';
import { CATS } from './content';
import { rebuildBenefitIndex } from './benefits';
import { duaFromRecord, type AdminBenefit } from './fromAdmin';
import { apiGet } from './api';
import { KEYS, getJSON, removeByPrefix, setJSON } from './prefs';

type CatalogueItem = Omit<AdminBenefit, 'blocks'> & { type: string; version: number };
type Catalogue = { version: number; items: CatalogueItem[] };
type CachedBody = { version: number; tier: string; blocks: BenefitBlock[]; meaningDetail?: Dua['meaning'] | null };

let rev = 0;
const listeners = new Set<() => void>();

function bump() {
  rev += 1;
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useContentRev(): number {
  return useSyncExternalStore(subscribe, () => rev);
}

let catalogue: Catalogue | null = null;
const bodies = new Map<string, CachedBody>();

export function fromApi(): boolean {
  return catalogue !== null;
}

function attachBody(dua: Dua, body: CachedBody) {
  dua.blocks = body.blocks;
  if (body.meaningDetail) dua.meaning = body.meaningDetail;
}

function applyCatalogue(next: Catalogue) {
  catalogue = next;
  const byCat = new Map<string, Dua[]>();
  for (const item of next.items) {
    if (item.type !== 'benefit') continue;
    const dua = duaFromRecord({ ...item, blocks: [] });
    const body = bodies.get(item.slug);
    if (body && body.version >= item.version) attachBody(dua, body);
    const list = byCat.get(item.categorySlug) ?? [];
    list.push(dua);
    byCat.set(item.categorySlug, list);
  }
  for (const cat of CATS) {
    const list = byCat.get(cat.id) ?? [];
    const ordered = [...list.filter((d) => d.free), ...list.filter((d) => !d.free)];
    cat.duas.splice(0, cat.duas.length, ...ordered);
    cat.total = ordered.length;
  }
  rebuildBenefitIndex();
  bump();
}

export async function loadCachedCatalogue(): Promise<void> {
  const cached = await getJSON<Catalogue | null>(KEYS.benefitCatalogue, null);
  if (cached?.items?.length && !catalogue) applyCatalogue(cached);
}

export async function ensureCatalogue(): Promise<boolean> {
  await loadCachedCatalogue();
  if (!catalogue) await refreshCatalogue();
  return catalogue !== null;
}

export async function refreshCatalogue(): Promise<void> {
  try {
    const since = catalogue?.version ?? 0;
    const res = await apiGet<Catalogue & { unchanged?: boolean }>(`/v1/catalogue?since=${since}`);
    if (res.status !== 200 || res.body.unchanged || !Array.isArray(res.body.items)) return;
    const next = { version: res.body.version, items: res.body.items.filter((i) => i.type === 'benefit') };
    applyCatalogue(next);
    await setJSON(KEYS.benefitCatalogue, next);
  } catch {
  }
}

export type Me = { plus: boolean };

export async function fetchMe(): Promise<Me | null> {
  try {
    const res = await apiGet<Me>('/v1/me');
    return res.status === 200 ? { plus: !!res.body.plus } : null;
  } catch {
    return null;
  }
}

export async function dropPaidBodies(): Promise<void> {
  const paid = new Set([...bodies.entries()].filter(([, b]) => b.tier !== 'free').map(([slug]) => slug));
  for (const slug of paid) bodies.delete(slug);
  if (paid.size) {
    for (const cat of CATS) {
      for (const dua of cat.duas) {
        if (dua.recordSlug && paid.has(dua.recordSlug)) {
          dua.blocks = [];
          delete dua.meaning;
        }
      }
    }
    bump();
  }
  await removeByPrefix(KEYS.benefitBodyPlus);
}

const bodyKey = (slug: string, free: boolean) => `${free ? KEYS.benefitBodyFree : KEYS.benefitBodyPlus}${slug}`;

function versionOf(slug: string): number {
  return catalogue?.items.find((i) => i.slug === slug)?.version ?? 0;
}

export type BodyStatus = 'ready' | 'loading' | 'locked' | 'offline';

export function useBenefitBody(dua: Dua, premium: boolean): { status: BodyStatus; retry: () => void } {
  const slug = dua.recordSlug;
  const have = () => !!slug && bodies.has(slug) && bodies.get(slug)!.version >= versionOf(slug);
  const [status, setStatus] = useState<BodyStatus>(() => (!slug || have() ? 'ready' : 'loading'));
  const [attempt, setAttempt] = useState(0);
  const contentRev = useContentRev();

  useEffect(() => {
    if (!slug) {
      setStatus('ready');
      return;
    }
    let alive = true;
    const settle = (s: BodyStatus) => alive && setStatus(s);

    (async () => {
      if (have()) return settle('ready');
      if (status === 'locked' && !premium) return;
      settle('loading');

      const cached = dua.free || premium ? await getJSON<CachedBody | null>(bodyKey(slug, dua.free), null) : null;
      if (cached && cached.version >= versionOf(slug)) {
        bodies.set(slug, cached);
        attachBody(dua, cached);
        bump();
        return settle('ready');
      }

      try {
        const res = await apiGet<CachedBody & { refused?: boolean }>(`/v1/content/${encodeURIComponent(slug)}`);
        if (res.status === 402 || res.body.refused) return settle('locked');
        if (res.status !== 200) return settle(cached ? 'ready' : 'offline');
        const body: CachedBody = {
          version: res.body.version,
          tier: res.body.tier,
          blocks: res.body.blocks ?? [],
          meaningDetail: res.body.meaningDetail ?? null,
        };
        bodies.set(slug, body);
        attachBody(dua, body);
        bump();
        settle('ready');
        await setJSON(bodyKey(slug, body.tier === 'free'), body);
      } catch {
        if (cached) {
          bodies.set(slug, cached);
          attachBody(dua, cached);
          bump();
          return settle('ready');
        }
        settle('offline');
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug, premium, attempt, contentRev]);

  return { status, retry: () => setAttempt((n) => n + 1) };
}

let prefetching = false;

export async function prefetchBodies(slugs: string[]): Promise<void> {
  if (prefetching || !catalogue) return;
  prefetching = true;
  try {
    const byslug = new Map(catalogue.items.map((i) => [i.slug, i]));
    const queue: string[] = [];
    for (const slug of new Set(slugs)) {
      const item = byslug.get(slug);
      if (!item) continue;
      if ((bodies.get(slug)?.version ?? -1) >= item.version) continue;
      const disk = await getJSON<CachedBody | null>(bodyKey(slug, item.tier === 'free'), null);
      if (disk && disk.version >= item.version) continue;
      queue.push(slug);
    }

    let failed = false;
    const worker = async () => {
      while (queue.length && !failed) {
        const slug = queue.shift()!;
        try {
          const res = await apiGet<CachedBody & { refused?: boolean }>(`/v1/content/${encodeURIComponent(slug)}`);
          if (res.status !== 200 || res.body.refused) continue;
          const body: CachedBody = {
            version: res.body.version,
            tier: res.body.tier,
            blocks: res.body.blocks ?? [],
            meaningDetail: res.body.meaningDetail ?? null,
          };
          await setJSON(bodyKey(slug, body.tier === 'free'), body);
        } catch {
          failed = true;
        }
      }
    };
    await Promise.all([worker(), worker()]);
  } finally {
    prefetching = false;
  }
}

export function freeSlugs(): string[] {
  return (catalogue?.items ?? []).filter((i) => i.tier === 'free').map((i) => i.slug);
}
