import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme, type Palette } from '../theme/theme';
import { fonts } from '../theme/type';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'mint' | 'gold' | 'disabled';
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
};

export default function Button({ label, onPress, variant = 'primary', style, fullWidth = true }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const TEXT_COLORS = useMemo(() => makeTextColors(colors), [colors]);
  const v = styles[variant] || styles.primary;
  const textColor = TEXT_COLORS[variant] || '#fff';
  return (
    <Pressable
      onPress={variant === 'disabled' ? undefined : onPress}
      style={({ pressed }) => [
        base.base,
        v,
        fullWidth && base.fullWidth,
        pressed && variant !== 'disabled' && base.pressed,
        style,
      ]}
    >
      <Text style={[base.text, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const makeTextColors = (colors: Palette): Record<string, string> => ({
  primary: '#FFFFFF',
  outline: colors.textSecondary,
  ghost: colors.accent,
  mint: colors.onMintText,
  gold: colors.amberBtnText,
  disabled: colors.textDisabled,
});

const base = StyleSheet.create({
  base: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  text: { fontFamily: fonts.bold, fontSize: 15 },
});

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.outlineBorder },
  ghost: { backgroundColor: 'transparent' },
  mint: { backgroundColor: colors.mint },
  gold: { backgroundColor: colors.amberBtnBg },
  disabled: { backgroundColor: colors.divider },
});
