import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, ImageBackground,
  Animated, Easing, useWindowDimensions,
  type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import BottomNav from '../../components/BottomNav';
import CategoryIcon, { NEEDS_CATS } from '../../components/v3/CategoryIcon';
import Cta from '../../components/v3/Cta';
import QuickIcon from '../../components/v3/QuickIcon';
import { useReduceMotion } from '../../components/v3/Stagger';
import { takePendingFlight, type IconRect, type PendingFlight } from '../../components/v3/sharedElement';
import { fonts, serifHeading, tabular, SIZE, CLAMP, uiLeading, bodyLeading, eyebrow } from '../../theme/type';
import { avoidOrphan } from '../../utils/typography';
import { colors, v3 } from '../../theme/v3/colors';
import { CATS } from '../../data/content';
import { getSelectedNeedCat } from '../../data/prefs';
import { nightsFor, runLabel, runsFor } from '../../data/benefits';
import { usePrayer, type PrayerRow } from '../../state/usePrayer';
import { useAppState } from '../../state/AppState';
import { formatGregorian } from '../../utils/hijri';
import { useHijriDate } from '../../state/useHijriDate';
import { dayKey, addDays } from '../../utils/prayerLog';
import { afterPhraseOf, windowOpensPhrase } from '../../utils/windowCopy';
import { nightForDate, endDateLabel, currentStreakFromDates, lastKeptLabel, parseDateKey } from '../../utils/practice';

const HEADER_BG = require('../../../design-assets/v3/img_bg_top_v3.png');

function NightBars({ total, lit }: { total: number; lit: number }) {
  const dense = total > 11;
  const denser = total > 21;
  return (
    <View style={[styles.nightBars, dense && styles.nightBarsDense, denser && styles.nightBarsDenser]}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.nightBar, dense && styles.nightBarDense, denser && styles.nightBarDenser, i < lit && styles.nightBarOn]} />
      ))}
    </View>
  );
}

function RunBars({ startKey, total, kept }: { startKey: string; total: number; kept: string[] }) {
  const dense = total > 11;
  const denser = total > 21;
  const set = new Set(kept);
  return (
    <View style={[styles.nightBars, dense && styles.nightBarsDense, denser && styles.nightBarsDenser]}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.nightBar,
            dense && styles.nightBarDense,
            denser && styles.nightBarDenser,
            set.has(dayKey(addDays(parseDateKey(startKey), i))) ? styles.nightBarOn : styles.nightBarMissed,
          ]}
        />
      ))}
    </View>
  );
}

function shortDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;
}

function DoneChip({ label, icon = 'check_circle' }: { label: string; icon?: string }) {
  return (
    <View style={styles.doneChip} accessibilityRole="text" accessibilityLabel={label}>
      <Icon name={icon} size={20} color={colors.accent} />
      <Text style={styles.doneChipText} numberOfLines={1} maxFontSizeMultiplier={1.5}>{label}</Text>
    </View>
  );
}

const QUICK_ACCESS = [
  { label: 'Qibla', icon: 'qibla', go: 'Prayer', params: { tab: 'qibla' } },
  { label: 'Tasbih', icon: 'tasbih', go: 'Tasbih' },
  { label: '99 Names', icon: 'names', go: 'Names99' },
  { label: 'My Zikr', icon: 'zikr', go: 'Zikr' },
] as { label: string; icon: string; go: string; params?: { tab: string } }[];

const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Zuhr', 'Asr', 'Maghrib', 'Isha'];
function findTimingRow(tm: string, rows: PrayerRow[]): PrayerRow | null {
  const name = PRAYER_NAMES.find((n) => tm.includes(n));
  return name ? rows.find((r) => r.name === name) ?? null : null;
}

const TRAVEL_EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

function IconFlight({ catId, from, to, onDone }: { catId: string; from: IconRect; to: IconRect; onDone: () => void }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 420, easing: TRAVEL_EASE, useNativeDriver: true }).start(onDone);
  }, [t, onDone]);

  const scale = to.width / from.width;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: from.x,
        top: from.y,
        width: from.width,
        height: from.height,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, to.x - from.x] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, to.y - from.y] }) },
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, scale] }) },
        ],
      }}
    >
      <CategoryIcon catId={catId} size={from.width} />
    </Animated.View>
  );
}

export default function Home({ navigation }: any) {
  const { currentName, nextName, nextLabel, nextCountdown, placeLabel, rows, timezoneMismatch } = usePrayer();
  const { practice, startPractice, finishPracticeToday, setPracticeTally, authName, premium } = useAppState();
  const { width: winWidth } = useWindowDimensions();
  const reduced = useReduceMotion();
  const insets = useSafeAreaInsets();

  const today = new Date();
  const hijri = useHijriDate();

  const todayKey = dayKey(today);

  const [selectedNeedCatId, setSelectedNeedCatId] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    getSelectedNeedCat().then((id) => alive && setSelectedNeedCatId(id));
    return () => {
      alive = false;
    };
  }, []);

  const defaultSeedCat = CATS.find((c) => c.id === 'rizq')!;
  const seedCat = (selectedNeedCatId && CATS.find((c) => c.id === selectedNeedCatId)) || defaultSeedCat;
  const seedDua = seedCat.duas[0];
  const seedTarget = parseInt(seedDua.c, 10) || 1000;
  const seedNights = /\d/.test(seedDua.d) ? nightsFor(seedDua) : 7;

  const activeCat = (practice ? CATS.find((c) => c.id === practice.catId) : null) ?? seedCat;
  const activeDua = (practice ? activeCat.duas[practice.duaIdx] : null) ?? seedDua;
  const target = practice ? practice.target : seedTarget;
  const totalNights = practice ? practice.totalNights : seedNights;
  const night = practice ? nightForDate(practice.startedDateKey, practice.totalNights, today) : 0;
  const tally = practice && practice.tallyDateKey === todayKey ? practice.tally : 0;
  const endLabel = endDateLabel(practice ? practice.startedDateKey : todayKey, totalNights);
  const openEnded = !!practice && !/\d/.test(activeDua.d);
  const lastNightKey = practice ? dayKey(addDays(parseDateKey(practice.startedDateKey), practice.totalNights - 1)) : '';
  const runEnded = !!practice && !openEnded && todayKey > lastNightKey;
  const onceOnly = !!practice && /^once$/i.test(activeDua.d.trim());
  const onceDoneKey = onceOnly ? [...practice!.completedDates].sort().pop() ?? null : null;
  const stage: 'a' | 'b' | 'c' | 'open' | 'ended' = !practice
    ? 'a'
    : runEnded || onceDoneKey
      ? 'ended'
      : openEnded
        ? 'open'
        : night <= 1
          ? 'b'
          : 'c';
  const keptInRun = practice
    ? practice.completedDates.filter((d) => d >= practice.startedDateKey && d <= lastNightKey).length
    : 0;
  const segCount = practice ? Math.max(1, practice.segments ?? 1) : 1;
  const activeRuns = segCount > 1 ? runsFor(activeDua) : [];
  const segIdx = practice ? Math.min(segCount - 1, practice.segment ?? 0) : 0;
  const partLabel =
    segCount > 1 ? (activeRuns.length === segCount ? runLabel(activeRuns, segIdx) : `Part ${segIdx + 1} of ${segCount}`) : null;
  const doneToday = !!practice && practice.completedDates.includes(todayKey);
  const shownTally = doneToday ? Math.max(tally, target) : tally;
  const lastKept = practice ? lastKeptLabel(practice.completedDates, today) : '';

  const streakCurrent = practice ? currentStreakFromDates(practice.completedDates, today) : 0;

  const timingRow = findTimingRow(activeDua.tm, rows);
  const windowOpen = !!timingRow?.current;
  const windowLabel = windowOpensPhrase(activeDua.tm, timingRow?.time, windowOpen);
  const period: 'today' | 'tonight' = /maghrib|isha|ʿishā|sleep|night|tahajjud/i.test(activeDua.tm) ? 'tonight' : 'today';
  const unit = period === 'tonight' ? 'Night' : 'Day';
  const windowPassed = !!timingRow && !windowOpen && timingRow.time.getTime() <= today.getTime();
  const windowLocked =
    !!practice && !doneToday && !!timingRow && !windowOpen &&
    (!windowPassed || practice.startedDateKey === todayKey);
  const lockedLabel = windowPassed ? `Opens tomorrow ${afterPhraseOf(activeDua.tm)}` : `Opens ${windowLabel}`;
  const cleanTitle = activeDua.t.replace(/ in \d+ days?$/i, '');
  const afterPhrase = afterPhraseOf(activeDua.tm);
  const remaining = Math.max(0, target - tally);
  const countPhrase = activeDua.c.replace(/\d+/, (m) => Number(m).toLocaleString());
  const litNights = Math.max(1, night);

  const cardWidth = winWidth - 48;
  const [railIndex, setRailIndex] = useState(0);
  const onRailScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setRailIndex(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + 10)));

  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const goCounter = () => practice && navigation.navigate('BenefitCounter', { catId: practice.catId, duaIdx: practice.duaIdx });

  const onStart = () => {
    const seedRuns = runsFor(seedDua);
    startPractice(seedCat.id, 0, seedRuns.length ? seedRuns.map((r) => r.target) : seedTarget, seedNights);
  };
  const onFinished = () => finishPracticeToday();
  const onRestart = () =>
    practice &&
    startPractice(practice.catId, practice.duaIdx, practice.targets ?? practice.target, practice.totalNights, practice.segments ?? 1);
  const goTasbih = () =>
    navigation.navigate('Tasbih', {
      creditsPractice: !windowLocked,
      target: remaining > 0 && !doneToday ? remaining : target,
      ar: activeDua.n,
      name: activeDua.tr,
      period: stage === 'open' ? 'today' : period,
    });
  const onManualSubmit = () => {
    const n = parseInt(manualValue, 10);
    if (!Number.isNaN(n)) setPracticeTally(Math.max(0, Math.min(target, n)));
    setManualOpen(false);
    setManualValue('');
  };

  const manualFooter = (left: React.ReactNode) =>
    windowLocked ? (
      <View style={styles.nightsStrip}>{left}</View>
    ) : !manualOpen ? (
      <Pressable style={styles.nightsStrip} onPress={() => setManualOpen(true)}>
        {left}
        <Text style={styles.manualText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
          Counted fewer? <Text style={styles.manualLink}>Enter a number</Text>
        </Text>
      </Pressable>
    ) : (
      <View style={styles.manualEntry}>
        <TextInput
          value={manualValue}
          onChangeText={setManualValue}
          keyboardType="number-pad"
          placeholder={`0–${target}`}
          placeholderTextColor={v3.ink4}
          style={styles.manualInput}
          autoFocus
        />
        <Pressable style={({ pressed }) => [styles.manualSet, pressed && styles.pressed]} onPress={onManualSubmit}>
          <Text style={styles.manualSetText}>Set</Text>
        </Pressable>
      </View>
    );

  const arrival = useRef<PendingFlight | null | undefined>(undefined);
  if (arrival.current === undefined) arrival.current = reduced ? null : takePendingFlight();

  const slotRef = useRef<View | null>(null);
  const [flight, setFlight] = useState<{ catId: string; from: IconRect; to: IconRect } | null>(null);
  const [slotHidden, setSlotHidden] = useState(false);

  const entrance = useRef(new Animated.Value(arrival.current ? 0 : 1)).current;

  useEffect(() => {
    const pending = arrival.current;
    if (!pending) return;
    Animated.timing(entrance, {
      toValue: 1,
      duration: 420,
      easing: TRAVEL_EASE,
      useNativeDriver: true,
    }).start();
    const id = setTimeout(() => {
      slotRef.current?.measureInWindow((x, y, width, height) => {
        if (!width || !height) return;
        setSlotHidden(true);
        setFlight({ catId: pending.catId, from: pending.from, to: { x, y, width, height } });
      });
    }, 32);
    return () => clearTimeout(id);
  }, [entrance]);

  const inWindow = currentName != null;
  const prayerStripStrong = inWindow ? `${currentName} open` : `${nextName ?? ''} ${nextLabel ?? ''}`.trim();
  const prayerStripSoft = timezoneMismatch !== 0
    ? ' · check time zone'
    : inWindow
      ? ` · ${nextName ?? ''} ${nextLabel ?? ''}`.trimEnd()
      : nextCountdown
        ? ` · ${nextCountdown}`
        : '';

  const seededId = practice ? practice.catId : seedCat.id;
  const seededCat = CATS.find((c) => c.id === seededId) ?? seedCat;
  const gridCats = NEEDS_CATS.filter((c) => c.id !== seededId).slice(0, 3);

  const otherFree = (() => {
    for (const c of CATS) {
      if (c.id === activeCat.id) continue;
      const i = c.duas.findIndex((d) => d.free);
      if (i >= 0) return { cat: c, dua: c.duas[i], idx: i };
    }
    return null;
  })();
  const ownPlus = (() => {
    if (premium) return null;
    const i = activeCat.duas.findIndex((d) => !d.free);
    return i >= 0 ? { cat: activeCat, dua: activeCat.duas[i], idx: i } : null;
  })();
  const railCount = 1 + (otherFree ? 1 : 0) + (ownPlus ? 1 : 0);
  const lockedRail = ownPlus ? railCount - 1 : -1;
  const pickTitle = (t: string) => t.replace(/ in \d+ days?$/i, '');
  const pickLine = (d: { tr: string; c: string; tm: string; d: string }) =>
    [d.tr, d.c.replace(/\d+/, (m) => Number(m).toLocaleString()), d.tm, d.d]
      .filter((x) => x && !/^any time$/i.test(x))
      .join(' · ');

  const streakBars = Array.from({ length: practice ? totalNights : 0 }, (_, i) => {
    const key = dayKey(addDays(parseDateKey(practice!.startedDateKey), i));
    if (practice!.completedDates.includes(key)) return 'kept' as const;
    return key >= todayKey ? ('idle' as const) : ('missed' as const);
  });
  const lastPastNight = Math.min(totalNights, night) - 1;
  const streakDense = totalNights > 11;
  const streakDenser = totalNights > 21;

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.flex,
          {
            opacity: entrance,
            transform: [
              { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [reduced ? 0 : 14, 0] }) },
            ],
          },
        ]}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <ImageBackground source={HEADER_BG} style={styles.band} imageStyle={styles.bandImg} resizeMode="cover">
          <LinearGradient
            colors={['rgba(10,21,18,0.95)', 'rgba(10,21,18,0.72)', 'rgba(10,21,18,0.06)']}
            locations={[0, 0.44, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(10,21,18,0.50)', 'rgba(10,21,18,0.10)', 'rgba(10,21,18,0.58)', colors.bgRoot]}
            locations={[0, 0.28, 0.76, 1]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']}>
            <View style={styles.greetRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                  {authName ? `Assalamu alaykum, ${authName}` : 'Assalamu alaykum'}
                </Text>
                <Text style={styles.dateLine} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                  {[formatGregorian(today).split(',')[0], hijri.full, placeLabel].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('Profile')}
                style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
                accessibilityLabel="Your profile"
              >
                {authName ? (
                  <Text style={styles.avatarInitial}>{authName.slice(0, 1).toUpperCase()}</Text>
                ) : (
                  <Icon name="person" size={21} color={colors.textSecondary} />
                )}
              </Pressable>
            </View>

            <Pressable
              onPress={() => navigation.navigate('Prayer')}
              style={({ pressed }) => [styles.strip, inWindow && styles.stripOpen, pressed && styles.pressed]}
            >
              <Icon name="nights_stay" size={20} color={inWindow ? colors.accent : colors.gold} />
              <Text style={styles.stripText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                {prayerStripStrong}
                <Text style={styles.stripTextSoft}>{prayerStripSoft}</Text>
              </Text>
              <Icon name="chevron_right" size={20} color={v3.ink1} />
            </Pressable>
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.rail}>
          <ScrollView
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardWidth + 10}
            snapToAlignment="start"
            contentContainerStyle={styles.railContent}
            onMomentumScrollEnd={onRailScrollEnd}
          >
            <Animated.View style={[{ width: cardWidth }, styles.ownCard]}>
              {stage === 'a' && (
                <>
                  <Text style={styles.eyebrowMuted}>{`Free practice · ends ${endLabel}`}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{cleanTitle}</Text>
                  <Text style={styles.cardBody}>
                    {`${activeDua.tr} · ${countPhrase} ${afterPhrase}, ${totalNights} nights running.`}
                  </Text>
                  <View style={styles.ctaRow}>
                    <Cta tone="mint" variant="fill" icon="play_arrow" label="Start practice" onPress={onStart} />
                    <Cta
                      tone="mint"
                      variant="outline"
                      label="Change" a11yLabel="Choose another practice"
                      onPress={() => navigation.navigate('NeedsPicker')}
                    />
                  </View>
                  <View style={styles.nightsStrip}>
                    <NightBars total={totalNights} lit={litNights} />
                    <Text style={styles.nightsText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                      {windowOpen ? 'First window is open now' : `First window ${windowLabel}`}
                    </Text>
                  </View>
                </>
              )}

              {stage === 'open' && (
                <>
                  <Text style={styles.eyebrowLive}>{`${activeDua.d} · ${activeDua.tm}`}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{cleanTitle}</Text>
                  <Text style={styles.cardBody}>{`${activeDua.tr} · ${target.toLocaleString()} each time`}</Text>

                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.min(100, (shownTally / target) * 100)}%` }]} />
                    </View>
                    <Text style={[styles.progressLabel, shownTally > 0 && styles.progressLabelOn]}>
                      {`${shownTally.toLocaleString()} of ${target.toLocaleString()}`}
                    </Text>
                  </View>

                  <View style={styles.ctaRow}>
                    {doneToday ? (
                      <DoneChip label="Done for today" />
                    ) : (
                      <Cta tone="mint" variant="fill" icon="check_circle" label="Mark done" a11yLabel="Mark today done" onPress={onFinished} />
                    )}
                    <Cta tone="mint" variant="outline" accented={!doneToday} label="Tasbih" a11yLabel="Open tasbih" onPress={goTasbih} />
                  </View>

                  {manualFooter(
                    <Text style={styles.keptText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                      {lastKept}
                    </Text>,
                  )}
                </>
              )}

              {stage === 'ended' && (
                <>
                  <Text style={styles.eyebrowMuted}>
                    {onceDoneKey
                      ? `Completed · ${onceDoneKey === todayKey ? 'today' : shortDate(onceDoneKey)}`
                      : `Completed · ended ${endLabel}`}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{cleanTitle}</Text>
                  <Text style={styles.cardBody}>
                    {onceDoneKey
                      ? `${activeDua.tr} · ${target.toLocaleString()} times, once`
                      : `${activeDua.tr} · ${totalNights} night${totalNights === 1 ? '' : 's'} of ${target.toLocaleString()}`}
                  </Text>

                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          styles.progressFillGold,
                          { width: `${onceDoneKey ? 100 : Math.min(100, (keptInRun / totalNights) * 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressLabel, styles.progressLabelGold]}>
                      {onceDoneKey ? `${target.toLocaleString()} of ${target.toLocaleString()}` : `${keptInRun} of ${totalNights} kept`}
                    </Text>
                  </View>

                  <View style={styles.ctaRow}>
                    <Cta
                      tone="mint"
                      variant="fill"
                      icon="replay"
                      label={onceDoneKey ? 'Do it again' : 'Start again'}
                      a11yLabel={onceDoneKey ? 'Do this practice again' : 'Start this practice again'}
                      onPress={onRestart}
                    />
                    <Cta tone="mint" variant="outline" label="Choose another" a11yLabel="Choose another benefit" onPress={() => navigation.navigate('Library')} />
                  </View>

                  {onceDoneKey ? (
                    <View style={styles.nightsStrip}>
                      <View style={styles.nightBars}>
                        <View style={[styles.nightBar, styles.nightBarOn]} />
                      </View>
                      <Text style={styles.manualText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                        Nothing more to keep
                      </Text>
                    </View>
                  ) : practice && (
                    <View style={styles.nightsStrip}>
                      <RunBars startKey={practice.startedDateKey} total={totalNights} kept={practice.completedDates} />
                      <Text style={styles.manualText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                        {keptInRun === totalNights ? 'None missed' : `${totalNights - keptInRun} missed`}
                      </Text>
                    </View>
                  )}
                </>
              )}

              {stage === 'b' && (
                <>
                  <Text style={styles.eyebrowLive}>
                    {`${unit} ${Math.max(1, night)} of ${totalNights} · ${
                      doneToday ? 'done' : partLabel ?? (windowOpen ? 'window open' : windowLocked ? lockedLabel.toLowerCase() : `opens ${windowLabel}`)
                    }`}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{cleanTitle}</Text>
                  <Text style={styles.cardBody}>{`${activeDua.tr} · ${target.toLocaleString()} ${segCount > 1 ? 'at each corner' : period} · ends ${endLabel}`}</Text>

                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.min(100, (shownTally / target) * 100)}%` }]} />
                    </View>
                    <Text style={[styles.progressLabel, shownTally > 0 && styles.progressLabelOn]}>
                      {`${shownTally.toLocaleString()} of ${target.toLocaleString()}`}
                    </Text>
                  </View>

                  <View style={styles.ctaRow}>
                    {doneToday ? (
                      <DoneChip label={`Done for ${period}`} />
                    ) : windowLocked ? (
                      <DoneChip icon="schedule" label={lockedLabel} />
                    ) : (
                      <Cta tone="mint" variant="fill" icon="check_circle" label="Mark done" a11yLabel={`Mark ${period} done`} onPress={onFinished} />
                    )}
                    <Cta tone="mint" variant="outline" accented={!doneToday} label="Tasbih" a11yLabel="Open tasbih" onPress={goTasbih} />
                  </View>

                  {manualFooter(<NightBars total={totalNights} lit={litNights} />)}
                </>
              )}

              {stage === 'c' && (
                <>
                  <Text style={styles.eyebrowMuted}>{`${unit} ${night} of ${totalNights} · ${partLabel && !doneToday ? partLabel : `ends ${endLabel}`}`}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{cleanTitle}</Text>
                  <Text style={styles.cardBody}>
                    {doneToday
                      ? `${activeDua.tr} · ${period}'s ${target.toLocaleString()} done`
                      : `${activeDua.tr} · ${remaining.toLocaleString()} left of ${segCount > 1 ? 'this corner' : period}'s ${target.toLocaleString()}`}
                  </Text>

                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.min(100, (shownTally / target) * 100)}%` }]} />
                    </View>
                    <Text style={[styles.progressLabel, shownTally > 0 && styles.progressLabelOn]}>
                      {`${shownTally.toLocaleString()} of ${target.toLocaleString()}`}
                    </Text>
                  </View>

                  <View style={styles.ctaRow}>
                    {doneToday ? (
                      <DoneChip label={`Done for ${period}`} />
                    ) : windowLocked ? (
                      <DoneChip icon="schedule" label={lockedLabel} />
                    ) : (
                      <Cta tone="mint" variant="fill" icon="play_arrow" label="Continue" a11yLabel="Continue counting" onPress={goCounter} />
                    )}
                    <Cta tone="mint" variant="outline" label="Tasbih" a11yLabel="Open tasbih" onPress={goTasbih} />
                  </View>

                  <View style={styles.streakRow}>
                    <View style={[styles.streakBars, streakDense && styles.nightBarsDense, streakDenser && styles.nightBarsDenser]}>
                      {streakBars.map((state, i) => (
                        <View
                          key={i}
                          style={[
                            styles.streakBar,
                            streakDense && styles.nightBarDense,
                            streakDenser && styles.nightBarDenser,
                            state === 'missed' && styles.streakBarMissed,
                            state === 'idle' && styles.streakBarIdle,
                            state === 'kept' && i >= lastPastNight - 1 && styles.streakBarRecent,
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.streakText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                      {`${streakCurrent} day${streakCurrent === 1 ? '' : 's'} unbroken`}
                    </Text>
                  </View>
                </>
              )}
            </Animated.View>

            {otherFree && (
              <View style={[{ width: cardWidth }, styles.socialCard]}>
                <View style={styles.socialHead}>
                  <Text style={styles.eyebrowOlive}>Also free</Text>
                  <Text style={styles.socialPlan}>Free</Text>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{pickTitle(otherFree.dua.t)}</Text>
                <Text style={styles.socialBody} numberOfLines={2}>{pickLine(otherFree.dua)}</Text>

                <View style={styles.ctaRow}>
                  <Cta
                    tone="olive"
                    variant="fill"
                    icon="menu_book"
                    label="Read" a11yLabel={`Read ${otherFree.dua.t}`}
                    onPress={() => navigation.navigate('Benefit', { catId: otherFree.cat.id, duaIdx: otherFree.idx })}
                  />
                  <Cta tone="olive" variant="outline" label="Change" a11yLabel="Choose another need" onPress={() => navigation.navigate('NeedsPicker')} />
                </View>

                <View style={styles.socialStrip}>
                  <Text style={styles.socialStripText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>{otherFree.cat.title}</Text>
                </View>
              </View>
            )}

            {ownPlus && (
              <View style={[{ width: cardWidth }, styles.lockedCard]}>
                <View style={styles.lockedHead}>
                  <View style={styles.lockChip}>
                    <Icon name="lock" size={18} color={colors.gold} />
                    <Text style={styles.lockChipText}>In Plus</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{pickTitle(ownPlus.dua.t)}</Text>
                <Text style={styles.lockedBody} numberOfLines={2}>{pickLine(ownPlus.dua)}</Text>
                <View style={styles.ctaRow}>
                  <Cta
                    tone="gold"
                    variant="fill"
                    icon="lock_open"
                    label="See Plus"
                    onPress={() => navigation.navigate('Plus', { benefitTitle: ownPlus.dua.t, categoryLabel: ownPlus.cat.title })}
                  />
                </View>
                <View style={styles.lockedStrip}>
                  <Text style={styles.lockedStripText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                    {`${ownPlus.cat.total - ownPlus.cat.duas.filter((d) => d.free).length} more in ${ownPlus.cat.title}`}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.railFooter}>
            {Array.from({ length: railCount }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === railIndex && styles.dotOn,
                  i === railIndex && i === lockedRail && styles.dotOnGold,
                ]}
              />
            ))}
            <View style={{ flex: 1 }} />
            {railCount > 1 && (
              <Text style={styles.railHint}>
                {railIndex === railCount - 1 ? 'Swipe back to your count' : 'Swipe for more practices'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>Quick access</Text>
            <View style={styles.quickRow}>
              {QUICK_ACCESS.map((q) => (
                <Pressable
                  key={q.label}
                  style={({ pressed }) => [styles.quickTile, pressed && styles.pressed]}
                  onPress={() => navigation.navigate(q.go, q.params && { ...q.params, at: Date.now() })}
                >
                  <QuickIcon name={q.icon} size={38} />
                  <Text style={styles.quickLabel} numberOfLines={2} maxFontSizeMultiplier={CLAMP}>{q.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>What do you need?</Text>
              <Pressable style={styles.linkRow} onPress={() => navigation.navigate('Library')}>
                <Text style={styles.linkText}>All 10</Text>
                <Icon name="chevron_right" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.seededRow, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Category', { catId: seededCat.id })}
            >
              <View ref={slotRef} collapsable={false} style={styles.seededSlot}>
                {!slotHidden && <CategoryIcon catId={seededCat.id} size={44} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.seededTitle}>{avoidOrphan(seededCat.title)}</Text>
                <Text style={styles.seededMeta}>
                  {`${seededCat.total} entries · `}
                  <Text style={styles.seededWhy}>what you asked for</Text>
                </Text>
              </View>
              <Icon name="chevron_right" size={20} color={v3.ink4} />
            </Pressable>

            <View style={styles.grid}>
              {gridCats.map((c) => (
                <Pressable
                  key={c.id}
                  style={({ pressed }) => [styles.gridTile, pressed && styles.pressed]}
                  onPress={() => navigation.navigate('Category', { catId: c.id })}
                >
                  <CategoryIcon catId={c.id} size={34} />
                  <View>
                    <Text style={styles.gridTitle} numberOfLines={2} maxFontSizeMultiplier={CLAMP}>{avoidOrphan(c.title)}</Text>
                    <Text style={styles.gridMeta}>{`${c.total} entries`}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

        </View>
        </ScrollView>

        <LinearGradient
          pointerEvents="none"
          colors={[colors.bgRoot, colors.bgRoot, 'rgba(10,21,18,0.72)', 'rgba(10,21,18,0)']}
          locations={[0, 0.52, 0.78, 1]}
          style={[styles.topScrim, { height: insets.top + 18 }]}
        />

        <BottomNav active="Home" />
      </Animated.View>

      {flight && (
        <IconFlight
          catId={flight.catId}
          from={flight.from}
          to={flight.to}
          onDone={() => {
            setSlotHidden(false);
            setFlight(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  flex: { flex: 1 },

  band: { paddingBottom: 28 },
  bandImg: { opacity: 0.95 },
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  greeting: { fontFamily: fonts.semibold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textSecondary },
  dateLine: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.ink2, marginTop: 3, ...tabular },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: v3.avatarFill, borderWidth: 1, borderColor: v3.avatarBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textSecondary },

  strip: {
    marginHorizontal: 20, paddingVertical: 12, paddingHorizontal: 15,
    backgroundColor: v3.glassFill, borderWidth: 1, borderColor: v3.glassBorder, borderRadius: 15,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  stripOpen: { backgroundColor: v3.accentWell, borderColor: v3.accentWellBorder },
  stripText: { flex: 1, fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary, ...tabular },
  stripTextSoft: { fontFamily: fonts.medium, color: v3.ink1 },

  rail: { marginTop: -24, zIndex: 1 },
  railContent: { paddingLeft: 20, paddingRight: 20, gap: 10, alignItems: 'stretch', minHeight: 236 },
  ownCard: {
    padding: 15, paddingBottom: 14, gap: 7,
    backgroundColor: v3.surfaceHero, borderWidth: 1, borderColor: v3.heroBorder, borderRadius: 24,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.5, shadowRadius: 34, elevation: 14,
  },
  socialCard: {
    padding: 15, paddingBottom: 14, gap: 7,
    backgroundColor: v3.oliveCard, borderWidth: 1, borderColor: v3.oliveBorder, borderRadius: 24,
  },
  socialHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  socialPlan: { fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.oliveMeta },
  socialBody: { fontFamily: fonts.medium, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: v3.oliveBody },
  socialStrip: {
    paddingTop: 11, borderTopWidth: 1, borderTopColor: v3.oliveDivider,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  socialStripText: { flex: 1, textAlign: 'right', fontFamily: fonts.bold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.oliveAccent, ...tabular },

  eyebrowMuted: eyebrow(v3.ink3),
  eyebrowLive: eyebrow(colors.accent),
  eyebrowOlive: eyebrow(v3.oliveAccent),
  cardTitle: { ...serifHeading(SIZE.cardTitle, fonts.serifMedium), color: colors.textPrimary },
  cardBody: { fontFamily: fonts.medium, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: v3.ink1 },

  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 6 },
  progressTrack: { flex: 1, height: 6, borderRadius: 99, backgroundColor: v3.track, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.accent },
  progressLabel: { fontFamily: fonts.bold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.ink2, ...tabular },
  progressLabelOn: { color: colors.accent },
  progressFillGold: { backgroundColor: colors.gold },
  progressLabelGold: { color: colors.gold },

  ctaRow: { flexDirection: 'row', gap: 8, marginTop: 'auto' },

  doneChip: {
    flex: 1, height: 44, borderRadius: 99, borderWidth: 1, borderColor: v3.heroBorder,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  doneChipText: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.accent },
  keptText: { fontFamily: fonts.bold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.gold, ...tabular },
  manualText: { flex: 1, textAlign: 'right', fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.ink2 },
  manualLink: { color: colors.textSecondary },
  manualEntry: { marginTop: 6, paddingTop: 11, borderTopWidth: 1, borderTopColor: v3.heroDivider, flexDirection: 'row', gap: 8 },
  manualInput: {
    flex: 1, minHeight: 44, borderRadius: 14, paddingHorizontal: 14,
    backgroundColor: v3.surfaceInset, borderWidth: 1, borderColor: v3.hairline,
    fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary, ...tabular,
  },
  manualSet: {
    minHeight: 48, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  manualSetText: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.onMintText },

  nightsStrip: {
    paddingTop: 11, borderTopWidth: 1, borderTopColor: v3.heroDivider,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  nightBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 22 },
  nightBar: { width: 6, height: 18, borderRadius: 3, backgroundColor: v3.dotIdle },
  nightBarsDense: { gap: 2 },
  nightBarDense: { width: 3, borderRadius: 1.5 },
  nightBarsDenser: { gap: 1 },
  nightBarDenser: { width: 1.5, borderRadius: 0.75 },
  nightBarOn: { backgroundColor: colors.gold },
  nightBarMissed: { backgroundColor: v3.streakBarMissed },
  nightsText: { flex: 1, textAlign: 'right', fontFamily: fonts.bold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.gold, ...tabular },
  nightsTextSoft: { fontFamily: fonts.medium, color: v3.ink2 },

  streakRow: {
    paddingTop: 14, borderTopWidth: 1, borderTopColor: v3.heroDivider,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  streakBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 22 },
  streakBar: { width: 6, height: 18, borderRadius: 3, backgroundColor: v3.streakBar },
  streakBarRecent: { backgroundColor: colors.accent },
  streakBarMissed: { backgroundColor: v3.streakBarMissed },
  streakBarIdle: { height: 6, backgroundColor: v3.dotIdle },
  streakText: { flex: 1, textAlign: 'right', fontFamily: fonts.bold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: colors.gold, ...tabular },

  lockedCard: {
    padding: 15, paddingBottom: 14, gap: 7,
    backgroundColor: v3.goldCard, borderWidth: 1, borderColor: v3.goldCardBorder, borderRadius: 24,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.5, shadowRadius: 34, elevation: 14,
  },
  lockedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  lockChip: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  lockChipText: eyebrow(colors.gold),
  lockedBody: { fontFamily: fonts.medium, fontSize: SIZE.body, lineHeight: bodyLeading(SIZE.body), color: v3.goldBody },
  lockedStrip: {
    paddingTop: 14, borderTopWidth: 1, borderTopColor: v3.goldDivider,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  lockedStripText: { flex: 1, textAlign: 'right', fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.goldWellInk, ...tabular },

  railFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: v3.dotIdle },
  dotOn: { width: 18, backgroundColor: colors.accent },
  dotOnGold: { backgroundColor: colors.gold },
  railHint: { fontFamily: fonts.semibold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.ink3 },

  scroll: { paddingBottom: 36 },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0 },
  body: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  section: { gap: 10 },
  sectionEyebrow: eyebrow(v3.ink3),
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { ...serifHeading(SIZE.heading), color: colors.textPrimary },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  linkText: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textSecondary },

  quickRow: { flexDirection: 'row', gap: 8 },
  quickTile: {
    flex: 1, minHeight: 78, paddingVertical: 12, paddingHorizontal: 10,
    backgroundColor: v3.surfaceRow, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 9,
  },
  quickLabel: { fontFamily: fonts.bold, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), minHeight: 32, color: colors.textPrimary, textAlign: 'center' },

  seededRow: {
    padding: 15, minHeight: 82, borderRadius: 20, backgroundColor: v3.surfaceRaisedRow,
    borderWidth: 1, borderColor: v3.borderStrong,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.34, shadowRadius: 20, elevation: 8,
  },
  seededSlot: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  seededTitle: { fontFamily: fonts.bold, fontSize: SIZE.title, lineHeight: uiLeading(SIZE.title), color: colors.textPrimary },
  seededMeta: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.ink2, marginTop: 2 },
  seededWhy: { fontFamily: fonts.semibold, color: colors.accent },

  grid: { flexDirection: 'row', gap: 8 },
  gridTile: {
    flex: 1, minHeight: 112, padding: 13, borderRadius: 16, backgroundColor: v3.surfaceRow,
    justifyContent: 'space-between', gap: 8,
  },
  gridTitle: { fontFamily: fonts.bold, fontSize: SIZE.body, lineHeight: uiLeading(SIZE.body), color: colors.textPrimary },
  gridMeta: { fontFamily: fonts.regular, fontSize: SIZE.meta, lineHeight: uiLeading(SIZE.meta), color: v3.ink2, marginTop: 2 },

  pressed: { opacity: 0.9 },
});
