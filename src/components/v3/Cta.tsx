import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { fonts, SIZE, uiLeading } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';

export type CtaTone = 'mint' | 'olive' | 'gold';

const TONES: Record<CtaTone, { fill: string; onFill: string; border: string; outlineInk: string }> = {
  mint: { fill: colors.accent, onFill: colors.onMintText, border: v3.borderStrong, outlineInk: colors.textSecondary },
  olive: { fill: v3.oliveAccent, onFill: v3.onOlive, border: v3.oliveBorder, outlineInk: v3.oliveBody },
  gold: { fill: colors.gold, onFill: v3.onGold, border: v3.goldCardBorder, outlineInk: v3.goldBody },
};

export default function Cta({
  tone,
  variant,
  label,
  a11yLabel,
  icon,
  accented = false,
  onPress,
}: {
  tone: CtaTone;
  variant: 'fill' | 'outline';
  label: string;
  a11yLabel?: string;
  icon?: string;
  accented?: boolean;
  onPress: () => void;
}) {
  const t = TONES[tone];
  const fill = variant === 'fill';
  const ink = fill ? t.onFill : accented ? colors.accent : t.outlineInk;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      hitSlop={{ top: 2, bottom: 2 }}
      style={({ pressed }) => [
        styles.base,
        fill
          ? { flex: 1, backgroundColor: t.fill }
          : { borderWidth: 1, borderColor: t.border, paddingHorizontal: 15, flexShrink: 1 },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {fill && icon ? <Icon name={icon} size={20} color={ink} /> : null}
      <Text style={[styles.label, { color: ink }]} numberOfLines={1} maxFontSizeMultiplier={1.5}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44, borderRadius: 999, paddingHorizontal: 12, gap: 7,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  label: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title) },
  pressed: { opacity: 0.9 },
});
