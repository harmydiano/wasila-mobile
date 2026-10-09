import { colors as v1Colors, categoryTints, tileIconColor } from './colors';
import { colors as v2Colors } from './v2/colors';
import { useUiVersionOptional } from '../state/UiVersion';

export type Palette = Record<keyof typeof v1Colors, string>;

export type Theme = {
  version: 'v1' | 'v2' | 'v3';
  colors: Palette;
  categoryTints: typeof categoryTints;
  tileIconColor: string;
};

const v1Theme: Theme = { version: 'v1', colors: v1Colors, categoryTints, tileIconColor };
const v2Theme: Theme = { version: 'v2', colors: v2Colors, categoryTints, tileIconColor };
const v3Theme: Theme = { version: 'v3', colors: v2Colors, categoryTints, tileIconColor };

export function useTheme(): Theme {
  const v = useUiVersionOptional();
  if (v === 'v3') return v3Theme;
  if (v === 'v2') return v2Theme;
  return v1Theme;
}
