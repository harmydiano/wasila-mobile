export const colors = {
  bgRoot: '#0A1512',
  bgCard: '#142420',
  bgCardAlt: '#13201D',
  bgCardMuted: '#1C2C27',
  bgInput: '#213630',
  bgSheet: '#13201D',
  bgDashed: '#1C2C27',
  bgFreeHighlight: '#264038',
  iconChipBg: '#264038',

  tealGradStart: '#142924',
  tealGradMid: '#1F3D34',
  tealGradEnd: '#2A6F58',

  primary: '#7BE0BE',
  accent: '#7BE0BE',
  mint: '#A4EAD2',
  onTeal: '#F3F7F5',

  textPrimary: '#F3F7F5',
  textHeadline: '#F3F7F5',
  textSecondary: '#DBE6E0',
  textMuted: '#97AFA5',
  textFaint: '#819C91',
  textQuiet: '#779287',
  textDisabled: '#60766D',
  textTealLabel: '#A4EAD2',

  gold: '#E1B347',
  amberBody: '#E6CD94',
  amberBtnBg: '#E6CD94',
  amberBtnText: '#29200A',
  amberCardText: '#E6CD94',
  goldEyebrow: '#E1B347',
  goldMeta: '#D3B369',
  goldBody: '#E6CD94',
  amberCardBg: '#342A14',
  premiumGradStart: '#2B2312',
  premiumGradEnd: '#635021',

  onMintText: '#0D211D',
  onMintTextAlt: '#0D211D',
  brokenStreakBorder: '#6B592E',
  freeCardBorder: '#358D6F',
  outlineBorder: '#2E3D38',
  divider: '#2E3D38',

  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export const categoryTints: Record<string, { light: string; bg: string; dark: string }> = {
  rizq: { light: '#E1B347', bg: 'rgba(225,179,71,0.15)', dark: '#E1B347' },
  debt: { light: '#34D399', bg: 'rgba(4,120,87,0.20)', dark: '#34D399' },
  protect: { light: '#38BDF8', bg: 'rgba(7,89,133,0.25)', dark: '#38BDF8' },
  health: { light: '#7BE0BE', bg: 'rgba(123,224,190,0.15)', dark: '#7BE0BE' },
  status: { light: '#FB7185', bg: 'rgba(159,18,57,0.20)', dark: '#FB7185' },
  family: { light: '#FB923C', bg: 'rgba(249,115,22,0.15)', dark: '#FB923C' },
  birth: { light: '#A78BFA', bg: 'rgba(91,33,182,0.22)', dark: '#A78BFA' },
  calm: { light: '#22D3EE', bg: 'rgba(21,94,117,0.24)', dark: '#22D3EE' },
  knowledge: { light: '#FCD34D', bg: 'rgba(180,83,9,0.20)', dark: '#FCD34D' },
  travel: { light: '#2DD4BF', bg: 'rgba(17,94,89,0.22)', dark: '#2DD4BF' },
};

export { tileIconColor } from '../colors';

