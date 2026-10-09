import React, { useEffect, useMemo, useRef, useState } from 'react';
import { confirmReplacePractice } from '../../components/v3/confirmReplacePractice';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import ProgressRing from '../../components/ProgressRing';
import TextSettingsSheet from '../../components/v3/TextSettingsSheet';
import BeneficialSheet from './sheets/BeneficialSheet';
import { fonts, serifHeading, arabicText, tabular, SIZE, ONE_OFF, uiLeading, eyebrow } from '../../theme/type';
import { colors } from '../../theme/v3/colors';
import { benefitAt, benefitKey, durationLabel, nightsFor, runsFor } from '../../data/benefits';
import { nightForDate } from '../../utils/practice';
import { useAppState, dayKey } from '../../state/AppState';

export default function BenefitCounter({ route, navigation }: any) {
  const { catId, duaIdx } = route.params ?? {};
  const { cat, dua, idx } = benefitAt(catId, duaIdx);
  const key = benefitKey(cat.id, idx);

  const { arabicSize, practice, creditPractice, setPracticeTally, startPractice } = useAppState();
  const [textOpen, setTextOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const runs = useMemo(() => runsFor(dua), [dua]);
  const multi = runs.length > 1;

  const mine = practice && practice.catId === cat.id && practice.duaIdx === idx ? practice : null;

  const askedReplace = useRef(false);
  useEffect(() => {
    if (mine || !runs.length || askedReplace.current) return;
    askedReplace.current = true;
    confirmReplacePractice(
      practice,
      () => startPractice(cat.id, idx, runs.map((r) => r.target), nightsFor(dua)),
      () => navigation.goBack()
    );
  }, [mine, runs, cat.id, idx, dua, startPractice, practice, navigation]);

  const today = dayKey(new Date());
  const tally = mine && mine.tallyDateKey === today ? mine.tally : 0;
  const segIndex = Math.min(Math.max(0, runs.length - 1), mine?.segment ?? 0);
  const run = runs[segIndex];
  const target = mine?.target ?? run?.target ?? 1;
  const night = mine ? nightForDate(mine.startedDateKey, mine.totalNights, new Date()) : 1;
  const doneToday = !!mine?.completedDates.includes(today);

  const finished = !!mine && mine.completedDates.length >= mine.totalNights;
  const [asked, setAsked] = useState(false);
  useEffect(() => {
    if (finished && !asked) {
      setAsked(true);
      setPromptOpen(true);
    }
  }, [finished, asked]);

  const count = () => {
    if (doneToday) return;
    creditPractice(1);
  };

  const { width, height } = useWindowDimensions();
  const ringSize = Math.max(150, Math.min(250, width - 110, Math.round(height * 0.3)));
  const tallySize = Math.round(ONE_OFF.tally * (ringSize / 250));

  const remaining = Math.max(0, target - tally);
  const nextRun = multi && segIndex < runs.length - 1 ? runs[segIndex + 1] : null;
  const cornerChips = runs.every((r) => /^\d+$/.test(r.label) || r.label === 'Door');
  const chipLabel = (i: number) => (cornerChips ? runs[i].label : String(i + 1));
  const shortName = (label: string) =>
    /^\d+$/.test(label) ? `corner ${label}` : label === 'Door' ? 'the doorway' : label;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="close" size={23} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={2} maxFontSizeMultiplier={1.3}>
          {dua.t}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Counter settings" hitSlop={10} style={styles.iconBtn} onPress={() => setTextOpen(true)}>
          <Icon name="settings" size={21} color={colors.textSecondary} />
        </Pressable>
      </View>

      {multi && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.segScroll}
          contentContainerStyle={[styles.segRow, runs.length <= 6 && styles.segRowFill]}
        >
          {runs.map((r, i) => {
            const done = doneToday || i < segIndex;
            const live = !doneToday && i === segIndex;
            return (
              <View key={i} style={[styles.segChip, runs.length <= 6 && styles.segChipFill, live && styles.segChipLive]}>
                <Text
                  style={[styles.segText, done && styles.segTextDone, live && styles.segTextLive]}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                >
                  {done ? `${chipLabel(i)} ✓` : chipLabel(i)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.centre}
        showsVerticalScrollIndicator={false}
      >
        {!!(run?.ar?.trim() || (!run && dua.n)) && (
          <Text
            style={[styles.arabic, arabicText(arabicSize)]}
            maxFontSizeMultiplier={1}
          >
            {run?.ar?.trim() || dua.n}
          </Text>
        )}
        {!!run?.tr?.trim() && (multi || !run.ar?.trim()) && (
          <Text style={styles.runTr} maxFontSizeMultiplier={1.3}>
            {run.tr}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Count one"
          accessibilityState={{ disabled: doneToday }}
          disabled={doneToday}
          onPress={count}
          style={({ pressed }) => [styles.ringTap, pressed && !doneToday && styles.ringTapPressed]}
        >
          <ProgressRing
            size={ringSize}
            strokeWidth={Math.round(ringSize * 0.076)}
            progress={tally / Math.max(1, target)}
            color={colors.accent}
            trackColor="#16241F"
          >
            <Text
              style={[styles.bigCount, { fontSize: tallySize, lineHeight: Math.round(tallySize * 1.05) }]}
              maxFontSizeMultiplier={1.1}
            >
              {tally}
            </Text>
            <Text style={styles.bigOf} maxFontSizeMultiplier={1.2}>
              {!multi ? `of ${target}` : cornerChips ? `of ${target} · ${shortName(run.label).toLowerCase()}` : `of ${target} · part ${segIndex + 1} of ${runs.length}`}
            </Text>
          </ProgressRing>
        </Pressable>

        <Text style={styles.hint}>
          {doneToday
            ? 'Complete for today. Continue tomorrow.'
            : multi && run
              ? run.note
                ? `${run.note}. ${remaining} left before you move on.`
                : segIndex < runs.length - 1
                  ? `${remaining} left before you move on.`
                  : `${remaining} left — the last count.`
              : [dua.tm, `${remaining} remaining`].filter(Boolean).join(' · ')}
        </Text>
      </ScrollView>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Undo one"
          style={({ pressed }) => [styles.roundBtn, pressed && styles.pressed]}
          onPress={() => setPracticeTally(Math.max(0, tally - 1))}
        >
          <Icon name="undo" size={21} color={colors.textMuted} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Count one"
          accessibilityState={{ disabled: doneToday }}
          disabled={doneToday}
          style={({ pressed }) => [styles.countBtn, doneToday && styles.countBtnDone, pressed && styles.pressed]}
          onPress={count}
        >
          <Text style={[styles.countBtnText, doneToday && styles.countBtnTextDone]}>
            {doneToday ? 'Done for today' : 'Count'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset this run"
          style={({ pressed }) => [styles.roundBtn, pressed && styles.pressed]}
          onPress={() => setPracticeTally(0)}
        >
          <Icon name="refresh" size={21} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{`Day ${night} · ${durationLabel(dua)}`}</Text>
        {!!nextRun && !doneToday && (
          <Text style={styles.footerNext} numberOfLines={1}>
            {`Next: ${shortName(nextRun.label)}`}
          </Text>
        )}
      </View>

      <TextSettingsSheet visible={textOpen} onClose={() => setTextOpen(false)} />
      <BeneficialSheet
        visible={promptOpen}
        onClose={() => setPromptOpen(false)}
        benefitKey={key}
        catId={cat.id}
        duaIdx={idx}
        title={dua.t}
        line={[dua.tr, dua.c, dua.tm?.toLowerCase()].filter(Boolean).join(' · ')}
        nights={mine?.totalNights ?? 1}
        onRestart={() => {
          if (!runs.length) return;
          startPractice(cat.id, idx, runs.map((r) => r.target), mine?.totalNights ?? 1);
          setPromptOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingTop: 4 },
  iconBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  topTitle: { ...eyebrow(colors.textMuted), flex: 1, textAlign: 'center' },

  segScroll: { flexGrow: 0 },
  segRow: { flexDirection: 'row', gap: 7, paddingHorizontal: 20, paddingTop: 10 },
  segRowFill: { flexGrow: 1 },
  segChip: { minWidth: 40, minHeight: 34, paddingHorizontal: 10, justifyContent: 'center', borderRadius: 999, backgroundColor: colors.bgCardMuted },
  segChipFill: { flex: 1 },
  segChipLive: { backgroundColor: colors.mint },
  segText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textDisabled, textAlign: 'center' },
  segTextDone: { fontFamily: fonts.extrabold, color: colors.accent },
  segTextLive: { fontFamily: fonts.extrabold, color: colors.onMintText },

  scroll: { flex: 1 },
  centre: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 22, paddingHorizontal: 24, paddingVertical: 16 },
  ringTap: { borderRadius: 999 },
  ringTapPressed: { opacity: 0.82 },
  arabic: { color: colors.mint, textAlign: 'center' },
  runTr: { ...serifHeading(SIZE.title), color: colors.textPrimary, textAlign: 'center', marginTop: -10 },
  bigCount: { ...serifHeading(ONE_OFF.tally), ...tabular, color: colors.textPrimary },
  bigOf: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.accent, marginTop: 4 },
  hint: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 18, color: colors.textMuted, textAlign: 'center' },

  controls: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 10 },
  roundBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center' },
  countBtn: { flex: 1, minHeight: 58, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  countBtnDone: { backgroundColor: colors.bgCardMuted },
  countBtnText: { fontFamily: fonts.extrabold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.onMintText },
  countBtnTextDone: { color: colors.textMuted },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 },
  footerText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.textFaint },
  footerNext: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.accent },

  pressed: { opacity: 0.9 },
});
