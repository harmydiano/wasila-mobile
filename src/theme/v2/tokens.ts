export const space = {
  hair: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 40,
} as const;

export const rhythm = {
  screenX: space.lg,
  section: 28,
  sectionHeader: space.sm,
  cardGap: space.sm,
  tight: space.xs,
} as const;

export const radius = {
  chip: 12,
  tile: 16,
  card: 20,
  hero: 26,
  pill: 999,
} as const;

export const size = {
  display: 40,
  title1: 26,
  title2: 18,
  title3: 16,
  body: 14,
  bodySm: 13,
  label: 12,
  caption: 11,
} as const;

export const leading = {
  display: 44,
  title1: 32,
  title2: 24,
  title3: 22,
  body: 20,
  bodySm: 19,
  label: 16,
  caption: 15,
} as const;

export const tracking = {
  display: 0,
  title: -0.3,
  normal: 0,
  eyebrow: 1.2,
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;
export const minTouch = 44;

export const elevation = {
  card: {
    shadowColor: '#010907',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 10,
  },
  hero: {
    shadowColor: '#010907',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 28,
    elevation: 14,
  },
  glow: {
    shadowColor: '#7BE0BE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export const motion = {
  instant: 120,
  fast: 180,
  base: 240,
  slow: 320,
  pressScale: 0.97,
} as const;

export const veil = {
  faint: 'rgba(255,255,255,0.06)',
  soft: 'rgba(255,255,255,0.10)',
  edge: 'rgba(255,255,255,0.16)',
  strong: 'rgba(255,255,255,0.28)',
} as const;
