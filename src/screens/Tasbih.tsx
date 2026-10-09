import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { DHIKR } from '../data/content';

const TARGETS = [33, 99, 100, 1000];

export default function Tasbih({ route, navigation }: any) {
  const initialDhikr = route.params?.dhikrIdx ?? 0;
  const [dhikrIdx, setDhikrIdx] = useState(initialDhikr);
  const [target, setTarget] = useState(route.params?.target ?? parseInt(DHIKR[initialDhikr].count, 10));
  const [count, setCount] = useState(0);
  const [loop, setLoop] = useState(1);

  const dhikr = DHIKR[dhikrIdx] || DHIKR[0];

  const tap = () => {
    setCount((c) => {
      if (c + 1 >= target) {
        setLoop((l) => l + 1);
        return 0;
      }
      return c + 1;
    });
  };

  const reset = () => {
    setCount(0);
    setLoop(1);
  };

  const selectDhikr = (i: number) => {
    setDhikrIdx(i);
    setTarget(parseInt(DHIKR[i].count, 10));
    setCount(0);
    setLoop(1);
  };

  const selectTarget = (t: number) => {
    setTarget(t);
    setCount(0);
    setLoop(1);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.iconBtn}>
          <Icon name="arrow_back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Tasbih</Text>
        <Pressable onPress={reset} style={styles.iconBtn}>
          <Icon name="refresh" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <Pressable style={styles.tapZone} onPress={tap}>
        <Text style={styles.loopLabel}>Loop {loop}</Text>
        <Text style={styles.count}>{String(count).padStart(2, '0')}</Text>
        <Text style={styles.target}>/ {target}</Text>
        <Text style={styles.arabic}>{dhikr.ar}</Text>
        <Text style={styles.dhikrName}>{dhikr.name}</Text>
        <Text style={styles.hint}>Tap anywhere to count</Text>
      </Pressable>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Dhikr</Text>
        <View style={styles.targetRow}>
          {TARGETS.map((t) => (
            <Pressable key={t} style={[styles.targetChip, target === t && styles.targetChipOn]} onPress={() => selectTarget(t)}>
              <Text style={[styles.targetText, target === t && styles.targetTextOn]}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ gap: 2 }}>
          {DHIKR.map((d, i) => (
            <Pressable key={d.name} style={[styles.dhikrRow, i === dhikrIdx && styles.dhikrRowOn]} onPress={() => selectDhikr(i)}>
              <Icon name={i === dhikrIdx ? 'radio_button_checked' : 'radio_button_unchecked'} size={18} color={i === dhikrIdx ? colors.accent : colors.textDisabled} />
              <Text style={styles.dhikrRowName}>{d.name}</Text>
              <View style={{ flex: 1 }} />
              <Text style={styles.dhikrRowArabic}>{d.ar}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.textPrimary },
  tapZone: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  loopLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  count: { fontFamily: fonts.extrabold, fontSize: 82, color: colors.accent },
  target: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textMuted, marginTop: -6, marginBottom: 18 },
  arabic: { fontFamily: fonts.arabic, fontSize: 38, color: colors.textPrimary },
  dhikrName: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.textSecondary, marginTop: 6 },
  hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint, marginTop: 18 },
  sheet: { backgroundColor: colors.bgSheet, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 16 },
  sheetTitle: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.textPrimary },
  targetRow: { flexDirection: 'row', gap: 8 },
  targetChip: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center', borderWidth: 1, borderColor: colors.outlineBorder },
  targetChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  targetText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  targetTextOn: { color: '#fff', fontFamily: fonts.bold },
  dhikrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12 },
  dhikrRowOn: { backgroundColor: colors.iconChipBg },
  dhikrRowName: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textPrimary },
  dhikrRowArabic: { fontFamily: fonts.arabic, fontSize: 20, color: colors.textSecondary },
});
