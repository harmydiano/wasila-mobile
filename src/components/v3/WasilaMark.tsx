import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

const MARK = require('../../../design-assets/v3/icons/mark_star.png');

export default function WasilaMark({
  size = 104,
  style,
}: {
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return <Image source={MARK} style={[{ width: size, height: size }, style]} resizeMode="contain" />;
}
