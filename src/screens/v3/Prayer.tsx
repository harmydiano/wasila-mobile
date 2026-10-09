import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNav from '../../components/BottomNav';
import Icon from '../../components/Icon';
import QiblaDial from '../../components/v3/QiblaDial';
import {
  fonts,
  serifHeading,
  eyebrow,
  tabular,
  SIZE,
  CLAMP,
  uiLeading,
  pinLeading,
  bodyLeading,
} from '../../theme/type';
import { colors, v3, prayer as P } from '../../theme/v3/colors';
import { useAppState } from '../../state/AppState';
import { usePrayer, type PrayerRow } from '../../state/usePrayer';
import { useHeading } from '../../state/useHeading';
import {
  needleRotation,
  isAligned,
  accuracyPill,
  normalizeDeg,
  angleDelta,
} from '../../utils/compass';
import { formatDuration } from '../../utils/prayerTime';
import { useHijriDate } from '../../state/useHijriDate';
import {
  currentStreak,
  weekStrip,
  monthGrid,
  monthPercent,
  loggedOn,
  DAILY_PRAYERS,
  type PrayerName,
} from '../../utils/prayerLog';

type Tab = 'times' | 'qibla' | 'tracker';

const TABS: { key: Tab; label: string }[] = [
  { key: 'times', label: 'Times' },
  { key: 'qibla', label: 'Qibla' },
  { key: 'tracker', label: 'Tracker' },
];

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_GAP = 6;

const isPrayer = (r: PrayerRow) => r.key !== 'Sunrise';

function AdhanSwitch({ on, tone }: { on: boolean; tone: 'mint' | 'gold' }) {
  return (
    <View style={[styles.track, on && (tone === 'gold' ? styles.trackOnNext : styles.trackOn)]}>
      <View
        style={[
          styles.knob,
          on && styles.knobOn,
          on && tone === 'gold' && styles.knobOnNext,
        ]}
      />
    </View>
  );
}

export default function Prayer({ navigation, route }: any) {
  const askedTab: Tab | undefined = route?.params?.tab;
  const [tab, setTab] = useState<Tab>(askedTab ?? 'times');
  useEffect(() => {
    if (askedTab) setTab(askedTab);
  }, [askedTab, route?.params?.at]);
  const [gridWidth, setGridWidth] = useState(0);

  const {
    prayerLog,
    toggleLog,
    isPrayerLogged,
    adhanEnabled,
    setAdhanEnabled,
    adhanPrayers,
    toggleAdhanPrayer,
  } = useAppState();
  const {
    rows,
    city,
    locationLong,
    calculationMethod,
    asrLabel,
    qiblaDeg,
    qiblaLabel,
    timezoneMismatch,
    usingFallback,
    permissionDenied,
    refresh,
    currentName,
    currentLabel,
    currentProgress,
  } = usePrayer();

  const logRows = useMemo(() => rows.filter(isPrayer), [rows]);
  const nextRow = rows.find((r) => r.next) ?? null;
  const currentRow = rows.find((r) => r.current) ?? null;

  const { heading, accuracy, available: compassAvailable } = useHeading(tab === 'qibla');
  const live = compassAvailable && heading != null && qiblaDeg != null;
  const dialRotation = live ? -normalizeDeg(heading!) : 0;
  const needleDeg = live ? needleRotation(qiblaDeg!, heading!) : qiblaDeg ?? 0;
  const aligned = live && isAligned(qiblaDeg!, heading!);
  const pill = accuracyPill(compassAvailable, heading != null, accuracy);
  const turn = live ? angleDelta(heading!, qiblaDeg!) : null;

  const today = new Date();
  const hijri = useHijriDate();

  const now = Date.now();
  const loggedToday = loggedOn(prayerLog, today).length;
  const streak = currentStreak(prayerLog, today);
  const week = weekStrip(prayerLog, today);
  const monthDays = monthGrid(prayerLog, today);
  const monthLeadingBlanks = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const percent = monthPercent(prayerLog, today);
  const cellSize = gridWidth > 0 ? Math.floor((gridWidth - MONTH_GAP * 6) / 7) : 0;

  const untilNext = nextRow ? formatDuration(Math.max(0, nextRow.time.getTime() - now)) : null;
  const currentDone = currentRow ? isPrayerLogged(currentRow.name) : false;

  const header = (
    <View style={styles.header}>
      <View style={styles.headRow}>
        <View style={styles.headText}>
          <Text style={styles.title}>Prayer</Text>
          <View style={styles.locRow}>
            <Icon name="location_on" size={15} color={colors.accent} />
            <Text style={styles.locText} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
              {locationLong}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prayer settings"
          style={({ pressed }) => [styles.headBtn, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="tune" size={19} color={v3.ink4} />
        </Pressable>
      </View>

      <View style={styles.segmented}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [styles.segment, on && styles.segmentOn, pressed && styles.pressed]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.segmentText, on && styles.segmentTextOn]} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const times = (
    <>
      {usingFallback && (
        <Pressable
          style={styles.tzWarn}
          onPress={() => (permissionDenied ? Linking.openSettings() : refresh(true))}
          accessibilityRole="button"
          accessibilityLabel={permissionDenied ? 'Open settings to allow location' : 'Use my location'}
        >
          <Icon name="location_on" size={18} color={colors.gold} />
          <Text style={styles.tzWarnText}>
            {`Showing times for ${locationLong}. `}
            <Text style={styles.tzWarnLink}>{permissionDenied ? 'Allow location in Settings' : 'Use my location'}</Text>
          </Text>
        </Pressable>
      )}

      {timezoneMismatch !== 0 && (
        <View style={styles.tzWarn}>
          <Icon name="schedule" size={18} color={colors.gold} />
          <Text style={styles.tzWarnText}>
            These times are shown in your phone's timezone, which is about {Math.abs(timezoneMismatch)} hours off from{' '}
            {locationLong}. Check your device date and time settings.
          </Text>
        </View>
      )}

      <View style={[styles.hero, !currentRow && styles.heroWaiting]}>
        <View style={styles.heroEyebrowRow}>
          {currentRow ? <View style={styles.liveDot} /> : null}
          <Text style={[styles.heroEyebrow, !currentRow && styles.heroEyebrowNext]} numberOfLines={1}>
            {currentRow ? `${currentName} · window open` : `${nextRow?.name ?? 'Fajr'} · next`}
          </Text>
        </View>

        <Text style={styles.heroTitle}>
          {currentRow ? `${untilNext ?? '—'} left` : untilNext ? `in ${untilNext}` : '—'}
        </Text>

        {nextRow && (
          <Text style={styles.heroSub} maxFontSizeMultiplier={CLAMP}>
            {nextRow.key === 'Sunrise' ? 'Sunrise closes this window at ' : `${nextRow.name} begins at `}
            <Text style={styles.heroSubTime}>{nextRow.label}</Text>
          </Text>
        )}

        {currentRow && currentProgress != null && (
          <>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(currentProgress * 100) }}
              style={styles.heroTrack}
            >
              <View style={[styles.heroFill, { width: `${Math.round(currentProgress * 100)}%` }]} />
            </View>
            <View style={styles.heroEnds}>
              <Text style={styles.heroEnd}>{currentLabel}</Text>
              <Text style={styles.heroEnd}>{nextRow?.label}</Text>
            </View>
          </>
        )}

        <View style={styles.heroActions}>
          {currentRow && (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ checked: currentDone }}
              style={({ pressed }) => [
                styles.heroCta,
                currentDone && styles.heroCtaDone,
                pressed && styles.pressed,
              ]}
              onPress={() => toggleLog(currentRow.name)}
            >
              <Icon name="check" size={19} color={currentDone ? colors.accent : colors.onMintText} />
              <Text
                style={[styles.heroCtaText, currentDone && styles.heroCtaTextDone]}
                numberOfLines={1}
                maxFontSizeMultiplier={CLAMP}
              >
                {currentDone ? `${currentRow.name} logged` : `I have prayed ${currentRow.name}`}
              </Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open the qibla compass"
            style={({ pressed }) => [
              styles.heroGhost,
              !currentRow && styles.heroGhostWide,
              pressed && styles.pressed,
            ]}
            onPress={() => setTab('qibla')}
          >
            <Icon name="explore" size={19} color={colors.accent} />
            <Text style={styles.heroGhostText} maxFontSizeMultiplier={CLAMP}>
              Qibla
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.dayCard}>
        <View style={styles.dayHead}>
          <Text style={styles.eyebrow} numberOfLines={1}>
            Today · {hijri.dayMonth}
          </Text>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="Adhan notifications"
            accessibilityState={{ checked: adhanEnabled }}
            hitSlop={10}
            onPress={() => setAdhanEnabled(!adhanEnabled)}
          >
            <Text style={[styles.adhanHead, !adhanEnabled && styles.adhanHeadOff]} maxFontSizeMultiplier={CLAMP}>
              {adhanEnabled ? 'Adhan' : 'Turn on adhan'}
            </Text>
          </Pressable>
        </View>

        {rows.map((r) => {
          const marker = !isPrayer(r);
          const done = !marker && isPrayerLogged(r.name);
          const on = adhanPrayers[r.name as PrayerName] !== false;

          if (marker) {
            return (
              <View key={r.key} style={styles.markerRow}>
                <Icon name={r.icon} size={15} color={P.ink5} />
                <Text style={styles.markerText} numberOfLines={1}>
                  Sunrise · Fajr window closes
                </Text>
                <Text style={styles.markerTime} maxFontSizeMultiplier={CLAMP}>
                  {r.label}
                </Text>
                <View style={styles.switchSlot} />
              </View>
            );
          }

          return (
            <View
              key={r.key}
              style={[
                styles.prayerRow,
                r.current && styles.prayerRowNow,
                r.next && styles.prayerRowNext,
                r.past && styles.prayerRowPast,
              ]}
            >
              <Icon
                name={r.icon}
                size={19}
                color={r.next ? colors.gold : r.current ? colors.accent : colors.textMuted}
              />
              <Text
                style={[styles.prayerName, r.current && styles.prayerNameNow, r.next && styles.prayerNameNext]}
                numberOfLines={1}
              >
                {r.name}
              </Text>
              {done && <Icon name="task_alt" size={16} color={colors.accent} />}
              {r.current && (
                <Text style={styles.rowNote} maxFontSizeMultiplier={CLAMP}>
                  now
                </Text>
              )}
              {r.next && r.note && (
                <Text style={styles.rowNoteNext} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                  {r.note}
                </Text>
              )}
              <Text
                style={[styles.prayerTime, r.next && styles.prayerTimeNext]}
                maxFontSizeMultiplier={CLAMP}
              >
                {r.label}
              </Text>

              <Pressable
                accessibilityRole="switch"
                accessibilityLabel={`Adhan for ${r.name}`}
                accessibilityState={{ checked: on && adhanEnabled, disabled: !adhanEnabled }}
                hitSlop={{ top: 12, bottom: 12, left: 10, right: 12 }}
                style={[styles.switchSlot, !adhanEnabled && styles.switchSlotOff]}
                onPress={() => {
                  if (!adhanEnabled) {
                    setAdhanEnabled(true);
                    if (!on) toggleAdhanPrayer(r.name as PrayerName);
                  } else toggleAdhanPrayer(r.name as PrayerName);
                }}
              >
                <AdhanSwitch on={on && adhanEnabled} tone={r.next ? 'gold' : 'mint'} />
              </Pressable>

              {r.current && currentProgress != null && (
                <View style={styles.rowTrack}>
                  <View style={[styles.rowFill, { width: `${Math.round(currentProgress * 100)}%` }]} />
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.linkCard, pressed && styles.pressed]}
        onPress={() => setTab('qibla')}
      >
        <Icon name="explore" size={22} color={colors.accent} />
        <View style={styles.linkBody}>
          <Text style={styles.linkTitle} numberOfLines={1}>
            Qibla · {qiblaDeg != null ? `${Math.round(qiblaDeg)}° from north` : 'bearing unavailable'}
          </Text>
          <Text style={styles.linkMeta} numberOfLines={1}>
            {compassAvailable ? 'Compass ready' : 'No compass on this device'}
            {qiblaLabel ? ` · ${qiblaLabel}` : ''}
          </Text>
        </View>
        <Icon name="chevron_right" size={20} color={P.ink5} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.noteCard, pressed && styles.pressed]}
        onPress={() => navigation.navigate('PrayerMethod')}
      >
        <Icon name="schedule" size={19} color={colors.gold} />
        <Text style={styles.noteText}>
          Times follow your device clock. {calculationMethod}, {asrLabel}. <Text style={styles.noteLink}>Change method</Text>
        </Text>
      </Pressable>
    </>
  );

  const qiblaTab = (
    <>
      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <Icon name="location_on" size={14} color={colors.accent} />
          <Text style={styles.pillText} maxFontSizeMultiplier={CLAMP}>
            {city}
          </Text>
        </View>
        <View style={[styles.pill, pill.warn && styles.pillWarn]}>
          <Text style={[styles.pillText, pill.warn && styles.pillTextWarn]} maxFontSizeMultiplier={CLAMP}>
            {pill.label}
          </Text>
        </View>
        {qiblaDeg != null && (
          <View style={styles.pill}>
            <Text style={styles.pillText} maxFontSizeMultiplier={CLAMP}>
              {Math.round(qiblaDeg)}°
            </Text>
          </View>
        )}
      </View>

      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={
          qiblaDeg == null
            ? 'Qibla compass, bearing unavailable'
            : aligned
              ? 'Facing the qibla'
              : `Qibla compass. The qibla is ${Math.round(qiblaDeg)} degrees from north${
                  turn == null ? '' : `, turn ${Math.abs(Math.round(turn))} degrees to your ${turn > 0 ? 'right' : 'left'}`
                }`
        }
        style={styles.dialWrap}
      >
        <QiblaDial dialRotation={dialRotation} needleDeg={needleDeg} aligned={aligned} size={300} />
      </View>

      <View style={styles.guide}>
        {live && (
          <View style={[styles.guidePill, aligned && styles.guidePillOn]}>
            <Icon
              name={aligned ? 'check_circle' : turn! < 0 ? 'rotate_left' : 'rotate_right'}
              size={18}
              color={colors.accent}
            />
            <Text style={styles.guideText} maxFontSizeMultiplier={CLAMP}>
              {aligned ? 'Facing the qibla' : `Turn to your ${turn! > 0 ? 'right' : 'left'}`}
            </Text>
          </View>
        )}
        <Text style={styles.guideCaption}>
          {live
            ? 'Hold the phone flat and turn until the needle meets the top marker. Move away from metal for a steadier reading.'
            : `The qibla is ${qiblaLabel ?? '—'} from true north. ${
                compassAvailable
                  ? 'The needle will follow once the compass reports a heading.'
                  : 'This device has no compass, so the dial is a fixed diagram.'
              }`}
        </Text>
      </View>

      {nextRow && (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.linkCard, pressed && styles.pressed]}
          onPress={() => setTab('times')}
        >
          <Icon name={nextRow.icon} size={21} color={colors.gold} />
          <Text style={styles.linkTitle} numberOfLines={1}>
            {nextRow.name} {nextRow.note ?? ''}
            <Text style={styles.linkInline}> · {nextRow.label}</Text>
          </Text>
          <Icon name="chevron_right" size={20} color={P.ink5} />
        </Pressable>
      )}
    </>
  );

  const tracker = (
    <>
      <LinearGradient
        colors={[P.streakGradFrom, P.streakGradTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.streakCard}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Icon name="local_fire_department" size={17} color={colors.gold} />
            <View style={styles.statSlot}>
              {streak > 0 ? (
                <Text style={styles.statValue}>
                  {streak} {streak === 1 ? 'day' : 'days'}
                </Text>
              ) : (
                <Text style={styles.statNudge}>Log all five to start a streak</Text>
              )}
            </View>
            <Text style={styles.statLabel}>current streak</Text>
          </View>
          <View style={styles.statCell}>
            <Icon name="event_available" size={17} color={colors.accent} />
            <View style={styles.statSlot}>
              <Text style={styles.statValue}>{percent}%</Text>
            </View>
            <Text style={styles.statLabel}>this month</Text>
          </View>
        </View>

        <View style={styles.weekRow}>
          {week.map((d) => (
            <View key={d.date.toISOString()} style={styles.weekCell}>
              <View
                style={[
                  styles.ring,
                  d.count >= d.total ? styles.ringFull : d.count > 0 ? styles.ringPartial : styles.ringEmpty,
                  d.isToday && styles.ringToday,
                ]}
              >
                <Text style={styles.ringDate} maxFontSizeMultiplier={CLAMP}>
                  {d.dateNum}
                </Text>
              </View>
              <Text style={[styles.weekLabel, d.isToday && styles.weekLabelToday]} maxFontSizeMultiplier={CLAMP}>
                {d.dayLetter}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.eyebrow}>Today</Text>
          <Text style={styles.countMeta} maxFontSizeMultiplier={CLAMP}>
            {loggedToday} of {DAILY_PRAYERS.length} logged
          </Text>
        </View>
        <View style={styles.logList}>
          {logRows.map((r) => {
            const done = isPrayerLogged(r.name);
            const due = done || r.time.getTime() <= now;
            return (
              <View key={r.key} style={styles.logRow}>
                <View style={styles.logText}>
                  <Text style={styles.logName} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text style={styles.logTime} numberOfLines={1} maxFontSizeMultiplier={CLAMP}>
                    {r.label}
                    {r.current ? ' · window open' : ''}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ checked: done, disabled: !due }}
                  accessibilityLabel={`${done ? 'Logged' : 'Log'} ${r.name}`}
                  disabled={!due}
                  style={({ pressed }) => [
                    styles.logBtn,
                    done && styles.logBtnDone,
                    !due && styles.logBtnPending,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => toggleLog(r.name)}
                >
                  {done && <Icon name="check" size={15} color={colors.accent} />}
                  <Text
                    style={[styles.logBtnText, done && styles.logBtnTextDone, !due && styles.logBtnTextPending]}
                    maxFontSizeMultiplier={CLAMP}
                  >
                    {done ? 'Prayed' : due ? 'Log' : 'Not yet'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>{hijri.monthYear}</Text>
        <View style={styles.weekdayRow}>
          {WEEKDAY_INITIALS.map((w, i) => (
            <Text key={i} style={[styles.weekdayLabel, { width: cellSize }]} maxFontSizeMultiplier={CLAMP}>
              {w}
            </Text>
          ))}
        </View>
        <View style={styles.monthGrid} onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
          {Array.from({ length: monthLeadingBlanks }, (_, i) => (
            <View key={`blank-${i}`} style={{ width: cellSize, height: cellSize }} />
          ))}
          {monthDays.map((d) => (
            <View
              key={d.day}
              style={[
                styles.monthCell,
                { width: cellSize, height: cellSize },
                d.partial && styles.monthCellPartial,
                d.full && styles.monthCellFull,
                d.future && styles.monthCellFuture,
                d.day === today.getDate() && styles.monthCellToday,
              ]}
            >
              <Text
                style={[
                  styles.monthCellText,
                  d.partial && styles.monthCellTextPartial,
                  d.full && styles.monthCellTextFull,
                  d.future && styles.monthCellTextFuture,
                  d.day === today.getDate() && !d.full && styles.monthCellTextToday,
                ]}
                maxFontSizeMultiplier={CLAMP}
              >
                {d.day}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.swatch, styles.monthCellFull]} />
          <Text style={styles.legendLabel}>All five</Text>
          <View style={[styles.swatch, styles.monthCellPartial]} />
          <Text style={styles.legendLabel}>Some</Text>
          <View style={styles.swatch} />
          <Text style={styles.legendLabel}>None</Text>
        </View>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {header}
        {tab === 'times' ? times : tab === 'qibla' ? qiblaTab : tracker}
      </ScrollView>
      <BottomNav active="Prayer" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgRoot },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, gap: 12 },
  pressed: { opacity: 0.85 },

  header: { gap: 14, paddingBottom: 2 },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  headText: { flex: 1, minWidth: 0 },
  title: { ...serifHeading(SIZE.display), color: colors.textPrimary },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  locText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: SIZE.meta,
    lineHeight: uiLeading(SIZE.meta),
    color: colors.textMuted,
  },
  headBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.outlineBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmented: { flexDirection: 'row', gap: 5, backgroundColor: colors.bgCard, padding: 4, borderRadius: 999 },
  segment: { flex: 1, minHeight: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segmentOn: { backgroundColor: colors.accent },
  segmentText: { fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textMuted },
  segmentTextOn: { fontFamily: fonts.extrabold, color: colors.onMintText },

  eyebrow: eyebrow(v3.ink3),

  hero: {
    padding: 18,
    paddingTop: 17,
    backgroundColor: v3.surfaceHero,
    borderWidth: 1,
    borderColor: v3.heroBorder,
    borderRadius: 24,
  },
  heroWaiting: { borderColor: v3.hairline },
  heroEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent },
  heroEyebrow: { ...eyebrow(colors.accent), flex: 1 },
  heroEyebrowNext: { color: colors.gold },
  heroTitle: { ...serifHeading(30), color: colors.textPrimary, marginTop: 9 },
  heroSub: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: SIZE.body,
    lineHeight: uiLeading(SIZE.body),
    color: v3.ink1,
  },
  heroSubTime: { fontFamily: fonts.extrabold, color: colors.amberBody, ...tabular },
  heroTrack: { marginTop: 15, height: 6, borderRadius: 999, backgroundColor: v3.track, overflow: 'hidden' },
  heroFill: { height: 6, borderRadius: 999, backgroundColor: colors.accent },
  heroEnds: { marginTop: 7, flexDirection: 'row', justifyContent: 'space-between' },
  heroEnd: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: v3.ink3, ...tabular },

  heroActions: { marginTop: 14, flexDirection: 'row', gap: 8 },
  heroCta: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
  },
  heroCtaDone: { backgroundColor: P.openWell, borderWidth: 1, borderColor: v3.heroBorder },
  heroCtaText: { flexShrink: 1, fontFamily: fonts.extrabold, fontSize: SIZE.title, color: colors.onMintText },
  heroCtaTextDone: { color: colors.accent },
  heroGhost: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: v3.heroDivider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroGhostWide: { flex: 1 },
  heroGhostText: { fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textSecondary },

  dayCard: { padding: 8, paddingTop: 6, backgroundColor: colors.bgCard, borderRadius: 22 },
  dayHead: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  adhanHead: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: colors.accent },
  adhanHeadOff: { color: P.ink5 },

  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  prayerRowNow: { backgroundColor: P.openWell, paddingBottom: 15 },
  prayerRowNext: { backgroundColor: P.nextWell, borderColor: P.nextBorder },
  prayerRowPast: { opacity: 0.5 },
  prayerName: { flex: 1, minWidth: 0, fontFamily: fonts.bold, fontSize: SIZE.title, color: colors.textPrimary },
  prayerNameNow: { fontFamily: fonts.extrabold },
  prayerNameNext: { fontFamily: fonts.extrabold, color: colors.amberBody },
  prayerTime: { fontFamily: fonts.extrabold, fontSize: SIZE.body, color: colors.textSecondary, ...tabular },
  prayerTimeNext: { color: colors.amberBody },
  rowNote: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: colors.accent },
  rowNoteNext: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: colors.goldMeta, flexShrink: 1 },
  rowTrack: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 6,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  rowFill: { height: 3, borderRadius: 999, backgroundColor: colors.accent },

  markerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7, paddingHorizontal: 12 },
  markerText: { flex: 1, minWidth: 0, fontFamily: fonts.semibold, fontSize: SIZE.meta, color: P.ink5 },
  markerTime: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: P.ink5, ...tabular },

  switchSlot: { width: 34, alignItems: 'flex-end', justifyContent: 'center' },
  switchSlotOff: { opacity: 0.4 },
  track: { width: 34, height: 20, borderRadius: 999, backgroundColor: P.switchOff, padding: 2, justifyContent: 'center' },
  trackOn: { backgroundColor: P.switchOn, alignItems: 'flex-end' },
  trackOnNext: { backgroundColor: P.switchOnNext, alignItems: 'flex-end' },
  knob: { width: 16, height: 16, borderRadius: 8, backgroundColor: P.knobOff },
  knobOn: { backgroundColor: P.knobOn },
  knobOnNext: { backgroundColor: P.knobOnNext },

  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.bgCard,
    borderRadius: 20,
  },
  linkBody: { flex: 1, minWidth: 0 },
  linkTitle: { flex: 1, minWidth: 0, fontFamily: fonts.bold, fontSize: SIZE.body, color: colors.textPrimary },
  linkInline: { fontFamily: fonts.regular, color: colors.textMuted },
  linkMeta: { marginTop: 2, fontFamily: fonts.regular, fontSize: SIZE.meta, color: colors.textMuted },

  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 13,
    paddingHorizontal: 16,
    backgroundColor: colors.bgCard,
    borderRadius: 20,
  },
  noteText: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.regular,
    fontSize: SIZE.meta,
    lineHeight: bodyLeading(SIZE.meta),
    color: v3.ink1,
  },
  noteLink: { fontFamily: fonts.bold, color: colors.accent },

  tzWarn: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.amberCardBg,
    borderRadius: 16,
    padding: 14,
  },
  tzWarnLink: { fontFamily: fonts.bold, color: colors.gold },
  tzWarnText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: SIZE.meta,
    lineHeight: bodyLeading(SIZE.meta),
    color: colors.amberBody,
  },

  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', paddingTop: 4 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: colors.bgCard,
  },
  pillWarn: { backgroundColor: colors.amberCardBg },
  pillText: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: v3.ink1, ...tabular },
  pillTextWarn: { color: colors.amberBody },
  dialWrap: { alignItems: 'center', paddingVertical: 4 },

  guide: { alignItems: 'center', gap: 8 },
  guidePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: P.openWell,
  },
  guidePillOn: { borderWidth: 1, borderColor: v3.heroBorder },
  guideText: { fontFamily: fonts.extrabold, fontSize: SIZE.body, color: colors.accent },
  guideCaption: {
    maxWidth: 300,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: SIZE.meta,
    lineHeight: bodyLeading(SIZE.meta),
    color: v3.ink3,
  },

  streakCard: { padding: 18, borderRadius: 26 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: P.onStreakWell,
  },
  statSlot: { minHeight: 28, justifyContent: 'center', alignItems: 'center' },
  statValue: { ...serifHeading(22), color: colors.textPrimary, ...tabular },
  statNudge: {
    fontFamily: fonts.semibold,
    fontSize: SIZE.caption,
    lineHeight: pinLeading(14, SIZE.caption),
    color: P.onStreakMeta,
    textAlign: 'center',
    maxWidth: 130,
  },
  statLabel: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: P.onStreakMeta },

  weekRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  weekCell: { alignItems: 'center', gap: 6 },
  ring: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  ringFull: { borderColor: colors.accent },
  ringPartial: { borderColor: P.ringPartial },
  ringEmpty: { borderColor: 'rgba(255,255,255,0.22)' },
  ringToday: { backgroundColor: P.onStreakToday },
  ringDate: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: colors.textPrimary, ...tabular },
  weekLabel: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: P.onStreakMeta },
  weekLabelToday: { fontFamily: fonts.extrabold, color: colors.accent },

  card: { padding: 18, paddingTop: 16, backgroundColor: colors.bgCard, borderRadius: 22 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  countMeta: { fontFamily: fonts.bold, fontSize: SIZE.meta, color: colors.accent, ...tabular },

  logList: { marginTop: 14, gap: 11 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logText: { flex: 1, minWidth: 0 },
  logName: { fontFamily: fonts.bold, fontSize: SIZE.title, color: colors.textPrimary },
  logTime: { marginTop: 1, fontFamily: fonts.regular, fontSize: SIZE.caption, color: colors.textMuted },
  logBtn: {
    minHeight: 38,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  logBtnDone: { backgroundColor: P.openWell, borderColor: 'transparent' },
  logBtnPending: { borderColor: v3.hairline },
  logBtnText: { fontFamily: fonts.extrabold, fontSize: SIZE.meta, color: colors.textSecondary },
  logBtnTextDone: { color: colors.accent },
  logBtnTextPending: { color: P.ink5 },

  weekdayRow: { flexDirection: 'row', gap: MONTH_GAP, marginTop: 12, marginBottom: 6 },
  weekdayLabel: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: P.ink5, textAlign: 'center' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: MONTH_GAP },
  monthCell: {
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.heatNone,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  monthCellPartial: { backgroundColor: P.openWell },
  monthCellFull: { backgroundColor: colors.accent },
  monthCellFuture: { backgroundColor: P.heatFuture },
  monthCellToday: { borderColor: colors.accent },
  monthCellText: { fontFamily: fonts.bold, fontSize: SIZE.caption, color: v3.ink3, ...tabular },
  monthCellTextPartial: { color: P.onStreakMeta },
  monthCellTextFull: { color: colors.onMintText },
  monthCellTextFuture: { fontFamily: fonts.semibold, color: P.heatFutureInk },
  monthCellTextToday: { fontFamily: fonts.extrabold, color: colors.accent },

  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  swatch: { width: 10, height: 10, borderRadius: 3, backgroundColor: P.heatNone },
  legendLabel: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: v3.ink3, marginRight: 6 },
});
