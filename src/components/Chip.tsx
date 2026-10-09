import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useTheme, type Palette } from '../theme/theme';
import { fonts } from '../theme/type';
import Icon from './Icon';

export default function Chip({
  label,
  active,
  onPress,
  showCheck = true,
}: {
  label: string;
  active: boolean;
  onPress?: () => void;
  showCheck?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.on : styles.off]}>
      {active && showCheck && <Icon name="check" size={15} color="#fff" style={{ marginRight: 4 }} />}
      <Text style={[styles.label, { color: active ? '#fff' : colors.textSecondary, fontFamily: active ? fonts.bold : fonts.semibold }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
  },
  on: { backgroundColor: colors.primary },
  off: { borderWidth: 1, borderColor: colors.outlineBorder, backgroundColor: 'transparent' },
  label: { fontSize: 13 },
});
