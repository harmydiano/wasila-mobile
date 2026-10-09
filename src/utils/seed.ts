export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function rand01(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function statsFor(key: string) {
  const h = hashString(key);
  const rating = 4.2 + rand01(h) * 0.8;
  const helpful = 40 + Math.floor(rand01(h + 1) * 210);
  return { rating: Math.round(rating * 10) / 10, helpful };
}

export function duaStats(catId: string, duaIdx: number) {
  const key = `${catId}:${duaIdx}`;
  const h = hashString(key);
  const reflTotal = 40 + Math.floor(rand01(h + 2) * 210);
  const reflAvg = Math.round((4.2 + rand01(h + 3) * 0.8) * 10) / 10;
  const practisingToday = 900 + Math.floor(rand01(h + 4) * 4300);
  const myStreak = 3 + Math.floor(rand01(h + 5) * 26);
  return { reflTotal, reflAvg, practisingToday, myStreak: `${myStreak}d` };
}

export function shuffledReflections<T>(pool: T[], seedKey: string): T[] {
  const h = hashString(seedKey);
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand01(h + i * 7) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
