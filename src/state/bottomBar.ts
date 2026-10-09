import { useSyncExternalStore } from 'react';

const heights = new Map<number, number>();
const listeners = new Set<() => void>();
let current = 0;
let nextId = 1;

function recompute(): void {
  let max = 0;
  for (const h of heights.values()) if (h > max) max = h;
  if (max === current) return;
  current = max;
  for (const fn of listeners) fn();
}

export function claimBottomBarSlot(): number {
  return nextId++;
}

export function reportBottomBarHeight(id: number, height: number): void {
  heights.set(id, height);
  recompute();
}

export function releaseBottomBarSlot(id: number): void {
  heights.delete(id);
  recompute();
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function snapshot(): number {
  return current;
}

export function useBottomBarHeight(): number {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
