import { PixelRatio } from 'react-native';

export function fontScale(): number {
  return PixelRatio.getFontScale();
}

export function scaledLeading(size: number, ratio: number): number {
  return Math.round(size * ratio * fontScale());
}

export function pinLeading(px: number, size: number = 0): number {
  return Math.round(Math.max(px, size * LEADING.ui) * fontScale());
}

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_400Regular',
  semibold: 'Inter_500Medium',
  bold: 'Inter_600SemiBold',
  extrabold: 'Inter_700Bold',

  arabic: 'ScheherazadeNew_400Regular',

  serifMedium: 'Literata_500Medium',
  serif: 'Literata_600SemiBold',
  serifBold: 'Literata_700Bold',

  amiriBold: 'Amiri_700Bold',
};

export const ARABIC_LINE_HEIGHT = 2.05;

export const SERIF_HEADING_LEADING = 1.22;

export function serifLeading(size: number): number {
  return scaledLeading(size, SERIF_HEADING_LEADING);
}

export function serifHeading(size: number, family: string = fonts.serif) {
  return {
    fontFamily: family,
    fontSize: size,
    lineHeight: serifLeading(size),
  } as const;
}

export const LEADING = {
  display: 1.12,
  heading: 1.2,
  ui: 1.35,
  body: 1.55,
};

export const SIZE = {
  caption: 11,
  meta: 12,
  body: 13,
  title: 15,
  heading: 20,
  cardTitle: 23,
  display: 28,
};

export const ONE_OFF = {
  wordmark: 40,
  tally: 62,
};

export const tabular = { fontVariant: ['tabular-nums' as const] };

export function uiLeading(size: number): number {
  return scaledLeading(size, LEADING.ui);
}

export function bodyLeading(size: number): number {
  return scaledLeading(size, LEADING.body);
}

export function eyebrow(color: string) {
  return {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption,
    lineHeight: uiLeading(SIZE.caption),
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    includeFontPadding: false,
    color,
  } as const;
}

export function arabicText(size: number) {
  return {
    fontFamily: fonts.arabic,
    fontSize: size,
    lineHeight: scaledLeading(size, ARABIC_LINE_HEIGHT),
    includeFontPadding: false,
    writingDirection: 'rtl' as const,
  } as const;
}

export const CLAMP = 1.35;
