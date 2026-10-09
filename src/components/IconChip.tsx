import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, type Palette } from '../theme/theme';
import Icon from './Icon';

export default function IconChip({
  icon,
  size = 42,
  bg: bgProp,
  iconColor: iconColorProp,
  iconSize,
  radius = 12,
  set,
}: {
  icon: string;
  size?: number;
  bg?: string;
  iconColor?: string;
  iconSize?: number;
  radius?: number;
  set?: 'material' | 'community';
}) {
  const { colors } = useTheme();
  const bg = bgProp ?? colors.iconChipBg;
  const iconColor = iconColorProp ?? colors.accent;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.wrap, { width: size, height: size, backgroundColor: bg, borderRadius: radius }]}>
      <Icon name={icon} size={iconSize || Math.round(size * 0.52)} color={iconColor} set={set} />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
