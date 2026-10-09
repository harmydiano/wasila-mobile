export type Inline = { text: string; bold?: boolean };

export type Block =
  | { kind: 'p'; spans: Inline[] }
  | { kind: 'quote'; spans: Inline[]; attribution?: string }
  | { kind: 'list'; items: { spans: Inline[]; depth: number }[] }
  | { kind: 'arabic'; text: string }
  | { kind: 'translit'; text: string };

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

function isArabicLine(line: string): boolean {
  const letters = line.replace(/[\s\p{P}\p{S}\d]/gu, '');
  if (letters.length < 2) return false;
  let arabic = 0;
  for (const ch of letters) if (ARABIC.test(ch)) arabic++;
  return arabic / letters.length > 0.6;
}

export function inlines(src: string): Inline[] {
  const text = src
    .replace(/\[([^\]]+)\]\((?:[^)]*)\)/g, '$1')
    .replace(/\[([^\]]+)\]\{[^}]*\}/g, '$1')
    .replace(/ /g, ' ')
    .trim();

  const out: Inline[] = [];
  const re = /\*\*([^*]+)\*\*|__([^_]+)__/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[1] ?? m[2], bold: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out.length ? out : [{ text }];
}

export function parseMarkdown(raw: string | undefined): Block[] {
  if (!raw) return [];
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];

  let para: string[] = [];
  let quote: string[] = [];
  let list: { spans: Inline[]; depth: number }[] = [];

  const flushPara = () => {
    if (!para.length) return;
    const joined = para.join(' ').trim();
    para = [];
    if (!joined) return;
    const translit = joined.match(/^\[([\s\S]+)\]\{\.translit\}$/);
    if (translit) {
      blocks.push({ kind: 'translit', text: translit[1].trim() });
      return;
    }
    if (isArabicLine(joined)) {
      blocks.push({ kind: 'arabic', text: joined });
      return;
    }
    blocks.push({ kind: 'p', spans: inlines(joined) });
  };

  const flushQuote = () => {
    if (!quote.length) return;
    const body: string[] = [];
    let attribution: string | undefined;
    for (const q of quote) {
      if (/^\s*[—–-]\s+/.test(q) && body.length) attribution = q.replace(/^\s*[—–-]\s+/, '').trim();
      else body.push(q);
    }
    quote = [];
    blocks.push({
      kind: 'quote',
      spans: inlines(body.join(' ')),
      attribution,
    });
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ kind: 'list', items: list });
    list = [];
  };

  const flushAll = () => {
    flushPara();
    flushQuote();
    flushList();
  };

  for (const line of lines) {
    if (!line.trim()) {
      flushAll();
      continue;
    }

    const quoted = line.match(/^\s*>\s?(.*)$/);
    if (quoted) {
      flushPara();
      flushList();
      if (quoted[1].trim()) quote.push(quoted[1]);
      continue;
    }

    const bullet = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (bullet) {
      flushPara();
      flushQuote();
      list.push({ spans: inlines(bullet[2]), depth: bullet[1].length >= 2 ? 1 : 0 });
      continue;
    }

    flushQuote();
    flushList();
    para.push(line.trim());
  }

  flushAll();
  return blocks;
}
