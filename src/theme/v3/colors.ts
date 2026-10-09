import { colors as v2Colors, categoryTints, tileIconColor } from '../v2/colors';

export const colors = {
  ...v2Colors,

  warmAccent: '#E2865C',

  surfaceRaised: '#0D211D',
  surfaceRaisedAlt: '#0F1D1A',

  borderStrong: '#2C433B',
} as const;

export { categoryTints, tileIconColor };

export const v3 = {
  surfaceRow: '#132320',
  surfaceCard: '#142420',
  cardTopHighlight: 'rgba(255,255,255,0.055)',
  surfaceHero: '#14251F',
  surfaceRaisedRow: '#1A2C26',
  surfaceInset: '#0E1A17',

  hairline: '#22322D',
  borderStrong: '#2C433B',
  heroBorder: '#358D6F',
  heroDivider: '#22403A',
  navBorder: '#1E2C27',

  ink1: '#A8BEB6',
  ink2: '#8FA69D',
  ink3: '#7F958D',
  ink4: '#7C918A',

  track: '#1E3A32',
  dotIdle: '#26403A',
  streakBar: '#358D6F',
  streakBarMissed: '#D65A4A',

  warm: '#E2865C',
  warmInk: '#E9A07A',
  warmWell: '#351E14',
  warmWellSoft: '#20191A',
  warmBorder: '#6B4131',

  oliveCard: '#1B2318',
  oliveBorder: '#3A4526',
  oliveDivider: '#333D22',
  oliveAccent: '#C7D67F',
  oliveBody: '#AFBA92',
  oliveMeta: '#8C9673',
  onOlive: '#1E2410',

  goldCard: '#22201A',
  goldCardBorder: '#4A4222',
  goldWell: '#1A1811',
  goldDivider: '#35301C',
  goldBody: '#B9AC88',
  goldMeta: '#9A8E6E',
  goldWellInk: '#D6C9A4',
  onGold: '#241E0C',

  glassFill: 'rgba(9,18,15,0.55)',
  glassBorder: 'rgba(219,230,224,0.15)',
  avatarFill: 'rgba(219,230,224,0.10)',
  avatarBorder: 'rgba(219,230,224,0.22)',
  accentTint: 'rgba(123,224,190,0.06)',
  accentWell: 'rgba(123,224,190,0.13)',
  accentWellBorder: 'rgba(123,224,190,0.34)',
  neutralWell: 'rgba(219,230,224,0.06)',
} as const;

export const qibla = {
  face: '#F4F6F3',
  engraved: '#0A1512',
  degrees: '#B4432F',
  ring: '#43514C',
  needleLight: '#9BAA66',
  needleMid: '#8B9A57',
  needleDark: '#748046',
  hub: '#5F6B3C',
  marker: '#3FA97F',
  badgeFace: '#F4F6F3',
} as const;

export const prayer = {
  openWell: '#1B3A32',

  nextWell: '#1E1A0E',
  nextBorder: '#4A3A18',

  switchOn: '#358D6F',
  switchOnNext: '#4A3A18',
  switchOff: '#26332F',
  knobOn: '#0D211D',
  knobOnNext: '#E1B347',
  knobOff: '#60766D',

  ink5: '#60766D',

  streakGradFrom: '#1A4438',
  streakGradTo: '#0F2B24',
  onStreakMeta: '#A8C9BE',
  onStreakWell: 'rgba(255,255,255,0.06)',
  onStreakToday: 'rgba(255,255,255,0.14)',
  ringPartial: 'rgba(123,224,190,0.4)',

  heatNone: '#1B2C27',
  heatFuture: '#131F1C',
  heatFutureInk: '#3C4B45',
} as const;

export const more = {
  ground: '#071210',
  sunk: '#0D1A17',
  raised: '#11201C',
  raisedPressed: '#152724',
  elevated: '#1A2E28',
  warmHeroFrom: '#2A2413',
  warmHeroTo: '#152722',
  goldPanel: '#241D0E',

  hairline: '#22322D',
  pillBorder: '#26382F',
  strong: '#2C4038',
  rowDivider: '#1D2C27',
  navBorder: '#1B2925',

  liftRaised: 'rgba(244,248,245,0.04)',
  liftElevated: 'rgba(244,248,245,0.06)',

  ink: '#F4F8F5',
  ink2: '#DBE6E0',
  ink3: '#9FB5AC',
  meta: '#7A9188',
  metaQuiet: '#5B7268',
  disabled: '#4B6259',
  onMint: '#07211B',
  onGoldPanel: '#E3D4A8',
  onWarmHero: '#F0E4C6',

  mint: '#7BE0BE',
  mintTrack: '#2E7A61',
  gold: '#D9AE5F',
  goldFill: 'rgba(217,174,95,0.10)',
  track: '#1B2925',
} as const;

export const moreRule = {
  title: ['rgba(217,174,95,0.55)', 'rgba(217,174,95,0.06)'] as const,
  section: ['rgba(217,174,95,0.28)', 'rgba(217,174,95,0)'] as const,
  fade: ['rgba(7,18,16,0)', more.ground] as const,
};
