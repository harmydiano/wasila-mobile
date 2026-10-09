import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';

export default function MetaChip({
  label,
  bg = colors.iconChipBg,
  color = colors.textSecondary,
}: {
  label: string;
  bg?: string;
  color?: string;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  label: { fontFamily: fonts.semibold, fontSize: 11.5 },
});
