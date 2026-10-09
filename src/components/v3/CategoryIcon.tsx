import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { CATS } from '../../data/content';

export const CATEGORY_ICONS: Record<string, any> = {
  rizq: require('../../../design-assets/v3/cat-sustenance-rain.png'),
  protect: require('../../../design-assets/v3/cat-protection-shield.png'),
  health: require('../../../design-assets/v3/cat-healing-honeypot.png'),
  status: require('../../../design-assets/v3/cat-growth-chart.png'),
  debt: require('../../../design-assets/v3/cat-debt-relief-lock.png'),
  calm: require('../../../design-assets/v3/cat-anxiety-lantern.png'),
  family: require('../../../design-assets/v3/cat-family-rings.png'),
  knowledge: require('../../../design-assets/v3/cat-knowledge-lamp.png'),
  birth: require('../../../design-assets/v3/cat-childbirth-cradle.png'),
  travel: require('../../../design-assets/v3/cat-travel-suitcase.png'),
};

export const NEEDS_ORDER = [
  'rizq', 'protect', 'health', 'status', 'debt',
  'calm', 'family', 'knowledge', 'birth', 'travel',
] as const;

const BY_ID = Object.fromEntries(CATS.map((c) => [c.id, c]));

export const NEEDS_CATS = NEEDS_ORDER.map((id) => BY_ID[id]).filter(Boolean);

export default function CategoryIcon({
  catId,
  size = 40,
  style,
  accessible = true,
}: {
  catId: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
  accessible?: boolean;
}) {
  const source = CATEGORY_ICONS[catId];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessible={accessible}
      accessibilityElementsHidden={!accessible}
      importantForAccessibility={accessible ? 'auto' : 'no-hide-descendants'}
    />
  );
}
