import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

export const QUICK_ICONS: Record<string, any> = {
  qibla: require('../../../design-assets/v3/icons/c_qibla.png'),
  tasbih: require('../../../design-assets/v3/icons/c_tasbih.png'),
  names: require('../../../design-assets/v3/icons/e_names.png'),
  zikr: require('../../../design-assets/v3/icons/e_zikr.png'),
};

export default function QuickIcon({
  name,
  size = 38,
  style,
}: {
  name: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  const source = QUICK_ICONS[name];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={[{ width: size, height: size, borderRadius: Math.round((9 / 38) * size) }, style]}
      resizeMode="contain"
    />
  );
}
