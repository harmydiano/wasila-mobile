const NBSP = ' ';

export function avoidOrphan(text: string, maxTailLength = 8): string {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return text;
  const tail = words[words.length - 1];
  if (tail.length > maxTailLength) return text;
  const head = words.slice(0, -1).join(' ');
  const bound = words[words.length - 2].length + 1 + tail.length;
  if (head.length <= bound) return text;
  return head + NBSP + tail;
}

export function keepSegments(text: string): string {
  const parts = text.split(' · ');
  if (parts.length < 2) return text;
  const glued = parts.map((seg) => seg.trim().replace(/\s+/g, NBSP));
  return glued.map((seg, i) => (i < glued.length - 1 ? `${seg}${NBSP}·` : seg)).join(' ');
}

export function keepWhole(text: string): string {
  return text.trim().replace(/\s+/g, NBSP);
}
