import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, type Palette } from '../theme/theme';
import { fonts } from '../theme/type';
import Icon from './Icon';

export default function Header({
  title,
  onBack,
  right,
  color: colorProp,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  color?: string;
}) {
  const { colors } = useTheme();
  const color = colorProp ?? colors.textPrimary;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack || (() => navigation.goBack())}
        hitSlop={10}
        style={styles.iconBtn}
      >
        <Icon name="arrow_back" size={22} color={color} />
      </Pressable>
      <Text style={[styles.title, { color }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, gap: 4 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: fonts.extrabold, fontSize: 18 },
  rightSlot: { minWidth: 40, alignItems: 'flex-end' },
});
