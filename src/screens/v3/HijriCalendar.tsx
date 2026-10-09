import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import { Stagger, useStagger } from '../../components/v3/Stagger';
import { GoldHead, GUTTER, LiveDot, Row, ScrollFade, TitleBlock, Well } from '../../components/v3/more/parts';
import { fonts, serifHeading, tabular, SIZE, CLAMP, bodyLeading } from '../../theme/type';
import { more } from '../../theme/v3/colors';
import { addHijriMonths, hijriMonthLength, hijriMonthName } from '../../utils/hijri';
import {
  gregorianOf,
  loadDayRecords,
  loadMonthAnchor,
  loadMonthNames,
  loadOffset,
  nameOf,
  type HijriDayRecord,
  type HijriMonthName,
} from '../../data/hijriCalendar';
import { useHijriDate } from '../../state/useHijriDate';

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FRIDAY = 5;
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Span = { from: number; to: number; record: HijriDayRecord };

function groupRecords(rows: HijriDayRecord[]): Span[] {
  const sorted = [...rows].sort((a, b) => a.number - b.number);
  const out: Span[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && last.to === r.number - 1 && nameOf(last.record.name) === nameOf(r.name)) {
      last.to = r.number;
      continue;
    }
    out.push({ from: r.number, to: r.number, record: r });
  }
  return out;
}

export default function HijriCalendar({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const footPad = Math.max(insets.bottom, 12) + 10;
  const today = useHijriDate();
  const anim = useStagger(4);

  const [shown, setShown] = useState({ year: today.year, month: today.month });
  const [records, setRecords] = useState<HijriDayRecord[]>([]);
  const [names, setNames] = useState<HijriMonthName[]>([]);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [nextAnchor, setNextAnchor] = useState<number | null>(null);
  const [aligned, setAligned] = useState(false);

  const [stepped, setStepped] = useState(false);
  useEffect(() => {
    if (!stepped) setShown({ year: today.year, month: today.month });
  }, [today.year, today.month, stepped]);

  useEffect(() => {
    let alive = true;
    loadDayRecords().then((r) => alive && setRecords(r));
    loadMonthNames().then((n) => alive && setNames(n));
    return () => {
      alive = false;
    };
  }, []);

  const nextMonth = addHijriMonths(shown.year, shown.month, 1);

  useEffect(() => {
    let alive = true;
    setAligned(false);
    Promise.all([
      loadMonthAnchor(shown.year, shown.month),
      loadMonthAnchor(nextMonth.year, nextMonth.month),
      loadOffset(),
    ]).then(([offset, next, remembered]) => {
      if (!alive) return;
      setAnchor(offset ?? remembered);
      setNextAnchor(next ?? remembered);
      setAligned((offset ?? remembered) !== null && (next ?? remembered) !== null);
    });
    return () => {
      alive = false;
    };
  }, [shown.year, shown.month, nextMonth.year, nextMonth.month]);

  const first = gregorianOf(shown.year, shown.month, 1, anchor);
  const length = useMemo(() => {
    if (anchor === null || nextAnchor === null) return hijriMonthLength(shown.year, shown.month);
    const nextFirst = gregorianOf(nextMonth.year, nextMonth.month, 1, nextAnchor);
    const days = Math.round((nextFirst.getTime() - first.getTime()) / 86400000);
    return days === 29 || days === 30 ? days : hijriMonthLength(shown.year, shown.month);
  }, [anchor, nextAnchor, first, nextMonth.year, nextMonth.month, shown.year, shown.month]);
  const dayDate = React.useCallback(
    (day: number) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + day - 1, 12),
    [first]
  );

  const last = dayDate(length);
  const lead = first.getDay();

  const spans = useMemo(
    () => groupRecords(records.filter((r) => r.month === shown.month)),
    [records, shown.month]
  );
  const filled = useMemo(
    () => new Set(spans.filter((s) => s.from === s.to).map((s) => s.from)),
    [spans]
  );
  const dotted = useMemo(() => {
    const set = new Set<number>();
    for (const s of spans) for (let d = s.from; d <= s.to; d++) set.add(d);
    return set;
  }, [spans]);

  const monthName =
    nameOf(names.find((m) => m.number === shown.month)?.name, 'ar-Latn') || hijriMonthName(shown.month);
  const nextName =
    nameOf(names.find((m) => m.number === nextMonth.month)?.name, 'ar-Latn') || hijriMonthName(nextMonth.month);

  const isThisMonth = shown.year === today.year && shown.month === today.month;
  const step = (delta: number) => {
    setStepped(true);
    setShown((s) => addHijriMonths(s.year, s.month, delta));
  };

  const span = `${first.getDate()} ${MONTHS_LONG[first.getMonth()]} – ${last.getDate()} ${
    MONTHS_LONG[last.getMonth()]
  } ${last.getFullYear()}`;

  const gregorianLine = (day: number) => {
    const d = dayDate(day);
    return `${WEEKDAYS_LONG[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Stagger v={anim[0]}>
        <TitleBlock
          title="Hijri calendar"
          meta={`${today.year} AH · today is ${today.day} ${
            nameOf(names.find((m) => m.number === today.month)?.name, 'ar-Latn') || hijriMonthName(today.month)
          }`}
          onBack={() => navigation.goBack()}
          action="today"
          actionLabel="Go to this month"
          onAction={() => {
            setStepped(false);
            setShown({ year: today.year, month: today.month });
          }}
        />
      </Stagger>

      <Stagger v={anim[1]} style={styles.stepper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={10}
          style={styles.stepBtn}
          onPress={() => step(-1)}
        >
          <Icon name="chevron_left" size={22} color={more.ink3} />
        </Pressable>
        <View style={styles.stepperCol}>
          <Text style={styles.monthName}>
            {monthName} {shown.year}
          </Text>
          <Text style={styles.monthSpan} maxFontSizeMultiplier={CLAMP}>
            {span}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={10}
          style={styles.stepBtn}
          onPress={() => step(1)}
        >
          <Icon name="chevron_right" size={22} color={more.ink3} />
        </Pressable>
      </Stagger>

      <Stagger v={anim[2]} style={styles.gridWrap}>
        <View style={styles.grid}>
          <View style={styles.weekRow}>
            {WEEKDAY_INITIALS.map((d, i) => (
              <View key={i} style={styles.cellBox}>
                <Text
                  style={[styles.weekday, i === FRIDAY && styles.weekdayFriday]}
                  maxFontSizeMultiplier={1}
                >
                  {d}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.days}>
            {Array.from({ length: lead }).map((_, i) => (
              <View key={`lead-${i}`} style={styles.cellBox} />
            ))}
            {Array.from({ length }).map((_, i) => {
              const day = i + 1;
              const g = dayDate(day);
              const isToday = isThisMonth && day === today.day;
              const isFilled = filled.has(day);
              const isDotted = dotted.has(day);
              return (
                <View key={day} style={styles.cellBox}>
                  <View style={[styles.cell, isFilled && styles.cellMajor, isToday && styles.cellToday]}>
                    <Text
                      style={[styles.hijriNum, isFilled && styles.hijriNumMajor]}
                      maxFontSizeMultiplier={1}
                    >
                      {day}
                    </Text>
                    <Text style={styles.gregNum} maxFontSizeMultiplier={1}>
                      {g.getDate()}
                    </Text>
                    <View style={styles.dotSlot}>{isDotted && <View style={styles.dot} />}</View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Stagger>

      <Stagger v={anim[3]} style={styles.eventsWrap}>
        <GoldHead label="This month" />
        <View style={styles.eventsScroll}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.eventsList}>
        <Well>
          {spans.map((s) => (
            <Row key={s.record.slug} height={62}>
              <Text
                style={[styles.eventDay, s.from !== s.to && styles.eventDaySpan]}
                numberOfLines={1}
                maxFontSizeMultiplier={1}
              >
                {s.from === s.to ? s.from : `${s.from}–${s.to}`}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {nameOf(s.record.name)}
                </Text>
                <Text style={styles.eventNote} numberOfLines={2}>
                  {gregorianLine(s.from)}
                  {nameOf(s.record.name, 'ar-Latn') ? ` · ${nameOf(s.record.name, 'ar-Latn')}` : ''}
                </Text>
              </View>
            </Row>
          ))}
          <Row height={62}>
            <Text style={styles.eventDay} numberOfLines={1} maxFontSizeMultiplier={1}>
              {length}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle} numberOfLines={1}>
                The month ends · {last.getDate()} {MONTHS_SHORT[last.getMonth()]}
              </Text>
              <Text style={styles.eventNote} numberOfLines={2}>
                {nextName} begins subject to the sighting where you are
              </Text>
            </View>
          </Row>
        </Well>
        </ScrollView>
        <ScrollFade height={40} />
        </View>
      </Stagger>

      <View style={[styles.foot, { paddingBottom: footPad }]}>
        <LiveDot size={5} color={aligned ? more.mint : more.meta} />
        <Text style={styles.footText}>
          {aligned
            ? 'Dates come from the HJCoSA calculation. Your mosque may differ by a day.'
            : 'Dates are calculated on this device and may differ from the HJCoSA calendar by a day.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: more.ground },

  stepper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: GUTTER - 8, marginTop: 18 },
  stepBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepperCol: { flex: 1, alignItems: 'center', gap: 4 },
  monthName: { ...serifHeading(SIZE.heading + 2), color: more.ink, textAlign: 'center' },
  monthSpan: { fontFamily: fonts.regular, fontSize: SIZE.meta, color: more.meta },

  gridWrap: { paddingHorizontal: GUTTER, marginTop: 16 },
  grid: {
    backgroundColor: more.raised,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: more.liftRaised,
  },
  weekRow: { flexDirection: 'row' },
  cellBox: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
  weekday: {
    fontFamily: fonts.extrabold,
    fontSize: SIZE.caption - 1,
    letterSpacing: 0.6,
    color: more.meta,
    paddingBottom: 6,
  },
  weekdayFriday: { color: more.gold },

  days: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '92%',
    minHeight: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellMajor: { backgroundColor: more.goldFill },
  cellToday: { borderColor: more.mint, backgroundColor: more.ground },
  hijriNum: { fontFamily: fonts.serif, fontSize: SIZE.title, color: more.ink, ...tabular },
  hijriNumMajor: { color: more.gold },
  gregNum: { fontFamily: fonts.regular, fontSize: 10, color: more.metaQuiet, ...tabular },
  dotSlot: { height: 5, justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: more.gold },

  eventsWrap: { flex: 1, paddingHorizontal: GUTTER, marginTop: 22, gap: 12 },
  eventsScroll: { flex: 1, position: 'relative' },
  eventsList: { paddingBottom: 24 },
  eventDay: { width: 58, fontFamily: fonts.serif, fontSize: SIZE.title + 2, color: more.gold, ...tabular },
  eventDaySpan: { fontSize: SIZE.title },
  eventTitle: { fontFamily: fonts.semibold, fontSize: SIZE.title, color: more.ink },
  eventNote: { fontFamily: fonts.regular, fontSize: SIZE.caption, color: more.meta, marginTop: 3 },

  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: GUTTER,
    paddingTop: 12,
  },
  footText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: SIZE.caption,
    lineHeight: bodyLeading(SIZE.caption),
    color: more.metaQuiet,
  },
});
