import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme, type Palette } from '../theme/theme';

export default function Card({
  children,
  style,
  bg: bgProp,
  radius = 18,
  border,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bg?: string;
  radius?: number;
  border?: string;
}) {
  const { colors } = useTheme();
  const bg = bgProp ?? colors.bgCard;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, borderRadius: radius },
        border ? { borderWidth: 1, borderColor: border } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  base: { padding: 16 },
});
