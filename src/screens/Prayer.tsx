import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import QiblaCompass from '../components/QiblaCompass';
import { colors } from '../theme/colors';
import { fonts } from '../theme/type';
import { useAppState } from '../state/AppState';
import { usePrayer } from '../state/usePrayer';
import { useHeading } from '../state/useHeading';
import { needleRotation, isAligned, accuracyLabel, accuracyPill, normalizeDeg } from '../utils/compass';
import { formatHijriMonthYear } from '../utils/hijri';
import { currentStreak, weekStrip, monthGrid, monthPercent } from '../utils/prayerLog';

export default function Prayer({ navigation }: any) {
  const [tab, setTab] = useState<'times' | 'tracker'>('times');
  const [gridWidth, setGridWidth] = useState(0);
  const { prayerLog, toggleLog, isPrayerLogged } = useAppState();
  const { rows, city, locationLong, calculationMethod, qiblaDeg, qiblaLabel, timezoneMismatch, currentProgress } = usePrayer();
  const logRows = rows.filter((r) => r.key !== 'Sunrise');

  const { heading, accuracy, available: compassAvailable } = useHeading(tab === 'times');
  const live = compassAvailable && heading != null && qiblaDeg != null;
  const dialRotation = live ? -normalizeDeg(heading!) : 0;
  const needleDeg = live ? needleRotation(qiblaDeg!, heading!) : (qiblaDeg ?? 0);
  const aligned = live && isAligned(qiblaDeg!, heading!);
  const calibration = live ? accuracyLabel(accuracy) : null;
  const pill = accuracyPill(compassAvailable, heading != null, accuracy);

  const today = new Date();
  const streak = currentStreak(prayerLog, today);
  const week = weekStrip(prayerLog, today);
  const monthDays = monthGrid(prayerLog, today);
  const monthLeadingBlanks = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const cellSize = gridWidth > 0 ? Math.floor((gridWidth - MONTH_GAP * 6) / 7) : 0;
  const percent = monthPercent(prayerLog, today);

  return (
    <Screen nav="Prayer" contentStyle={{ paddingHorizontal: 20, paddingTop: 8, gap: 18 }}>
      <View>
        <Text style={styles.title}>Prayer</Text>
        <View style={styles.locRow}>
          <Icon name="location_on" size={14} color={colors.textMuted} />
          <Text style={styles.locText}>{locationLong} · {calculationMethod}</Text>
        </View>
      </View>

      <View style={styles.tabTrack}>
        <Pressable style={[styles.tabPill, tab === 'times' && styles.tabPillOn]} onPress={() => setTab('times')}>
          <Text style={[styles.tabLabel, tab === 'times' && styles.tabLabelOn]}>Times & qibla</Text>
        </Pressable>
        <Pressable style={[styles.tabPill, tab === 'tracker' && styles.tabPillOn]} onPress={() => setTab('tracker')}>
          <Text style={[styles.tabLabel, tab === 'tracker' && styles.tabLabelOn]}>Tracker</Text>
        </Pressable>
      </View>

      {tab === 'times' ? (
        <>
          {timezoneMismatch !== 0 && (
            <View style={styles.tzWarn}>
              <Icon name="schedule" size={18} color={colors.gold} />
              <Text style={styles.tzWarnText}>
                These times are shown in your phone's timezone, which is about {Math.abs(timezoneMismatch)} hours off
                from {locationLong}. Check your device date and time settings.
              </Text>
            </View>
          )}

          <View style={styles.card}>
            {rows.map((p) => {
              const emphasised = p.current || p.next;
              const marker = p.key === 'Sunrise';
              return (
                <View
                  key={p.name}
                  style={[
                    styles.prayerRow,
                    emphasised && styles.prayerRowNext,
                    p.past && styles.prayerRowPast,
                  ]}
                >
                  <Icon
                    name={p.icon}
                    size={marker ? 15 : 18}
                    color={emphasised ? colors.onTeal : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.prayerName,
                      marker && styles.prayerNameMarker,
                      emphasised && { color: colors.onTeal },
                    ]}
                  >
                    {p.name}
                  </Text>
                  <View style={{ flex: 1 }} />
                  {p.current && <View style={styles.nowDot} />}
                  {emphasised && <Text style={styles.nextNote}>{p.note}</Text>}
                  <Text
                    style={[
                      styles.prayerTime,
                      marker && styles.prayerTimeMarker,
                      emphasised && { color: colors.onTeal },
                    ]}
                  >
                    {p.label}
                  </Text>
                  {p.current && currentProgress != null && (
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.round(currentProgress * 100)}%` }]} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.qiblaCard}>
            <View style={styles.qiblaPillRow}>
              <View style={styles.qiblaPill}>
                <Icon name="location_on" size={13} color={colors.textMuted} />
                <Text style={styles.qiblaPillText}>{city}</Text>
              </View>
              <View style={[styles.qiblaPill, pill.warn && styles.qiblaPillWarn]}>
                {pill.warn && <Icon name="error" size={13} color={colors.gold} />}
                <Text style={[styles.qiblaPillText, pill.warn && styles.qiblaPillTextWarn]}>{pill.label}</Text>
              </View>
              {live && (
                <View style={styles.qiblaPill}>
                  <Text style={styles.qiblaPillText}>{Math.round(heading!)}°</Text>
                </View>
              )}
            </View>

            <QiblaCompass dialRotation={dialRotation} needleDeg={needleDeg} aligned={aligned} />

            {aligned && <Text style={styles.alignedText}>Facing the qibla</Text>}
            {calibration && <Text style={styles.calibrationText}>{calibration}</Text>}

            <Text style={styles.compassCaption}>
              {live
                ? 'Hold the phone flat and turn until the needle meets the top marker.'
                : compassAvailable
                  ? `Finding north… The qibla is ${qiblaLabel ?? '—'} from true north.`
                  : `No compass on this device. The qibla is ${qiblaLabel ?? '—'} from true north.`}
            </Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.streakEyebrow}>Current streak</Text>
                <View style={styles.streakSlot}>
                  {streak > 0 ? (
                    <Text style={styles.streakValue}>
                      {streak} {streak === 1 ? 'day' : 'days'}
                    </Text>
                  ) : (
                    <Text style={styles.streakStart}>Log all five to start a streak</Text>
                  )}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.streakEyebrow}>This month</Text>
                <View style={[styles.streakSlot, { alignItems: 'flex-end' }]}>
                  <Text style={styles.streakValue}>{percent}%</Text>
                </View>
              </View>
            </View>
            <View style={styles.weekRow}>
              {week.map((d) => {
                const ringStyle = d.count >= d.total
                  ? styles.ringFull
                  : d.count > 0
                    ? styles.ringPartial
                    : styles.ringEmpty;
                return (
                  <View key={d.date.toISOString()} style={{ alignItems: 'center', gap: 6 }}>
                    <View style={[styles.ring, ringStyle, d.isToday && styles.ringToday]}>
                      <Text style={styles.ringDate}>{d.dateNum}</Text>
                    </View>
                    <Text style={[styles.weekLabel, d.isToday && { color: colors.accent }]}>{d.dayLetter}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today</Text>
            <View style={{ gap: 10, marginTop: 12 }}>
              {logRows.map((r) => {
                const done = isPrayerLogged(r.name);
                const due = r.time.getTime() <= Date.now();
                return (
                  <View key={r.key} style={[styles.logRow, !due && styles.logRowPending]}>
                    <View>
                      <Text style={styles.logName}>{r.name}</Text>
                      <Text style={styles.logTime}>{r.label}</Text>
                    </View>
                    <Pressable
                      disabled={!due}
                      style={[styles.logBtn, done && styles.logBtnOn, !due && styles.logBtnPending]}
                      onPress={() => toggleLog(r.name)}
                    >
                      {done && <Icon name="check" size={14} color={colors.accent} />}
                      <Text style={[styles.logBtnText, done && { color: colors.accent }]}>
                        {done ? 'Prayed' : due ? 'Log' : 'Not yet'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{formatHijriMonthYear(new Date())}</Text>
            <View style={styles.weekdayRow}>
              {WEEKDAY_INITIALS.map((w, i) => (
                <Text key={i} style={[styles.weekdayLabel, { width: cellSize }]}>
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
                    d.full && styles.monthCellFull,
                    d.partial && styles.monthCellPartial,
                    d.future && styles.monthCellFuture,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthCellText,
                      d.full && styles.monthCellTextFull,
                      d.future && styles.monthCellTextFuture,
                    ]}
                  >
                    {d.day}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendSwatch, styles.monthCellFull]} />
              <Text style={styles.legendLabel}>All five</Text>
              <View style={[styles.legendSwatch, styles.monthCellPartial]} />
              <Text style={styles.legendLabel}>Some</Text>
              <View style={styles.legendSwatch} />
              <Text style={styles.legendLabel}>None</Text>
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

const MONTH_GAP = 6;
const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const styles = StyleSheet.create({
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.textPrimary },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  locText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted },
  tabTrack: { flexDirection: 'row', backgroundColor: colors.bgInput, padding: 4, borderRadius: 999, gap: 4 },
  tabPill: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  tabPillOn: { backgroundColor: colors.mint },
  tabLabel: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.textMuted },
  tabLabelOn: { color: colors.onMintTextAlt, fontFamily: fonts.bold },
  card: { backgroundColor: colors.bgCard, borderRadius: 18, padding: 16, gap: 4 },
  tzWarn: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.amberCardBg, borderRadius: 14, padding: 14 },
  tzWarnText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, color: colors.amberBody },
  prayerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 6, borderRadius: 12 },
  prayerRowNext: { backgroundColor: colors.tealGradMid },
  prayerRowPast: { opacity: 0.45 },
  prayerNameMarker: { fontSize: 13, color: colors.textFaint },
  prayerTimeMarker: { fontSize: 13, color: colors.textFaint },
  progressTrack: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 5,
    height: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressFill: { height: 2, borderRadius: 999, backgroundColor: colors.accent },
  prayerName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textPrimary },
  nowDot: { width: 6, height: 6, borderRadius: 999, backgroundColor: colors.accent, marginRight: 6 },
  nextNote: { fontFamily: fonts.regular, fontSize: 11, color: colors.textTealLabel, marginRight: 8 },
  prayerTime: { fontFamily: fonts.bold, fontSize: 13, color: colors.textPrimary },
  qiblaCard: { backgroundColor: colors.bgCard, borderRadius: 18, padding: 20, alignItems: 'center', gap: 14 },
  qiblaPillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  qiblaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bgInput,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  qiblaPillWarn: { backgroundColor: colors.amberCardBg },
  qiblaPillText: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.textMuted },
  qiblaPillTextWarn: { color: colors.amberBody },
  alignedText: { fontFamily: fonts.bold, fontSize: 13, color: colors.accent },
  calibrationText: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.gold, textAlign: 'center' },
  compassCaption: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint, textAlign: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  streakEyebrow: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.textMuted },
  streakSlot: { minHeight: 38, marginTop: 4, justifyContent: 'center' },
  streakValue: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.accent },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  ring: { width: 34, height: 34, borderRadius: 17, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  ringFull: { borderColor: colors.accent },
  ringPartial: { borderColor: colors.accent, opacity: 0.45 },
  ringEmpty: { borderColor: colors.divider },
  ringToday: { backgroundColor: colors.bgInput },
  ringDate: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textPrimary },
  weekLabel: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textFaint },
  cardTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textPrimary },
  logTime: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted },
  logBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.outlineBorder },
  logBtnOn: { backgroundColor: colors.iconChipBg, borderColor: 'transparent' },
  logBtnText: { fontFamily: fonts.bold, fontSize: 12, color: colors.textMuted },
  streakStart: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.textMuted, maxWidth: 200 },
  logRowPending: { opacity: 0.5 },
  logBtnPending: { borderColor: colors.divider },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  legendLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.textFaint, marginRight: 8 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: MONTH_GAP },
  weekdayRow: { flexDirection: 'row', gap: MONTH_GAP, marginBottom: 6 },
  weekdayLabel: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textFaint, textAlign: 'center' },
  monthCell: {
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  monthCellPartial: { backgroundColor: colors.iconChipBg, borderColor: 'rgba(79,209,160,0.35)' },
  monthCellFull: { backgroundColor: colors.primary, borderColor: colors.primary },
  monthCellFuture: { opacity: 0.35 },
  monthCellText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textMuted },
  monthCellTextFull: { color: colors.onMintText },
  monthCellTextFuture: { color: colors.textFaint },
});
