export type IconRect = { x: number; y: number; width: number; height: number };

export type PendingFlight = { catId: string; from: IconRect; at: number };

let pending: PendingFlight | null = null;

const MAX_AGE_MS = 1200;

export function setPendingFlight(catId: string, from: IconRect): void {
  pending = { catId, from, at: Date.now() };
}

export function takePendingFlight(): PendingFlight | null {
  const f = pending;
  pending = null;
  if (!f || Date.now() - f.at > MAX_AGE_MS) return null;
  return f;
}

export function clearPendingFlight(): void {
  pending = null;
}
