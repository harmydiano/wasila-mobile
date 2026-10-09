import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/Icon';
import GeometricPattern from '../../components/GeometricPattern';
import { colors } from '../../theme/v2/colors';
import { fonts } from '../../theme/type';
import { DHIKR } from '../../data/content';
import { useAppState } from '../../state/AppState';
import { dayKey } from '../../utils/prayerLog';
import { benefitAt, blocksFor, recitationOf, segmentName } from '../../data/benefits';

const TARGETS = [33, 99, 100, 1000];

export default function Tasbih({ route, navigation }: any) {
  const creditsPractice = !!route.params?.creditsPractice;
  const { creditPractice, practice } = useAppState();

  const initialDhikr = route.params?.dhikrIdx ?? 0;
  const [dhikrIdx, setDhikrIdx] = useState(initialDhikr);
  const [target, setTarget] = useState(route.params?.target ?? parseInt(DHIKR[initialDhikr].count, 10));
  const [count, setCount] = useState(0);
  const [loop, setLoop] = useState(1);

  const practicePhrase = creditsPractice && route.params?.ar ? { ar: route.params.ar, name: route.params.name ?? '' } : null;
  const dhikr = practicePhrase ?? DHIKR[dhikrIdx] ?? DHIKR[0];
  const period: 'today' | 'tonight' = route.params?.period === 'today' ? 'today' : 'tonight';

  const todayKey = dayKey(new Date());
  const live = creditsPractice && !!practice;
  const [anotherSitting] = useState(() => !!practice?.completedDates.includes(todayKey));
  const liveDone = live && !!practice?.completedDates.includes(todayKey);
  const liveTally = live && practice!.tallyDateKey === todayKey ? practice!.tally : 0;
  const segCount = live ? Math.max(1, practice!.segments ?? 1) : 1;
  const segIdx = live ? Math.min(segCount - 1, practice!.segment ?? 0) : 0;
  const parts = live && segCount > 1 ? recitationOf(blocksFor(benefitAt(practice!.catId, practice!.duaIdx).dua))?.segments ?? null : null;

  const shownTarget = live ? practice!.target : target;
  const shownCount = !live || anotherSitting ? count : liveDone ? practice!.target : liveTally;
  const finished = live && (anotherSitting ? count >= shownTarget : liveDone);
  const stateLabel = !live
    ? `Loop ${loop}`
    : finished
      ? 'Complete'
      : anotherSitting
        ? 'Another sitting'
        : segCount > 1
          ? `${segmentName(parts?.[segIdx]?.label ?? String(segIdx + 1))} of ${segCount}`
          : 'Counting';
  const moveNote = segCount > 1 && segIdx > 0 && liveTally === 0 ? parts?.[segIdx - 1]?.note : null;
  const hint = finished
    ? anotherSitting
      ? `${period === 'today' ? 'Today' : 'Tonight'} was already recorded`
      : `Added to ${period}'s count on the dashboard`
    : moveNote ?? 'Tap anywhere to count';

  const tap = () => {
    if (finished) return;
    if (live) {
      if (anotherSitting) setCount((c) => c + 1);
      else creditPractice(1);
      return;
    }
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
        <Text style={styles.headerTitle}>{creditsPractice ? (period === 'today' ? "Today's count" : "Tonight's count") : 'Tasbih'}</Text>
        {live && !anotherSitting ? (
          <View style={styles.iconSlot} />
        ) : (
          <Pressable onPress={reset} style={styles.iconBtn}>
            <Icon name="refresh" size={22} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <Pressable style={styles.tapZone} onPress={tap}>
        <GeometricPattern color={colors.mint} opacity={0.08} />
        <Text style={[styles.loopLabel, finished && styles.loopLabelDone]}>{stateLabel}</Text>
        <Text style={styles.count}>{String(shownCount).padStart(2, '0')}</Text>
        <Text style={styles.target}>/ {shownTarget.toLocaleString()}</Text>
        <Text style={styles.arabic}>{dhikr.ar}</Text>
        <Text style={styles.dhikrName}>{dhikr.name}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </Pressable>

      {creditsPractice ? (
        <View style={styles.sheet}>
          <Text style={styles.creditNote}>{anotherSitting
              ? `${period === 'today' ? 'Today' : 'Tonight'} is already recorded, so this sitting is counted here only.`
              : `Every tap here is added straight to ${period}'s tally on the dashboard.`}</Text>
        </View>
      ) : (
      <View style={styles.sheet}>
        <Text style={styles.sheetEyebrow}>Target</Text>
        <View style={styles.targetRow}>
          {TARGETS.map((t) =>
            target === t ? (
              <Pressable key={t} style={styles.targetChipWrap} onPress={() => selectTarget(t)}>
                <LinearGradient colors={[colors.mint, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.targetChip}>
                  <Icon name="repeat" size={13} color={colors.onMintText} />
                  <Text style={[styles.targetText, styles.targetTextOn]}>{t}</Text>
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable key={t} style={styles.targetChipWrap} onPress={() => selectTarget(t)}>
                <View style={[styles.targetChip, styles.targetChipOff]}>
                  <Icon name="repeat" size={13} color={colors.accent} />
                  <Text style={styles.targetText}>{t}</Text>
                </View>
              </Pressable>
            )
          )}
        </View>

        <Text style={[styles.sheetEyebrow, { marginTop: 4 }]}>Dhikr</Text>
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  iconSlot: { width: 40, height: 40 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCard },
  headerTitle: { fontFamily: fonts.serif, fontSize: 19, color: colors.textPrimary },

  tapZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 14,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 36,
    overflow: 'hidden',
  },
  loopLabelDone: { color: colors.mint },
  loopLabel: { fontFamily: fonts.extrabold, fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.textMuted },
  count: { fontFamily: fonts.serifBold, fontSize: 88, lineHeight: 96, color: colors.mint, marginTop: 6 },
  target: { fontFamily: fonts.bold, fontSize: 13, color: colors.textMuted },
  arabic: { fontFamily: fonts.arabic, fontSize: 38, color: colors.textPrimary, marginTop: 26 },
  dhikrName: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.textSecondary, marginTop: 4 },
  hint: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textFaint, marginTop: 24 },

  sheet: { backgroundColor: colors.bgSheet, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, gap: 12 },
  sheetEyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },
  creditNote: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18, color: colors.textMuted, textAlign: 'center' },

  targetRow: { flexDirection: 'row', gap: 8 },
  targetChipWrap: { flex: 1 },
  targetChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 999 },
  targetChipOff: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.outlineBorder },
  targetText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textSecondary },
  targetTextOn: { color: colors.onMintText, fontFamily: fonts.bold },

  dhikrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 16 },
  dhikrRowOn: { backgroundColor: colors.iconChipBg },
  dhikrRowName: { fontFamily: fonts.semibold, fontSize: 13, color: colors.textPrimary },
  dhikrRowArabic: { fontFamily: fonts.arabic, fontSize: 20, color: colors.textSecondary },
});
