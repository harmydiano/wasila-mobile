import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import ProgressRing from '../../components/ProgressRing';
import { fonts, serifHeading, tabular, SIZE } from '../../theme/type';
import { colors, v3 } from '../../theme/v3/colors';
import {
  ALL_BENEFITS, benefitAt, benefitKey, lineFor, nightsFor, runsFor,
} from '../../data/benefits';
import { useContentRev } from '../../data/remoteBenefits';
import { currentStreakFromDates, nightForDate } from '../../utils/practice';
import { addDays } from '../../utils/prayerLog';
import { useAppState, dayKey } from '../../state/AppState';

export default function ActivePractices({ navigation }: any) {
  const {
    practice, startPractice, endPractice,
    benefitRecited, reminders, toggleReminder,
  } = useAppState();

  const today = dayKey(new Date());

  const contentRev = useContentRev();
  const live = useMemo(() => {
    if (!practice) return null;
    const { cat, dua, idx } = benefitAt(practice.catId, practice.duaIdx);
    const counts = runsFor(dua).length > 0;
    const night = nightForDate(practice.startedDateKey, practice.totalNights, new Date());
    const tally = practice.tallyDateKey === today ? practice.tally : 0;
    const doneToday = practice.completedDates.includes(today);
    const yesterday = dayKey(addDays(new Date(), -1));
    const started = practice.startedDateKey;
    const broken =
      !doneToday &&
      night > 1 &&
      !practice.completedDates.includes(yesterday) &&
      started !== today;
    return { cat, dua, idx, counts, night, tally, doneToday, broken };
  }, [practice, today, contentRev]);

  const recitedToday = useMemo(
    () =>
      ALL_BENEFITS.filter((b) => (benefitRecited[benefitKey(b.catId, b.duaIdx)] ?? []).includes(today)).map(
        (b) => ({ ...b, dates: benefitRecited[benefitKey(b.catId, b.duaIdx)] ?? [] }),
      ),
    [benefitRecited, today, contentRev],
  );

  const runningCount = (live && !live.broken ? 1 : 0) + recitedToday.length;
  const needsRestart = live?.broken ? 1 : 0;

  return (
    <Screen nav="Library" contentStyle={styles.content}>
      <View style={styles.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow_back" size={23} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>In progress</Text>
          <Text style={styles.sub}>
            {runningCount === 0 && needsRestart === 0
              ? 'Nothing running'
              : `${runningCount} running${needsRestart ? ` · ${needsRestart} needs restarting` : ''}`}
          </Text>
        </View>
      </View>

      {live && !live.broken && live.counts && (
        <View style={styles.goldCard}>
          <View style={styles.cardTop}>
            <ProgressRing
              size={46}
              strokeWidth={5}
              progress={live.night / Math.max(1, practice!.totalNights)}
              color={colors.gold}
              trackColor={v3.goldWell}
            >
              <Text style={styles.ringText} maxFontSizeMultiplier={1.1}>
                {`${live.night}/${practice!.totalNights}`}
              </Text>
            </ProgressRing>
            <View style={{ flex: 1 }}>
              <Text style={styles.goldTitle} numberOfLines={2}>
                {live.dua.t}
              </Text>
              <Text style={styles.goldSub} numberOfLines={2}>
                {`${lineFor(live.dua)} · ${live.tally} done today`}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
              onPress={() => navigation.navigate('BenefitCounter', { catId: live.cat.id, duaIdx: live.idx })}
            >
              <Text style={styles.continueText}>Continue</Text>
            </Pressable>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: !!reminders[live.dua.tm] }}
              style={({ pressed }) => [
                styles.remindBtn, !!reminders[live.dua.tm] && styles.remindBtnOn, pressed && styles.pressed,
              ]}
              onPress={() => toggleReminder(live.dua.tm)}
            >
              <Text style={styles.remindText}>{reminders[live.dua.tm] ? 'Reminder on' : 'Remind me'}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {recitedToday.map((r) => {
        const streak = currentStreakFromDates(r.dates, new Date());
        return (
          <Pressable
            key={benefitKey(r.catId, r.duaIdx)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.doneCard, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Benefit', { catId: r.catId, duaIdx: r.duaIdx })}
          >
            <View style={styles.doneRing}>
              <Icon name="check" size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {r.dua.t}
              </Text>
              <Text style={styles.doneSub}>
                {`Done today · day ${streak} · ${r.dua.d.toLowerCase()}`}
              </Text>
            </View>
          </Pressable>
        );
      })}

      {live?.broken && (
        <View style={styles.brokenCard}>
          <View style={styles.cardTop}>
            <View style={styles.brokenDisc}>
              <Icon name="restart_alt" size={22} color={colors.warmAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {live.dua.t}
              </Text>
              <Text style={styles.brokenSub}>
                {`Broken on day ${live.night} of ${practice!.totalNights} · restart to keep it going`}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.restartBtn, pressed && styles.pressed]}
              onPress={() => {
                const runs = runsFor(live.dua);
                startPractice(
                  live.cat.id, live.idx,
                  runs.length ? runs.map((r) => r.target) : 1,
                  nightsFor(live.dua),
                );
              }}
            >
              <Text style={styles.restartText}>Restart</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]}
              onPress={endPractice}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!live && recitedToday.length === 0 && (
        <View style={styles.empty}>
          <Icon name="local_fire_department" size={30} color={colors.textDisabled} />
          <Text style={styles.emptyText}>
            Nothing is running. Opening the counter on a benefit starts a run, and it will appear here until it
            finishes.
          </Text>
        </View>
      )}

      <Text style={styles.footnote}>
        A practice with a fixed duration counts days. One marked ongoing counts the streak instead.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28, gap: 11 },

  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 3 },
  backBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.textMuted, marginTop: 3 },

  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 14 },
  ringText: { ...tabular, fontFamily: fonts.extrabold, fontSize: SIZE.caption, color: colors.gold },

  goldCard: { backgroundColor: colors.amberCardBg, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17 },
  goldTitle: { fontFamily: fonts.extrabold, fontSize: SIZE.body, lineHeight: 19, color: colors.textPrimary },
  goldSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.amberCardText, marginTop: 3 },
  continueBtn: { flex: 1, minHeight: 44, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  continueText: { fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.onMintText },
  remindBtn: {
    minHeight: 44, justifyContent: 'center', paddingHorizontal: 15, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(225,179,71,0.4)',
  },
  remindBtnOn: { backgroundColor: 'rgba(225,179,71,0.16)' },
  remindText: { fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.gold },

  doneCard: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    backgroundColor: v3.surfaceCard, borderTopWidth: 1, borderTopColor: v3.cardTopHighlight, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17,
  },
  doneRing: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 3, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  rowTitle: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: 19, color: colors.textPrimary },
  doneSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: colors.accent, marginTop: 3 },

  brokenCard: {
    backgroundColor: colors.bgCardMuted, borderWidth: 1, borderColor: v3.warmBorder,
    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 17,
  },
  brokenDisc: { width: 46, height: 46, borderRadius: 23, backgroundColor: v3.warmWell, alignItems: 'center', justifyContent: 'center' },
  brokenSub: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 17, color: v3.warmInk, marginTop: 3 },
  restartBtn: {
    flex: 1, minHeight: 44, borderRadius: 999, borderWidth: 1, borderColor: colors.divider,
    alignItems: 'center', justifyContent: 'center',
  },
  restartText: { fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.textSecondary },
  removeBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 15, borderRadius: 999 },
  removeText: { fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.textFaint },

  empty: { alignItems: 'center', gap: 12, paddingVertical: 40, paddingHorizontal: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: SIZE.body, lineHeight: 21, color: colors.textMuted, textAlign: 'center' },

  footnote: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: 19, color: colors.textDisabled, marginTop: 6 },

  pressed: { opacity: 0.9 },
});
