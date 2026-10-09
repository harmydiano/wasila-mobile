import { getJSON, setJSON, KEYS } from './prefs';
import { SALAATS_SEED, type Salaat } from './salaatsSeed';

export type { Salaat };
export type { SalaatDayLink, SalaatMonthLink } from './salaatsSeed';

const BASE = 'https://pray.api.islamic.network/v1';
const TIMEOUT_MS = 8000;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

type Cached = { at: number; value: Salaat[] };

async function get<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}${path}`, { signal: controller.signal });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.code === 200 ? (body.data as T) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const en = (p: any): string | undefined => p?.en?.raw || undefined;

function toSalaat(detail: any): Salaat | null {
  if (!detail?.slug) return null;
  return {
    slug: detail.slug,
    name: detail.name ?? {},
    highlights: detail.highlights?.en ?? [],
    description: en(detail.description),
    method: en(detail.method),
    source: detail.source || undefined,
    months: (detail.months ?? []).map((m: any) => ({ number: m.number, name: m.name ?? {}, note: m.note || undefined })),
    days: (detail.days ?? []).map((d: any) => ({
      month: d.month,
      day: d.day,
      name: d.name ?? {},
      note: d.note || undefined,
      times: d.times?.map((t: any) => ({ key: t.key, label: t.label })),
    })),
  };
}

let memo: Salaat[] | null = null;

export async function loadSalaats(): Promise<Salaat[]> {
  if (memo) return memo;
  const cached = await getJSON<Cached | null>(KEYS.salaats, null);
  if (cached?.value?.length) {
    memo = cached.value;
    if (Date.now() - cached.at > TTL_MS) refresh();
    return memo;
  }
  memo = SALAATS_SEED;
  refresh();
  return memo;
}

async function refresh(): Promise<void> {
  const list = await get<any[]>('/salaats?limit=50');
  if (!list?.length) return;
  const details = await Promise.all(list.map((row) => get<any>(`/salaats/${row.slug}`)));
  const rows = details.map(toSalaat).filter((s): s is Salaat => s !== null);
  if (!rows.length) return;
  memo = rows;
  setJSON(KEYS.salaats, { at: Date.now(), value: rows });
}

export function salaatAt(slug: string, rows: Salaat[]): Salaat | undefined {
  return rows.find((s) => s.slug === slug);
}
