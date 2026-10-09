export function fold(s: string | null | undefined): string {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ʿʾ‘’'`]/g, '')
    .toLowerCase()
    .replace(/[-_.,;:!?()“”"«»/·]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function queryTerms(q: string): string[] {
  const f = fold(q);
  return f ? f.split(' ') : [];
}

export function matchScore(terms: string[], fields: (string | null | undefined)[]): number {
  if (!terms.length) return 0;
  const folded = fields.map(fold);
  const compact = folded.map((f) => f.replace(/ /g, ''));
  const phrase = terms.join(' ');
  let score = 0;
  for (const term of terms) {
    let best = 0;
    folded.forEach((f, i) => {
      const weight = fields.length - i;
      if (!f.includes(term)) {
        if (compact[i].includes(term)) best = Math.max(best, weight);
        return;
      }
      const atWord = f.startsWith(term) || f.includes(` ${term}`);
      best = Math.max(best, weight * (atWord ? 2 : 1));
    });
    if (!best) return 0;
    score += best;
  }
  folded.forEach((f, i) => {
    const weight = fields.length - i;
    if (f === phrase) score += weight * 6;
    else if (f.startsWith(phrase)) score += weight * 3;
    else if (f.includes(phrase)) score += weight;
  });
  return score;
}

export function searchBy<T>(items: T[], q: string, fields: (item: T) => (string | null | undefined)[]): T[] {
  const terms = queryTerms(q);
  if (!terms.length) return [];
  return items
    .map((item, i) => ({ item, i, s: matchScore(terms, fields(item)) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((r) => r.item);
}
